import { notFound } from 'next/navigation'
import { Instagram } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import DeleteButton from '@/components/dashboard/DeleteButton'
import PostForm from '../PostForm'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { categories, coaches, posts, postCategories, postAuthors } from '@/db/schema'
import { isUuid } from '@/db/queries'
import { deletePostAction } from '@/actions/posts'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isUuid(id)) notFound()
  const [[data], cats, coachList, postCats, postAuthorRows] = await Promise.all([
    db.select().from(posts).where(eq(posts.id, id)).limit(1),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.display_order)),
    db
      .select({ id: coaches.id, name: coaches.name, specialty: coaches.specialty })
      .from(coaches)
      .orderBy(asc(coaches.display_order)),
    db.select({ category_id: postCategories.category_id }).from(postCategories).where(eq(postCategories.post_id, id)),
    db.select({ coach_id: postAuthors.coach_id }).from(postAuthors).where(eq(postAuthors.post_id, id)),
  ])
  if (!data) notFound()

  const postCategoryIds = postCats.map((r) => r.category_id)
  const postCoachIds = postAuthorRows.map((r) => r.coach_id)

  return (
    <div>
      <PageHeader
        eyebrow="Blog"
        title={data.title}
        back={{ href: '/dashboard/blog', label: 'Volver al blog' }}
        actions={
          <>
            <a
              href={`/dashboard/blog/${data.id}/story`}
              download={`story-${data.slug}.png`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-accent hover:text-white transition-colors"
              style={{ border: '1px solid rgba(56,189,248,0.3)' }}
            >
              <Instagram size={14} />
              Exportar a Instagram
            </a>
            <DeleteButton
              action={deletePostAction}
              id={data.id}
              confirmText={`¿Eliminar "${data.title}"? No se puede deshacer.`}
            />
          </>
        }
      />
      <PostForm
        post={data}
        categories={cats}
        coaches={coachList}
        postCategoryIds={postCategoryIds}
        postCoachIds={postCoachIds}
      />
    </div>
  )
}
