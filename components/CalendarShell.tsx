'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { COUPLE_ID } from '@/lib/constants'
import {
  dbEventToCalendarEvent,
  formatMonthYear,
  getAnniversaryEventsInRange,
  getEventKindsForDay,
  getMonthDays,
  getUpcomingEvents,
  mergeCalendarEvents,
  type CalendarEvent,
  type DbCalendarEvent,
} from '@/lib/calendar'
import MonthGrid from './MonthGrid'
import UpcomingEvents from './UpcomingEvents'
import DayDetailSheet from './DayDetailSheet'
import type { EventFormValues } from './EventForm'

type Props = {
  currentUserId: string
  initialEvents: DbCalendarEvent[]
  names: Record<string, string>
}

export default function CalendarShell({
  currentUserId,
  initialEvents,
  names,
}: Props) {
  const supabase = useMemo(() => createClient(), [])
  const today = new Date()

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [dbEvents, setDbEvents] = useState<DbCalendarEvent[]>(initialEvents)
  const [selectedIso, setSelectedIso] = useState<string | null>(null)

  const monthDays = useMemo(
    () => getMonthDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  )

  const rangeStart = monthDays[0].date
  const rangeEnd = monthDays[monthDays.length - 1].date

  const allEvents = useMemo(
    () => mergeCalendarEvents(dbEvents, rangeStart, rangeEnd),
    [dbEvents, rangeStart, rangeEnd],
  )

  const upcoming = useMemo(
    () => getUpcomingEvents(dbEvents, today, 5),
    [dbEvents, today],
  )

  useEffect(() => {
    const channel = supabase
      .channel('calendar-events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'calendar_events' },
        (payload) => {
          const row = payload.new as DbCalendarEvent
          setDbEvents((prev) =>
            prev.some((e) => e.id === row.id) ? prev : [row, ...prev],
          )
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'calendar_events' },
        (payload) => {
          const row = payload.new as DbCalendarEvent
          setDbEvents((prev) => prev.map((e) => (e.id === row.id ? row : e)))
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'calendar_events' },
        (payload) => {
          const row = payload.old as { id: string }
          setDbEvents((prev) => prev.filter((e) => e.id !== row.id))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const getKindsForDay = (iso: string) => getEventKindsForDay(allEvents, iso)

  const handleCreate = async (iso: string, values: EventFormValues) => {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        couple_id: COUPLE_ID,
        author_id: currentUserId,
        kind: values.kind,
        title: values.title,
        description: values.description || null,
        event_date: iso,
        event_time: values.event_time || null,
      })
      .select()
      .single()

    if (!error && data) {
      setDbEvents((prev) =>
        prev.some((e) => e.id === data.id) ? prev : [data as DbCalendarEvent, ...prev],
      )
    }
  }

  const handleUpdate = async (event: CalendarEvent, values: EventFormValues) => {
    const { data, error } = await supabase
      .from('calendar_events')
      .update({
        kind: values.kind,
        title: values.title,
        description: values.description || null,
        event_time: values.event_time || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', event.id)
      .select()
      .single()

    if (!error && data) {
      setDbEvents((prev) =>
        prev.map((e) => (e.id === data.id ? (data as DbCalendarEvent) : e)),
      )
    }
  }

  const handleDelete = async (event: CalendarEvent) => {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', event.id)

    if (!error) {
      setDbEvents((prev) => prev.filter((e) => e.id !== event.id))
    }
  }

  const sheetEvents = useMemo(() => {
    if (!selectedIso) return []
    const dbForDay = dbEvents
      .filter((e) => e.event_date === selectedIso)
      .map(dbEventToCalendarEvent)
    const virtual = getAnniversaryEventsInRange(
      new Date(selectedIso),
      new Date(selectedIso),
    )
    return [...dbForDay, ...virtual]
  }, [selectedIso, dbEvents])

  return (
    <div className="mt-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.55)' }}
        >
          <ChevronLeft size={18} color="#8878c4" />
        </button>
        <h2
          className="font-display text-lg"
          style={{ color: '#5a47b0', fontWeight: 600 }}
        >
          {formatMonthYear(viewYear, viewMonth)}
        </h2>
        <button
          type="button"
          onClick={goNextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.55)' }}
        >
          <ChevronRight size={18} color="#8878c4" />
        </button>
      </div>

      <MonthGrid
        days={monthDays}
        selectedIso={selectedIso}
        onSelectDay={setSelectedIso}
        getKindsForDay={getKindsForDay}
      />

      <UpcomingEvents events={upcoming} />

      <DayDetailSheet
        iso={selectedIso}
        events={sheetEvents}
        names={names}
        onClose={() => setSelectedIso(null)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  )
}
