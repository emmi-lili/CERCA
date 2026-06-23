import { createClient } from '@/lib/supabase-server'
import { getAuthUser } from '@/lib/auth'
import JournalFeed, { type JournalEntry } from '@/components/JournalFeed'

export default async function DiarioContent() {
  const supabase = createClient()
  const user = await getAuthUser()

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

  if (!user) return null

  return (
    <JournalFeed
      currentUserId={user.id}
      initialEntries={(entries as JournalEntry[]) ?? []}
      names={names}
    />
  )
}
