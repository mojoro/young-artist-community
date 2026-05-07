'use server'

import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { rateLimitByIp } from '@/lib/rate-limit'

export interface FeedbackFormState {
  message?: string
  error?: string
}

export async function submitFeedback(
  _prev: FeedbackFormState | null,
  formData: FormData,
): Promise<FeedbackFormState> {
  // Honeypot
  const honeypot = String(formData.get('url_confirm') ?? '').trim()
  if (honeypot) return { message: 'Thanks for your feedback!' }

  const headerStore = await headers()
  const limit = await rateLimitByIp(headerStore, 'submit-feedback', {
    windowMs: 60_000,
    max: 5,
  })
  if (!limit.allowed) {
    return { error: 'Too many requests. Please try again in a moment.' }
  }

  const message = String(formData.get('message') ?? '').trim()
  if (!message) return { error: 'Message is required.' }
  if (message.length > 5000) return { error: 'Message is too long (max 5000 characters).' }

  const email = String(formData.get('email') ?? '').trim() || null
  if (email) {
    if (email.length > 254) return { error: 'Email is too long.' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Invalid email format.' }
  }

  await prisma.feedback.create({
    data: { message, email },
  })

  return { message: 'Thanks for your feedback!' }
}
