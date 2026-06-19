'use client'

import { useState } from 'react'
import type { CalendarEvent } from '@/lib/calendar'

export type EventFormValues = {
  kind: 'plan' | 'important'
  title: string
  description: string
  event_time: string
  event_date?: string
}

type Props = {
  eventDate: string
  initial?: CalendarEvent | null
  saving?: boolean
  allowDateEdit?: boolean
  onSubmit: (values: EventFormValues) => Promise<void>
  onCancel: () => void
}

const KINDS: { id: 'plan' | 'important'; label: string }[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'important', label: 'Fecha importante' },
]

export default function EventForm({
  eventDate,
  initial,
  saving = false,
  allowDateEdit = false,
  onSubmit,
  onCancel,
}: Props) {
  const [kind, setKind] = useState<'plan' | 'important'>(
    initial?.kind === 'important' ? 'important' : 'plan',
  )
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [eventTime, setEventTime] = useState(initial?.event_time?.slice(0, 5) ?? '')
  const [date, setDate] = useState(eventDate)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || saving || !date) return
    await onSubmit({
      kind,
      title: trimmed,
      description: description.trim(),
      event_time: eventTime,
      ...(allowDateEdit ? { event_date: date } : {}),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        {KINDS.map((item) => {
          const active = kind === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setKind(item.id)}
              className="flex-1 rounded-full px-3 py-2 text-xs font-medium transition-all"
              style={{
                background: active ? 'rgba(136,120,196,0.22)' : 'rgba(255,255,255,0.5)',
                color: active ? '#5a47b0' : '#9888d0',
                border: active
                  ? '1px solid rgba(90,71,176,0.4)'
                  : '0.5px solid rgba(180,160,240,0.25)',
              }}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide" style={{ color: '#9888d0' }}>
          Título
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={kind === 'plan' ? 'Cena, paseo, llamada…' : 'Cumpleaños, examen…'}
          required
          className="w-full rounded-2xl bg-white/60 px-4 py-2.5 text-base"
          style={{ color: '#3a2e6e', border: '0.5px solid rgba(180,160,240,0.35)' }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide" style={{ color: '#9888d0' }}>
          Nota (opcional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Algún detalle extra"
          className="w-full resize-none rounded-2xl bg-white/60 px-4 py-2.5 text-base"
          style={{ color: '#3a2e6e', border: '0.5px solid rgba(180,160,240,0.35)' }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide" style={{ color: '#9888d0' }}>
          Hora (opcional)
        </label>
        <input
          type="time"
          value={eventTime}
          onChange={(e) => setEventTime(e.target.value)}
          className="w-full rounded-2xl bg-white/60 px-4 py-2.5 text-base"
          style={{ color: '#3a2e6e', border: '0.5px solid rgba(180,160,240,0.35)' }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-wide" style={{ color: '#9888d0' }}>
          Fecha
        </label>
        {allowDateEdit ? (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-2xl bg-white/60 px-4 py-2.5 text-base"
            style={{ color: '#3a2e6e', border: '0.5px solid rgba(180,160,240,0.35)' }}
          />
        ) : (
          <p className="rounded-2xl bg-white/40 px-4 py-2.5 text-sm capitalize" style={{ color: '#3a2e6e' }}>
            {eventDate}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full px-4 py-3 text-sm"
          style={{ color: '#9888d0' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="flex-1 rounded-full px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#8878c4,#5a47b0)' }}
        >
          {saving ? 'Guardando…' : initial ? 'Guardar' : 'Agregar'}
        </button>
      </div>
    </form>
  )
}
