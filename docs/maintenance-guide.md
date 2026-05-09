# Guía de Mantenimiento — GC² Entrenamiento

## Tareas Comunes

### Agregar un artículo al blog

1. Ir a Supabase → Table Editor → `posts`
2. Click en "Insert row"
3. Completar los campos:
   - `title`: Título del artículo
   - `slug`: URL amigable (solo minúsculas, guiones) ej: `mi-primer-10k`
   - `excerpt`: Descripción corta (1-2 oraciones)
   - `content`: HTML del artículo
   - `cover_image`: URL de imagen de portada (Unsplash o subida a Supabase Storage)
   - `published`: `true` para publicar, `false` para borrador
4. Click en "Save"
5. El artículo aparece automáticamente en `/blog`

### Ver consultas recibidas por el formulario

1. Ir a Supabase → Table Editor → `contact_leads`
2. Las filas están ordenadas por `created_at` (más recientes arriba)
3. Se pueden exportar como CSV con el botón "Download CSV"

### Cambiar el número de WhatsApp

1. Editar `src/lib/constants.ts`
2. Cambiar `PHONE` y `WHATSAPP_LINK` con el número real
3. Hacer commit y push → Vercel re-deploya automáticamente

### Actualizar textos o copy

- Todos los textos están en los archivos de página correspondientes:
  - Home: `src/components/sections/` (Hero, About, Disciplines, etc.)
  - Planes: `src/app/planes/page.tsx`
  - Contacto: `src/app/contacto/page.tsx`
- Editar, commit, push → deploy automático en Vercel

### Cambiar imágenes del sitio

1. Subir la nueva imagen a `public/images/`
2. Referenciar con `/images/nombre-archivo.jpg`
3. O actualizar la URL en `src/lib/constants.ts` si es una imagen de sección

---

## Actualizaciones de Dependencias

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas (con precaución)
npm update

# Actualizar Next.js específicamente
npm install next@latest react@latest react-dom@latest
```

Después de cualquier actualización importante, correr los tests:
```bash
npm run build
npm run test:e2e
```

---

## Monitoreo y Logs

- **Deployments:** Vercel Dashboard → proyecto `gc2-entrenamiento`
- **Logs del servidor:** Vercel → Functions → ver logs en tiempo real
- **Emails enviados:** Resend Dashboard → Emails
- **Base de datos:** Supabase Dashboard → Table Editor

---

## Contacto Técnico

Desarrollado por **CodeTlon** — [codetlon.com](https://codetlon.com)

Para soporte técnico, consultas o nuevas funcionalidades contactar al equipo de desarrollo.
