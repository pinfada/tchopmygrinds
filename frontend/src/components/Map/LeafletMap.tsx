import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Commerce, Coordinates } from '../../types'
import { useAppSelector } from '../../hooks/redux'
import { createCustomIcon, createUserPopup, createCommercePopup, markerStyles, MarkerType } from './MapMarkers'
import { locationTrackingService, AmbulantCommerce } from '../../services/locationTracking'

interface LeafletMapProps {
  userLocation: Coordinates | null
  commerces: Commerce[]
  onCommerceClick: (commerce: Commerce) => void
  height: string
  zoom: number
  center: [number, number]
  selectedCommerce?: Commerce | null
}

// Composant pour injecter les styles
function MapStyleInjector() {
  useEffect(() => {
    const styleId = 'leaflet-custom-styles'
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('div')
      styleElement.id = styleId
      styleElement.innerHTML = markerStyles
      document.head.appendChild(styleElement)
    }
  }, [])

  return null
}

// Composant pour les handlers globaux
function MapEventHandlers({ commerces }: { commerces: Commerce[] }) {
  const navigate = useNavigate()
  
  useEffect(() => {
    // Handler pour voir le profil utilisateur
    (window as any).handleProfileClick = () => {
      navigate('/profile')
    }

    // Handler pour voir les produits d'un commerce
    (window as any).handleProductsClick = (commerceId: string) => {
      navigate(`/products?commerce=${commerceId}`)
    }

    // Handler pour suivre un commerce ambulant
    (window as any).handleTrackClick = (commerceId: string) => {
      const commerce = commerces.find(c => c.id === commerceId)
      if (commerce && commerce.type === 'itinerant') {
        locationTrackingService.startTracking(commerceId, (updatedCommerce) => {
          console.log('Position mise à jour:', updatedCommerce)
          // Trigger re-render ou update state
          window.dispatchEvent(new CustomEvent('commerce-location-update', {
            detail: { commerceId, commerce: updatedCommerce }
          }))
        })
      }
    }

    // Handler pour voir les détails d'un commerce
    (window as any).handleCommerceDetail = (commerceId: string) => {
      navigate(`/commerces/${commerceId}`)
    }

    return () => {
      // Cleanup handlers
      delete (window as any).handleProfileClick
      delete (window as any).handleProductsClick
      delete (window as any).handleTrackClick
      delete (window as any).handleCommerceDetail
    }
  }, [navigate, commerces])

  return null
}

// Composant pour le marker utilisateur
function UserMarker({ position }: { position: Coordinates }) {
  const { user } = useAppSelector((state) => state.auth)

  return (
    <Marker 
      position={[position.latitude, position.longitude]} 
      icon={createCustomIcon('user', { isOnline: true })}
    >
      <Popup>
        <div dangerouslySetInnerHTML={{
          __html: createUserPopup(user, () => {})
        }} />
      </Popup>
    </Marker>
  )
}

