import { Suspense } from 'react'
import PageSkeleton from '@/components/PageSkeleton'
import PerfilContent from './PerfilContent'

export const dynamic = 'force-dynamic'

export default function PerfilPage() {
  return (
    <>
      <header className="mt-2">
        <h1
          className="font-display leading-tight"
          style={{ fontSize: 38, fontWeight: 500, color: '#5a47b0' }}
        >
          Perfil
        </h1>
        <p className="text-sm" style={{ color: '#9888d0' }}>
          cómo te ve tu amor
        </p>
      </header>

      <Suspense fallback={<PageSkeleton variant="profile" showHeader={false} />}>
        <PerfilContent />
      </Suspense>
    </>
  )
}
