import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { logout } from '../../store/slices/authSlice'
import { toggleCart } from '../../store/slices/cartSlice'
import Logo from '../ui/Logo'

const Sidebar = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { totalItems } = useAppSelector((state) => state.cart)
  const { currentLocation } = useAppSelector((state) => state.location)

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/')
  }

  const handleCartToggle = () => {
    dispatch(toggleCart())
  }

  // Initialiser la variable CSS au montage
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      isCollapsed ? '64px' : '256px'
    )
  }, [isCollapsed])

  // Mettre à jour la variable CSS globale quand la sidebar change
  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const menuItems = [
    {
      key: 'home',
      path: '/',
      icon: '🏠',
      label: 'Accueil',
      description: 'Vue d\'ensemble'
    },
    {
      key: 'commerces',
      path: '/commerces',
      icon: '🏪',
      label: 'Commerces',
      description: 'Marchands locaux'
    },
    {
      key: 'products',
      path: '/products',
      icon: '🛍️',
      label: 'Produits',
      description: 'Catalogue complet'
    },
    {
      key: 'interests',
      path: '/interests',
      icon: '🔔',
      label: 'Intérêts',
      description: 'Manifestations d\'intérêt',
      requireAuth: true
    },
    {
      key: 'orders',
      path: '/orders',
      icon: '📋',
      label: 'Commandes',
      description: 'Mes achats',
      requireAuth: true
    },
    {
      key: 'profile',
      path: '/profile',
      icon: '👤',
      label: 'Profil',
      description: 'Mon compte',
      requireAuth: true
    }
  ]

  // Ajout d'un menu spécial pour les vendeurs
  const vendorItems = [
    {
      key: 'dashboard',
      path: '/dashboard',
      icon: '📊',
      label: 'Dashboard',
      description: 'Gestion vendeur',
      requireAuth: true,
      onlyVendor: true
    }
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div 
      className={`bg-white shadow-xl border-r border-gray-200 h-screen fixed left-0 top-0 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{ 
        '--sidebar-width': isCollapsed ? '64px' : '256px' 
      } as React.CSSProperties & { '--sidebar-width': string }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <Logo size="md" />
            <div>
              <h1 className="font-bold text-gray-900 text-sm">TchopMyGrinds</h1>
              <p className="text-xs text-gray-500">Marketplace géolocalisé</p>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="flex justify-center">
            <Logo size="sm" />
          </div>
        )}
        
        <button
          onClick={handleToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={isCollapsed ? 'Élargir le menu' : 'Réduire le menu'}
        >
          <svg 
            className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Localisation */}
      {currentLocation && !isCollapsed && (
        <div className="p-4 bg-emerald-50 border-b border-emerald-200">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-emerald-700 text-xs font-medium">Position détectée</p>
              <p className="text-emerald-600 text-xs">Rayon 50km actif</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {menuItems.map((item) => {
          if (item.requireAuth && !isAuthenticated) return null
          
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors group ${
                isActive(item.path)
                  ? 'bg-emerald-100 text-emerald-700 border-r-2 border-emerald-500'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              {!isCollapsed && (
                <div className="flex-1">
                  <div>{item.label}</div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-700">
                    {item.description}
                  </div>
                </div>
              )}
            </Link>
          )
        })}

        {/* Section vendeur */}
        {isAuthenticated && user && (user.role === 'itinerant' || user.role === 'sedentary') && (
          <>
            {!isCollapsed && (
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-t border-gray-200 mt-4 pt-4">
                Espace vendeur
              </div>
            )}
            {vendorItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors group ${
                  isActive(item.path)
                    ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                {!isCollapsed && (
                  <div className="flex-1">
                    <div>{item.label}</div>
                    <div className="text-xs text-gray-500 group-hover:text-green-600">
                      {item.description}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Panier */}
        <button
          onClick={handleCartToggle}
          className="w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors relative"
        >
          <span className="text-lg mr-3">🛒</span>
          {!isCollapsed && <span className="flex-1 text-left">Panier</span>}
          {totalItems > 0 && (
            <span className="bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center absolute -top-1 left-6">
              {totalItems}
            </span>
          )}
        </button>

        {/* Authentification */}
        {isAuthenticated && user ? (
          <div className="space-y-2">
            {!isCollapsed && (
              <div className="flex items-center px-3 py-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <span className="text-emerald-600 font-medium text-sm">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="text-lg mr-3">🚪</span>
              {!isCollapsed && <span>Se déconnecter</span>}
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
          >
            <span className="text-lg mr-3">🔑</span>
            {!isCollapsed && <span>Connexion</span>}
          </Link>
        )}
      </div>

      {/* Version/Info */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">v2.0 - Mode Carte</p>
        </div>
      )}
    </div>
  )
}

export default Sidebar