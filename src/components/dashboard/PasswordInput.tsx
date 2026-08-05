'use client'

import { useState, type ComponentPropsWithoutRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type PasswordInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>

export default function PasswordInput({
  className = 'field-input',
  style,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={className}
        style={{ paddingRight: '2.75rem', ...style }}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
