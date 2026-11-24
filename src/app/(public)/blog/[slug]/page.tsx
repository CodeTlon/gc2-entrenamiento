import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { youtubeEmbedUrl } from '@/lib/youtube'
import type { Coach } from '@/lib/content'
import { focalImageProps } from '@/lib/image-focal'
import { sanitizeHtml } from '@/lib/sanitize'
import TLDRBox from '@/components/ui/TLDRBox'
import ShareButton from '@/components/ui/ShareButton'
import AuthorCard from './AuthorCard'
import '../blog.css'

export const revalidate = 3600

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  youtube_url: string | null
  attachment_url: string | null
  video_url: string | null
  created_at: string
  post_authors: { coaches: Coach | null }[]
}

interface RelatedPost {
  title: string
  slug: string
  cover_image: string | null
}

async function getPost(slug: string): Promise<Post | null> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, content, cover_image, youtube_url, attachment_url, video_url, created_at, post_authors(coaches(*))')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) return null
  return data as unknown as Post
}

async function getRelatedPosts(currentSlug: string): Promise<RelatedPost[]> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('posts')
    .select('title, slug, cover_image')
    .eq('published', true)
    .neq('slug', currentSlug)
    .order('created_at', { ascending: false })
    .limit(3)

  if (error || !data) return []
  return data as RelatedPost[]
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
    alternates: { canonical: `/blog/${slug}` },
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
  const related = await getRelatedPosts(post.slug)
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
            <TLDRBox className="mb-8">
              <p>{post.excerpt}</p>
            </TLDRBox>
          )}

          {/* CTA justo después de la intro */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 rounded-xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-white/70 text-sm text-center sm:text-left">
              ¿Querés un plan de entrenamiento hecho a tu medida?
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <Link href="/planes" className="btn btn--primary text-xs uppercase tracking-widest font-extrabold">
                Ver Planes
              </Link>
              <Link href="/contacto" className="btn btn--outline text-xs uppercase tracking-widest font-extrabold">
                Contacto
              </Link>
            </div>
          </div>

          {ytEmbed ? (
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
          ) : post.video_url ? (
            <video
              src={post.video_url}
              controls
              className="w-full mb-10 rounded-xl"
              style={{ background: '#000' }}
            />
          ) : null}

          <div
            className="prose-gc2 text-white/80 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            style={{
              ['--tw-prose-a' as string]: '#38BDF8',
            }}
          />

          {post.attachment_url && (
            <a
              href={post.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 mt-8 px-4 py-3 rounded-md text-sm font-semibold text-accent transition-all hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.3)' }}
            >
              <FileText size={18} />
              Descargar PDF
            </a>
          )}

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

          <div
            className="mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-accent hover:text-white active:scale-[0.98] transition-all font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded"
            >
              <ArrowLeft size={18} />
              Volver al Blog
            </Link>
            <ShareButton title={post.title} text={post.excerpt ?? undefined} />
          </div>

          {/* Posts relacionados */}
          {related.length > 0 && (
            <div className="mt-14 pt-10" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-accent text-[11px] font-body font-bold uppercase tracking-[2.5px] mb-5">
                Te puede interesar también
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="group rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                    style={{ background: '#0D2247', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="relative w-full aspect-video overflow-hidden">
                      {r.cover_image ? (() => {
                        const fp = focalImageProps(r.cover_image)
                        return (
                          <Image
                            src={fp.src}
                            alt={r.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 33vw"
                            style={fp.style}
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )
                      })() : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: '#0A1628' }}>
                          <span className="text-white/10 text-2xl font-heading font-black">GC²</span>
                        </div>
                      )}
                    </div>
                    <p className="p-4 text-sm font-heading font-bold text-white uppercase leading-tight line-clamp-2 group-hover:text-accent transition-colors">
                      {r.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
