import { createClient } from '@/lib/supabase-server'
import PageTransition from '@/components/PageTransition'
import ProfileEditor from '@/components/ProfileEditor'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, avatar_emoji, mood')
    .eq('id', user?.id ?? '')
    .maybeSingle()

  return (
    <PageTransition>
      <header className="mt-2">
        <h1
          className="font-display leading-tight"
          style={{ fontSize: 38, fontWeight: 500, color: '#5a47b0' }}
        >
          Perfil
        </h1>
        <p className="text-sm" style={{ color: '#9888d0' }}>
          cómo te ve tu amor
        </p>
      </header>

      {user && (
        <ProfileEditor
          profile={
            profile ?? {
              id: user.id,
              name: null,
              avatar_emoji: '🫧',
              mood: 'pensando en ti',
            }
          }
        />
      )}
    </PageTransition>
  )
}
