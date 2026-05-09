'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PER_PAGE = 8
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, PlayCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { parseYoutubeId } from '@/lib/youtube'

export interface Category {
  id: string
  name: string
  slug: string
}

export interface PostSummary {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  youtube_url: string | null
  created_at: string
  category_id: string | null
  categories: { name: string; slug: string } | null
  coaches: { name: string; photo_url: string | null } | null
}

function ArticleRow({ post }: { post: PostSummary }) {
  const ytId = parseYoutubeId(post.youtube_url)
  const thumb = post.cover_image ?? (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null)
  const hasMedia = !!thumb

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex gap-5 p-5 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.2)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'
      }}
    >
      {/* Media */}
      {hasMedia && (
        <div className="relative flex-shrink-0 w-36 sm:w-52 rounded-lg overflow-hidden"
          style={{ aspectRatio: '16/10' }}>
          <Image
            src={thumb!}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 144px, 208px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {ytId && !post.cover_image && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <PlayCircle size={36} className="text-white/80" />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={`flex flex-col justify-between min-w-0 flex-1 ${!hasMedia ? 'border-l-2 border-accent/30 pl-5' : ''}`}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <p className="text-accent text-[11px] font-body font-bold uppercase tracking-[2px]">
              {formatDate(post.created_at)}
            </p>
            {post.categories && (
              <span
                className="px-2 py-0.5 rounded text-[10px] font-body font-semibold uppercase tracking-wider text-blue-900"
                style={{ background: '#38BDF8' }}
              >
                {post.categories.name}
              </span>
            )}
          </div>
          <h2 className="font-heading font-bold text-white uppercase leading-tight mb-2 line-clamp-2"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-white/55 text-sm leading-relaxed line-clamp-2 hidden sm:block">
              {post.excerpt}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          {post.coaches ? (
            <div className="flex items-center gap-2">
              {post.coaches.photo_url && (
                <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                  <Image src={post.coaches.photo_url} alt={post.coaches.name} fill sizes="20px" className="object-cover" />
                </div>
              )}
              <span className="text-white/40 text-[11px] truncate">{post.coaches.name}</span>
            </div>
          ) : <span />}
          <span className="text-accent text-xs font-body font-bold uppercase tracking-widest group-hover:tracking-[3px] transition-all duration-300 flex-shrink-0">
            Leer artículo
          </span>
        </div>
      </div>
    </Link>
  )
}

function Sidebar({ posts, categories, activeCategory, setActiveCategory, search, setSearch }: {
  posts: PostSummary[]
  categories: Category[]
  activeCategory: string
  setActiveCategory: (v: string) => void
  search: string
  setSearch: (v: string) => void
}) {
  const recent = useMemo(() => posts.slice(0, 4), [posts])

  return (
    <aside className="space-y-8">
      {/* Search */}
      <div>
        <p className="section-label mb-3">Buscar</p>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            type="text"
            placeholder="Título o tema..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Categorías */}
      {categories.length > 0 && (
        <div>
          <p className="section-label mb-3">Categorías</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('')}
              className="px-3 py-1.5 rounded text-xs font-body font-semibold uppercase tracking-wider transition-all duration-200"
              style={{
                background: !activeCategory ? '#38BDF8' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${!activeCategory ? '#38BDF8' : 'rgba(255,255,255,0.1)'}`,
                color: !activeCategory ? '#0A1628' : 'rgba(255,255,255,0.6)',
              }}
            >
              Todos
            </button>
            {categories.map((cat) => {
              const active = activeCategory === cat.slug
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(active ? '' : cat.slug)}
                  className="px-3 py-1.5 rounded text-xs font-body font-semibold uppercase tracking-wider transition-all duration-200"
                  style={{
                    background: active ? '#38BDF8' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${active ? '#38BDF8' : 'rgba(255,255,255,0.1)'}`,
                    color: active ? '#0A1628' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent */}
      {recent.length > 0 && (
        <div>
          <p className="section-label mb-3">Recientes</p>
          <div className="space-y-4">
            {recent.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="flex gap-3 group"
              >
                {post.cover_image && (
                  <div className="relative flex-shrink-0 w-14 h-14 rounded overflow-hidden">
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      sizes="56px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white/80 text-xs leading-snug line-clamp-2 group-hover:text-accent transition-colors font-body">
                    {post.title}
                  </p>
                  <p className="text-white/35 text-[10px] mt-1">{formatDate(post.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

export default function BlogList({ posts, categories }: { posts: PostSummary[]; categories: Category[] }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = posts
    if (activeCategory) {
      result = result.filter((p) => p.categories?.slug === activeCategory)
    }
    const q = search.toLowerCase().trim()
    if (q) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt ?? '').toLowerCase().includes(q),
      )
    }
    return result
  }, [posts, search, activeCategory])

  // Reset to page 1 when filter changes
  useEffect(() => { setPage(1) }, [search, activeCategory])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const from = filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const to = Math.min(page * PER_PAGE, filtered.length)

  return (
    <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
      {/* Articles */}
      <div className="flex-1 min-w-0">
        {/* Mobile search bar */}
        <div className="lg:hidden mb-6">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field-input pl-9 pr-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {/* Mobile category tags */}
          {categories.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveCategory('')}
                className="flex-shrink-0 px-3 py-1.5 rounded text-xs font-body font-semibold uppercase tracking-wider transition-all duration-200"
                style={{
                  background: !activeCategory ? '#38BDF8' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${!activeCategory ? '#38BDF8' : 'rgba(255,255,255,0.1)'}`,
                  color: !activeCategory ? '#0A1628' : 'rgba(255,255,255,0.6)',
                }}
              >
                Todos
              </button>
              {categories.map((cat) => {
                const active = activeCategory === cat.slug
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(active ? '' : cat.slug)}
                    className="flex-shrink-0 px-3 py-1.5 rounded text-xs font-body font-semibold uppercase tracking-wider transition-all duration-200"
                    style={{
                      background: active ? '#38BDF8' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${active ? '#38BDF8' : 'rgba(255,255,255,0.1)'}`,
                      color: active ? '#0A1628' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-white/40 text-sm">No se encontraron artículos{search ? ` para "${search}"` : ''}.</p>
            {search && (
              <button onClick={() => setSearch('')} className="text-accent text-xs mt-2 hover:underline">
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Contador */}
            {filtered.length > PER_PAGE && (
              <p className="text-white/30 text-xs mb-4">
                Mostrando {from}–{to} de {filtered.length} artículos
              </p>
            )}

            <div className="space-y-4">
              {paginated.map((post) => (
                <ArticleRow key={post.id} post={post} />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onChange={(p) => {
                setPage(p)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }} />
            )}
          </>
        )}
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24">
          <Sidebar
            posts={posts}
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            search={search}
            setSearch={setSearch}
          />
        </div>
      </div>
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  const pages = buildPages(page, totalPages)

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ background: '#0D2247', border: '1px solid #102E66' }}
      >
        <ChevronLeft size={16} className="text-white/70" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-white/30 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-body font-semibold transition-all"
            style={{
              background: p === page ? '#38BDF8' : '#0D2247',
              border: `1px solid ${p === page ? '#38BDF8' : '#102E66'}`,
              color: p === page ? '#0A1628' : 'rgba(255,255,255,0.6)',
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ background: '#0D2247', border: '1px solid #102E66' }}
      >
        <ChevronRight size={16} className="text-white/70" />
      </button>
    </div>
  )
}

function buildPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
