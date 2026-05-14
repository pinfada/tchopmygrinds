import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { getCurrentLocation, setCurrentLocation } from '../../store/slices/locationSlice'
import { fetchNearbyCommerces } from '../../store/slices/commerceSlice'
import { commerceAPI } from '../../services/api'
import Sidebar from './Sidebar'
import LeafletMap from '../Map/LeafletMap'
import GeolocationButton from '../Map/GeolocationButton'
import AroundMeControl from '../Map/AroundMeControl'
import PlaceSearch from '../Map/PlaceSearch'
import { Modal } from '../ui'
import MapSettings from '../Map/MapSettings'
import { mapSettingsService } from '../../services/mapSettings'
import { MapHoverProvider } from '../../contexts/MapHoverContext'
import type { Commerce, Coordinates } from '../../types'

interface MapLayoutProps {
  children?: React.ReactNode
}

const MIN_NEARBY_REFRESH_INTERVAL_MS = 10000
const MIN_MOVEMENT_FOR_REFRESH_METERS = 120
const MIN_LIVE_PUBLISH_INTERVAL_MS = 5000
const MIN_MOVEMENT_FOR_LIVE_PUBLISH_METERS = 30

function distanceInMeters(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const earthRadiusMeters = 6371000

  const dLat = toRad(b.latitude - a.latitude)
  const dLng = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

const MapLayout = ({ children }: MapLayoutProps) => {
  const dispatch = useAppDispatch()
  const location = useLocation()

  const { commerces, loading } = useAppSelector((state) => state.commerce)
  const { currentLocation, loading: locationLoading } = useAppSelector((state) => state.location)
  const { user } = useAppSelector((state) => state.auth)

  const [selectedCommerce, setSelectedCommerce] = useState<Commerce | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [showSettings, setShowSettings] = useState(false)
  const [radiusKm, setRadiusKm] = useState<number>(() => mapSettingsService.getSettings().searchRadius)
  const [showRadiusCircle, setShowRadiusCircle] = useState(false)
  const [viewCenter, setViewCenter] = useState<Coordinates | null>(null)
  const [searchLabel, setSearchLabel] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const userWatchIdRef = useRef<number | null>(null)
  const lastNearbyRefreshAtRef = useRef<number>(0)
  const lastNearbyRefreshLocationRef = useRef<Coordinates | null>(null)
  const lastLivePublishAtRef = useRef<number>(0)
  const lastLivePublishLocationRef = useRef<Coordinates | null>(null)

  useEffect(() => {
    if (!currentLocation && !locationLoading) {
      dispatch(getCurrentLocation())
    }
  }, [dispatch, currentLocation, locationLoading])

  useEffect(() => {
    if (!navigator.geolocation || userWatchIdRef.current !== null) {
      return
    }

    userWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        dispatch(
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        )
      },
      (error) => {
        console.warn('Suivi de position indisponible:', error.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    )

    return () => {
      if (userWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(userWatchIdRef.current)
        userWatchIdRef.current = null
      }
    }
  }, [dispatch])

  const activeCenter = viewCenter ?? currentLocation

  const reloadCommerces = (overrideRadius?: number, overrideCenter?: Coordinates) => {
    const center = overrideCenter ?? activeCenter
    if (center) {
      const radius = overrideRadius ?? radiusKm
      dispatch(fetchNearbyCommerces({
        location: center,
        radius,
      }))
      setLastRefresh(new Date())
    }
  }

  const handleRadiusChange = (km: number) => {
    setRadiusKm(km)
    setShowRadiusCircle(true)
    mapSettingsService.updateSettings({ searchRadius: km })
    reloadCommerces(km)
  }

  const handleLocateMe = () => {
    setShowRadiusCircle(true)
    setViewCenter(null)
    setSearchLabel(null)
    if (currentLocation) {
      reloadCommerces(undefined, currentLocation)
    } else {
      dispatch(getCurrentLocation())
    }
  }

  const handlePlaceSelected = (result: { latitude: number; longitude: number; shortName: string }) => {
    const coords: Coordinates = { latitude: result.latitude, longitude: result.longitude }
    setViewCenter(coords)
    setSearchLabel(result.shortName)
    setShowRadiusCircle(true)
    dispatch(fetchNearbyCommerces({ location: coords, radius: radiusKm }))
    setLastRefresh(new Date())
  }

  useEffect(() => {
    if (!activeCenter) {
      lastNearbyRefreshLocationRef.current = null
      lastNearbyRefreshAtRef.current = 0
      return
    }

    const now = Date.now()
    const previousLocation = lastNearbyRefreshLocationRef.current
    const elapsed = now - lastNearbyRefreshAtRef.current
    const movedMeters = previousLocation
      ? distanceInMeters(previousLocation, activeCenter)
      : Number.POSITIVE_INFINITY

    if (
      previousLocation &&
      movedMeters < MIN_MOVEMENT_FOR_REFRESH_METERS &&
      elapsed < MIN_NEARBY_REFRESH_INTERVAL_MS
    ) {
      return
    }

    if (elapsed < MIN_NEARBY_REFRESH_INTERVAL_MS) {
      return
    }

    dispatch(fetchNearbyCommerces({
      location: activeCenter,
      radius: radiusKm,
    }))

    lastNearbyRefreshLocationRef.current = activeCenter
    lastNearbyRefreshAtRef.current = now
    setLastRefresh(new Date())
  }, [activeCenter?.latitude, activeCenter?.longitude, radiusKm, dispatch])

  useEffect(() => {
    if (!currentLocation || user?.role !== 'itinerant') {
      return
    }

    const now = Date.now()
    const previousLocation = lastLivePublishLocationRef.current
    const elapsed = now - lastLivePublishAtRef.current
    const movedMeters = previousLocation
      ? distanceInMeters(previousLocation, currentLocation)
      : Number.POSITIVE_INFINITY

    if (
      previousLocation &&
      movedMeters < MIN_MOVEMENT_FOR_LIVE_PUBLISH_METERS &&
      elapsed < MIN_LIVE_PUBLISH_INTERVAL_MS
    ) {
      return
    }

    if (elapsed < MIN_LIVE_PUBLISH_INTERVAL_MS) {
      return
    }

    void commerceAPI.updateMyLocation({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      is_online: true,
    })

    lastLivePublishLocationRef.current = currentLocation
    lastLivePublishAtRef.current = now
  }, [currentLocation, user?.role])

  useEffect(() => {
    const handleAutoRefresh = () => {
      reloadCommerces()
    }
    const handleForceRefresh = () => {
      reloadCommerces()
    }

    window.addEventListener('map-auto-refresh', handleAutoRefresh)
    window.addEventListener('map-force-refresh', handleForceRefresh)

    return () => {
      window.removeEventListener('map-auto-refresh', handleAutoRefresh)
      window.removeEventListener('map-force-refresh', handleForceRefresh)
    }
  }, [currentLocation])

  useEffect(() => {
    const path = location.pathname

    if (path === '/') {
      setShowModal(false)
    } else if (path === '/commerces') {
      setShowModal(false)
    } else if (path === '/products') {
      setModalTitle('Catalogue produits')
      setShowModal(true)
    } else if (path === '/orders') {
      setModalTitle('Mes commandes')
      setShowModal(true)
    } else if (path === '/profile') {
      setModalTitle('Mon profil')
      setShowModal(true)
    } else if (path === '/auth') {
      setModalTitle('Authentification')
      setShowModal(true)
    } else if (path === '/checkout') {
      setModalTitle('Finaliser la commande')
      setShowModal(true)
    } else if (path === '/cart') {
      setModalTitle('Mon panier')
      setShowModal(true)
    } else if (path === '/interests') {
      setModalTitle("Manifestations d'intérêt")
      setShowModal(true)
    } else if (path === '/dashboard') {
      setModalTitle('Dashboard Vendeur')
      setShowModal(true)
    } else if (path === '/messages' || path.startsWith('/messages/')) {
      setModalTitle('Messagerie')
      setShowModal(true)
    } else if (path.startsWith('/commerces/')) {
      setModalTitle('Détails du commerce')
      setShowModal(true)
    } else if (path.startsWith('/products/')) {
      setModalTitle('Détails du produit')
      setShowModal(true)
    } else if (path.startsWith('/orders/')) {
      setModalTitle('Détails de la commande')
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [location.pathname])

  const handleCommerceClick = (commerce: Commerce) => {
    setSelectedCommerce(commerce)
  }

  const filteredCommerces = Array.isArray(commerces) ? commerces : []
  const isCommerceListRoute = location.pathname === '/commerces'

  const headerSubtitle = useMemo(() => {
    if (!activeCenter) {
      return 'Activez la géolocalisation pour découvrir les commerces'
    }
    const count = filteredCommerces.length
    const where = searchLabel ? ` autour de ${searchLabel}` : ''
    return `${count} commerce${count !== 1 ? 's' : ''} dans un rayon de ${radiusKm} km${where}`
  }, [activeCenter, filteredCommerces.length, radiusKm, searchLabel])

  return (
    <MapHoverProvider>
      <div className="flex h-[100dvh] bg-slate-100 overflow-hidden">
        <Sidebar
          isMobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 relative z-0 min-w-0 flex flex-col focus:outline-none"
          style={{ marginLeft: 'var(--sidebar-width, 0px)' }}
        >
          <header
            className="relative z-20 bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 flex-shrink-0"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            <div className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Ouvrir le menu"
                aria-expanded={sidebarOpen}
                aria-controls="app-sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="min-w-0 flex-1 lg:flex-none lg:max-w-md">
                <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-slate-900 truncate leading-tight">
                  Marketplace géolocalisé
                </h1>
                <p className="hidden sm:block text-xs sm:text-sm text-slate-600 truncate">{headerSubtitle}</p>
              </div>

              <div className="hidden md:block flex-1 max-w-xl">
                <PlaceSearch onSelect={handlePlaceSelected} />
              </div>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {!currentLocation ? (
                  <GeolocationButton
                    onLocationFound={(coords) => {
                      dispatch(fetchNearbyCommerces({
                        location: coords,
                        radius: radiusKm,
                      }))
                    }}
                    className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] px-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  >
                    <svg className="w-5 h-5 sm:mr-1.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">Géoloc</span>
                  </GeolocationButton>
                ) : (
                  <div className="hidden sm:flex items-center gap-1.5 text-sm text-brand-600 px-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden lg:inline">Position active</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label="Paramètres de la carte"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="md:hidden px-3 pb-2.5">
              <PlaceSearch onSelect={handlePlaceSelected} />
            </div>
          </header>

          <div className="flex-1 flex relative min-h-0">
            {isCommerceListRoute && (
              <aside
                className="absolute inset-0 z-10 bg-white overflow-y-auto overscroll-contain lg:relative lg:inset-auto lg:z-auto lg:w-[420px] lg:max-w-[40%] lg:border-r lg:border-slate-200 lg:shadow-lg"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                aria-label="Liste des commerces"
              >
                {children}
              </aside>
            )}

            <div className="flex-1 relative">
              <LeafletMap
                userLocation={currentLocation}
                viewCenter={viewCenter}
                commerces={filteredCommerces}
                onCommerceClick={handleCommerceClick}
                height="100%"
                zoom={activeCenter ? 12 : 6}
                center={activeCenter
                  ? [activeCenter.latitude, activeCenter.longitude]
                  : [4.0511, 9.7679]
                }
                radiusKm={radiusKm}
                showRadiusCircle={showRadiusCircle && !!activeCenter}
                selectedCommerce={selectedCommerce}
              />

              <AroundMeControl
                radiusKm={radiusKm}
                onRadiusChange={handleRadiusChange}
                onLocateMe={handleLocateMe}
                hasLocation={!!currentLocation}
                loading={locationLoading || loading}
              />

              {(locationLoading || loading) && (
                <div
                  className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 z-10"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-500 border-t-transparent" />
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      {locationLoading ? 'Géolocalisation…' : 'Chargement…'}
                    </span>
                  </div>
                </div>
              )}

              {currentLocation && filteredCommerces.length > 0 && (
                <div
                  className="hidden sm:block absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 z-10 max-w-[200px]"
                  role="status"
                >
                  <p className="text-xs sm:text-sm font-medium text-slate-900">
                    {filteredCommerces.length} commerce{filteredCommerces.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-slate-500">Maj : {lastRefresh.toLocaleTimeString()}</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalTitle}
          size="xl"
        >
          {children}
        </Modal>

        <MapSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </MapHoverProvider>
  )
}

export default MapLayout
