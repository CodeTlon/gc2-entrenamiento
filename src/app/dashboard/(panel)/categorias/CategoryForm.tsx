'use client'

import { useActionState } from 'react'
import {
  createCategoryAction,
  updateCategoryAction,
  type CategoryState,
} from '@/actions/categories'
import { TextField } from '@/components/dashboard/Field'
import { SaveButton, SaveStatus } from '@/components/dashboard/SaveButton'

interface Category {
  id: string
  name: string
  display_order: number
}

export default function CategoryForm({ category }: { category?: Category }) {
  const isEdit = !!category
  const action = isEdit
    ? updateCategoryAction.bind(null, category!.id)
    : createCategoryAction
  const [state, dispatch] = useActionState<CategoryState, FormData>(action, undefined)

  return (
    <form action={dispatch} className="space-y-5 max-w-md">
      <TextField
        label="Nombre"
        name="name"
        defaultValue={category?.name}
        required
        hint="El slug (URL) se genera automáticamente desde el nombre."
      />
      <TextField
        label="Orden de visualización"
        name="display_order"
        type="number"
        defaultValue={String(category?.display_order ?? 0)}
        hint="Número menor = aparece primero en el listado."
      />
      <div className="flex items-center gap-4 pt-2">
        <SaveButton label={isEdit ? 'Guardar cambios' : 'Crear categoría'} />
        <SaveStatus state={state} />
      </div>
    </form>
  )
}
