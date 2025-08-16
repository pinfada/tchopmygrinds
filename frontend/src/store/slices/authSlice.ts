import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { AuthState, User } from '../../types'
import { authAPI } from '../../services/api'
import { secureStorage } from '../../services/secureStorage'

// Migrer les anciennes données au démarrage
secureStorage.migrateOldData();

const initialState: AuthState = {
  user: secureStorage.getUser(),
  token: secureStorage.getToken(),
  isAuthenticated: !!secureStorage.getToken() && !!secureStorage.getUser(),
  loading: false,
  error: null,
}

// Actions asynchrones
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Tentative de connexion avec:', credentials.email)
      const response = await authAPI.login(credentials)
      console.log('Réponse login:', response)
      // Le token JWT est automatiquement géré par les intercepteurs Axios
      return response
    } catch (error: any) {
      console.error('Erreur login:', error)
      const message = error.response?.data?.error || 
                    error.response?.data?.message || 
                    'Erreur de connexion'
      return rejectWithValue(message)
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; role: string; name?: string }, { rejectWithValue }) => {
    try {
      console.log('Tentative d\'inscription:', userData)
      const response = await authAPI.register(userData)
      console.log('Réponse register:', response)
      // Le token JWT est automatiquement géré par les intercepteurs Axios
      return response
    } catch (error: any) {
      console.error('Erreur register:', error)
      const message = error.response?.data?.error || 
                    error.response?.data?.message || 
                    'Erreur d\'inscription'
      return rejectWithValue(message)
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  await authAPI.logout()
  secureStorage.clearAll()
})

export const checkAuthStatus = createAsyncThunk('auth/checkStatus', async () => {
  const token = secureStorage.getToken()
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
        secureStorage.setUser(state.user)
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
        state.token = secureStorage.getToken()
        state.isAuthenticated = true
        secureStorage.setUser(action.payload.user)
        // Le token JWT est géré automatiquement par les intercepteurs
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Erreur de connexion'
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = secureStorage.getToken()
        state.isAuthenticated = true
        secureStorage.setUser(action.payload.user)
        // Le token JWT est géré automatiquement par les intercepteurs
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Erreur d\'inscription'
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
      
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.loading = false
        secureStorage.setUser(action.payload.user)
        // Le token est maintenu par secureStorage
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loading = false
        secureStorage.clearAll()
      })
  },
})

export const { clearError, updateUser } = authSlice.actions
export default authSlice.reducer