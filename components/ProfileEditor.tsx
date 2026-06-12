'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import NotificationSetup from './NotificationSetup'
import AvatarPulse from './AvatarPulse'

type Profile = {
  id: string
  name: string | null
  avatar_emoji: string | null
  mood: string | null
}

const EMOJIS = ['🫧', '💜', '🌙', '🌷', '☁️', '⭐', '🐰', '🧸', '🍓', '🦋']

export default function ProfileEditor({ profile }: { profile: Profile }) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [name, setName] = useState(profile.name ?? '')
  const [emoji, setEmoji] = useState(profile.avatar_emoji ?? '🫧')
  const [mood, setMood] = useState(profile.mood ?? 'pensando en ti')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    if (saving) return
    setSaving(true)
    setSaved(false)
    const { error } = await supabase
      .from('profiles')
      .update({
        name: name.trim() || 'amor',
        avatar_emoji: emoji,
        mood: mood.trim() || 'pensando en ti',
      })
      .eq('id', profile.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="glass-strong flex flex-col items-center gap-4 p-6">
        <AvatarPulse emoji={emoji} size={80} />

        <div className="flex w-full flex-col gap-1">
          <label className="text-xs uppercase tracking-wide" style={{ color: '#9888d0' }}>
            Tu nombre
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="tu nombre"
            className="w-full rounded-2xl bg-white/60 px-4 py-2.5 text-base"
            style={{ color: '#3a2e6e', border: '0.5px solid rgba(180,160,240,0.35)' }}
          />
        </div>

        <div className="flex w-full flex-col gap-1">
          <label className="text-xs uppercase tracking-wide" style={{ color: '#9888d0' }}>
            Tu estado de ánimo
          </label>
          <input
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="pensando en ti"
            className="w-full rounded-2xl bg-white/60 px-4 py-2.5 text-base"
            style={{ color: '#3a2e6e', border: '0.5px solid rgba(180,160,240,0.35)' }}
          />
        </div>

        <div className="flex w-full flex-col gap-2">
          <label className="text-xs uppercase tracking-wide" style={{ color: '#9888d0' }}>
            Tu avatar
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-xl transition-transform"
                style={{
                  background:
                    emoji === e ? 'rgba(160,140,230,0.25)' : 'rgba(255,255,255,0.5)',
                  border:
                    emoji === e
                      ? '1px solid rgba(90,71,176,0.5)'
                      : '0.5px solid rgba(180,160,240,0.25)',
                  transform: emoji === e ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-full px-5 py-3 text-base font-medium text-white transition-opacity disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#8878c4,#5a47b0)' }}
        >
          {saving ? 'Guardando…' : saved ? 'Guardado 💜' : 'Guardar'}
        </button>
      </div>

      <NotificationSetup currentUserId={profile.id} />

      <button
        onClick={signOut}
        className="flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm"
        style={{ color: '#9888d0' }}
      >
        <LogOut size={16} />
        Cerrar sesión
      </button>
    </div>
  )
}
