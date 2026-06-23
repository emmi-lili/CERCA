import { createClient } from '@/lib/supabase-server'
import { getAuthUser } from '@/lib/auth'
import GamesShell from '@/components/GamesShell'
import { type Answer } from '@/components/QuestionCard'

export default async function JuegosContent() {
  const supabase = createClient()
  const user = await getAuthUser()

  const [{ data: answers }, { data: profiles }, { data: firstEntry }] =
    await Promise.all([
      supabase
        .from('question_games')
        .select('id, question_index, author_id, answer, created_at')
        .order('created_at', { ascending: true }),
      supabase.from('profiles').select('id, name'),
      supabase
        .from('journal_entries')
        .select('created_at')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
    ])

  if (!user) return null

  const partner = (profiles ?? []).find((p) => p.id !== user.id)
  const partnerName = partner?.name ?? 'tu amor'

  return (
    <GamesShell
      currentUserId={user.id}
      partnerName={partnerName}
      initialAnswers={(answers as Answer[]) ?? []}
      firstEntryDate={firstEntry?.created_at ?? null}
    />
  )
}
