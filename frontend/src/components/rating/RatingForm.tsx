import React, { useState } from 'react'
import { useAppDispatch } from '../../hooks/redux'
import { createRating, updateRating } from '../../store/slices/ratingSlice'
import { Rating, RatingFormData } from '../../types'
import StarRating from './StarRating'
import { Modal } from '../ui'

interface RatingFormProps {
  isOpen: boolean
  onClose: () => void
  rateableType: 'Commerce' | 'Product'
  rateableId: number
  rateableName: string
  existingRating?: Rating
  orderId?: number
}

const RatingForm: React.FC<RatingFormProps> = ({
  isOpen,
  onClose,
  rateableType,
  rateableId,
  rateableName,
  existingRating,
  orderId
}) => {
  const dispatch = useAppDispatch()
  const [formData, setFormData] = useState({
    rating: existingRating?.rating || 0,
    comment: existingRating?.comment || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!existingRating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.rating === 0) {
      setError('Veuillez sélectionner une note')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (isEditing) {
        await dispatch(updateRating({
          id: existingRating.id,
          rating: formData.rating,
          comment: formData.comment
        })).unwrap()
      } else {
        const ratingData: RatingFormData = {
          rating: formData.rating,
          comment: formData.comment,
          rateableType,
          rateableId,
          orderId
        }
        await dispatch(createRating(ratingData)).unwrap()
      }
      
      onClose()
      setFormData({ rating: 0, comment: '' })
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setError('')
    if (!isEditing) {
      setFormData({ rating: 0, comment: '' })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Modifier mon évaluation' : 'Évaluer'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations sur l'objet évalué */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {rateableType === 'Commerce' ? '🏪' : '📦'}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{rateableName}</h3>
              <p className="text-sm text-gray-600">
                {rateableType === 'Commerce' ? 'Commerce' : 'Produit'}
              </p>
            </div>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Votre note *
          </label>
          <div className="flex items-center space-x-4">
            <StarRating
              rating={formData.rating}
              interactive
              onChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
              size="lg"
            />
            <span className="text-sm text-gray-600">
              {formData.rating > 0 ? `${formData.rating}/5` : 'Cliquez pour noter'}
            </span>
          </div>
        </div>

        {/* Commentaire */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Votre avis (optionnel)
          </label>
          <textarea
            id="comment"
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            rows={4}
            maxLength={1000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            placeholder="Partagez votre expérience avec les autres utilisateurs..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.comment.length}/1000 caractères
          </p>
        </div>

        {/* Informations sur la vérification */}
        {orderId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-green-700">
                Cette évaluation sera marquée comme vérifiée (achat confirmé)
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || formData.rating === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Envoi...</span>
              </div>
            ) : (
              isEditing ? 'Mettre à jour' : 'Publier l\'évaluation'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default RatingForm