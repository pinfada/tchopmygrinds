import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchCommerceById } from '../store/slices/commerceSlice'
import { fetchProductsByCommerce } from '../store/slices/productSlice'
import { addToCart } from '../store/slices/cartSlice'
import LeafletMap from '../components/Map/LeafletMap'
import { RatingSummary, RatingsList, RatingForm } from '../components/rating'
import { Modal } from '../components/ui'
import type { Product } from '../types'

const CommerceDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  
  const { currentCommerce, loading: commerceLoading, error } = useAppSelector((state) => state.commerce)
  const { products, loading: productsLoading } = useAppSelector((state) => state.product)
  const { currentLocation } = useAppSelector((state) => state.location)
  const { user } = useAppSelector((state) => state.auth)
  
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name')
  const [showRatingModal, setShowRatingModal] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchCommerceById(Number(id)))
      dispatch(fetchProductsByCommerce(Number(id)))
    }
  }, [id, dispatch])

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product, quantity: 1 }))
  }

  const availableProducts = Array.isArray(products) ? products.filter(p => p.isAvailable && p.stock > 0) : []
  
  const filteredProducts = Array.isArray(availableProducts) ? availableProducts.filter(product => {
    if (selectedCategory && product.category !== selectedCategory) {
      return false
    }
    return true
  }) : []

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price
      case 'stock':
        return b.stock - a.stock
      case 'name':
      default:
        return a.name.localeCompare(b.name)
    }
  })

  const categories = Array.from(new Set(availableProducts.map(p => p.category)))

  if (commerceLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !currentCommerce) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Commerce introuvable</h1>
        <p className="text-gray-600 mb-6">{error || 'Ce commerce n\'existe pas ou a été supprimé'}</p>
        <Link to="/commerces" className="btn-primary">
          Retour aux commerces
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header du commerce */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Informations principales */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {currentCommerce.name}
                    </h1>
                    {currentCommerce.isVerified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Vérifié
                      </span>
                    )}
                  </div>
                  
                  {currentCommerce.category && (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full mb-3">
                      {currentCommerce.category}
                    </span>
                  )}
                  
                  {currentCommerce.description && (
                    <p className="text-gray-600 text-lg mb-4 max-w-2xl">
                      {currentCommerce.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {currentCommerce.rating && (
                    <div className="flex items-center space-x-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-5 h-5 ${i < Math.floor(Number(currentCommerce.rating) || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {Number(currentCommerce.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  )}
                  
                  {user && (
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      ⭐ Laisser un avis
                    </button>
                  )}
                </div>
              </div>

              {/* Informations de contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {currentCommerce.adress1 || currentCommerce.address}
                </div>
                
                {currentCommerce.phone && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {currentCommerce.phone}
                  </div>
                )}
                
                {currentCommerce.email && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {currentCommerce.email}
                  </div>
                )}
                
                {currentCommerce.distance && (
                  <div className="flex items-center text-emerald-600 font-medium">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {currentCommerce.distance.toFixed(1)} km
                  </div>
                )}
              </div>
            </div>

            {/* Carte de localisation */}
            {currentCommerce.latitude && currentCommerce.longitude && (
              <div className="w-full lg:w-80 h-64 lg:h-80">
                <LeafletMap
                  center={[currentCommerce.latitude, currentCommerce.longitude]}
                  zoom={15}
                  commerces={[currentCommerce]}
                  userLocation={currentLocation}
                  height="100%"
                  className="w-full h-full rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Produits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 lg:p-8">
          {/* Header produits */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Produits disponibles
              </h2>
              <p className="text-gray-600">
                {availableProducts.length} produit{availableProducts.length !== 1 ? 's' : ''} en stock
              </p>
            </div>
            
            {/* Filtres et tri */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Toutes catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'stock')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="name">Trier par nom</option>
                <option value="price">Trier par prix</option>
                <option value="stock">Trier par stock</option>
              </select>
            </div>
          </div>

          {/* Liste des produits */}
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit disponible</h3>
              <p className="text-gray-600">
                Ce commerce n'a pas encore ajouté de produits ou tous sont en rupture de stock.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <div key={product.id} className="card hover:shadow-lg transition-shadow duration-300">
                  {/* Image produit */}
                  <div className="h-48 bg-gray-100 rounded-t-xl overflow-hidden">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-body">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                        {product.name}
                      </h3>
                      <span className="ml-2 inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                        {product.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {product.price.toFixed(2)}€
                        </div>
                        <div className="text-sm text-gray-500">
                          par {product.unit}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Stock: {product.stock}
                        </div>
                        {product.stock <= 5 && product.stock > 0 && (
                          <div className="text-xs text-orange-600 font-medium">
                            Stock faible
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section des évaluations */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Résumé des évaluations */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Avis clients</h3>
                <RatingSummary 
                  entityId={currentCommerce.id}
                  entityType="commerce"
                />
              </div>
            </div>

            {/* Liste des évaluations */}
            <div className="lg:col-span-2">
              <RatingsList 
                entityId={currentCommerce.id}
                entityType="commerce"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour évaluation */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        title="Laisser un avis sur ce commerce"
        size="md"
      >
        <RatingForm
          entityId={currentCommerce.id}
          entityType="commerce"
          onSuccess={() => setShowRatingModal(false)}
          onCancel={() => setShowRatingModal(false)}
        />
      </Modal>
    </div>
  )
}

export default CommerceDetailPage