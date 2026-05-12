import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CartState, CartItem, Product } from '../../types'

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  deliveryFee: 5.0, // 5€ de frais de livraison par défaut
  isOpen: false,
  lastError: null,
}

// Stock guard. Returns the quantity that should actually be added/set given the
// product's known stock, plus an optional human message when the request had
// to be clamped or refused. The cart only knows the snapshot it saw at fetch
// time — server-side authoritative check still happens at /orders create.
function clampToStock(
  product: Product,
  requested: number,
  alreadyInCart: number
): { applied: number; message: string | null } {
  const stock = typeof product.stock === 'number' ? product.stock : Infinity
  if (stock <= 0) {
    return { applied: 0, message: `${product.name} est en rupture de stock.` }
  }
  const totalIfAdded = alreadyInCart + requested
  if (totalIfAdded > stock) {
    const room = Math.max(0, stock - alreadyInCart)
    return {
      applied: room,
      message: room === 0
        ? `Vous avez déjà tout le stock disponible de ${product.name} dans le panier (${stock}).`
        : `Stock limité : seulement ${room} ${product.name} ajouté(s) (stock total ${stock}).`,
    }
  }
  return { applied: requested, message: null }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      const { product, quantity } = action.payload
      const existingItem = state.items.find(item => item.productId === product.id)
      const alreadyInCart = existingItem?.quantity ?? 0
      const { applied, message } = clampToStock(product, quantity, alreadyInCart)
      state.lastError = message

      if (applied <= 0) {
        return // nothing to add (out of stock or already at max)
      }

      if (existingItem) {
        existingItem.quantity += applied
        existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice
      } else {
        const newItem: CartItem = {
          id: `cart_${product.id}_${Date.now()}`,
          productId: product.id,
          product,
          quantity: applied,
          unitPrice: product.price,
          totalPrice: product.price * applied,
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
          state.lastError = null
        } else {
          // Clamp to product stock if known. We pass alreadyInCart=0 because
          // `quantity` here is the absolute target, not a delta.
          const { applied, message } = clampToStock(item.product, quantity, 0)
          state.lastError = message
          item.quantity = applied > 0 ? applied : item.quantity
          item.totalPrice = item.quantity * item.unitPrice
        }
      }

      cartSlice.caseReducers.updateTotals(state)
    },

    clearLastError: (state) => {
      state.lastError = null
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
  clearLastError,
  toggleCart,
  setCartOpen,
  setDeliveryFee,
  updateTotals,
  completeOrder,
  saveToStorage,
  loadFromStorage,
} = cartSlice.actions

export default cartSlice.reducer