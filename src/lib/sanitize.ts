import DOMPurify from 'isomorphic-dompurify'

// Reemplaza el sanitizador casero (regex/blacklist, bypasseable — ej. `<svg/onload=…>`
// sin espacio antes de "on" no lo detectaba, y no filtraba <iframe>/<object>/<embed>)
// por DOMPurify con whitelist explícita. El contenido que pasa por acá lo escriben
// usuarios ya autenticados del dashboard (no público), pero se sirve a todos los
// visitantes del sitio — un post/hero con XSS persistente sería alto impacto si una
// cuenta del dashboard se compromete, así que igual vale sanitizar en el server antes
// de mandarlo al browser vía dangerouslySetInnerHTML.

// Whitelist "rica": contenido de posts del blog, generado por el editor TipTap
// (StarterKit + Image + Link + Youtube + nodo custom InlineVideo — ver PostForm.tsx).
const RICH_TAGS = [
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 's', 'u', 'code', 'pre',
  'ul', 'ol', 'li', 'blockquote', 'hr', 'br',
  'a', 'img', 'video', 'div', 'span',
  // el YouTube embed de TipTap envuelve el <iframe> en un <div data-youtube-video>
  'iframe',
]

const RICH_ATTR = [
  'href', 'target', 'rel', 'title', 'alt',
  'src', 'width', 'height', 'style', 'class',
  'controls', 'allow', 'allowfullscreen', 'frameborder', 'loading',
  'data-youtube-video',
]

// Whitelist "básica": textareas de site_settings (Hero.subtitle, About.paragraphs)
// donde el staff tipea HTML a mano — solo formato inline simple, sin media/embeds.
const BASIC_TAGS = ['strong', 'b', 'em', 'i', 'u', 's', 'br', 'a']
const BASIC_ATTR = ['href', 'target', 'rel']

// Dominios permitidos para src de iframe/video/img — mismos que remotePatterns de
// next.config.mjs (images) y la CSP (frame-src/media-src). Defensa en profundidad:
// aunque DOMPurify ya bloquea `javascript:`/`data:` peligrosos por default, esto
// evita que un iframe/video apunte a un origen arbitrario aunque el esquema sea https.
const ALLOWED_SRC_HOSTS = [
  /^https:\/\/www\.youtube(-nocookie)?\.com\//i,
  /^https:\/\/[a-z0-9-]+\.supabase\.co\//i,
  /^https:\/\/images\.unsplash\.com\//i,
  /^https:\/\/(img|i)\.ytimg\.com\//i,
  /^\//, // rutas relativas (/images/...)
]

function isAllowedSrc(value: string): boolean {
  return ALLOWED_SRC_HOSTS.some((re) => re.test(value))
}

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'iframe' || data.tagName === 'video' || data.tagName === 'img') {
    const el = node as unknown as Element
    const src = el.getAttribute?.('src')
    if (src && !isAllowedSrc(src)) {
      el.remove()
    }
  }
})

DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
  if (data.attrName === 'src' && data.attrValue && !isAllowedSrc(data.attrValue)) {
    data.keepAttr = false
  }
})

export function sanitizeHtml(html: string): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: RICH_TAGS,
    ALLOWED_ATTR: RICH_ATTR,
    ALLOW_DATA_ATTR: false,
  })
}

export function sanitizeBasicHtml(html: string): string {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: BASIC_TAGS,
    ALLOWED_ATTR: BASIC_ATTR,
    ALLOW_DATA_ATTR: false,
  })
}
