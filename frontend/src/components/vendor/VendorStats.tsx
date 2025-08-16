import React from 'react'
import { Product, Order, Commerce } from '../../types'

interface VendorStatsProps {
  products: Product[]
  orders: Order[]
  commerce: Commerce | null
}

const VendorStats: React.FC<VendorStatsProps> = ({ products, orders, commerce }) => {
  // Calculs des statistiques
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.isAvailable && p.stock > 0).length
  const outOfStock = products.filter(p => p.stock === 0).length
  
  const totalOrders = orders.length
  const todayOrders = orders.filter(order => 
    new Date(order.createdAt).toDateString() === new Date().toDateString()
  ).length
  
  const weekOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt)
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return orderDate >= weekAgo
  }).length
  
  const totalRevenue = orders
    .filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.grandTotal, 0)
    
  const todayRevenue = orders
    .filter(order => 
      order.status !== 'cancelled' && 
      new Date(order.createdAt).toDateString() === new Date().toDateString()
    )
    .reduce((sum, order) => sum + order.grandTotal, 0)

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  
  const pendingOrders = orders.filter(order => order.status === 'pending').length
  const preparingOrders = orders.filter(order => order.status === 'preparing').length

  const stats = [
    {
      title: 'Produits actifs',
      value: activeProducts,
      total: totalProducts,
      icon: '📦',
      color: 'green',
      trend: outOfStock > 0 ? 'warning' : 'positive'
    },
    {
      title: 'Commandes aujourd\'hui',
      value: todayOrders,
      total: totalOrders,
      icon: '🛒',
      color: 'blue',
      trend: 'neutral'
    },
    {
      title: 'Revenus aujourd\'hui',
      value: `${todayRevenue.toFixed(2)}€`,
      total: `${totalRevenue.toFixed(2)}€`,
      icon: '💰',
      color: 'yellow',
      trend: 'positive'
    },
    {
      title: 'Commandes en attente',
      value: pendingOrders,
      total: preparingOrders,
      icon: '⏰',
      color: 'orange',
      trend: pendingOrders > 0 ? 'warning' : 'positive'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-500 text-green-50',
      blue: 'bg-blue-500 text-blue-50',
      yellow: 'bg-yellow-500 text-yellow-50',
      orange: 'bg-orange-500 text-orange-50'
    }
    return colors[color as keyof typeof colors] || colors.green
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive': return '📈'
      case 'warning': return '⚠️'
      default: return '📊'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${getColorClasses(stat.color)}`}>
                {stat.icon}
              </div>
              <span className="text-lg">
                {getTrendIcon(stat.trend)}
              </span>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                {typeof stat.total === 'string' && stat.total !== stat.value && (
                  <span className="text-sm text-gray-500">/ {stat.total}</span>
                )}
                {typeof stat.total === 'number' && stat.total !== stat.value && (
                  <span className="text-sm text-gray-500">/ {stat.total}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Commerce Status */}
      {commerce && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📍 Statut du commerce</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Nom du commerce</h3>
                <p className="text-lg font-semibold text-gray-900">{commerce.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Type</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {commerce.userId ? '🚛' : '🏪'}
                  </span>
                  <span className="text-gray-900">
                    {commerce.userId ? 'Commerce itinérant' : 'Commerce fixe'}
                  </span>
                </div>
              </div>
              
              {commerce.category && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Catégorie</h3>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                    {commerce.category}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {commerce.isVerified && (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-green-600">Commerce vérifié</span>
                </div>
              )}
              
              {commerce.rating && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Note moyenne</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(commerce.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {commerce.rating.toFixed(1)}/5
                    </span>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Panier moyen</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {averageOrderValue.toFixed(2)}€
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Actions rapides</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group">
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">➕</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">
              Ajouter un produit
            </span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group">
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
              Voir les rapports
            </span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group">
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🛒</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">
              Commandes en attente
            </span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group">
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">⚙️</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">
              Paramètres
            </span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 Activité récente</h2>
        
        {orders.slice(0, 5).length > 0 ? (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">🛒</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Commande #{order.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {order.grandTotal.toFixed(2)}€
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-2 block">📋</span>
            <p>Aucune commande récente</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorStats