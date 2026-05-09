import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de GC² Entrenamiento.',
}

export default function TerminosPage() {
  return (
    <section className="py-section bg-blue-900 min-h-screen">
      <div className="container max-w-3xl pt-24">
        <p className="section-label mb-4">Legal</p>
        <h1
          className="font-heading font-black uppercase leading-tight mb-10"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
        >
          <span className="text-white">TÉRMINOS Y </span>
          <span className="gradient-text">CONDICIONES</span>
        </h1>

        <div className="prose-custom space-y-6 text-white/65 text-[15px] leading-relaxed">
          <p>
            Al acceder y utilizar el sitio web de <strong className="text-white">GC² Entrenamiento de la Resistencia</strong>,
            el usuario acepta los presentes términos y condiciones de uso.
          </p>

          <div>
            <h2 className="font-heading font-bold text-white uppercase text-lg mb-2">1. Uso del sitio</h2>
            <p>
              El contenido de este sitio es de carácter informativo. GC² Entrenamiento se reserva
              el derecho de modificar, actualizar o eliminar cualquier información sin previo aviso.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-bold text-white uppercase text-lg mb-2">2. Servicios</h2>
            <p>
              Los planes y servicios descritos en el sitio están sujetos a disponibilidad.
              La contratación de cualquier servicio implica la aceptación de las condiciones
              particulares comunicadas al momento de la consulta.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-bold text-white uppercase text-lg mb-2">3. Propiedad intelectual</h2>
            <p>
              Todo el contenido del sitio (textos, imágenes, logotipos, diseño) es propiedad de
              GC² Entrenamiento. Queda prohibida su reproducción total o parcial sin autorización expresa.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-bold text-white uppercase text-lg mb-2">4. Responsabilidad</h2>
            <p>
              GC² Entrenamiento no se responsabiliza por daños directos o indirectos derivados del
              uso de la información publicada en este sitio. El entrenamiento físico implica riesgos
              inherentes; se recomienda consultar a un profesional de la salud antes de iniciar
              cualquier programa.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-bold text-white uppercase text-lg mb-2">5. Modificaciones</h2>
            <p>
              Estos términos pueden actualizarse periódicamente. El uso continuado del sitio
              implica la aceptación de las versiones vigentes.
            </p>
          </div>

          <p className="text-white/35 text-xs pt-4">
            Última actualización: Córdoba, Argentina — 2026.
          </p>
        </div>
      </div>
    </section>
  )
}
