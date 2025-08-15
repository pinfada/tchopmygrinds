import React, { useState } from 'react'
import { useAppDispatch } from '../../hooks/redux'
import { setCurrentLocation, setPermissionGranted, setError, clearError } from '../../store/slices/locationSlice'

interface GeolocationButtonProps {
  onLocationFound?: (coords: { latitude: number; longitude: number }) => void
  className?: string
  children?: React.ReactNode
}

export default function GeolocationButton({ 
  onLocationFound, 
  className = '',
  children 
}: GeolocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useAppDispatch()

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      const error = 'La géolocalisation n\'est pas supportée par ce navigateur'
      dispatch(setError(error))
      return
    }

    setIsLoading(true)
    dispatch(clearError())

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    }

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          
          // Update Redux store
          dispatch(setCurrentLocation(coords))
          dispatch(setPermissionGranted(true))
          
          // Callback optionnel
          onLocationFound?.(coords)
          
          setIsLoading(false)
        },
        (error) => {
          let errorMessage = 'Erreur de géolocalisation'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permission de géolocalisation refusée'
              dispatch(setPermissionGranted(false))
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Position non disponible'
              break
            case error.TIMEOUT:
              errorMessage = 'Délai de géolocalisation dépassé'
              break
          }
          
          dispatch(setError(errorMessage))
          setIsLoading(false)
        },
        options
      )
    } catch (err) {
      dispatch(setError('Erreur lors de la demande de géolocalisation'))
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={requestLocation}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center px-4 py-2 
        bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300
        text-white font-medium rounded-lg
        transition-colors duration-200
        ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title="Obtenir ma position"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Localisation...
        </>
      ) : (
        <>
          {children || (
            <>
              <span className="mr-2">📍</span>
              Ma position
            </>
          )}
        </>
      )}
    </button>
  )
}