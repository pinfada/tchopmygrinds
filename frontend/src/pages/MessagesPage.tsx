import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store/store';
import { 
  fetchConversations, 
  fetchMessages, 
  sendMessage, 
  clearError,
  setCurrentConversationId,
  type CreateMessageData,
  type Conversation,
  type Message
} from '../store/slices/messageSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MessageTestPanel from '../components/messages/MessageTestPanel';

const MessagesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  
  const {
    conversations,
    currentConversation,
    loading,
    error,
    sendingMessage,
    unreadCount
  } = useSelector((state: RootState) => state.message);
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (conversationId) {
      setSelectedConversation(conversationId);
      dispatch(setCurrentConversationId(conversationId));
      dispatch(fetchMessages({ conversation_id: conversationId }));
    }
  }, [conversationId, dispatch]);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation.conversation_id);
    dispatch(setCurrentConversationId(conversation.conversation_id));
    dispatch(fetchMessages({ conversation_id: conversation.conversation_id }));
    navigate(`/messages/${conversation.conversation_id}`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageContent.trim() || !selectedConversation) return;

    const currentConv = conversations.find(c => c.conversation_id === selectedConversation);
    if (!currentConv) return;

    const messageData: CreateMessageData = {
      content: newMessageContent.trim(),
      receiver_id: currentConv.partner.id,
      message_type: 'general'
    };

    try {
      await dispatch(sendMessage(messageData)).unwrap();
      setNewMessageContent('');
      // Rafraîchir la conversation
      dispatch(fetchMessages({ conversation_id: selectedConversation }));
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.last_message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString('fr-FR');
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">💬 Messages</h1>
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount > 0 && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Retour
            </button>
          </div>
          {import.meta.env.DEV && <MessageTestPanel />}
        </div>

        <div className="flex h-[calc(100vh-120px)]">
          {/* Liste des conversations */}
          <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {error && (
                <div className="p-4 text-red-600 text-sm bg-red-50 border-b border-red-200">
                  {error}
                  <button
                    onClick={() => dispatch(clearError())}
                    className="ml-2 text-red-800 hover:text-red-900"
                  >
                    ✕
                  </button>
                </div>
              )}

              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <div className="text-4xl mb-2">💬</div>
                  <p>Aucune conversation trouvée</p>
                  <p className="text-sm mt-1">
                    Les conversations apparaîtront ici quand vous échangerez avec d'autres utilisateurs.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.conversation_id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation === conversation.conversation_id
                          ? 'bg-red-50 border-r-2 border-red-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                              {conversation.partner.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {conversation.partner.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {conversation.partner.role === 'itinerant' ? '🚚 Ambulant' :
                                 conversation.partner.role === 'sedentary' ? '🏪 Sédentaire' : '👤 Client'}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 truncate">
                            <span className="font-medium">
                              {conversation.last_message.sender_name}:
                            </span>{' '}
                            {conversation.last_message.content}
                          </p>
                          {conversation.product && (
                            <p className="text-xs text-blue-600 mt-1">
                              🛍️ {conversation.product.name}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.last_message.created_at)}
                          </span>
                          {conversation.unread_count > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Zone de conversation */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* En-tête de conversation */}
                <div className="bg-white border-b border-gray-200 p-4">
                  {(() => {
                    const conv = conversations.find(c => c.conversation_id === selectedConversation);
                    return conv ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-medium">
                          {conv.partner.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{conv.partner.name}</h3>
                          <p className="text-sm text-gray-500">{conv.partner.email}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentConversation.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <div className="text-4xl mb-2">💬</div>
                      <p>Aucun message dans cette conversation</p>
                    </div>
                  ) : (
                    [...currentConversation].reverse().map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender.id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender.id === user?.id
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          {message.subject && (
                            <p className="font-medium text-sm mb-1">{message.subject}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          {message.product && (
                            <div className="mt-2 p-2 bg-black bg-opacity-10 rounded text-xs">
                              🛍️ {message.product.name} - {message.product.unitprice} FCFA
                            </div>
                          )}
                          <p className="text-xs mt-1 opacity-75">
                            {message.formatted_time}
                            {message.sender.id === user?.id && (
                              <span className="ml-1">
                                {message.is_read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulaire d'envoi */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <textarea
                      value={newMessageContent}
                      onChange={(e) => setNewMessageContent(e.target.value)}
                      placeholder="Tapez votre message..."
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!newMessageContent.trim() || sendingMessage}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sendingMessage ? '⏳' : '📤'}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-medium mb-2">Sélectionnez une conversation</h3>
                  <p>Choisissez une conversation dans la liste pour commencer à échanger</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;