create table if not exists plan_categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  display_order int  not null default 0,
  created_at    timestamptz not null default now()
);

-- Categorías por defecto
insert into plan_categories (name, slug, display_order) values
  ('Corredores',  'runner',   1),
  ('Triatletas',  'triathlon', 2),
  ('Grupales',    'group',    3)
on conflict (slug) do nothing;

alter table plans
  add column if not exists plan_category_id uuid references plan_categories(id) on delete set null;

-- Migrar datos existentes
update plans p
set plan_category_id = (select id from plan_categories pc where pc.slug = p.category)
where plan_category_id is null;

alter table plan_categories enable row level security;

create policy "plan_categories_public_read"
  on plan_categories for select using (true);

create policy "plan_categories_auth_write"
  on plan_categories for all using (auth.role() = 'authenticated');
