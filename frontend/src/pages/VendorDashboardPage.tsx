import React, { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import { fetchUserOrders } from '../store/slices/orderSlice'
import { fetchProductsByCommerce } from '../store/slices/productSlice'
import { fetchCommerceById } from '../store/slices/commerceSlice'
import VendorStats from '../components/vendor/VendorStats'
import VendorProducts from '../components/vendor/VendorProducts'
import VendorOrders from '../components/vendor/VendorOrders'
import VendorProfile from '../components/vendor/VendorProfile'

type TabType = 'overview' | 'products' | 'orders' | 'profile'

const VendorDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { products } = useAppSelector(state => state.product)
  const { orders } = useAppSelector(state => state.order)
  const { currentCommerce } = useAppSelector(state => state.commerce)
  
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Vérifier si l'utilisateur est un vendeur
  const isVendor = user?.role === 'itinerant' || user?.role === 'sedentary'

  useEffect(() => {
    if (user && isVendor) {
      dispatch(fetchUserOrders())
      // Auth payload now ships the merchant's commerces; use the first one's id
      // (previously this dispatched fetchCommerceById(user.id) which 404'd because
      // user.id is not a commerce id).
      const merchantCommerceId = user.commerces?.[0]?.id
      if (merchantCommerceId) {
        dispatch(fetchCommerceById(merchantCommerceId))
      }
    }
  }, [user, isVendor, dispatch])

  useEffect(() => {
    if (currentCommerce) {
      // Charger les produits du commerce
      dispatch(fetchProductsByCommerce(currentCommerce.id))
    }
  }, [currentCommerce, dispatch])

  if (!isVendor) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <svg className="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Accès réservé aux vendeurs</h1>
          <p className="text-gray-600">
            Ce tableau de bord est réservé aux commerçants itinérants et sédentaires.
          </p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: '📊 Vue d\'ensemble', icon: '📊' },
    { id: 'products', label: '📦 Mes produits', icon: '📦' },
    { id: 'orders', label: '🛒 Commandes', icon: '🛒' },
    { id: 'profile', label: '🏪 Mon commerce', icon: '🏪' },
  ] as const

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'itinerant' ? '🚛' : '🏪'} Dashboard Vendeur
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez votre activité commerciale en temps réel
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Statut en ligne pour itinérants */}
            {user?.role === 'itinerant' && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">En ligne</span>
              </div>
            )}
            
            {/* Indicateur de performance */}
            <div className="text-right">
              <div className="text-sm text-gray-500">Ventes aujourd'hui</div>
              <div className="text-xl font-bold text-green-600">
                {orders?.filter(order => 
                  new Date(order.createdAt).toDateString() === new Date().toDateString()
                ).length || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <VendorStats 
            products={products || []}
            orders={orders || []}
            commerce={currentCommerce}
          />
        )}
        
        {activeTab === 'products' && (
          <VendorProducts 
            commerce={currentCommerce}
            products={products || []}
          />
        )}
        
        {activeTab === 'orders' && (
          <VendorOrders 
            orders={orders || []}
            commerce={currentCommerce}
          />
        )}
        
        {activeTab === 'profile' && (
          <VendorProfile 
            commerce={currentCommerce}
            user={user}
          />
        )}
      </div>
    </div>
  )
}

export default VendorDashboardPage