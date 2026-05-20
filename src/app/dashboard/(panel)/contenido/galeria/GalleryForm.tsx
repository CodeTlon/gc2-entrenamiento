'use client'

import { useActionState, useState } from 'react'
import { saveSiteSettingAction, uploadMediaAction, type SaveState } from '@/actions/settings'
import type { TeamGallerySettings, TeamGalleryItem } from '@/lib/content'
import { TextField, TextArea } from '@/components/dashboard/Field'
import { SaveButton, SaveStatus } from '@/components/dashboard/SaveButton'
import FocalPicker from '@/components/dashboard/FocalPicker'
import { Plus, Trash2, Upload, Loader2, Image as ImageIcon } from 'lucide-react'

function previewAspectFor(index: number, total: number): string {
  if (total !== 4) return '1 / 1'
  if (index === 0) return '1 / 2'
  if (index === 3) return '2 / 1'
  return '1 / 1'
}

async function action(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const items = JSON.parse(String(formData.get('items') ?? '[]')) as TeamGalleryItem[]
  const value: TeamGallerySettings = {
    label: String(formData.get('label') ?? ''),
    title_line_1: String(formData.get('title_line_1') ?? ''),
    title_line_2: String(formData.get('title_line_2') ?? ''),
    description: String(formData.get('description') ?? ''),
    items,
  }
  return saveSiteSettingAction('team_gallery', value)
}

export default function GalleryForm({ initial }: { initial: TeamGallerySettings }) {
  const [state, dispatch] = useActionState<SaveState, FormData>(action, undefined)
  const [items, setItems] = useState<TeamGalleryItem[]>(
    initial.items.length ? initial.items : [{ image: '', label: '', large: false }],
  )

  function update(i: number, patch: Partial<TeamGalleryItem>) {
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }

  return (
    <form action={dispatch} className="space-y-6 max-w-3xl">
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <TextField label="Etiqueta de sección" name="label" defaultValue={initial.label} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Título — línea 1" name="title_line_1" defaultValue={initial.title_line_1} />
        <TextField label="Título — línea 2 (degradé)" name="title_line_2" defaultValue={initial.title_line_2} />
      </div>
      <TextArea label="Descripción" name="description" defaultValue={initial.description} rows={2} />

      <div>
        <label className="field-label">Fotos</label>
        {items.length === 4 && (
          <p className="text-white/40 text-xs mb-3">
            Layout fijo con 4 fotos: la primera ocupa el costado izquierdo (alta),
            la 2da y 3ra van arriba, la 4ta ocupa el ancho de abajo.
          </p>
        )}
        <div className="space-y-3">
          {items.map((it, i) => (
            <GalleryRow
              key={i}
              item={it}
              previewAspect={previewAspectFor(i, items.length)}
              onChange={(patch) => update(i, patch)}
              onRemove={() => setItems(items.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setItems([...items, { image: '', label: '', large: false }])}
          className="mt-3 inline-flex items-center gap-2 text-xs text-accent hover:text-white transition-colors"
        >
          <Plus size={14} /> Agregar foto
        </button>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <SaveButton />
        <SaveStatus state={state} />
      </div>
    </form>
  )
}

function GalleryRow({
  item,
  previewAspect,
  onChange,
  onRemove,
}: {
  item: TeamGalleryItem
  previewAspect: string
  onChange: (patch: Partial<TeamGalleryItem>) => void
  onRemove: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setErr(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'gallery')
    const res = await uploadMediaAction(fd)
    setBusy(false)
    if (res.error) setErr(res.error)
    if (res.url) onChange({ image: res.url })
    e.target.value = ''
  }

  return (
    <div
      className="rounded-md p-4 relative"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 text-white/45 hover:text-red-400"
        aria-label="Quitar"
      >
        <Trash2 size={14} />
      </button>
      <div className="grid grid-cols-1 md:grid-cols-[110px_1fr] gap-4">
        <div
          className="h-24 rounded-md flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={20} className="text-white/30" />
          )}
        </div>
        <div className="space-y-2">
          <input
            type="text"
            value={item.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Etiqueta (ej: Carrera)"
            className="field-input"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={item.image}
              onChange={(e) => onChange({ image: e.target.value })}
              placeholder="URL de imagen"
              className="field-input flex-1 min-w-[180px]"
            />
            <label
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-body font-semibold cursor-pointer"
              style={{
                background: 'rgba(56,189,248,0.12)',
                color: '#38BDF8',
                border: '1px solid rgba(56,189,248,0.25)',
              }}
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {busy ? 'Subiendo…' : 'Subir'}
              <input type="file" accept="image/*" onChange={pick} disabled={busy} className="hidden" />
            </label>
          </div>
          {item.image && (
            <div className="mt-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <FocalPicker
                value={item.image}
                onChange={(url) => onChange({ image: url })}
                previewAspect={previewAspect}
              />
            </div>
          )}
          {err && <p className="text-xs text-red-400">{err}</p>}
        </div>
      </div>
    </div>
  )
}
