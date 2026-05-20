'use client'

import { useActionState } from 'react'
import { saveSiteSettingAction, type SaveState } from '@/actions/settings'
import type { HeroSettings } from '@/lib/content'
import { TextField, TextArea, ImageUpload, ObjectList } from '@/components/dashboard/Field'
import { SaveButton, SaveStatus } from '@/components/dashboard/SaveButton'

async function action(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const stats = JSON.parse(String(formData.get('stats') ?? '[]')) as { number: string; label: string }[]
  const value: HeroSettings = {
    title_line_1: String(formData.get('title_line_1') ?? ''),
    title_line_2: String(formData.get('title_line_2') ?? ''),
    subtitle: String(formData.get('subtitle') ?? ''),
    cta_primary_label: String(formData.get('cta_primary_label') ?? ''),
    cta_primary_href: String(formData.get('cta_primary_href') ?? ''),
    cta_secondary_label: String(formData.get('cta_secondary_label') ?? ''),
    cta_secondary_href: String(formData.get('cta_secondary_href') ?? ''),
    bg_image: String(formData.get('bg_image') ?? ''),
    stats: stats.filter((s) => s.number || s.label),
  }
  return saveSiteSettingAction('hero', value)
}

export default function HeroForm({ initial }: { initial: HeroSettings }) {
  const [state, dispatch] = useActionState<SaveState, FormData>(action, undefined)

  return (
    <form action={dispatch} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Título — línea 1" name="title_line_1" defaultValue={initial.title_line_1} />
        <TextField label="Título — línea 2 (en degradé)" name="title_line_2" defaultValue={initial.title_line_2} />
      </div>

      <TextArea
        label="Subtítulo"
        name="subtitle"
        defaultValue={initial.subtitle}
        rows={3}
        hint="Acepta HTML simple, ej: <strong>texto</strong>."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Botón primario — texto" name="cta_primary_label" defaultValue={initial.cta_primary_label} />
        <TextField label="Botón primario — link" name="cta_primary_href" defaultValue={initial.cta_primary_href} />
        <TextField label="Botón secundario — texto" name="cta_secondary_label" defaultValue={initial.cta_secondary_label} />
        <TextField label="Botón secundario — link" name="cta_secondary_href" defaultValue={initial.cta_secondary_href} />
      </div>

      <ImageUpload
        label="Imagen de fondo"
        name="bg_image"
        defaultValue={initial.bg_image}
        folder="hero"
        previewAspect="16 / 9"
      />

      <ObjectList<{ number: string; label: string }>
        label="Métricas (4 ítems recomendados)"
        name="stats"
        defaultValue={initial.stats}
        template={{ number: '', label: '' }}
        addLabel="Agregar métrica"
        renderItem={(item, update) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
            <input
              type="text"
              value={item.number}
              onChange={(e) => update({ number: e.target.value })}
              placeholder="Número (ej: 6+)"
              className="field-input"
            />
            <input
              type="text"
              value={item.label}
              onChange={(e) => update({ label: e.target.value })}
              placeholder="Etiqueta (ej: Planes)"
              className="field-input"
            />
          </div>
        )}
      />

      <div className="flex items-center gap-4 pt-2">
        <SaveButton />
        <SaveStatus state={state} />
      </div>
    </form>
  )
}
