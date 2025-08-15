import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppDispatch } from './hooks/redux'
import { checkAuthStatus } from './store/slices/authSlice'
import Layout from './components/Layout'
import MapLayout from './components/MapLayout'
import NotificationContainer from './components/NotificationContainer'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import CommerceListPage from './pages/CommerceListPage'
import CommerceDetailPage from './pages/CommerceDetailPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import AuthPage from './pages/AuthPage'

function App() {
  const dispatch = useAppDispatch()
  const location = useLocation()

  // Pages qui utilisent le layout map
  const mapLayoutRoutes = ['/map', '/commerces']
  const useMapLayout = mapLayoutRoutes.some(route => location.pathname.startsWith(route))

  useEffect(() => {
    // Vérifier l'authentification au chargement
    dispatch(checkAuthStatus())
  }, [dispatch])

  const AppLayout = useMapLayout ? MapLayout : Layout

  return (
    <>
      <AppLayout>
        <Routes>
          {/* Page principale avec carte */}
          <Route path="/map" element={<MapPage />} />
          
          {/* Routes avec layout traditionnel */}
          <Route path="/" element={<HomePage />} />
          <Route path="/commerces" element={<CommerceListPage />} />
          <Route path="/commerces/:id" element={<CommerceDetailPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Fallback vers AngularJS pour routes non migrées */}
          <Route path="/legacy/*" element={<div>AngularJS Route</div>} />
        </Routes>
      </AppLayout>
      <NotificationContainer />
    </>
  )
}

export default App