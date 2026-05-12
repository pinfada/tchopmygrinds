import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react'

type Source = 'list' | 'map' | null

interface MapHoverContextValue {
  hoveredCommerceId: number | null
  hoverSource: Source
  setHover: (id: number | null, source: Source) => void
  clearHover: () => void
}

const MapHoverContext = createContext<MapHoverContextValue | null>(null)

export function MapHoverProvider({ children }: { children: ReactNode }) {
  const [hoveredCommerceId, setHoveredCommerceId] = useState<number | null>(null)
  const [hoverSource, setHoverSource] = useState<Source>(null)

  const setHover = useCallback((id: number | null, source: Source) => {
    setHoveredCommerceId(id)
    setHoverSource(id === null ? null : source)
  }, [])

  const clearHover = useCallback(() => {
    setHoveredCommerceId(null)
    setHoverSource(null)
  }, [])

  const value = useMemo(
    () => ({ hoveredCommerceId, hoverSource, setHover, clearHover }),
    [hoveredCommerceId, hoverSource, setHover, clearHover],
  )

  return <MapHoverContext.Provider value={value}>{children}</MapHoverContext.Provider>
}

export function useMapHover(): MapHoverContextValue {
  const ctx = useContext(MapHoverContext)
  if (!ctx) {
    return {
      hoveredCommerceId: null,
      hoverSource: null,
      setHover: () => {},
      clearHover: () => {},
    }
  }
  return ctx
}
