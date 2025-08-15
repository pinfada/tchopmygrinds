import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchUserOrders, cancelOrder } from '../store/slices/orderSlice'
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

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'preparing':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente'
      case 'confirmed':
        return 'Confirmée'
      case 'preparing':
        return 'En préparation'
      case 'delivered':
        return 'Livrée'
      case 'cancelled':
        return 'Annulée'
      default:
        return status
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      try {
        await dispatch(cancelOrder(orderId)).unwrap()
      } catch (error) {
        console.error('Erreur lors de l\'annulation:', error)
      }
    }
  }

  const canCancelOrder = (order: Order) => {
    return order.status === 'pending' || order.status === 'confirmed'
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Connexion requise</h1>
        <p className="text-gray-600 text-lg mb-8">
          Connectez-vous pour voir vos commandes
        </p>
        <Link to="/auth" className="btn-primary">
          Se connecter
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes commandes</h1>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="card-body">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
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
        <button 
          onClick={() => dispatch(fetchUserOrders())}
          className="btn-primary"
        >
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
        <p className="text-gray-600 text-lg mb-8">
          Vous n'avez pas encore passé de commande
        </p>
        <div className="space-x-4">
          <Link to="/products" className="btn-primary">
            Voir les produits
          </Link>
          <Link to="/commerces" className="btn-secondary">
            Découvrir les commerces
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mes commandes ({orders.length})
        </h1>
        <p className="text-gray-600">
          Suivez l'état de vos commandes et gérez vos livraisons
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div className="card-body">
              {/* En-tête de commande */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Commande #{order.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {order.grandTotal ? Number(order.grandTotal).toFixed(2) : '0.00'}€
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0} article{(order.items?.length || 0) > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Articles de la commande */}
              <div className="border-t border-gray-100 pt-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Articles commandés</h4>
                <div className="space-y-3">
                  {(order.items || []).map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product?.imageUrl ? (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product?.name || 'Produit'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{item.product?.name || 'Produit inconnu'}</h5>
                          <p className="text-sm text-gray-500">
                            {item.quantity || 0} × {item.unitPrice ? Number(item.unitPrice).toFixed(2) : '0.00'}€
                          </p>
                          {item.product?.commerce && (
                            <p className="text-sm text-gray-500">
                              {item.product.commerce.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.totalPrice ? Number(item.totalPrice).toFixed(2) : '0.00'}€
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adresse de livraison */}
              <div className="border-t border-gray-100 pt-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Adresse de livraison</h4>
                <div className="text-sm text-gray-600">
                  <p>{order.deliveryAddress?.street || 'Adresse non renseignée'}</p>
                  <p>{order.deliveryAddress?.postalCode || ''} {order.deliveryAddress?.city || ''}</p>
                  <p>{order.deliveryAddress?.country || ''}</p>
                </div>
                {order.phone && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Téléphone :</span> {order.phone}
                  </p>
                )}
                {order.notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Notes :</span> {order.notes}
                  </p>
                )}
              </div>

              {/* Récapitulatif financier */}
              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sous-total</span>
                      <span>{order.totalAmount ? Number(order.totalAmount).toFixed(2) : '0.00'}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frais de livraison</span>
                      <span>{order.deliveryFee ? Number(order.deliveryFee).toFixed(2) : '0.00'}€</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total</span>
                      <span>{order.grandTotal ? Number(order.grandTotal).toFixed(2) : '0.00'}€</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex space-x-3">
                  <Link 
                    to={`/orders/${order.id}`} 
                    className="btn-secondary"
                  >
                    Voir les détails
                  </Link>
                  {order.status === 'delivered' && (
                    <button className="btn-secondary">
                      Renouveler la commande
                    </button>
                  )}
                </div>
                {canCancelOrder(order) && (
                  <button 
                    onClick={() => handleCancelOrder(order.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                  >
                    Annuler la commande
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination si nécessaire */}
      {orders.length >= 10 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
              Précédent
            </button>
            <button className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg">
              1
            </button>
            <button className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage