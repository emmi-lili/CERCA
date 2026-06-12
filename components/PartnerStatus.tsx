'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatRelativeTime, isOnline } from '@/lib/utils'
import AvatarPulse from './AvatarPulse'

export type Profile = {
  id: string
  name: string | null
  avatar_emoji: string | null
  mood: string | null
  last_seen: string | null
}

type Props = {
  currentUserId: string
  initialProfiles: Profile[]
}

function ProfileCard({
  profile,
  isMe,
}: {
  profile: Profile
  isMe: boolean
}) {
  const online = isOnline(profile.last_seen)
  return (
    <div className="glass flex flex-1 flex-col items-center gap-2 px-3 py-4 text-center">
      <AvatarPulse
        emoji={profile.avatar_emoji || '🫧'}
        pulse={isMe}
        online={online}
        size={64}
      />
      <span
        className="font-display text-xl leading-tight"
        style={{ color: '#3a2e6e' }}
      >
        {profile.name || (isMe ? 'Tú' : 'Tu amor')}
      </span>
      <span className="text-xs" style={{ color: '#8878c4' }}>
        {profile.mood || 'pensando en ti'}
      </span>
      <span
        className="flex items-center gap-1.5 text-[11px]"
        style={{ color: online ? '#82c8a0' : '#9888d0' }}
      >
        {online ? (
          <>
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: '#82c8a0' }}
            />
            En línea
          </>
        ) : profile.last_seen ? (
          `visto ${formatRelativeTime(profile.last_seen)}`
        ) : (
          'sin conexión'
        )}
      </span>
    </div>
  )
}

export default function PartnerStatus({
  currentUserId,
  initialProfiles,
}: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)

  // Keep my own last_seen fresh every 60 seconds.
  useEffect(() => {
    const touch = async () => {
      await supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', currentUserId)
    }
    touch()
    const id = setInterval(touch, 60_000)
    return () => clearInterval(id)
  }, [supabase, currentUserId])

  // Realtime: reflect any profile change (mood, last_seen) instantly.
  useEffect(() => {
    const channel = supabase
      .channel('profiles-status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          const updated = payload.new as Profile
          setProfiles((prev) => {
            const exists = prev.some((p) => p.id === updated.id)
            return exists
              ? prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
              : [...prev, updated]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const me = profiles.find((p) => p.id === currentUserId)
  const partner = profiles.find((p) => p.id !== currentUserId)

  return (
    <div className="flex gap-3">
      {me && <ProfileCard profile={me} isMe />}
      {partner ? (
        <ProfileCard profile={partner} isMe={false} />
      ) : (
        <div className="glass flex flex-1 flex-col items-center justify-center gap-2 px-3 py-4 text-center">
          <AvatarPulse emoji="🫧" size={64} />
          <span className="text-xs" style={{ color: '#9888d0' }}>
            Esperando a tu amor…
          </span>
        </div>
      )}
    </div>
  )
}
