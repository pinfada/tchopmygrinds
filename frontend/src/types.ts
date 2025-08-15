// Types principaux de l'application TchopMyGrinds

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role: 'itinerant' | 'sedentary' | 'others'
  statut_type?: string
  phone?: string
  addresses?: Address[]
  created_at: string
  updated_at: string
}

export interface Commerce {
  id: string
  name: string
  description?: string
  type: 'itinerant' | 'sedentary'  // Type de commerce
  category: string
  latitude: number
  longitude: number
  address: string
  phone?: string
  email?: string
  website?: string
  rating?: number
  distance?: number
  isVerified: boolean
  isOnline?: boolean  // Pour les commerces ambulants
  user_id: string
  owner?: User
  products?: Product[]
  opening_hours?: OpeningHours[]
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  unit: string
  category: string
  stock: number
  isAvailable: boolean
  image_url?: string
  commerce_id: string
  commerce?: Commerce
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  street: string
  city: string
  postal_code: string
  country: string
  latitude?: number
  longitude?: number
  user_id: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  status: 'waiting' | 'accepted' | 'in_progress' | 'shipped' | 'delivered' | 'completed' | 'cancelled'
  totalAmount: number
  deliveryFee: number
  grandTotal: number
  notes?: string
  user_id: string
  customer?: User
  delivery_address_id?: string
  delivery_address?: Address
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  product_id: string
  product: Product
  order_id: string
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OpeningHours {
  id: string
  day_of_week: number // 0-6 (dimanche à samedi)
  opening_time: string
  closing_time: string
  is_closed: boolean
  commerce_id: string
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  created_at: string
  user_id: string
}

// Types pour la géolocalisation et le suivi
export interface LocationUpdate {
  latitude: number
  longitude: number
  timestamp: Date
  accuracy?: number
  heading?: number
  speed?: number
}

export interface RouteWaypoint {
  latitude: number
  longitude: number
  timestamp: Date
  activity?: 'moving' | 'stopped' | 'serving_customers'
}

export interface CommerceRoute {
  commerce_id: string
  start_time: Date
  end_time: Date
  waypoints: RouteWaypoint[]
  is_active: boolean
}

// Types pour les filtres et la recherche
export interface CommerceFilters {
  category?: string
  rating?: number
  verified?: boolean
  type?: 'itinerant' | 'sedentary'
  maxDistance?: number
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  commerce_id?: string
}

export interface SearchParams {
  query?: string
  location?: Coordinates
  radius?: number
  filters?: CommerceFilters | ProductFilters
}

// Types pour les API responses
export interface ApiResponse<T> {
  data: T
  message?: string
  errors?: string[]
  meta?: {
    total?: number
    page?: number
    per_page?: number
    total_pages?: number
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number
    page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

// Types pour l'authentification
export interface AuthTokens {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  password_confirmation: string
  name?: string
  role: 'itinerant' | 'sedentary' | 'others'
  phone?: string
}

// Types pour les states Redux
export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export interface LocationState {
  currentLocation: Coordinates | null
  loading: boolean
  error: string | null
  permissionStatus: 'granted' | 'denied' | 'prompt' | null
}

export interface CommerceState {
  commerces: Commerce[]
  selectedCommerce: Commerce | null
  loading: boolean
  error: string | null
  filters: CommerceFilters
}

export interface ProductState {
  products: Product[]
  selectedProduct: Product | null
  loading: boolean
  error: string | null
  filters: ProductFilters
}

export interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isOpen: boolean
  loading: boolean
}

export interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  loading: boolean
  error: string | null
}

export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
}