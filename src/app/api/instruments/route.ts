import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  badRequest,
  conflict,
  internalError,
  validationError,
} from '@/lib/problem'

export async function GET() {
  try {
    const instruments = await prisma.instrument.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })
    return NextResponse.json({ items: instruments })
  } catch {
    return internalError('Failed to list instruments')
  }
}

export async function POST(request: Request) {
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

  try {
    const created = await prisma.instrument.create({
      data: { name: trimmed },
      select: { id: true, name: true },
    })
    return NextResponse.json(created, {
      status: 201,
      headers: { Location: `/api/instruments/${created.id}` },
    })
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return conflict(`Instrument with name '${trimmed}' already exists.`)
    }
    return internalError('Failed to create instrument')
  }
}
