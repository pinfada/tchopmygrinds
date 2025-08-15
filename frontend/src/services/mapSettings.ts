/**
 * Service de gestion des paramètres de carte et suivi temps réel
 */

export interface MapSettings {
  // Rafraîchissement général de la carte
  mapRefreshInterval: number // en minutes
  autoRefreshEnabled: boolean
  
  // Suivi des commerces ambulants
  ambulantTrackingInterval: number // en secondes
  ambulantAutoTrack: boolean
  
  // Distance et géolocalisation
  searchRadius: number // en km
  showUserLocation: boolean
  
  // Interface utilisateur
  showTrackingIndicator: boolean
  showLastUpdate: boolean
  animateMovements: boolean
}

const DEFAULT_SETTINGS: MapSettings = {
  mapRefreshInterval: 15, // 15 minutes
  autoRefreshEnabled: true,
  ambulantTrackingInterval: 30, // 30 secondes
  ambulantAutoTrack: true,
  searchRadius: 50, // 50 km
  showUserLocation: true,
  showTrackingIndicator: true,
  showLastUpdate: true,
  animateMovements: true
}

class MapSettingsService {
  private settings: MapSettings
  private refreshTimer: NodeJS.Timeout | null = null
  private listeners: Set<(settings: MapSettings) => void> = new Set()

  constructor() {
    this.settings = this.loadSettings()
  }

  /**
   * Charge les paramètres depuis localStorage
   */
  private loadSettings(): MapSettings {
    try {
      const saved = localStorage.getItem('mapSettings')
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des paramètres carte:', error)
    }
    return { ...DEFAULT_SETTINGS }
  }

  /**
   * Sauvegarde les paramètres dans localStorage
   */
  private saveSettings() {
    try {
      localStorage.setItem('mapSettings', JSON.stringify(this.settings))
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde des paramètres carte:', error)
    }
  }

  /**
   * Obtient les paramètres actuels
   */
  getSettings(): MapSettings {
    return { ...this.settings }
  }

  /**
   * Met à jour les paramètres
   */
  updateSettings(newSettings: Partial<MapSettings>) {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
    this.notifyListeners()
    
    // Redémarrer le timer si nécessaire
    if ('mapRefreshInterval' in newSettings || 'autoRefreshEnabled' in newSettings) {
      this.setupRefreshTimer()
    }
  }

  /**
   * Configure le timer de rafraîchissement automatique
   */
  setupRefreshTimer() {
    // Nettoyer l'ancien timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }

    // Créer le nouveau timer si activé
    if (this.settings.autoRefreshEnabled && this.settings.mapRefreshInterval > 0) {
      const intervalMs = this.settings.mapRefreshInterval * 60 * 1000 // minutes -> ms
      
      this.refreshTimer = setInterval(() => {
        // Déclencher un événement de rafraîchissement
        window.dispatchEvent(new CustomEvent('map-auto-refresh', {
          detail: { 
            timestamp: new Date(),
            interval: this.settings.mapRefreshInterval 
          }
        }))
      }, intervalMs)
      
      console.log(`⏰ Rafraîchissement automatique configuré: ${this.settings.mapRefreshInterval} minutes`)
    }
  }

  /**
   * Force un rafraîchissement immédiat
   */
  forceRefresh() {
    window.dispatchEvent(new CustomEvent('map-force-refresh', {
      detail: { timestamp: new Date() }
    }))
  }

  /**
   * Ajoute un listener pour les changements de paramètres
   */
  addListener(callback: (settings: MapSettings) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * Notifie tous les listeners
   */
  private notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.settings)
      } catch (error) {
        console.error('Erreur dans le listener de paramètres carte:', error)
      }
    })
  }

  /**
   * Obtient les paramètres de suivi pour locationTrackingService
   */
  getTrackingSettings() {
    return {
      updateInterval: this.settings.ambulantTrackingInterval * 1000, // secondes -> ms
      maxRetries: 3,
      timeout: 10000
    }
  }

  /**
   * Nettoie les timers
   */
  cleanup() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
    this.listeners.clear()
  }

  /**
   * Réinitialise aux paramètres par défaut
   */
  resetToDefaults() {
    this.settings = { ...DEFAULT_SETTINGS }
    this.saveSettings()
    this.notifyListeners()
    this.setupRefreshTimer()
  }

  /**
   * Obtient le statut du prochain rafraîchissement
   */
  getNextRefreshTime(): Date | null {
    if (!this.settings.autoRefreshEnabled || !this.refreshTimer) {
      return null
    }
    
    const intervalMs = this.settings.mapRefreshInterval * 60 * 1000
    return new Date(Date.now() + intervalMs)
  }
}

// Instance singleton
export const mapSettingsService = new MapSettingsService()

// Initialiser le timer au démarrage
mapSettingsService.setupRefreshTimer()

export default mapSettingsService