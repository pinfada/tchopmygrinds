import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Commerce, Coordinates } from '../../types'
import { useAppSelector } from '../../hooks/redux'
import { createCustomIcon, createUserPopup, markerStyles } from './MapMarkers'
import { locationTrackingService } from '../../services/locationTracking'
import CommerceClusterLayer from './CommerceClusterLayer'
import RadiusCircle from './RadiusCircle'

interface LeafletMapProps {
  userLocation: Coordinates | null
  viewCenter?: Coordinates | null
  commerces: Commerce[]
  onCommerceClick: (commerce: Commerce) => void
  height: string
  zoom: number
  center: [number, number]
  selectedCommerce?: Commerce | null
  radiusKm?: number
  showRadiusCircle?: boolean
}

function MapStyleInjector() {
  useEffect(() => {
    const styleId = 'leaflet-custom-styles'
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('div')
      styleElement.id = styleId
      styleElement.innerHTML = `
        ${markerStyles}
        .marker-hovered .marker-icon {
          transform: scale(1.25);
          transition: transform 150ms ease-out;
          box-shadow: 0 6px 18px rgba(0,0,0,0.45) !important;
        }
        .custom-marker { transition: transform 150ms ease-out; }
      `
      document.head.appendChild(styleElement)
    }
  }, [])

  return null
}

function MapEventHandlers({ commerces }: { commerces: Commerce[] }) {
  const navigate = useNavigate()

  useEffect(() => {
    ;(window as any).handleProfileClick = () => navigate('/profile')
    ;(window as any).handleProductsClick = (commerceId: string) => navigate(`/products?commerce=${commerceId}`)
    ;(window as any).handleTrackClick = (commerceId: string) => {
      const commerce = commerces.find((c) => String(c.id) === commerceId)
      if (commerce && commerce.type === 'itinerant') {
        locationTrackingService.startTracking(commerceId, (updatedCommerce) => {
          window.dispatchEvent(
            new CustomEvent('commerce-location-update', {
              detail: { commerceId, commerce: updatedCommerce },
            }),
          )
        })
      }
    }
    ;(window as any).handleCommerceDetail = (commerceId: string) => navigate(`/commerces/${commerceId}`)

    return () => {
      delete (window as any).handleProfileClick
      delete (window as any).handleProductsClick
      delete (window as any).handleTrackClick
      delete (window as any).handleCommerceDetail
    }
  }, [navigate, commerces])

  return null
}

function UserMarker({ position }: { position: Coordinates }) {
  const { user } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()

  const handleUserClick = () => navigate('/profile')

  return (
    <Marker
      position={[position.latitude, position.longitude]}
      icon={createCustomIcon('user', { isOnline: true })}
      eventHandlers={{ click: handleUserClick }}
    >
      <Popup>
        <div
          dangerouslySetInnerHTML={{
            __html: createUserPopup(user, handleUserClick),
          }}
        />
      </Popup>
    </Marker>
  )
}

function MapController({
  selectedCommerce,
  userLocation,
  viewCenter,
  zoom,
}: {
  selectedCommerce?: Commerce | null
  userLocation: Coordinates | null
  viewCenter?: Coordinates | null
  zoom: number
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedCommerce && selectedCommerce.latitude && selectedCommerce.longitude) {
      map.flyTo([selectedCommerce.latitude, selectedCommerce.longitude], zoom + 2, {
        animate: true,
        duration: 1.0,
      })
      return
    }
    if (viewCenter) {
      map.flyTo([viewCenter.latitude, viewCenter.longitude], zoom, {
        animate: true,
        duration: 1.0,
      })
      return
    }
    if (userLocation) {
      map.flyTo([userLocation.latitude, userLocation.longitude], zoom, {
        animate: true,
        duration: 1.0,
      })
    }
  }, [map, selectedCommerce, viewCenter?.latitude, viewCenter?.longitude, userLocation?.latitude, userLocation?.longitude, zoom])

  return null
}

const LeafletMap = ({
  userLocation,
  viewCenter,
  commerces,
  onCommerceClick,
  height,
  zoom,
  center,
  selectedCommerce,
  radiusKm = 50,
  showRadiusCircle = false,
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
          viewCenter={viewCenter}
          zoom={zoom}
        />

        <RadiusCircle
          center={viewCenter ?? userLocation}
          radiusKm={radiusKm}
          visible={showRadiusCircle}
        />

        {userLocation && <UserMarker position={userLocation} />}

        <CommerceClusterLayer
          commerces={commerces}
          onCommerceClick={onCommerceClick}
          selectedCommerce={selectedCommerce}
        />
      </MapContainer>

      {locationTrackingService.getTrackedCommerces().length > 0 && (
        <div className="absolute top-4 right-4 bg-amber-100 border border-amber-300 rounded-lg px-3 py-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-amber-800 font-medium">
              {locationTrackingService.getTrackedCommerces().length} commerce
              {locationTrackingService.getTrackedCommerces().length > 1 ? 's' : ''} suivi
              {locationTrackingService.getTrackedCommerces().length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeafletMap
