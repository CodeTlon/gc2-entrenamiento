-- Tabla de categorías del blog
create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  display_order int  not null default 0,
  created_at    timestamptz not null default now()
);

-- FK en posts
alter table posts
  add column if not exists category_id uuid references categories(id) on delete set null;

-- RLS
alter table categories enable row level security;

create policy "categories_public_read"
  on categories for select using (true);

create policy "categories_auth_write"
  on categories for all using (auth.role() = 'authenticated');
