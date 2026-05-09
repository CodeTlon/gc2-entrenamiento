import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y tratamiento de datos de GC² Entrenamiento.',
}

export default function PrivacidadPage() {
  return (
    <section className="py-section bg-blue-900 min-h-screen">
      <div className="container max-w-3xl pt-24">
        <p className="section-label mb-4">Legal</p>
        <h1
          className="font-heading font-black uppercase leading-tight mb-10"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
        >
          <span className="text-white">POLÍTICA DE </span>
          <span className="gradient-text">PRIVACIDAD</span>
        </h1>

        <div className="space-y-6 text-white/65 text-[15px] leading-relaxed">
          <p>
            En <strong className="text-white">GC² Entrenamiento de la Resistencia</strong> nos comprometemos
            a proteger la privacidad de los datos personales de quienes utilizan nuestro sitio web.
          </p>

          <div>
            <h2 className="font-heading font-bold text-white uppercase text-lg mb-2">1. Datos que recopilamos</h2>
            <p>
              A través del formulario de contacto recopilamos: nombre completo, dirección de email,
              número de teléfono, ciudad de residencia y el mensaje enviado.
              Estos datos son proporcionados voluntariamente por el usuario.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-bold text-white uppercase text-lg mb-2">2. Uso de los datos</h2>
            <p>
              Los datos recopilados se utilizan exclusivamente para responder consultas y
              comunicar información sobre nuestros servicios de entrenamiento.
              No compartimos información personal con terceros salvo requerimiento legal.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-bold text-white uppercase text-lg mb-2">3. Almacenamiento</h2>
            <p>
              Los datos se almacenan de forma segura mediante Supabase. Aplicamos medidas de
              seguridad técnicas y organizativas para proteger la información contra accesos
              no autorizados, alteración o divulgación.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-bold text-white uppercase text-lg mb-2">4. Cookies</h2>
            <p>
              El sitio puede utilizar cookies de analítica (Google Analytics) para comprender el
              uso del sitio de forma anónima. No utilizamos cookies de seguimiento publicitario.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-bold text-white uppercase text-lg mb-2">5. Derechos del usuario</h2>
            <p>
              Podés solicitar en cualquier momento el acceso, rectificación o eliminación de
              tus datos personales escribiéndonos a través del formulario de contacto del sitio.
            </p>
          </div>

          <div>
            <h2 className="font-heading font-bold text-white uppercase text-lg mb-2">6. Contacto</h2>
            <p>
              Para cualquier consulta relacionada con el tratamiento de tus datos podés
              escribirnos directamente desde la{' '}
              <a href="/contacto" className="text-accent hover:underline">página de contacto</a>.
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
