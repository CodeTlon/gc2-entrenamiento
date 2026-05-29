'use client'

import { useActionState, useState } from 'react'
import {
  createPlanCategoryAction,
  updatePlanCategoryAction,
  type PlanCategoryState,
} from '@/actions/plan-categories'
import { TextField } from '@/components/dashboard/Field'
import { SaveButton, SaveStatus } from '@/components/dashboard/SaveButton'

interface PlanCategory {
  id: string
  name: string
  display_order: number
}

export default function PlanCategoryForm({
  category,
  takenOrders = [],
}: {
  category?: PlanCategory
  takenOrders?: number[]
}) {
  const isEdit = !!category
  const action = isEdit
    ? updatePlanCategoryAction.bind(null, category!.id)
    : createPlanCategoryAction
  const [state, dispatch] = useActionState<PlanCategoryState, FormData>(action, undefined)
  const [order, setOrder] = useState(String(category?.display_order ?? 0))
  const isDuplicate = takenOrders.includes(Number(order))

  return (
    <form action={dispatch} className="space-y-5 max-w-md">
      <TextField
        label="Nombre"
        name="name"
        defaultValue={category?.name}
        required
        hint="Ej: Corredores, Triatletas, Grupales. El slug se genera automático."
      />
      <div>
        <label className="field-label">Orden de visualización</label>
        <input
          type="number"
          name="display_order"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="field-input"
          style={isDuplicate ? { borderColor: 'rgba(239,68,68,0.5)' } : undefined}
        />
        {isDuplicate ? (
          <p className="text-red-400 text-xs mt-1.5">
            Este número ya está en uso por otra categoría. Elegí uno diferente.
          </p>
        ) : (
          <p className="text-white/35 text-xs mt-1.5">Número menor = aparece primero.</p>
        )}
      </div>
      <div className="flex items-center gap-4 pt-2">
        <SaveButton label={isEdit ? 'Guardar cambios' : 'Crear categoría'} />
        <SaveStatus state={state} />
      </div>
    </form>
  )
}
