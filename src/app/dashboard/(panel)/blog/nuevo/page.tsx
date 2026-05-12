import PageHeader from '@/components/dashboard/PageHeader'
import PostForm from '../PostForm'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function NewPostPage() {
  const supabase = await createSupabaseServerClient()
  const [{ data: cats }, { data: coaches }] = await Promise.all([
    supabase.from('categories').select('id, name').order('display_order', { ascending: true }),
    supabase.from('coaches').select('id, name, specialty').order('display_order', { ascending: true }),
  ])

  return (
    <div>
      <PageHeader
        eyebrow="Blog"
        title="Nuevo post"
        back={{ href: '/dashboard/blog', label: 'Volver al blog' }}
      />
      <PostForm categories={cats ?? []} coaches={coaches ?? []} postCategoryIds={[]} />
    </div>
  )
}
