import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { youtubeEmbedUrl } from '@/lib/youtube'
import type { Coach } from '@/lib/content'
import { focalImageProps } from '@/lib/image-focal'
import { sanitizeHtml } from '@/lib/sanitize'
import AuthorCard from './AuthorCard'
import '../blog.css'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  youtube_url: string | null
  created_at: string
  post_authors: { coaches: Coach | null }[]
}

async function getPost(slug: string): Promise<Post | null> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, content, cover_image, youtube_url, created_at, post_authors(coaches(*))')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) return null
  return data as unknown as Post
}

async function getAllSlugs(): Promise<{ slug: string }[]> {
  const supabase = createSupabaseClient()
  const { data } = await supabase
    .from('posts')
    .select('slug')
    .eq('published', true)
  return data ?? []
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllSlugs()
    return slugs.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image ? [{ url: post.cover_image }] : [],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const ytEmbed = youtubeEmbedUrl(post.youtube_url)
  const authors = post.post_authors.map((pa) => pa.coaches).filter((c): c is Coach => c !== null)

  return (
    <>
      {/* Hero */}
      {post.cover_image && (() => {
        const fp = focalImageProps(post.cover_image)
        return (
        <section className="relative overflow-hidden" style={{ height: '60vh', minHeight: '400px' }}>
          <Image
            src={fp.src}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            style={fp.style}
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(10,22,40,0.72) 0%, rgba(10,22,40,0.82) 50%, rgba(10,22,40,0.97) 100%)' }}
          />
          <div className="absolute bottom-0 left-0 right-0 pb-12">
            <div className="container">
              <p className="text-accent text-sm font-semibold uppercase tracking-wider mb-3">
                {formatDate(post.created_at)}
              </p>
              <h1 className="section-title text-white max-w-3xl">{post.title}</h1>
            </div>
          </div>
        </section>
        )
      })()}

      {/* Content */}
      <section className="py-section bg-blue-900">
        <div className="container max-w-3xl">
          {!post.cover_image && (
            <div className="pt-20 mb-10">
              <p className="text-accent text-sm font-semibold uppercase tracking-wider mb-3">
                {formatDate(post.created_at)}
              </p>
              <h1 className="section-title text-white">{post.title}</h1>
            </div>
          )}

          {post.excerpt && (
            <p className="text-white/70 text-xl leading-relaxed mb-10 border-l-4 border-accent pl-6">
              {post.excerpt}
            </p>
          )}

          {ytEmbed && (
            <div
              className="relative w-full mb-10 rounded-xl overflow-hidden"
              style={{ paddingBottom: '56.25%', background: '#000' }}
            >
              <iframe
                src={ytEmbed}
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 w-full h-full"
              />
            </div>
          )}

          <div
            className="prose-gc2 text-white/80 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            style={{
              ['--tw-prose-a' as string]: '#38BDF8',
            }}
          />

          {authors.length > 0 && (
            <div className="mt-12">
              <p className="text-accent text-[10px] font-body font-bold uppercase tracking-[2px] mb-3">
                {authors.length === 1 ? 'Escrito por' : 'Escrito por'}
              </p>
              <div className="space-y-3">
                {authors.map((author) => (
                  <AuthorCard key={author.id} coach={author} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-accent hover:text-white transition-colors font-semibold"
            >
              <ArrowLeft size={18} />
              Volver al Blog
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
