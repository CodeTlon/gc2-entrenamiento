'use client'

import { useActionState } from 'react'
import { saveSiteSettingAction, type SaveState } from '@/actions/settings'
import type { ContactSettings } from '@/lib/content'
import { TextField } from '@/components/dashboard/Field'
import { SaveButton, SaveStatus } from '@/components/dashboard/SaveButton'

async function action(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const value: ContactSettings = {
    phone: String(formData.get('phone') ?? ''),
    phone_display: String(formData.get('phone_display') ?? ''),
    email: String(formData.get('email') ?? ''),
    whatsapp_link: String(formData.get('whatsapp_link') ?? ''),
    instagram_user: String(formData.get('instagram_user') ?? ''),
    instagram_link: String(formData.get('instagram_link') ?? ''),
    city: String(formData.get('city') ?? ''),
  }
  return saveSiteSettingAction('contact', value)
}

export default function ContactForm({ initial }: { initial: ContactSettings }) {
  const [state, dispatch] = useActionState<SaveState, FormData>(action, undefined)
  return (
    <form action={dispatch} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Teléfono (con prefijo internacional)" name="phone" defaultValue={initial.phone} placeholder="+5493516XXXXXX" />
        <TextField label="Teléfono — formato visible" name="phone_display" defaultValue={initial.phone_display} placeholder="351 6XX XXXX" />
      </div>
      <TextField label="Email" name="email" type="email" defaultValue={initial.email} />
      <TextField label="Link de WhatsApp" name="whatsapp_link" defaultValue={initial.whatsapp_link} placeholder="https://wa.me/..." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField label="Usuario de Instagram" name="instagram_user" defaultValue={initial.instagram_user} placeholder="@usuario" />
        <TextField label="Link de Instagram" name="instagram_link" defaultValue={initial.instagram_link} placeholder="https://instagram.com/..." />
      </div>
      <TextField label="Ciudad" name="city" defaultValue={initial.city} />

      <div className="flex items-center gap-4 pt-2">
        <SaveButton />
        <SaveStatus state={state} />
      </div>
    </form>
  )
}
