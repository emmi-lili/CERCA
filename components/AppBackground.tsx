'use client'

import { usePathname } from 'next/navigation'

// Sky background for the authenticated app. The /auth flow (welcome + login)
// keeps its own backgrounds, so we skip it there.
export default function AppBackground() {
  const pathname = usePathname()
  if (pathname.startsWith('/auth')) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage: "url('/fondo-cielo.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }}
    />
  )
}
