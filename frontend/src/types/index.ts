// Types pour l'authentification
export interface UserCommerceRef {
  id: number
  name: string
}

export interface User {
  id: number
  email: string
  role: 'itinerant' | 'sedentary' | 'others'
  name?: string
  phone?: string
  // International format without leading "+" or spaces (e.g. "237699999999").
  // Drives the "Contact WhatsApp" deep-link the customer can use to reach the merchant.
  whatsapp_phone?: string
  avatar?: string
  isVerified?: boolean
  // Populated for merchants by /api/v1/auth/login and /api/v1/auth/me.
  // Empty array for buyers.
  commerces?: UserCommerceRef[]
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
  description?: string
  adress1: string // Nom du champ dans la DB Rails
  address?: string // Alias pour compatibilité
  latitude: number
  longitude: number
  phone?: string
  // ISO-4217 currency this shop sells in (EUR, XAF). Drives price formatting
  // across product cards, cart, checkout and vendor screens.
  currency?: string
  // Mirrored from the owner's User.whatsapp_phone — used by the customer-side
  // "Contact via WhatsApp" deep-link. Optional: merchants without a WhatsApp
  // number simply do not see that CTA.
  merchantWhatsappPhone?: string
  // Merchant's display name (User.name on the commerce owner). Surfaced so the
  // WhatsApp greeting can address the person rather than echoing the shop name.
  merchantName?: string
  email?: string
  website?: string
  openingHours?: string
  imageUrl?: string
  category?: string
  isVerified?: boolean
  rating?: number
  distance?: number
  userId?: number
  createdAt?: string
  updatedAt?: string
  // Champs additionnels utilisés dans l'interface
  ville?: string // Alias pour la ville
  productsCount?: number // Nombre de produits du commerce
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
  // ISO-4217 currency of the price field. Set server-side from the commerce's
  // currency; defaults to "EUR" on legacy rows. Always pass this to
  // `formatPrice(amount, currency)` rather than assuming €.
  currency?: string
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

// Types pour les adresses
export interface Address {
  id?: number
  street: string
  city: string
  postalCode: string
  country: string
  latitude: number
  longitude: number
  isDefault?: boolean
}

// Types pour les commandes
export type OrderStatus =
  | 'Waiting'
  | 'Accepted'
  | 'In_Progress'
  | 'Shipped'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled'

export interface OrderItem {
  id: number
  quantity: number
  unitPrice: number
  totalPrice: number
  product?: {
    id: number
    name: string
    description?: string
    imageUrl?: string | null
    unit?: string | null
    category?: string | null
    commerce?: {
      id: number
      name: string
      address?: string | null
    } | null
  } | null
}

export type PaymentMethod = 'cash' | 'card'

export interface Order {
  id: number
  status: OrderStatus
  totalAmount: number
  deliveryFee: number
  grandTotal: number
  // ISO-4217 code of the merchant's currency at the time the order was placed.
  // Cart is per-merchant, so a single order is always in one currency.
  currency?: string
  paymentMethod: PaymentMethod | null
  deliveryAddress: string | null
  phone: string | null
  notes: string | null
  itemsCount: number
  createdAt: string
  updatedAt: string
  cancelledAt?: string | null
  items?: OrderItem[]
}

export interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  loading: boolean
  error: string | null
}

export interface OrderFormData {
  deliveryAddress: Address
  phone: string
  notes: string
  paymentMethod: 'card' | 'cash'
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

// Types pour les évaluations et avis
export interface Rating {
  id: number
  rating: number
  comment?: string
  verified: boolean
  helpfulCount: number
  createdAt: string
  updatedAt?: string
  user: {
    id: number
    name: string
    initials: string
  }
  rateable?: {
    type: 'Commerce' | 'Product'
    id: number
    name: string
  }
  canEdit?: boolean
  canDelete?: boolean
}

export interface RatingStats {
  averageRating: number
  totalRatings: number
  verifiedRatings: number
  distribution: Record<string, number>
}

export interface RatingFormData {
  rating: number
  comment: string
  rateableType: 'Commerce' | 'Product'
  rateableId: number
  orderId?: number
}

export interface RatingState {
  ratings: Rating[]
  myRatings: Rating[]
  currentRatingStats: RatingStats | null
  loading: boolean
  error: string | null
}