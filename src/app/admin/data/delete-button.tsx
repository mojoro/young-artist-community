'use client'

export function DeleteButton({
  action,
  name,
  value,
  confirmMessage,
}: {
  action: (formData: FormData) => void
  name: string
  value: string
  confirmMessage: string
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault()
      }}
    >
      <input type="hidden" name={name} value={value} />
      <button
        type="submit"
        className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-700 hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  )
}
