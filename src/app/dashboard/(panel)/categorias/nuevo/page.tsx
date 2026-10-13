import PageHeader from '@/components/dashboard/PageHeader'
import CategoryForm from '../CategoryForm'
import { db } from '@/lib/db'
import { categories } from '@/db/schema'

export default async function NewCategoryPage() {
  const data = await db.select({ display_order: categories.display_order }).from(categories)
  const takenOrders = data.map((c) => c.display_order)

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
