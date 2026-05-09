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

function parseForm(formData: FormData) {
  return {
    title: String(formData.get('title') ?? '').trim(),
    excerpt: String(formData.get('excerpt') ?? '') || null,
    content: String(formData.get('content') ?? ''),
    cover_image: String(formData.get('cover_image') ?? '') || null,
    youtube_url: String(formData.get('youtube_url') ?? '') || null,
    category_id: String(formData.get('category_id') ?? '') || null,
    coach_id: String(formData.get('coach_id') ?? '') || null,
    published: formData.get('published') === 'on',
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
    const data = parseForm(formData)
    if (!data.title) return { error: 'El título es obligatorio.' }

    const baseSlug = slugify(data.title, { lower: true, strict: true })
    const slug = await uniqueSlug(supabase, baseSlug)
    const { error } = await supabase.from('posts').insert({ ...data, slug, author_id: user.id })
    if (error) return { error: error.message }

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
    const data = parseForm(formData)
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
  await supabase.from('posts').delete().eq('id', id)
  revalidatePath('/blog')
  redirect('/dashboard/blog')
}
