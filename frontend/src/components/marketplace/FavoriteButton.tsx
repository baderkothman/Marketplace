import type { MouseEvent } from 'react'
import { useFavorites } from '../../hooks/useFavorites'

interface FavoriteButtonProps {
  serviceId: number
  className?: string
  showLabel?: boolean
}

export function FavoriteButton({ serviceId, className = '', showLabel = false }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(serviceId)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    toggleFavorite(serviceId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={favorite}
      aria-label={favorite ? 'Remove from saved services' : 'Save service'}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors',
        favorite
          ? 'border-border-brand bg-brand-subtle text-brand'
          : 'border-border bg-surface-0/80 text-text-secondary hover:text-text-primary hover:bg-surface-2',
        className,
      ].join(' ')}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6.716-4.35-9.192-7.94C.332 9.47 2.26 4.5 6.916 4.5c2.129 0 3.4 1.21 4.084 2.274C11.684 5.71 12.955 4.5 15.084 4.5c4.656 0 6.584 4.97 4.108 8.56C18.716 16.65 12 21 12 21Z" />
      </svg>
      {showLabel && <span>{favorite ? 'Saved' : 'Save'}</span>}
    </button>
  )
}
