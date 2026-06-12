import { createClient } from '@/lib/supabase-server'
import PageTransition from '@/components/PageTransition'
import JournalFeed, { type JournalEntry } from '@/components/JournalFeed'

export const dynamic = 'force-dynamic'

export default async function DiarioPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: entries }, { data: profiles }] = await Promise.all([
    supabase
      .from('journal_entries')
      .select('id, author_id, content, created_at')
      .order('created_at', { ascending: false }),
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
          Diario
        </h1>
        <p className="text-sm" style={{ color: '#9888d0' }}>
          nuestro pequeño rincón de palabras
        </p>
      </header>

      {user && (
        <JournalFeed
          currentUserId={user.id}
          initialEntries={(entries as JournalEntry[]) ?? []}
          names={names}
        />
      )}
    </PageTransition>
  )
}
