import { useEffect } from 'react'
import { useAppDispatch } from '../hooks/redux'
import { removeNotification, type Notification } from '../store/slices/notificationSlice'

interface NotificationToastProps {
  notification: Notification
}

const NotificationToast = ({ notification }: NotificationToastProps) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notification.id))
      }, notification.duration)

      return () => clearTimeout(timer)
    }
  }, [notification.id, notification.duration, dispatch])

  const handleClose = () => {
    dispatch(removeNotification(notification.id))
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  const getStyles = () => {
    const baseStyles = "relative flex items-start p-4 mb-4 rounded-lg shadow-lg border-l-4 bg-white"
    
    switch (notification.type) {
      case 'success':
        return `${baseStyles} border-green-400`
      case 'error':
        return `${baseStyles} border-red-400`
      case 'warning':
        return `${baseStyles} border-yellow-400`
      case 'info':
        return `${baseStyles} border-blue-400`
      default:
        return `${baseStyles} border-gray-400`
    }
  }

  return (
    <div className={`${getStyles()} animate-slide-up`}>
      <div className="flex-shrink-0 mr-3 pt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 mb-1">
          {notification.title}
        </h4>
        {notification.message && (
          <p className="text-sm text-gray-600">
            {notification.message}
          </p>
        )}
      </div>
      
      <button
        onClick={handleClose}
        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar pour duration */}
      {notification.duration && notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div 
            className={`h-full ${
              notification.type === 'success' ? 'bg-green-400' :
              notification.type === 'error' ? 'bg-red-400' :
              notification.type === 'warning' ? 'bg-yellow-400' :
              'bg-blue-400'
            } transition-all ease-linear`}
            style={{
              animation: `shrinkProgress ${notification.duration}ms linear forwards`
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrinkProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

export default NotificationToast