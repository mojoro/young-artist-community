import { NextResponse } from 'next/server'
import { isAdmin } from './admin-auth'

export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null
  return NextResponse.json(
    {
      type: '/problems/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Admin authentication required.',
    },
    { status: 401, headers: { 'Content-Type': 'application/problem+json' } },
  )
}

export function tooManyRequests(retryAfterSec: number): NextResponse {
  return NextResponse.json(
    {
      type: '/problems/too-many-requests',
      title: 'Too many requests',
      status: 429,
      detail: `Try again in ${retryAfterSec} second(s).`,
    },
    {
      status: 429,
      headers: {
        'Content-Type': 'application/problem+json',
        'Retry-After': String(retryAfterSec),
      },
    },
  )
}
