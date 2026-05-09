'use client'

import { useActionState } from 'react'
import { saveSiteSettingAction, type SaveState } from '@/actions/settings'
import type { AboutSettings } from '@/lib/content'
import { TextField, ImageUpload, StringList } from '@/components/dashboard/Field'
import { SaveButton, SaveStatus } from '@/components/dashboard/SaveButton'

async function action(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const paragraphs = JSON.parse(String(formData.get('paragraphs') ?? '[]')) as string[]
  const features = JSON.parse(String(formData.get('features') ?? '[]')) as string[]
  const value: AboutSettings = {
    label: String(formData.get('label') ?? ''),
    title_line_1: String(formData.get('title_line_1') ?? ''),
    title_line_2: String(formData.get('title_line_2') ?? ''),
    paragraphs,
    features,
    image: String(formData.get('image') ?? ''),
  }
  return saveSiteSettingAction('about', value)
}

export default function AboutForm({ initial }: { initial: AboutSettings }) {
  const [state, dispatch] = useActionState<SaveState, FormData>(action, undefined)
  return (
    <form action={dispatch} className="space-y-6 max-w-3xl">
      <TextField label="Etiqueta de sección" name="label" defaultValue={initial.label} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Título — línea 1" name="title_line_1" defaultValue={initial.title_line_1} />
        <TextField label="Título — línea 2 (degradé)" name="title_line_2" defaultValue={initial.title_line_2} />
      </div>
      <StringList
        label="Párrafos"
        name="paragraphs"
        defaultValue={initial.paragraphs}
        placeholder="Párrafo (acepta <strong>HTML simple</strong>)"
      />
      <StringList
        label="Features (lista de checks)"
        name="features"
        defaultValue={initial.features}
        placeholder="Ej: Planificación individualizada"
      />
      <ImageUpload
        label="Imagen lateral"
        name="image"
        defaultValue={initial.image}
        folder="about"
      />
      <div className="flex items-center gap-4 pt-2">
        <SaveButton />
        <SaveStatus state={state} />
      </div>
    </form>
  )
}
