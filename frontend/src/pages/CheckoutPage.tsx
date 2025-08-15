import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { completeOrder } from '../store/slices/cartSlice'
import { createOrder } from '../store/slices/orderSlice'
import type { Address, OrderFormData } from '../types'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items, totalPrice, deliveryFee } = useAppSelector((state) => state.cart)
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { loading: orderLoading } = useAppSelector((state) => state.order)

  const [formData, setFormData] = useState<OrderFormData>({
    deliveryAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France',
      latitude: 0,
      longitude: 0,
    },
    phone: user?.phone || '',
    notes: '',
    paymentMethod: 'card',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [useExistingAddress, setUseExistingAddress] = useState(false)
  const [savedAddresses] = useState<Address[]>([]) // TODO: Charger depuis l'API

  const grandTotal = totalPrice + deliveryFee

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/checkout')
      return
    }

    if (items.length === 0) {
      navigate('/cart')
      return
    }
  }, [isAuthenticated, items.length, navigate])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.deliveryAddress.street.trim()) {
      newErrors.street = 'L\'adresse est requise'
    }
    if (!formData.deliveryAddress.city.trim()) {
      newErrors.city = 'La ville est requise'
    }
    if (!formData.deliveryAddress.postalCode.trim()) {
      newErrors.postalCode = 'Le code postal est requis'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.replace('address.', '')
      setFormData(prev => ({
        ...prev,
        deliveryAddress: {
          ...prev.deliveryAddress,
          [addressField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSubmitOrder = async () => {
    if (!validateForm()) return

    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        deliveryAddress: formData.deliveryAddress,
        phone: formData.phone,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        totalPrice,
        deliveryFee,
        grandTotal,
      }

      const result = await dispatch(createOrder(orderData)).unwrap()
      
      if (result) {
        dispatch(completeOrder())
        navigate(`/orders/${result.id}`, { 
          state: { success: true, message: 'Commande passée avec succès !' }
        })
      }
    } catch (error) {
      console.error('Erreur lors de la commande:', error)
    }
  }

  if (!isAuthenticated || items.length === 0) {
    return null // L'effet redirectionnera
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Finaliser la commande
        </h1>
        <p className="text-gray-600">
          Vérifiez vos informations de livraison et finalisez votre commande
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire de commande */}
        <div className="lg:col-span-2 space-y-6">
          {/* Adresse de livraison */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Adresse de livraison
              </h2>

              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={useExistingAddress}
                      onChange={(e) => setUseExistingAddress(e.target.checked)}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      Utiliser une adresse enregistrée
                    </span>
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="form-label">Adresse *</label>
                  <input
                    type="text"
                    value={formData.deliveryAddress.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    className={`form-input ${errors.street ? 'border-red-500' : ''}`}
                    placeholder="123 Rue de la République"
                  />
                  {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                </div>
                
                <div>
                  <label className="form-label">Ville *</label>
                  <input
                    type="text"
                    value={formData.deliveryAddress.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    className={`form-input ${errors.city ? 'border-red-500' : ''}`}
                    placeholder="Angers"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                
                <div>
                  <label className="form-label">Code postal *</label>
                  <input
                    type="text"
                    value={formData.deliveryAddress.postalCode}
                    onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                    className={`form-input ${errors.postalCode ? 'border-red-500' : ''}`}
                    placeholder="49000"
                  />
                  {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Informations de contact
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Téléphone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="06 12 34 56 78"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                
                <div className="md:col-span-2">
                  <label className="form-label">Notes pour le livreur (optionnel)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="form-textarea"
                    rows={3}
                    placeholder="Instructions spéciales, code d'accès, etc."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Mode de paiement
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9z" />
                    </svg>
                    <span className="font-medium">Carte bancaire</span>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm5 3a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    </svg>
                    <span className="font-medium">Paiement à la livraison</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Récapitulatif de commande */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <div className="card-body">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Récapitulatif de commande
              </h2>

              {/* Articles */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × {item.unitPrice.toFixed(2)}€
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      {item.totalPrice.toFixed(2)}€
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais de livraison</span>
                  <span className="font-medium">{deliveryFee.toFixed(2)}€</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {grandTotal.toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>

              {/* Bouton de commande */}
              <button
                onClick={handleSubmitOrder}
                disabled={orderLoading}
                className="btn-primary w-full"
              >
                {orderLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement...
                  </div>
                ) : (
                  'Confirmer la commande'
                )}
              </button>

              {/* Informations sécurité */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Paiement sécurisé
                    </h4>
                    <p className="text-sm text-gray-600">
                      Vos données sont protégées et chiffrées
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

export default CheckoutPage