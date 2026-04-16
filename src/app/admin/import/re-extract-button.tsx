'use client'

import { useActionState } from 'react'
import { reExtractSource } from './actions'

export function ReExtractButton({ sourceId }: { sourceId: string }) {
  const [state, action, pending] = useActionState(reExtractSource, null)

  return (
    <form action={action} className="inline">
      <input type="hidden" name="source_id" value={sourceId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {pending ? 'Extracting...' : 'Re-extract'}
      </button>
      {state?.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      {state?.message && <p className="mt-1 text-xs text-green-700">{state.message}</p>}
    </form>
  )
}
