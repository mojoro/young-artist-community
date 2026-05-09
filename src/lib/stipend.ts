import type { Currency, StipendFrequency } from './types'
import { currencySymbol } from './money'

function dollars(amount: number, currency: Currency): string {
  return `${currencySymbol(currency)}${amount.toLocaleString('en-US')}`
}

export function formatStipendShort(
  amount: number | null,
  frequency: StipendFrequency | null,
  currency: Currency,
): string | null {
  if (amount === null || frequency === null) return null
  switch (frequency) {
    case 'daily':
      return `${dollars(amount, currency)}/d`
    case 'weekly':
      return `${dollars(amount, currency)}/wk`
    case 'monthly':
      return `${dollars(amount, currency)}/mo`
    case 'annual':
      return `${dollars(amount, currency)}/yr`
    case 'one_time':
      return `${dollars(amount, currency)} once`
  }
}

export function formatStipendLong(
  amount: number | null,
  frequency: StipendFrequency | null,
  currency: Currency,
): string | null {
  if (amount === null || frequency === null) return null
  switch (frequency) {
    case 'daily':
      return `${dollars(amount, currency)} per day`
    case 'weekly':
      return `${dollars(amount, currency)} per week`
    case 'monthly':
      return `${dollars(amount, currency)} per month`
    case 'annual':
      return `${dollars(amount, currency)} per year`
    case 'one_time':
      return `${dollars(amount, currency)} (one-time)`
  }
}
