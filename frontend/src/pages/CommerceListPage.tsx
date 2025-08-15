import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchNearbyCommerces, searchCommerces } from '../store/slices/commerceSlice'
import { getCurrentLocation } from '../store/slices/locationSlice'
import LeafletMap from '../components/Map/LeafletMap'
import GeolocationButton from '../components/Map/GeolocationButton'
import type { Commerce } from '../types'

const CommerceListPage = () => {
  const dispatch = useAppDispatch()
  const { commerces, loading } = useAppSelector((state) => state.commerce)
  const { currentLocation } = useAppSelector((state) => state.location)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')

  const categories = [
    'Tous',
    'Alimentation générale',
    'Fruits et légumes',
    'Bananes plantain',
    'Épicerie fine',
    'Produits bio',
    'Marché local'
  ]

  useEffect(() => {
    // Charger les commerces au montage
    if (currentLocation) {
      dispatch(fetchNearbyCommerces({ 
        location: currentLocation, 
        radius: 50 
      }))
    }
  }, [currentLocation, dispatch])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchCommerces({
        query: searchQuery,
        location: currentLocation || undefined,
        filters: {
          category: selectedCategory || undefined,
          rating: minRating > 0 ? minRating : undefined,
          verified: verifiedOnly || undefined
        }
      }))
    } else {
      // Recherche avec filtres seulement
      if (currentLocation) {
        dispatch(fetchNearbyCommerces({ 
          location: currentLocation, 
          radius: 50 
        }))
      }
    }
  }

  // const handleFilterChange = (newFilters: any) => {
  //   dispatch(setFilters(newFilters))
  //   handleSearch()
  // }

  const handleLocationRequest = () => {
    dispatch(getCurrentLocation())
  }

  // Filtrer localement les commerces selon les critères
  const filteredCommerces = commerces.filter(commerce => {
    if (selectedCategory && selectedCategory !== 'Tous' && commerce.category !== selectedCategory) {
      return false
    }
    if (minRating > 0 && (commerce.rating || 0) < minRating) {
      return false
    }
    if (verifiedOnly && !commerce.isVerified) {
      return false
    }
    return true
  })

  const handleCommerceClick = (commerce: Commerce) => {
    // Navigation vers la page du commerce
    window.location.href = `/commerces/${commerce.id}`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Commerces locaux
        </h1>
        <p className="text-xl text-gray-600">
          Découvrez les commerces près de vous dans un rayon de 50km
        </p>
      </div>

      {/* Géolocalisation */}
      {!currentLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Activez la géolocalisation</h3>
                <p className="text-gray-600">Pour voir les commerces les plus proches</p>
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
              Activer
            </GeolocationButton>
          </div>
        </div>
      )}

      {/* Recherche et filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Barre de recherche */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher un commerce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary px-8"
            >
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Catégorie */}
            <div>
              <label className="form-label">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-input"
              >
                {categories.map(category => (
                  <option key={category} value={category === 'Tous' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Note minimale */}
            <div>
              <label className="form-label">Note minimale</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="form-input"
              >
                <option value={0}>Toutes les notes</option>
                <option value={4}>4+ étoiles</option>
                <option value={3}>3+ étoiles</option>
                <option value={2}>2+ étoiles</option>
              </select>
            </div>

            {/* Vérifiés seulement */}
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="verified"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="verified" className="text-sm text-gray-700">
                Commerces vérifiés uniquement
              </label>
            </div>

            {/* Toggle vue */}
            <div className="pt-8">
              <label className="form-label mb-2">Mode d'affichage</label>
              <div className="flex rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-emerald-500 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 Liste
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    viewMode === 'map' 
                      ? 'bg-emerald-500 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🗺️ Carte
                </button>
              </div>
            </div>

            {/* Réinitialiser */}
            <div className="pt-8">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('')
                  setMinRating(0)
                  setVerifiedOnly(false)
                  if (currentLocation) {
                    dispatch(fetchNearbyCommerces({ 
                      location: currentLocation, 
                      radius: 50 
                    }))
                  }
                }}
                className="btn-secondary w-full"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredCommerces.length} commerce{filteredCommerces.length !== 1 ? 's' : ''} trouvé{filteredCommerces.length !== 1 ? 's' : ''}
          </h2>
          
          {currentLocation && (
            <div className="text-sm text-gray-600">
              <svg className="w-4 h-4 inline mr-1 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Rayon de 50km
            </div>
          )}
        </div>

        {loading ? (
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
        ) : viewMode === 'map' && filteredCommerces.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <p className="text-gray-600">
                {filteredCommerces.length} commerce{filteredCommerces.length > 1 ? 's' : ''} affiché{filteredCommerces.length > 1 ? 's' : ''} sur la carte
              </p>
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-lg">
              <LeafletMap
                userLocation={currentLocation}
                commerces={filteredCommerces}
                onCommerceClick={handleCommerceClick}
                height="600px"
                zoom={currentLocation ? 12 : 6}
                center={currentLocation ? [currentLocation.latitude, currentLocation.longitude] : [46.603354, 1.888334]} // Centre de la France
              />
            </div>
          </div>
        ) : filteredCommerces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommerces.map((commerce) => (
              <Link 
                key={commerce.id} 
                to={`/commerces/${commerce.id}`}
                className="card hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-t-xl flex items-center justify-center relative">
                  <svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  
                  {commerce.isVerified && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="card-body">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {commerce.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {commerce.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{commerce.address}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-600 font-medium">
                        {commerce.category}
                      </span>
                      {commerce.distance && (
                        <span className="text-gray-500">
                          {commerce.distance.toFixed(1)} km
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center">
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
                      <span className="text-gray-500 text-sm ml-2">
                        ({(commerce.rating || 0).toFixed(1)})
                      </span>
                    </div>
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
            <p className="text-gray-600 mb-4">
              Essayez de modifier vos critères de recherche ou d'activer la géolocalisation
            </p>
            {!currentLocation && (
              <button
                onClick={handleLocationRequest}
                className="btn-primary"
              >
                Activer la géolocalisation
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CommerceListPage