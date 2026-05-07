'use server'

import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE_NAME, isAdmin, tokenMatches } from '@/lib/admin-auth'
import { rateLimitByIp } from '@/lib/rate-limit'

const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function adminLogin(formData: FormData) {
  const expected = process.env.ADMIN_TOKEN
  if (!expected) throw new Error('ADMIN_TOKEN not configured')

  const headerStore = await headers()
  const limit = await rateLimitByIp(headerStore, 'admin-login', {
    windowMs: 15 * 60 * 1000,
    max: 10,
  })
  if (!limit.allowed) {
    redirect('/admin?error=throttled')
  }

  const token = (formData.get('token') as string | null) ?? ''
  if (!tokenMatches(token, expected)) {
    redirect('/admin?error=invalid')
  }

  const jar = await cookies()
  jar.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/admin',
  })

  redirect('/admin/import')
}

export async function adminLogout() {
  const jar = await cookies()
  jar.delete(ADMIN_COOKIE_NAME)
  redirect('/admin')
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return isAdmin()
}
