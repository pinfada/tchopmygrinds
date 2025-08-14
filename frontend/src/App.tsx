import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppDispatch } from './hooks/redux'
import { checkAuthStatus } from './store/slices/authSlice'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CommerceListPage from './pages/CommerceListPage'
import ProductsPage from './pages/ProductsPage'
import CartPage from './pages/CartPage'
import ProfilePage from './pages/ProfilePage'
import AuthPage from './pages/AuthPage'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Vérifier l'authentification au chargement
    dispatch(checkAuthStatus())
  }, [dispatch])

  return (
    <Layout>
      <Routes>
        {/* Routes principales - migration progressive d'AngularJS */}
        <Route path="/" element={<HomePage />} />
        <Route path="/commerces" element={<CommerceListPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Fallback vers AngularJS pour routes non migrées */}
        <Route path="/legacy/*" element={<div>AngularJS Route</div>} />
      </Routes>
    </Layout>
  )
}

export default App