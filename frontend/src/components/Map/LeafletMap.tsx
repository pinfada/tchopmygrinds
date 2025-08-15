import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Commerce, Coordinates } from '../../types'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Icônes personnalisées pour différents types de commerces
const commerceIcons = {
  itinerant: new L.Icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  sedentary: new L.Icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  user: new L.Icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [1, -40],
    shadowSize: [45, 45],
  })
}

// Composant pour centrer la carte sur une position
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  
  return null
}

// Composant pour le marker de l'utilisateur
function UserLocationMarker({ position }: { position: Coordinates | null }) {
  if (!position) return null
  
  return (
    <Marker 
      position={[position.latitude, position.longitude]} 
      icon={commerceIcons.user}
    >
      <Popup>
        <div className="text-center">
          <h3 className="font-semibold text-blue-600">📍 Votre position</h3>
          <p className="text-sm text-gray-600">
            {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
          </p>
        </div>
      </Popup>
    </Marker>
  )
}

// Composant pour les markers des commerces
function CommerceMarkers({ 
  commerces, 
  onCommerceClick,
  selectedCommerce 
}: { 
  commerces: Commerce[]
  onCommerceClick: (commerce: Commerce) => void
  selectedCommerce?: Commerce | null
}) {
  return (
    <>
      {commerces.map((commerce) => {
        if (!commerce.latitude || !commerce.longitude) return null
        
        const isSelected = selectedCommerce?.id === commerce.id
        
        return (
          <Marker
            key={commerce.id}
            position={[commerce.latitude, commerce.longitude]}
            icon={commerceIcons.sedentary}
            eventHandlers={{
              click: () => onCommerceClick(commerce),
            }}
            zIndexOffset={isSelected ? 1000 : 0}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  {commerce.name}
                </h3>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <p>📍 {commerce.adress1}</p>
                  {commerce.phone && <p>📞 {commerce.phone}</p>}
                  {commerce.distance && (
                    <p className="text-blue-600 font-medium">
                      📍 {commerce.distance.toFixed(1)} km
                    </p>
                  )}
                </div>
                
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => onCommerceClick(commerce)}
                    className="w-full px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    Voir les produits
                  </button>
                  
                  {commerce.productsCount && commerce.productsCount > 0 && (
                    <p className="text-xs text-gray-500 text-center">
                      {commerce.productsCount} produit{commerce.productsCount > 1 ? 's' : ''} disponible{commerce.productsCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

// Props du composant principal
interface LeafletMapProps {
  center?: [number, number]
  zoom?: number
  commerces?: Commerce[]
  userLocation?: Coordinates | null
  selectedCommerce?: Commerce | null
  onCommerceClick?: (commerce: Commerce) => void
  onMapClick?: (coordinates: Coordinates) => void
  height?: string
  className?: string
}

// Composant principal de la carte
export default function LeafletMap({
  center = [47.4742, -0.5490], // Angers par défaut
  zoom = 13,
  commerces = [],
  userLocation = null,
  selectedCommerce = null,
  onCommerceClick = () => {},
  // onMapClick, // Non utilisé pour l'instant
  height = '400px',
  className = ''
}: LeafletMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center)
  const mapRef = useRef<L.Map | null>(null)

  // Centrer sur la position de l'utilisateur si disponible
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude])
    }
  }, [userLocation])

  // Gestionnaire de clic sur la carte (optionnel)
  // const handleMapClick = (e: L.LeafletMouseEvent) => {
  //   if (onMapClick) {
  //     onMapClick({
  //       latitude: e.latlng.lat,
  //       longitude: e.latlng.lng
  //     })
  //   }
  // }

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${className}`} style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        ref={mapRef}
      >
        {/* Composant pour changer la vue */}
        <ChangeView center={mapCenter} zoom={zoom} />
        
        {/* Couche de tuiles OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marker de la position utilisateur */}
        <UserLocationMarker position={userLocation} />
        
        {/* Markers des commerces */}
        <CommerceMarkers 
          commerces={commerces} 
          onCommerceClick={onCommerceClick}
          selectedCommerce={selectedCommerce}
        />
      </MapContainer>
      
      {/* Contrôles de la carte */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        {/* Bouton pour centrer sur l'utilisateur */}
        {userLocation && (
          <button
            onClick={() => setMapCenter([userLocation.latitude, userLocation.longitude])}
            className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            title="Centrer sur ma position"
          >
            🎯
          </button>
        )}
        
        {/* Information sur le nombre de commerces */}
        {commerces.length > 0 && (
          <div className="bg-white px-3 py-1 rounded-lg shadow-md text-sm font-medium text-gray-700">
            {commerces.length} commerce{commerces.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}