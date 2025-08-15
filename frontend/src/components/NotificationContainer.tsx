import { useAppSelector } from '../hooks/redux'
import NotificationToast from './NotificationToast'

const NotificationContainer = () => {
  const notifications = useAppSelector((state) => state.notification.notifications)

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-4 space-y-2 z-50 max-w-sm">
      {notifications.map((notification) => (
        <NotificationToast key={notification.id} notification={notification} />
      ))}
    </div>
  )
}

export default NotificationContainer