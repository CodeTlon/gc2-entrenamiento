'use client'

import { useActionState } from 'react'
import { createPlanAction, updatePlanAction, type PlanState } from '@/actions/plans'
import type { Plan } from '@/lib/content'
import { TextField, TextArea, StringList, Checkbox } from '@/components/dashboard/Field'
import { SaveButton, SaveStatus } from '@/components/dashboard/SaveButton'

interface PlanCategory {
  id: string
  name: string
  slug: string
}

export default function PlanForm({
  plan,
  categories = [],
}: {
  plan?: Plan
  categories?: PlanCategory[]
}) {
  const isEdit = !!plan
  const action = isEdit ? updatePlanAction.bind(null, plan!.id) : createPlanAction
  const [state, dispatch] = useActionState<PlanState, FormData>(action, undefined)

  return (
    <form action={dispatch} className="space-y-6 max-w-2xl">

      <div>
        <label htmlFor="plan_category_id" className="field-label">Categoría</label>
        {categories.length > 0 ? (
          <select
            id="plan_category_id"
            name="plan_category_id"
            defaultValue={plan?.plan_category_id ?? ''}
            className="field-input"
          >
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-white/40 text-sm mt-1">
            No hay categorías creadas todavía.{' '}
            <a href="/dashboard/planes/categorias/nuevo" className="text-accent hover:underline">
              Crear una
            </a>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Nombre interno"
          name="name"
          defaultValue={plan?.name}
          required
          hint="Identificador corto (A, B, 1, 2…)."
        />
        <TextField
          label="Nombre visible"
          name="name_display"
          defaultValue={plan?.name_display ?? ''}
          hint="Lo que ve el visitante en la tarjeta."
        />
      </div>

      <TextField
        label="Badge / etiqueta"
        name="badge"
        defaultValue={plan?.badge ?? ''}
        placeholder="Popular, Recomendado…"
        hint="Opcional. Aparece en la esquina de la tarjeta."
      />

      <TextArea
        label="Descripción"
        name="description_long"
        defaultValue={plan?.description_long ?? ''}
        rows={4}
        hint="Se muestra al hacer click en 'Más información' en la tarjeta del plan."
      />

      <StringList
        label="Características incluidas"
        name="features"
        defaultValue={plan?.features ?? []}
        placeholder="Ej: Entrenamiento Individualizado"
      />

      <Checkbox
        label="Destacado (diseño featured con borde de color)"
        name="featured"
        defaultChecked={plan?.featured}
      />

      <TextField
        label="Orden de visualización"
        name="display_order"
        type="number"
        defaultValue={String(plan?.display_order ?? 0)}
        hint="Menor número = aparece primero dentro de su categoría."
      />

      <div className="flex items-center gap-4 pt-2">
        <SaveButton label={isEdit ? 'Guardar cambios' : 'Crear plan'} />
        <SaveStatus state={state} />
      </div>
    </form>
  )
}
