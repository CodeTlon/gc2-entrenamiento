'use client'

import { Trash2 } from 'lucide-react'

export default function DeleteButton({
  action,
  id,
  label = 'Eliminar',
  confirmText,
}: {
  action: (formData: FormData) => Promise<void> | void
  id: string
  label?: string
  confirmText: string
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-300 hover:text-red-200 transition-colors"
        style={{ border: '1px solid rgba(239,68,68,0.3)' }}
      >
        <Trash2 size={14} /> {label}
      </button>
    </form>
  )
}
