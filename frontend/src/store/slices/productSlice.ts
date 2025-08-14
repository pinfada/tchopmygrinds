import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ProductState, Product, Coordinates } from '../../types'
import { productAPI } from '../../services/api'

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  filters: {},
  sortBy: 'name',
}

// Actions asynchrones
export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params?: { commerceId?: number; location?: Coordinates }) => {
    const response = await productAPI.getAll(params)
    return response.data
  }
)

export const fetchProductById = createAsyncThunk(
  'product/fetchById',
  async (id: number) => {
    const response = await productAPI.getById(id)
    return response.data
  }
)

export const fetchProductsByCommerce = createAsyncThunk(
  'product/fetchByCommerce',
  async (commerceId: number) => {
    const response = await productAPI.getByCommerce(commerceId)
    return response.data
  }
)

export const searchProducts = createAsyncThunk(
  'product/search',
  async (params: {
    query: string
    location?: Coordinates
    filters?: {
      category?: string
      minPrice?: number
      maxPrice?: number
      commerceId?: number
    }
  }) => {
    const response = await productAPI.search(params)
    return response.data
  }
)

export const createProduct = createAsyncThunk(
  'product/create',
  async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await productAPI.create(productData)
    return response.data
  }
)

export const updateProduct = createAsyncThunk(
  'product/update',
  async (params: { id: number; data: Partial<Product> }) => {
    const response = await productAPI.update(params.id, params.data)
    return response.data
  }
)

export const deleteProduct = createAsyncThunk(
  'product/delete',
  async (id: number) => {
    await productAPI.delete(id)
    return id
  }
)

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload
    },
    setFilters: (state, action: PayloadAction<ProductState['filters']>) => {
      state.filters = action.payload
    },
    setSortBy: (state, action: PayloadAction<ProductState['sortBy']>) => {
      state.sortBy = action.payload
    },
    clearProducts: (state) => {
      state.products = []
    },
    // Tri local des produits
    sortProducts: (state, action: PayloadAction<ProductState['sortBy']>) => {
      state.sortBy = action.payload
      state.products.sort((a, b) => {
        switch (action.payload) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'price':
            return a.price - b.price
          case 'rating':
            return (b.commerce?.rating || 0) - (a.commerce?.rating || 0)
          case 'distance':
            return (a.commerce?.distance || 0) - (b.commerce?.distance || 0)
          default:
            return 0
        }
      })
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Erreur de chargement des produits'
      })
      
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false
        state.currentProduct = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Produit non trouvé'
      })
      
      // Fetch products by commerce
      .addCase(fetchProductsByCommerce.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload
      })
      
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Erreur de recherche'
      })
      
      // Create product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload)
        state.currentProduct = action.payload
      })
      
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.products[index] = action.payload
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload
        }
      })
      
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload)
        if (state.currentProduct?.id === action.payload) {
          state.currentProduct = null
        }
      })
  },
})

export const { 
  clearError, 
  setCurrentProduct, 
  setFilters, 
  setSortBy, 
  clearProducts,
  sortProducts 
} = productSlice.actions

export default productSlice.reducer