import { useAppSelector } from '../hooks/redux'
import NotificationToast from './NotificationToast'

const NotificationContainer = () => {
  const notifications = useAppSelector((state) => state.notification.notifications)

  if (notifications.length === 0) return null

  return (
    <div
      className="fixed z-[10001] flex flex-col gap-2 pointer-events-none top-4 left-4 right-4 sm:left-auto sm:top-20 sm:right-4 sm:w-full sm:max-w-sm"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationToast notification={notification} />
        </div>
      ))}
    </div>
  )
}

export default NotificationContainer
