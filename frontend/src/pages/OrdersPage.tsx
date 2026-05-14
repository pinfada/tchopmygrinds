import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchUserOrders, cancelOrder } from '../store/slices/orderSlice'
import { getStatusMeta, formatOrderDate, formatPrice } from '../utils/orderStatus'
import type { Order } from '../types'

const OrdersPage = () => {
  const dispatch = useAppDispatch()
  const { orders, loading, error } = useAppSelector((state) => state.order)
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserOrders())
    }
  }, [dispatch, isAuthenticated])

  const handleCancelOrder = async (e: React.MouseEvent, orderId: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return
    try {
      await dispatch(cancelOrder(orderId)).unwrap()
    } catch (err) {
      console.error('Erreur lors de l\'annulation:', err)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Connexion requise</h1>
        <p className="text-gray-600 text-lg mb-8">Connectez-vous pour voir vos commandes</p>
        <Link to="/auth" className="btn-primary">Se connecter</Link>
      </div>
    )
  }

  if (loading && orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mes commandes</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => dispatch(fetchUserOrders())} className="btn-primary">
          Réessayer
        </button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Aucune commande</h1>
        <p className="text-gray-600 text-lg mb-8">Vous n'avez pas encore passé de commande</p>
        <div className="space-x-4">
          <Link to="/products" className="btn-primary">Voir les produits</Link>
          <Link to="/commerces" className="btn-secondary">Découvrir les commerces</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Mes commandes <span className="text-gray-400 font-medium text-2xl">({orders.length})</span>
        </h1>
        <p className="text-gray-600">Cliquez sur une commande pour voir le détail complet.</p>
      </div>

      <ul className="space-y-3">
        {orders.map((order: Order) => {
          const status = getStatusMeta(order.status)
          return (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 hover:border-brand-300 hover:shadow-md rounded-xl px-5 py-4 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-base font-semibold text-gray-900 truncate">
                      Commande #{order.id}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {formatOrderDate(order.createdAt)}
                    {' · '}
                    {order.itemsCount} article{order.itemsCount !== 1 ? 's' : ''}
                    {order.deliveryAddress ? ` · ${order.deliveryAddress}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(order.grandTotal ?? order.totalAmount)}
                    </div>
                    {order.deliveryFee > 0 && (
                      <div className="text-xs text-gray-400">
                        dont {formatPrice(order.deliveryFee)} de livraison
                      </div>
                    )}
                  </div>

                  {status.cancellable && (
                    <button
                      onClick={(e) => handleCancelOrder(e, order.id)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium whitespace-nowrap"
                    >
                      Annuler
                    </button>
                  )}

                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default OrdersPage
