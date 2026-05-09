'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** Optional aria-label for the dialog itself */
  label?: string
  /** Max width in px, default 720 */
  maxWidth?: number
}

export default function Modal({ open, onClose, children, label, maxWidth = 720 }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="modal-backdrop fixed inset-0 z-[10000] overflow-y-auto"
      style={{
        background: 'rgba(10,22,40,0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center px-4 py-8">
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="modal-panel relative w-full rounded-xl outline-none overflow-hidden"
        style={{
          maxWidth: `${maxWidth}px`,
          background: '#0D2247',
          border: '1px solid #102E66',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center
            text-white/70 hover:text-white transition-colors"
          style={{
            background: 'rgba(10,22,40,0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <X size={18} />
        </button>
        {children}
      </div>
      </div>
    </div>,
    document.body,
  )
}
