import { createClient } from '@/lib/supabase-server'
import PageTransition from '@/components/PageTransition'
import GamesShell from '@/components/GamesShell'
import { type Answer } from '@/components/QuestionCard'
import { getTodayQuestionIndex } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function JuegosPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  const todayIndex = getTodayQuestionIndex(firstEntry?.created_at ?? null)
  const partner = (profiles ?? []).find((p) => p.id !== user?.id)
  const partnerName = partner?.name ?? 'tu amor'

  return (
    <PageTransition>
      <header className="mt-2">
        <h1
          className="font-display leading-tight"
          style={{ fontSize: 38, fontWeight: 500, color: '#5a47b0' }}
        >
          Juegos
        </h1>
        <p className="text-sm" style={{ color: '#9888d0' }}>
          conócete, crece, descúbrenos
        </p>
      </header>

      {user && (
        <GamesShell
          currentUserId={user.id}
          partnerName={partnerName}
          todayIndex={todayIndex}
          initialAnswers={(answers as Answer[]) ?? []}
          firstEntryDate={firstEntry?.created_at ?? null}
        />
      )}
    </PageTransition>
  )
}
