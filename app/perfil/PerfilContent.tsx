import { createClient } from '@/lib/supabase-server'
import { getAuthUser } from '@/lib/auth'
import ProfileEditor from '@/components/ProfileEditor'

export default async function PerfilContent() {
  const supabase = createClient()
  const user = await getAuthUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, avatar_emoji, mood')
    .eq('id', user.id)
    .maybeSingle()

  return (
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
  )
}
