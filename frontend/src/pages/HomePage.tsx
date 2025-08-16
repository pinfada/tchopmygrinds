import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchNearbyCommerces } from '../store/slices/commerceSlice'
import LeafletMap from '../components/Map/LeafletMap'
import GeolocationButton from '../components/Map/GeolocationButton'
import { Button, Card, Badge, Input } from '../components/ui'
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

  const handleCommerceClick = (commerce: Commerce) => {
    // Navigation vers la page du commerce
    window.location.href = `/commerces/${commerce.id}`
  }

  const nearbyCommerces = Array.isArray(commerces) ? commerces.slice(0, 6) : [] // Afficher seulement 6 commerces

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 rounded-2xl text-white shadow-elev">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            TchopMyGrinds
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 font-medium">
            Découvrez les bananes plantain et produits frais de votre région
          </p>
          <p className="text-lg mb-12 opacity-80">
            Connectez-vous aux commerçants locaux dans un rayon de 50km
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Rechercher un produit, un commerce..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 text-base bg-white/95 backdrop-blur border-white/20 focus:border-white focus:ring-white/30"
                />
              </div>
              <div className="flex gap-3">
                <Link 
                  to={`/products${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md font-medium transition-all duration-200 bg-white text-brand-600 hover:bg-white/95 shadow-md focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  Rechercher
                </Link>
                <Link 
                  to="/map"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md font-medium transition-all duration-200 border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
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
        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Activez la géolocalisation</h3>
                  <p className="text-slate-600">Trouvez les commerces les plus proches de vous</p>
                </div>
              </div>
              <GeolocationButton
                onLocationFound={(coords) => {
                  dispatch(fetchNearbyCommerces({ 
                    location: coords, 
                    radius: 50 
                  }))
                }}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-all duration-200 bg-brand-600 text-white hover:bg-brand-700 shadow-card focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                {locationLoading ? 'Localisation...' : 'Activer'}
              </GeolocationButton>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Commerces proches */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            {currentLocation ? 'Commerces près de vous' : 'Commerces populaires'}
          </h2>
          <Link 
            to="/commerces" 
            className="text-brand-600 hover:text-brand-700 font-medium transition-colors duration-200"
          >
            Voir tout →
          </Link>
        </div>

        {commercesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-slate-200 rounded-t-xl"></div>
                <Card.Body>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded mb-4"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : nearbyCommerces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyCommerces.map((commerce) => (
              <Link 
                key={commerce.id} 
                to={`/commerces/${commerce.id}`}
                className="group"
              >
                <Card className="h-full hover:shadow-xl hover:border-brand-200 transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="h-48 bg-gradient-to-br from-brand-50 to-brand-100 rounded-t-xl flex items-center justify-center">
                    <svg className="w-16 h-16 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <Card.Body>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-slate-900 line-clamp-1">
                        {commerce.name}
                      </h3>
                      {commerce.isVerified && (
                        <Badge variant="success" className="ml-2 shrink-0">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Vérifié
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                      {commerce.description}
                    </p>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <Badge variant="secondary">
                        {commerce.category}
                      </Badge>
                      {commerce.distance && (
                        <span className="text-brand-600 font-medium">
                          {commerce.distance.toFixed(1)} km
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(getRating(commerce.rating)) ? 'text-yellow-400' : 'text-slate-300'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-slate-500 text-sm ml-2">
                        ({getRating(commerce.rating).toFixed(1)})
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <Card.Body className="text-center py-12">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun commerce trouvé</h3>
              <p className="text-slate-600">
                Activez la géolocalisation pour découvrir les commerces près de vous
              </p>
            </Card.Body>
          </Card>
        )}
      </section>

      {/* Carte des commerces */}
      {currentLocation && Array.isArray(commerces) && commerces.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Carte des commerces
            </h2>
            <Link 
              to="/map" 
              className="text-brand-600 hover:text-brand-700 font-medium transition-colors duration-200"
            >
              Voir en grand →
            </Link>
          </div>
          
          <Card className="overflow-hidden">
            <LeafletMap
              userLocation={currentLocation}
              commerces={commerces}
              onCommerceClick={handleCommerceClick}
              height="500px"
              zoom={12}
            />
            <Card.Footer className="text-center">
              <p className="text-sm text-slate-600">
                {Array.isArray(commerces) ? commerces.length : 0} commerce{(Array.isArray(commerces) ? commerces.length : 0) > 1 ? 's' : ''} affiché{(Array.isArray(commerces) ? commerces.length : 0) > 1 ? 's' : ''} 
                {currentLocation && (
                  <span> • Recherche dans un rayon de 50km</span>
                )}
              </p>
            </Card.Footer>
          </Card>
        </section>
      )}

      {/* Catégories populaires */}
      <section>
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Catégories populaires</h2>
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
              className="group"
            >
              <Card className="text-center hover:shadow-lg hover:border-brand-200 transition-all duration-300 group-hover:scale-105">
                <Card.Body>
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="font-semibold text-slate-900 mb-2">{category.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </Card.Body>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to action */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 rounded-2xl text-white text-center py-16 shadow-elev">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-4">Rejoignez TchopMyGrinds</h2>
            <p className="text-xl mb-8 opacity-90">
              Découvrez les meilleurs produits frais de votre région
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/auth" 
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold transition-all duration-200 bg-white text-brand-600 hover:bg-white/95 shadow-md"
              >
                S'inscrire
              </Link>
              <Link 
                to="/become-merchant" 
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold transition-all duration-200 border-2 border-white text-white hover:bg-white hover:text-brand-600"
              >
                Devenir commerçant
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage