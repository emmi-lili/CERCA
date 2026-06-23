import { Suspense } from 'react'
import PageSkeleton from '@/components/PageSkeleton'
import JuegosContent from './JuegosContent'

export const dynamic = 'force-dynamic'

export default function JuegosPage() {
  return (
    <>
      <header className="mt-2">
        <h1
          className="font-display leading-tight"
          style={{ fontSize: 38, fontWeight: 500, color: '#5a47b0' }}
        >
          Juegos
        </h1>
        <p className="text-sm" style={{ color: '#9888d0' }}>
          conócete, crece, descúbrenos
        </p>
      </header>

      <Suspense fallback={<PageSkeleton variant="cards" showHeader={false} />}>
        <JuegosContent />
      </Suspense>
    </>
  )
}
