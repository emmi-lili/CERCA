import { Suspense } from 'react'
import PageSkeleton from '@/components/PageSkeleton'
import DiarioContent from './DiarioContent'

export const dynamic = 'force-dynamic'

export default function DiarioPage() {
  return (
    <>
      <header className="mt-2">
        <h1
          className="font-display leading-tight"
          style={{ fontSize: 38, fontWeight: 500, color: '#5a47b0' }}
        >
          Diario
        </h1>
        <p className="text-sm" style={{ color: '#9888d0' }}>
          nuestro pequeño rincón de palabras
        </p>
      </header>

      <Suspense fallback={<PageSkeleton variant="feed" showHeader={false} />}>
        <DiarioContent />
      </Suspense>
    </>
  )
}
