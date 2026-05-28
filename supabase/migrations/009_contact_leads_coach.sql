-- Agrega columna coach a contact_leads para guardar el entrenador de preferencia
alter table public.contact_leads
  add column if not exists coach text;
