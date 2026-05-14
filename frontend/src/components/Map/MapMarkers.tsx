import L from 'leaflet'

// Définition des types de commerces et utilisateurs
export type MarkerType = 'user' | 'fixed_commerce' | 'ambulant_commerce'

// Configuration des couleurs et icônes pour chaque type
const markerConfig = {
  user: {
    color: '#3B82F6', // Bleu vif pour l'utilisateur
    icon: '👤',
    size: 'large',
    pulseColor: 'rgba(59, 130, 246, 0.4)',
    borderColor: '#1E40AF' // Bordure plus foncée
  },
  fixed_commerce: {
    color: '#059669', // Vert emerald plus foncé pour commerce fixe
    icon: '🏪',
    size: 'medium',
    pulseColor: 'rgba(5, 150, 105, 0.3)',
    borderColor: '#047857' // Bordure plus foncée
  },
  ambulant_commerce: {
    color: '#DC2626', // Rouge vif pour commerce ambulant (plus visible)
    icon: '🚚',
    size: 'medium',
    pulseColor: 'rgba(220, 38, 38, 0.4)',
    animated: true,
    borderColor: '#B91C1C' // Bordure plus foncée
  }
}

// Fonction pour créer les icônes personnalisées
export const createCustomIcon = (type: MarkerType, options: { 
  isOnline?: boolean 
  hasNotification?: boolean 
} = {}) => {
  const config = markerConfig[type]
  const { isOnline = false, hasNotification = false } = options
  
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
  const size = config.size === 'large' ? (isMobile ? 48 : 40) : (isMobile ? 44 : 32)
  const iconSize = config.size === 'large' ? 20 : 16
  
  const pulseAnimation = config.animated ? 'animate-pulse' : ''
  const onlineIndicator = isOnline ? 'border-2 border-green-400' : ''
  const notificationBadge = hasNotification ? 
    '<div style="position: absolute; top: -4px; right: -4px; width: 12px; height: 12px; background: #EF4444; border-radius: 50%; border: 2px solid white;"></div>' : ''

  const iconHtml = `
    <div class="relative ${pulseAnimation}">
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${config.color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${iconSize}px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        border: 3px solid ${config.borderColor || config.color};
        position: relative;
        ${onlineIndicator ? `border-color: #4ADE80; border-width: 4px;` : ''}
        ${type === 'user' ? 'z-index: 1000;' : ''}
      " class="marker-icon ${pulseAnimation}">
        ${config.icon}
        ${notificationBadge}
      </div>
      ${config.animated ? `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${size + 20}px;
          height: ${size + 20}px;
          border-radius: 50%;
          background: ${config.pulseColor};
          animation: ping 1.5s infinite;
          z-index: -1;
        "></div>
      ` : ''}
    </div>
  `

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  })
}

// Fonction pour créer les popups personnalisés
export const createUserPopup = (user: any, onProfileClick: () => void) => {
  // Gestion du cas où user est null ou undefined
  if (!user) {
    return `
      <div class="p-3 min-w-[200px]">
        <div class="flex items-center space-x-3 mb-3">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-blue-600 font-bold text-lg">👤</span>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Utilisateur</h3>
            <p class="text-sm text-blue-600">En ligne</p>
          </div>
        </div>
        
        <div class="text-xs text-gray-600 mb-3">
          📍 Votre position actuelle
        </div>
        
        <button 
          onclick="window.handleProfileClick()"
          class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          👤 Voir mon profil
        </button>
      </div>
    `
  }

  return `
    <div class="p-3 min-w-[200px]">
      <div class="flex items-center space-x-3 mb-3">
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          ${user.avatar ? 
            `<img src="${user.avatar}" alt="${user.name || 'Utilisateur'}" class="w-12 h-12 rounded-full">` :
            `<span class="text-blue-600 font-bold text-lg">${((user.name || user.email || 'U')[0]).toUpperCase()}</span>`
          }
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">${user.name || user.email || 'Utilisateur'}</h3>
          <p class="text-sm text-blue-600 capitalize">${user.role || 'utilisateur'}</p>
        </div>
      </div>
      
      <div class="text-xs text-gray-600 mb-3">
        📍 Votre position actuelle
      </div>
      
      <button 
        onclick="window.handleProfileClick()"
        class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
      >
        👤 Voir mon profil
      </button>
    </div>
  `
}

export const createCommercePopup = (commerce: any, onProductsClick: (id: string) => void, onTrackClick?: (id: string) => void) => {
  const isAmbulant = commerce.type === 'itinerant'
  const distance = commerce.distance ? `📍 ${Number(commerce.distance || 0).toFixed(1)} km` : ''
  const rating = commerce.rating ? `⭐ ${Number(commerce.rating || 0).toFixed(1)}` : '⭐ Non noté'
  
  return `
    <div class="p-4 min-w-[250px]">
      <!-- Header avec icône commerce -->
      <div class="flex items-center space-x-3 mb-3">
        <div class="text-2xl">
          ${isAmbulant ? '🚛' : '🏪'}
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900 text-base">${commerce.name}</h3>
          <p class="text-sm text-gray-600">
            ${isAmbulant ? 'Commerce ambulant' : 'Commerce fixe'}
            ${commerce.isVerified ? ' ✅' : ''}
          </p>
        </div>
      </div>

      <!-- Description -->
      ${commerce.description ? `
        <p class="text-sm text-gray-700 mb-3 line-clamp-2">${commerce.description}</p>
      ` : ''}

      <!-- Informations -->
      <div class="space-y-2 mb-4">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">${rating}</span>
          <span class="text-gray-600">${distance}</span>
        </div>
        
        ${commerce.category ? `
          <div class="text-sm">
            <span class="inline-block bg-brand-100 text-brand-700 px-2 py-1 rounded-full text-xs">
              ${commerce.category}
            </span>
          </div>
        ` : ''}

        ${isAmbulant && commerce.isOnline ? `
          <div class="text-sm text-green-600 font-medium">
            🟢 En ligne - Position mise à jour
          </div>
        ` : ''}
      </div>

      <!-- Actions -->
      <div class="space-y-2">
        <button 
          onclick="window.handleProductsClick('${commerce.id}')"
          class="w-full bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          🛍️ Voir les produits
        </button>
        
        ${isAmbulant ? `
          <button 
            onclick="window.handleTrackClick('${commerce.id}')"
            class="w-full bg-accent-500 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-700 hover:text-white transition-colors"
          >
            📍 Suivre le trajet
          </button>
        ` : ''}
        
        <button 
          onclick="window.handleCommerceDetail('${commerce.id}')"
          class="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
        >
          ℹ️ Détails du commerce
        </button>
      </div>
    </div>
  `
}

// Styles CSS à injecter
export const markerStyles = `
<style>
@keyframes ping {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  75%, 100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.custom-marker {
  background: transparent !important;
  border: none !important;
}

.leaflet-popup-content-wrapper {
  border-radius: 12px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
}

.leaflet-popup-tip {
  background: white !important;
}
</style>
`