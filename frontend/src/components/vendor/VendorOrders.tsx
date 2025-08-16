import React, { useState } from 'react'
import { useAppDispatch } from '../../hooks/redux'
import { Order, Commerce } from '../../types'

interface VendorOrdersProps {
  orders: Order[]
  commerce: Commerce | null
}

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled'

const VendorOrders: React.FC<VendorOrdersProps> = ({ orders, commerce }) => {
  const dispatch = useAppDispatch()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesSearch = order.id.toString().includes(searchTerm) ||
                         order.phone.includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-orange-100 text-orange-800 border-orange-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status] || colors.pending
  }

  const getStatusIcon = (status: OrderStatus) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      preparing: '👨‍🍳',
      delivered: '🚚',
      cancelled: '❌'
    }
    return icons[status] || '📋'
  }

  const getStatusLabel = (status: OrderStatus) => {
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      preparing: 'En préparation',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    }
    return labels[status] || status
  }

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      console.log('Changing order status:', orderId, newStatus)
      // TODO: Dispatch update action
      // dispatch(updateOrderStatus({ orderId, status: newStatus }))
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'delivered',
      delivered: null,
      cancelled: null
    }
    return statusFlow[currentStatus]
  }

  const canAdvanceStatus = (status: OrderStatus) => {
    return getNextStatus(status) !== null
  }

  const OrderDetails = ({ order }: { order: Order }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Informations de commande</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Numéro:</span>
              <span className="font-medium">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span>{new Date(order.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Statut:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)} {getStatusLabel(order.status)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Contact client</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Téléphone:</span>
              <span className="font-medium">{order.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mode de paiement:</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">Adresse de livraison</h4>
        <div className="bg-gray-50 p-3 rounded-lg text-sm">
          <p>{order.deliveryAddress.street}</p>
          <p>{order.deliveryAddress.postalCode} {order.deliveryAddress.city}</p>
          <p>{order.deliveryAddress.country}</p>
        </div>
      </div>

      {order.notes && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Notes du client</h4>
          <div className="bg-yellow-50 p-3 rounded-lg text-sm border border-yellow-200">
            {order.notes}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-medium text-gray-900 mb-2">Produits commandés</h4>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                <p className="text-sm text-gray-600">
                  {item.unitPrice.toFixed(2)}€ / {item.product.unit}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">x{item.quantity}</p>
                <p className="text-sm text-gray-600">{item.totalPrice.toFixed(2)}€</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Sous-total:</span>
            <span>{order.totalAmount.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between">
            <span>Frais de livraison:</span>
            <span>{order.deliveryFee.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total:</span>
            <span>{order.grandTotal.toFixed(2)}€</span>
          </div>
        </div>
      </div>
    </div>
  )

  const ordersByStatus = {
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <div className="space-y-6">
      {/* Stats des commandes */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(Object.entries(ordersByStatus) as [OrderStatus, number][]).map(([status, count]) => (
          <div key={status} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl mb-1">{getStatusIcon(status)}</div>
            <div className="text-2xl font-bold text-gray-900">{count}</div>
            <div className="text-xs text-gray-600">{getStatusLabel(status)}</div>
          </div>
        ))}
      </div>

      {/* Header avec filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">🛒 Gestion des commandes</h2>
            <p className="text-gray-600 mt-1">
              {orders.length} commande{orders.length !== 1 ? 's' : ''} au total
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Rechercher par numéro ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmées</option>
              <option value="preparing">En préparation</option>
              <option value="delivered">Livrées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600 flex items-center">
            {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''} affiché{filteredOrders.length !== 1 ? 'es' : 'e'}
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🛒</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {orders.length === 0 ? 'Aucune commande' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-600">
              {orders.length === 0 
                ? 'Vous n\'avez pas encore reçu de commandes'
                : 'Aucune commande ne correspond à vos critères de recherche'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Commande #{order.id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {getStatusLabel(order.status)}
                      </span>
                      {order.paymentMethod === 'cash' && (
                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                          💰 Paiement cash
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <span>📞 {order.phone}</span>
                      <span>📅 {new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                      <span className="font-semibold text-gray-900">{order.grandTotal.toFixed(2)}€</span>
                      <span>{order.items.length} article{order.items.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="text-sm text-gray-600">
                      📍 {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {canAdvanceStatus(order.status) && (
                      <button
                        onClick={() => handleStatusChange(order.id, getNextStatus(order.status)!)}
                        className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-lg hover:bg-green-200 transition-colors"
                      >
                        ➡️ {getStatusLabel(getNextStatus(order.status)!)}
                      </button>
                    )}
                    
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                      >
                        ❌ Annuler
                      </button>
                    )}
                    
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      {selectedOrder?.id === order.id ? '🔼 Masquer' : '🔽 Détails'}
                    </button>
                  </div>
                </div>

                {/* Détails expandus */}
                {selectedOrder?.id === order.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <OrderDetails order={order} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorOrders