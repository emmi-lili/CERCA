import { APP_START_DATE, QUESTIONS } from './constants'

// Returns a short Spanish relative-time string ("hace 5 min", "ayer", ...).
export function formatRelativeTime(date: string | Date): string {
  const then = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - then.getTime()) / 1000)

  if (seconds < 30) return 'justo ahora'
  if (seconds < 60) return `hace ${seconds} s`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days} días`

  return then.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
  })
}

// Number of whole days elapsed between two dates (calendar-day aware).
function daysBetween(start: Date, end: Date): number {
  const a = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const b = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

// One question unlocks per day since the app first started being used.
// `startDate` is the created_at of the earliest journal entry, falling back to
// APP_START_DATE. The result is clamped to the available questions.
export function getTodayQuestionIndex(startDate?: string | Date | null): number {
  const start = startDate ? new Date(startDate) : APP_START_DATE
  const elapsed = daysBetween(start, new Date())
  const index = Math.max(0, elapsed)
  return Math.min(index, QUESTIONS.length - 1)
}

// True when a "last seen" timestamp is within the last 5 minutes.
export function isOnline(lastSeen: string | Date | null | undefined): boolean {
  if (!lastSeen) return false
  const then = typeof lastSeen === 'string' ? new Date(lastSeen) : lastSeen
  return Date.now() - then.getTime() < 5 * 60 * 1000
}

// Decodes a base64url VAPID public key into a Uint8Array for PushManager.
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}
