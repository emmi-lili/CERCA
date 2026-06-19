import { ANNIVERSARY_DAY, ANNIVERSARY_TITLE } from './constants'

export type CalendarEventKind = 'anniversary' | 'plan' | 'important'

export type DbCalendarEvent = {
  id: string
  couple_id: string
  author_id: string | null
  kind: 'plan' | 'important'
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  created_at: string
  updated_at: string
}

export type CalendarEvent = {
  id: string
  kind: CalendarEventKind
  title: string
  description: string | null
  event_date: string
  event_time: string | null
  author_id: string | null
  isVirtual?: boolean
}

export type MonthDay = {
  date: Date
  day: number
  inMonth: boolean
  iso: string
}

export type UpcomingEvent = CalendarEvent & {
  daysUntil: number
  label: string
}

const WEEKDAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

export function getWeekdayLabels(): string[] {
  return WEEKDAY_LABELS
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function startOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function daysBetween(start: Date, end: Date): number {
  const a = startOfDay(start)
  const b = startOfDay(end)
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

export function getMonthDays(year: number, month: number): MonthDay[] {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay()
  const gridStart = new Date(year, month, 1 - startOffset)
  const days: MonthDay[] = []

  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
    days.push({
      date,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      iso: toIsoDate(date),
    })
  }

  return days
}

export function getAnniversaryForMonth(year: number, month: number): CalendarEvent {
  const date = new Date(year, month, ANNIVERSARY_DAY)
  return {
    id: `anniversary-${year}-${month + 1}`,
    kind: 'anniversary',
    title: ANNIVERSARY_TITLE,
    description: null,
    event_date: toIsoDate(date),
    event_time: null,
    author_id: null,
    isVirtual: true,
  }
}

export function getAnniversaryEventsInRange(from: Date, to: Date): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1)
  const end = new Date(to.getFullYear(), to.getMonth(), 1)

  while (cursor <= end) {
    const anniversary = getAnniversaryForMonth(cursor.getFullYear(), cursor.getMonth())
    const anniversaryDate = parseIsoDate(anniversary.event_date)
    if (anniversaryDate >= startOfDay(from) && anniversaryDate <= startOfDay(to)) {
      events.push(anniversary)
    }
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return events
}

export function dbEventToCalendarEvent(event: DbCalendarEvent): CalendarEvent {
  return {
    id: event.id,
    kind: event.kind,
    title: event.title,
    description: event.description,
    event_date: event.event_date,
    event_time: event.event_time,
    author_id: event.author_id,
  }
}

export function getEventsForDay(events: CalendarEvent[], iso: string): CalendarEvent[] {
  return events.filter((e) => e.event_date === iso)
}

export function getEventKindsForDay(events: CalendarEvent[], iso: string): CalendarEventKind[] {
  const kinds = new Set<CalendarEventKind>()
  for (const event of getEventsForDay(events, iso)) {
    kinds.add(event.kind)
  }
  return Array.from(kinds)
}

export function mergeCalendarEvents(
  dbEvents: DbCalendarEvent[],
  from: Date,
  to: Date,
): CalendarEvent[] {
  const mapped = dbEvents.map(dbEventToCalendarEvent)
  const virtual = getAnniversaryEventsInRange(from, to)
  return [...mapped, ...virtual]
}

export function formatMonthYear(year: number, month: number): string {
  const label = new Date(year, month, 1).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatDayLabel(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function formatUpcomingLabel(daysUntil: number): string {
  if (daysUntil === 0) return 'Hoy'
  if (daysUntil === 1) return 'Mañana'
  return `${daysUntil} días`
}

export function getUpcomingEvents(
  dbEvents: DbCalendarEvent[],
  fromDate: Date = new Date(),
  limit = 5,
): UpcomingEvent[] {
  const today = startOfDay(fromDate)
  const horizon = new Date(today)
  horizon.setMonth(horizon.getMonth() + 14)

  const all = mergeCalendarEvents(dbEvents, today, horizon)
  const upcoming = all
    .map((event) => {
      const daysUntil = daysBetween(today, parseIsoDate(event.event_date))
      return {
        ...event,
        daysUntil,
        label: formatUpcomingLabel(daysUntil),
      }
    })
    .filter((event) => event.daysUntil >= 0)
    .sort((a, b) => {
      if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil
      return a.event_date.localeCompare(b.event_date)
    })

  return upcoming.slice(0, limit)
}

export function isSameIso(iso: string, date: Date = new Date()): boolean {
  return iso === toIsoDate(date)
}
