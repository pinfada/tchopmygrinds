interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Logo = ({ size = 'md', className = '' }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg'
  }

  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg ${sizeClasses[size]} ${className}`}>
      {/* Logo vectoriel simple */}
      <svg 
        className={`${textSizes[size]} text-white font-bold`} 
        viewBox="0 0 24 24" 
        fill="currentColor"
        width="70%" 
        height="70%"
      >
        {/* Forme stylisée représentant TG avec des éléments de géolocalisation */}
        <g>
          {/* T stylisé */}
          <rect x="2" y="3" width="8" height="2" rx="1"/>
          <rect x="5" y="3" width="2" height="10" rx="1"/>
          
          {/* G stylisé avec pin de localisation */}
          <circle cx="17" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="17" cy="8" r="1.5"/>
          <path d="M17 12l-2 4h4l-2-4z"/>
          
          {/* Effet de connexion/réseau */}
          <circle cx="6" cy="18" r="1" opacity="0.7"/>
          <circle cx="10" cy="16" r="1" opacity="0.5"/>
          <circle cx="14" cy="19" r="1" opacity="0.6"/>
          <path d="M6 18l4-2m0 0l4 3" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        </g>
      </svg>
    </div>
  )
}

export default Logo