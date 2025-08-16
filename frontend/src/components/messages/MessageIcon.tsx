import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchUnreadCount, selectUnreadCount } from '../../store/slices/messageSlice';

interface MessageIconProps {
  className?: string;
}

const MessageIcon: React.FC<MessageIconProps> = ({ className = '' }) => {
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

  return (
    <div className={`relative ${className}`}>
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
  );
};

export default MessageIcon;