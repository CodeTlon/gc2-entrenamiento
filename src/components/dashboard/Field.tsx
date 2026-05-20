'use client'

import { useState } from 'react'
import { Trash2, Plus, Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { uploadMediaAction } from '@/actions/settings'
import FocalPicker from '@/components/dashboard/FocalPicker'

export function TextField({
  label,
  name,
  defaultValue,
  type = 'text',
  hint,
  required,
  placeholder,
}: {
  label: string
  name: string
  defaultValue?: string
  type?: string
  hint?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        required={required}
        placeholder={placeholder}
        className="field-input"
      />
      {hint && <p className="text-white/35 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  hint,
}: {
  label: string
  name: string
  defaultValue?: string
  rows?: number
  hint?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        className="field-input"
      />
      {hint && <p className="text-white/35 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

export function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string
  name: string
  defaultChecked?: boolean
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-white/75 cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="w-4 h-4 accent-accent"
      />
      {label}
    </label>
  )
}

export function ImageUpload({
  label,
  name,
  defaultValue,
  folder = 'uploads',
  hint,
  previewAspect = '1 / 1',
}: {
  label: string
  name: string
  defaultValue?: string | null
  folder?: string
  hint?: string
  /** Aspect ratio del preview del FocalPicker (ej: "16 / 9", "1 / 1"). */
  previewAspect?: string
}) {
  const [url, setUrl] = useState<string>(defaultValue ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setErr(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await uploadMediaAction(fd)
    setBusy(false)
    if (res.error) {
      setErr(res.error)
      return
    }
    if (res.url) setUrl(res.url)
    e.target.value = ''
  }

  return (
    <div>
      <label className="field-label">{label}</label>
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div
          className="flex-shrink-0 w-full sm:w-32 h-24 rounded-md flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={20} className="text-white/30" />
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL de la imagen, o subí una abajo"
            className="field-input"
          />
          <div className="flex items-center gap-3">
            <label
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-body font-semibold cursor-pointer transition-colors"
              style={{
                background: 'rgba(56,189,248,0.12)',
                color: '#38BDF8',
                border: '1px solid rgba(56,189,248,0.25)',
              }}
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {busy ? 'Subiendo…' : 'Subir archivo'}
              <input
                type="file"
                accept="image/*"
                onChange={onPick}
                disabled={busy}
                className="hidden"
              />
            </label>
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="text-xs text-white/45 hover:text-white"
              >
                Quitar
              </button>
            )}
          </div>
          {err && <p className="text-xs text-red-400">{err}</p>}
        </div>
      </div>
      {url && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <FocalPicker value={url} onChange={setUrl} previewAspect={previewAspect} />
        </div>
      )}
      {hint && <p className="text-white/35 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

export function StringList({
  label,
  name,
  defaultValue,
  placeholder,
  hint,
}: {
  label: string
  name: string
  defaultValue?: string[]
  placeholder?: string
  hint?: string
}) {
  const [items, setItems] = useState<string[]>(defaultValue?.length ? defaultValue : [''])

  return (
    <div>
      <label className="field-label">{label}</label>
      <input type="hidden" name={name} value={JSON.stringify(items.filter((s) => s.trim()))} />
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={it}
              onChange={(e) => {
                const copy = [...items]
                copy[i] = e.target.value
                setItems(copy)
              }}
              placeholder={placeholder}
              className="field-input"
            />
            <button
              type="button"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="px-3 rounded-md text-white/55 hover:text-red-400 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
              aria-label="Quitar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems([...items, ''])}
        className="mt-3 inline-flex items-center gap-2 text-xs text-accent hover:text-white transition-colors"
      >
        <Plus size={14} /> Agregar
      </button>
      {hint && <p className="text-white/35 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}

export function ObjectList<T extends Record<string, unknown>>({
  label,
  name,
  defaultValue,
  template,
  renderItem,
  addLabel = 'Agregar',
  hint,
}: {
  label: string
  name: string
  defaultValue?: T[]
  template: T
  renderItem: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode
  addLabel?: string
  hint?: string
}) {
  const [items, setItems] = useState<T[]>(defaultValue?.length ? defaultValue : [template])

  function update(idx: number, patch: Partial<T>) {
    setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  return (
    <div>
      <label className="field-label">{label}</label>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <div className="space-y-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-md p-4 relative"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <button
              type="button"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="absolute top-2 right-2 text-white/45 hover:text-red-400"
              aria-label="Quitar"
            >
              <Trash2 size={14} />
            </button>
            {renderItem(it, (patch) => update(i, patch))}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setItems([...items, { ...template }])}
        className="mt-3 inline-flex items-center gap-2 text-xs text-accent hover:text-white transition-colors"
      >
        <Plus size={14} /> {addLabel}
      </button>
      {hint && <p className="text-white/35 text-xs mt-1.5">{hint}</p>}
    </div>
  )
}
