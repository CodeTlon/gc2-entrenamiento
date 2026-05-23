'use client'

import { useActionState } from 'react'
import { saveSiteSettingAction, type SaveState } from '@/actions/settings'
import type { PageBannersSettings } from '@/lib/content'
import { ImageUpload } from '@/components/dashboard/Field'
import { SaveButton, SaveStatus } from '@/components/dashboard/SaveButton'

async function action(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const value: PageBannersSettings = {
    planes: { bg_image: String(formData.get('planes_bg_image') ?? '') },
    blog: { bg_image: String(formData.get('blog_bg_image') ?? '') },
    contacto: { bg_image: String(formData.get('contacto_bg_image') ?? '') },
  }
  return saveSiteSettingAction('page_banners', value)
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="w-1 h-5 rounded" style={{ background: '#38BDF8' }} />
      <span className="font-heading font-bold text-sm uppercase tracking-widest text-white/70">
        {label}
      </span>
    </div>
  )
}

export default function BannersForm({ initial }: { initial: PageBannersSettings }) {
  const [state, dispatch] = useActionState<SaveState, FormData>(action, undefined)

  return (
    <form action={dispatch} className="space-y-8 max-w-3xl">
      <SectionDivider label="Página Planes" />
      <ImageUpload
        label="Imagen de fondo"
        name="planes_bg_image"
        defaultValue={initial.planes.bg_image}
        folder="banners"
        previewAspect="16 / 7"
      />

      <SectionDivider label="Página Blog" />
      <ImageUpload
        label="Imagen de fondo"
        name="blog_bg_image"
        defaultValue={initial.blog.bg_image}
        folder="banners"
        previewAspect="16 / 7"
      />

      <SectionDivider label="Página Contacto" />
      <ImageUpload
        label="Imagen de fondo"
        name="contacto_bg_image"
        defaultValue={initial.contacto.bg_image}
        folder="banners"
        previewAspect="16 / 9"
      />

      <div className="flex items-center gap-4 pt-2">
        <SaveButton />
        <SaveStatus state={state} />
      </div>
    </form>
  )
}
