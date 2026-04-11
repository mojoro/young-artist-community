import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notFound, validationError, internalError } from '@/lib/problem'

type RouteContext = {
  params: Promise<{ program_id: string; review_id: string }>
}

export async function GET(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { program_id, review_id } = await context.params

    const program = await prisma.program.findUnique({
      where: { id: program_id },
      select: { id: true },
    })
    if (!program) {
      return notFound(`Program with id '${program_id}' not found.`)
    }

    const review = await prisma.review.findUnique({ where: { id: review_id } })
    if (!review || review.program_id !== program_id) {
      return notFound(`Review with id '${review_id}' not found.`)
    }

    return NextResponse.json(review)
  } catch (err) {
    console.error('GET /programs/[program_id]/reviews/[review_id] failed', err)
    return internalError('Failed to fetch review.')
  }
}

interface ReviewInput {
  rating?: unknown
  body?: unknown
  year_attended?: unknown
  reviewer_name?: unknown
  title?: unknown
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { program_id, review_id } = await context.params

    const program = await prisma.program.findUnique({
      where: { id: program_id },
      select: { id: true },
    })
    if (!program) {
      return notFound(`Program with id '${program_id}' not found.`)
    }

    const existing = await prisma.review.findUnique({ where: { id: review_id } })
    if (!existing || existing.program_id !== program_id) {
      return notFound(`Review with id '${review_id}' not found.`)
    }

    let payload: ReviewInput
    try {
      payload = (await request.json()) as ReviewInput
    } catch {
      return validationError('Request body must be valid JSON.')
    }

    if (
      typeof payload.rating !== 'number' ||
      !Number.isInteger(payload.rating) ||
      payload.rating < 1 ||
      payload.rating > 5
    ) {
      return validationError('rating must be an integer between 1 and 5')
    }

    if (typeof payload.body !== 'string' || payload.body.trim() === '') {
      return validationError('body is required and must be a non-empty string')
    }

    let year_attended: number | null = null
    if (payload.year_attended !== undefined && payload.year_attended !== null) {
      if (typeof payload.year_attended !== 'number' || !Number.isInteger(payload.year_attended)) {
        return validationError('year_attended must be an integer')
      }
      year_attended = payload.year_attended
    }

    let reviewer_name: string | null = null
    if (payload.reviewer_name !== undefined && payload.reviewer_name !== null) {
      if (typeof payload.reviewer_name !== 'string') {
        return validationError('reviewer_name must be a string')
      }
      reviewer_name = payload.reviewer_name
    }

    let title: string | null = null
    if (payload.title !== undefined && payload.title !== null) {
      if (typeof payload.title !== 'string') {
        return validationError('title must be a string')
      }
      title = payload.title
    }

    const updated = await prisma.review.update({
      where: { id: review_id },
      data: {
        rating: payload.rating,
        body: payload.body,
        year_attended,
        reviewer_name,
        title,
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PUT /programs/[program_id]/reviews/[review_id] failed', err)
    return internalError('Failed to update review.')
  }
}
