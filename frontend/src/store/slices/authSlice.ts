import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { AuthState, User } from '../../types'
import { authAPI } from '../../services/api'

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  loading: false,
  error: null,
}

// Actions asynchrones
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await authAPI.login(credentials)
    localStorage.setItem('auth_token', response.token)
    return response
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; role: string; name?: string }) => {
    const response = await authAPI.register(userData)
    localStorage.setItem('auth_token', response.token)
    return response
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  await authAPI.logout()
  localStorage.removeItem('auth_token')
})

export const checkAuthStatus = createAsyncThunk('auth/checkStatus', async () => {
  const token = localStorage.getItem('auth_token')
  if (!token) throw new Error('No token found')
  
  const user = await authAPI.getCurrentUser()
  return { user, token }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Erreur de connexion'
        state.isAuthenticated = false
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Erreur d\'inscription'
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
      
      // Check auth status
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.loading = false
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loading = false
        localStorage.removeItem('auth_token')
      })
  },
})

export const { clearError, updateUser } = authSlice.actions
export default authSlice.reducer