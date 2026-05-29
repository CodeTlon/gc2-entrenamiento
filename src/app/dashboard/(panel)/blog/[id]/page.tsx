import { notFound } from 'next/navigation'
import PageHeader from '@/components/dashboard/PageHeader'
import DeleteButton from '@/components/dashboard/DeleteButton'
import PostForm from '../PostForm'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { deletePostAction } from '@/actions/posts'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const [{ data, error }, { data: cats }, { data: coaches }, { data: postCats }, { data: postAuthors }] = await Promise.all([
    supabase.from('posts').select('*').eq('id', id).single(),
    supabase.from('categories').select('id, name').order('display_order', { ascending: true }),
    supabase.from('coaches').select('id, name, specialty').order('display_order', { ascending: true }),
    supabase.from('post_categories').select('category_id').eq('post_id', id),
    supabase.from('post_authors').select('coach_id').eq('post_id', id),
  ])
  if (error || !data) notFound()

  const postCategoryIds = postCats?.map((r) => r.category_id) ?? []
  const postCoachIds = postAuthors?.map((r) => r.coach_id) ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Blog"
        title={data.title}
        back={{ href: '/dashboard/blog', label: 'Volver al blog' }}
        actions={
          <DeleteButton
            action={deletePostAction}
            id={data.id}
            confirmText={`¿Eliminar "${data.title}"? No se puede deshacer.`}
          />
        }
      />
      <PostForm
        post={data}
        categories={cats ?? []}
        coaches={coaches ?? []}
        postCategoryIds={postCategoryIds}
        postCoachIds={postCoachIds}
      />
    </div>
  )
}