// Composant pour les markers des commerces avec suivi des ambulants
function CommerceMarkers({ 
  commerces, 
  onCommerceClick,
  selectedCommerce 
}: { 
  commerces: Commerce[]
  onCommerceClick: (commerce: Commerce) => void
  selectedCommerce?: Commerce | null
}) {
  const [trackedCommerces, setTrackedCommerces] = useState<Map<string, AmbulantCommerce>>(new Map())

  // Écouter les mises à jour de position des commerces ambulants
  useEffect(() => {
    const handleLocationUpdate = (event: CustomEvent) => {
      const { commerceId, commerce } = event.detail
      setTrackedCommerces(prev => {
        const updated = new Map(prev)
        updated.set(commerceId, commerce)
        return updated
      })
    }

    window.addEventListener('commerce-location-update', handleLocationUpdate as EventListener)
    
    return () => {
      window.removeEventListener('commerce-location-update', handleLocationUpdate as EventListener)
    }
  }, [])

  // Démarrer automatiquement le suivi des commerces ambulants en ligne
  useEffect(() => {
    commerces
      .filter(commerce => commerce.type === 'itinerant' && commerce.isOnline)
      .forEach(commerce => {
        if (!locationTrackingService.isTracking(commerce.id)) {
          // Simuler le mouvement pour la démo
          locationTrackingService.simulateMovement(commerce.id, {
            latitude: commerce.latitude,
            longitude: commerce.longitude
          })
        }
      })

    // Cleanup au démontage
    return () => {
      locationTrackingService.stopAllTracking()
    }
  }, [commerces])

  return (
    <>
      {commerces.map((commerce) => {
        if (!commerce.latitude || !commerce.longitude) return null
        
        // Vérifier si c'est un commerce suivi
        const trackedCommerce = trackedCommerces.get(commerce.id)
        const position = trackedCommerce 
          ? [trackedCommerce.latitude, trackedCommerce.longitude] as [number, number]
          : [commerce.latitude, commerce.longitude] as [number, number]
        
        const isSelected = selectedCommerce?.id === commerce.id
        const isAmbulant = commerce.type === 'itinerant'
        const isOnline = commerce.isOnline || false
        
        // Déterminer le type de marker
        let markerType: MarkerType = 'fixed_commerce'
        if (isAmbulant) {
          markerType = 'ambulant_commerce'
        }

        return (
          <Marker
            key={commerce.id}
            position={position}
            icon={createCustomIcon(markerType, { 
              isOnline,
              hasNotification: isSelected
            })}
            eventHandlers={{
              click: () => onCommerceClick(commerce),
            }}
            zIndexOffset={isSelected ? 1000 : 0}
          >
            <Popup>
              <div dangerouslySetInnerHTML={{
                __html: createCommercePopup(
                  { ...commerce, isOnline },
                  () => {},
                  () => {}
                )
              }} />
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

// Hook pour centrer la carte sur un élément sélectionné
function MapController({ 
  selectedCommerce, 
  userLocation,
  zoom 
}: { 
  selectedCommerce?: Commerce | null
  userLocation: Coordinates | null
  zoom: number
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedCommerce && selectedCommerce.latitude && selectedCommerce.longitude) {
      map.flyTo([selectedCommerce.latitude, selectedCommerce.longitude], zoom + 2, {
        animate: true,
        duration: 1.0
      })
    } else if (userLocation) {
      map.flyTo([userLocation.latitude, userLocation.longitude], zoom, {
        animate: true,
        duration: 1.0
      })
    }
  }, [map, selectedCommerce, userLocation, zoom])

  return null
}

const LeafletMap = ({
  userLocation,
  commerces,
  onCommerceClick,
  height,
  zoom,
  center,
  selectedCommerce
}: LeafletMapProps) => {
  const mapRef = useRef<L.Map>(null)

  return (
    <div style={{ height, width: '100%' }} className="relative">
      <MapStyleInjector />
      <MapEventHandlers commerces={commerces} />
      
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapController 
          selectedCommerce={selectedCommerce}
          userLocation={userLocation}
          zoom={zoom}
        />

        {/* Marker utilisateur */}
        {userLocation && (
          <UserMarker position={userLocation} />
        )}

        {/* Markers commerces */}
        <CommerceMarkers 
          commerces={commerces}
          onCommerceClick={onCommerceClick}
          selectedCommerce={selectedCommerce}
        />
      </MapContainer>

      {/* Indicateur de suivi en cours */}
      {locationTrackingService.getTrackedCommerces().length > 0 && (
        <div className="absolute top-4 right-4 bg-amber-100 border border-amber-300 rounded-lg px-3 py-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-amber-800 font-medium">
              {locationTrackingService.getTrackedCommerces().length} commerce{locationTrackingService.getTrackedCommerces().length > 1 ? 's' : ''} suivi{locationTrackingService.getTrackedCommerces().length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeafletMap