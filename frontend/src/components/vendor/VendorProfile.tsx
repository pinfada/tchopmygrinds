import React, { useState } from 'react'
import { useAppDispatch } from '../../hooks/redux'
import { Commerce, User } from '../../types'

interface VendorProfileProps {
  commerce: Commerce | null
  user: User | null
}

interface CommerceFormData {
  name: string
  description: string
  adress1: string
  ville: string
  phone: string
  email: string
  category: string
}

const VendorProfile: React.FC<VendorProfileProps> = ({ commerce, user }) => {
  const dispatch = useAppDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'settings' | 'hours'>('info')

  const [formData, setFormData] = useState<CommerceFormData>({
    name: commerce?.name || '',
    description: commerce?.description || '',
    adress1: commerce?.adress1 || '',
    ville: commerce?.ville || '',
    phone: commerce?.phone || '',
    email: commerce?.email || '',
    category: commerce?.category || ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log('Updating commerce:', formData)
      // TODO: Dispatch update action
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating commerce:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: commerce?.name || '',
      description: commerce?.description || '',
      adress1: commerce?.adress1 || '',
      ville: commerce?.ville || '',
      phone: commerce?.phone || '',
      email: commerce?.email || '',
      category: commerce?.category || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              {user?.role === 'itinerant' ? '🚛' : '🏪'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {commerce?.name || 'Mon commerce'}
              </h1>
              <p className="text-gray-600">
                Commerce {user?.role === 'itinerant' ? 'itinérant' : 'sédentaire'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {commerce?.isVerified && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-green-600">Vérifié</span>
              </div>
            )}
            
            {user?.role === 'itinerant' && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-600">En ligne</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'info', label: 'ℹ️ Informations', icon: 'ℹ️' },
              { id: 'settings', label: '⚙️ Paramètres', icon: '⚙️' },
              { id: 'hours', label: '🕐 Horaires', icon: '🕐' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Informations */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Informations du commerce</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
                  >
                    ✏️ Modifier
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Sauvegarder
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du commerce *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Sélectionner une catégorie</option>
                        <option value="Fruits et légumes">Fruits et légumes</option>
                        <option value="Épicerie">Épicerie</option>
                        <option value="Boucherie">Boucherie</option>
                        <option value="Poissonnerie">Poissonnerie</option>
                        <option value="Boulangerie">Boulangerie</option>
                        <option value="Restauration">Restauration</option>
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
                      placeholder="Décrivez votre commerce, vos spécialités..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="adress1" className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse
                      </label>
                      <input
                        type="text"
                        id="adress1"
                        name="adress1"
                        value={formData.adress1}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        id="ville"
                        name="ville"
                        value={formData.ville}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Nom du commerce</h3>
                      <p className="text-lg text-gray-900">{commerce?.name || 'Non renseigné'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Catégorie</h3>
                      <p className="text-lg text-gray-900">
                        {commerce?.category ? (
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                            {commerce.category}
                          </span>
                        ) : (
                          'Non renseignée'
                        )}
                      </p>
                    </div>
                  </div>

                  {commerce?.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Description</h3>
                      <p className="text-gray-900">{commerce.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Adresse</h3>
                      <p className="text-gray-900">{commerce?.adress1 || 'Non renseignée'}</p>
                      {commerce?.ville && <p className="text-gray-600">{commerce.ville}</p>}
                    </div>

                    <div className="space-y-4">
                      {commerce?.phone && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-600 mb-1">Téléphone</h3>
                          <p className="text-gray-900">{commerce.phone}</p>
                        </div>
                      )}

                      {commerce?.email && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-600 mb-1">Email</h3>
                          <p className="text-gray-900">{commerce.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Paramètres */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Paramètres</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Notifications par email</h3>
                    <p className="text-sm text-gray-600">Recevoir les notifications de nouvelles commandes</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    defaultChecked
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Visibilité du commerce</h3>
                    <p className="text-sm text-gray-600">Afficher mon commerce sur la carte</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    defaultChecked
                  />
                </div>

                {user?.role === 'itinerant' && (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Suivi GPS</h3>
                      <p className="text-sm text-gray-600">Partager ma position en temps réel</p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Accepter les nouveaux clients</h3>
                    <p className="text-sm text-gray-600">Autoriser de nouveaux clients à commander</p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    defaultChecked
                  />
                </div>
              </div>
            </div>
          )}

          {/* Horaires */}
          {activeTab === 'hours' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Horaires d'ouverture</h2>
              
              <div className="space-y-4">
                {[
                  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
                ].map((day) => (
                  <div key={day} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-20">
                      <span className="font-medium text-gray-900">{day}</span>
                    </div>
                    
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      defaultChecked={day !== 'Dimanche'}
                    />
                    
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Ouverture</label>
                        <input
                          type="time"
                          defaultValue="08:00"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Fermeture</label>
                        <input
                          type="time"
                          defaultValue="18:00"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <button className="w-full md:w-auto px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700">
                  Sauvegarder les horaires
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VendorProfile