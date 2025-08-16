import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchUnreadCount, selectUnreadCount } from '../../store/slices/messageSlice';

interface MessageNotificationBadgeProps {
  className?: string;
  showText?: boolean;
}

const MessageNotificationBadge: React.FC<MessageNotificationBadgeProps> = ({
  className = '',
  showText = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const unreadCount = useSelector(selectUnreadCount);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUnreadCount());
      
      // Polling pour les notifications en temps réel (toutes les 30 secondes)
      const interval = setInterval(() => {
        dispatch(fetchUnreadCount());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated || unreadCount === 0) {
    return (
      <Link
        to="/messages"
        className={`inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors ${className}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        {showText && <span>Messages</span>}
      </Link>
    );
  }

  return (
    <Link
      to="/messages"
      className={`inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors relative ${className}`}
    >
      <div className="relative">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
      {showText && (
        <span className="flex items-center gap-1">
          Messages
          <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium">
            {unreadCount}
          </span>
        </span>
      )}
    </Link>
  );
};

export default MessageNotificationBadge;