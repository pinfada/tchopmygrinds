import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchNearbyCommerces } from '../store/slices/commerceSlice'
import { getCurrentLocation } from '../store/slices/locationSlice'
import LeafletMap from '../components/Map/LeafletMap'
import GeolocationButton from '../components/Map/GeolocationButton'
import type { Commerce } from '../types'

const MapPage = () => {
  const dispatch = useAppDispatch()
  const { commerces, loading: commercesLoading, error } = useAppSelector((state) => state.commerce)
  const { currentLocation, loading: locationLoading } = useAppSelector((state) => state.location)
  
  const [selectedCommerce, setSelectedCommerce] = useState<Commerce | null>(null)
  const [searchRadius, setSearchRadius] = useState(50)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    verified: false,
    rating: 0
  })

  useEffect(() => {
    if (currentLocation && !commercesLoading) {
      dispatch(fetchNearbyCommerces({ 
        location: currentLocation, 
        radius: searchRadius 
      }))
    }
  }, [currentLocation, searchRadius, dispatch, commercesLoading])

  const handleCommerceClick = (commerce: Commerce) => {
    setSelectedCommerce(commerce)
  }

  const handleLocationFound = (coords: { latitude: number; longitude: number }) => {
    dispatch(fetchNearbyCommerces({ 
      location: coords, 
      radius: searchRadius 
    }))
  }

  const filteredCommerces = Array.isArray(commerces) ? commerces.filter(commerce => {
    if (searchQuery && !commerce.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (filters.category && commerce.category !== filters.category) {
      return false
    }
    if (filters.verified && !commerce.isVerified) {
      return false
    }
    if (filters.rating && (!commerce.rating || commerce.rating < filters.rating)) {
      return false
    }
    return true
  }) : []

  const categories = Array.from(new Set(
    Array.isArray(commerces) ? commerces.map(c => c.category).filter(Boolean) : []
  ))

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Panel de contrôles - responsive */}
      <div className="lg:w-80 xl:w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header du panel */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">
              Commerces près de vous
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-sm px-2 py-1 rounded-full">
              {filteredCommerces.length}
            </span>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un commerce..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filtres */}
        <div className="p-4 border-b border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rayon de recherche
            </label>
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="verified"
              checked={filters.verified}
              onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="verified" className="text-sm text-gray-700">
              Commerces vérifiés uniquement
            </label>
          </div>

          {!currentLocation && (
            <GeolocationButton
              onLocationFound={handleLocationFound}
              className="w-full btn-primary"
            >
              {locationLoading ? 'Localisation...' : 'Activer la géolocalisation'}
            </GeolocationButton>
          )}
        </div>

        {/* Liste des commerces */}
        <div className="flex-1 overflow-y-auto">
          {commercesLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => currentLocation && dispatch(fetchNearbyCommerces({ location: currentLocation, radius: searchRadius }))}
                className="mt-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                Réessayer
              </button>
            </div>
          ) : filteredCommerces.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm">Aucun commerce trouvé</p>
              <p className="text-xs mt-1">Essayez d'élargir votre recherche</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCommerces.map((commerce) => (
                <div
                  key={commerce.id}
                  onClick={() => handleCommerceClick(commerce)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedCommerce?.id === commerce.id ? 'bg-emerald-50 border-r-2 border-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {commerce.name}
                        </h3>
                        {commerce.isVerified && (
                          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {commerce.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{commerce.category}</span>
                        {commerce.distance && (
                          <span className="font-medium text-emerald-600">
                            {commerce.distance.toFixed(1)} km
                          </span>
                        )}
                      </div>
                      
                      {commerce.rating && (
                        <div className="flex items-center mt-1">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg 
                                key={i} 
                                className={`w-3 h-3 ${i < Math.floor(Number(commerce.rating) || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-1">
                            ({Number(commerce.rating || 0).toFixed(1)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer du panel */}
        {currentLocation && (
          <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-600">
            📍 Position actuelle: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
          </div>
        )}
      </div>

      {/* Carte */}
      <div className="flex-1 relative">
        {currentLocation ? (
          <LeafletMap
            userLocation={currentLocation}
            commerces={filteredCommerces}
            onCommerceClick={handleCommerceClick}
            selectedCommerce={selectedCommerce}
            height="100%"
            zoom={12}
            className="w-full h-full"
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Géolocalisation requise
              </h3>
              <p className="text-gray-600 mb-4">
                Activez la géolocalisation pour voir les commerces près de vous
              </p>
              <GeolocationButton
                onLocationFound={handleLocationFound}
                className="btn-primary"
              >
                {locationLoading ? 'Localisation...' : 'Activer la géolocalisation'}
              </GeolocationButton>
            </div>
          </div>
        )}

        {/* Overlay d'informations sur mobile */}
        {selectedCommerce && (
          <div className="lg:hidden absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{selectedCommerce.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedCommerce.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">{selectedCommerce.category}</span>
                  {selectedCommerce.distance && (
                    <span className="text-sm font-medium text-emerald-600">
                      {selectedCommerce.distance.toFixed(1)} km
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedCommerce(null)}
                className="ml-4 p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapPage