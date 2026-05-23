import Image from 'next/image'
import { focalImageProps } from '@/lib/image-focal'

interface MiniHeroProps {
  image: string
  imageAlt: string
  titleWhite: string
  titleAccent: string
}

export default function MiniHero({ image, imageAlt, titleWhite, titleAccent }: MiniHeroProps) {
  const { src, style } = focalImageProps(image)

  return (
    <section className="relative overflow-hidden flex items-end" style={{ minHeight: '55vh' }}>
      <div className="absolute inset-0">
        <Image
          src={src || image}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover"
          style={style}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(10,22,40,0.97) 0%, rgba(13,34,71,0.92) 40%, rgba(16,46,102,0.78) 70%, rgba(10,22,40,0.95) 100%)',
          }}
        />
      </div>
      <div className="container relative z-10 pb-12 pt-24">
        <h1
          className="font-heading font-black uppercase leading-tight"
          style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', letterSpacing: '-1px' }}
        >
          <span className="text-white">{titleWhite} </span>
          <span className="gradient-text">{titleAccent}</span>
        </h1>
      </div>
    </section>
  )
}
