import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { OrderState, Order, OrderFormData } from '../../types'
import { orderAPI } from '../../services/api'

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
}

// Actions asynchrones
export const createOrder = createAsyncThunk(
  'order/create',
  async (orderData: OrderFormData & {
    items: Array<{
      productId: number
      quantity: number
      unitPrice: number
    }>
    totalPrice: number
    grandTotal: number
  }) => {
    const response = await orderAPI.create(orderData)
    return response.data
  }
)

export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async () => {
    const response = await orderAPI.getUserOrders()
    return response.data
  }
)

export const fetchOrderById = createAsyncThunk(
  'order/fetchById',
  async (orderId: number) => {
    const response = await orderAPI.getById(orderId)
    return response.data
  }
)

export const updateOrderStatus = createAsyncThunk(
  'order/updateStatus',
  async (params: { orderId: number; status: string }) => {
    const response = await orderAPI.updateStatus(params.orderId, params.status)
    return response.data
  }
)

export const cancelOrder = createAsyncThunk(
  'order/cancel',
  async (orderId: number) => {
    const response = await orderAPI.cancel(orderId)
    return response.data
  }
)

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload
    },
    clearOrders: (state) => {
      state.orders = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        const order = action.payload.order || action.payload
        state.orders.unshift(order)
        state.currentOrder = order
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Erreur lors de la création de la commande'
      })
      
      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload.orders || action.payload
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Erreur de chargement des commandes'
      })
      
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false
        const order = action.payload.order || action.payload
        state.currentOrder = order
        
        // Update in orders list if exists
        const index = state.orders.findIndex(o => o.id === order.id)
        if (index !== -1) {
          state.orders[index] = order
        } else {
          state.orders.unshift(order)
        }
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Commande non trouvée'
      })
      
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const order = action.payload.order || action.payload
        const index = state.orders.findIndex(o => o.id === order.id)
        if (index !== -1) {
          state.orders[index] = order
        }
        if (state.currentOrder?.id === order.id) {
          state.currentOrder = order
        }
      })
      
      // Cancel order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const order = action.payload.order || action.payload
        const index = state.orders.findIndex(o => o.id === order.id)
        if (index !== -1) {
          state.orders[index] = order
        }
        if (state.currentOrder?.id === order.id) {
          state.currentOrder = order
        }
      })
  },
})

export const { 
  clearError, 
  setCurrentOrder, 
  clearOrders 
} = orderSlice.actions

export default orderSlice.reducer