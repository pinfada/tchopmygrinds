import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  createdAt: number
}

interface NotificationState {
  notifications: Notification[]
}

const initialState: NotificationState = {
  notifications: []
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'createdAt'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        duration: action.payload.duration || 5000
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearAllNotifications: (state) => {
      state.notifications = []
    }
  }
})

// Actions de convenance pour différents types
export const showSuccess = (title: string, message?: string, duration?: number) => 
  notificationSlice.actions.addNotification({ type: 'success', title, message, duration })

export const showError = (title: string, message?: string, duration?: number) => 
  notificationSlice.actions.addNotification({ type: 'error', title, message, duration: duration || 8000 })

export const showWarning = (title: string, message?: string, duration?: number) => 
  notificationSlice.actions.addNotification({ type: 'warning', title, message, duration })

export const showInfo = (title: string, message?: string, duration?: number) => 
  notificationSlice.actions.addNotification({ type: 'info', title, message, duration })

export const { addNotification, removeNotification, clearAllNotifications } = notificationSlice.actions
export default notificationSlice.reducer