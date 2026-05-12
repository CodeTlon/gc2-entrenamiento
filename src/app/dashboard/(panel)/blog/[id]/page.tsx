import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import DeleteButton from '@/components/dashboard/DeleteButton'
import PostForm from '../PostForm'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { deletePostAction } from '@/actions/posts'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const [{ data, error }, { data: cats }, { data: coaches }, { data: postCats }] = await Promise.all([
    supabase.from('posts').select('*').eq('id', id).single(),
    supabase.from('categories').select('id, name').order('display_order', { ascending: true }),
    supabase.from('coaches').select('id, name, specialty').order('display_order', { ascending: true }),
    supabase.from('post_categories').select('category_id').eq('post_id', id),
  ])
  if (error || !data) notFound()

  const postCategoryIds = postCats?.map((r) => r.category_id) ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Blog"
        title={data.title}
        back={{ href: '/dashboard/blog', label: 'Volver al blog' }}
        actions={
          <div className="flex items-center gap-2">
            {data.published && (
              <Link
                href={`/blog/${data.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-white/65 hover:text-accent transition-colors"
                style={{ border: '1px solid #102E66' }}
              >
                <ExternalLink size={14} /> Ver post
              </Link>
            )}
            <DeleteButton
              action={deletePostAction}
              id={data.id}
              confirmText={`¿Eliminar "${data.title}"? No se puede deshacer.`}
            />
          </div>
        }
      />
      <PostForm
        post={data}
        categories={cats ?? []}
        coaches={coaches ?? []}
        postCategoryIds={postCategoryIds}
      />
    </div>
  )
}
