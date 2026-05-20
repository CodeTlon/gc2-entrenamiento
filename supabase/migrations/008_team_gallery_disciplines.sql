-- Reemplaza la galería "Nuestro Equipo" (5 fotos, una grande) por una
-- de 4 disciplinas: Running, Ciclismo, Natación y Fuerza.
update public.site_settings
set
  value = jsonb_build_object(
    'label', '● En acción',
    'title_line_1', 'ENTRENAMIENTO',
    'title_line_2', 'EN ACCIÓN',
    'description', 'Running, ciclismo, natación y trabajo de fuerza.',
    'items', jsonb_build_array(
      jsonb_build_object('image', '/images/carrera.jpeg', 'label', 'Running', 'large', false),
      jsonb_build_object('image', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80', 'label', 'Ciclismo', 'large', false),
      jsonb_build_object('image', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80', 'label', 'Natación', 'large', false),
      jsonb_build_object('image', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80', 'label', 'Fuerza', 'large', false)
    )
  ),
  updated_at = now()
where key = 'team_gallery';
