import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { logout } from '../store/slices/authSlice'
import { toggleCart } from '../store/slices/cartSlice'

const Header = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
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

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/images/logo.png" 
              alt="TchopMyGrinds" 
              className="h-8 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span className="text-xl font-bold text-emerald-600 hidden sm:block">
              TchopMyGrinds
            </span>
          </Link>

          {/* Navigation principale - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
            >
              Accueil
            </Link>
            <Link 
              to="/commerces" 
              className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
            >
              Commerces
            </Link>
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-emerald-600 font-medium transition-colors"
            >
              Produits
            </Link>
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Localisation */}
            {currentLocation && (
              <div className="hidden sm:flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-1 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>Position détectée</span>
              </div>
            )}

            {/* Panier */}
            <button
              onClick={handleCartToggle}
              className="relative p-2 text-gray-700 hover:text-emerald-600 transition-colors"
              aria-label="Ouvrir le panier"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Authentification */}
            {isAuthenticated && user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="text-emerald-600 font-medium">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block font-medium">{user.name || user.email}</span>
                </button>
                
                {/* Menu dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Mon Profil
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Mes Commandes
                    </Link>
                    {user.role !== 'others' && (
                      <Link 
                        to="/dashboard" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Tableau de bord
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="btn-primary text-sm px-4 py-2"
              >
                Connexion
              </Link>
            )}

            {/* Menu mobile toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-emerald-600"
              aria-label="Menu mobile"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 fade-in">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-emerald-600 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                to="/commerces" 
                className="text-gray-700 hover:text-emerald-600 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Commerces
              </Link>
              <Link 
                to="/products" 
                className="text-gray-700 hover:text-emerald-600 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Produits
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header