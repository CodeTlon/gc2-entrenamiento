-- GC² Entrenamiento — Tabla posts (blog)
-- Migración 002

create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  content      text not null,
  cover_image  text,
  published    boolean not null default false,
  created_at   timestamptz not null default now()
);

-- RLS
alter table public.posts enable row level security;

-- Lectura pública solo de posts publicados
create policy "Public can read published posts"
  on public.posts for select
  using (published = true);

-- Service role puede hacer todo
create policy "Service role has full access to posts"
  on public.posts for all
  using (auth.role() = 'service_role');

-- Seed: 3 artículos de ejemplo
insert into public.posts (title, slug, excerpt, content, cover_image, published) values
(
  'Guía para tu primer 21K en Córdoba',
  'guia-primer-21k-cordoba',
  'Todo lo que necesitás saber para prepararte y completar tu primera media maratón en Córdoba.',
  '<p>Correr 21 kilómetros es un logro increíble que requiere meses de preparación, disciplina y la guía correcta. En GC² Entrenamiento hemos acompañado a cientos de corredores en este desafío.</p>
<h2>¿Cuánto tiempo necesito?</h2>
<p>Para alguien sin experiencia previa en carreras, recomendamos entre 4 y 6 meses de preparación. Si ya venís corriendo regularmente, con 12 semanas de plan específico es suficiente.</p>
<h2>Los 3 pilares del entrenamiento</h2>
<ul>
  <li><strong>Volumen gradual:</strong> Aumentá el kilometraje semanal no más del 10% por semana.</li>
  <li><strong>Entrenamiento de calidad:</strong> Intervalos y tiradas largas son fundamentales.</li>
  <li><strong>Recuperación activa:</strong> Días de descanso y trabajos de fuerza previenen lesiones.</li>
</ul>
<p>Si querés un plan personalizado para tu primer 21K, <a href="/contacto">contactanos</a> y te armamos uno a tu medida.</p>',
  'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80',
  true
),
(
  'Triatlón Olímpico: cómo preparar las tres disciplinas',
  'triatlon-olimpico-preparacion',
  'Estrategias para balancear el entrenamiento de natación, ciclismo y running sin quemarte.',
  '<p>El triatlón olímpico (1.5km natación / 40km ciclismo / 10km running) es el formato más popular del mundo del tri. La clave es balancear las tres disciplinas sin descuidar ninguna.</p>
<h2>Distribución del volumen semanal</h2>
<p>Para un triatleta amateur con 8-10 horas disponibles por semana:</p>
<ul>
  <li><strong>Natación:</strong> 2 sesiones / 3-4km totales</li>
  <li><strong>Ciclismo:</strong> 2-3 sesiones / 80-120km totales</li>
  <li><strong>Running:</strong> 3 sesiones / 25-35km totales</li>
</ul>
<h2>La importancia de los ladrillos</h2>
<p>Los entrenamientos "ladrillo" (bici + running inmediato) son fundamentales para acostumbrar al cuerpo a las transiciones. Comenzá con 30min de bici + 10min de carrera e ir aumentando.</p>',
  'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80',
  true
),
(
  '5 ejercicios de fuerza para corredores',
  '5-ejercicios-fuerza-corredores',
  'El trabajo de gimnasio es clave para prevenir lesiones y mejorar el rendimiento en carrera.',
  '<p>Muchos corredores evitan el gimnasio pensando que el trabajo de fuerza los pondrá más lentos. Es exactamente lo contrario: la fuerza muscular es el pilar de una carrera eficiente y libre de lesiones.</p>
<h2>Los 5 ejercicios imprescindibles</h2>
<ol>
  <li><strong>Sentadilla búlgara:</strong> Trabaja glúteos y cuádriceps unilateralmente. Fundamental para la propulsión.</li>
  <li><strong>Hip thrust:</strong> Activa los glúteos, los músculos más importantes para correr.</li>
  <li><strong>Peso muerto rumano:</strong> Fortalece isquiotibiales y previene lesiones en la cadena posterior.</li>
  <li><strong>Plancha con variantes:</strong> Core estable = mejor transferencia de energía.</li>
  <li><strong>Saltos de cajón:</strong> Potencia explosiva para mejorar la cadencia.</li>
</ol>
<p>En GC² incluimos un plan de gimnasio complementario en varios de nuestros planes. <a href="/planes">Conocé las opciones</a>.</p>',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  true
);
