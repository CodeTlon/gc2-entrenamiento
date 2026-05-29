-- Migración 008: seed sedes en site_settings
-- Inserta las 3 ubicaciones de entrenamiento.
-- Si ya existe la clave 'locations', la sobreescribe con los 3 ítems base.

INSERT INTO site_settings (key, value, updated_at)
VALUES (
  'locations',
  '{
    "label": "● Dónde Entrenamos",
    "title_line_1": "NUESTRAS",
    "title_line_2": "SEDES",
    "items": [
      {
        "name": "El Mágico (UNC)",
        "description": "Clases grupales en el parque",
        "address": "Ciudad Universitaria, Córdoba",
        "maps_embed_url": "https://www.google.com/maps/embed?pb=!3m2!1ses-419!2sar!4v1780058116546!5m2!1ses-419!2sar!6m8!1m7!1srFPeRJVljjdrlPBDq16_Zg!2m2!1d-31.4412998702578!2d-64.18724155918402!3f93.49024385365615!4f-26.890717309723733!5f0.7820865974627469"
      },
      {
        "name": "Estadio Mario A. Kempes",
        "description": "Entrenamiento en pista",
        "address": "Av. Cárcano s/n, Córdoba",
        "maps_embed_url": ""
      },
      {
        "name": "Reserva San Martín",
        "description": "Entrenamiento en parque",
        "address": "Parque San Martín, Córdoba",
        "maps_embed_url": ""
      }
    ]
  }',
  now()
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
