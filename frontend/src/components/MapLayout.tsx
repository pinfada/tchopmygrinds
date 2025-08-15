import { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { getCurrentLocation } from '../store/slices/locationSlice'
import { loadFromStorage, toggleCart } from '../store/slices/cartSlice'
import { logout } from '../store/slices/authSlice'
import CartSidebar from './CartSidebar'
import NotificationContainer from './NotificationContainer'

interface MapLayoutProps {
  children: ReactNode
  showMap?: boolean
}

const MapLayout = ({ children, showMap = true }: MapLayoutProps) => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { totalItems } = useAppSelector((state) => state.cart)
  const { currentLocation } = useAppSelector((state) => state.location)

  useEffect(() => {
    // Charger le panier et géolocalisation au démarrage
    dispatch(loadFromStorage())
    if (!currentLocation) {
      dispatch(getCurrentLocation())
    }
  }, [dispatch, currentLocation])

  const handleLogout = () => {
    dispatch(logout())
  }

  const navigationItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Accueil',
      path: '/',
      active: location.pathname === '/'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      label: 'Carte',
      path: '/map',
      active: location.pathname === '/map'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      label: 'Commerces',
      path: '/commerces',
      active: location.pathname.startsWith('/commerces')
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      label: 'Produits',
      path: '/products',
      active: location.pathname.startsWith('/products')
    }
  ]

  const userMenuItems = isAuthenticated ? [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Profil',
      path: '/profile'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Commandes',
      path: '/orders'
    }
  ] : [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      ),
      label: 'Connexion',
      path: '/auth'
    }
  ]

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className={`
        ${isSidebarCollapsed ? 'w-16' : 'w-64'} 
        lg:${isSidebarCollapsed ? 'w-16' : 'w-64'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        fixed lg:static inset-y-0 left-0 z-50
        bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        flex flex-col
      `}>
        {/* Header sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link to="/" className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            {!isSidebarCollapsed && (
              <span className="text-xl font-bold text-gray-900">TchopMyGrinds</span>
            )}
          </Link>
          
          {/* Toggle sidebar button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:block p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={isSidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${item.active 
                  ? 'bg-emerald-100 text-emerald-700 border-r-2 border-emerald-600' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
                ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}
              `}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200">
          {/* Cart button */}
          <button
            onClick={() => dispatch(toggleCart())}
            className={`
              w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors
              ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}
            `}
            title={isSidebarCollapsed ? 'Panier' : undefined}
          >
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>
            {!isSidebarCollapsed && (
              <span className="text-sm font-medium">
                Panier {totalItems > 0 && `(${totalItems})`}
              </span>
            )}
          </button>

          {/* User menu */}
          <div className="px-4 py-2 space-y-1">
            {userMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors
                  ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}
                `}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
            
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className={`
                  w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors
                  ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}
                `}
                title={isSidebarCollapsed ? 'Déconnexion' : undefined}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {!isSidebarCollapsed && <span>Déconnexion</span>}
              </button>
            )}
          </div>

          {/* User info */}
          {isAuthenticated && user && !isSidebarCollapsed && (
            <div className="px-4 py-3 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <span className="text-emerald-600 font-medium text-sm">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role === 'others' ? 'Client' : user.role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-lg font-bold text-gray-900">TchopMyGrinds</span>
          </Link>
          
          <button
            onClick={() => dispatch(toggleCart())}
            className="relative p-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Sidebar panier */}
      <CartSidebar />
      
      {/* Notifications */}
      <NotificationContainer />
    </div>
  )
}

export default MapLayout