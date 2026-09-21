# PROJECT — GC² Entrenamiento

## Qué es (FACT)

Sitio web oficial de **GC² Entrenamiento de la Resistencia**, un equipo de entrenamiento en Córdoba, Argentina, para corredores, duatletas y triatletas. El sitio tiene dos partes:

1. **Sitio público**: home, planes de entrenamiento, blog, información de disciplinas/entrenadores/sedes, formulario de contacto.
2. **Dashboard administrativo (CMS interno)** en `/dashboard`: permite editar todo el contenido del sitio (hero, secciones, coaches, planes, posts de blog, categorías, configuración de contacto) sin tocar código ni depender de un desarrollador.

## Para quién (FACT, inferido del dominio y contenido)

- **Público del sitio**: corredores/duatletas/triatletas de Córdoba buscando planes de entrenamiento o información del equipo — leen el blog, ven planes, dejan datos de contacto (`contact_leads`).
- **Usuarios del dashboard**: staff/coaches de GC² con cuenta en Supabase Auth — editan contenido, gestionan leads, publican posts.

## Qué problema resuelve (FACT)

Antes de este proyecto, el sitio era PHP+SCSS estático sin forma de editar contenido sin un desarrollador (ver `docs/README.md`, migración legacy). Este proyecto migró a Next.js con un CMS propio para que el equipo de GC² pueda autogestionar el contenido.

## Estado real (FACT)

- **En producción**, sirviendo tráfico real. Dominio: `gc2entrenamientoderesistencia.com.ar`.
- Desplegado en Vercel con auto-deploy on push a `main` (ver `ARCHITECTURE.md` para la cadena de deploy verificada).
- Hay datos reales en Supabase: leads de contacto reales, coaches reales, posts de blog reales.

## Alcance de negocio explícito (FACT, de `public/llms.txt`)

El sitio **no tiene e-commerce ni pricing público** — los planes se muestran con "más información" pero la venta/cierre es fuera del sitio (contacto directo). Confirmado también por ausencia de rutas de checkout en el código.
