import { createClient } from '@/lib/supabase-server'
import PageTransition from '@/components/PageTransition'
import CalendarShell from '@/components/CalendarShell'
import type { DbCalendarEvent } from '@/lib/calendar'

export const dynamic = 'force-dynamic'

export default async function CalendarioPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  return (
    <PageTransition>
      <header className="mt-2">
        <h1
          className="font-display leading-tight"
          style={{ fontSize: 38, fontWeight: 500, color: '#5a47b0' }}
        >
          Nuestro Calendario
        </h1>
        <p className="text-sm" style={{ color: '#9888d0' }}>
          fechas especiales, planes y nuestro día 11
        </p>
      </header>

      {user && (
        <CalendarShell
          currentUserId={user.id}
          initialEvents={(events as DbCalendarEvent[]) ?? []}
          names={names}
        />
      )}
    </PageTransition>
  )
}
