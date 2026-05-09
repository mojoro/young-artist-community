'use client'

import { useActionState } from 'react'
import { createProgram, type CreateProgramState } from './actions'
import { Combobox, LocationCombobox } from '@/app/components/combobox'

interface Props {
  instruments: { id: string; name: string }[]
  categories: { id: string; name: string }[]
  locations: { id: string; name: string }[]
}

export function ProgramForm({ instruments, categories, locations }: Props) {
  const [state, formAction, pending] = useActionState<CreateProgramState | null, FormData>(
    createProgram,
    null,
  )

  return (
    <form action={formAction}>
      <input
        type="text"
        name="url_confirm"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      {state?.error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {state.error}
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
        >
          Program name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Description */}
      <div className="mt-5">
        <label
          htmlFor="description"
          className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Dates */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="start_date"
            className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
          >
            Start date
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label
            htmlFor="end_date"
            className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
          >
            End date
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label
            htmlFor="application_deadline"
            className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
          >
            Application deadline
          </label>
          <input
            id="application_deadline"
            name="application_deadline"
            type="date"
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Currency */}
      <div className="mt-5">
        <label
          htmlFor="currency"
          className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
        >
          Currency
        </label>
        <select
          id="currency"
          name="currency"
          defaultValue="USD"
          className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500 sm:max-w-[12rem]"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>

      {/* Financial */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="tuition"
            className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
          >
            Tuition
          </label>
          <input
            id="tuition"
            name="tuition"
            type="number"
            min="0"
            step="1"
            placeholder="0 = free"
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label
            htmlFor="application_fee"
            className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
          >
            Application fee
          </label>
          <input
            id="application_fee"
            name="application_fee"
            type="number"
            min="0"
            step="1"
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Stipend / salary */}
      <div className="mt-5">
        <label
          htmlFor="stipend"
          className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
        >
          Stipend / salary
        </label>
        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <input
            id="stipend"
            name="stipend"
            type="number"
            min="0"
            step="1"
            placeholder="Amount (leave blank if none)"
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
          />
          <select
            id="stipend_frequency"
            name="stipend_frequency"
            defaultValue=""
            aria-label="Stipend frequency"
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
          >
            <option value="">— per period —</option>
            <option value="daily">Per day</option>
            <option value="weekly">Per week</option>
            <option value="monthly">Per month</option>
            <option value="annual">Per year</option>
            <option value="one_time">One-time</option>
          </select>
        </div>
      </div>

      {/* Age range */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="age_min"
            className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
          >
            Age min
          </label>
          <input
            id="age_min"
            name="age_min"
            type="number"
            min="0"
            max="100"
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label
            htmlFor="age_max"
            className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
          >
            Age max
          </label>
          <input
            id="age_max"
            name="age_max"
            type="number"
            min="0"
            max="100"
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Scholarship */}
      <div className="mt-5 flex items-center pt-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="offers_scholarship"
            value="true"
            className="h-4 w-4 rounded border-slate-300 accent-brand-600"
          />
          Offers scholarship / financial aid
        </label>
      </div>

      {/* URLs */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="program_url"
            className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
          >
            Program URL
          </label>
          <input
            id="program_url"
            name="program_url"
            type="url"
            placeholder="https://..."
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label
            htmlFor="application_url"
            className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
          >
            Application URL
          </label>
          <input
            id="application_url"
            name="application_url"
            type="url"
            placeholder="https://..."
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Instruments */}
      <div className="mt-5">
        <Combobox
          name="instruments"
          label="Instruments"
          options={instruments}
          placeholder="Search instruments..."
        />
      </div>

      {/* Categories */}
      <div className="mt-5">
        <Combobox
          name="categories"
          label="Categories"
          options={categories}
          placeholder="Search categories..."
        />
      </div>

      {/* Locations */}
      <div className="mt-5">
        <LocationCombobox
          name="locations"
          label="Locations"
          options={locations}
          placeholder="Search locations..."
        />
      </div>

      {/* Submit */}
      <div className="mt-8 border-t border-slate-100 pt-5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Submitting...' : 'Submit program'}
        </button>
      </div>
    </form>
  )
}
