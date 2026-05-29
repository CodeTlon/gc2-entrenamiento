import PageHeader from '@/components/dashboard/PageHeader'
import CategoryForm from '../CategoryForm'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function NewCategoryPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.from('categories').select('display_order')
  const takenOrders = data?.map((c) => c.display_order) ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Categorías"
        title="Nueva categoría"
        back={{ href: '/dashboard/categorias', label: 'Volver a categorías' }}
      />
      <CategoryForm takenOrders={takenOrders} />
    </div>
  )
}
