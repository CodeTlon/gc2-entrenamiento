'use client'

import { useActionState } from 'react'
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

export default function PlanCategoryForm({ category }: { category?: PlanCategory }) {
  const isEdit = !!category
  const action = isEdit
    ? updatePlanCategoryAction.bind(null, category!.id)
    : createPlanCategoryAction
  const [state, dispatch] = useActionState<PlanCategoryState, FormData>(action, undefined)

  return (
    <form action={dispatch} className="space-y-5 max-w-md">
      <TextField
        label="Nombre"
        name="name"
        defaultValue={category?.name}
        required
        hint="Ej: Corredores, Triatletas, Grupales. El slug se genera automático."
      />
      <TextField
        label="Orden de visualización"
        name="display_order"
        type="number"
        defaultValue={String(category?.display_order ?? 0)}
        hint="Número menor = aparece primero."
      />
      <div className="flex items-center gap-4 pt-2">
        <SaveButton label={isEdit ? 'Guardar cambios' : 'Crear categoría'} />
        <SaveStatus state={state} />
      </div>
    </form>
  )
}
