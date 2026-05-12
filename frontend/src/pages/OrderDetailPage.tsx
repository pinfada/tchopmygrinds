import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { cancelOrder, fetchOrderById } from '../store/slices/orderSlice'
import { getStatusMeta, formatOrderDate, formatPrice } from '../utils/orderStatus'

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const orderId = Number(id)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { currentOrder, loading, error } = useAppSelector((state) => state.order)
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated && Number.isFinite(orderId) && orderId > 0) {
      dispatch(fetchOrderById(orderId))
    }
  }, [dispatch, isAuthenticated, orderId])

  const order = currentOrder && currentOrder.id === orderId ? currentOrder : null
  const status = getStatusMeta(order?.status)

  const handleCancel = async () => {
    if (!order) return
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return
    try {
      await dispatch(cancelOrder(order.id)).unwrap()
    } catch (err) {
      console.error('Erreur lors de l\'annulation:', err)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h1>
        <Link to="/auth" className="btn-primary">Se connecter</Link>
      </div>
    )
  }

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Commande introuvable</h1>
        <p className="text-gray-600 mb-6">L'identifiant de commande est invalide.</p>
        <Link to="/orders" className="btn-primary">Retour aux commandes</Link>
      </div>
    )
  }

  if (loading && !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-7 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="space-x-4">
          <button onClick={() => dispatch(fetchOrderById(orderId))} className="btn-primary">
            Réessayer
          </button>
          <Link to="/orders" className="btn-secondary">Retour</Link>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Commande introuvable</h1>
        <Link to="/orders" className="btn-primary">Retour aux commandes</Link>
      </div>
    )
  }

  const items = order.items ?? []
  const itemsSubtotal = items.reduce((acc, it) => acc + Number(it.totalPrice ?? 0), 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Commande #{order.id}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Passée le {formatOrderDate(order.createdAt)}
          </p>
        </div>

        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Articles */}
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Articles ({order.itemsCount})
        </h2>

        {items.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun article à afficher.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.id} className="py-4 flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  {item.product?.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product?.name || 'Produit'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {item.product ? (
                        <Link
                          to={`/products/${item.product.id}`}
                          className="font-medium text-gray-900 hover:text-emerald-600 line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-400">Produit supprimé</span>
                      )}
                      {item.product?.commerce && (
                        <Link
                          to={`/commerces/${item.product.commerce.id}`}
                          className="block text-xs text-gray-500 hover:text-emerald-600 truncate"
                        >
                          {item.product.commerce.name}
                        </Link>
                      )}
                      {item.product?.unit && (
                        <p className="text-xs text-gray-400 mt-0.5">{item.product.unit}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-gray-900">{formatPrice(item.totalPrice)}</div>
                      <div className="text-xs text-gray-500">
                        {item.quantity} × {formatPrice(item.unitPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Livraison + récapitulatif */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Livraison</h2>
          <dl className="text-sm space-y-2">
            <div>
              <dt className="text-gray-500">Adresse</dt>
              <dd className="text-gray-900 mt-0.5">
                {order.deliveryAddress || <span className="text-gray-400 italic">Non renseignée</span>}
              </dd>
            </div>
            {order.phone && (
              <div>
                <dt className="text-gray-500">Téléphone</dt>
                <dd className="text-gray-900 mt-0.5">{order.phone}</dd>
              </div>
            )}
            {order.paymentMethod && (
              <div>
                <dt className="text-gray-500">Paiement</dt>
                <dd className="text-gray-900 mt-0.5">
                  {order.paymentMethod === 'card' ? '💳 Carte bancaire' : '💵 Espèces à la livraison'}
                </dd>
              </div>
            )}
            {order.notes && (
              <div>
                <dt className="text-gray-500">Notes</dt>
                <dd className="text-gray-900 mt-0.5 whitespace-pre-line">{order.notes}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Récapitulatif</h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Sous-total articles</dt>
              <dd className="text-gray-900">{formatPrice(order.totalAmount ?? itemsSubtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Frais de livraison</dt>
              <dd className="text-gray-900">
                {order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : <span className="text-gray-400">Gratuit</span>}
              </dd>
            </div>
            <div className="flex justify-between pt-2 mt-2 border-t border-gray-100">
              <dt className="font-semibold text-gray-900">Total</dt>
              <dd className="font-bold text-lg text-gray-900">
                {formatPrice(order.grandTotal ?? Number(order.totalAmount ?? 0) + Number(order.deliveryFee ?? 0))}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Link to="/orders" className="text-sm text-gray-600 hover:text-gray-900">
          ← Toutes mes commandes
        </Link>
        {status.cancellable && (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Annuler la commande
          </button>
        )}
      </div>
    </div>
  )
}

export default OrderDetailPage
