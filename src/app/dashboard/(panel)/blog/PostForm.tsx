'use client'

import { useActionState, useState } from 'react'
import { createPostAction, updatePostAction, type PostState } from '@/actions/posts'
import { TextField, TextArea, ImageUpload, Checkbox } from '@/components/dashboard/Field'
import { SaveButton, SaveStatus } from '@/components/dashboard/SaveButton'
import { uploadMediaAction } from '@/actions/settings'
import { Upload, Loader2, Youtube as YoutubeIcon, Link as LinkIcon, X } from 'lucide-react'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  youtube_url: string | null
  category_id: string | null
  coach_id: string | null
  published: boolean
}

interface Category {
  id: string
  name: string
}

interface Coach {
  id: string
  name: string
  specialty: string
}

const PATTERNS = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/i,
  /(?:youtu\.be\/)([\w-]{11})/i,
  /(?:youtube\.com\/embed\/)([\w-]{11})/i,
  /(?:youtube\.com\/shorts\/)([\w-]{11})/i,
]

function ytId(url: string) {
  const t = url.trim()
  if (!t) return null
  for (const re of PATTERNS) {
    const m = t.match(re)
    if (m?.[1]) return m[1]
  }
  if (/^[\w-]{11}$/.test(t)) return t
  return null
}

