import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../services/apiClient';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Product {
  id: number;
  name: string;
  unitprice: number;
  available: boolean;
}

export interface Commerce {
  id: number;
  name: string;
  category: string;
  verified: boolean;
}

export interface Message {
  id: number;
  content: string;
  subject?: string;
  sender: User;
  receiver: User;
  product?: Product;
  commerce?: Commerce;
  message_type: 'general' | 'product_inquiry' | 'order_related' | 'support';
  conversation_id: string;
  read_at?: string;
  formatted_time: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  conversation_id: string;
  partner: User;
  last_message: {
    content: string;
    sender_name: string;
    created_at: string;
    formatted_time: string;
    is_read: boolean;
  };
  unread_count: number;
  product?: Product;
  commerce?: Commerce;
}

export interface CreateMessageData {
  content: string;
  subject?: string;
  receiver_id: number;
  product_id?: number;
  commerce_id?: number;
  message_type?: 'general' | 'product_inquiry' | 'order_related' | 'support';
}

export interface StartConversationData {
  receiver_id: number;
}

interface MessageState {
  messages: Message[];
  conversations: Conversation[];
  currentConversation: Message[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  sendingMessage: boolean;
  currentConversationId: string | null;
}

const initialState: MessageState = {
  messages: [],
  conversations: [],
  currentConversation: [],
  unreadCount: 0,
  loading: false,
  error: null,
  sendingMessage: false,
  currentConversationId: null,
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'message/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/v1/messages/conversations');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Erreur lors du chargement des conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'message/fetchMessages',
  async (params: { conversation_id?: string; user_id?: number }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.conversation_id) queryParams.append('conversation_id', params.conversation_id);
      if (params.user_id) queryParams.append('user_id', params.user_id.toString());
      
      const response = await apiClient.get(`/api/v1/messages?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Erreur lors du chargement des messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'message/sendMessage',
  async (messageData: CreateMessageData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/v1/messages', { message: messageData });
      return response.data.data.message;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Erreur lors de l\'envoi du message');
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  'message/markAsRead',
  async (messageId: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/api/v1/messages/${messageId}/mark_as_read`);
      return response.data.data.message;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Erreur lors de la mise à jour du message');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'message/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/v1/messages/unread_count');
      return response.data.data.unread_count;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Erreur lors du chargement du nombre de messages non lus');
    }
  }
);

export const startConversation = createAsyncThunk(
  'message/startConversation',
  async (data: StartConversationData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/api/v1/messages/start_conversation', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Erreur lors du démarrage de la conversation');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'message/deleteMessage',
  async (messageId: number, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/v1/messages/${messageId}`);
      return messageId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Erreur lors de la suppression du message');
    }
  }
);

// Slice
const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.currentConversation = [];
      state.currentConversationId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentConversationId: (state, action: PayloadAction<string | null>) => {
      state.currentConversationId = action.payload;
    },
    // Pour les mises à jour en temps réel (WebSocket, etc.)
    addMessageToConversation: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      if (message.conversation_id === state.currentConversationId) {
        state.currentConversation.unshift(message);
      }
      // Mettre à jour le count des messages non lus
      if (!message.is_read) {
        state.unreadCount += 1;
      }
    },
    updateMessageReadStatus: (state, action: PayloadAction<{ messageId: number; readAt: string }>) => {
      const { messageId, readAt } = action.payload;
      // Mettre à jour dans la conversation actuelle
      const messageInConversation = state.currentConversation.find(msg => msg.id === messageId);
      if (messageInConversation) {
        messageInConversation.is_read = true;
        messageInConversation.read_at = readAt;
      }
      // Décrémenter le count des messages non lus
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.conversations;
        state.unreadCount = action.payload.unread_count;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.messages) {
          state.currentConversation = action.payload.messages;
        } else if (action.payload.conversations) {
          state.conversations = action.payload.conversations;
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        const message = action.payload;
        // Ajouter le message à la conversation actuelle
        if (message.conversation_id === state.currentConversationId) {
          state.currentConversation.unshift(message);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload as string;
      })
      
      // Mark as read
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const updatedMessage = action.payload;
        const messageIndex = state.currentConversation.findIndex(msg => msg.id === updatedMessage.id);
        if (messageIndex !== -1) {
          state.currentConversation[messageIndex] = updatedMessage;
        }
        // Décrémenter le count si le message était non lu
        if (!state.currentConversation[messageIndex]?.is_read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      
      // Start conversation
      .addCase(startConversation.fulfilled, (state, action) => {
        state.currentConversationId = action.payload.conversation_id;
      })
      
      // Delete message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        state.currentConversation = state.currentConversation.filter(msg => msg.id !== messageId);
      });
  },
});

export const {
  clearMessages,
  clearError,
  setCurrentConversationId,
  addMessageToConversation,
  updateMessageReadStatus
} = messageSlice.actions;

export default messageSlice.reducer;

// Selectors
export const selectMessages = (state: { message: MessageState }) => state.message.currentConversation;
export const selectConversations = (state: { message: MessageState }) => state.message.conversations;
export const selectUnreadCount = (state: { message: MessageState }) => state.message.unreadCount;
export const selectMessagesLoading = (state: { message: MessageState }) => state.message.loading;
export const selectMessagesError = (state: { message: MessageState }) => state.message.error;
export const selectSendingMessage = (state: { message: MessageState }) => state.message.sendingMessage;
export const selectCurrentConversationId = (state: { message: MessageState }) => state.message.currentConversationId;