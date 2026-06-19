'use client'

import { Cake, Heart, Plane } from 'lucide-react'
import type { UpcomingEvent } from '@/lib/calendar'

type Props = {
  events: UpcomingEvent[]
}

function EventIcon({ kind }: { kind: UpcomingEvent['kind'] }) {
  if (kind === 'anniversary') {
    return (
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{ background: 'rgba(232,160,200,0.25)' }}
      >
        <Cake size={18} color="#d878a8" />
      </div>
    )
  }
  if (kind === 'plan') {
    return (
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{ background: 'rgba(136,184,232,0.25)' }}
      >
        <Plane size={18} color="#6898d8" />
      </div>
    )
  }
  return (
    <div
      className="flex h-9 w-9 items-center justify-center rounded-full"
      style={{ background: 'rgba(196,160,232,0.25)' }}
    >
      <Heart size={18} color="#9878c8" fill="#c4a0e8" />
    </div>
  )
}

function badgeStyle(kind: UpcomingEvent['kind']) {
  if (kind === 'anniversary') {
    return { background: 'rgba(232,160,200,0.2)', color: '#c06090' }
  }
  if (kind === 'plan') {
    return { background: 'rgba(136,184,232,0.2)', color: '#5088c8' }
  }
  return { background: 'rgba(196,160,232,0.2)', color: '#7868b0' }
}

export default function UpcomingEvents({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: '#9888d0' }}
        >
          Próximos eventos
        </p>
        <div className="glass px-4 py-5 text-center text-sm" style={{ color: '#b8aee0' }}>
          No hay eventos próximos todavía
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: '#9888d0' }}
      >
        Próximos eventos
      </p>

      <div className="flex flex-col gap-2">
        {events.map((event) => {
          const badge = badgeStyle(event.kind)
          const subtitle =
            event.daysUntil === 0
              ? event.title
              : event.daysUntil === 1
                ? `Mañana · ${event.title}`
                : `${event.daysUntil} días · ${event.title}`

          return (
            <div
              key={event.id}
              className="glass flex items-center gap-3 px-4 py-3"
            >
              <span
                className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                style={badge}
              >
                {event.label}
              </span>
              <p className="flex-1 text-sm" style={{ color: '#3a2e6e' }}>
                {subtitle}
              </p>
              <EventIcon kind={event.kind} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
