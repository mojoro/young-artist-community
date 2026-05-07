'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { rateLimitByIp } from '@/lib/rate-limit'
import { toSlug } from '@/lib/slug'

export interface EditProgramState {
  error?: string
}

interface ComboboxItem {
  id: string
  name: string
  is_new: boolean
}

function parseComboboxItems(raw: string | null): ComboboxItem[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.filter(
      (item: unknown): item is ComboboxItem =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        'name' in item &&
        'is_new' in item,
    )
  } catch {
    return []
  }
}

export async function editProgram(
  _prev: EditProgramState | null,
  formData: FormData,
): Promise<EditProgramState> {
  const headerStore = await headers()
  const limit = await rateLimitByIp(headerStore, 'edit-program', {
    windowMs: 60_000,
    max: 5,
  })
  if (!limit.allowed) {
    return { error: 'Too many requests. Please try again in a moment.' }
  }

  const programId = formData.get('program_id') as string
  if (!programId) return { error: 'Missing program.' }

  const str = (k: string) => (formData.get(k) as string)?.trim() || null
  const num = (k: string) => {
    const v = str(k)
    if (v === null) return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  const int = (k: string) => {
    const n = num(k)
    return n !== null ? Math.round(n) : null
  }
  const date = (k: string) => {
    const v = str(k)
    if (!v) return null
    const d = new Date(v)
    return Number.isNaN(d.getTime()) ? null : d
  }

  // Honeypot
  if (str('url_confirm')) return { error: '' }

  const name = str('name')
  if (!name) return { error: 'Program name is required.' }
  if (name.length > 200) return { error: 'Program name is too long (max 200 characters).' }

  const description = str('description')
  if (description && description.length > 5000)
    return { error: 'Description is too long (max 5000 characters).' }

  const tuition = num('tuition')
  if (tuition !== null && tuition < 0) return { error: 'Tuition cannot be negative.' }

  const applicationFee = num('application_fee')
  if (applicationFee !== null && applicationFee < 0)
    return { error: 'Application fee cannot be negative.' }

  const ageMin = int('age_min')
  const ageMax = int('age_max')
  if (ageMin !== null && (ageMin < 0 || ageMin > 100))
    return { error: 'Age min must be between 0 and 100.' }
  if (ageMax !== null && (ageMax < 0 || ageMax > 100))
    return { error: 'Age max must be between 0 and 100.' }
  if (ageMin !== null && ageMax !== null && ageMin > ageMax)
    return { error: 'Age min cannot exceed age max.' }

  const programUrl = str('program_url')
  const applicationUrl = str('application_url')
  const urlPattern = /^https?:\/\//
  if (programUrl && !urlPattern.test(programUrl))
    return { error: 'Program URL must start with http:// or https://.' }
  if (applicationUrl && !urlPattern.test(applicationUrl))
    return { error: 'Application URL must start with http:// or https://.' }

  // Parse combobox selections
  const instrumentItems = parseComboboxItems(formData.get('instruments') as string)
  const categoryItems = parseComboboxItems(formData.get('categories') as string)
  const locationItems = parseComboboxItems(formData.get('locations') as string)

  // Generate slug from (possibly new) name
  let newSlug = toSlug(name)
  const slugConflict = await prisma.program.findFirst({
    where: { slug: newSlug, id: { not: programId } },
    select: { id: true },
  })
  if (slugConflict) {
    const count = await prisma.program.count({
      where: { slug: { startsWith: newSlug } },
    })
    newSlug = `${newSlug}-${count + 1}`
  }

  const editSummary = (formData.get('edit_summary') as string)?.trim() || null

  try {
    // Resolve instruments
    const instrumentIds: string[] = []
    for (const item of instrumentItems) {
      if (item.is_new) {
        const existing = await prisma.instrument.findFirst({
          where: { name: { equals: item.name, mode: 'insensitive' } },
          select: { id: true },
        })
        if (existing) {
          instrumentIds.push(existing.id)
        } else {
          const created = await prisma.instrument.create({
            data: { name: item.name },
            select: { id: true },
          })
          instrumentIds.push(created.id)
        }
      } else {
        instrumentIds.push(item.id)
      }
    }

    // Resolve categories
    const categoryIds: string[] = []
    for (const item of categoryItems) {
      if (item.is_new) {
        const existing = await prisma.category.findFirst({
          where: { name: { equals: item.name, mode: 'insensitive' } },
          select: { id: true },
        })
        if (existing) {
          categoryIds.push(existing.id)
        } else {
          const created = await prisma.category.create({
            data: { name: item.name },
            select: { id: true },
          })
          categoryIds.push(created.id)
        }
      } else {
        categoryIds.push(item.id)
      }
    }

    // Resolve locations
    const locationIds: string[] = []
    for (const item of locationItems) {
      if (item.is_new) {
        const parts = item.name.split(',').map((s) => s.trim())
        const city = parts[0]
        const country = parts[1]
        if (!city || !country)
          return { error: `Invalid location format: ${item.name}. Use "City, Country".` }

        const existing = await prisma.location.findFirst({
          where: {
            city: { equals: city, mode: 'insensitive' },
            country: { equals: country, mode: 'insensitive' },
          },
          select: { id: true },
        })
        if (existing) {
          locationIds.push(existing.id)
        } else {
          const created = await prisma.location.create({
            data: { city, country },
            select: { id: true },
          })
          locationIds.push(created.id)
        }
      } else {
        locationIds.push(item.id)
      }
    }

    // Save revision + update in a transaction
    await prisma.$transaction(async (tx) => {
      // Snapshot current state before edit
      const current = await tx.program.findUniqueOrThrow({
        where: { id: programId },
        include: {
          program_instruments: { select: { instrument: { select: { name: true } } } },
          program_categories: { select: { category: { select: { name: true } } } },
          program_locations: { select: { location: { select: { city: true, country: true } } } },
        },
      })

      await tx.programRevision.create({
        data: {
          program_id: programId,
          edit_summary: editSummary,
          data: {
            name: current.name,
            slug: current.slug,
            description: current.description,
            start_date: current.start_date?.toISOString() ?? null,
            end_date: current.end_date?.toISOString() ?? null,
            application_deadline: current.application_deadline?.toISOString() ?? null,
            tuition: current.tuition,
            application_fee: current.application_fee,
            age_min: current.age_min,
            age_max: current.age_max,
            offers_scholarship: current.offers_scholarship,
            program_url: current.program_url,
            application_url: current.application_url,
            instruments: current.program_instruments.map((pi) => pi.instrument.name),
            categories: current.program_categories.map((pc) => pc.category.name),
            locations: current.program_locations.map(
              (pl) => `${pl.location.city}, ${pl.location.country}`,
            ),
          },
        },
      })

      await tx.program.update({
        where: { id: programId },
        data: {
          name,
          slug: newSlug,
          description,
          start_date: date('start_date'),
          end_date: date('end_date'),
          application_deadline: date('application_deadline'),
          tuition,
          application_fee: applicationFee,
          age_min: ageMin,
          age_max: ageMax,
          offers_scholarship: formData.get('offers_scholarship') === 'true',
          program_url: programUrl,
          application_url: applicationUrl,
        },
      })

      await tx.programInstrument.deleteMany({ where: { program_id: programId } })
      if (instrumentIds.length > 0) {
        await tx.programInstrument.createMany({
          data: instrumentIds.map((instrument_id) => ({
            program_id: programId,
            instrument_id,
          })),
        })
      }

      await tx.programCategory.deleteMany({ where: { program_id: programId } })
      if (categoryIds.length > 0) {
        await tx.programCategory.createMany({
          data: categoryIds.map((category_id) => ({
            program_id: programId,
            category_id,
          })),
        })
      }

      await tx.programLocation.deleteMany({ where: { program_id: programId } })
      if (locationIds.length > 0) {
        await tx.programLocation.createMany({
          data: locationIds.map((location_id) => ({
            program_id: programId,
            location_id,
          })),
        })
      }
    })
  } catch (e) {
    console.error('[public] editProgram failed:', e)
    return { error: e instanceof Error ? e.message : String(e) }
  }

  revalidatePath(`/programs/${newSlug}`)
  revalidatePath('/programs')
  revalidatePath('/')
  redirect(`/programs/${newSlug}`)
}
