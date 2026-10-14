'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/session'
import { errorMessage } from '@/lib/errors'
import { liberarArchivos } from '@/lib/media-cleanup'
import { posts, postCategories, postAuthors } from '@/db/schema'

export type PostState = { ok?: boolean; error?: string } | undefined

const YT_PATTERNS = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/i,
  /(?:youtu\.be\/)([\w-]{11})/i,
  /(?:youtube\.com\/embed\/)([\w-]{11})/i,
  /(?:youtube\.com\/shorts\/)([\w-]{11})/i,
  /(?:youtube\.com\/v\/)([\w-]{11})/i,
]

function validateYoutubeUrl(url: string | null): string | null {
  if (!url) return null
  for (const re of YT_PATTERNS) {
    if (re.test(url)) return url
  }
  if (/^[\w-]{11}$/.test(url)) return url
  return null
}

// Solo https:// (o ruta propia /...): evita javascript: y data: en href/src guardados por el panel.
function safeUrl(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? '').trim()
  if (!s) return null
  return /^(https:\/\/|\/(?!\/))/i.test(s) ? s : null
}

function parseForm(formData: FormData) {
  const rawYt = String(formData.get('youtube_url') ?? '') || null
  return {
    title: String(formData.get('title') ?? '').trim(),
    excerpt: String(formData.get('excerpt') ?? '').trim() || null,
    content: String(formData.get('content') ?? ''),
    cover_image: safeUrl(formData.get('cover_image')),
    youtube_url: validateYoutubeUrl(rawYt),
    attachment_url: safeUrl(formData.get('attachment_url')),
    video_url: safeUrl(formData.get('video_url')),
    published: formData.get('published') === 'on',
    category_ids: formData.getAll('category_ids').map(String).filter(Boolean),
    coach_ids: formData.getAll('coach_ids').map(String).filter(Boolean),
  }
}

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base
  let n = 2
  while (true) {
    const [row] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).limit(1)
    if (!row) return slug
    if (excludeId && row.id === excludeId) return slug
    slug = `${base}-${n++}`
  }
}

export async function createPostAction(_prev: PostState, formData: FormData): Promise<PostState> {
  try {
    await requireUser()
    const { category_ids, coach_ids, ...data } = parseForm(formData)
    if (!data.title) return { error: 'El título es obligatorio.' }

    const baseSlug = slugify(data.title, { lower: true, strict: true })
    const slug = await uniqueSlug(baseSlug)

    await db.transaction(async (tx) => {
      // author_id era un uuid de Supabase Auth; con Better Auth (id texto) queda null.
      const [inserted] = await tx.insert(posts).values({ ...data, slug }).returning({ id: posts.id })
      if (category_ids.length > 0) {
        await tx.insert(postCategories).values(category_ids.map((cid) => ({ post_id: inserted.id, category_id: cid })))
      }
      if (coach_ids.length > 0) {
        await tx.insert(postAuthors).values(coach_ids.map((cid) => ({ post_id: inserted.id, coach_id: cid })))
      }
    })

    revalidatePath('/blog')
    revalidatePath(`/blog/${slug}`)
  } catch (e) {
    return { error: errorMessage(e) }
  }
  redirect('/dashboard/blog?saved=1')
}

export async function updatePostAction(
  id: string,
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  try {
    await requireUser()
    const { category_ids, coach_ids, ...data } = parseForm(formData)
    if (!data.title) return { error: 'El título es obligatorio.' }

    const [existing] = await db
      .select({ slug: posts.slug, title: posts.title, content: posts.content, cover_image: posts.cover_image, video_url: posts.video_url, attachment_url: posts.attachment_url })
      .from(posts).where(eq(posts.id, id)).limit(1)
    if (!existing) return { error: 'El artículo no existe.' }
    let slug = existing.slug
    if (existing.title !== data.title) {
      const baseSlug = slugify(data.title, { lower: true, strict: true })
      slug = await uniqueSlug(baseSlug, id)
    }

    await db.transaction(async (tx) => {
      await tx.update(posts).set({ ...data, slug, updated_at: new Date().toISOString() }).where(eq(posts.id, id))

      await tx.delete(postCategories).where(eq(postCategories.post_id, id))
      if (category_ids.length > 0) {
        await tx.insert(postCategories).values(category_ids.map((cid) => ({ post_id: id, category_id: cid })))
      }

      await tx.delete(postAuthors).where(eq(postAuthors.post_id, id))
      if (coach_ids.length > 0) {
        await tx.insert(postAuthors).values(coach_ids.map((cid) => ({ post_id: id, coach_id: cid })))
      }
    })

    await liberarArchivos(existing.content, existing.cover_image, existing.video_url, existing.attachment_url)
    revalidatePath('/blog')
    if (slug) revalidatePath(`/blog/${slug}`)
  } catch (e) {
    return { error: errorMessage(e) }
  }
  redirect('/dashboard/blog?saved=1')
}

export async function deletePostAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await requireUser()
  const [antes] = await db
    .select({ content: posts.content, cover_image: posts.cover_image, video_url: posts.video_url, attachment_url: posts.attachment_url })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)
  await db.delete(posts).where(eq(posts.id, id))
  if (antes) await liberarArchivos(antes.content, antes.cover_image, antes.video_url, antes.attachment_url)
  revalidatePath('/blog')
  redirect('/dashboard/blog')
}
