import { createClient } from '@/lib/supabase-server'
import { getAuthUser } from '@/lib/auth'
import Countdown from '@/components/Countdown'
import PartnerStatus, { type Profile } from '@/components/PartnerStatus'
import SendDetail from '@/components/SendDetail'
import { getReunionRemaining } from '@/lib/countdown'

export default async function HomeContent() {
  const supabase = createClient()
  const user = await getAuthUser()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, avatar_emoji, mood, last_seen')

  const me = (profiles as Profile[] | null)?.find((p) => p.id === user?.id)

  return (
    <>
      <header className="mt-2">
        <p className="text-sm" style={{ color: '#9888d0' }}>
          Hola{me?.name ? `, ${me.name}` : ''}
        </p>
        <h1
          className="font-display leading-tight"
          style={{ fontSize: 38, fontWeight: 500, color: '#5a47b0' }}
        >
          Cada segundo, más cerca
        </h1>
      </header>

      <Countdown initial={getReunionRemaining()} />

      <section className="flex flex-col gap-3">
        <h2
          className="text-xs uppercase tracking-[0.2em]"
          style={{ color: '#9888d0' }}
        >
          Nosotros
        </h2>
        {user && (
          <PartnerStatus
            currentUserId={user.id}
            initialProfiles={(profiles as Profile[]) ?? []}
          />
        )}
      </section>

      {user && <SendDetail currentUserId={user.id} />}
    </>
  )
}
