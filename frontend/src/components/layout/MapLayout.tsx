import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { getCurrentLocation } from '../../store/slices/locationSlice'
import { fetchNearbyCommerces } from '../../store/slices/commerceSlice'
import Sidebar from './Sidebar'
import LeafletMap from '../Map/LeafletMap'
import GeolocationButton from '../Map/GeolocationButton'
import Modal from '../ui/Modal'
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

  // Géolocalisation automatique au montage
  useEffect(() => {
    if (!currentLocation && !locationLoading) {
      dispatch(getCurrentLocation())
    }
  }, [dispatch, currentLocation, locationLoading])

  // Charger les commerces proches quand la position est disponible
  useEffect(() => {
    if (currentLocation && Array.isArray(commerces) && commerces.length === 0 && !loading) {
      dispatch(fetchNearbyCommerces({ 
        location: currentLocation, 
        radius: 50 
      }))
    }
  }, [currentLocation, dispatch, commerces, loading])

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
              : [46.603354, 1.888334] // Centre de la France
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

        {/* Statistiques (overlay) */}
        {currentLocation && filteredCommerces.length > 0 && (
          <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 z-10">
            <div className="text-sm">
              <p className="font-medium text-gray-900">Statistiques</p>
              <p className="text-gray-600">{filteredCommerces.length} commerces</p>
              <p className="text-gray-600">Rayon: 50km</p>
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
    </div>
  )
}

export default MapLayout