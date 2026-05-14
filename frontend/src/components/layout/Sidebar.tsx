import { useEffect, useRef, useState } from 'react'
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

type IconProps = { className?: string }

const HomeIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  </svg>
)

const StoreIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 8h16l-1 4a3 3 0 0 1-5.83 0 3 3 0 0 1-6 0A3 3 0 0 1 5 12L4 8Z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 4h14M6 14v6h12v-6" />
  </svg>
)

const BagIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 8h14l-1 12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 8Z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
)

const BellIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5 2 6H4c.5-1 2-2 2-6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 18a2 2 0 0 0 4 0" />
  </svg>
)

const ClipboardIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5h6a1 1 0 0 1 1 1v1H8V6a1 1 0 0 1 1-1Z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6M9 16h4" />
  </svg>
)

const UserIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 20a8 8 0 0 1 16 0" />
  </svg>
)

const DashboardIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
  </svg>
)

const CartIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.2a1 1 0 0 0 1-.8L19 7H6" />
    <circle cx="9" cy="20" r="1.3" fill="currentColor" />
    <circle cx="17" cy="20" r="1.3" fill="currentColor" />
  </svg>
)

const LogoutIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 8l4 4-4 4M22 12H9" />
  </svg>
)

const LoginIcon = ({ className = 'w-5 h-5' }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 8V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 8l-4 4 4 4M2 12h13" />
  </svg>
)

type MenuItem = {
  key: string
  path: string
  label: string
  Icon?: (props: IconProps) => JSX.Element
  requireAuth?: boolean
  isCustom?: boolean
}

