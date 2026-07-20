'use client'

import { useActionState, useState } from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TipTapImage from '@tiptap/extension-image'
import TipTapLink from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import { createPostAction, updatePostAction, type PostState } from '@/actions/posts'
import { TextField, TextArea, ImageUpload, FileUpload, Checkbox } from '@/components/dashboard/Field'
import { SaveButton, SaveStatus } from '@/components/dashboard/SaveButton'
import { uploadMediaAction } from '@/actions/settings'
import { uploadDirectToStorage } from '@/lib/client-upload'
import { MAX_DOC_BYTES, MAX_VIDEO_BYTES, MAX_INLINE_VIDEO_BYTES } from '@/lib/upload-limits'
import { Upload, Loader2, Youtube as YoutubeIcon, Video as VideoIcon, X, Bold, Italic, Heading2, List, ListOrdered, Link as LinkIcon, Quote } from 'lucide-react'

// Nodo custom: TipTap no trae uno para <video> nativo (solo @tiptap/extension-youtube).
const InlineVideo = Node.create({
  name: 'inlineVideo',
  group: 'block',
  atom: true,
  addAttributes() {
    return { src: { default: null } }
  },
  parseHTML() {
    return [{ tag: 'video' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, { controls: 'true', style: 'max-width:100%;border-radius:8px' })]
  },
})

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

const YT_PATTERNS = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/i,
  /(?:youtu\.be\/)([\w-]{11})/i,
  /(?:youtube\.com\/embed\/)([\w-]{11})/i,
  /(?:youtube\.com\/shorts\/)([\w-]{11})/i,
  /(?:youtube\.com\/v\/)([\w-]{11})/i,
]

