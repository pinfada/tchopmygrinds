import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchNearbyCommerces } from '../store/slices/commerceSlice'
// import { getCurrentLocation } from '../store/slices/locationSlice'
import LeafletMap from '../components/Map/LeafletMap'
import GeolocationButton from '../components/Map/GeolocationButton'
import type { Commerce } from '../types'

const HomePage = () => {
  const dispatch = useAppDispatch()
  const { commerces, loading: commercesLoading } = useAppSelector((state) => state.commerce)
  const { currentLocation, loading: locationLoading } = useAppSelector((state) => state.location)
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  
  const [searchQuery, setSearchQuery] = useState('')

  // Fonction utilitaire pour convertir le rating en nombre
  const getRating = (rating: any): number => {
    const num = Number(rating)
    return isNaN(num) ? 0 : num
  }

  useEffect(() => {
    // Charger les commerces proches si géolocalisation disponible
    if (currentLocation && !commercesLoading && Array.isArray(commerces) && commerces.length === 0) {
      dispatch(fetchNearbyCommerces({ 
        location: currentLocation, 
        radius: 50 
      }))
    }
  }, [currentLocation, dispatch, commercesLoading, commerces.length])

  // Fonction de géolocalisation (utilisée dans le composant GeolocationButton)
  // const handleLocationRequest = () => {
  //   dispatch(getCurrentLocation())
  // }

  const handleCommerceClick = (commerce: Commerce) => {
    // Navigation vers la page du commerce
    window.location.href = `/commerces/${commerce.id}`
  }

  const nearbyCommerces = Array.isArray(commerces) ? commerces.slice(0, 6) : [] // Afficher seulement 6 commerces

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl text-white">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            TchopMyGrinds
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Découvrez les bananes plantain et produits frais de votre région
          </p>
          <p className="text-lg mb-8 opacity-80">
            Connectez-vous aux commerçants locaux dans un rayon de 50km
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher un produit, un commerce..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-emerald-300 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <Link 
                  to={`/products${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}
                  className="px-6 py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Rechercher
                </Link>
                <Link 
                  to="/map"
                  className="px-6 py-4 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors border-2 border-white/30"
                >
                  📍 Carte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Géolocalisation */}
      {!currentLocation && (
        <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Activez la géolocalisation</h3>
                <p className="text-gray-600">Trouvez les commerces les plus proches de vous</p>
              </div>
            </div>
            <GeolocationButton
              onLocationFound={(coords) => {
                dispatch(fetchNearbyCommerces({ 
                  location: coords, 
                  radius: 50 
                }))
              }}
              className="btn-primary"
            >
              {locationLoading ? 'Localisation...' : 'Activer'}
            </GeolocationButton>
          </div>
        </section>
      )}

      {/* Commerces proches */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {currentLocation ? 'Commerces près de vous' : 'Commerces populaires'}
          </h2>
          <Link 
            to="/commerces" 
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Voir tout →
          </Link>
        </div>

        {commercesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                <div className="card-body">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : nearbyCommerces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyCommerces.map((commerce) => (
              <Link 
                key={commerce.id} 
                to={`/commerces/${commerce.id}`}
                className="card hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-t-xl flex items-center justify-center">
                  <svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="card-body">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {commerce.name}
                    </h3>
                    {commerce.isVerified && (
                      <span className="text-emerald-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {commerce.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {commerce.category}
                    </span>
                    {commerce.distance && (
                      <span className="text-emerald-600 font-medium">
                        {commerce.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(getRating(commerce.rating)) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm ml-2">
                      ({getRating(commerce.rating).toFixed(1)})
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun commerce trouvé</h3>
            <p className="text-gray-600">
              Activez la géolocalisation pour découvrir les commerces près de vous
            </p>
          </div>
        )}
      </section>

      {/* Carte des commerces */}
      {currentLocation && Array.isArray(commerces) && commerces.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Carte des commerces
            </h2>
            <Link 
              to="/map" 
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Voir en grand →
            </Link>
          </div>
          
          <div className="rounded-xl overflow-hidden shadow-lg">
            <LeafletMap
              userLocation={currentLocation}
              commerces={commerces}
              onCommerceClick={handleCommerceClick}
              height="500px"
              zoom={12}
            />
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            {Array.isArray(commerces) ? commerces.length : 0} commerce{(Array.isArray(commerces) ? commerces.length : 0) > 1 ? 's' : ''} affiché{(Array.isArray(commerces) ? commerces.length : 0) > 1 ? 's' : ''} 
            {currentLocation && (
              <span> • Recherche dans un rayon de 50km</span>
            )}
          </div>
        </section>
      )}

      {/* Catégories populaires */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Catégories populaires</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Bananes plantain', icon: '🍌', count: '150+ produits' },
            { name: 'Légumes frais', icon: '🥬', count: '200+ produits' },
            { name: 'Fruits locaux', icon: '🥭', count: '120+ produits' },
            { name: 'Épices', icon: '🌶️', count: '80+ produits' },
          ].map((category) => (
            <Link
              key={category.name}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="card hover:shadow-lg transition-shadow duration-300 text-center"
            >
              <div className="card-body">
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to action */}
      {!isAuthenticated && (
        <section className="bg-emerald-500 rounded-2xl text-white text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Rejoignez TchopMyGrinds</h2>
          <p className="text-xl mb-8 opacity-90">
            Découvrez les meilleurs produits frais de votre région
          </p>
          <div className="space-x-4">
            <Link to="/auth" className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              S'inscrire
            </Link>
            <Link to="/become-merchant" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors">
              Devenir commerçant
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage