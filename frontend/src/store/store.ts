import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import commerceSlice from './slices/commerceSlice'
import productSlice from './slices/productSlice'
import cartSlice from './slices/cartSlice'
import locationSlice from './slices/locationSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    commerce: commerceSlice,
    product: productSlice,
    cart: cartSlice,
    location: locationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorer ces action types pour les dates et fonctions
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch