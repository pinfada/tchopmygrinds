import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CartState, CartItem, Product } from '../../types'

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  deliveryFee: 5.0, // 5€ de frais de livraison par défaut
  isOpen: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity } = action.payload
      const existingItem = state.items.find(item => item.productId === product.id)
      
      if (existingItem) {
        existingItem.quantity += quantity
        existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice
      } else {
        const newItem: CartItem = {
          id: `cart_${product.id}_${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          unitPrice: product.price,
          totalPrice: product.price * quantity,
        }
        state.items.push(newItem)
      }
      
      cartSlice.caseReducers.updateTotals(state)
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      cartSlice.caseReducers.updateTotals(state)
    },
    
    updateQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      const { itemId, quantity } = action.payload
      const item = state.items.find(item => item.id === itemId)
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.id !== itemId)
        } else {
          item.quantity = quantity
          item.totalPrice = item.quantity * item.unitPrice
        }
      }
      
      cartSlice.caseReducers.updateTotals(state)
    },
    
    clearCart: (state) => {
      state.items = []
      state.totalItems = 0
      state.totalPrice = 0
    },
    
    toggleCart: (state) => {
      state.isOpen = !state.isOpen
    },
    
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload
    },
    
    setDeliveryFee: (state, action: PayloadAction<number>) => {
      state.deliveryFee = action.payload
      cartSlice.caseReducers.updateTotals(state)
    },
    
    // Action helper pour recalculer les totaux
    updateTotals: (state) => {
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
      state.totalPrice = state.items.reduce((total, item) => total + item.totalPrice, 0)
    },
    
    // Vider le panier après commande
    completeOrder: (state) => {
      state.items = []
      state.totalItems = 0
      state.totalPrice = 0
      state.isOpen = false
    },
    
    // Sauvegarder le panier en localStorage
    saveToStorage: (state) => {
      try {
        localStorage.setItem('cart', JSON.stringify({
          items: state.items,
          deliveryFee: state.deliveryFee,
        }))
      } catch (error) {
        console.error('Erreur sauvegarde panier:', error)
      }
    },
    
    // Charger le panier depuis localStorage
    loadFromStorage: (state) => {
      try {
        const saved = localStorage.getItem('cart')
        if (saved) {
          const cartData = JSON.parse(saved)
          state.items = cartData.items || []
          state.deliveryFee = cartData.deliveryFee || 5.0
          cartSlice.caseReducers.updateTotals(state)
        }
      } catch (error) {
        console.error('Erreur chargement panier:', error)
      }
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  setCartOpen,
  setDeliveryFee,
  updateTotals,
  completeOrder,
  saveToStorage,
  loadFromStorage,
} = cartSlice.actions

export default cartSlice.reducer