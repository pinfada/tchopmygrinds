// Types pour l'authentification
export interface User {
  id: number
  email: string
  role: 'itinerant' | 'sedentary' | 'others'
  name?: string
  phone?: string
  avatar?: string
  isVerified?: boolean
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

// Types pour les commerces
export interface Commerce {
  id: number
  name: string
  description: string
  address: string
  latitude: number
  longitude: number
  phone?: string
  email?: string
  category: string
  isVerified: boolean
  rating: number
  distance?: number
  userId: number
  createdAt: string
  updatedAt: string
}

export interface CommerceState {
  commerces: Commerce[]
  currentCommerce: Commerce | null
  loading: boolean
  error: string | null
  searchRadius: number
  filters: {
    category?: string
    rating?: number
    verified?: boolean
  }
}

// Types pour les produits
export interface Product {
  id: number
  name: string
  description: string
  price: number
  unit: string
  category: string
  imageUrl?: string
  stock: number
  isAvailable: boolean
  commerceId: number
  commerce?: Commerce
  createdAt: string
  updatedAt: string
}

export interface ProductState {
  products: Product[]
  currentProduct: Product | null
  loading: boolean
  error: string | null
  filters: {
    category?: string
    minPrice?: number
    maxPrice?: number
    commerceId?: number
  }
  sortBy: 'name' | 'price' | 'rating' | 'distance'
}

// Types pour le panier
export interface CartItem {
  id: string
  productId: number
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  deliveryFee: number
  isOpen: boolean
}

// Types pour la géolocalisation
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface LocationState {
  currentLocation: Coordinates | null
  loading: boolean
  error: string | null
  permissionGranted: boolean
}

// Types pour les commandes
export interface Order {
  id: number
  userId: number
  items: CartItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled'
  deliveryAddress: string
  phone: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Types pour les API responses
export interface ApiResponse<T> {
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    currentPage: number
    totalPages: number
    totalCount: number
    perPage: number
  }
}