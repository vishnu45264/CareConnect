import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Heart, 
  Users, 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle, 
  AlertCircle,
  Phone,
  MessageCircle,
  Calendar,
  Activity,
  Bell,
  Filter,
  Search,
  LogOut
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
  description: string;
  urgency: string;
  status: string;
  createdAt: string;
  schedule: {
    preferredDate: string;
    preferredTime: string;
    duration: string;
  };
  location: {
    address: string;
  };
  budget?: string;
  senior: {
    _id: string;
    name: string;
    phone: string;
    age: number;
  };
  volunteer?: {
    name: string;
    phone: string;
  };
}

const VolunteerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [filterStatus, setFilterStatus] = useState('all');
  const [user, setUser] = useState<User | null>(null);
  const [availableRequests, setAvailableRequests] = useState<Request[]>([]);
  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showMessenger, setShowMessenger] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');
        console.log('Stored user from localStorage:', storedUser ? 'User exists' : 'No user found');
        
        if (!token) {
          navigate('/login');
          return;
        }

        // Try to load user from localStorage first as fallback
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser._id) {
              console.log('Loading user from localStorage as fallback:', parsedUser);
              setUser(parsedUser);
            }
          } catch (e) {
            console.log('Failed to parse stored user:', e);
          }
        }

        // Fetch user profile
        const userResponse = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          console.error('User fetch error:', errorText);
          
          // If API fails, try to use stored user data
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser && parsedUser._id) {
                console.log('Using stored user data due to API failure:', parsedUser);
                setUser(parsedUser);
                return; // Continue with stored data
              }
            } catch (e) {
              console.log('Failed to parse stored user:', e);
            }
          }
          
          throw new Error(`Failed to fetch user data: ${userResponse.status} ${errorText}`);
        }

        const userData = await userResponse.json();
        console.log('User data received:', userData);
        
        // Handle different response structures
        const user = userData.data?.user || userData.data || userData.user || userData;
        console.log('Extracted user data:', user);
        
        if (!user || !user._id) {
          throw new Error('Invalid user data received from server');
        }
        
        setUser(user);

        // Fetch available requests (pending requests for volunteers)
        const availableResponse = await fetch('http://localhost:5000/api/requests?status=pending', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (availableResponse.ok) {
          const availableData = await availableResponse.json();
          console.log('Available requests response:', availableData);
          setAvailableRequests(availableData.data?.requests || []);
        }

        // Fetch my accepted requests
        const userId = user._id;
        const myRequestsResponse = await fetch('http://localhost:5000/api/requests?volunteer=' + userId, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (myRequestsResponse.ok) {
          const myRequestsData = await myRequestsResponse.json();
          console.log('My requests response:', myRequestsData);
          setMyRequests(myRequestsData.data?.requests || []);
        }

      } catch (err: any) {
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

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAcceptRequest = async (requestId: string) => {
    console.log('Accept request clicked for ID:', requestId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to accept requests');
        navigate('/login');
        return;
      }

      // Ensure only volunteers can accept requests
      const currentRole = String(user?.role || '').toLowerCase();
      if (currentRole !== 'volunteer') {
        toast.error('Only volunteers can accept requests');
        return;
      }

      console.log('Making API call to accept request...');
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('Accept request response:', result);

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to accept request');
      }

      toast.success('Request accepted successfully!');
      
      // Refresh the data
      window.location.reload();
    } catch (error: any) {
      console.error('Accept request error:', error);
      toast.error(error.message || 'Failed to accept request. Please try again.');
    }
  };

  const handleViewRequest = (request: Request) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const handleMessageSenior = (request: Request) => {
    setSelectedRequest(request);
    setShowMessageModal(true);
    setMessageText('');
  };

  const handleSendMessage = async () => {
    if (!selectedRequest || !messageText.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSendingMessage(true);
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
          recipientId: selectedRequest.senior._id,
          requestId: selectedRequest._id,
          message: messageText.trim(),
          type: 'volunteer_to_senior'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to send message');
      }

      toast.success('Message sent successfully!');
      setMessageText('');
      setShowMessageModal(false);
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('Send message error:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCloseModal = () => {
    setShowRequestModal(false);
    setShowMessageModal(false);
    setSelectedRequest(null);
    setMessageText('');
  };

  const volunteerStats = {
    totalRequests: Array.isArray(myRequests) ? myRequests.length : 0,
    completedRequests: Array.isArray(myRequests) ? myRequests.filter(req => req.status === 'completed').length : 0,
    pendingRequests: Array.isArray(myRequests) ? myRequests.filter(req => req.status === 'in-progress' || req.status === 'pending').length : 0,
    rating: (() => {
      if (typeof user?.rating === 'number') return user.rating;
      if (user?.rating && typeof user.rating === 'object' && 'average' in user.rating) {
        return user.rating.average;
      }
      return 0;
    })(),
    hoursVolunteered: Array.isArray(myRequests) ? Math.floor(myRequests.filter(req => req.status === 'completed').length * 2.5) : 0, // Estimate
    seniorsHelped: Array.isArray(myRequests) ? new Set(myRequests.filter(req => req.status === 'completed').map(req => req.senior._id)).size : 0
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

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
      case 'available':
        return 'Available';
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
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
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
  console.log('User role:', user?.role);
  console.log('Available requests count:', availableRequests.length);
  console.log('Available requests:', availableRequests);

  const filteredMyRequests = filterStatus === 'all' 
    ? (Array.isArray(myRequests) ? myRequests : [])
    : (Array.isArray(myRequests) ? myRequests.filter(req => req.status === filterStatus) : []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  CareConnect
                </h1>
                <p className="text-sm text-gray-500 font-medium">Volunteer Dashboard</p>
              </div>
            </div>
            
                                      <div className="flex items-center space-x-3">
               <div className="text-right mr-4">
                 <p className="text-sm font-semibold text-gray-800">
                   Welcome back, {user?.name || 'User'}! 🌟
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
                   3
                 </div>
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
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Volunteer Dashboard</h2>
                <p className="text-green-100 text-lg">Make a difference in someone's life today</p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-800">{volunteerStats.totalRequests}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-800">{volunteerStats.completedRequests}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-800">{volunteerStats.pendingRequests}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-800">{volunteerStats.rating.toFixed(1)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hours</p>
                <p className="text-2xl font-bold text-gray-800">{volunteerStats.hoursVolunteered}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Seniors Helped</p>
                <p className="text-2xl font-bold text-gray-800">{volunteerStats.seniorsHelped}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 mb-8 overflow-hidden">
          <div className="border-b border-gray-200/50">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-6 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'requests'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available Requests
              </button>
              <button
                onClick={() => setActiveTab('my-requests')}
                className={`py-6 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'my-requests'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Requests
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'requests' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Available Requests</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search requests..."
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Status</option>
                      <option value="available">Available</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {availableRequests.length > 0 ? (
                  <div className="space-y-6">
                    {availableRequests.map((request) => (
                      <div key={request._id} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-200 hover:shadow-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-4">
                              <h3 className="text-xl font-bold text-gray-800">{request.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                request.urgency === 'high' ? 'bg-red-100 text-red-800' :
                                request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {request.urgency.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-4 leading-relaxed">{request.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="flex items-center space-x-3 p-3 bg-blue-50/50 rounded-xl">
                                <Users className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">
                                  {request.senior.name} 
                                  {request.senior.age ? ` (${request.senior.age} years)` : ''}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3 p-3 bg-green-50/50 rounded-xl">
                                <MapPin className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">{request.location.address}</span>
                              </div>
                              <div className="flex items-center space-x-3 p-3 bg-purple-50/50 rounded-xl">
                                <Clock className="w-5 h-5 text-purple-600" />
                                <span className="text-sm font-medium text-gray-700">
                                  {new Date(request.schedule.preferredDate).toLocaleDateString()} at {request.schedule.preferredTime}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {request.budget && (
                                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-bold">₹{request.budget}</span>
                                )}
                                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">{request.schedule.duration}</span>
                              </div>
                              <button 
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                onClick={() => {
                                  console.log('Accept button clicked for request:', request._id);
                                  handleAcceptRequest(request._id);
                                }}
                              >
                                Accept Request
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">No Available Requests</h3>
                    <p className="text-gray-600 mb-6">Check back later for new requests from seniors in your area.</p>
                    <div className="w-16 h-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-full flex items-center justify-center mx-auto">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'my-requests' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">My Requests</h2>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {filteredMyRequests.length > 0 ? (
                  <div className="space-y-6">
                    {filteredMyRequests.map((request) => (
                      <div key={request._id} className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-200 hover:shadow-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-4">
                              <h3 className="text-xl font-bold text-gray-800">{request.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {getStatusText(request.status)}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-4 leading-relaxed">{request.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="flex items-center space-x-3 p-3 bg-blue-50/50 rounded-xl">
                                <Users className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">
                                  {request.senior.name} 
                                  {request.senior.age ? ` (${request.senior.age} years)` : ''}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3 p-3 bg-green-50/50 rounded-xl">
                                <MapPin className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">{request.location.address}</span>
                              </div>
                              <div className="flex items-center space-x-3 p-3 bg-purple-50/50 rounded-xl">
                                <Clock className="w-5 h-5 text-purple-600" />
                                <span className="text-sm font-medium text-gray-700">
                                  {new Date(request.schedule.preferredDate).toLocaleDateString()} at {request.schedule.preferredTime}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {request.budget && (
                                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-bold">₹{request.budget}</span>
                                )}
                                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">{request.schedule.duration}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <button 
                                  onClick={() => handleMessageSenior(request)}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  <span>Message</span>
                                </button>
                                <button 
                                  onClick={() => handleViewRequest(request)}
                                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                                >
                                  <span>{request.status === 'pending' ? 'Start' : request.status === 'in-progress' ? 'Complete' : 'View'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                    <p className="text-gray-600">Start helping seniors by accepting available requests.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Request Details</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Request Header */}
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-bold text-gray-800">{selectedRequest.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedRequest.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedRequest.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  selectedRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getStatusText(selectedRequest.status)}
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                <p className="text-gray-600 leading-relaxed">{selectedRequest.description}</p>
              </div>

              {/* Senior Information */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Senior Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">
                      <strong>Name:</strong> {selectedRequest.senior.name}
                      {selectedRequest.senior.age && ` (${selectedRequest.senior.age} years old)`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">
                      <strong>Phone:</strong> {selectedRequest.senior.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule Information */}
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">
                      <strong>Date:</strong> {new Date(selectedRequest.schedule.preferredDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">
                      <strong>Time:</strong> {selectedRequest.schedule.preferredTime}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-700">
                      <strong>Duration:</strong> {selectedRequest.schedule.duration}
                    </span>
                  </div>
                  {selectedRequest.budget && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700">
                        <strong>Budget:</strong> ₹{selectedRequest.budget}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="bg-purple-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Location</h4>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-700">{selectedRequest.location.address}</span>
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Request Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium text-gray-800">{selectedRequest.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Urgency:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedRequest.urgency === 'high' ? 'bg-red-100 text-red-800' :
                      selectedRequest.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedRequest.urgency.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium text-gray-800">
                      {new Date(selectedRequest.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  handleMessageSenior(selectedRequest);
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Message Senior
              </button>
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Message Senior</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Send a message to {selectedRequest.senior.name} about the request: "{selectedRequest.title}"
              </p>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={sendingMessage}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
                disabled={sendingMessage}
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !messageText.trim()}
                className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  sendingMessage || !messageText.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {sendingMessage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>Send Message</span>
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

export default VolunteerDashboard; 