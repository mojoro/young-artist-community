import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { badRequest, conflict, internalError, notFound, validationError } from '@/lib/problem'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ category_id: string }> },
) {
  const denied = await requireAdmin()
  if (denied) return denied

  const { category_id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  if (typeof body !== 'object' || body === null) {
    return badRequest('Body must be an object')
  }

  const { name } = body as { name?: unknown }
  if (typeof name !== 'string' || name.trim() === '') {
    return validationError('name is required')
  }

  const trimmed = name.trim()

  const existing = await prisma.category.findUnique({
    where: { id: category_id },
    select: { id: true },
  })
  if (!existing) {
    return notFound(`Category with id '${category_id}' not found.`)
  }

  try {
    const updated = await prisma.category.update({
      where: { id: category_id },
      data: { name: trimmed },
      select: { id: true, name: true },
    })
    return NextResponse.json(updated)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return conflict(`Category with name '${trimmed}' already exists.`)
    }
    return internalError('Failed to update category')
  }
}
