-- GC² Entrenamiento — Migración 013: hardening de contact_leads y bucket media
-- (auditoría 2026-11-24). NO aplicada automáticamente: correr primero en dev.

-- 1) contact_leads: la policy de insert público permitía escribir directo vía PostgREST
--    con la anon key, salteando la validación Zod y el rate limit del Server Action.
--    El form ya inserta con el cliente service_role (que bypassea RLS), así que no hace falta.
drop policy if exists "Anyone can insert contact_leads" on public.contact_leads;

-- Topes de largo (mismos que el schema Zod de src/actions/contact.ts).
-- NOT VALID: no falla por filas viejas, pero aplica a todo insert/update nuevo.
alter table public.contact_leads
  add constraint contact_leads_nombre_len   check (char_length(nombre)   <= 120)  not valid,
  add constraint contact_leads_email_len    check (char_length(email)    <= 200)  not valid,
  add constraint contact_leads_telefono_len check (char_length(telefono) <= 40)   not valid,
  add constraint contact_leads_mensaje_len  check (char_length(mensaje)  <= 5000) not valid;

-- 2) Bucket media: allowlist de tipos y tope de tamaño a nivel Storage (defensa en
--    profundidad: el chequeo de la app se puede saltear subiendo con la API directo).
--    Sin SVG/HTML: se servirían desde el bucket público y pueden ejecutar scripts.
update storage.buckets
set
  allowed_mime_types = array[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
    'application/pdf',
    'video/mp4', 'video/webm', 'video/quicktime'
  ],
  file_size_limit = 62914560 -- 60MB (MAX_VIDEO_BYTES en src/lib/upload-limits.ts)
where id = 'media';
