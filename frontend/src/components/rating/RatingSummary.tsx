import React from 'react'
import { RatingStats } from '../../types'
import StarRating from './StarRating'

interface RatingSummaryProps {
  stats: RatingStats
  size?: 'sm' | 'md' | 'lg'
  showDistribution?: boolean
  className?: string
}

const RatingSummary: React.FC<RatingSummaryProps> = ({
  stats,
  size = 'md',
  showDistribution = true,
  className = ''
}) => {
  const sizeConfig = {
    sm: {
      starSize: 'sm' as const,
      textSize: 'text-sm',
      titleSize: 'text-base',
      spacing: 'space-y-2'
    },
    md: {
      starSize: 'md' as const,
      textSize: 'text-base',
      titleSize: 'text-lg',
      spacing: 'space-y-3'
    },
    lg: {
      starSize: 'lg' as const,
      textSize: 'text-lg',
      titleSize: 'text-xl',
      spacing: 'space-y-4'
    }
  }

  const config = sizeConfig[size]

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'Excellent'
    if (rating >= 4) return 'Très bien'
    if (rating >= 3.5) return 'Bien'
    if (rating >= 3) return 'Correct'
    if (rating >= 2) return 'Médiocre'
    return 'Mauvais'
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4) return 'text-green-500'
    if (rating >= 3.5) return 'text-yellow-500'
    if (rating >= 3) return 'text-yellow-600'
    if (rating >= 2) return 'text-orange-500'
    return 'text-red-500'
  }

  if (stats.totalRatings === 0) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-gray-400 text-2xl mb-2">⭐</div>
        <p className="text-gray-500 text-sm">Aucune évaluation</p>
      </div>
    )
  }

  return (
    <div className={`${config.spacing} ${className}`}>
      {/* Note moyenne */}
      <div className="flex items-center space-x-3">
        <div className="text-center">
          <div className={`font-bold ${config.titleSize} ${getRatingColor(stats.averageRating)}`}>
            {stats.averageRating.toFixed(1)}
          </div>
          <StarRating rating={stats.averageRating} size={config.starSize} />
        </div>
        
        <div>
          <div className={`font-medium ${getRatingColor(stats.averageRating)}`}>
            {getRatingLabel(stats.averageRating)}
          </div>
          <div className={`text-gray-600 ${config.textSize}`}>
            {stats.totalRatings} avis
            {stats.verifiedRatings > 0 && (
              <span className="ml-2 text-green-600">
                ({stats.verifiedRatings} vérifiés)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Distribution des notes */}
      {showDistribution && Object.keys(stats.distribution).length > 0 && (
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(star => {
            const count = stats.distribution[star.toString()] || 0
            const percentage = stats.totalRatings > 0 
              ? (count / stats.totalRatings) * 100 
              : 0
            
            return (
              <div key={star} className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1 w-12">
                  <span>{star}</span>
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="w-8 text-right text-gray-600">
                  {count}
                </div>
                
                <div className="w-12 text-right text-gray-500 text-xs">
                  {percentage.toFixed(0)}%
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Badge de confiance */}
      {stats.verifiedRatings / stats.totalRatings >= 0.5 && (
        <div className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Avis de confiance</span>
        </div>
      )}
    </div>
  )
}

export default RatingSummary