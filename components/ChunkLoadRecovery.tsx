'use client'

import { useEffect } from 'react'

// After a deploy or HMR glitch, the browser can hold stale JS chunks.
// Webpack then throws "Cannot read properties of undefined (reading 'call')".
// A single hard reload picks up the current build.
export default function ChunkLoadRecovery() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const msg = event.message ?? ''
      if (
        msg.includes("reading 'call'") ||
        msg.includes('Loading chunk') ||
        msg.includes('Failed to fetch dynamically imported module')
      ) {
        window.location.reload()
      }
    }

    window.addEventListener('error', onError)
    return () => window.removeEventListener('error', onError)
  }, [])

  return null
}
