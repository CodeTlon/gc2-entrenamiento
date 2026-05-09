// GC² Entrenamiento — Constantes globales
// Extraídas de config.php

export const SITE_NAME = 'GC² Entrenamiento'
export const SITE_FULL_NAME = 'GC² Entrenamiento de la Resistencia'
export const SITE_DESC =
  'Equipo de entrenamiento para corredores, duatletas y triatletas. Planificación individualizada y grupal, presencial y a distancia.'
export const SITE_CITY = 'Córdoba, Argentina'
export const SITE_YEAR = '2026'

export const PHONE = '+5493516XXXXXX'
export const PHONE_DISPLAY = '351 6XX XXXX'
export const EMAIL = 'gc2entrenamiento@gmail.com'
export const WHATSAPP_LINK = 'https://wa.me/5493516XXXXXX'
export const INSTAGRAM_USER = '@gc2entrenamientoderesistencia'
export const INSTAGRAM_LINK = 'https://www.instagram.com/gc2entrenamientoderesistencia'

// Imágenes Unsplash (remotePatterns configurado en next.config.ts)
export const IMG_HERO = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1920&q=85'
export const IMG_ABOUT = 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=700&q=80'
export const IMG_RUNNING = 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600&q=80'
export const IMG_CYCLING = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80'
export const IMG_SWIMMING = 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80'
export const IMG_GROUP = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&q=80'
export const IMG_GROUP_SIDE = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80'

export const RUNNER_PLANS = [
  {
    name: 'A',
    featured: true,
    badge: 'Popular',
    features: [
      'Entrenamiento Individualizado',
      'Corredores de todos los niveles y distancias',
      'Evaluación Funcional y Testeos',
      'Plan de Gimnasio',
    ],
  },
  {
    name: 'B',
    featured: false,
    badge: null,
    features: [
      'Entrenamiento Individualizado',
      'Corredores de todos los niveles y distancias',
      'Evaluación Funcional y Testeos',
      'Batería de Ejercicios de Movilidad y Activadores',
    ],
  },
  {
    name: 'C',
    featured: false,
    badge: null,
    features: [
      'Entrenamiento Individualizado',
      'Corredores de todos los niveles y distancias',
      'Evaluación Funcional y Testeos',
    ],
  },
]

export const TRIATHLON_PLANS = [
  {
    name: '1',
    featured: false,
    badge: null,
    features: ['Programa para Triatletas a Distancia'],
  },
  {
    name: '2',
    featured: true,
    badge: 'Recomendado',
    features: [
      'Programa para Triatletas a Distancia',
      'Evaluación Funcional',
    ],
  },
  {
    name: '3',
    featured: false,
    badge: null,
    features: [
      'Programa para Triatletas a Distancia',
      'Evaluación Funcional',
      'Entrenamiento en Gimnasio',
    ],
  },
]

export const GROUP_PLANS = [
  {
    label: 'Grupal',
    name: 'Grupal',
    featured: false,
    badge: null,
    features: [
      'Entrenamiento grupal en el parque',
      'Martes, Jueves y Viernes — 19:30 hs',
    ],
  },
  {
    label: 'Grupal +',
    name: 'Grupal\n+ Gimnasio',
    nameDisplay: 'Grupal + Gimnasio',
    featured: true,
    badge: '+ Completo',
    features: [
      'Entrenamiento grupal en el parque',
      'Plan de Gimnasio complementario',
      'Martes, Jueves y Viernes — 19:30 hs',
    ],
  },
]

export const COACHES = [
  {
    name: 'Geronimo Gallardo',
    specialty: 'Head Coach Triatlón',
    desc: 'Especialista en transiciones y optimización del rendimiento en el agua. Planificación de largas distancias.',
    img: '/images/geronimo-gallardo.jpg',
    ig: '@gero_gallardoo',
    igLink: 'https://instagram.com/gero_gallardoo',
  },
  {
    name: 'Luis Cassinelli',
    specialty: 'Especialista en Running y Trail',
    desc: 'Experiencia en ultramaratones. Enfocado en la técnica de carrera y dosificación de cargas.',
    img: '/images/luis-cassinelli.jpg',
    ig: '@luiscassinelli_',
    igLink: 'https://instagram.com/luiscassinelli_',
  },
  {
    name: 'Micaela Perez',
    specialty: 'Preparación Física y Fuerza',
    desc: 'Prevención de lesiones, movilidad y fortalecimiento específico para deportes de resistencia.',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    ig: '@profe3_fit',
    igLink: 'https://instagram.com/profe3_fit',
  },
]
