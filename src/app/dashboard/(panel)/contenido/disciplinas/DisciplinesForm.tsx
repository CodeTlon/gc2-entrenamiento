'use client'

import { useActionState, useState } from 'react'
import { saveSiteSettingAction, uploadMediaAction, type SaveState } from '@/actions/settings'
import type { DisciplinesSettings, DisciplineItem } from '@/lib/content'
import { TextField } from '@/components/dashboard/Field'
import { SaveButton, SaveStatus } from '@/components/dashboard/SaveButton'
import { Trash2, Plus, Upload, Loader2, Image as ImageIcon } from 'lucide-react'

async function action(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const items = JSON.parse(String(formData.get('items') ?? '[]')) as DisciplineItem[]
  const value: DisciplinesSettings = {
    label: String(formData.get('label') ?? ''),
    title_line_1: String(formData.get('title_line_1') ?? ''),
    title_line_2: String(formData.get('title_line_2') ?? ''),
    items,
  }
  return saveSiteSettingAction('disciplines', value)
}

export default function DisciplinesForm({ initial }: { initial: DisciplinesSettings }) {
  const [state, dispatch] = useActionState<SaveState, FormData>(action, undefined)
  const [items, setItems] = useState<DisciplineItem[]>(
    initial.items.length ? initial.items : [{ title: '', sub: '', desc: '', image: '' }],
  )

  function update(i: number, patch: Partial<DisciplineItem>) {
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

      <div>
        <label className="field-label">Disciplinas</label>
        <div className="space-y-3">
          {items.map((it, i) => (
            <DisciplineRow
              key={i}
              item={it}
              onChange={(patch) => update(i, patch)}
              onRemove={() => setItems(items.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setItems([...items, { title: '', sub: '', desc: '', image: '' }])}
          className="mt-3 inline-flex items-center gap-2 text-xs text-accent hover:text-white transition-colors"
        >
          <Plus size={14} /> Agregar disciplina
        </button>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <SaveButton />
        <SaveStatus state={state} />
      </div>
    </form>
  )
}

function DisciplineRow({
  item,
  onChange,
  onRemove,
}: {
  item: DisciplineItem
  onChange: (patch: Partial<DisciplineItem>) => void
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
    fd.append('folder', 'disciplines')
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
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={item.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Título (ej: RUNNING)"
              className="field-input"
            />
            <input
              type="text"
              value={item.sub}
              onChange={(e) => onChange({ sub: e.target.value })}
              placeholder="Subtítulo (ej: Corredores)"
              className="field-input"
            />
          </div>
          <textarea
            value={item.desc}
            onChange={(e) => onChange({ desc: e.target.value })}
            placeholder="Descripción breve"
            rows={2}
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
          {err && <p className="text-xs text-red-400">{err}</p>}
        </div>
      </div>
    </div>
  )
}
