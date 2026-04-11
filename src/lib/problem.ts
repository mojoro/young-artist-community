import { NextResponse } from 'next/server'

export interface Problem {
  type: string
  title: string
  status: number
  detail?: string
  instance?: string
}

function problemResponse(problem: Problem): NextResponse {
  return NextResponse.json(problem, {
    status: problem.status,
    headers: { 'Content-Type': 'application/problem+json' },
  })
}

export function notFound(detail: string): NextResponse {
  return problemResponse({
    type: '/problems/not-found',
    title: 'Resource not found',
    status: 404,
    detail,
  })
}

export function badRequest(detail: string): NextResponse {
  return problemResponse({
    type: '/problems/bad-request',
    title: 'Bad request',
    status: 400,
    detail,
  })
}

export function validationError(detail: string): NextResponse {
  return problemResponse({
    type: '/problems/validation-error',
    title: 'Validation failed',
    status: 422,
    detail,
  })
}

export function conflict(detail: string): NextResponse {
  return problemResponse({
    type: '/problems/conflict',
    title: 'Conflict',
    status: 409,
    detail,
  })
}

export function internalError(detail: string): NextResponse {
  return problemResponse({
    type: '/problems/internal-error',
    title: 'Internal server error',
    status: 500,
    detail,
  })
}
