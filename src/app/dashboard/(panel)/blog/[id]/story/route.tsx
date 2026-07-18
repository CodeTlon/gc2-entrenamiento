import { ImageResponse } from '@vercel/og'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { parseFocal } from '@/lib/image-focal'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: post } = await supabase
    .from('posts')
    .select('title, slug, cover_image')
    .eq('id', id)
    .single()

  if (!post) return new Response('No encontrado', { status: 404 })

  const coverSrc = parseFocal(post.cover_image).src
  const titleSize = post.title.length > 50 ? 52 : post.title.length > 30 ? 60 : 68

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#0D2247',
        }}
      >
        {coverSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverSrc}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(13,34,71,0.15) 0%, rgba(13,34,71,0.55) 55%, rgba(13,34,71,0.97) 100%)',
          }}
        />
        <div style={{ position: 'absolute', top: 72, left: 64, display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 10, height: 44, background: '#38BDF8', borderRadius: 4, display: 'flex' }} />
          <span style={{ color: '#fff', fontSize: 32, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase' }}>
            Nuevo artículo
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 150,
            left: 64,
            right: 64,
            display: 'flex',
          }}
        >
          <span style={{ color: '#fff', fontSize: titleSize, fontWeight: 800, lineHeight: 1.15, textTransform: 'uppercase' }}>
            {post.title}
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            left: 64,
            right: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: '#38BDF8', fontSize: 30, fontWeight: 700 }}>GC² Entrenamiento</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 22 }}>
            gc2entrenamientoderesistencia.com.ar
          </span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      headers: {
        'Content-Disposition': `attachment; filename="story-${post.slug}.png"`,
      },
    },
  )
}
