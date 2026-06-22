import {
  APP_START_DATE,
  APP_TIMEZONE,
  QUESTIONS_CONOCERNOS,
  QUESTION_UNLOCK_HOUR,
} from './constants'

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

type DateParts = { year: number; month: number; day: number; hour: number }

function getDatePartsInTimezone(date: Date, timeZone: string): DateParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(date)

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0)

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
  }
}

function toCalendarDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day)
}

// Calendar day used for unlock counting — before QUESTION_UNLOCK_HOUR counts as
// the previous day so both sections stay in sync with the 10 AM push.
export function getEffectiveUnlockDate(
  now = new Date(),
  unlockHour: number = QUESTION_UNLOCK_HOUR,
  timeZone: string = APP_TIMEZONE,
): Date {
  const { year, month, day, hour } = getDatePartsInTimezone(now, timeZone)
  const calendarDate = toCalendarDate(year, month, day)
  if (hour < unlockHour) calendarDate.setDate(calendarDate.getDate() - 1)
  return calendarDate
}

export function isBeforeTodayQuestionUnlock(
  now = new Date(),
  unlockHour: number = QUESTION_UNLOCK_HOUR,
  timeZone: string = APP_TIMEZONE,
): boolean {
  const { hour } = getDatePartsInTimezone(now, timeZone)
  return hour < unlockHour
}

// One question unlocks per day at QUESTION_UNLOCK_HOUR since the app started.
// `startDate` is the created_at of the earliest journal entry, falling back to
// APP_START_DATE. Pass `maxLength` to clamp against a specific question list.
export function getTodayQuestionIndex(
  startDate?: string | Date | null,
  maxLength: number = QUESTIONS_CONOCERNOS.length,
  now = new Date(),
): number {
  const start = startDate ? new Date(startDate) : APP_START_DATE
  const startParts = getDatePartsInTimezone(start, APP_TIMEZONE)
  const startCalendar = toCalendarDate(
    startParts.year,
    startParts.month,
    startParts.day,
  )
  const effectiveEnd = getEffectiveUnlockDate(now)
  const elapsed = daysBetween(startCalendar, effectiveEnd)
  const index = Math.max(0, elapsed)
  return Math.min(index, maxLength - 1)
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
