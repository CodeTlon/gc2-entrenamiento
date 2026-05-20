-- Junction table: many-to-many posts <-> coaches (multiple authors per post)
create table if not exists public.post_authors (
  post_id  uuid not null references posts(id) on delete cascade,
  coach_id uuid not null references coaches(id) on delete cascade,
  primary key (post_id, coach_id)
);

alter table public.post_authors enable row level security;

create policy "public read post_authors"
  on public.post_authors for select using (true);

create policy "service write post_authors"
  on public.post_authors for all using (auth.role() = 'service_role');

-- Migrate existing single-author data into the junction table
insert into public.post_authors (post_id, coach_id)
select id, coach_id from public.posts where coach_id is not null
on conflict do nothing;
