type Variant = 'home' | 'feed' | 'cards' | 'calendar' | 'profile'

function Block({ className = '' }: { className?: string }) {
  return (
    <div
      className={`skeleton-shimmer rounded-2xl ${className}`}
      aria-hidden
    />
  )
}

export default function PageSkeleton({
  variant = 'feed',
  showHeader = true,
}: {
  variant?: Variant
  showHeader?: boolean
}) {
  return (
    <div className="flex flex-1 flex-col gap-6" aria-busy aria-label="Cargando">
      {showHeader && (
        <header className="mt-2 flex flex-col gap-2">
          <Block className="h-3 w-24" />
          <Block className="h-10 w-56" />
          <Block className="h-4 w-40" />
        </header>
      )}

      {variant === 'home' && (
        <>
          <Block className="h-36 w-full glass" />
          <Block className="h-28 w-full glass" />
          <Block className="h-20 w-full glass" />
        </>
      )}

      {variant === 'feed' && (
        <>
          <Block className="h-24 w-full glass" />
          <Block className="h-32 w-full glass" />
          <Block className="h-28 w-full glass" />
        </>
      )}

      {variant === 'cards' && (
        <>
          <div className="flex gap-2">
            <Block className="h-20 flex-1" />
            <Block className="h-20 flex-1" />
          </div>
          <Block className="h-72 w-full glass-strong" />
        </>
      )}

      {variant === 'calendar' && (
        <>
          <Block className="h-10 w-full" />
          <Block className="h-64 w-full glass-strong" />
          <Block className="h-24 w-full glass" />
        </>
      )}

      {variant === 'profile' && (
        <>
          <Block className="mx-auto h-24 w-24 rounded-full" />
          <Block className="h-14 w-full glass" />
          <Block className="h-14 w-full glass" />
          <Block className="h-32 w-full glass" />
        </>
      )}
    </div>
  )
}
