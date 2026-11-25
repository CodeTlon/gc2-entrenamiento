/** Componente genérico para inyectar cualquier schema JSON-LD (FAQPage, LocalBusiness, etc). */
export default function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
