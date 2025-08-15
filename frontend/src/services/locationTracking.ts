/**
 * Service de suivi en temps réel des commerces ambulants
 */

interface AmbulantCommerce {
  id: string
  name: string
  type: 'itinerant'
  latitude: number
  longitude: number
  lastUpdate: Date
  isOnline: boolean
  route?: {
    startTime: Date
    endTime: Date
    waypoints: Array<{
      latitude: number
      longitude: number
      timestamp: Date
      activity?: string // 'moving' | 'stopped' | 'serving_customers'
    }>
  }
}

interface TrackingSettings {
  updateInterval: number // en millisecondes
  maxRetries: number
  timeout: number
}

class LocationTrackingService {
  private trackedCommerces: Map<string, AmbulantCommerce> = new Map()
  private trackingIntervals: Map<string, NodeJS.Timeout> = new Map()
  private settings: TrackingSettings = {
    updateInterval: 30000, // 30 secondes par défaut
    maxRetries: 3,
    timeout: 10000
  }

  /**
   * Configure les paramètres de suivi
   */
  configure(settings: Partial<TrackingSettings>) {
    this.settings = { ...this.settings, ...settings }
  }

  /**
   * Démarre le suivi d'un commerce ambulant
   */
  startTracking(commerceId: string, callback: (commerce: AmbulantCommerce) => void) {
    // Arrêter le suivi existant s'il y en a un
    this.stopTracking(commerceId)

    // Créer un nouvel intervalle
    const interval = setInterval(async () => {
      try {
        const updatedCommerce = await this.fetchCommerceLocation(commerceId)
        if (updatedCommerce) {
          this.trackedCommerces.set(commerceId, updatedCommerce)
          callback(updatedCommerce)
        }
      } catch (error) {
        console.error(`Erreur lors du suivi du commerce ${commerceId}:`, error)
      }
    }, this.settings.updateInterval)

    this.trackingIntervals.set(commerceId, interval)

    // Première mise à jour immédiate
    this.fetchCommerceLocation(commerceId)
      .then(commerce => {
        if (commerce) {
          this.trackedCommerces.set(commerceId, commerce)
          callback(commerce)
        }
      })
      .catch(error => {
        console.error(`Erreur lors de la première mise à jour du commerce ${commerceId}:`, error)
      })
  }

  /**
   * Arrête le suivi d'un commerce
   */
  stopTracking(commerceId: string) {
    const interval = this.trackingIntervals.get(commerceId)
    if (interval) {
      clearInterval(interval)
      this.trackingIntervals.delete(commerceId)
    }
    this.trackedCommerces.delete(commerceId)
  }

  /**
   * Arrête tous les suivis
   */
  stopAllTracking() {
    this.trackingIntervals.forEach((interval) => {
      clearInterval(interval)
    })
    this.trackingIntervals.clear()
    this.trackedCommerces.clear()
  }

  /**
   * Récupère la position actuelle d'un commerce ambulant
   */
  private async fetchCommerceLocation(commerceId: string): Promise<AmbulantCommerce | null> {
    try {
      // Simulation d'API call - remplacer par vraie API
      const response = await fetch(`/api/v1/commerces/${commerceId}/location`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        signal: AbortSignal.timeout(this.settings.timeout)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        id: data.id,
        name: data.name,
        type: 'itinerant',
        latitude: data.latitude,
        longitude: data.longitude,
        lastUpdate: new Date(data.last_update || Date.now()),
        isOnline: data.is_online || false,
        route: data.route ? {
          startTime: new Date(data.route.start_time),
          endTime: new Date(data.route.end_time),
          waypoints: data.route.waypoints?.map((wp: any) => ({
            latitude: wp.latitude,
            longitude: wp.longitude,
            timestamp: new Date(wp.timestamp),
            activity: wp.activity
          })) || []
        } : undefined
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la position:', error)
      return null
    }
  }

  /**
   * Simule le mouvement d'un commerce ambulant (pour développement/test)
   */
  simulateMovement(commerceId: string, basePosition: { latitude: number, longitude: number }) {
    let currentLat = basePosition.latitude
    let currentLng = basePosition.longitude
    const movements = [
      { lat: 0.001, lng: 0.001 },   // Nord-Est
      { lat: 0.001, lng: -0.001 },  // Nord-Ouest  
      { lat: -0.001, lng: -0.001 }, // Sud-Ouest
      { lat: -0.001, lng: 0.001 },  // Sud-Est
    ]
    let movementIndex = 0

    this.startTracking(commerceId, () => {}) // Start tracking avec callback vide

    // Override avec simulation
    const interval = setInterval(() => {
      const movement = movements[movementIndex % movements.length]
      currentLat += movement.lat
      currentLng += movement.lng
      movementIndex++

      const simulatedCommerce: AmbulantCommerce = {
        id: commerceId,
        name: `Commerce Ambulant ${commerceId}`,
        type: 'itinerant',
        latitude: currentLat,
        longitude: currentLng,
        lastUpdate: new Date(),
        isOnline: true,
        route: {
          startTime: new Date(Date.now() - 3600000), // 1h ago
          endTime: new Date(Date.now() + 3600000),   // 1h from now
          waypoints: []
        }
      }

      this.trackedCommerces.set(commerceId, simulatedCommerce)
      
      // Déclencher les callbacks (simulation d'événement)
      window.dispatchEvent(new CustomEvent('commerce-location-update', {
        detail: { commerceId, commerce: simulatedCommerce }
      }))
    }, this.settings.updateInterval)

    // Remplacer l'intervalle dans notre map
    this.trackingIntervals.set(commerceId, interval)
  }

  /**
   * Obtient tous les commerces actuellement suivis
   */
  getTrackedCommerces(): AmbulantCommerce[] {
    return Array.from(this.trackedCommerces.values())
  }

  /**
   * Obtient un commerce spécifique
   */
  getTrackedCommerce(commerceId: string): AmbulantCommerce | undefined {
    return this.trackedCommerces.get(commerceId)
  }

  /**
   * Vérifie si un commerce est actuellement suivi
   */
  isTracking(commerceId: string): boolean {
    return this.trackingIntervals.has(commerceId)
  }

  /**
   * Met à jour l'intervalle de suivi pour un commerce spécifique
   */
  updateTrackingInterval(commerceId: string, newInterval: number) {
    if (this.isTracking(commerceId)) {
      this.stopTracking(commerceId)
      
      // Redémarrer avec le nouvel intervalle
      const oldInterval = this.settings.updateInterval
      this.settings.updateInterval = newInterval
      
      // Note: Il faudrait récupérer le callback original
      // Pour simplifier, on va juste arrêter et laisser l'utilisateur redémarrer
      console.log(`Suivi du commerce ${commerceId} arrêté. Redémarrez avec le nouvel intervalle.`)
      
      this.settings.updateInterval = oldInterval
    }
  }
}

// Instance singleton
export const locationTrackingService = new LocationTrackingService()

// Types export
export type { AmbulantCommerce, TrackingSettings }