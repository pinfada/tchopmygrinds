import { useEffect, useRef, useState } from 'react'
import { searchPlaces, GeocodingResult } from '../../services/geocoding'

interface PlaceSearchProps {
  onSelect: (result: GeocodingResult) => void
  placeholder?: string
  className?: string
}

const DEBOUNCE_MS = 400

function categoryIcon(category: string): string {
  switch (category) {
    case 'place':
      return '🏙️'
    case 'boundary':
      return '🗺️'
    case 'amenity':
      return '📍'
    case 'shop':
      return '🛒'
    case 'highway':
      return '🛣️'
    default:
      return '📌'
  }
}

const PlaceSearch = ({ onSelect, placeholder = 'Rechercher un lieu, une ville…', className = '' }: PlaceSearchProps) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = query.trim()
    if (trimmed.length < 3) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchPlaces(trimmed)
        setResults(res)
        setActiveIndex(res.length > 0 ? 0 : -1)
        setError(null)
      } catch (err) {
        setError((err as Error).message)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Fermer au click extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (result: GeocodingResult) => {
    onSelect(result)
    setQuery(result.shortName)
    setOpen(false)
    setResults([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) {
      if (e.key === 'ArrowDown' && results.length > 0) {
        setOpen(true)
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showDropdown = open && (loading || results.length > 0 || error || query.trim().length >= 3)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="place-search-results"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setOpen(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Effacer la recherche"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && (
        <ul
          id="place-search-results"
          role="listbox"
          className="absolute z-[1100] mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto"
        >
          {error && (
            <li className="px-4 py-3 text-sm text-red-600">Erreur : {error}</li>
          )}
          {!error && !loading && results.length === 0 && query.trim().length >= 3 && (
            <li className="px-4 py-3 text-sm text-gray-500">Aucun résultat pour « {query} »</li>
          )}
          {results.map((result, idx) => {
            const isActive = idx === activeIndex
            return (
              <li
                key={result.id}
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(result)
                }}
                className={`px-4 py-2.5 cursor-pointer flex items-start gap-3 text-sm transition-colors ${
                  isActive ? 'bg-brand-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-lg leading-tight">{categoryIcon(result.category)}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">{result.shortName}</div>
                  <div className="text-xs text-gray-500 truncate">{result.displayName}</div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default PlaceSearch
