'use client'

import { startTransition, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

// Thin top bar that appears instantly on in-app navigation clicks.
export default function RouteProgress() {
  const pathname = usePathname()
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(false)
  }, [pathname])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a')
      if (!anchor || anchor.target === '_blank') return

      let url: URL
      try {
        url = new URL(anchor.href)
      } catch {
        return
      }

      if (
        url.origin === window.location.origin &&
        url.pathname !== pathname &&
        !url.pathname.startsWith('/auth')
      ) {
        startTransition(() => setActive(true))
      }
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [pathname])

  if (!active) return null

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-0 z-50 h-0.5 w-full max-w-[390px] -translate-x-1/2 overflow-hidden"
      aria-hidden
    >
      <div className="route-progress-bar h-full w-full" />
    </div>
  )
}
