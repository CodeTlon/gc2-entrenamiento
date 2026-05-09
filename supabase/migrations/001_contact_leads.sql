-- GC² Entrenamiento — Tabla contact_leads
-- Migración 001

create table if not exists public.contact_leads (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  email        text not null,
  telefono     text not null,
  ciudad       text,
  servicio     text,
  objetivo     text,
  mensaje      text not null,
  created_at   timestamptz not null default now()
);

-- RLS
alter table public.contact_leads enable row level security;

-- Solo el service role puede leer (admin)
create policy "Service role can read contact_leads"
  on public.contact_leads for select
  using (auth.role() = 'service_role');

-- Cualquiera puede insertar (formulario público)
create policy "Anyone can insert contact_leads"
  on public.contact_leads for insert
  with check (true);
