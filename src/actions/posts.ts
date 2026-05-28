'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import slugify from 'slugify'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export type PostState = { ok?: boolean; error?: string } | undefined

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado.')
  return { supabase, user }
}

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

function parseForm(formData: FormData) {
  const rawYt = String(formData.get('youtube_url') ?? '') || null
  return {
    title: String(formData.get('title') ?? '').trim(),
    excerpt: String(formData.get('excerpt') ?? '').trim() || null,
    content: String(formData.get('content') ?? ''),
    cover_image: String(formData.get('cover_image') ?? '') || null,
    youtube_url: validateYoutubeUrl(rawYt),
    published: formData.get('published') === 'on',
    category_ids: formData.getAll('category_ids').map(String).filter(Boolean),
    coach_ids: formData.getAll('coach_ids').map(String).filter(Boolean),
  }
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof requireUser>>['supabase'], base: string, excludeId?: string) {
  let slug = base
  let n = 2
  while (true) {
    const q = supabase.from('posts').select('id').eq('slug', slug).limit(1)
    const { data } = await q
    if (!data || data.length === 0) return slug
    if (excludeId && data[0].id === excludeId) return slug
    slug = `${base}-${n++}`
  }
}

export async function createPostAction(_prev: PostState, formData: FormData): Promise<PostState> {
  try {
    const { supabase, user } = await requireUser()
    const { category_ids, coach_ids, ...data } = parseForm(formData)
    if (!data.title) return { error: 'El título es obligatorio.' }

    const baseSlug = slugify(data.title, { lower: true, strict: true })
    const slug = await uniqueSlug(supabase, baseSlug)

    const { data: inserted, error } = await supabase
      .from('posts')
      .insert({ ...data, slug, author_id: user.id })
      .select('id')
      .single()
    if (error) return { error: error.message }

    if (category_ids.length > 0) {
      await supabase.from('post_categories').insert(
        category_ids.map((cid) => ({ post_id: inserted.id, category_id: cid }))
      )
    }

    if (coach_ids.length > 0) {
      await supabase.from('post_authors').insert(
        coach_ids.map((cid) => ({ post_id: inserted.id, coach_id: cid }))
      )
    }

    revalidatePath('/blog')
    revalidatePath(`/blog/${slug}`)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
  redirect('/dashboard/blog')
}

export async function updatePostAction(
  id: string,
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  try {
    const { supabase } = await requireUser()
    const { category_ids, coach_ids, ...data } = parseForm(formData)
    if (!data.title) return { error: 'El título es obligatorio.' }

    const { data: existing } = await supabase.from('posts').select('slug, title').eq('id', id).single()
    let slug = existing?.slug
    if (existing && existing.title !== data.title) {
      const baseSlug = slugify(data.title, { lower: true, strict: true })
      slug = await uniqueSlug(supabase, baseSlug, id)
    }

    const { error } = await supabase
      .from('posts')
      .update({ ...data, slug, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { error: error.message }

    await supabase.from('post_categories').delete().eq('post_id', id)
    if (category_ids.length > 0) {
      await supabase.from('post_categories').insert(
        category_ids.map((cid) => ({ post_id: id, category_id: cid }))
      )
    }

    await supabase.from('post_authors').delete().eq('post_id', id)
    if (coach_ids.length > 0) {
      await supabase.from('post_authors').insert(
        coach_ids.map((cid) => ({ post_id: id, coach_id: cid }))
      )
    }

    revalidatePath('/blog')
    if (slug) revalidatePath(`/blog/${slug}`)
    return { ok: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

export async function deletePostAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const { supabase } = await requireUser()
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/blog')
  redirect('/dashboard/blog')
}
