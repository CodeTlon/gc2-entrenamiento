import sanitize from 'sanitize-html'

// Reemplaza el sanitizador casero (regex/blacklist, bypasseable — ej. `<svg/onload=…>`
// sin espacio antes de "on" no lo detectaba, y no filtraba <iframe>/<object>/<embed>)
// por una whitelist explícita con `sanitize-html` (htmlparser2, sin jsdom: jsdom no carga en todos
// los entornos de Next — en academia rompió el blog en Vercel). El contenido que pasa por acá lo escriben
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
  // los agrega transformTags (lazy/preload); sanitize-html filtra atributos después de transformar
  'decoding', 'preload',
]

// Whitelist "básica": textareas de site_settings (Hero.subtitle, About.paragraphs)
// donde el staff tipea HTML a mano — solo formato inline simple, sin media/embeds.
const BASIC_TAGS = ['strong', 'b', 'em', 'i', 'u', 's', 'br', 'a']
const BASIC_ATTR = ['href', 'target', 'rel']

// Orígenes permitidos para src de iframe/video/img. Defensa en profundidad: además de
// los esquemas, evita que un iframe/video apunte a un origen arbitrario aunque sea https.
const ALLOWED_SRC_HOSTS = [
  /^https:\/\/www\.youtube(-nocookie)?\.com\//i,
  /^https:\/\/[a-z0-9-]+\.supabase\.co\//i,
  /^https:\/\/images\.unsplash\.com\//i,
  /^https:\/\/(img|i)\.ytimg\.com\//i,
  /^\/(?!\/)/, // rutas relativas (/media/..., /images/...) — excluye `//host` (protocol-relative)
]

function isAllowedSrc(value: string): boolean {
  return ALLOWED_SRC_HOSTS.some((re) => re.test(value))
}

const MEDIA = new Set(['img', 'video', 'iframe'])

export function sanitizeHtml(html: string): string {
  if (!html) return ''
  return sanitize(html, {
    allowedTags: RICH_TAGS,
    allowedAttributes: { '*': RICH_ATTR },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    // Un img/video/iframe con src de un origen no permitido se borra entero.
    exclusiveFilter: (frame) => MEDIA.has(frame.tag) && !!frame.attribs.src && !isAllowedSrc(frame.attribs.src),
    transformTags: {
      // Imágenes y videos del cuerpo del post: lazy para no competir con el LCP.
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy', decoding: 'async' } }),
      iframe: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
      video: (tagName, attribs) => ({ tagName, attribs: { ...attribs, preload: 'metadata' } }),
    },
  })
}

export function sanitizeBasicHtml(html: string): string {
  if (!html) return ''
  return sanitize(html, {
    allowedTags: BASIC_TAGS,
    allowedAttributes: { a: BASIC_ATTR },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
  })
}
