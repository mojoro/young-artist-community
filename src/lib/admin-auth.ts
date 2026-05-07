import { createHash, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE_NAME = 'admin_token'

export function tokenMatches(provided: string | undefined, expected: string): boolean {
  if (!provided) return false
  const a = createHash('sha256').update(provided).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

export async function isAdmin(): Promise<boolean> {
  const expected = process.env.ADMIN_TOKEN
  if (!expected) return false
  const jar = await cookies()
  return tokenMatches(jar.get(ADMIN_COOKIE_NAME)?.value, expected)
}
