'use client'

import { useActionState } from 'react'
import { saveSiteSettingAction, type SaveState } from '@/actions/settings'
import type { GroupClassesSettings } from '@/lib/content'
import { TextField, ImageUpload, StringList, ObjectList } from '@/components/dashboard/Field'
import { SaveButton, SaveStatus } from '@/components/dashboard/SaveButton'

async function action(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const days = JSON.parse(String(formData.get('days') ?? '[]')) as string[]
  const plans = JSON.parse(String(formData.get('plans') ?? '[]')) as { name: string; desc: string }[]
  const value: GroupClassesSettings = {
    label: String(formData.get('label') ?? ''),
    title_line_1: String(formData.get('title_line_1') ?? ''),
    title_line_2: String(formData.get('title_line_2') ?? ''),
    time: String(formData.get('time') ?? ''),
    days,
    plans,
    bg_image: String(formData.get('bg_image') ?? ''),
    side_image: String(formData.get('side_image') ?? ''),
  }
  return saveSiteSettingAction('group_classes', value)
}

export default function GroupClassesForm({ initial }: { initial: GroupClassesSettings }) {
  const [state, dispatch] = useActionState<SaveState, FormData>(action, undefined)
  return (
    <form action={dispatch} className="space-y-6 max-w-3xl">
      <TextField label="Etiqueta de sección" name="label" defaultValue={initial.label} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Título — línea 1" name="title_line_1" defaultValue={initial.title_line_1} />
        <TextField label="Título — línea 2 (degradé)" name="title_line_2" defaultValue={initial.title_line_2} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Horario (ej: 19:30)" name="time" defaultValue={initial.time} />
      </div>
      <StringList
        label="Días"
        name="days"
        defaultValue={initial.days}
        placeholder="Ej: MARTES"
      />
      <ObjectList<{ name: string; desc: string }>
        label="Planes destacados en esta sección"
        name="plans"
        defaultValue={initial.plans}
        template={{ name: '', desc: '' }}
        addLabel="Agregar plan"
        renderItem={(item, update) => (
          <div className="space-y-2 pr-6">
            <input
              type="text"
              value={item.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Nombre del plan"
              className="field-input"
            />
            <input
              type="text"
              value={item.desc}
              onChange={(e) => update({ desc: e.target.value })}
              placeholder="Descripción breve"
              className="field-input"
            />
          </div>
        )}
      />
      <ImageUpload label="Imagen de fondo" name="bg_image" defaultValue={initial.bg_image} folder="group" previewAspect="16 / 9" />
      <ImageUpload label="Imagen lateral" name="side_image" defaultValue={initial.side_image} folder="group" previewAspect="3 / 4" />
      <div className="flex items-center gap-4 pt-2">
        <SaveButton />
        <SaveStatus state={state} />
      </div>
    </form>
  )
}