function ytId(url: string): string | null {
  const t = url.trim()
  if (!t) return null
  for (const re of YT_PATTERNS) {
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
  postCoachIds = [],
}: {
  post?: Post
  categories?: Category[]
  coaches?: Coach[]
  postCategoryIds?: string[]
  postCoachIds?: string[]
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
          <div
            className="flex flex-wrap gap-3 mt-1 max-h-40 overflow-y-auto p-2 rounded-md"
            style={{ border: '1px solid #102E66' }}
          >
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

      <div>
        <label className="field-label">Autores / Entrenadores</label>
        {coaches.length > 0 ? (
          <div
            className="flex flex-wrap gap-3 mt-1 max-h-40 overflow-y-auto p-2 rounded-md"
            style={{ border: '1px solid #102E66' }}
          >
            {coaches.map((c) => (
              <label key={c.id} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="coach_ids"
                  value={c.id}
                  defaultChecked={postCoachIds.includes(c.id)}
                  className="accent-accent w-4 h-4"
                />
                <span className="text-white/80 text-sm">{c.name} — {c.specialty}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-white/40 text-sm mt-1">No hay entrenadores creados todavía.</p>
        )}
      </div>

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
        previewAspect="16 / 9"
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
          <div className="mt-3 relative w-full max-w-sm aspect-video rounded-md overflow-hidden bg-black">
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

      <FileUpload
        label="Video propio (opcional)"
        name="video_url"
        defaultValue={post?.video_url}
        folder="blog/video"
        accept="video/mp4"
        maxBytes={MAX_VIDEO_BYTES}
        hint="Alternativa a pegar un link de YouTube arriba, para subir un video propio."
      />

      <FileUpload
        label="PDF adjunto (opcional)"
        name="attachment_url"
        defaultValue={post?.attachment_url}
        folder="blog/adjuntos"
        accept="application/pdf"
        maxBytes={MAX_DOC_BYTES}
        hint="Se muestra como link de descarga en el artículo publicado."
      />

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

function ToolbarBtn({
  onClick, active, title, children,
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded transition-colors"
      style={{
        background: active ? 'rgba(56,189,248,0.15)' : 'transparent',
        color: active ? '#38BDF8' : 'rgba(255,255,255,0.55)',
      }}
    >
      {children}
    </button>
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

  const editor = useEditor({
    extensions: [
      StarterKit,
      TipTapImage,
      InlineVideo,
      TipTapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Escribí el contenido del post acá…' }),
      Youtube.configure({ controls: true, nocookie: false }),
    ],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

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
      editor?.chain().focus().setImage({ src: res.url, alt: '' }).run()
      // Mover el cursor después de la imagen para poder insertar más contenido
      editor?.commands.createParagraphNear()
    }
    e.target.value = ''
  }

  async function pickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_INLINE_VIDEO_BYTES) {
      setErr(`Máximo ${Math.round(MAX_INLINE_VIDEO_BYTES / (1024 * 1024))}MB para un video en el contenido.`)
      e.target.value = ''
      return
    }
    setBusy(true)
    setErr(null)
    // Directo a Storage desde el browser, no vía Server Action: Vercel corta el
    // body de una Server Action en ~4.5MB, muy por debajo de un video de 15MB.
    const { url, error } = await uploadDirectToStorage(file, 'blog/content')
    setBusy(false)
    if (error) { setErr(error); return }
    if (url) {
      editor?.chain().focus().insertContent({ type: 'inlineVideo', attrs: { src: url } }).run()
      editor?.commands.createParagraphNear()
    }
    e.target.value = ''
  }

  function insertYoutube() {
    const src = ytInput.trim()
    if (!ytId(src)) { setErr('Link de YouTube no válido.'); return }
    editor?.commands.setYoutubeVideo({ src })
    setYtInput('')
    setShowYt(false)
    setErr(null)
  }

  function addLink() {
    const url = window.prompt('URL del link:')
    if (!url) return
    if (editor?.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run()
    } else {
      editor?.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div
        className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 rounded-t-md"
        style={{ background: '#091A35', border: '1px solid #102E66', borderBottom: 'none' }}
      >
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Negrita">
          <Bold size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Cursiva">
          <Italic size={15} />
        </ToolbarBtn>

        <div className="w-px h-4 bg-white/10 mx-1" />

        <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="Título H2">
          <Heading2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Cita">
          <Quote size={15} />
        </ToolbarBtn>

        <div className="w-px h-4 bg-white/10 mx-1" />

        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Lista con viñetas">
          <List size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Lista numerada">
          <ListOrdered size={15} />
        </ToolbarBtn>

        <div className="w-px h-4 bg-white/10 mx-1" />

        <ToolbarBtn onClick={addLink} active={editor?.isActive('link')} title="Insertar link">
          <LinkIcon size={15} />
        </ToolbarBtn>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Imagen */}
        <label
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ml-1"
          style={{ color: '#38BDF8', background: 'rgba(56,189,248,0.08)' }}
          title="Subir e insertar imagen"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {busy ? 'Subiendo…' : 'Imagen'}
          <input type="file" accept="image/*" onChange={pickImage} disabled={busy} className="hidden" />
        </label>

        {/* Video propio */}
        <label
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors"
          style={{ color: '#38BDF8', background: 'rgba(56,189,248,0.08)' }}
          title={`Subir e insertar video propio (máx. ${Math.round(MAX_INLINE_VIDEO_BYTES / (1024 * 1024))}MB)`}
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <VideoIcon size={13} />}
          {busy ? 'Subiendo…' : 'Video propio'}
          <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={pickVideo} disabled={busy} className="hidden" />
        </label>

        {/* YouTube */}
        <button
          type="button"
          onClick={() => { setShowYt(!showYt); setErr(null) }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors"
          style={{ color: '#f87171', background: 'rgba(255,0,0,0.08)' }}
          title="Insertar video de YouTube"
        >
          <YoutubeIcon size={13} />
          Video
        </button>

        {err && <span className="text-xs text-red-400 ml-2">{err}</span>}
      </div>

      {/* YouTube input */}
      {showYt && (
        <div
          className="flex gap-2 px-2 py-2"
          style={{ background: '#091A35', border: '1px solid #102E66', borderBottom: 'none' }}
        >
          <input
            type="text"
            value={ytInput}
            onChange={(e) => setYtInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), insertYoutube())}
            placeholder="Pegá el link de YouTube o Short…"
            className="field-input text-sm flex-1 py-1.5"
            autoFocus
          />
          <button type="button" onClick={insertYoutube} className="px-3 py-1.5 rounded text-xs font-semibold flex-shrink-0" style={{ background: '#38BDF8', color: '#0A1628' }}>
            Insertar
          </button>
          <button type="button" onClick={() => { setShowYt(false); setYtInput(''); setErr(null) }} className="px-2 py-1.5 rounded text-white/50 hover:text-white flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Editor area */}
      <EditorContent editor={editor} className="rich-editor" />
    </div>
  )
}
