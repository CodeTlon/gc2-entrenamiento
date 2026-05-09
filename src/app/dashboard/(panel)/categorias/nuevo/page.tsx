import PageHeader from '@/components/dashboard/PageHeader'
import CategoryForm from '../CategoryForm'

export default function NewCategoryPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Categorías"
        title="Nueva categoría"
        back={{ href: '/dashboard/categorias', label: 'Volver a categorías' }}
      />
      <CategoryForm />
    </div>
  )
}
