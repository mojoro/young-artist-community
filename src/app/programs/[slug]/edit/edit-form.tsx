'use client'

import { useActionState } from 'react'
import { editProgram, type EditProgramState } from './actions'
import { Combobox, LocationCombobox } from '@/app/components/combobox'
import { SelectInput } from '@/app/components/select-input'

interface ProgramData {
  id: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  application_deadline: string | null
  currency: string
  tuition: number | null
  application_fee: number | null
  stipend: number | null
  stipend_frequency: string | null
  age_min: number | null
  age_max: number | null
  offers_scholarship: boolean
  program_url: string | null
  application_url: string | null
  instruments: { id: string; name: string }[]
  categories: { id: string; name: string }[]
  locations: { id: string; name: string }[]
}

interface Props {
  program: ProgramData
  allInstruments: { id: string; name: string }[]
  allCategories: { id: string; name: string }[]
  allLocations: { id: string; name: string }[]
}

function toDateInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

export function EditProgramForm({ program, allInstruments, allCategories, allLocations }: Props) {
  const [state, formAction, pending] = useActionState<EditProgramState | null, FormData>(
    editProgram,
    null,
  )

  return (
    <form action={formAction}>
      <input type="hidden" name="program_id" value={program.id} />
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
          defaultValue={program.name}
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
          defaultValue={program.description ?? ''}
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
            defaultValue={toDateInput(program.start_date)}
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
            defaultValue={toDateInput(program.end_date)}
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
            defaultValue={toDateInput(program.application_deadline)}
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
        <SelectInput
          id="currency"
          name="currency"
          defaultValue={program.currency}
          wrapperClassName="sm:max-w-[12rem]"
          className="rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
          options={[
            { value: 'USD', label: 'USD ($)' },
            { value: 'EUR', label: 'EUR (€)' },
            { value: 'GBP', label: 'GBP (£)' },
          ]}
        />
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
            defaultValue={program.tuition ?? ''}
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
            defaultValue={program.application_fee ?? ''}
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
            defaultValue={program.stipend ?? ''}
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
          />
          <SelectInput
            id="stipend_frequency"
            name="stipend_frequency"
            defaultValue={program.stipend_frequency ?? ''}
            aria-label="Stipend frequency"
            className="rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            options={[
              { value: '', label: '— per period —' },
              { value: 'daily', label: 'Per day' },
              { value: 'weekly', label: 'Per week' },
              { value: 'monthly', label: 'Per month' },
              { value: 'annual', label: 'Per year' },
              { value: 'one_time', label: 'One-time' },
            ]}
          />
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
            defaultValue={program.age_min ?? ''}
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
            defaultValue={program.age_max ?? ''}
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
            defaultChecked={program.offers_scholarship}
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
            defaultValue={program.program_url ?? ''}
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
            defaultValue={program.application_url ?? ''}
            className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Instruments */}
      <div className="mt-5">
        <Combobox
          name="instruments"
          label="Instruments"
          options={allInstruments}
          initialSelected={program.instruments}
          placeholder="Search instruments..."
        />
      </div>

      {/* Categories */}
      <div className="mt-5">
        <Combobox
          name="categories"
          label="Categories"
          options={allCategories}
          initialSelected={program.categories}
          placeholder="Search categories..."
        />
      </div>

      {/* Locations */}
      <div className="mt-5">
        <LocationCombobox
          name="locations"
          label="Locations"
          options={allLocations}
          initialSelected={program.locations}
          placeholder="Search locations..."
        />
      </div>

      {/* Edit summary */}
      <div className="mt-5">
        <label
          htmlFor="edit_summary"
          className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
        >
          Edit summary (optional)
        </label>
        <input
          id="edit_summary"
          name="edit_summary"
          type="text"
          placeholder="Briefly describe what you changed..."
          className="w-full rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 transition-colors focus:bg-white focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Submit */}
      <div className="mt-8 border-t border-slate-100 pt-5">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
