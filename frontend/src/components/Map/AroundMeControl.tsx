import { useState } from 'react'

interface AroundMeControlProps {
  radiusKm: number
  onRadiusChange: (km: number) => void
  onLocateMe: () => void
  hasLocation: boolean
  loading: boolean
}

const RADIUS_PRESETS = [1, 5, 10, 25, 50]

const AroundMeControl = ({
  radiusKm,
  onRadiusChange,
  onLocateMe,
  hasLocation,
  loading,
}: AroundMeControlProps) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 pointer-events-none" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
      {expanded && (
        <div
          className="pointer-events-auto bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg px-2 py-1 flex items-center gap-1"
          role="radiogroup"
          aria-label="Rayon de recherche"
        >
          {RADIUS_PRESETS.map((km) => {
            const isActive = km === radiusKm
            return (
              <button
                key={km}
                role="radio"
                aria-checked={isActive}
                onClick={() => onRadiusChange(km)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {km} km
              </button>
            )
          })}
        </div>
      )}

      <div className="pointer-events-auto flex items-center gap-2">
        <button
          onClick={onLocateMe}
          disabled={loading}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-full shadow-xl transition-colors"
          aria-label="Recentrer sur ma position et chercher autour de moi"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span>Autour de moi</span>
          {hasLocation && (
            <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-white/20 rounded-full">
              {radiusKm} km
            </span>
          )}
        </button>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="p-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-full shadow-lg transition-colors"
          aria-label={expanded ? 'Masquer le sélecteur de rayon' : 'Choisir le rayon de recherche'}
          aria-expanded={expanded}
        >
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default AroundMeControl
