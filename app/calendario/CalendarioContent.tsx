import { createClient } from '@/lib/supabase-server'
import { getAuthUser } from '@/lib/auth'
import CalendarShell from '@/components/CalendarShell'
import type { DbCalendarEvent } from '@/lib/calendar'

export default async function CalendarioContent() {
  const supabase = createClient()
  const user = await getAuthUser()

  const [{ data: events }, { data: profiles }] = await Promise.all([
    supabase
      .from('calendar_events')
      .select(
        'id, couple_id, author_id, kind, title, description, event_date, event_time, created_at, updated_at',
      )
      .order('event_date', { ascending: true }),
    supabase.from('profiles').select('id, name'),
  ])

  const names: Record<string, string> = {}
  for (const p of profiles ?? []) {
    if (p.id) names[p.id] = p.name ?? 'amor'
  }

  if (!user) return null

  return (
    <CalendarShell
      currentUserId={user.id}
      initialEvents={(events as DbCalendarEvent[]) ?? []}
      names={names}
    />
  )
}