const Sidebar = ({ isMobileOpen, onMobileClose }: SidebarProps) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const asideRef = useRef<HTMLElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

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

  // Mobile overlay: lock scroll + focus trap + ESC to close + restore focus
  useEffect(() => {
    if (!isMobileOpen) return

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'

    const aside = asideRef.current
    const focusables = aside?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    focusables?.[0]?.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onMobileClose()
        return
      }
      if (e.key !== 'Tab' || !aside) return
      const items = aside.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
      previouslyFocusedRef.current?.focus?.()
    }
  }, [isMobileOpen, onMobileClose])

  // Close mobile sidebar on route change. Intentionally depend only on the
  // pathname so an unstable parent-side `onMobileClose` does not close
  // the sidebar the moment it opens.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    onMobileClose()
  }, [location.pathname])

  const handleToggleSidebar = () => setIsCollapsed((v) => !v)

  const menuItems: MenuItem[] = [
    { key: 'home', path: '/', label: 'Accueil', Icon: HomeIcon },
    { key: 'commerces', path: '/commerces', label: 'Commerces', Icon: StoreIcon },
    { key: 'products', path: '/products', label: 'Produits', Icon: BagIcon },
    { key: 'interests', path: '/interests', label: 'Intérêts', Icon: BellIcon, requireAuth: true },
    { key: 'messages', path: '/messages', label: 'Messages', requireAuth: true, isCustom: true },
    { key: 'orders', path: '/orders', label: 'Commandes', Icon: ClipboardIcon, requireAuth: true },
    { key: 'profile', path: '/profile', label: 'Profil', Icon: UserIcon, requireAuth: true },
  ]

  const vendorItems: MenuItem[] = [
    { key: 'dashboard', path: '/dashboard', label: 'Dashboard', Icon: DashboardIcon, requireAuth: true },
  ]

  const isActive = (path: string) => location.pathname === path

  const showLabels = !isCollapsed || isMobileOpen

  const navItemClasses = (active: boolean) => {
    const base =
      'relative flex items-center gap-3 px-3 min-h-[48px] rounded-lg text-sm font-medium transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'
    if (active) {
      return `${base} bg-brand-50 text-brand-700 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-brand-600`
    }
    return `${base} text-slate-700 hover:bg-slate-100 hover:text-slate-900`
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      <aside
        ref={asideRef}
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
        aria-label="Menu de navigation principal"
        role={isMobileOpen ? 'dialog' : undefined}
        aria-modal={isMobileOpen ? 'true' : undefined}
      >
        <div className="flex items-center justify-between gap-2 p-4 border-b border-slate-200 flex-shrink-0">
          {showLabels ? (
            <Link
              to="/"
              className="flex items-center gap-3 min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="TchopMyGrinds - Retour à l'accueil"
            >
              <Logo size="md" />
              <div className="min-w-0">
                <span className="block font-bold text-slate-900 text-sm truncate">TchopMyGrinds</span>
                <span className="block text-xs text-slate-500 truncate">Marketplace géolocalisé</span>
              </div>
            </Link>
          ) : (
            <div className="flex justify-center w-full">
              <Logo size="sm" />
            </div>
          )}

          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Fermer le menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleToggleSidebar}
            className="hidden lg:inline-flex items-center justify-center min-w-[36px] min-h-[36px] text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label={isCollapsed ? 'Élargir le menu' : 'Réduire le menu'}
            aria-expanded={!isCollapsed}
            aria-controls="app-sidebar"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {currentLocation && showLabels && (
          <div className="px-4 py-3 bg-brand-50/60 border-b border-brand-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="absolute inset-0 rounded-full bg-brand-500 opacity-60 animate-ping" />
                <span className="relative rounded-full h-2 w-2 bg-brand-600" />
              </span>
              <div className="min-w-0">
                <p className="text-brand-800 text-xs font-medium">Position détectée</p>
                <p className="text-brand-600 text-xs truncate">Rayon 50 km actif</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overscroll-contain" aria-label="Navigation principale">
          {menuItems.map((item) => {
            if (item.requireAuth && !isAuthenticated) return null

            const active = isActive(item.path)
            const tooltip = !showLabels ? item.label : undefined
            const ariaLabel = !showLabels ? item.label : undefined

            const iconNode =
              item.key === 'messages' && item.isCustom ? (
                <MessageIcon className="text-lg flex-shrink-0" />
              ) : item.Icon ? (
                <item.Icon className="w-5 h-5 flex-shrink-0" />
              ) : null

            return (
              <Link
                key={item.key}
                to={item.path}
                className={navItemClasses(active)}
                aria-current={active ? 'page' : undefined}
                title={tooltip}
                aria-label={ariaLabel}
              >
                {iconNode}
                {showLabels && <span className="flex-1 min-w-0 truncate">{item.label}</span>}
              </Link>
            )
          })}

          {isAuthenticated && user && (user.role === 'itinerant' || user.role === 'sedentary') && (
            <>
              {showLabels ? (
                <div className="flex items-center gap-2 px-3 pt-5 pb-2 mt-3 border-t border-slate-200">
                  <span className="inline-flex items-center rounded-full bg-accent-500/15 text-accent-700 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                    Vendeur
                  </span>
                </div>
              ) : (
                <div className="mx-3 my-3 border-t border-slate-200" aria-hidden="true" />
              )}

              {vendorItems.map((item) => {
                const active = isActive(item.path)
                const Icon = item.Icon
                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={navItemClasses(active)}
                    aria-current={active ? 'page' : undefined}
                    title={!showLabels ? item.label : undefined}
                    aria-label={!showLabels ? item.label : undefined}
                  >
                    {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                    {showLabels && <span className="flex-1 min-w-0 truncate">{item.label}</span>}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-slate-200 space-y-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleCartToggle}
            className="w-full relative flex items-center gap-3 px-3 min-h-[48px] rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            title={!showLabels ? 'Panier' : undefined}
            aria-label={!showLabels ? `Panier (${totalItems} article${totalItems > 1 ? 's' : ''})` : undefined}
          >
            <span className="relative flex-shrink-0">
              <CartIcon className="w-5 h-5" />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ring-2 ring-white"
                  aria-hidden={showLabels ? 'true' : undefined}
                >
                  {totalItems}
                </span>
              )}
            </span>
            {showLabels && (
              <>
                <span className="flex-1 text-left">Panier</span>
                {totalItems > 0 && (
                  <span className="text-xs text-slate-500" aria-label={`${totalItems} article${totalItems > 1 ? 's' : ''}`}>
                    {totalItems}
                  </span>
                )}
              </>
            )}
          </button>

          {isAuthenticated && user ? (
            <>
              {showLabels && (
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        width={36}
                        height={36}
                        loading="lazy"
                        decoding="async"
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-brand-700 font-semibold text-sm" aria-hidden="true">
                        {(user.name?.[0] || user.email[0]).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.name || user.email}</p>
                    <p className="text-xs text-slate-500 capitalize truncate">{user.role}</p>
                  </div>
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 min-h-[44px] rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                title={!showLabels ? 'Se déconnecter' : undefined}
                aria-label={!showLabels ? 'Se déconnecter' : undefined}
              >
                <LogoutIcon className="w-5 h-5 flex-shrink-0" />
                {showLabels && <span>Se déconnecter</span>}
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="w-full flex items-center gap-3 px-3 min-h-[48px] rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              title={!showLabels ? 'Connexion' : undefined}
              aria-label={!showLabels ? 'Connexion' : undefined}
            >
              <LoginIcon className="w-5 h-5 flex-shrink-0" />
              {showLabels && <span>Connexion</span>}
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
