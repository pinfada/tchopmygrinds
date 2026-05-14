import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { addFavorite, removeFavorite } from '../../store/slices/favoritesSlice'

interface FavoriteButtonProps {
  commerceId: number
  className?: string
  size?: 'sm' | 'md'
  showLabel?: boolean
}

const FavoriteButton = ({
  commerceId,
  className = '',
  size = 'md',
  showLabel = true,
}: FavoriteButtonProps) => {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const isFavorite = useAppSelector((s) => s.favorites.commerceIds.includes(commerceId))
  const isPending = useAppSelector((s) => s.favorites.pendingCommerceIds.includes(commerceId))

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const pad = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'

  if (!isAuthenticated) return null

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isPending) return
    if (isFavorite) dispatch(removeFavorite(commerceId))
    else dispatch(addFavorite(commerceId))
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`inline-flex items-center gap-1.5 ${pad} rounded-lg font-medium transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        isFavorite
          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
      } ${className}`}
    >
      <svg
        className={iconSize}
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21s-7-4.534-9.5-9.034C1.07 9.04 2.6 5 6.5 5c2.06 0 3.36 1.118 4.5 2.5 1.14-1.382 2.44-2.5 4.5-2.5 3.9 0 5.43 4.04 4 6.966C19 16.466 12 21 12 21z"
        />
      </svg>
      {showLabel && <span>{isFavorite ? 'Favori' : 'Favoriser'}</span>}
    </button>
  )
}

export default FavoriteButton
