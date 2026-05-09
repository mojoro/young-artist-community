import type { StipendFrequency } from './types'

function dollars(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`
}

export function formatStipendShort(
  amount: number | null,
  frequency: StipendFrequency | null,
): string | null {
  if (amount === null || frequency === null) return null
  switch (frequency) {
    case 'daily':
      return `${dollars(amount)}/d`
    case 'weekly':
      return `${dollars(amount)}/wk`
    case 'monthly':
      return `${dollars(amount)}/mo`
    case 'annual':
      return `${dollars(amount)}/yr`
    case 'one_time':
      return `${dollars(amount)} once`
  }
}

export function formatStipendLong(
  amount: number | null,
  frequency: StipendFrequency | null,
): string | null {
  if (amount === null || frequency === null) return null
  switch (frequency) {
    case 'daily':
      return `${dollars(amount)} per day`
    case 'weekly':
      return `${dollars(amount)} per week`
    case 'monthly':
      return `${dollars(amount)} per month`
    case 'annual':
      return `${dollars(amount)} per year`
    case 'one_time':
      return `${dollars(amount)} (one-time)`
  }
}
