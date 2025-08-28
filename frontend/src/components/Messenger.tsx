import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ConversationList from './ConversationList';

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

interface MessengerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

const Messenger: React.FC<MessengerProps> = ({ isOpen, onClose, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showConversationList, setShowConversationList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (requestId?: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const url = requestId 
        ? `http://localhost:5000/api/messages?requestId=${requestId}&limit=50`
        : 'http://localhost:5000/api/messages?limit=50';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data?.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversationList(false);
    fetchMessages(conversation.request._id);
    inputRef.current?.focus();
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setShowConversationList(true);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedConversation) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to send messages');
        return;
      }

      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: selectedConversation.participant._id,
          requestId: selectedConversation.request._id,
          message: newMessage.trim(),
          type: currentUser.role.toLowerCase() === 'volunteer' ? 'volunteer_to_senior' : 'senior_to_volunteer'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to send message');
      }

      setNewMessage('');
      fetchMessages(selectedConversation.request._id); // Refresh messages
      toast.success('Message sent!');
    } catch (error: any) {
      console.error('Send message error:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const isOwnMessage = (message: Message) => {
    return message.sender._id === currentUser?._id;
  };

  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold">Messages</h3>
              <p className="text-xs text-blue-100">
                {messages.filter(m => !m.isRead && m.recipient._id === currentUser?._id).length} unread
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white/80 hover:text-white transition-colors"
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {showConversationList ? (
              // Conversation List View
              <div className="flex-1 overflow-y-auto p-4" style={{ height: '380px' }}>
                <ConversationList
                  currentUser={currentUser}
                  onSelectConversation={handleSelectConversation}
                  selectedConversationId={selectedConversation?.id || null}
                />
              </div>
            ) : (
              // Chat View
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleBackToConversations}
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {selectedConversation?.participant.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {selectedConversation?.request.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: '300px' }}>
                  {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                    <div key={date}>
                      {/* Date separator */}
                      <div className="flex justify-center mb-4">
                        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      
                      {/* Messages for this date */}
                      {dayMessages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isOwnMessage(message)
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p className="text-sm leading-relaxed">{message.message}</p>
                            <div className={`text-xs mt-1 ${
                              isOwnMessage(message) ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.createdAt)}
                              {isOwnMessage(message) && (
                                <span className="ml-2">
                                  {message.isRead ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={sending}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className={`p-2 rounded-full transition-all duration-200 ${
                        sending || !newMessage.trim()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      }`}
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Messenger;
