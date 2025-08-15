import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { LocationState, Coordinates } from '../../types'

const initialState: LocationState = {
  currentLocation: {
    latitude: 4.0511,  // Douala, Cameroun - pour les tests
    longitude: 9.7679
  },
  loading: false,
  error: null,
  permissionGranted: true,
}

// Action pour obtenir la géolocalisation
export const getCurrentLocation = createAsyncThunk(
  'location/getCurrentLocation',
  async (_, { rejectWithValue }) => {
    return new Promise<Coordinates>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(rejectWithValue('La géolocalisation n\'est pas supportée'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          let message = 'Erreur de géolocalisation'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Permission de géolocalisation refusée'
              break
            case error.POSITION_UNAVAILABLE:
              message = 'Position indisponible'
              break
            case error.TIMEOUT:
              message = 'Timeout de géolocalisation'
              break
          }
          reject(rejectWithValue(message))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      )
    })
  }
)

// Action pour surveiller la position (watch)
export const watchLocation = createAsyncThunk(
  'location/watchLocation',
  async (_, { dispatch, rejectWithValue }) => {
    return new Promise<number>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(rejectWithValue('La géolocalisation n\'est pas supportée'))
        return
      }

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          dispatch(setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }))
        },
        () => {
          dispatch(setError('Erreur de surveillance de position'))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // 1 minute
        }
      )

      resolve(watchId)
    })
  }
)

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<Coordinates>) => {
      state.currentLocation = action.payload
      state.permissionGranted = true
      state.error = null
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
    clearError: (state) => {
      state.error = null
    },
    setPermissionGranted: (state, action: PayloadAction<boolean>) => {
      state.permissionGranted = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentLocation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.loading = false
        state.currentLocation = action.payload
        state.permissionGranted = true
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.permissionGranted = false
      })
      .addCase(watchLocation.fulfilled, (state) => {
        state.loading = false
        state.permissionGranted = true
      })
      .addCase(watchLocation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setCurrentLocation, setError, clearError, setPermissionGranted } = locationSlice.actions
export default locationSlice.reducer