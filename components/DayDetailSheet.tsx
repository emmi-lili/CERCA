'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Pencil, Plane, Plus, Sparkles, Trash2, X } from 'lucide-react'
import EventForm, { type EventFormValues } from './EventForm'
import {
  formatDayLabel,
  getEventsForDay,
  type CalendarEvent,
} from '@/lib/calendar'

type Props = {
  iso: string | null
  events: CalendarEvent[]
  names: Record<string, string>
  onClose: () => void
  onCreate: (iso: string, values: EventFormValues) => Promise<void>
  onUpdate: (event: CalendarEvent, values: EventFormValues) => Promise<void>
  onDelete: (event: CalendarEvent) => Promise<void>
}

function EventKindIcon({ kind }: { kind: CalendarEvent['kind'] }) {
  if (kind === 'anniversary') return <Heart size={16} color="#d878a8" fill="#e8a0c8" />
  if (kind === 'plan') return <Plane size={16} color="#6898d8" />
  return <Sparkles size={16} color="#9878c8" />
}

function kindLabel(kind: CalendarEvent['kind']) {
  if (kind === 'anniversary') return 'Aniversario'
  if (kind === 'plan') return 'Plan'
  return 'Fecha importante'
}

export default function DayDetailSheet({
  iso,
  events,
  names,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editing, setEditing] = useState<CalendarEvent | null>(null)
  const [busy, setBusy] = useState(false)

  const dayEvents = iso ? getEventsForDay(events, iso) : []

  const reset = () => {
    setMode('list')
    setEditing(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleCreate = async (values: EventFormValues) => {
    if (!iso) return
    setBusy(true)
    try {
      await onCreate(iso, values)
      reset()
    } finally {
      setBusy(false)
    }
  }

  const handleUpdate = async (values: EventFormValues) => {
    if (!editing) return
    setBusy(true)
    try {
      await onUpdate(editing, values)
      reset()
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (event: CalendarEvent) => {
    setBusy(true)
    try {
      await onDelete(event)
      if (editing?.id === event.id) reset()
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      {iso && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 px-4 pb-28 pt-8"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="glass-strong w-full max-w-[390px] max-h-[70dvh] overflow-y-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2
                  className="font-display text-xl capitalize"
                  style={{ color: '#5a47b0', fontWeight: 600 }}
                >
                  {formatDayLabel(iso)}
                </h2>
                <p className="text-xs" style={{ color: '#9888d0' }}>
                  {dayEvents.length === 0
                    ? 'Sin eventos este día'
                    : `${dayEvents.length} evento${dayEvents.length === 1 ? '' : 's'}`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: 'rgba(255,255,255,0.6)' }}
              >
                <X size={16} color="#9888d0" />
              </button>
            </div>

            {mode === 'list' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  {dayEvents.length === 0 && (
                    <p className="text-sm text-center py-4" style={{ color: '#b8aee0' }}>
                      Todavía no hay nada marcado
                    </p>
                  )}

                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="glass flex items-start gap-3 px-4 py-3"
                    >
                      <div className="mt-0.5">
                        <EventKindIcon kind={event.kind} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: '#3a2e6e' }}>
                          {event.title}
                        </p>
                        <p className="text-xs" style={{ color: '#9888d0' }}>
                          {kindLabel(event.kind)}
                          {event.event_time ? ` · ${event.event_time.slice(0, 5)}` : ''}
                          {event.author_id && names[event.author_id]
                            ? ` · ${names[event.author_id]}`
                            : ''}
                        </p>
                        {event.description && (
                          <p className="mt-1 text-xs" style={{ color: '#7868b0' }}>
                            {event.description}
                          </p>
                        )}
                      </div>
                      {!event.isVirtual && (
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(event)
                              setMode('edit')
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full"
                            style={{ background: 'rgba(255,255,255,0.55)' }}
                          >
                            <Pencil size={14} color="#9888d0" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(event)}
                            disabled={busy}
                            className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-50"
                            style={{ background: 'rgba(255,255,255,0.55)' }}
                          >
                            <Trash2 size={14} color="#c47878" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setMode('create')}
                  className="flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg,#8878c4,#5a47b0)' }}
                >
                  <Plus size={16} />
                  Agregar evento
                </button>
              </div>
            )}

            {mode === 'create' && (
              <EventForm
                eventDate={iso}
                saving={busy}
                onSubmit={handleCreate}
                onCancel={reset}
              />
            )}

            {mode === 'edit' && editing && (
              <EventForm
                eventDate={iso}
                initial={editing}
                saving={busy}
                onSubmit={handleUpdate}
                onCancel={reset}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
