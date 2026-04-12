'use client'

import { useActionState } from 'react'
import { addSource } from './actions'

export function AddSourceForm({
  programs,
}: {
  programs: Array<{ id: string; name: string }>
}) {
  const [state, action, pending] = useActionState(addSource, null)

  return (
    <form action={action} className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-medium text-gray-900">Add source</h3>
      {state?.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="source_name" className="block text-xs text-gray-600">Name</label>
          <input
            id="source_name"
            name="name"
            type="text"
            required
            placeholder="e.g. Wolf Trap Opera"
            className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="source_url" className="block text-xs text-gray-600">URL</label>
          <input
            id="source_url"
            name="url"
            type="url"
            required
            placeholder="https://..."
            className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="source_program_id" className="block text-xs text-gray-600">
            Link to program (optional)
          </label>
          <select
            id="source_program_id"
            name="program_id"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="">None — new program</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? 'Adding...' : 'Add source'}
      </button>
    </form>
  )
}
