-- Descripción larga de planes, mostrada en el modal "Más información" (patrón coaches.bio_long).
alter table public.plans
  add column if not exists description_long text not null default '';
