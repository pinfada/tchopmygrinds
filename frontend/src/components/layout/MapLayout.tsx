import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { getCurrentLocation } from '../../store/slices/locationSlice'
import { fetchNearbyCommerces } from '../../store/slices/commerceSlice'
import Sidebar from './Sidebar'
import LeafletMap from '../Map/LeafletMap'
import GeolocationButton from '../Map/GeolocationButton'
import Modal from '../ui/Modal'
import MapSettings from '../Map/MapSettings'
import { mapSettingsService } from '../../services/mapSettings'
import type { Commerce } from '../../types'

interface MapLayoutProps {
  children?: React.ReactNode
}

const MapLayout = ({ children }: MapLayoutProps) => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  
  const { commerces, loading } = useAppSelector((state) => state.commerce)
  const { currentLocation, loading: locationLoading } = useAppSelector((state) => state.location)
  
  const [selectedCommerce, setSelectedCommerce] = useState<Commerce | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [showSettings, setShowSettings] = useState(false)

  // Géolocalisation automatique au montage
  useEffect(() => {
    if (!currentLocation && !locationLoading) {
      dispatch(getCurrentLocation())
    }
  }, [dispatch, currentLocation, locationLoading])

  // Fonction pour recharger les commerces
  const reloadCommerces = () => {
    if (currentLocation) {
      const settings = mapSettingsService.getSettings()
      dispatch(fetchNearbyCommerces({ 
        location: currentLocation, 
        radius: settings.searchRadius 
      }))
      setLastRefresh(new Date())
      console.log(`🔄 Rafraîchissement des commerces (rayon: ${settings.searchRadius}km)`)
    }
  }

  // Charger les commerces proches quand la position est disponible
  useEffect(() => {
    if (currentLocation && Array.isArray(commerces) && commerces.length === 0 && !loading) {
      reloadCommerces()
    }
  }, [currentLocation, dispatch, commerces, loading])

  // Écouter les événements de rafraîchissement automatique
  useEffect(() => {
    const handleAutoRefresh = () => {
      console.log('🕐 Rafraîchissement automatique déclenché')
      reloadCommerces()
    }

    const handleForceRefresh = () => {
      console.log('🔄 Rafraîchissement forcé déclenché')
      reloadCommerces()
    }

    window.addEventListener('map-auto-refresh', handleAutoRefresh)
    window.addEventListener('map-force-refresh', handleForceRefresh)

    return () => {
      window.removeEventListener('map-auto-refresh', handleAutoRefresh)
      window.removeEventListener('map-force-refresh', handleForceRefresh)
    }
  }, [currentLocation])

  // Gérer l'affichage des modals selon la route
  useEffect(() => {
    const path = location.pathname
    
    if (path === '/') {
      setShowModal(false)
    } else if (path === '/commerces') {
      setModalTitle('Commerces locaux')
      setShowModal(true)
    } else if (path === '/products') {
      setModalTitle('Catalogue produits')
      setShowModal(true)
    } else if (path === '/orders') {
      setModalTitle('Mes commandes')
      setShowModal(true)
    } else if (path === '/profile') {
      setModalTitle('Mon profil')
      setShowModal(true)
    } else if (path === '/auth') {
      setModalTitle('Authentification')
      setShowModal(true)
    } else if (path === '/checkout') {
      setModalTitle('Finaliser la commande')
      setShowModal(true)
    } else if (path === '/cart') {
      setModalTitle('Mon panier')
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [location.pathname])

  const handleCommerceClick = (commerce: Commerce) => {
    setSelectedCommerce(commerce)
    // Optionnel: ouvrir une modal détail commerce
  }

  const handleLocationRequest = () => {
    dispatch(getCurrentLocation())
  }

  const filteredCommerces = Array.isArray(commerces) ? commerces : []

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content - Carte */}
      <div className="flex-1 transition-all duration-300 relative" style={{ marginLeft: 'var(--sidebar-width, 256px)' }}>
        {/* Header de la carte */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Marketplace Géolocalisé</h1>
              <p className="text-sm text-gray-600">
                {currentLocation 
                  ? `${filteredCommerces.length} commerce${filteredCommerces.length !== 1 ? 's' : ''} dans un rayon de 50km`
                  : 'Activez la géolocalisation pour découvrir les commerces près de vous'
                }
              </p>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center space-x-4">
              {!currentLocation && (
                <GeolocationButton
                  onLocationFound={(coords) => {
                    dispatch(fetchNearbyCommerces({ 
                      location: coords, 
                      radius: 50 
                    }))
                  }}
                  className="btn-primary"
                >
                  📍 Géolocalisation
                </GeolocationButton>
              )}
              
              {currentLocation && (
                <div className="flex items-center space-x-2 text-sm text-emerald-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>Position active</span>
                </div>
              )}
              
              {/* Bouton paramètres */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Paramètres de la carte"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Carte principale */}
        <div className="h-full pt-20">
          <LeafletMap
            userLocation={currentLocation}
            commerces={filteredCommerces}
            onCommerceClick={handleCommerceClick}
            height="100%"
            zoom={currentLocation ? 12 : 6}
            center={currentLocation 
              ? [currentLocation.latitude, currentLocation.longitude] 
              : [4.0511, 9.7679] // Douala, Cameroun
            }
          />
        </div>

        {/* Informations géolocalisation (overlay) */}
        {locationLoading && (
          <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 z-10">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
              <span className="text-sm font-medium text-gray-700">Géolocalisation en cours...</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 z-10">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
              <span className="text-sm font-medium text-gray-700">Chargement des commerces...</span>
            </div>
          </div>
        )}

        {/* Statistiques et info refresh (overlay) */}
        {currentLocation && filteredCommerces.length > 0 && (
          <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 z-10">
            <div className="text-sm space-y-2">
              <div>
                <p className="font-medium text-gray-900">Statistiques</p>
                <p className="text-gray-600">{filteredCommerces.length} commerces</p>
                <p className="text-gray-600">Rayon: {mapSettingsService.getSettings().searchRadius}km</p>
              </div>
              
              <div className="border-t border-gray-200 pt-2">
                <p className="text-xs text-gray-500">
                  Dernière MAJ: {lastRefresh.toLocaleTimeString()}
                </p>
                {mapSettingsService.getSettings().autoRefreshEnabled && (
                  <p className="text-xs text-emerald-600">
                    ⏰ Auto-refresh: {mapSettingsService.getSettings().mapRefreshInterval}min
                  </p>
                )}
                <button
                  onClick={() => mapSettingsService.forceRefresh()}
                  className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  🔄 Actualiser maintenant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal pour les pages */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalTitle}
        size="xl"
      >
        {children}
      </Modal>

      {/* Modal des paramètres */}
      <MapSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
}

export default MapLayout