import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { useAddToCart } from '../hooks/useAddToCart'
import { fetchProducts, searchProducts, setSortBy } from '../store/slices/productSlice'
import { getCurrentLocation } from '../store/slices/locationSlice'
import { startConversation } from '../store/slices/messageSlice'
import { useSeo, breadcrumbsJsonLd } from '../hooks/useSeo'
import { formatPrice } from '../utils/format'
import type { Product } from '../types'

const ProductsPage = () => {
  useSeo({
    title: 'Produits frais — TchopMyGrinds',
    description:
      "Parcourez le catalogue des produits disponibles chez les commerçants locaux : bananes plantain, fruits, légumes, tubercules et épices. Achetez en circuit court.",
    canonicalPath: '/products',
    ogType: 'website',
    jsonLd: breadcrumbsJsonLd([
      { name: 'Accueil', path: '/' },
      { name: 'Produits', path: '/products' },
    ]),
  })

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { products, loading, sortBy } = useAppSelector((state) => state.product)
  const { currentLocation } = useAppSelector((state) => state.location)
  const { user } = useAppSelector((state) => state.auth)
  const [contactingId, setContactingId] = useState<number | null>(null)

  const handleContactMerchant = async (product: Product) => {
    // The product card only knows the merchant via product.commerce.userId,
    // which the API now exposes alongside id/name/address/rating.
    const merchantUserId = product.commerce?.userId
    if (!merchantUserId) return

    if (!user) {
      // Send anonymous buyers through the sign-in flow first.
      navigate('/auth')
      return
    }
    // A merchant viewing their own product shouldn't be able to message themselves.
    if (user.id === merchantUserId) return

    const draft =
      `Bonjour, je suis interesse(e) par "${product.name}"` +
      (product.price ? ` a ${formatPrice(product.price, product.currency)}/${product.unit || 'unite'}` : '') +
      `. Est-il disponible ?`

    setContactingId(product.id)
    try {
      const result = await dispatch(
        startConversation({ receiver_id: merchantUserId })
      ).unwrap()
      const conversationId = (result as { conversation_id?: string })?.conversation_id
      // The MessagesPage reads `location.state.draft` on mount and prefills the
      // composer. If the conversation id isn't returned we still navigate to
      // /messages so the user lands somewhere useful instead of dead-clicking.
      const target = conversationId ? `/messages/${conversationId}` : '/messages'
      navigate(target, {
        state: {
          draft,
          productId: product.id,
          commerceId: product.commerce?.id,
        },
      })
    } catch {
      navigate('/messages')
    } finally {
      setContactingId(null)
    }
  }
  
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

  const [searchParams] = useSearchParams()
  // /products?commerce=N filters the catalog by a specific shop. The query
  // param is the commerce id; the API client maps it to commerce_id.
  const commerceIdParam = searchParams.get('commerce')
  const commerceIdFilter = commerceIdParam ? Number(commerceIdParam) : undefined

  useEffect(() => {
    dispatch(fetchProducts({
      commerceId: Number.isFinite(commerceIdFilter) ? commerceIdFilter : undefined,
      location: currentLocation || undefined,
    }))
  }, [currentLocation, dispatch, commerceIdFilter])

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

  const addToCartWithGuard = useAddToCart()
  const handleAddToCart = (product: any) => {
    addToCartWithGuard(product, 1)
  }

  const handleLocationRequest = () => {
    dispatch(getCurrentLocation())
  }

  // Filtrer localement les produits
  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    if (selectedCategory && selectedCategory !== 'Tous' && product.category !== selectedCategory) {
      return false
    }
    if (minPrice && product.price && product.price < Number(minPrice)) {
      return false
    }
    if (maxPrice && product.price && product.price > Number(maxPrice)) {
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
                <div className="h-48 bg-gradient-to-br from-brand-100 to-brand-100 rounded-t-xl flex items-center justify-center relative">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-t-xl"
                    />
                  ) : (
                    <svg className="w-16 h-16 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <span className="text-2xl font-bold text-brand-600">
                        {formatPrice(product.price, product.currency)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        / {product.unit || 'unité'}
                      </span>
                    </div>
                    
                    {product.commerce && (
                      <div className="text-sm text-gray-600 space-y-0.5">
                        <Link
                          to={`/commerces/${product.commerce.id}`}
                          className="flex items-center font-medium text-brand-700 hover:text-brand-900 hover:underline"
                        >
                          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="truncate">{product.commerce.name}</span>
                        </Link>
                        {(product.commerce.address || product.commerce.adress1) && (
                          <div className="text-xs text-gray-500 pl-5 truncate">
                            {product.commerce.address || product.commerce.adress1}
                          </div>
                        )}
                        <div className="flex items-center gap-3 pl-5 text-xs text-gray-500">
                          {typeof product.commerce.rating === 'number' && product.commerce.rating > 0 && (
                            <span className="inline-flex items-center">
                              <svg className="w-3 h-3 text-accent-500 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {product.commerce.rating.toFixed(1)}
                            </span>
                          )}
                          {typeof product.commerce.distance === 'number' && (
                            <span>{product.commerce.distance.toFixed(1)} km</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-brand-600 font-medium">
                        {product.category || 'Non catégorisé'}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stock: {product.stock || 0}
                      </span>
                    </div>
                    
                    {product.commerce?.userId && user?.id !== product.commerce.userId && (
                      <button
                        onClick={() => handleContactMerchant(product)}
                        disabled={contactingId === product.id}
                        className="w-full py-1.5 px-4 text-sm rounded-lg font-medium border border-brand-100 text-brand-700 hover:bg-brand-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {contactingId === product.id ? 'Ouverture…' : (user ? 'Contacter' : 'Contacter (connexion)')}
                      </button>
                    )}

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.isAvailable || (product.stock || 0) === 0}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        product.isAvailable && (product.stock || 0) > 0
                          ? 'bg-brand-500 text-white hover:bg-brand-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {!product.isAvailable ? 'Indisponible' :
                       (product.stock || 0) === 0 ? 'Rupture de stock' :
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