import { notFound } from 'next/navigation'
import PageHeader from '@/components/dashboard/PageHeader'
import DeleteButton from '@/components/dashboard/DeleteButton'
import CategoryForm from '../CategoryForm'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { deleteCategoryAction } from '@/actions/categories'

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const [{ data, error }, { data: others }] = await Promise.all([
    supabase.from('categories').select('id, name, slug, display_order').eq('id', id).single(),
    supabase.from('categories').select('display_order').neq('id', id),
  ])
  if (error || !data) notFound()
  const takenOrders = others?.map((c) => c.display_order) ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Categorías"
        title={data.name}
        back={{ href: '/dashboard/categorias', label: 'Volver a categorías' }}
        actions={
          <DeleteButton
            action={deleteCategoryAction}
            id={data.id}
            confirmText={`¿Eliminar la categoría "${data.name}"? Los posts vinculados quedarán sin categoría.`}
          />
        }
      />
      <CategoryForm category={data} takenOrders={takenOrders} />
    </div>
  )
}
