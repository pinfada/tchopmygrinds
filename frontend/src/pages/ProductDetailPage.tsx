import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchProductById } from '../store/slices/productSlice'
import { addToCart } from '../store/slices/cartSlice'
import { ProductInterestForm } from '../components/ProductInterest'
import { Modal } from '../components/ui'
import type { Product } from '../types'

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  
  const { currentProduct: product, loading, error } = useAppSelector((state) => state.product)
  const { user } = useAppSelector((state) => state.auth)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showInterestModal, setShowInterestModal] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(Number(id)))
    }
  }, [id, dispatch])

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({ product, quantity }))
      // Optionnel: afficher une notification de succès
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity)
    }
  }

  const handleShowInterest = () => {
    if (!user) {
      // Rediriger vers la page de connexion
      window.location.href = '/auth'
      return
    }
    setShowInterestModal(true)
  }

  const handleInterestSuccess = () => {
    setShowInterestModal(false)
  }

  // Images du produit (pour l'instant une seule, mais préparé pour plusieurs)
  const productImages = product?.imageUrl ? [product.imageUrl] : []

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-20 h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Produit introuvable</h1>
        <p className="text-gray-600 mb-6">{error || 'Ce produit n\'existe pas ou a été supprimé'}</p>
        <Link to="/products" className="btn-primary">
          Retour aux produits
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/" className="text-gray-400 hover:text-gray-500">
              Accueil
            </Link>
          </li>
          <li>
            <svg className="flex-shrink-0 h-4 w-4 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>
          </li>
          <li>
            <Link to="/products" className="text-gray-400 hover:text-gray-500">
              Produits
            </Link>
          </li>
          <li>
            <svg className="flex-shrink-0 h-4 w-4 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>
          </li>
          <li>
            <span className="text-gray-500 font-medium">{product.name}</span>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images du produit */}
        <div>
          {/* Image principale */}
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
            {productImages.length > 0 ? (
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}
          </div>

          {/* Miniatures (si plusieurs images) */}
          {productImages.length > 1 && (
            <div className="flex space-x-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-1 aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-emerald-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} - vue ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informations du produit */}
        <div>
          {/* Header */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Prix */}
          <div className="mb-6">
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-gray-900">
                {product.price.toFixed(2)}€
              </span>
              <span className="text-lg text-gray-500">
                par {product.unit}
              </span>
            </div>
          </div>

          {/* Stock */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                product.stock > 10 ? 'bg-green-500' : 
                product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-900">
                {product.stock > 0 ? (
                  <>
                    {product.stock} {product.unit}{product.stock > 1 ? 's' : ''} en stock
                    {product.stock <= 5 && (
                      <span className="text-orange-600 ml-2">(Stock faible)</span>
                    )}
                  </>
                ) : (
                  <span className="text-red-600">Rupture de stock</span>
                )}
              </span>
            </div>
          </div>

          {/* Commerce */}
          {product.commerce && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Vendu par</h3>
              <Link 
                to={`/commerces/${product.commerce.id}`}
                className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-medium text-lg">
                    {product.commerce.name[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{product.commerce.name}</h4>
                    {product.commerce.isVerified && (
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{product.commerce.category}</p>
                  {product.commerce.distance && (
                    <p className="text-sm text-emerald-600 font-medium">
                      {product.commerce.distance.toFixed(1)} km
                    </p>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          {/* Sélecteur de quantité et ajout au panier */}
          {product.stock > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Quantité
              </label>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="px-4 py-2 text-lg font-medium text-gray-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.unit} disponible{product.stock > 1 ? 's' : ''}
                </span>
              </div>

              {/* Prix total */}
              <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Prix total</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {(product.price * quantity).toFixed(2)}€
                  </span>
                </div>
              </div>

              {/* Bouton d'ajout au panier */}
              <button
                onClick={handleAddToCart}
                className="w-full btn-primary text-lg py-3"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                Ajouter au panier
              </button>
            </div>
          )}

          {/* Manifestation d'intérêt pour produits en rupture de stock */}
          {product.stock === 0 && (
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <h4 className="text-yellow-800 font-medium">Produit en rupture de stock</h4>
                </div>
                <p className="text-yellow-700 text-sm mb-3">
                  Ce produit n'est actuellement pas disponible. Manifestez votre intérêt et nous vous notifierons dès qu'il sera à nouveau en stock près de vous !
                </p>
                <button
                  onClick={handleShowInterest}
                  className="w-full bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-9a4 4 0 118 0v9z" />
                  </svg>
                  🔔 Me notifier quand disponible
                </button>
              </div>
            </div>
          )}

          {/* Informations supplémentaires */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations produit</h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Catégorie</dt>
                <dd className="text-sm font-medium text-gray-900">{product.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Unité de vente</dt>
                <dd className="text-sm font-medium text-gray-900">{product.unit}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Disponibilité</dt>
                <dd className={`text-sm font-medium ${product.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {product.isAvailable ? 'Disponible' : 'Non disponible'}
                </dd>
              </div>
              {product.createdAt && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Ajouté le</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Modal pour manifestation d'intérêt */}
      <Modal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        title="Manifestation d'intérêt"
        size="md"
      >
        <ProductInterestForm
          initialProductName={product?.name || ''}
          onSuccess={handleInterestSuccess}
          onCancel={() => setShowInterestModal(false)}
        />
      </Modal>
    </div>
  )
}

export default ProductDetailPage