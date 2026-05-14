import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchFavorites, removeFavorite } from '../store/slices/favoritesSlice'

const FavoritesPage = () => {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const { items, loading, error, pendingCommerceIds } = useAppSelector((state) => state.favorites)

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchFavorites())
  }, [dispatch, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h1>
        <p className="text-gray-600 mb-6">Connectez-vous pour retrouver vos commerces favoris.</p>
        <Link to="/auth" className="btn-primary inline-block">Se connecter</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes commerces favoris</h1>
        <p className="text-sm text-gray-600 mt-1">
          Les commerces que vous avez marqués pour les retrouver rapidement.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-700 font-medium">Aucun favori pour l'instant</p>
          <p className="text-sm text-gray-500 mt-1">
            Ajoutez un commerce à vos favoris depuis sa fiche pour le retrouver ici.
          </p>
          <Link to="/commerces" className="btn-primary mt-4 inline-block">
            Parcourir les commerces
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((fav) => {
            const c = fav.commerce
            const isPending = pendingCommerceIds.includes(fav.commerce_id)
            return (
              <li
                key={fav.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4"
              >
                <div className="w-14 h-14 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt=""
                      width={56}
                      height={56}
                      loading="lazy"
                      className="w-14 h-14 object-cover"
                    />
                  ) : (
                    <span className="text-2xl" aria-hidden="true">🏪</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/commerces/${c.id}`}
                    className="font-medium text-gray-900 hover:text-brand-600 truncate block"
                  >
                    {c.name || 'Commerce sans nom'}
                  </Link>
                  <p className="text-xs text-gray-500 truncate">
                    {[c.address, c.city, c.country].filter(Boolean).join(', ') || '—'}
                  </p>
                  {c.rating != null && Number(c.rating) > 0 && (
                    <p className="text-xs text-gray-500 mt-1">★ {Number(c.rating).toFixed(1)}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dispatch(removeFavorite(fav.commerce_id))}
                  disabled={isPending}
                  className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  aria-label={`Retirer ${c.name} des favoris`}
                >
                  {isPending ? '…' : 'Retirer'}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default FavoritesPage
