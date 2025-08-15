import { useState, useEffect } from 'react'
import { mapSettingsService, MapSettings as MapSettingsType } from '../../services/mapSettings'

interface MapSettingsProps {
  isOpen: boolean
  onClose: () => void
}

const MapSettings = ({ isOpen, onClose }: MapSettingsProps) => {
  const [settings, setSettings] = useState<MapSettingsType>(mapSettingsService.getSettings())
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSettings(mapSettingsService.getSettings())
      setHasChanges(false)
    }
  }, [isOpen])

  const handleSettingChange = (key: keyof MapSettingsType, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    mapSettingsService.updateSettings(settings)
    setHasChanges(false)
    onClose()
  }

  const handleReset = () => {
    mapSettingsService.resetToDefaults()
    setSettings(mapSettingsService.getSettings())
    setHasChanges(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">⚙️ Paramètres de la carte</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Fermer les paramètres"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-6 space-y-6">
            
            {/* Rafraîchissement automatique */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">🔄 Rafraîchissement automatique</h3>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Activer le rafraîchissement automatique
                </label>
                <input
                  type="checkbox"
                  checked={settings.autoRefreshEnabled}
                  onChange={(e) => handleSettingChange('autoRefreshEnabled', e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
              </div>
              
              {settings.autoRefreshEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intervalle de rafraîchissement (minutes)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={settings.mapRefreshInterval}
                    onChange={(e) => handleSettingChange('mapRefreshInterval', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5 min</span>
                    <span className="font-medium">{settings.mapRefreshInterval} min</span>
                    <span>60 min</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suivi des commerces ambulants */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">🚚 Commerces ambulants</h3>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Suivre automatiquement les commerces ambulants
                </label>
                <input
                  type="checkbox"
                  checked={settings.ambulantAutoTrack}
                  onChange={(e) => handleSettingChange('ambulantAutoTrack', e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intervalle de suivi (secondes)
                </label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={settings.ambulantTrackingInterval}
                  onChange={(e) => handleSettingChange('ambulantTrackingInterval', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10s</span>
                  <span className="font-medium">{settings.ambulantTrackingInterval}s</span>
                  <span>5min</span>
                </div>
              </div>
            </div>

            {/* Géolocalisation */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">📍 Géolocalisation</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rayon de recherche (km)
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={settings.searchRadius}
                  onChange={(e) => handleSettingChange('searchRadius', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 km</span>
                  <span className="font-medium">{settings.searchRadius} km</span>
                  <span>100 km</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Afficher ma position sur la carte
                </label>
                <input
                  type="checkbox"
                  checked={settings.showUserLocation}
                  onChange={(e) => handleSettingChange('showUserLocation', e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Interface utilisateur */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">🎨 Interface</h3>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Afficher l'indicateur de suivi
                </label>
                <input
                  type="checkbox"
                  checked={settings.showTrackingIndicator}
                  onChange={(e) => handleSettingChange('showTrackingIndicator', e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Afficher l'heure de dernière mise à jour
                </label>
                <input
                  type="checkbox"
                  checked={settings.showLastUpdate}
                  onChange={(e) => handleSettingChange('showLastUpdate', e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Animer les mouvements
                </label>
                <input
                  type="checkbox"
                  checked={settings.animateMovements}
                  onChange={(e) => handleSettingChange('animateMovements', e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              🔄 Réinitialiser
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  hasChanges
                    ? 'text-white bg-emerald-500 hover:bg-emerald-600'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                }`}
              >
                💾 Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapSettings