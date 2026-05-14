interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

const Logo = ({ size = 'md', className = '' }: LogoProps) => (
  <img
    src="/android-chrome-192x192.png"
    alt="TchopMyGrinds"
    width={192}
    height={192}
    decoding="async"
    loading="eager"
    className={`${sizeClasses[size]} object-contain ${className}`}
  />
)

export default Logo
