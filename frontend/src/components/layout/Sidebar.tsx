import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { logout } from '../../store/slices/authSlice'
import { toggleCart } from '../../store/slices/cartSlice'
import Logo from '../ui/Logo'
import MessageIcon from '../messages/MessageIcon'

interface SidebarProps {
  isMobileOpen: boolean
  onMobileClose: () => void
}

const Sidebar = ({ isMobileOpen, onMobileClose }: SidebarProps) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { totalItems } = useAppSelector((state) => state.cart)
  const { currentLocation } = useAppSelector((state) => state.location)

  const handleLogout = async () => {
    await dispatch(logout())
    onMobileClose()
    navigate('/')
  }

  const handleCartToggle = () => {
    onMobileClose()
    dispatch(toggleCart())
  }

  useEffect(() => {
    const apply = () => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches
      const value = !isDesktop ? '0px' : isCollapsed ? '64px' : '256px'
      document.documentElement.style.setProperty('--sidebar-width', value)
    }
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [isCollapsed])

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  useEffect(() => {
    onMobileClose()
  }, [location.pathname, onMobileClose])

  const handleToggleSidebar = () => setIsCollapsed((v) => !v)

  const menuItems = [
    { key: 'home', path: '/', icon: '🏠', label: 'Accueil', description: "Vue d'ensemble" },
    { key: 'commerces', path: '/commerces', icon: '🏪', label: 'Commerces', description: 'Marchands locaux' },
    { key: 'products', path: '/products', icon: '🛍️', label: 'Produits', description: 'Catalogue complet' },
    { key: 'interests', path: '/interests', icon: '🔔', label: 'Intérêts', description: "Manifestations d'intérêt", requireAuth: true },
    { key: 'messages', path: '/messages', icon: '💬', label: 'Messages', description: 'Messagerie vendeur-client', requireAuth: true, isCustom: true },
    { key: 'orders', path: '/orders', icon: '📋', label: 'Commandes', description: 'Mes achats', requireAuth: true },
    { key: 'profile', path: '/profile', icon: '👤', label: 'Profil', description: 'Mon compte', requireAuth: true },
  ]

  const vendorItems = [
    { key: 'dashboard', path: '/dashboard', icon: '📊', label: 'Dashboard', description: 'Gestion vendeur', requireAuth: true, onlyVendor: true },
  ]

  const isActive = (path: string) => location.pathname === path

  const showLabels = !isCollapsed || isMobileOpen

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      <aside
        id="app-sidebar"
        className={`
          fixed left-0 top-0 h-[100dvh] bg-white shadow-xl border-r border-slate-200 z-50
          flex flex-col
          transition-transform duration-300 ease-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          w-[min(85vw,320px)]
          ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        `}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        aria-label="Menu de navigation"
      >
        <div className="flex items-center justify-between gap-2 p-4 border-b border-slate-200 flex-shrink-0">
          {showLabels && (
            <div className="flex items-center gap-3 min-w-0">
              <Logo size="md" />
              <div className="min-w-0">
                <h1 className="font-bold text-slate-900 text-sm truncate">TchopMyGrinds</h1>
                <p className="text-xs text-slate-500 truncate">Marketplace géolocalisé</p>
              </div>
            </div>
          )}
          {!showLabels && (
            <div className="flex justify-center w-full">
              <Logo size="sm" />
            </div>
          )}

          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Fermer le menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleToggleSidebar}
            className="hidden lg:inline-flex items-center justify-center min-w-[36px] min-h-[36px] text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label={isCollapsed ? 'Élargir le menu' : 'Réduire le menu'}
            aria-expanded={!isCollapsed}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {currentLocation && showLabels && (
          <div className="px-4 py-3 bg-brand-50 border-b border-brand-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div className="min-w-0">
                <p className="text-brand-700 text-xs font-medium">Position détectée</p>
                <p className="text-brand-600 text-xs truncate">Rayon 50km actif</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overscroll-contain">
          {menuItems.map((item) => {
            if (item.requireAuth && !isAuthenticated) return null

            const sharedClasses = `
              flex items-center gap-3 px-3 min-h-[48px] rounded-lg text-sm font-medium
              transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
              ${isActive(item.path)
                ? 'bg-brand-50 text-brand-700 border-r-2 border-brand-500'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}
            `

            if (item.key === 'messages' && (item as any).isCustom) {
              return (
                <Link key={item.key} to={item.path} className={sharedClasses}>
                  <MessageIcon className="text-lg flex-shrink-0" />
                  {showLabels && (
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.label}</div>
                      <div className="text-xs text-slate-500 group-hover:text-slate-700 truncate">{item.description}</div>
                    </div>
                  )}
                </Link>
              )
            }

            return (
              <Link key={item.key} to={item.path} className={sharedClasses}>
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {showLabels && (
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{item.label}</div>
                    <div className="text-xs text-slate-500 group-hover:text-slate-700 truncate">{item.description}</div>
                  </div>
                )}
              </Link>
            )
          })}

          {isAuthenticated && user && (user.role === 'itinerant' || user.role === 'sedentary') && (
            <>
              {showLabels && (
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-t border-slate-200 mt-4 pt-4">
                  Espace vendeur
                </div>
              )}
              {vendorItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 min-h-[48px] rounded-lg text-sm font-medium
                    transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
                    ${isActive(item.path)
                      ? 'bg-brand-100 text-brand-700 border-r-2 border-brand-600'
                      : 'text-slate-700 hover:bg-brand-50 hover:text-brand-700'}
                  `}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {showLabels && (
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.label}</div>
                      <div className="text-xs text-slate-500 group-hover:text-brand-600 truncate">{item.description}</div>
                    </div>
                  )}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-slate-200 space-y-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleCartToggle}
            className="w-full flex items-center gap-3 px-3 min-h-[48px] rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span className="text-lg flex-shrink-0">🛒</span>
            {showLabels && <span className="flex-1 text-left">Panier</span>}
            {totalItems > 0 && (
              <span className="bg-brand-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 absolute top-2 left-7 lg:static">
                {totalItems}
              </span>
            )}
          </button>

          {isAuthenticated && user ? (
            <>
              {showLabels && (
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name ?? 'Avatar utilisateur'}
                        width={36}
                        height={36}
                        loading="lazy"
                        decoding="async"
                        className="w-9 h-9 rounded-full"
                      />
                    ) : (
                      <span className="text-brand-600 font-medium text-sm">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.name || user.email}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 min-h-[44px] rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <span className="text-lg flex-shrink-0">🚪</span>
                {showLabels && <span>Se déconnecter</span>}
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="w-full flex items-center gap-3 px-3 min-h-[48px] rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <span className="text-lg flex-shrink-0">🔑</span>
              {showLabels && <span>Connexion</span>}
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
