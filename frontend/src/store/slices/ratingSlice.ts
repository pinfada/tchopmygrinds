import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../../services/api'
import { Rating, RatingStats, RatingFormData, RatingState } from '../../types'

const initialState: RatingState = {
  ratings: [],
  myRatings: [],
  currentRatingStats: null,
  loading: false,
  error: null
}

// Récupérer les évaluations d'un objet (Commerce ou Product)
export const fetchRatings = createAsyncThunk(
  'rating/fetchRatings',
  async ({ rateableType, rateableId, page = 1, verified }: {
    rateableType: 'Commerce' | 'Product'
    rateableId: number
    page?: number
    verified?: boolean
  }) => {
    const params = new URLSearchParams({
      rateable_type: rateableType,
      rateable_id: rateableId.toString(),
      page: page.toString()
    })
    
    if (verified !== undefined) {
      params.append('verified', verified.toString())
    }

    const response = await api.get(`/ratings?${params}`)
    return response.data
  }
)

// Créer une nouvelle évaluation
export const createRating = createAsyncThunk(
  'rating/createRating',
  async (ratingData: RatingFormData, { rejectWithValue }) => {
    try {
      const response = await api.post('/ratings', {
        rating: {
          rating: ratingData.rating,
          comment: ratingData.comment,
          rateable_type: ratingData.rateableType,
          rateable_id: ratingData.rateableId
        },
        order_id: ratingData.orderId
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la création de l\'évaluation')
    }
  }
)

// Mettre à jour une évaluation
export const updateRating = createAsyncThunk(
  'rating/updateRating',
  async ({ id, rating, comment }: { id: number; rating: number; comment: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/ratings/${id}`, {
        rating: { rating, comment }
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour')
    }
  }
)

// Supprimer une évaluation
export const deleteRating = createAsyncThunk(
  'rating/deleteRating',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/ratings/${id}`)
      return id
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la suppression')
    }
  }
)

// Marquer une évaluation comme utile
export const markRatingHelpful = createAsyncThunk(
  'rating/markHelpful',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.post(`/ratings/${id}/mark_helpful`)
      return { id, helpfulCount: response.data.data.helpful_count }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur')
    }
  }
)

// Récupérer mes évaluations
export const fetchMyRatings = createAsyncThunk(
  'rating/fetchMyRatings',
  async ({ page = 1 }: { page?: number } = {}) => {
    const response = await api.get(`/ratings/my_ratings?page=${page}`)
    return response.data
  }
)

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    clearRatings: (state) => {
      state.ratings = []
      state.currentRatingStats = null
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch ratings
      .addCase(fetchRatings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.loading = false
        state.ratings = action.payload.data.ratings
        state.currentRatingStats = action.payload.data.stats
      })
      .addCase(fetchRatings.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Erreur lors du chargement des évaluations'
      })
      
      // Create rating
      .addCase(createRating.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRating.fulfilled, (state, action) => {
        state.loading = false
        state.ratings.unshift(action.payload.data.rating)
        // Mettre à jour les stats si disponibles
        if (state.currentRatingStats) {
          state.currentRatingStats.totalRatings += 1
          if (action.payload.data.rating.verified) {
            state.currentRatingStats.verifiedRatings += 1
          }
        }
      })
      .addCase(createRating.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Update rating
      .addCase(updateRating.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateRating.fulfilled, (state, action) => {
        state.loading = false
        const updatedRating = action.payload.data.rating
        const index = state.ratings.findIndex(r => r.id === updatedRating.id)
        if (index !== -1) {
          state.ratings[index] = updatedRating
        }
        // Également mettre à jour dans myRatings si présent
        const myIndex = state.myRatings.findIndex(r => r.id === updatedRating.id)
        if (myIndex !== -1) {
          state.myRatings[myIndex] = updatedRating
        }
      })
      .addCase(updateRating.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Delete rating
      .addCase(deleteRating.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteRating.fulfilled, (state, action) => {
        state.loading = false
        const ratingId = action.payload
        state.ratings = state.ratings.filter(r => r.id !== ratingId)
        state.myRatings = state.myRatings.filter(r => r.id !== ratingId)
        // Mettre à jour les stats
        if (state.currentRatingStats) {
          state.currentRatingStats.totalRatings = Math.max(0, state.currentRatingStats.totalRatings - 1)
        }
      })
      .addCase(deleteRating.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      // Mark helpful
      .addCase(markRatingHelpful.fulfilled, (state, action) => {
        const { id, helpfulCount } = action.payload
        const rating = state.ratings.find(r => r.id === id)
        if (rating) {
          rating.helpfulCount = helpfulCount
        }
      })
      
      // Fetch my ratings
      .addCase(fetchMyRatings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyRatings.fulfilled, (state, action) => {
        state.loading = false
        state.myRatings = action.payload.data.ratings
      })
      .addCase(fetchMyRatings.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Erreur lors du chargement de vos évaluations'
      })
  }
})

export const { clearRatings, clearError } = ratingSlice.actions
export default ratingSlice.reducer