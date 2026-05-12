create table if not exists public.post_categories (
  post_id     uuid not null references posts(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (post_id, category_id)
);

-- Migrar datos existentes desde posts.category_id
insert into post_categories (post_id, category_id)
select id, category_id
from posts
where category_id is not null
on conflict do nothing;

alter table post_categories enable row level security;

create policy "post_categories_public_read"
  on post_categories for select using (true);

create policy "post_categories_auth_write"
  on post_categories for all using (auth.role() = 'authenticated');
