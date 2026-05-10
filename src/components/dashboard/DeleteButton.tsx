'use client'

import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

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
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <>
      <form ref={formRef} action={action}>
        <input type="hidden" name="id" value={id} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-300 hover:text-red-200 transition-colors"
          style={{ border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <Trash2 size={14} /> {label}
        </button>
      </form>
      <ConfirmDialog
        open={open}
        title="Confirmar eliminación"
        message={confirmText}
        onConfirm={() => formRef.current?.requestSubmit()}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
