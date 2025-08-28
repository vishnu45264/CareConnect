import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Clock } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  recipient: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  request: {
    _id: string;
    title: string;
    status: string;
  };
  message: string;
  type: 'volunteer_to_senior' | 'senior_to_volunteer';
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  participant: User;
  request: {
    _id: string;
    title: string;
    status: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

interface ConversationListProps {
  currentUser: User | null;
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId: string | null;
}

const ConversationList: React.FC<ConversationListProps> = ({
  currentUser,
  onSelectConversation,
  selectedConversationId
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, [currentUser]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !currentUser) return;

      const response = await fetch('http://localhost:5000/api/messages?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const messages = data.data?.messages || [];
        
        // Group messages by conversation (request + other participant)
        const conversationMap = new Map<string, Conversation>();
        
        messages.forEach((message: Message) => {
          const otherUser = message.sender._id === currentUser._id 
            ? message.recipient 
            : message.sender;
          
          const conversationKey = `${message.request._id}-${otherUser._id}`;
          
          if (!conversationMap.has(conversationKey)) {
            conversationMap.set(conversationKey, {
              id: conversationKey,
              participant: otherUser,
              request: message.request,
              lastMessage: message,
              unreadCount: 0
            });
          }
          
          const conversation = conversationMap.get(conversationKey)!;
          
          // Update last message if this one is newer
          if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
            conversation.lastMessage = message;
          }
          
          // Count unread messages
          if (!message.isRead && message.recipient._id === currentUser._id) {
            conversation.unreadCount++;
          }
        });
        
        // Convert to array and sort by last message time
        const conversationsArray = Array.from(conversationMap.values())
          .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
        
        setConversations(conversationsArray);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">No Conversations</h3>
        <p className="text-gray-600">Start a conversation by accepting or creating a request</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
            selectedConversationId === conversation.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-800 truncate">
                  {conversation.participant.name}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {formatTime(conversation.lastMessage.createdAt)}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1 truncate">
                {conversation.request.title}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {conversation.lastMessage.message}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
