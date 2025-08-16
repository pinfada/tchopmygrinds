import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productInterestAPI } from '../../services/api';

// Types
export interface ProductInterest {
  id: number;
  product_name: string;
  message?: string;
  search_radius: number;
  fulfilled: boolean;
  fulfilled_at?: string;
  email_sent: boolean;
  created_at: string;
  updated_at: string;
  user_latitude: number;
  user_longitude: number;
}

export interface MerchantProductInterest {
  id: number;
  product_name: string;
  message?: string;
  search_radius: number;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  distance?: number;
}

export interface CreateProductInterestData {
  product_name: string;
  message?: string;
  search_radius?: number;
  latitude?: number;
  longitude?: number;
}

export interface ProductInterestState {
  // États pour utilisateur normal
  interests: ProductInterest[];
  loading: boolean;
  error: string | null;
  
  // États pour marchands
  merchantInterests: MerchantProductInterest[];
  merchantLoading: boolean;
  merchantError: string | null;
  
  // États globaux
  creating: boolean;
  createError: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  
  // Pagination marchands
  merchantCurrentPage: number;
  merchantTotalPages: number;
  merchantTotalCount: number;
}

const initialState: ProductInterestState = {
  interests: [],
  loading: false,
  error: null,
  
  merchantInterests: [],
  merchantLoading: false,
  merchantError: null,
  
  creating: false,
  createError: null,
  
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  
  merchantCurrentPage: 1,
  merchantTotalPages: 1,
  merchantTotalCount: 0,
};

// Thunks pour utilisateur normal
export const fetchProductInterests = createAsyncThunk(
  'productInterest/fetchProductInterests',
  async ({ page = 1, perPage = 10 }: { page?: number; perPage?: number } = {}) => {
    const response = await productInterestAPI.getMyInterests({ page });
    return response;
  }
);

export const createProductInterest = createAsyncThunk(
  'productInterest/createProductInterest',
  async (data: CreateProductInterestData, { rejectWithValue }) => {
    try {
      const payload = {
        product_name: data.product_name,
        message: data.message,
        search_radius: data.search_radius || 25,
        latitude: data.latitude!,
        longitude: data.longitude!,
      };
      
      const response = await productInterestAPI.create(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || ['Erreur lors de la création']);
    }
  }
);

export const deleteProductInterest = createAsyncThunk(
  'productInterest/deleteProductInterest',
  async (id: number) => {
    await productInterestAPI.delete(id);
    return id;
  }
);

// Thunks pour marchands
export const fetchMerchantProductInterests = createAsyncThunk(
  'productInterest/fetchMerchantProductInterests',
  async ({ page = 1, perPage = 10 }: { page?: number; perPage?: number } = {}) => {
    const response = await productInterestAPI.getMerchantInterests({ page });
    return response;
  }
);

export const notifyProductAvailability = createAsyncThunk(
  'productInterest/notifyProductAvailability',
  async ({ productId, radius = 50 }: { productId: number; radius?: number }, { rejectWithValue }) => {
    try {
      const response = await productInterestAPI.notifyAvailability({ productId, radius });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Erreur lors de la notification');
    }
  }
);

const productInterestSlice = createSlice({
  name: 'productInterest',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.merchantError = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setMerchantCurrentPage: (state, action: PayloadAction<number>) => {
      state.merchantCurrentPage = action.payload;
    },
    resetState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch product interests
      .addCase(fetchProductInterests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductInterests.fulfilled, (state, action) => {
        state.loading = false;
        state.interests = action.payload.product_interests;
        state.currentPage = action.payload.meta.current_page;
        state.totalPages = action.payload.meta.total_pages;
        state.totalCount = action.payload.meta.total_count;
      })
      .addCase(fetchProductInterests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors du chargement';
      })
      
      // Create product interest
      .addCase(createProductInterest.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createProductInterest.fulfilled, (state, action) => {
        state.creating = false;
        state.interests.unshift(action.payload.product_interest);
        state.totalCount += 1;
      })
      .addCase(createProductInterest.rejected, (state, action) => {
        state.creating = false;
        state.createError = Array.isArray(action.payload) 
          ? action.payload.join(', ') 
          : (action.payload as string) || 'Erreur lors de la création';
      })
      
      // Delete product interest
      .addCase(deleteProductInterest.fulfilled, (state, action) => {
        state.interests = state.interests.filter(interest => interest.id !== action.payload);
        state.totalCount -= 1;
      })
      
      // Fetch merchant product interests
      .addCase(fetchMerchantProductInterests.pending, (state) => {
        state.merchantLoading = true;
        state.merchantError = null;
      })
      .addCase(fetchMerchantProductInterests.fulfilled, (state, action) => {
        state.merchantLoading = false;
        state.merchantInterests = action.payload.product_interests;
        state.merchantCurrentPage = action.payload.meta.current_page;
        state.merchantTotalPages = action.payload.meta.total_pages;
        state.merchantTotalCount = action.payload.meta.total_count;
      })
      .addCase(fetchMerchantProductInterests.rejected, (state, action) => {
        state.merchantLoading = false;
        state.merchantError = action.error.message || 'Erreur lors du chargement';
      })
      
      // Notify product availability
      .addCase(notifyProductAvailability.fulfilled, (state, action) => {
        // Pas besoin de modifier l'état, on affiche juste un message de succès
      });
  },
});

export const { 
  clearErrors, 
  setCurrentPage, 
  setMerchantCurrentPage, 
  resetState 
} = productInterestSlice.actions;

export default productInterestSlice.reducer;