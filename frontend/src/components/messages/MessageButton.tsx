import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store/store';
import { startConversation, type StartConversationData } from '../../store/slices/messageSlice';

interface MessageButtonProps {
  receiverId: number;
  receiverName: string;
  productId?: number;
  commerceId?: number;
  variant?: 'primary' | 'secondary' | 'minimal';
  className?: string;
  children?: React.ReactNode;
}

const MessageButton: React.FC<MessageButtonProps> = ({
  receiverId,
  receiverName,
  productId,
  commerceId,
  variant = 'primary',
  className = '',
  children
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleStartConversation = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.id === receiverId) {
      // Ne pas permettre d'envoyer un message à soi-même
      return;
    }

    try {
      const data: StartConversationData = { receiver_id: receiverId };
      const result = await dispatch(startConversation(data)).unwrap();
      
      // Rediriger vers la page de messages avec l'ID de conversation
      navigate(`/messages/${result.conversation_id}`);
    } catch (error) {
      console.error('Erreur lors du démarrage de la conversation:', error);
    }
  };

  if (!user || user.id === receiverId) {
    return null;
  }

  const baseClasses = "inline-flex items-center gap-2 transition-colors font-medium";
  
  const variantClasses = {
    primary: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700",
    secondary: "px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200",
    minimal: "text-red-600 hover:text-red-700 underline-offset-2 hover:underline"
  };

  return (
    <button
      onClick={handleStartConversation}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      title={`Envoyer un message à ${receiverName}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      {children || 'Message'}
    </button>
  );
};

export default MessageButton;