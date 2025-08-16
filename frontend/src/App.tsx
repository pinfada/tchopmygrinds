import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppDispatch } from './hooks/redux'
import { checkAuthStatus } from './store/slices/authSlice'
import MapLayout from './components/layout/MapLayout'
import NotificationContainer from './components/NotificationContainer'
import CartSidebar from './components/CartSidebar'

// Pages transformées en contenu modal
import CommerceListPage from './pages/CommerceListPage'
import CommerceDetailPage from './pages/CommerceDetailPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import AuthPage from './pages/AuthPage'
import ProductInterestPage from './pages/ProductInterestPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import VendorDashboardPage from './pages/VendorDashboardPage'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Vérifier l'authentification au chargement
    dispatch(checkAuthStatus())
  }, [dispatch])

  return (
    <>
      {/* Layout principal avec carte et sidebar */}
      <MapLayout>
        <Routes>
          {/* Route racine - carte uniquement */}
          <Route path="/" element={null} />
          
          {/* Routes modales */}
          <Route path="/commerces" element={<CommerceListPage />} />
          <Route path="/commerces/:id" element={<CommerceDetailPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/interests" element={<ProductInterestPage />} />
          <Route path="/dashboard" element={<VendorDashboardPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </MapLayout>

      {/* Composants globaux */}
      <NotificationContainer />
      <CartSidebar />
    </>
  )
}

export default App