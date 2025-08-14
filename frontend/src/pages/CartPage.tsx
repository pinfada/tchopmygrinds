import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice'

const CartPage = () => {
  const dispatch = useAppDispatch()
  const { items, totalItems, totalPrice, deliveryFee } = useAppSelector((state) => state.cart)

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeFromCart(itemId))
  }

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    dispatch(updateQuantity({ itemId, quantity }))
  }

  const handleClearCart = () => {
    dispatch(clearCart())
  }

  const grandTotal = totalPrice + deliveryFee

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
          <p className="text-gray-600 text-lg mb-8">
            Découvrez nos produits frais et ajoutez-les à votre panier
          </p>
          <div className="space-x-4">
            <Link to="/products" className="btn-primary">
              Voir les produits
            </Link>
            <Link to="/commerces" className="btn-secondary">
              Découvrir les commerces
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panier ({totalItems} article{totalItems !== 1 ? 's' : ''})
        </h1>
        <p className="text-gray-600">
          Vérifiez vos articles avant de passer commande
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Articles du panier */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header actions */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <span className="text-sm text-gray-600">
              {items.length} article{items.length !== 1 ? 's' : ''} dans votre panier
            </span>
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
            >
              Vider le panier
            </button>
          </div>

          {/* Liste des articles */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card">
                <div className="card-body">
                  <div className="flex items-center space-x-4">
                    {/* Image produit */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
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
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.product.description}
                      </p>
                      {item.product.commerce && (
                        <p className="text-sm text-gray-500">
                          Vendu par {item.product.commerce.name}
                        </p>
                      )}
                      <p className="text-sm text-emerald-600 font-medium">
                        {item.product.category}
                      </p>
                    </div>

                    {/* Prix unitaire */}
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {item.unitPrice.toFixed(2)}€
                      </div>
                      <div className="text-sm text-gray-500">
                        / {item.product.unit}
                      </div>
                    </div>

                    {/* Contrôles quantité */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-lg font-medium w-12 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>

                    {/* Prix total */}
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {item.totalPrice.toFixed(2)}€
                      </div>
                    </div>

                    {/* Supprimer */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      aria-label="Supprimer du panier"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Récapitulatif commande */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <div className="card-body">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Récapitulatif
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total ({totalItems} articles)</span>
                  <span className="font-medium">{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais de livraison</span>
                  <span className="font-medium">{deliveryFee.toFixed(2)}€</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {grandTotal.toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link 
                  to="/checkout" 
                  className="btn-primary w-full text-center block"
                >
                  Passer commande
                </Link>
                <Link 
                  to="/products" 
                  className="btn-secondary w-full text-center block"
                >
                  Continuer mes achats
                </Link>
              </div>

              {/* Informations livraison */}
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707L16 7.586A1 1 0 0015.414 7H14z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-emerald-900">
                      Livraison sous 24-48h
                    </h4>
                    <p className="text-sm text-emerald-700">
                      Livraison gratuite à partir de 50€
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage