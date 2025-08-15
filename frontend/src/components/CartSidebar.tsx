import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { setCartOpen, removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice'
import { Link } from 'react-router-dom'

const CartSidebar = () => {
  const dispatch = useAppDispatch()
  const { isOpen, items, totalItems, totalPrice, deliveryFee } = useAppSelector((state) => state.cart)

  const handleClose = () => {
    dispatch(setCartOpen(false))
  }

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeFromCart(itemId))
  }

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    dispatch(updateQuantity({ itemId, quantity }))
  }

  const handleClearCart = () => {
    dispatch(clearCart())
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        onClick={handleClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-[9999] transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Panier ({totalItems})
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fermer le panier"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenu */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Panier vide</h3>
                <p className="text-gray-600 text-center mb-4">
                  Découvrez nos produits frais et ajoutez-les à votre panier
                </p>
                <Link 
                  to="/products" 
                  onClick={handleClose}
                  className="btn-primary"
                >
                  Voir les produits
                </Link>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {/* Image produit */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Détails produit */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.unitPrice.toFixed(2)}€ / {item.product.unit}
                      </p>
                      {item.product.commerce && (
                        <p className="text-xs text-gray-500 truncate">
                          {item.product.commerce.name}
                        </p>
                      )}
                    </div>

                    {/* Contrôles quantité */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>

                    {/* Supprimer */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      aria-label="Supprimer du panier"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Vider le panier */}
                {items.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="w-full text-sm text-red-600 hover:text-red-800 transition-colors py-2"
                  >
                    Vider le panier
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer avec total et checkout */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Récapitulatif */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>{deliveryFee.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span>{(totalPrice + deliveryFee).toFixed(2)}€</span>
                </div>
              </div>

              {/* Bouton commande */}
              <Link 
                to="/checkout" 
                onClick={handleClose}
                className="btn-primary w-full text-center block"
              >
                Passer commande
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CartSidebar