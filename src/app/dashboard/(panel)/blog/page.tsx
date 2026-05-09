import Link from 'next/link'
import Image from 'next/image'
import { Plus, Eye, EyeOff, Youtube } from 'lucide-react'
import PageHeader from '@/components/dashboard/PageHeader'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { formatDate } from '@/lib/utils'

interface PostRow {
  id: string
  title: string
  slug: string
  cover_image: string | null
  youtube_url: string | null
  published: boolean
  created_at: string
}

export default async function BlogListPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, cover_image, youtube_url, published, created_at')
    .order('created_at', { ascending: false })

  const posts = (data ?? []) as PostRow[]

  return (
    <div>
      <PageHeader
        eyebrow="Blog"
        title="Posts"
        description="Publicaciones del blog. Las que tienen 'borrador' no se ven en el sitio."
        actions={
          <Link href="/dashboard/blog/nuevo" className="btn btn--primary text-sm">
            <Plus size={14} /> Nuevo post
          </Link>
        }
      />

      {posts.length === 0 ? (
        <p className="text-white/45 text-sm">Todavía no hay posts.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/blog/${p.id}`}
              className="rounded-xl flex hover:-translate-y-0.5 transition-all overflow-hidden"
              style={{ background: '#0D2247', border: '1px solid #102E66' }}
            >
              <div
                className="relative w-32 flex-shrink-0 hidden sm:block"
                style={{ background: '#102E66' }}
              >
                {p.cover_image ? (
                  <Image
                    src={p.cover_image}
                    alt={p.title}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex-1 p-4 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  {p.published ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-body font-bold uppercase tracking-wider text-green-300">
                      <Eye size={11} /> Publicado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-body font-bold uppercase tracking-wider text-white/40">
                      <EyeOff size={11} /> Borrador
                    </span>
                  )}
                  {p.youtube_url && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-red-300">
                      <Youtube size={12} /> Video
                    </span>
                  )}
                  <span className="text-white/35 text-[11px] ml-auto">{formatDate(p.created_at)}</span>
                </div>
                <h3 className="font-heading font-bold text-white text-base uppercase tracking-wide line-clamp-2">
                  {p.title}
                </h3>
                <p className="text-white/40 text-xs mt-1">/{p.slug}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
