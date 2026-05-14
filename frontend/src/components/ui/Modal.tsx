import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
}

const Modal = ({ isOpen, onClose, title, size = 'lg', children }: ModalProps) => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    onClose()
    navigate('/')
  }

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
    full: 'sm:max-w-7xl sm:w-full',
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative flex min-h-full sm:items-center sm:justify-center sm:p-4">
        <div
          className={`relative flex flex-col bg-white shadow-2xl w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:rounded-xl overflow-hidden z-[10000] ${sizeClasses[size]}`}
        >
          <div
            className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50"
            style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
          >
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">{title}</h2>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
