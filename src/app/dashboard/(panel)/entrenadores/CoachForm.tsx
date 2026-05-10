'use client'

import { useActionState, useState } from 'react'
import { createCoachAction, updateCoachAction, type CoachState } from '@/actions/coaches'
import type { Coach } from '@/lib/content'
import { TextField, TextArea, ImageUpload, StringList } from '@/components/dashboard/Field'
import { SaveButton, SaveStatus } from '@/components/dashboard/SaveButton'

export default function CoachForm({
  coach,
  takenOrders = [],
}: {
  coach?: Coach
  takenOrders?: number[]
}) {
  const isEdit = !!coach
  const action = isEdit ? updateCoachAction.bind(null, coach!.id) : createCoachAction
  const [state, dispatch] = useActionState<CoachState, FormData>(action, undefined)
  const [orderError, setOrderError] = useState<string | null>(null)

  function handleOrderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val) && takenOrders.includes(val)) {
      setOrderError('Este orden ya está en uso por otro entrenador')
    } else {
      setOrderError(null)
    }
  }

  return (
    <form action={dispatch} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Nombre completo" name="name" defaultValue={coach?.name} required />
        <TextField label="Especialidad" name="specialty" defaultValue={coach?.specialty} placeholder="Ej: Head Coach Triatlón" />
      </div>

      <TextArea
        label="Descripción corta (tarjeta)"
        name="short_desc"
        defaultValue={coach?.short_desc}
        rows={2}
        hint="Aparece en el listado del home."
      />

      <TextArea
        label="Bio larga (modal)"
        name="bio_long"
        defaultValue={coach?.bio_long}
        rows={6}
        hint="Aparece al hacer click en el perfil."
      />

      <ImageUpload
        label="Foto"
        name="photo_url"
        defaultValue={coach?.photo_url}
        folder="coaches"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Handle de Instagram" name="ig_handle" defaultValue={coach?.ig_handle ?? ''} placeholder="@usuario" />
        <TextField label="URL de Instagram" name="ig_url" defaultValue={coach?.ig_url ?? ''} placeholder="https://instagram.com/..." />
      </div>

      <StringList
        label="Formación / Certificaciones"
        name="certifications"
        defaultValue={coach?.certifications ?? []}
        placeholder="Ej: Profesor Nacional de Educación Física"
      />

      <StringList
        label="Logros"
        name="achievements"
        defaultValue={coach?.achievements ?? []}
        placeholder="Ej: Multiple finisher Ironman 70.3"
      />

      <StringList
        label="Servicios"
        name="services"
        defaultValue={coach?.services ?? []}
        placeholder="Ej: Plan personalizado de triatlón"
      />

      <div>
        <label htmlFor="display_order" className="field-label">Orden de visualización</label>
        <input
          id="display_order"
          name="display_order"
          type="number"
          defaultValue={String(coach?.display_order ?? 0)}
          onChange={handleOrderChange}
          className="field-input"
        />
        {orderError
          ? <p className="text-red-400 text-xs mt-1.5">{orderError}</p>
          : <p className="text-white/35 text-xs mt-1.5">Menor primero. 0, 1, 2…</p>
        }
      </div>

      <div className="flex items-center gap-4 pt-2">
        <SaveButton label={isEdit ? 'Guardar cambios' : 'Crear entrenador'} disabled={!!orderError} />
        <SaveStatus state={state} />
      </div>
    </form>
  )
}
