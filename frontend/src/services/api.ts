import axios from 'axios'
import { User, Commerce, Product, Order, ApiResponse, PaginatedResponse, Coordinates } from '../types'

// Configuration axios
const API_BASE_URL = import.meta.env.VITE_RAILS_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur pour gérer les JWT tokens et erreurs
api.interceptors.response.use(
  (response) => {
    // Extraire le token JWT du header Authorization de la réponse (devise-jwt)
    const authHeader = response.headers.authorization || response.headers.Authorization
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      localStorage.setItem('auth_token', token)
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('auth_token')
      localStorage.removeItem('current_user')
      
      // Rediriger vers login seulement si pas déjà sur la page auth
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth'
      }
    }
    return Promise.reject(error)
  }
)

// API Authentication
export const authAPI = {
  login: async (credentials: { email: string; password: string }): Promise<{ user: User }> => {
    const response = await api.post('/auth/login', credentials)
    
    // Stocker l'utilisateur en localStorage
    if (response.data.data.user) {
      localStorage.setItem('current_user', JSON.stringify(response.data.data.user))
    }
    
    return response.data.data
  },
  
  register: async (userData: { 
    email: string; 
    password: string; 
    role: string; 
    name?: string 
  }): Promise<{ user: User }> => {
    const response = await api.post('/auth/register', { user: userData })
    
    // Stocker l'utilisateur en localStorage
    if (response.data.data.user) {
      localStorage.setItem('current_user', JSON.stringify(response.data.data.user))
    }
    
    return response.data.data
  },
  
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } finally {
      // Nettoyer le stockage local même si la requête échoue
      localStorage.removeItem('auth_token')
      localStorage.removeItem('current_user')
    }
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me')
    const user = response.data.data.user
    
    // Mettre à jour le localStorage
    localStorage.setItem('current_user', JSON.stringify(user))
    
    return user
  },
  
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.patch('/auth/profile', { user: userData })
    const user = response.data.data.user
    
    // Mettre à jour le localStorage
    localStorage.setItem('current_user', JSON.stringify(user))
    
    return user
  },
}

// API Commerce
export const commerceAPI = {
  getAll: async (): Promise<ApiResponse<Commerce[]>> => {
    const response = await api.get('/commerces')
    return response.data
  },
  
  getById: async (id: number): Promise<ApiResponse<Commerce>> => {
    const response = await api.get(`/commerces/${id}`)
    return response.data
  },
  
  getNearby: async (
    latitude: number, 
    longitude: number, 
    radius: number = 50
  ): Promise<ApiResponse<Commerce[]>> => {
    const response = await api.get('/commerces/nearby', {
      params: { latitude, longitude, radius }
    })
    return response.data
  },
  
  search: async (params: {
    query: string
    location?: Coordinates
    filters?: {
      category?: string
      rating?: number
      verified?: boolean
    }
  }): Promise<ApiResponse<Commerce[]>> => {
    const response = await api.get('/commerces/search', { params })
    return response.data
  },
  
  create: async (commerceData: Omit<Commerce, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Commerce>> => {
    const response = await api.post('/commerces', commerceData)
    return response.data
  },
  
  update: async (id: number, data: Partial<Commerce>): Promise<ApiResponse<Commerce>> => {
    const response = await api.patch(`/commerces/${id}`, data)
    return response.data
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/commerces/${id}`)
  },
}

// API Product
export const productAPI = {
  getAll: async (params?: { 
    commerceId?: number; 
    location?: Coordinates 
  }): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/products', { params })
    return response.data
  },
  
  getById: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },
  
  getByCommerce: async (commerceId: number): Promise<ApiResponse<Product[]>> => {
    const response = await api.get(`/commerces/${commerceId}/products`)
    return response.data
  },
  
  search: async (params: {
    query: string
    location?: Coordinates
    filters?: {
      category?: string
      minPrice?: number
      maxPrice?: number
      commerceId?: number
    }
  }): Promise<ApiResponse<Product[]>> => {
    const response = await api.get('/products/search', { params })
    return response.data
  },
  
  create: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> => {
    const response = await api.post('/products', productData)
    return response.data
  },
  
  update: async (id: number, data: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await api.patch(`/products/${id}`, data)
    return response.data
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`)
  },
}

// API Order
export const orderAPI = {
  getAll: async (): Promise<PaginatedResponse<Order>> => {
    const response = await api.get('/orders')
    return response.data
  },
  
  getUserOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await api.get('/orders')
    return response.data
  },
  
  getById: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },
  
  create: async (orderData: {
    items: Array<{ productId: number; quantity: number }>
    deliveryAddress: string
    phone: string
    notes?: string
  }): Promise<ApiResponse<Order>> => {
    const response = await api.post('/orders', orderData)
    return response.data
  },
  
  updateStatus: async (id: number, status: Order['status']): Promise<ApiResponse<Order>> => {
    const response = await api.patch(`/orders/${id}/status`, { status })
    return response.data
  },
  
  cancel: async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.patch(`/orders/${id}/cancel`)
    return response.data
  },
}

// API Utils
export const utilsAPI = {
  geocode: async (address: string): Promise<Coordinates> => {
    const response = await api.get('/utils/geocode', { params: { address } })
    return response.data
  },
  
  reverseGeocode: async (latitude: number, longitude: number): Promise<string> => {
    const response = await api.get('/utils/reverse-geocode', { 
      params: { latitude, longitude } 
    })
    return response.data.address
  },
}

export default api