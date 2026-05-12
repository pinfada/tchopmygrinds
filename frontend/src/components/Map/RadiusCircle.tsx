import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { Coordinates } from '../../types'

interface RadiusCircleProps {
  center: Coordinates | null
  radiusKm: number
  visible: boolean
}

const RadiusCircle = ({ center, radiusKm, visible }: RadiusCircleProps) => {
  const map = useMap()
  const circleRef = useRef<L.Circle | null>(null)

  useEffect(() => {
    if (!visible || !center) {
      if (circleRef.current) {
        map.removeLayer(circleRef.current)
        circleRef.current = null
      }
      return
    }

    const latlng: L.LatLngExpression = [center.latitude, center.longitude]
    const radiusMeters = radiusKm * 1000

    if (!circleRef.current) {
      circleRef.current = L.circle(latlng, {
        radius: radiusMeters,
        color: '#059669',
        weight: 2,
        opacity: 0.6,
        fillColor: '#10B981',
        fillOpacity: 0.08,
        interactive: false,
      }).addTo(map)
    } else {
      circleRef.current.setLatLng(latlng)
      circleRef.current.setRadius(radiusMeters)
    }

    return () => {
      if (circleRef.current) {
        map.removeLayer(circleRef.current)
        circleRef.current = null
      }
    }
  }, [map, center, radiusKm, visible])

  return null
}

export default RadiusCircle
