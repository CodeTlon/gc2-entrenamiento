'use client'

import { useActionState } from 'react'
import { saveSiteSettingAction, type SaveState } from '@/actions/settings'
import type { LocationsSettings, LocationItem } from '@/lib/content'
import { TextField, ObjectList } from '@/components/dashboard/Field'
import { SaveButton, SaveStatus } from '@/components/dashboard/SaveButton'

/** Extrae la URL del src si el usuario pegó el tag <iframe> completo. */
function extractSrc(raw: string): string {
  const trimmed = raw.trim()
  const match = trimmed.match(/src=["']([^"']+)["']/)
  return match ? match[1] : trimmed
}

async function action(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const items = JSON.parse(String(formData.get('items') ?? '[]')) as LocationItem[]
  const value: LocationsSettings = {
    label:        String(formData.get('label')        ?? ''),
    title_line_1: String(formData.get('title_line_1') ?? ''),
    title_line_2: String(formData.get('title_line_2') ?? ''),
    items,
  }
  return saveSiteSettingAction('locations', value)
}

export default function LocationsForm({ initial }: { initial: LocationsSettings }) {
  const [state, dispatch] = useActionState<SaveState, FormData>(action, undefined)

  return (
    <form action={dispatch} className="space-y-6 max-w-3xl">
      <TextField label="Etiqueta de sección" name="label" defaultValue={initial.label} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Título — línea 1" name="title_line_1" defaultValue={initial.title_line_1} />
        <TextField label="Título — línea 2 (degradé)" name="title_line_2" defaultValue={initial.title_line_2} />
      </div>

      <ObjectList<LocationItem>
        label="Sedes"
        name="items"
        defaultValue={initial.items}
        template={{ name: '', description: '', address: '', maps_embed_url: '' }}
        addLabel="Agregar sede"
        renderItem={(item, update) => (
          <div className="space-y-2 pr-6">
            <input
              type="text"
              value={item.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Nombre (ej: El Mágico - UNC)"
              className="field-input"
            />
            <input
              type="text"
              value={item.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Descripción (ej: Clases grupales en el parque)"
              className="field-input"
            />
            <input
              type="text"
              value={item.address}
              onChange={(e) => update({ address: e.target.value })}
              placeholder="Dirección"
              className="field-input"
            />
            <div>
              <textarea
                value={item.maps_embed_url}
                onChange={(e) => update({ maps_embed_url: extractSrc(e.target.value) })}
                placeholder='Pegá la URL del embed o el tag <iframe> completo — Google Maps → Compartir → Insertar mapa'
                className="field-input resize-none text-xs"
                rows={2}
              />
              {item.maps_embed_url && !item.maps_embed_url.includes('google.com/maps/embed') && (
                <p className="text-yellow-400/80 text-xs mt-1">
                  ⚠ La URL no parece ser un embed de Google Maps. Copiá solo el <code>src</code> del iframe.
                </p>
              )}
            </div>
          </div>
        )}
      />

      <p className="text-white/35 text-xs -mt-2">
        Para obtener el embed: buscá el lugar en Google Maps → Compartir → Insertar un mapa → copiá el atributo <code className="text-accent/70">src</code> del iframe (o pegá el tag completo, lo extraemos automáticamente).
      </p>

      <div className="flex items-center gap-4 pt-2">
        <SaveButton />
        <SaveStatus state={state} />
      </div>
    </form>
  )
}
