import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { favoritesAPI, FavoriteEntry } from '../../services/api'

interface FavoritesState {
  items: FavoriteEntry[]
  // Set of commerce ids — kept as an array for serializability; lookups are
  // done via a memoised selector or `items.some(...)` in consumers.
  commerceIds: number[]
  loading: boolean
  error: string | null
  // Per-commerce pending state so the heart icon can spin only on the row
  // being toggled, not the whole list.
  pendingCommerceIds: number[]
}

const initialState: FavoritesState = {
  items: [],
  commerceIds: [],
  loading: false,
  error: null,
  pendingCommerceIds: [],
}

export const fetchFavorites = createAsyncThunk(
  'favorites/fetch',
  async (_: void, { rejectWithValue }) => {
    try {
      return await favoritesAPI.list()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Impossible de charger les favoris'
      return rejectWithValue(message)
    }
  }
)

export const addFavorite = createAsyncThunk(
  'favorites/add',
  async (commerceId: number, { rejectWithValue }) => {
    try {
      return await favoritesAPI.add(commerceId)
    } catch (error: any) {
      const message = error.response?.data?.message || "Impossible d'ajouter aux favoris"
      return rejectWithValue({ commerceId, message })
    }
  }
)

export const removeFavorite = createAsyncThunk(
  'favorites/remove',
  async (commerceId: number, { rejectWithValue }) => {
    try {
      await favoritesAPI.remove(commerceId)
      return commerceId
    } catch (error: any) {
      const message = error.response?.data?.message || 'Impossible de retirer des favoris'
      return rejectWithValue({ commerceId, message })
    }
  }
)

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.items = []
      state.commerceIds = []
      state.loading = false
      state.error = null
      state.pendingCommerceIds = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.commerceIds = action.payload.map((f) => f.commerce_id)
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Erreur de chargement'
      })

      .addCase(addFavorite.pending, (state, action) => {
        state.pendingCommerceIds.push(action.meta.arg)
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.pendingCommerceIds = state.pendingCommerceIds.filter((id) => id !== action.meta.arg)
        const entry = action.payload
        if (!state.commerceIds.includes(entry.commerce_id)) {
          state.items.unshift(entry)
          state.commerceIds.push(entry.commerce_id)
        }
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.pendingCommerceIds = state.pendingCommerceIds.filter((id) => id !== action.meta.arg)
        const payload = action.payload as { commerceId: number; message: string } | undefined
        state.error = payload?.message || 'Erreur'
      })

      .addCase(removeFavorite.pending, (state, action) => {
        state.pendingCommerceIds.push(action.meta.arg)
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        const commerceId = action.payload
        state.pendingCommerceIds = state.pendingCommerceIds.filter((id) => id !== commerceId)
        state.items = state.items.filter((f) => f.commerce_id !== commerceId)
        state.commerceIds = state.commerceIds.filter((id) => id !== commerceId)
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.pendingCommerceIds = state.pendingCommerceIds.filter((id) => id !== action.meta.arg)
        const payload = action.payload as { commerceId: number; message: string } | undefined
        state.error = payload?.message || 'Erreur'
      })
  },
})

export const { clearFavorites } = favoritesSlice.actions
export default favoritesSlice.reducer
