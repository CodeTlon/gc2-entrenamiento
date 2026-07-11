-- Fix RLS gap: post_authors no tenía policy de escritura para 'authenticated'.
--
-- 008_post_authors.sql solo dio INSERT/UPDATE/DELETE a 'service_role'. El dashboard
-- (createCoachAction/createPostAction en src/actions/posts.ts) escribe esta tabla usando
-- el cliente de sesión del usuario logueado (createSupabaseServerClient → rol
-- 'authenticated', no 'service_role'), igual que hace con post_categories. Sin esta
-- policy, todo insert/delete de coautores de un post (multi-coach por artículo) fallaba
-- silenciosamente bajo RLS: no hay error visible porque el código no revisa el resultado
-- de ese insert/delete puntual, así que el post se guardaba pero los coaches asignados no.
--
-- Mismo patrón que "post_categories_auth_write" (007_post_categories.sql).

drop policy if exists "post_authors_auth_write" on public.post_authors;
create policy "post_authors_auth_write"
  on public.post_authors for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
