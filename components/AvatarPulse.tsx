'use client'

type Props = {
  emoji: string
  pulse?: boolean
  online?: boolean
  size?: number
}

// A circular avatar showing an emoji, with an optional pulsing ring (for the
// current user) and an optional green "online" dot.
export default function AvatarPulse({
  emoji,
  pulse = false,
  online = false,
  size = 64,
}: Props) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {pulse && (
        <span
          aria-hidden
          className="pulse-ring absolute inset-0 rounded-full"
          style={{ background: 'rgba(160,140,230,0.45)' }}
        />
      )}
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.5,
          background: 'rgba(255,255,255,0.7)',
          border: '0.5px solid rgba(180,160,240,0.35)',
          boxShadow: '0 4px 18px rgba(136,120,196,0.18)',
        }}
      >
        <span>{emoji}</span>
        {online && (
          <span
            aria-hidden
            className="absolute bottom-0 right-0 rounded-full"
            style={{
              width: size * 0.22,
              height: size * 0.22,
              background: '#82c8a0',
              border: '2px solid rgba(255,255,255,0.9)',
            }}
          />
        )}
      </div>
    </div>
  )
}
