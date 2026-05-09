import type { Currency } from './types'

function symbol(currency: Currency): string {
  switch (currency) {
    case 'USD':
      return '$'
    case 'EUR':
      return '€'
    case 'GBP':
      return '£'
  }
}

export function formatMoney(amount: number | null, currency: Currency): string | null {
  if (amount === null) return null
  if (amount === 0) return 'Free'
  return `${symbol(currency)}${amount.toLocaleString('en-US')}`
}

export function currencySymbol(currency: Currency): string {
  return symbol(currency)
}
