alter table posts
  add column if not exists coach_id uuid references coaches(id) on delete set null;
