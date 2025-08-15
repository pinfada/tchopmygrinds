import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { CommerceState, Commerce, Coordinates } from '../../types'
import { commerceAPI } from '../../services/api'

const initialState: CommerceState = {
  commerces: [],
  currentCommerce: null,
  loading: false,
  error: null,
  searchRadius: 50, // 50km par défaut
  filters: {},
}

// Actions asynchrones
export const fetchNearbyCommerces = createAsyncThunk(
  'commerce/fetchNearby',
  async (params: { location: Coordinates; radius?: number }) => {
    const response = await commerceAPI.getNearby(
      params.location.latitude,
      params.location.longitude,
      params.radius || 50
    )
    return response.data
  }
)

export const fetchCommerceById = createAsyncThunk(
  'commerce/fetchById',
  async (id: number) => {
    const response = await commerceAPI.getById(id)
    return response.data
  }
)

export const searchCommerces = createAsyncThunk(
  'commerce/search',
  async (params: { 
    query: string
    location?: Coordinates
    filters?: {
      category?: string
      rating?: number
      verified?: boolean
    }
  }) => {
    const response = await commerceAPI.search(params)
    return response.data
  }
)

export const createCommerce = createAsyncThunk(
  'commerce/create',
  async (commerceData: Omit<Commerce, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await commerceAPI.create(commerceData)
    return response.data
  }
)

export const updateCommerce = createAsyncThunk(
  'commerce/update',
  async (params: { id: number; data: Partial<Commerce> }) => {
    const response = await commerceAPI.update(params.id, params.data)
    return response.data
  }
)

const commerceSlice = createSlice({
  name: 'commerce',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentCommerce: (state, action: PayloadAction<Commerce | null>) => {
      state.currentCommerce = action.payload
    },
    setSearchRadius: (state, action: PayloadAction<number>) => {
      state.searchRadius = action.payload
    },
    setFilters: (state, action: PayloadAction<CommerceState['filters']>) => {
      state.filters = action.payload
    },
    clearCommerces: (state) => {
      state.commerces = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch nearby commerces
      .addCase(fetchNearbyCommerces.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNearbyCommerces.fulfilled, (state, action) => {
        state.loading = false
        state.commerces = action.payload.commerces || []
      })
      .addCase(fetchNearbyCommerces.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Erreur de chargement des commerces'
      })
      
      // Fetch commerce by ID
      .addCase(fetchCommerceById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCommerceById.fulfilled, (state, action) => {
        state.loading = false
        state.currentCommerce = action.payload.commerce || action.payload
      })
      .addCase(fetchCommerceById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Commerce non trouvé'
      })
      
      // Search commerces
      .addCase(searchCommerces.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchCommerces.fulfilled, (state, action) => {
        state.loading = false
        state.commerces = action.payload.commerces || []
      })
      .addCase(searchCommerces.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Erreur de recherche'
      })
      
      // Create commerce
      .addCase(createCommerce.fulfilled, (state, action) => {
        const commerce = action.payload.commerce || action.payload
        state.commerces.push(commerce)
        state.currentCommerce = commerce
      })
      
      // Update commerce
      .addCase(updateCommerce.fulfilled, (state, action) => {
        const commerce = action.payload.commerce || action.payload
        const index = state.commerces.findIndex(c => c.id === commerce.id)
        if (index !== -1) {
          state.commerces[index] = commerce
        }
        if (state.currentCommerce?.id === commerce.id) {
          state.currentCommerce = commerce
        }
      })
  },
})

export const { 
  clearError, 
  setCurrentCommerce, 
  setSearchRadius, 
  setFilters, 
  clearCommerces 
} = commerceSlice.actions

export default commerceSlice.reducer