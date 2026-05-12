import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { Commerce } from '../../types'
import { createCustomIcon, createCommercePopup, MarkerType } from './MapMarkers'
import { useMapHover } from '../../contexts/MapHoverContext'
import { locationTrackingService } from '../../services/locationTracking'

interface CommerceClusterLayerProps {
  commerces: Commerce[]
  onCommerceClick: (commerce: Commerce) => void
  selectedCommerce?: Commerce | null
}

function buildClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount()
  let size = 40
  let bg = '#059669'
  if (count >= 100) {
    size = 56
    bg = '#7C3AED'
  } else if (count >= 25) {
    size = 48
    bg = '#0EA5E9'
  } else if (count >= 10) {
    size = 44
    bg = '#10B981'
  }

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: ${bg};
      color: #fff;
      border: 3px solid rgba(255,255,255,0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
    ">${count}</div>
  `

  return L.divIcon({
    html,
    className: 'tchop-cluster',
    iconSize: [size, size],
  })
}

const CommerceClusterLayer = ({ commerces, onCommerceClick, selectedCommerce }: CommerceClusterLayerProps) => {
  const map = useMap()
  const groupRef = useRef<L.MarkerClusterGroup | null>(null)
  const markersByIdRef = useRef<Map<number, L.Marker>>(new Map())
  const { hoveredCommerceId, setHover, clearHover } = useMapHover()

  // Init du cluster group une seule fois
  useEffect(() => {
    const group = L.markerClusterGroup({
      iconCreateFunction: buildClusterIcon,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 60,
      chunkedLoading: true,
    })
    groupRef.current = group
    map.addLayer(group)

    return () => {
      map.removeLayer(group)
      groupRef.current = null
      markersByIdRef.current.clear()
    }
  }, [map])

  // Sync markers quand la liste commerces change
  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    group.clearLayers()
    markersByIdRef.current.clear()

    commerces.forEach((commerce) => {
      if (commerce.latitude == null || commerce.longitude == null) return

      const isAmbulant = commerce.type === 'itinerant'
      const isOnline = commerce.isOnline || false
      const markerType: MarkerType = isAmbulant ? 'ambulant_commerce' : 'fixed_commerce'
      const isSelected = selectedCommerce?.id === commerce.id

      const marker = L.marker([commerce.latitude, commerce.longitude], {
        icon: createCustomIcon(markerType, { isOnline, hasNotification: isSelected }),
        zIndexOffset: isSelected ? 1000 : 0,
      })

      marker.bindPopup(createCommercePopup({ ...commerce, isOnline }, () => {}, () => {}))

      marker.on('click', () => onCommerceClick(commerce))
      marker.on('mouseover', () => setHover(commerce.id, 'map'))
      marker.on('mouseout', () => clearHover())

      group.addLayer(marker)
      markersByIdRef.current.set(commerce.id, marker)
    })
  }, [commerces, onCommerceClick, selectedCommerce, setHover, clearHover])

  // Démarrer le suivi auto des commerces ambulants en ligne
  useEffect(() => {
    commerces
      .filter((c) => c.type === 'itinerant' && c.isOnline)
      .forEach((c) => {
        const id = String(c.id)
        if (!locationTrackingService.isTracking(id)) {
          locationTrackingService.startTracking(id, (updated) => {
            window.dispatchEvent(
              new CustomEvent('commerce-location-update', {
                detail: { commerceId: id, commerce: updated },
              }),
            )
          })
        }
      })

    return () => {
      locationTrackingService.stopAllTracking()
    }
  }, [commerces])

  // Mise à jour live des positions des commerces ambulants
  useEffect(() => {
    const handleLocationUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ commerceId: string; commerce: { latitude: number; longitude: number } }>
      const id = Number(customEvent.detail?.commerceId)
      const coords = customEvent.detail?.commerce
      if (!Number.isFinite(id) || !coords) return
      const marker = markersByIdRef.current.get(id)
      if (marker) {
        marker.setLatLng([coords.latitude, coords.longitude])
      }
    }
    window.addEventListener('commerce-location-update', handleLocationUpdate as EventListener)
    return () => {
      window.removeEventListener('commerce-location-update', handleLocationUpdate as EventListener)
    }
  }, [])

  // Effet hover : bump z-index + popup pour le marker hover'é depuis la liste
  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    markersByIdRef.current.forEach((marker, id) => {
      const el = marker.getElement()
      if (id === hoveredCommerceId) {
        marker.setZIndexOffset(2000)
        el?.classList.add('marker-hovered')
      } else {
        marker.setZIndexOffset(selectedCommerce?.id === id ? 1000 : 0)
        el?.classList.remove('marker-hovered')
      }
    })

    if (hoveredCommerceId != null) {
      const marker = markersByIdRef.current.get(hoveredCommerceId)
      if (marker) {
        const visible = group.hasLayer(marker)
        if (visible) {
          marker.openPopup()
        }
      }
    }
  }, [hoveredCommerceId, selectedCommerce])

  return null
}

export default CommerceClusterLayer
