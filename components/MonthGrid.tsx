'use client'

import type { CSSProperties } from 'react'
import { Heart, Plane, Sparkles } from 'lucide-react'
import {
  getWeekdayLabels,
  isSameIso,
  type CalendarEventKind,
  type MonthDay,
} from '@/lib/calendar'

type Props = {
  days: MonthDay[]
  selectedIso: string | null
  onSelectDay: (iso: string) => void
  getKindsForDay: (iso: string) => CalendarEventKind[]
}

function DayIndicator({ kinds }: { kinds: CalendarEventKind[] }) {
  if (kinds.length === 0) return <span className="h-3" />

  return (
    <div className="flex h-3 items-center justify-center gap-0.5">
      {kinds.includes('anniversary') && (
        <Heart size={8} fill="#e8a0c8" color="#e8a0c8" />
      )}
      {kinds.includes('important') && (
        <Sparkles size={8} color="#c4a0e8" />
      )}
      {kinds.includes('plan') && (
        <Plane size={8} color="#88b8e8" />
      )}
    </div>
  )
}

const GRID_7: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gap: 4,
}

export default function MonthGrid({
  days,
  selectedIso,
  onSelectDay,
  getKindsForDay,
}: Props) {
  const weekdays = getWeekdayLabels()

  return (
    <div className="glass-strong p-4">
      <div className="mb-3 grid grid-cols-7 gap-1" style={GRID_7}>
        {weekdays.map((label, i) => (
          <div
            key={`${label}-${i}`}
            className="text-center text-xs font-medium"
            style={{ color: '#9888d0' }}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1" style={GRID_7}>
        {days.map((cell) => {
          const kinds = getKindsForDay(cell.iso)
          const isToday = isSameIso(cell.iso)
          const isSelected = selectedIso === cell.iso

          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onSelectDay(cell.iso)}
              className="flex flex-col items-center rounded-xl py-1.5 transition-colors"
              style={{
                background: isSelected
                  ? 'rgba(136,120,196,0.22)'
                  : isToday
                    ? 'rgba(136,184,232,0.2)'
                    : 'transparent',
                opacity: cell.inMonth ? 1 : 0.35,
              }}
            >
              <span
                className="text-sm font-medium"
                style={{
                  color: isToday || isSelected ? '#5a47b0' : '#3a2e6e',
                  fontWeight: isToday ? 700 : 500,
                }}
              >
                {cell.day}
              </span>
              <DayIndicator kinds={kinds} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
