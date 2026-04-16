'use client'

import { useActionState } from 'react'
import { subscribe } from './actions'

export function SubscribeForm({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const [state, action, pending] = useActionState(subscribe, null)

  if (state?.message) {
    const textClass = variant === 'dark' ? 'text-green-400' : 'text-success-700'
    const subtextClass = variant === 'dark' ? 'text-slate-400' : 'text-slate-500'
    return (
      <div className="text-center">
        <div className={`flex items-center justify-center gap-2 text-sm font-medium ${textClass}`}>
          <svg
            className="h-5 w-5 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          {state.message}
        </div>
        <p className={`mt-2 text-xs ${subtextClass}`}>
          Want to help out? Reach out at{' '}
          <a
            href="mailto:john@johnmoorman.com"
            className={`underline ${variant === 'dark' ? 'hover:text-white' : 'hover:text-slate-700'}`}
          >
            john@johnmoorman.com
          </a>
        </p>
      </div>
    )
  }

  const inputClass =
    variant === 'dark'
      ? 'flex-1 rounded-lg border-0 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-400 ring-1 ring-white/20 focus:ring-2 focus:ring-brand-500 focus:bg-white/15 transition-colors'
      : 'flex-1 rounded-lg border-0 bg-white px-4 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-500 transition-colors'

  const buttonClass =
    variant === 'dark'
      ? 'rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
      : 'rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'

  return (
    <form action={action}>
      <input
        type="text"
        name="url_confirm"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />
      <div className="flex gap-2">
        <label htmlFor={`email-${variant}`} className="sr-only">
          Email address
        </label>
        <input
          id={`email-${variant}`}
          name="email"
          type="email"
          required
          disabled={pending}
          placeholder="you@example.com"
          className={inputClass}
        />
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Joining...
            </span>
          ) : (
            'Subscribe'
          )}
        </button>
      </div>
      {state?.error && <p className="mt-2 text-sm text-red-500">{state.error}</p>}
    </form>
  )
}