export default function PostForm({
  post,
  categories = [],
  coaches = [],
  postCategoryIds = [],
}: {
  post?: Post
  categories?: Category[]
  coaches?: Coach[]
  postCategoryIds?: string[]
}) {
  const isEdit = !!post
  const action = isEdit ? updatePostAction.bind(null, post!.id) : createPostAction
  const [state, dispatch] = useActionState<PostState, FormData>(action, undefined)

  const [yt, setYt] = useState(post?.youtube_url ?? '')
  const ytPreview = ytId(yt)

  const [content, setContent] = useState(post?.content ?? '')

  return (
    <form action={dispatch} className="space-y-6 max-w-3xl">
      <TextField
        label="Título"
        name="title"
        defaultValue={post?.title}
        required
        hint="El slug (URL) se genera automáticamente desde el título."
      />

      <div>
        <label className="field-label">Categorías</label>
        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-3 mt-1">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="category_ids"
                  value={cat.id}
                  defaultChecked={postCategoryIds.includes(cat.id)}
                  className="accent-accent w-4 h-4"
                />
                <span className="text-white/80 text-sm">{cat.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-white/40 text-sm mt-1">
            No hay categorías creadas todavía.{' '}
            <a href="/dashboard/categorias/nuevo" className="text-accent hover:underline">
              Crear una
            </a>
          </p>
        )}
      </div>

      {coaches.length > 0 && (
        <div>
          <label htmlFor="coach_id" className="field-label">Autor / Entrenador</label>
          <select
            id="coach_id"
            name="coach_id"
            defaultValue={post?.coach_id ?? ''}
            className="field-input"
          >
            <option value="">Sin autor asignado</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.specialty}
              </option>
            ))}
          </select>
        </div>
      )}

      <TextArea
        label="Resumen / extracto"
        name="excerpt"
        defaultValue={post?.excerpt ?? ''}
        rows={2}
        hint="Aparece en el listado y como descripción para redes sociales."
      />

      <ImageUpload
        label="Imagen de portada"
        name="cover_image"
        defaultValue={post?.cover_image}
        folder="blog"
      />

      <div>
        <label htmlFor="youtube_url" className="field-label">
          <YoutubeIcon size={14} className="inline mr-1.5 -mt-0.5" />
          Video de YouTube (opcional)
        </label>
        <input
          id="youtube_url"
          name="youtube_url"
          type="text"
          value={yt}
          onChange={(e) => setYt(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=… o https://youtu.be/…"
          className="field-input"
        />
        <p className="text-white/35 text-xs mt-1.5">
          Pegá el link y se incrusta solo en el post. Soporta watch, youtu.be, embed y shorts.
        </p>
        {ytPreview && (
          <div
            className="mt-3 relative w-full max-w-sm rounded-md overflow-hidden"
            style={{ paddingBottom: 'min(56.25%, 200px)', background: '#000' }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${ytPreview}`}
              title="Vista previa"
              loading="lazy"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="content" className="field-label">Contenido</label>
        <ContentEditor value={content} onChange={setContent} />
        <textarea name="content" value={content} readOnly hidden />
        <p className="text-white/35 text-xs mt-1.5">
          Acepta HTML: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;strong&gt;, &lt;a&gt;. Podés insertar múltiples imágenes y videos (incluso Shorts) con los botones de arriba.
        </p>
      </div>

      <Checkbox
        label="Publicado (visible en el blog público)"
        name="published"
        defaultChecked={post?.published ?? false}
      />

      <div className="flex items-center gap-4 pt-2">
        <SaveButton label={isEdit ? 'Guardar cambios' : 'Crear post'} />
        <SaveStatus state={state} />
      </div>
    </form>
  )
}

function ContentEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [showYt, setShowYt] = useState(false)
  const [ytInput, setYtInput] = useState('')

  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setErr(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'blog/content')
    const res = await uploadMediaAction(fd)
    setBusy(false)
    if (res.error) { setErr(res.error); return }
    if (res.url) {
      const tag = `\n<img src="${res.url}" alt="" />\n`
      onChange((value + tag).trim() + '\n')
    }
    e.target.value = ''
  }

  function insertYoutube() {
    const id = parseYtId(ytInput.trim())
    if (!id) { setErr('Link de YouTube no válido.'); return }
    const isShort = ytInput.includes('/shorts/')
    const embed = isShort
      ? `\n<div style="position:relative;padding-bottom:177.78%;max-width:315px;margin:16px 0"><iframe src="https://www.youtube.com/embed/${id}" style="position:absolute;inset:0;width:100%;height:100%" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>\n`
      : `\n<div style="position:relative;padding-bottom:56.25%;margin:16px 0"><iframe src="https://www.youtube.com/embed/${id}" style="position:absolute;inset:0;width:100%;height:100%" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>\n`
    onChange((value + embed).trim() + '\n')
    setYtInput('')
    setShowYt(false)
    setErr(null)
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={14}
        className="field-input font-mono text-sm"
        placeholder='<p>Escribí el contenido del post acá.</p>'
      />

      <div className="flex items-center gap-3 mt-2 flex-wrap">
        {/* Insertar imagen */}
        <label
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-body font-semibold cursor-pointer"
          style={{ background: 'rgba(56,189,248,0.1)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.2)' }}
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {busy ? 'Subiendo…' : 'Insertar imagen'}
          <input type="file" accept="image/*" onChange={pickImage} disabled={busy} className="hidden" />
        </label>

        {/* Insertar video */}
        <button
          type="button"
          onClick={() => { setShowYt(!showYt); setErr(null) }}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-body font-semibold transition-colors"
          style={{ background: 'rgba(255,0,0,0.08)', color: '#f87171', border: '1px solid rgba(255,0,0,0.2)' }}
        >
          <YoutubeIcon size={14} />
          Insertar video
        </button>

        {err && <span className="text-xs text-red-400">{err}</span>}
      </div>

      {/* Input de YouTube */}
      {showYt && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={ytInput}
            onChange={(e) => setYtInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), insertYoutube())}
            placeholder="Pegá el link de YouTube o Short…"
            className="field-input text-sm flex-1"
            autoFocus
          />
          <button
            type="button"
            onClick={insertYoutube}
            className="px-4 py-2 rounded-md text-xs font-semibold text-white flex-shrink-0"
            style={{ background: '#38BDF8', color: '#0A1628' }}
          >
            Insertar
          </button>
          <button
            type="button"
            onClick={() => { setShowYt(false); setYtInput(''); setErr(null) }}
            className="px-2 py-2 rounded-md text-white/50 hover:text-white"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

const YT_PATTERNS = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/i,
  /(?:youtu\.be\/)([\w-]{11})/i,
  /(?:youtube\.com\/embed\/)([\w-]{11})/i,
  /(?:youtube\.com\/shorts\/)([\w-]{11})/i,
  /(?:youtube\.com\/v\/)([\w-]{11})/i,
]

function parseYtId(url: string): string | null {
  for (const re of YT_PATTERNS) {
    const m = url.match(re)
    if (m?.[1]) return m[1]
  }
  if (/^[\w-]{11}$/.test(url)) return url
  return null
}
