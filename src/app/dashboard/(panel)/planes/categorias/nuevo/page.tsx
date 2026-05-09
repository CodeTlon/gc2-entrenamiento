import PageHeader from '@/components/dashboard/PageHeader'
import PlanCategoryForm from '../PlanCategoryForm'

export default function NewPlanCategoryPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Categorías de planes"
        title="Nueva categoría"
        back={{ href: '/dashboard/planes/categorias', label: 'Volver a categorías' }}
      />
      <PlanCategoryForm />
    </div>
  )
}
