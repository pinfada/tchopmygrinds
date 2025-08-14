import { ReactNode, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { getCurrentLocation } from '../store/slices/locationSlice'
import { loadFromStorage } from '../store/slices/cartSlice'
import Header from './Header'
import Footer from './Footer'
import CartSidebar from './CartSidebar'
import NotificationContainer from './NotificationContainer'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const dispatch = useAppDispatch()
  // const { isAuthenticated } = useAppSelector((state) => state.auth)
  const { currentLocation } = useAppSelector((state) => state.location)

  useEffect(() => {
    // Charger le panier depuis localStorage au démarrage
    dispatch(loadFromStorage())
    
    // Demander la géolocalisation si pas encore obtenue
    if (!currentLocation) {
      dispatch(getCurrentLocation())
    }
  }, [dispatch, currentLocation])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      
      <Footer />
      
      {/* Sidebar panier */}
      <CartSidebar />
      
      {/* Notifications globales */}
      <NotificationContainer />
      
      {/* Overlay pour mobile si nécessaire */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden hidden" id="mobile-overlay" />
    </div>
  )
}

export default Layout