import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

        // Fetch available requests
        const availableResponse = await fetch('http://localhost:5000/api/requests?status=available', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (availableResponse.ok) {
          const availableData = await availableResponse.json();
          setAvailableRequests(Array.isArray(availableData.data) ? availableData.data : []);
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
          setMyRequests(Array.isArray(myRequestsData.data) ? myRequestsData.data : []);
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

  const filteredMyRequests = filterStatus === 'all' 
    ? (Array.isArray(myRequests) ? myRequests : [])
    : (Array.isArray(myRequests) ? myRequests.filter(req => req.status === filterStatus) : []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">CareConnect</h1>
                <p className="text-sm text-gray-600">Volunteer Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Welcome back, {user?.name || 'User'}!
                </p>
                <p className="text-xs text-gray-600">
                  {user?.email || 'No email'} | Role: {user?.role || 'Unknown'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{volunteerStats.totalRequests}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{volunteerStats.completedRequests}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{volunteerStats.pendingRequests}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{volunteerStats.rating.toFixed(1)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hours</p>
                <p className="text-2xl font-bold text-gray-900">{volunteerStats.hoursVolunteered}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Seniors Helped</p>
                <p className="text-2xl font-bold text-gray-900">{volunteerStats.seniorsHelped}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available Requests
              </button>
              <button
                onClick={() => setActiveTab('my-requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-requests'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Requests
              </button>
            </nav>
          </div>

          <div className="p-6">
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
                  <div className="space-y-4">
                    {availableRequests.map((request) => (
                      <div key={request._id} className="bg-gray-50 rounded-lg p-6 border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                              <span className={`badge badge-${getUrgencyColor(request.urgency)}`}>
                                {request.urgency.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{request.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{request.senior.name} ({request.senior.age} years)</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{request.location.address}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{request.schedule.preferredDate} at {request.schedule.preferredTime}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {request.budget && (
                                  <span className="text-sm font-medium text-gray-900">₹{request.budget}</span>
                                )}
                                <span className="text-sm text-gray-600">{request.schedule.duration}</span>
                              </div>
                              <button className="btn-primary">
                                Accept Request
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No available requests</h3>
                    <p className="text-gray-600">Check back later for new requests from seniors in your area.</p>
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
                  <div className="space-y-4">
                    {filteredMyRequests.map((request) => (
                      <div key={request._id} className="bg-gray-50 rounded-lg p-6 border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                              <span className={`badge badge-${getStatusColor(request.status)}`}>
                                {getStatusText(request.status)}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{request.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{request.senior.name} ({request.senior.age} years)</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{request.location.address}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{request.schedule.preferredDate} at {request.schedule.preferredTime}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {request.budget && (
                                  <span className="text-sm font-medium text-gray-900">₹{request.budget}</span>
                                )}
                                <span className="text-sm text-gray-600">{request.schedule.duration}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button className="btn-secondary">
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Message
                                </button>
                                <button className="btn-primary">
                                  {request.status === 'pending' ? 'Start' : request.status === 'in-progress' ? 'Complete' : 'View'}
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
    </div>
  );
};

export default VolunteerDashboard; 