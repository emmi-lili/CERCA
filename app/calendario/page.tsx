import { Suspense } from 'react'
import PageSkeleton from '@/components/PageSkeleton'
import CalendarioContent from './CalendarioContent'

export const dynamic = 'force-dynamic'

export default function CalendarioPage() {
  return (
    <>
      <header className="mt-2">
        <h1
          className="font-display leading-tight"
          style={{ fontSize: 38, fontWeight: 500, color: '#5a47b0' }}
        >
          Nuestro Calendario
        </h1>
        <p className="text-sm" style={{ color: '#9888d0' }}>
          fechas especiales, planes y nuestro día 11
        </p>
      </header>

      <Suspense fallback={<PageSkeleton variant="calendar" showHeader={false} />}>
        <CalendarioContent />
      </Suspense>
    </>
  )
}
