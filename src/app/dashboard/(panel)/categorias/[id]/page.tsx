import { notFound } from 'next/navigation'
import PageHeader from '@/components/dashboard/PageHeader'
import DeleteButton from '@/components/dashboard/DeleteButton'
import CategoryForm from '../CategoryForm'
import { eq, ne } from 'drizzle-orm'
import { db } from '@/lib/db'
import { categories } from '@/db/schema'
import { isUuid } from '@/db/queries'
import { deleteCategoryAction } from '@/actions/categories'

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) notFound()
  const [[data], others] = await Promise.all([
    db
      .select({ id: categories.id, name: categories.name, slug: categories.slug, display_order: categories.display_order })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1),
    db.select({ display_order: categories.display_order }).from(categories).where(ne(categories.id, id)),
  ])
  if (!data) notFound()
  const takenOrders = others.map((c) => c.display_order)

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
