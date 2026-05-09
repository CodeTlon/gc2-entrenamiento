-- GC² Entrenamiento — Editorial / dashboard
-- Migración 003
--
-- Esta migración:
--   1. Crea tablas para todo el contenido editable (site_settings, coaches, plans).
--   2. Extiende posts con author_id, youtube_url, updated_at.
--   3. Configura RLS: lectura pública / escritura solo authenticated.
--   4. Crea el bucket de Storage `media` con políticas equivalentes.
--   5. Hace seed con los datos actuales para que el sitio se vea idéntico.

-- =============================================================
-- 1. site_settings  (key/value JSON para textos generales)
-- =============================================================
create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site_settings" on public.site_settings;
create policy "Public can read site_settings"
  on public.site_settings for select
  using (true);

drop policy if exists "Authenticated can write site_settings" on public.site_settings;
create policy "Authenticated can write site_settings"
  on public.site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================================
-- 2. coaches
-- =============================================================
create table if not exists public.coaches (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  specialty       text not null,
  short_desc      text not null default '',
  bio_long        text not null default '',
  photo_url       text,
  ig_handle       text,
  ig_url          text,
  certifications  text[] not null default '{}',
  achievements    text[] not null default '{}',
  services        text[] not null default '{}',
  display_order   int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.coaches enable row level security;

drop policy if exists "Public can read coaches" on public.coaches;
create policy "Public can read coaches"
  on public.coaches for select
  using (true);

drop policy if exists "Authenticated can write coaches" on public.coaches;
create policy "Authenticated can write coaches"
  on public.coaches for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================================
-- 3. plans
-- =============================================================
do $$ begin
  create type plan_category as enum ('runner', 'triathlon', 'group');
exception when duplicate_object then null;
end $$;

create table if not exists public.plans (
  id            uuid primary key default gen_random_uuid(),
  category      plan_category not null,
  name          text not null,
  name_display  text,
  badge         text,
  features      text[] not null default '{}',
  featured      boolean not null default false,
  display_order int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.plans enable row level security;

drop policy if exists "Public can read plans" on public.plans;
create policy "Public can read plans"
  on public.plans for select
  using (true);

drop policy if exists "Authenticated can write plans" on public.plans;
create policy "Authenticated can write plans"
  on public.plans for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================================
-- 4. posts (extender)
-- =============================================================
alter table public.posts
  add column if not exists author_id   uuid references auth.users(id) on delete set null,
  add column if not exists youtube_url text,
  add column if not exists updated_at  timestamptz not null default now();

drop policy if exists "Authenticated can write posts" on public.posts;
create policy "Authenticated can write posts"
  on public.posts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================================
-- 5. Storage bucket: media
--
-- (Si el bucket o las políticas ya existen, los `on conflict` / `if not exists`
--  evitan errores al re-correr la migración.)
-- =============================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read media" on storage.objects;
create policy "Public can read media"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "Authenticated can upload media" on storage.objects;
create policy "Authenticated can upload media"
  on storage.objects for insert
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

drop policy if exists "Authenticated can update media" on storage.objects;
create policy "Authenticated can update media"
  on storage.objects for update
  using (bucket_id = 'media' and auth.role() = 'authenticated')
  with check (bucket_id = 'media' and auth.role() = 'authenticated');

drop policy if exists "Authenticated can delete media" on storage.objects;
create policy "Authenticated can delete media"
  on storage.objects for delete
  using (bucket_id = 'media' and auth.role() = 'authenticated');

-- =============================================================
-- 6. Seed: site_settings
-- =============================================================
insert into public.site_settings (key, value) values
  ('hero', jsonb_build_object(
    'title_line_1', 'SUPERÁ',
    'title_line_2', 'TUS LÍMITES',
    'subtitle', 'Equipo de entrenamiento para <strong>corredores, duatletas y triatletas</strong>. Planificación individualizada y grupal, presencial y a distancia.',
    'cta_primary_label', 'Ver Planes',
    'cta_primary_href', '/planes',
    'cta_secondary_label', '¡Contactános!',
    'cta_secondary_href', '/contacto',
    'bg_image', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1920&q=85',
    'stats', jsonb_build_array(
      jsonb_build_object('number', '3', 'label', 'Disciplinas'),
      jsonb_build_object('number', '6+', 'label', 'Planes'),
      jsonb_build_object('number', 'Grupal', 'label', '& Individual'),
      jsonb_build_object('number', 'Presencial', 'label', '& Distancia')
    )
  )),
  ('about', jsonb_build_object(
    'label', 'Quiénes Somos',
    'title_line_1', 'EQUIPO DE ENTRENAMIENTO DE',
    'title_line_2', 'DEPORTES DE RESISTENCIA',
    'paragraphs', jsonb_build_array(
      'Somos un equipo dedicado a la planificación y entrenamiento de deportes de resistencia para <strong>corredores, duatletas y triatletas</strong> de todos los niveles y distancias.',
      'Ofrecemos entrenamiento <strong>individual y grupal</strong>, tanto <strong>presencial como a distancia</strong>, con evaluación funcional, testeos y planes de gimnasio personalizados.'
    ),
    'features', jsonb_build_array(
      'Planificación individualizada para cada atleta',
      'Evaluación funcional y testeos periódicos',
      'Entrenamiento presencial y a distancia',
      'Planes de gimnasio complementarios'
    ),
    'image', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=700&q=80'
  )),
  ('disciplines', jsonb_build_object(
    'label', '● Disciplinas',
    'title_line_1', 'TRES CAMINOS,',
    'title_line_2', 'UN OBJETIVO',
    'items', jsonb_build_array(
      jsonb_build_object('title', 'RUNNING', 'sub', 'Corredores', 'desc', 'Planes para todos los niveles y distancias. Desde 5K hasta ultra maratón.', 'image', 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600&q=80'),
      jsonb_build_object('title', 'DUATLÓN', 'sub', 'Duatletas', 'desc', 'Preparación integral para competencias de carrera y ciclismo.', 'image', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80'),
      jsonb_build_object('title', 'TRIATLÓN', 'sub', 'Triatletas', 'desc', 'Entrenamiento completo: natación, ciclismo y carrera a pie.', 'image', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80')
    )
  )),
  ('group_classes', jsonb_build_object(
    'label', '● Entrenamiento en el Parque',
    'title_line_1', 'CLASES',
    'title_line_2', 'GRUPALES',
    'time', '19:30',
    'days', jsonb_build_array('MARTES', 'JUEVES', 'VIERNES'),
    'plans', jsonb_build_array(
      jsonb_build_object('name', 'Plan Grupal', 'desc', 'Entrenamiento grupal en el parque'),
      jsonb_build_object('name', 'Plan Grupal + Gimnasio', 'desc', 'Grupal con plan de gimnasio complementario')
    ),
    'bg_image', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&q=80',
    'side_image', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80'
  )),
  ('team_gallery', jsonb_build_object(
    'label', '● Comunidad',
    'title_line_1', 'NUESTRO',
    'title_line_2', 'EQUIPO',
    'description', 'Más que un equipo de entrenamiento, somos una comunidad de atletas apasionados por superarse.',
    'items', jsonb_build_array(
      jsonb_build_object('image', '/images/carrera.jpeg', 'label', 'Carrera', 'large', true),
      jsonb_build_object('image', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80', 'label', 'Natación', 'large', false),
      jsonb_build_object('image', 'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=400&q=80', 'label', 'Ciclismo', 'large', false),
      jsonb_build_object('image', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', 'label', 'Fuerza', 'large', false),
      jsonb_build_object('image', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=700&q=80', 'label', 'Equipo', 'large', false)
    )
  )),
  ('contact', jsonb_build_object(
    'phone', '+5493516XXXXXX',
    'phone_display', '351 6XX XXXX',
    'email', 'gc2entrenamiento@gmail.com',
    'whatsapp_link', 'https://wa.me/5493516XXXXXX',
    'instagram_user', '@gc2entrenamientoderesistencia',
    'instagram_link', 'https://www.instagram.com/gc2entrenamientoderesistencia',
    'city', 'Córdoba, Argentina'
  ))
on conflict (key) do nothing;

-- =============================================================
-- 7. Seed: coaches
-- =============================================================
insert into public.coaches (slug, name, specialty, short_desc, bio_long, photo_url, ig_handle, ig_url, certifications, achievements, services, display_order)
values
  (
    'geronimo-gallardo',
    'Geronimo Gallardo',
    'Head Coach Triatlón',
    'Especialista en transiciones y optimización del rendimiento en el agua. Planificación de largas distancias.',
    'Entrenador con foco en triatlón olímpico y larga distancia. Trabajo con atletas amateur y de elite, planificando temporadas completas que incluyen evaluación funcional, periodización y ajuste continuo según los datos de cada bloque. Mi enfoque combina técnica de natación, potencia en bici y resistencia específica en running.',
    '/images/geronimo-gallardo.jpg',
    '@gero_gallardoo',
    'https://instagram.com/gero_gallardoo',
    array['Profesor Nacional de Educación Física', 'Entrenador de Triatlón certificado', 'Capacitación en natación de aguas abiertas'],
    array['Multiple finisher Ironman 70.3', 'Coach de atletas con podio en triatlón nacional'],
    array['Plan personalizado triatlón', 'Asesoría de transiciones', 'Planificación de temporadas'],
    0
  ),
  (
    'luis-cassinelli',
    'Luis Cassinelli',
    'Especialista en Running y Trail',
    'Experiencia en ultramaratones. Enfocado en la técnica de carrera y dosificación de cargas.',
    'Vengo del running de larga distancia y trail. Acompaño a corredores desde su primer 10K hasta ultras de 100K, con trabajo fuerte en técnica, economía de carrera y dosificación inteligente del volumen. Cada plan se construye sobre evaluación funcional y testeos periódicos.',
    '/images/luis-cassinelli.jpg',
    '@luiscassinelli_',
    'https://instagram.com/luiscassinelli_',
    array['Profesor Nacional de Educación Física', 'Especialización en entrenamiento de larga distancia'],
    array['Finisher de múltiples ultramaratones', 'Acompañamiento a corredores en sub-3 maratón'],
    array['Plan running personalizado', 'Plan trail', 'Preparación de objetivos específicos (21K / 42K / Ultra)'],
    1
  ),
  (
    'micaela-perez',
    'Micaela Perez',
    'Preparación Física y Fuerza',
    'Prevención de lesiones, movilidad y fortalecimiento específico para deportes de resistencia.',
    'Especializada en preparación física para deportes de resistencia. Diseño planes de fuerza y movilidad que complementan el trabajo de carrera, bici y natación, con foco en prevención de lesiones y mejora de la economía de carrera. Trabajo presencial en gimnasio y a distancia con seguimiento semanal.',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    '@profe3_fit',
    'https://instagram.com/profe3_fit',
    array['Profesora Nacional de Educación Física', 'Especialización en entrenamiento de la fuerza'],
    array['Acompañamiento a atletas con cero lesiones en temporadas completas'],
    array['Plan de gimnasio para corredores', 'Plan de fuerza para triatletas', 'Movilidad y prevención de lesiones'],
    2
  )
on conflict (slug) do nothing;

-- =============================================================
-- 8. Seed: plans
-- =============================================================
insert into public.plans (category, name, name_display, badge, features, featured, display_order) values
  ('runner', 'A', 'A', 'Popular',
    array['Entrenamiento Individualizado', 'Corredores de todos los niveles y distancias', 'Evaluación Funcional y Testeos', 'Plan de Gimnasio'],
    true, 0),
  ('runner', 'B', 'B', null,
    array['Entrenamiento Individualizado', 'Corredores de todos los niveles y distancias', 'Evaluación Funcional y Testeos', 'Batería de Ejercicios de Movilidad y Activadores'],
    false, 1),
  ('runner', 'C', 'C', null,
    array['Entrenamiento Individualizado', 'Corredores de todos los niveles y distancias', 'Evaluación Funcional y Testeos'],
    false, 2),
  ('triathlon', '1', '1', null,
    array['Programa para Triatletas a Distancia'],
    false, 0),
  ('triathlon', '2', '2', 'Recomendado',
    array['Programa para Triatletas a Distancia', 'Evaluación Funcional'],
    true, 1),
  ('triathlon', '3', '3', null,
    array['Programa para Triatletas a Distancia', 'Evaluación Funcional', 'Entrenamiento en Gimnasio'],
    false, 2),
  ('group', 'Grupal', 'Grupal', null,
    array['Entrenamiento grupal en el parque', 'Martes, Jueves y Viernes — 19:30 hs'],
    false, 0),
  ('group', 'Grupal + Gimnasio', 'Grupal + Gimnasio', '+ Completo',
    array['Entrenamiento grupal en el parque', 'Plan de Gimnasio complementario', 'Martes, Jueves y Viernes — 19:30 hs'],
    true, 1)
on conflict do nothing;
