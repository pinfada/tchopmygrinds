import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { 
  fetchRatings, 
  markRatingHelpful, 
  deleteRating, 
  clearRatings 
} from '../../store/slices/ratingSlice'
import { Rating } from '../../types'
import StarRating from './StarRating'
import RatingForm from './RatingForm'

interface RatingsListProps {
  rateableType: 'Commerce' | 'Product'
  rateableId: number
  rateableName: string
  showAddButton?: boolean
  maxHeight?: string
}

const RatingsList: React.FC<RatingsListProps> = ({
  rateableType,
  rateableId,
  rateableName,
  showAddButton = true,
  maxHeight = '600px'
}) => {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  const { ratings, currentRatingStats, loading } = useAppSelector(state => state.rating)
  
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [editingRating, setEditingRating] = useState<Rating | null>(null)
  const [filterVerified, setFilterVerified] = useState<boolean | undefined>(undefined)

  // Charger les évaluations
  useEffect(() => {
    dispatch(fetchRatings({ 
      rateableType, 
      rateableId, 
      verified: filterVerified 
    }))

    return () => {
      dispatch(clearRatings())
    }
  }, [dispatch, rateableType, rateableId, filterVerified])

  const handleMarkHelpful = (ratingId: number) => {
    if (!isAuthenticated) return
    dispatch(markRatingHelpful(ratingId))
  }

  const handleDelete = async (ratingId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      await dispatch(deleteRating(ratingId))
    }
  }

  const handleEdit = (rating: Rating) => {
    setEditingRating(rating)
    setShowRatingForm(true)
  }

  const handleCloseForm = () => {
    setShowRatingForm(false)
    setEditingRating(null)
  }

  const userRating = ratings.find(r => r.user.id === user?.id)
  const canAddRating = isAuthenticated && !userRating && showAddButton

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Aujourd\'hui'
    if (diffInDays === 1) return 'Hier'
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`
    return formatDate(dateString)
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      {currentRatingStats && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Évaluations des clients
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <StarRating rating={currentRatingStats.averageRating} size="md" />
                  <span className="text-xl font-bold text-gray-900">
                    {currentRatingStats.averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  ({currentRatingStats.totalRatings} avis)
                </div>
                {currentRatingStats.verifiedRatings > 0 && (
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{currentRatingStats.verifiedRatings} vérifiés</span>
                  </div>
                )}
              </div>
            </div>
            
            {canAddRating && (
              <button
                onClick={() => setShowRatingForm(true)}
                className="mt-4 md:mt-0 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ⭐ Laisser un avis
              </button>
            )}
          </div>

          {/* Distribution des notes */}
          {Object.keys(currentRatingStats.distribution).length > 0 && (
            <div className="grid grid-cols-5 gap-2 text-xs">
              {[5, 4, 3, 2, 1].map(star => {
                const count = currentRatingStats.distribution[star] || 0
                const percentage = currentRatingStats.totalRatings > 0 
                  ? (count / currentRatingStats.totalRatings) * 100 
                  : 0
                
                return (
                  <div key={star} className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1">
                      <span>{star}</span>
                      <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-gray-600">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Filtres */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterVerified(undefined)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filterVerified === undefined
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous les avis
          </button>
          <button
            onClick={() => setFilterVerified(true)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filterVerified === true
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ✓ Vérifiés uniquement
          </button>
        </div>
      </div>

      {/* Liste des évaluations */}
      <div className="space-y-4" style={{ maxHeight, overflowY: 'auto' }}>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-2">Chargement des avis...</p>
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun avis pour le moment
            </h3>
            <p className="text-gray-600">
              Soyez le premier à partager votre expérience !
            </p>
          </div>
        ) : (
          ratings.map((rating) => (
            <div key={rating.id} className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Header de l'avis */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-700">
                      {rating.user.initials}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{rating.user.name}</h4>
                      {rating.verified && (
                        <div className="flex items-center space-x-1 text-xs text-green-600">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Achat vérifié</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <StarRating rating={rating.rating} size="sm" />
                      <span className="text-sm text-gray-500">
                        {getTimeAgo(rating.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions pour l'utilisateur propriétaire */}
                {user?.id === rating.user.id && (
                  <div className="flex items-center space-x-2">
                    {rating.canEdit && (
                      <button
                        onClick={() => handleEdit(rating)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Modifier
                      </button>
                    )}
                    {rating.canDelete && (
                      <button
                        onClick={() => handleDelete(rating.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Commentaire */}
              {rating.comment && (
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">{rating.comment}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleMarkHelpful(rating.id)}
                  disabled={!isAuthenticated || user?.id === rating.user.id}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  <span>Utile ({rating.helpfulCount})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de création/modification d'avis */}
      <RatingForm
        isOpen={showRatingForm}
        onClose={handleCloseForm}
        rateableType={rateableType}
        rateableId={rateableId}
        rateableName={rateableName}
        existingRating={editingRating || undefined}
      />
    </div>
  )
}

export default RatingsList