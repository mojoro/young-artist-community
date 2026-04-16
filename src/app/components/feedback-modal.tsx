'use client'

import { useRef, useEffect, useActionState } from 'react'
import { submitFeedback, type FeedbackFormState } from './feedback-actions'

export function FeedbackModal() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState<FeedbackFormState | null, FormData>(
    submitFeedback,
    null,
  )

  // Close modal on successful submission
  useEffect(() => {
    if (state?.message) {
      const timer = setTimeout(() => {
        dialogRef.current?.close()
        formRef.current?.reset()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [state?.message])

  function open() {
    dialogRef.current?.showModal()
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="feedback-trigger"
      >
        Feedback
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-xl bg-white p-0 shadow-xl backdrop:bg-black/40"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close()
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Send feedback</h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-600"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {state?.message ? (
            <p className="mt-4 text-sm text-green-600">{state.message}</p>
          ) : (
            <form ref={formRef} action={action} className="mt-4">
              <input
                type="text"
                name="url_confirm"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="sr-only"
              />

              <div>
                <label
                  htmlFor="feedback-message"
                  className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="feedback-message"
                  name="message"
                  required
                  rows={4}
                  className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
                  placeholder="Bug report, feature request, or just say hi..."
                />
              </div>

              <div className="mt-3">
                <label
                  htmlFor="feedback-email"
                  className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
                >
                  Email <span className="text-slate-300">(optional)</span>
                </label>
                <input
                  id="feedback-email"
                  name="email"
                  type="email"
                  className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
                  placeholder="you@example.com"
                />
              </div>

              {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
                >
                  {pending ? 'Sending...' : 'Send feedback'}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  )
}
