'use client'

import { useEffect } from 'react'

// Keeps the service worker up to date and avoids stale HTML after deploys.
// Stale HTML points at old /_next/static/css/* hashes → 404 → no Tailwind.
export default function SwUpdate() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((reg) => reg.update())
      .catch(() => {})
  }, [])

  return null
}
