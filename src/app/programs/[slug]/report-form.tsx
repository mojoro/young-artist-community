'use client'

import { useActionState, useState } from 'react'
import { submitReport, type ReportFormState } from './actions'

export function ReportButton({
  programId,
  reviewId,
  label,
}: {
  programId: string
  reviewId?: string
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState<ReportFormState | null, FormData>(
    submitReport,
    null,
  )

  if (state?.message && !state.error) {
    return <p className="text-sm text-success-700">Thank you. Your report has been submitted.</p>
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-600"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
          />
        </svg>
        {label ?? 'Report'}
      </button>
    )
  }

  return (
    <form action={action} className="mt-3 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200">
      <input type="hidden" name="program_id" value={programId} />
      {reviewId && <input type="hidden" name="review_id" value={reviewId} />}
      <input
        type="text"
        name="url_confirm"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      <div className="space-y-3">
        <div>
          <label
            htmlFor={`report-type-${reviewId ?? 'program'}`}
            className="mb-1 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
          >
            Type
          </label>
          <select
            id={`report-type-${reviewId ?? 'program'}`}
            name="report_type"
            required
            defaultValue={reviewId ? 'inappropriate_content' : 'inaccurate_data'}
            className="w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-500"
          >
            <option value="inaccurate_data">Inaccurate data</option>
            <option value="inappropriate_content">Inappropriate content</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor={`report-desc-${reviewId ?? 'program'}`}
            className="mb-1 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id={`report-desc-${reviewId ?? 'program'}`}
            name="description"
            required
            rows={3}
            placeholder="Please describe the issue..."
            className="w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label
            htmlFor={`report-email-${reviewId ?? 'program'}`}
            className="mb-1 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
          >
            Your email (optional)
          </label>
          <input
            id={`report-email-${reviewId ?? 'program'}`}
            name="reporter_email"
            type="email"
            className="w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {pending ? 'Submitting...' : 'Submit report'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
