import { Suspense } from 'react'
import PageSkeleton from '@/components/PageSkeleton'
import HomeContent from './HomeContent'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <Suspense fallback={<PageSkeleton variant="home" />}>
      <HomeContent />
    </Suspense>
  )
}
