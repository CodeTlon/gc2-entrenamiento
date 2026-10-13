import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { categories, coaches, postAuthors, postCategories, posts } from '@/db/schema'

// Reemplazo de las relaciones embebidas de PostgREST (post_categories(categories(...)),
// post_authors(coaches(...))). Devuelve la misma forma que ya consumen BlogList y la página
// de detalle, así los componentes no cambian.

/** Listado público de posts publicados con sus categorías y autores (forma de PostSummary). */
export async function listPublishedPostSummaries() {
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      cover_image: posts.cover_image,
      youtube_url: posts.youtube_url,
      created_at: posts.created_at,
    })
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.created_at))
  if (rows.length === 0) return []

  const ids = rows.map((r) => r.id)
  const [cats, authors] = await Promise.all([
    db
      .select({
        post_id: postCategories.post_id,
        category_id: postCategories.category_id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(postCategories)
      .leftJoin(categories, eq(categories.id, postCategories.category_id))
      .where(inArray(postCategories.post_id, ids)),
    db
      .select({ post_id: postAuthors.post_id, name: coaches.name, photo_url: coaches.photo_url })
      .from(postAuthors)
      .leftJoin(coaches, eq(coaches.id, postAuthors.coach_id))
      .where(inArray(postAuthors.post_id, ids)),
  ])

  return rows.map((r) => ({
    ...r,
    post_categories: cats
      .filter((c) => c.post_id === r.id)
      .map((c) => ({
        category_id: c.category_id,
        categories: c.name !== null && c.slug !== null ? { name: c.name, slug: c.slug } : null,
      })),
    post_authors: authors
      .filter((a) => a.post_id === r.id)
      .map((a) => ({ coaches: a.name !== null ? { name: a.name, photo_url: a.photo_url } : null })),
  }))
}

/** Post publicado por slug con todos sus autores (coaches completos). null si no existe. */
export async function getPublishedPostBySlug(slug: string) {
  const [post] = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      content: posts.content,
      cover_image: posts.cover_image,
      youtube_url: posts.youtube_url,
      attachment_url: posts.attachment_url,
      video_url: posts.video_url,
      created_at: posts.created_at,
    })
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.published, true)))
    .limit(1)
  if (!post) return null

  const authors = await db
    .select({ coach: coaches })
    .from(postAuthors)
    .innerJoin(coaches, eq(coaches.id, postAuthors.coach_id))
    .where(eq(postAuthors.post_id, post.id))
    .orderBy(asc(coaches.display_order))

  return { ...post, post_authors: authors.map((a) => ({ coaches: a.coach })) }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/** Postgres lanza error con un uuid mal formado; las páginas [id] lo tratan como 404. */
export const isUuid = (v: string) => UUID_RE.test(v)
