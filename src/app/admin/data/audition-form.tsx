'use client'

import { useActionState } from 'react'
import { createAudition, updateAudition } from './actions'

interface AuditionData {
  id: string
  location: string
  time_slot: string
  audition_fee: string
  instructions: string
  registration_url: string
  instruments: string
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  placeholder,
}: {
  label: string
  name: string
  defaultValue: string
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={`aud_${name}`} className="block text-xs text-gray-600">
        {label}
      </label>
      <input
        id={`aud_${name}`}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
      />
    </div>
  )
}

export function AuditionForm({
  programId,
  audition,
  validLocations,
  validInstruments,
}: {
  programId: string
  audition?: AuditionData
  validLocations: string[]
  validInstruments: string[]
}) {
  const isEdit = !!audition
  const action = isEdit ? updateAudition : createAudition
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="rounded-lg border border-gray-200 bg-white p-4">
      <input type="hidden" name="program_id" value={programId} />
      {audition && <input type="hidden" name="audition_id" value={audition.id} />}

      <h4 className="text-sm font-medium text-gray-900">
        {isEdit ? 'Edit audition' : 'Add audition'}
      </h4>

      {state?.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      {state?.message && <p className="mt-1 text-xs text-green-700">{state.message}</p>}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Field
            label="Location (City/Country)"
            name="location"
            defaultValue={audition?.location ?? ''}
            placeholder="New York/US"
          />
          <p className="mt-0.5 truncate text-xs text-gray-400">{validLocations.join(', ')}</p>
        </div>
        <Field
          label="Date/time"
          name="time_slot"
          type="datetime-local"
          defaultValue={audition?.time_slot ?? ''}
        />
        <Field
          label="Fee (USD)"
          name="audition_fee"
          type="number"
          defaultValue={audition?.audition_fee ?? ''}
          placeholder="0"
        />
        <div className="sm:col-span-2 lg:col-span-3">
          <Field
            label="Instruments (comma-separated)"
            name="instruments"
            defaultValue={audition?.instruments ?? ''}
            placeholder="Voice, Piano"
          />
          <p className="mt-0.5 truncate text-xs text-gray-400">{validInstruments.join(', ')}</p>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label htmlFor="aud_instructions" className="block text-xs text-gray-600">
            Instructions
          </label>
          <textarea
            id="aud_instructions"
            name="instructions"
            defaultValue={audition?.instructions ?? ''}
            rows={2}
            className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <Field
            label="Registration URL"
            name="registration_url"
            type="url"
            defaultValue={audition?.registration_url ?? ''}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? 'Saving...' : isEdit ? 'Save audition' : 'Add audition'}
      </button>
    </form>
  )
}
