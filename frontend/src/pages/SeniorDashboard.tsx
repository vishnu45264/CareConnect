import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Heart, 
  Plus, 
  Phone, 
  Calendar, 
  Pill, 
  Users, 
  MapPin, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  MessageCircle,
  Activity,
  Bell,
  LogOut,
  RefreshCw,
  HelpCircle,
  Shield,
  ActivitySquare,
  Sparkles,
  AlertCircle,
  Siren
} from 'lucide-react';
import Messenger from '../components/Messenger';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  dateOfBirth: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  rating?: number | {
    average: number;
    count: number;
  };
  completedRequests?: number;
}

interface Request {
  _id: string;
  category: string;
  title: string;
  status: string;
  createdAt: string;
  volunteer?: {
    name: string;
    phone: string;
  };
}

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
  relatedRequest?: {
    _id: string;
    title: string;
    category: string;
  };
  relatedUser?: {
    _id: string;
    name: string;
  };
}

interface HealthRecord {
  _id: string;
  type: string;
  medication?: {
    name: string;
    dosage: string;
    frequency: string;
    nextDose: string;
  };
  metric?: {
    name: string;
    value: string;
    unit: string;
  };
  appointment?: {
    doctor: string;
    date: string;
    time: string;
    location: string;
  };
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

interface ActivityItem {
  id: string;
  type: 'request' | 'notification' | 'health' | 'login' | 'profile_update';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  category?: string;
  icon: string;
  color: string;
  isRead?: boolean;
}

const SeniorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [completingRequests, setCompletingRequests] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);
  const navigate = useNavigate();

  // Separate function to fetch user profile
  const fetchUserProfile = async (token: string) => {
    const userResponse = await fetch('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user data: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    const user = userData.data?.user || userData.data || userData.user || userData;
    
    if (!user || !user._id) {
      throw new Error('Invalid user data received from server');
    }
    
    return user;
  };

  // Separate function to fetch requests
  const fetchRequests = async (token: string, userId: string) => {
    const requestsResponse = await fetch(`http://localhost:5000/api/requests?senior=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (requestsResponse.ok) {
      const requestsData = await requestsResponse.json();
      const requestsArray = Array.isArray(requestsData.data) ? requestsData.data : 
                           Array.isArray(requestsData.data?.requests) ? requestsData.data.requests : 
                           Array.isArray(requestsData) ? requestsData : [];
      setRequests(requestsArray);
      console.log('Requests updated:', requestsArray.length, 'requests');
    } else {
      console.error('Failed to fetch requests:', requestsResponse.status);
    }
  };

  // Separate function to fetch health records
  const fetchHealthRecords = async (token: string) => {
    const healthResponse = await fetch('http://localhost:5000/api/health', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      const healthArray = Array.isArray(healthData.data) ? healthData.data : 
                         Array.isArray(healthData.data?.healthRecords) ? healthData.data.healthRecords : 
                         Array.isArray(healthData) ? healthData : [];
      setHealthRecords(healthArray);
    } else {
      console.error('Failed to fetch health records:', healthResponse.status);
    }
  };

  // Separate function to fetch notifications
  const fetchNotifications = async (token: string) => {
    const notificationResponse = await fetch('http://localhost:5000/api/notifications?limit=5', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (notificationResponse.ok) {
      const notificationData = await notificationResponse.json();
      setNotifications(notificationData.data?.notifications || []);
      setUnreadCount(notificationData.data?.unreadCount || 0);
    } else {
      console.error('Failed to fetch notifications:', notificationResponse.status);
    }
  };

  // Main function to fetch all data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      // Try to load user from localStorage first as fallback
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser._id) {
            setUser(parsedUser);
          }
        } catch (e) {
          console.log('Failed to parse stored user:', e);
        }
      }

      // Fetch user profile
      const user = await fetchUserProfile(token);
      setUser(user);

      // Fetch all data in parallel
      await Promise.all([
        fetchRequests(token, user._id),
        fetchHealthRecords(token),
        fetchNotifications(token)
      ]);

    } catch (err: any) {
      console.error('Error in fetchUserData:', err);
      setError(err.message);
      if (err.message.includes('token') || err.message.includes('unauthorized')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh data (for real-time updates)
  const refreshData = async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes
    
    setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token || !user?._id) return;

      // Refresh requests, notifications, and messages (most likely to change)
      await Promise.all([
        fetchRequests(token, user._id),
        fetchNotifications(token),
        fetchMessages()
      ]);
      
      console.log('Data refreshed successfully');
      toast.success('Data updated successfully!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  // Set up periodic refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && user?._id) {
        refreshData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loading, user?._id]);

  // Listen for focus events to refresh data when returning to the page
  useEffect(() => {
    const handleFocus = () => {
      if (!loading && user?._id && !refreshing) {
        console.log('Page focused, refreshing data...');
        refreshData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loading, user?._id, refreshing]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        toast.success('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

    const handleMarkAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/messages?limit=10', {
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

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
    setReplyText('');
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setSendingReply(true);
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
          recipientId: selectedMessage.sender._id,
          requestId: selectedMessage.request._id,
          message: replyText.trim(),
          type: 'senior_to_volunteer'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to send reply');
      }

      toast.success('Reply sent successfully!');
      setReplyText('');
      setShowMessageModal(false);
      setSelectedMessage(null);
      fetchMessages(); // Refresh messages
    } catch (error: any) {
      console.error('Send reply error:', error);
      toast.error(error.message || 'Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseMessageModal = () => {
    setShowMessageModal(false);
    setSelectedMessage(null);
    setReplyText('');
  };

  const handleMarkRequestAsCompleted = async (requestId: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to mark this request as completed? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    // Add to completing requests set
    setCompletingRequests(prev => new Set(prev).add(requestId));

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/requests/${requestId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Request marked as completed:', result);
        
        // Update local state
        setRequests(prev => 
          prev.map(req => 
            req._id === requestId 
              ? { ...req, status: 'completed' }
              : req
          )
        );
        
        toast.success('Request marked as completed successfully!');
        
        // Refresh data to get updated information
        setTimeout(() => {
          refreshData();
        }, 1000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to mark request as completed');
      }
    } catch (error) {
      console.error('Error marking request as completed:', error);
      toast.error('Failed to mark request as completed');
    } finally {
      // Remove from completing requests set
      setCompletingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Generate activity items from senior's data
  const generateActivityItems = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Add request activities (sorted by creation date, newest first)
    const sortedRequests = [...requests].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    sortedRequests.forEach((request) => {
      activities.push({
        id: request._id,
        type: 'request',
        title: request.status === 'completed' ? 'Request Completed' : 
               request.status === 'in-progress' ? 'Request In Progress' : 'New Request Created',
        description: request.title,
        timestamp: request.createdAt,
        status: request.status,
        category: request.category,
        icon: request.status === 'completed' ? 'CheckCircle' : 
              request.status === 'in-progress' ? 'Clock' : 'Plus',
        color: request.status === 'completed' ? 'success' : 
               request.status === 'in-progress' ? 'primary' : 'warning'
      });
    });

    // Add notification activities
    notifications.forEach((notification) => {
      activities.push({
        id: notification._id,
        type: 'notification',
        title: notification.title,
        description: notification.message,
        timestamp: notification.createdAt,
        icon: notification.isRead ? 'Bell' : 'Bell',
        color: notification.isRead ? 'gray' : 'blue',
        isRead: notification.isRead
      });
    });

    // Add health record activities
    healthRecords.forEach((record) => {
      activities.push({
        id: record._id,
        type: 'health',
        title: record.type === 'medication' ? 'Medication Logged' :
               record.type === 'appointment' ? 'Appointment Scheduled' :
               record.type === 'vital' ? 'Health Metric Recorded' : 'Health Activity',
        description: record.medication?.name || 
                    record.appointment?.doctor || 
                    record.metric?.name || 'Health record updated',
        timestamp: new Date().toISOString(), // Health records might not have timestamps
        icon: record.type === 'medication' ? 'Pill' : 
              record.type === 'appointment' ? 'Calendar' : 'Heart',
        color: 'green'
      });
    });

    // Add profile update activity (simulated based on user data)
    if (user?.name || user?.email) {
      activities.push({
        id: 'profile-' + Date.now(),
        type: 'profile_update',
        title: 'Profile Information Updated',
        description: 'Your profile information has been updated',
        timestamp: new Date().toISOString(),
        icon: 'User',
        color: 'purple'
      });
    }

    // Add login activity (simulated)
    activities.push({
      id: 'login-' + Date.now(),
      type: 'login',
      title: 'Logged into dashboard',
      description: 'Successfully accessed your dashboard',
      timestamp: new Date().toISOString(),
      icon: 'LogIn',
      color: 'blue'
    });

    // Add community engagement activity (if they have completed requests)
    if (completedRequests.length > 0) {
      activities.push({
        id: 'community-' + Date.now(),
        type: 'request',
        title: 'Community Engagement',
        description: `Successfully completed ${completedRequests.length} help requests`,
        timestamp: new Date().toISOString(),
        icon: 'Users',
        color: 'success'
      });
    }

    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const quickActions = [
    {
      icon: <HelpCircle className="w-7 h-7" />,
      title: "Request Help",
      description: "Ask for assistance with daily tasks, errands, or companionship",
      color: "blue",
      link: "/senior/request-help"
    },
    {
      icon: <Siren className="w-7 h-7" />,
      title: "Emergency SOS",
      description: "Get immediate emergency assistance when you need it most",
      color: "red",
      link: "/emergency"
    },
    {
      icon: <ActivitySquare className="w-7 h-7" />,
      title: "Health Tracker",
      description: "Track medications, appointments, and vital signs",
      color: "green",
      link: "/senior/health-tracker"
    },
    {
      icon: <Sparkles className="w-7 h-7" />,
      title: "Community Events",
      description: "Join social activities, workshops, and community events",
      color: "purple",
      link: "/community/events"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access your dashboard</p>
          <Link to="/login" className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Debug: Log user data
  console.log('Rendering dashboard with user:', user);
  console.log('All requests:', requests);

  const activeRequests = Array.isArray(requests) ? requests.filter(req => req.status === 'in-progress' || req.status === 'pending' || req.status === 'accepted') : [];
  const completedRequests = Array.isArray(requests) ? requests.filter(req => req.status === 'completed') : [];
  const medications = Array.isArray(healthRecords) ? healthRecords.filter(record => record.type === 'medication') : [];

  // Debug: Log filtered requests
  console.log('Active requests:', activeRequests);
  console.log('Completed requests:', completedRequests);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CareConnect
                </h1>
                <p className="text-sm text-gray-500 font-medium">Senior Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right mr-4">
                <p className="text-sm font-semibold text-gray-800">
                  Welcome back, {user?.name || 'User'}! 👋
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || 'No email'}
                </p>
              </div>
              
              {/* Messenger Icon */}
              <button
                onClick={() => setShowMessenger(!showMessenger)}
                className="relative flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Messages</span>
                {/* Unread indicator */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                  {messages.filter(m => !m.isRead && m.recipient._id === user?._id).length}
                </div>
              </button>
              
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-white/60 hover:bg-white/80 text-gray-700 rounded-xl border border-gray-200/50 disabled:opacity-50 transition-all duration-200 shadow-sm"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome to CareConnect</h2>
                <p className="text-blue-100 text-lg">Your trusted platform for getting the help you need</p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200/50 hover:border-gray-300/50"
              onClick={() => navigate(action.link)}
            >
              <div className={`w-14 h-14 bg-gradient-to-r from-${action.color}-500 to-${action.color}-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                <div className="text-white">
                  {action.icon}
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{action.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Activity Feed - Prominent Position */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Activity className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Your Activity Feed</h2>
                  <p className="text-purple-100 text-lg">Stay updated with your latest activities and requests</p>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="text-right">
                  <div className="text-4xl font-bold mb-1">{requests.length}</div>
                  <div className="text-purple-100 text-sm">Total Requests</div>
                </div>
              </div>
            </div>
            
            {/* Activity Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{activeRequests.length}</div>
                <div className="text-purple-100 text-sm">Active</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{completedRequests.length}</div>
                <div className="text-purple-100 text-sm">Completed</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{notifications.length}</div>
                <div className="text-purple-100 text-sm">Notifications</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{unreadCount}</div>
                <div className="text-purple-100 text-sm">Unread</div>
              </div>
            </div>

            {/* Recent Activity Items */}
            <div className="space-y-3">
              {(() => {
                const activities = generateActivityItems();
                const recentActivities = activities.slice(0, 3);
                
                if (recentActivities.length === 0) {
                  return (
                    <div className="text-center py-4">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-purple-100 text-sm">No recent activity</p>
                    </div>
                  );
                }

                return recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200">
                    <div className={`w-3 h-3 rounded-full bg-${activity.color}-400 flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-white truncate">
                          {activity.title}
                        </p>
                        {activity.type === 'notification' && !activity.isRead && (
                          <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-purple-100 truncate mt-1">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-purple-200">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Requests */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Active Requests</h2>
                </div>
                <Link 
                  to="/senior/request-help" 
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  + New Request
                </Link>
              </div>
              
              {activeRequests.length > 0 ? (
                <div className="space-y-4">
                  {activeRequests.map((request) => (
                    <div key={request._id} className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-200 hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-4 h-4 rounded-full bg-${getStatusColor(request.status)}-500 shadow-lg`}></div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-lg mb-1">{request.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {request.volunteer ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Accepted by {request.volunteer.name}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                  <Clock className="w-4 h-4 mr-1" />
                                  Awaiting volunteer
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              Created: {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            request.status === 'completed' ? 'bg-green-100 text-green-800' :
                            request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'accepted' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusText(request.status)}
                          </span>
                          {request.volunteer && request.status === 'accepted' && (
                            <button
                              onClick={() => handleMarkRequestAsCompleted(request._id)}
                              disabled={completingRequests.has(request._id)}
                              className={`px-4 py-2 text-white text-sm rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold ${
                                completingRequests.has(request._id)
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
                              }`}
                              title="Mark as completed"
                            >
                              {completingRequests.has(request._id) ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Completing...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Complete</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      {/* Debug info - remove this in production */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200/50">
                          Debug: Status={request.status}, Has Volunteer={!!request.volunteer}, 
                          Show Button={!!(request.volunteer && request.status === 'accepted')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Requests</h3>
                  <p className="text-gray-600 mb-6">Ready to get help? Create your first request!</p>
                  <Link 
                    to="/senior/request-help" 
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Request
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Completed Requests */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Completed Requests</h2>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  {completedRequests.length} completed
                </span>
              </div>
              
              {completedRequests.length > 0 ? (
                <div className="space-y-4">
                  {completedRequests.slice(0, 3).map((request) => (
                    <div key={request._id} className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{request.title}</h3>
                          <p className="text-sm text-gray-600">
                            {request.volunteer ? `Completed by ${request.volunteer.name}` : 'Completed'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No Completed Requests</h3>
                  <p className="text-gray-600">Your completed requests will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{user?.name || 'User'}</h3>
                  <p className="text-sm text-gray-600">{user?.phone || 'No phone'}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  </div>
                </div>
              </div>
              
              {user.address && (
                <div className="flex items-center space-x-3 text-sm text-gray-600 mb-3 p-3 bg-gray-50/50 rounded-xl">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>{user.address.street}, {user.address.city}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Age</span>
                <span className="text-sm font-bold text-gray-800">
                  {user?.dateOfBirth ? Math.floor((new Date().getTime() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'Unknown'} years
                </span>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
                </div>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-3 py-1 font-bold animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllNotificationsAsRead}
                      className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      title="Mark all as read"
                    >
                      Mark All Read
                    </button>
                  )}
                </div>
              </div>
              
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div 
                      key={notification._id} 
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        notification.isRead 
                          ? 'bg-gray-50/50 border border-gray-200/50' 
                          : 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 shadow-sm'
                      }`}
                      onClick={() => handleMarkNotificationAsRead(notification._id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                          notification.isRead ? 'bg-gray-400' : 'bg-blue-500 animate-pulse'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className={`font-semibold text-sm ${
                              notification.isRead ? 'text-gray-600' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                            {!notification.isRead && (
                              <span className="text-xs text-blue-600 font-medium">
                                Click to mark as read
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.length > 3 && (
                    <div className="text-center pt-2">
                      <span className="text-xs text-gray-500">
                        Showing 3 of {notifications.length} notifications
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No Notifications</h3>
                  <p className="text-gray-600">You're all caught up!</p>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                </div>
                <div className="flex items-center space-x-2">
                  {messages.filter(m => !m.isRead && m.recipient._id === user?._id).length > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full px-3 py-1 font-bold animate-pulse">
                      {messages.filter(m => !m.isRead && m.recipient._id === user?._id).length}
                    </span>
                  )}
                </div>
              </div>
              
              {messages.length > 0 ? (
                <div className="space-y-3">
                  {messages.slice(0, 3).map((message) => (
                    <div 
                      key={message._id} 
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        message.isRead 
                          ? 'bg-gray-50/50 border border-gray-200/50' 
                          : 'bg-gradient-to-r from-green-50 to-blue-100 border-l-4 border-green-500 shadow-sm'
                      }`}
                      onClick={() => handleViewMessage(message)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                          message.isRead ? 'bg-gray-400' : 'bg-green-500 animate-pulse'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className={`font-semibold text-sm ${
                              message.isRead ? 'text-gray-600' : 'text-gray-900'
                            }`}>
                              {message.sender.name} ({message.sender.role})
                            </p>
                            {!message.isRead && message.recipient._id === user?._id && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                            {message.message.length > 60 ? `${message.message.substring(0, 60)}...` : message.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                              {new Date(message.createdAt).toLocaleDateString()}
                            </p>
                            {!message.isRead && message.recipient._id === user?._id && (
                              <span className="text-xs text-green-600 font-medium">
                                Click to view & reply
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {messages.length > 3 && (
                    <div className="text-center pt-2">
                      <span className="text-xs text-gray-500">
                        Showing 3 of {messages.length} messages
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No Messages</h3>
                  <p className="text-gray-600">No messages yet from volunteers</p>
                </div>
              )}
            </div>

            {/* Medications */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Pill className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Today's Medications</h2>
                </div>
              </div>
              
              {medications.length > 0 ? (
                <div className="space-y-3">
                  {medications.slice(0, 3).map((medication) => (
                    <div key={medication._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Pill className="w-5 h-5 text-primary-600" />
                        <div>
                          <p className="font-medium text-gray-900">{medication.medication?.name}</p>
                          <p className="text-sm text-gray-600">{medication.medication?.dosage}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">{medication.medication?.nextDose}</span>
                        <button className="btn-success text-sm px-3 py-1">
                          Mark Taken
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Pill className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No medications scheduled</p>
                </div>
              )}
            </div>


          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Message from {selectedMessage.sender.name}</h2>
                <button
                  onClick={handleCloseMessageModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                About request: "{selectedMessage.request.title}"
              </p>
            </div>
            
            <div className="p-6">
              {/* Original Message */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-gray-800">{selectedMessage.sender.name}</span>
                  <span className="text-sm text-gray-500">({selectedMessage.sender.role})</span>
                  <span className="text-sm text-gray-400">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{selectedMessage.message}</p>
              </div>

              {/* Reply Form */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={sendingReply}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseMessageModal}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
                disabled={sendingReply}
              >
                Close
              </button>
              <button
                onClick={handleSendReply}
                disabled={sendingReply || !replyText.trim()}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  sendingReply || !replyText.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                }`}
              >
                {sendingReply ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Reply</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
             )}

       {/* Messenger Component */}
       <Messenger 
         isOpen={showMessenger}
         onClose={() => setShowMessenger(false)}
         currentUser={user}
       />
     </div>
   );
 };

export default SeniorDashboard; 