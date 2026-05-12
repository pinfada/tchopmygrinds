import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { CommerceState, Commerce, Coordinates } from '../../types'
import { commerceAPI } from '../../services/api'
import { commerceCache } from '../../services/commerceCache'

function normalizeCommerceList(payload: unknown): Commerce[] {
  if (Array.isArray(payload)) return payload as Commerce[]
  if (payload && typeof payload === 'object') {
    const obj = payload as { commerces?: unknown; data?: unknown }
    if (Array.isArray(obj.commerces)) return obj.commerces as Commerce[]
    if (Array.isArray(obj.data)) return obj.data as Commerce[]
  }
  return []
}

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
  async (params: { location: Coordinates; radius?: number; force?: boolean }) => {
    const radius = params.radius ?? 50
    const { latitude, longitude } = params.location

    if (!params.force) {
      const cached = commerceCache.getFresh(latitude, longitude, radius)
      if (cached) {
        return { commerces: cached, fromCache: true as const }
      }
    }

    const response = await commerceAPI.getNearby(latitude, longitude, radius)
    const commerces = normalizeCommerceList(response.data ?? response)

    commerceCache.bulkSet(commerces)
    commerceCache.recordFetch(latitude, longitude, radius)

    return { commerces, fromCache: false as const }
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
        state.commerces = action.payload.commerces
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