import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  status: string;
  createdAt: string;
  volunteer?: {
    name: string;
    phone: string;
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

const SeniorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
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
          console.log('No token found, redirecting to login');
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
        console.log('Fetching user profile...');
        const userResponse = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('User response status:', userResponse.status);
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

        // Fetch user's requests
        const userId = user._id;
        console.log('Fetching requests for senior:', userId);
        const requestsResponse = await fetch('http://localhost:5000/api/requests?senior=' + userId, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Requests response status:', requestsResponse.status);
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          console.log('Requests data received:', requestsData);
          setRequests(Array.isArray(requestsData.data) ? requestsData.data : []);
        } else {
          const errorText = await requestsResponse.text();
          console.error('Requests fetch error:', errorText);
        }

        // Fetch health records
        console.log('Fetching health records...');
        const healthResponse = await fetch('http://localhost:5000/api/health', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Health response status:', healthResponse.status);
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          console.log('Health data received:', healthData);
          setHealthRecords(Array.isArray(healthData.data) ? healthData.data : []);
        } else {
          const errorText = await healthResponse.text();
          console.error('Health fetch error:', errorText);
        }

      } catch (err: any) {
        console.error('Error in fetchUserData:', err);
        setError(err.message);
        if (err.message.includes('token') || err.message.includes('unauthorized')) {
          console.log('Token error detected, clearing localStorage and redirecting to login');
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

  const quickActions = [
    {
      icon: <Plus className="w-6 h-6" />,
      title: "Request Help",
      description: "Ask for assistance with daily tasks",
      color: "primary",
      link: "/senior/request-help"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Emergency SOS",
      description: "Get immediate emergency assistance",
      color: "danger",
      link: "/emergency"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Health Tracker",
      description: "Track medications and appointments",
      color: "success",
      link: "/senior/health-tracker"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Events",
      description: "Join social activities and events",
      color: "secondary",
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

  const activeRequests = Array.isArray(requests) ? requests.filter(req => req.status === 'in-progress' || req.status === 'pending') : [];
  const completedRequests = Array.isArray(requests) ? requests.filter(req => req.status === 'completed') : [];
  const medications = Array.isArray(healthRecords) ? healthRecords.filter(record => record.type === 'medication') : [];

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
                <p className="text-sm text-gray-600">Senior Dashboard</p>
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
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(action.link)}
            >
              <div className={`w-12 h-12 bg-${action.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                {action.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Requests */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Active Requests</h2>
                <Link to="/senior/request-help" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  New Request
                </Link>
              </div>
              
              {activeRequests.length > 0 ? (
                <div className="space-y-3">
                  {activeRequests.map((request) => (
                    <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full bg-${getStatusColor(request.status)}-500`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{request.title}</p>
                          <p className="text-sm text-gray-600">
                            {request.volunteer ? `Assigned to ${request.volunteer.name}` : 'Awaiting volunteer'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{new Date(request.createdAt).toLocaleDateString()}</p>
                        <span className={`badge badge-${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No active requests</p>
                  <Link to="/senior/request-help" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Create your first request
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Completed Requests */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Completed Requests</h2>
                <span className="text-sm text-gray-600">{completedRequests.length} completed</span>
              </div>
              
              {completedRequests.length > 0 ? (
                <div className="space-y-3">
                  {completedRequests.slice(0, 3).map((request) => (
                    <div key={request._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-success-500" />
                        <div>
                          <p className="font-medium text-gray-900">{request.title}</p>
                          <p className="text-sm text-gray-600">
                            {request.volunteer ? `Completed by ${request.volunteer.name}` : 'Completed'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{new Date(request.createdAt).toLocaleDateString()}</p>
                        <span className="badge badge-success">Completed</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No completed requests yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-4 mb-4">
                                 <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                   <span className="text-white font-semibold text-lg">
                     {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                   </span>
                 </div>
                 <div>
                   <h3 className="font-semibold text-gray-900">{user?.name || 'User'}</h3>
                   <p className="text-sm text-gray-600">{user?.phone || 'No phone'}</p>
                 </div>
              </div>
              
              {user.address && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{user.address.street}, {user.address.city}</span>
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                Age: {user?.dateOfBirth ? Math.floor((new Date().getTime() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 'Unknown'} years
              </div>
            </div>

            {/* Medications */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Today's Medications</h2>
                <Pill className="w-5 h-5 text-primary-600" />
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

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Activity</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Requests</span>
                  <span className="font-semibold text-gray-900">{requests.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-semibold text-success-600">{completedRequests.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="font-semibold text-primary-600">{activeRequests.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeniorDashboard; 