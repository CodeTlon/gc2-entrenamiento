import PageHeader from '@/components/dashboard/PageHeader'
import PostForm from '../PostForm'
import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { categories, coaches } from '@/db/schema'

export default async function NewPostPage() {
  const [cats, coachList] = await Promise.all([
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.display_order)),
    db
      .select({ id: coaches.id, name: coaches.name, specialty: coaches.specialty })
      .from(coaches)
      .orderBy(asc(coaches.display_order)),
  ])

  return (
    <div>
      <PageHeader
        eyebrow="Blog"
        title="Nuevo post"
        back={{ href: '/dashboard/blog', label: 'Volver al blog' }}
      />
      <PostForm categories={cats} coaches={coachList} postCategoryIds={[]} />
    </div>
  )
}
