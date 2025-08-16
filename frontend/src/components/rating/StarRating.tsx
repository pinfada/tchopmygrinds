import React from 'react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
  className?: string
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleStarClick = (starRating: number) => {
    if (interactive && onChange) {
      onChange(starRating)
    }
  }

  const renderStars = () => {
    const stars = []
    
    for (let i = 1; i <= maxRating; i++) {
      const filled = i <= rating
      const halfFilled = i === Math.ceil(rating) && rating % 1 !== 0
      
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)}
          disabled={!interactive}
          className={`
            ${sizeClasses[size]}
            ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
            ${filled ? 'text-yellow-400' : halfFilled ? 'text-yellow-300' : 'text-gray-300'}
            ${interactive ? 'hover:text-yellow-400' : ''}
            focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 rounded
          `}
        >
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      )
    }
    
    return stars
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center space-x-0.5">
        {renderStars()}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-2">
          {rating.toFixed(1)}/{maxRating}
        </span>
      )}
    </div>
  )
}

export default StarRating