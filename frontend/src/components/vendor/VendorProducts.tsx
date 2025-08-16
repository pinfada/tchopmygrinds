import React, { useState } from 'react'
import { useAppDispatch } from '../../hooks/redux'
import { Product, Commerce } from '../../types'
import { Modal } from '../ui'

interface VendorProductsProps {
  commerce: Commerce | null
  products: Product[]
}

interface ProductFormData {
  name: string
  description: string
  price: number
  unit: string
  category: string
  stock: number
  isAvailable: boolean
}

const VendorProducts: React.FC<VendorProductsProps> = ({ commerce, products }) => {
  const dispatch = useAppDispatch()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'out_of_stock'>('all')

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    unit: 'pièce',
    category: '',
    stock: 0,
    isAvailable: true
  })

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || product.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'available' && product.isAvailable && product.stock > 0) ||
                         (statusFilter === 'out_of_stock' && product.stock === 0)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = [...new Set(products.map(p => p.category))]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedProduct) {
        // Mise à jour
        console.log('Updating product:', selectedProduct.id, formData)
        // TODO: Dispatch update action
      } else {
        // Création
        console.log('Creating product:', formData)
        // TODO: Dispatch create action
      }
      resetForm()
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      unit: 'pièce',
      category: '',
      stock: 0,
      isAvailable: true
    })
    setSelectedProduct(null)
    setShowCreateModal(false)
    setShowEditModal(false)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      category: product.category,
      stock: product.stock,
      isAvailable: product.isAvailable
    })
    setShowEditModal(true)
  }

  const handleDelete = async (productId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        console.log('Deleting product:', productId)
        // TODO: Dispatch delete action
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const toggleAvailability = async (product: Product) => {
    try {
      console.log('Toggling availability for:', product.id)
      // TODO: Dispatch update action
    } catch (error) {
      console.error('Error updating product availability:', error)
    }
  }

  const ProductForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nom du produit *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Ex: Bananes plantains"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Sélectionner une catégorie</option>
            <option value="Fruits">Fruits</option>
            <option value="Légumes">Légumes</option>
            <option value="Épices">Épices</option>
            <option value="Poissons">Poissons</option>
            <option value="Viandes">Viandes</option>
            <option value="Autres">Autres</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Description du produit..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Prix *
          </label>
          <div className="relative">
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="0.00"
            />
            <span className="absolute right-3 top-2 text-gray-500">€</span>
          </div>
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
            Unité
          </label>
          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="pièce">pièce</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="litre">litre</option>
            <option value="paquet">paquet</option>
            <option value="botte">botte</option>
          </select>
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
            Stock *
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            min="0"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isAvailable"
          name="isAvailable"
          checked={formData.isAvailable}
          onChange={handleInputChange}
          className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
          Produit disponible à la vente
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={resetForm}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {selectedProduct ? 'Mettre à jour' : 'Créer le produit'}
        </button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">📦 Gestion des produits</h2>
            <p className="text-gray-600 mt-1">
              {products.length} produit{products.length !== 1 ? 's' : ''} dans votre catalogue
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
          >
            <span className="mr-2">➕</span>
            Nouveau produit
          </button>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="available">Disponibles</option>
              <option value="out_of_stock">Rupture de stock</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600 flex items-center">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} affiché{filteredProducts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📦</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {products.length === 0 ? 'Aucun produit' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-600 mb-4">
              {products.length === 0 
                ? 'Commencez par ajouter votre premier produit'
                : 'Aucun produit ne correspond à vos critères de recherche'
              }
            </p>
            {products.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
              >
                <span className="mr-2">➕</span>
                Ajouter un produit
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {product.name}
                      </h3>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        {product.category}
                      </span>
                      {!product.isAvailable && (
                        <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          Indisponible
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                          Rupture de stock
                        </span>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                          Stock faible
                        </span>
                      )}
                    </div>
                    
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">
                        {product.price.toFixed(2)}€ / {product.unit}
                      </span>
                      <span>Stock: {product.stock}</span>
                      <span>Ajouté le {new Date(product.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleAvailability(product)}
                      className={`p-2 rounded-lg transition-colors ${
                        product.isAvailable 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={product.isAvailable ? 'Désactiver' : 'Activer'}
                    >
                      {product.isAvailable ? '👁️' : '👁️‍🗨️'}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="➕ Nouveau produit"
        size="lg"
      >
        <ProductForm />
      </Modal>

      {/* Modal d'édition */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="✏️ Modifier le produit"
        size="lg"
      >
        <ProductForm />
      </Modal>
    </div>
  )
}

export default VendorProducts