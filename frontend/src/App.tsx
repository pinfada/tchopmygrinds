import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { useAppDispatch } from './hooks/redux'
import { checkAuthStatus } from './store/slices/authSlice'
import MapLayout from './components/layout/MapLayout'
import NotificationContainer from './components/NotificationContainer'
import CartSidebar from './components/CartSidebar'
import HomeSeo from './components/seo/HomeSeo'

// Public, SEO-priority routes — kept synchronously imported so the first paint
// after a deep link (/commerces, /products, /commerces/:id, /products/:id) does
// not flash a route-level fallback that hurts LCP and crawler heuristics.
import CommerceListPage from './pages/CommerceListPage'
import CommerceDetailPage from './pages/CommerceDetailPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'

// Private / transactional routes — code-split.
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const ProductInterestPage = lazy(() => import('./pages/ProductInterestPage'))
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'))
const VendorDashboardPage = lazy(() => import('./pages/VendorDashboardPage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))

const RouteFallback = () => (
  <div
    role="status"
    aria-live="polite"
    className="flex items-center justify-center py-12 text-sm text-slate-500"
  >
    Chargement…
  </div>
)

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(checkAuthStatus())
  }, [dispatch])

  return (
    <>
      <MapLayout>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomeSeo />} />

            {/* Public, SEO-priority */}
            <Route path="/commerces" element={<CommerceListPage />} />
            <Route path="/commerces/:id" element={<CommerceDetailPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            {/* Private / transactional (lazy) */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/interests" element={<ProductInterestPage />} />
            <Route path="/dashboard" element={<VendorDashboardPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:conversationId" element={<MessagesPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Routes>
        </Suspense>
      </MapLayout>

      <NotificationContainer />
      <CartSidebar />
    </>
  )
}

export default App
