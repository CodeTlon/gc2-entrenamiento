'use client'

import { useRef, useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
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
  const [isPending, startTransition] = useTransition()
  const submitRef = useRef<HTMLButtonElement>(null)

  function handleConfirm() {
    setOpen(false)
    startTransition(() => {
      submitRef.current?.click()
    })
  }

  return (
    <>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <button ref={submitRef} type="submit" style={{ display: 'none' }} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-300 hover:text-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ border: '1px solid rgba(239,68,68,0.3)' }}
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          {isPending ? 'Eliminando…' : label}
        </button>
      </form>
      <ConfirmDialog
        open={open}
        title="Confirmar eliminación"
        message={confirmText}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
