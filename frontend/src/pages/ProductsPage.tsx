import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchProducts, searchProducts, setSortBy } from '../store/slices/productSlice'
import { addToCart } from '../store/slices/cartSlice'
import { getCurrentLocation } from '../store/slices/locationSlice'

const ProductsPage = () => {
  const dispatch = useAppDispatch()
  const { products, loading, sortBy } = useAppSelector((state) => state.product)
  const { currentLocation } = useAppSelector((state) => state.location)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const categories = [
    'Tous',
    'Bananes plantain',
    'Fruits locaux',
    'Légumes frais',
    'Épices',
    'Céréales',
    'Tubercules'
  ]

  useEffect(() => {
    // Charger les produits au montage
    if (currentLocation) {
      dispatch(fetchProducts({ location: currentLocation || undefined }))
    } else {
      dispatch(fetchProducts())
    }
  }, [currentLocation, dispatch])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchProducts({
        query: searchQuery,
        location: currentLocation || undefined,
        filters: {
          category: selectedCategory || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined
        }
      }))
    } else {
      dispatch(fetchProducts({ location: currentLocation || undefined }))
    }
  }

  const handleAddToCart = (product: any) => {
    dispatch(addToCart({ product, quantity: 1 }))
    // Notification via système global
    if ((window as any).addNotification) {
      (window as any).addNotification({
        type: 'success',
        title: 'Produit ajouté',
        message: `${product.name} a été ajouté au panier`
      })
    }
  }

  const handleLocationRequest = () => {
    dispatch(getCurrentLocation())
  }

  // Filtrer localement les produits
  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    if (selectedCategory && selectedCategory !== 'Tous' && product.category !== selectedCategory) {
      return false
    }
    if (minPrice && product.price < Number(minPrice)) {
      return false
    }
    if (maxPrice && product.price > Number(maxPrice)) {
      return false
    }
    return true
  }) : []

  return (
    <div className="p-6 space-y-6">
      {/* Description */}
      <div className="text-center">
        <p className="text-gray-600">
          {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} disponible{filteredProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Géolocalisation */}
      {!currentLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Activez la géolocalisation</h3>
                <p className="text-gray-600">Pour voir les produits les plus proches</p>
              </div>
            </div>
            <button
              onClick={handleLocationRequest}
              className="btn-primary"
            >
              Activer
            </button>
          </div>
        </div>
      )}

      {/* Recherche et filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Barre de recherche */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary px-8"
            >
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Catégorie */}
            <div>
              <label className="form-label">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-input"
              >
                {categories.map(category => (
                  <option key={category} value={category === 'Tous' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Prix min */}
            <div>
              <label className="form-label">Prix min (€)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="form-input"
                placeholder="0"
              />
            </div>

            {/* Prix max */}
            <div>
              <label className="form-label">Prix max (€)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="form-input"
                placeholder="100"
              />
            </div>

            {/* Tri */}
            <div>
              <label className="form-label">Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => dispatch(setSortBy(e.target.value as any))}
                className="form-input"
              >
                <option value="name">Nom</option>
                <option value="price">Prix</option>
                <option value="rating">Note</option>
                <option value="distance">Distance</option>
              </select>
            </div>

            {/* Réinitialiser */}
            <div className="pt-8">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('')
                  setMinPrice('')
                  setMaxPrice('')
                  dispatch(fetchProducts({ location: currentLocation || undefined }))
                }}
                className="btn-secondary w-full"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                <div className="card-body">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="card hover:shadow-xl transition-shadow duration-300">
                <div className="h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-t-xl flex items-center justify-center relative">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-t-xl"
                    />
                  ) : (
                    <svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  
                  {!product.isAvailable && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-t-xl flex items-center justify-center">
                      <span className="text-white font-semibold">Indisponible</span>
                    </div>
                  )}
                </div>
                
                <div className="card-body">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {product.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-emerald-600">
                        {product.price.toFixed(2)}€
                      </span>
                      <span className="text-gray-500 text-sm">
                        / {product.unit}
                      </span>
                    </div>
                    
                    {product.commerce && (
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="truncate">{product.commerce.name}</span>
                        </div>
                        {product.commerce.distance && (
                          <div className="text-xs text-gray-500 mt-1">
                            {product.commerce.distance.toFixed(1)} km
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-600 font-medium">
                        {product.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stock: {product.stock}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.isAvailable || product.stock === 0}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        product.isAvailable && product.stock > 0
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {!product.isAvailable ? 'Indisponible' : 
                       product.stock === 0 ? 'Rupture de stock' : 
                       'Ajouter au panier'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600 mb-4">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductsPage