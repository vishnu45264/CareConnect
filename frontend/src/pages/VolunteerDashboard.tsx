import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Search
} from 'lucide-react';

const VolunteerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [filterStatus, setFilterStatus] = useState('all');

  const volunteerStats = {
    totalRequests: 24,
    completedRequests: 18,
    pendingRequests: 3,
    rating: 4.8,
    hoursVolunteered: 156,
    seniorsHelped: 12
  };

  const availableRequests = [
    {
      id: "REQ001",
      seniorName: "Mrs. Patel",
      age: 72,
      location: "Andheri West, Mumbai",
      distance: "1.2 km",
      requestType: "Grocery Shopping",
      urgency: "medium",
      description: "Need help with weekly grocery shopping. Prefer morning hours.",
      timeNeeded: "2 hours",
      compensation: "₹200",
      status: "available"
    },
    {
      id: "REQ002",
      seniorName: "Mr. Sharma",
      age: 68,
      location: "Bandra East, Mumbai",
      distance: "3.5 km",
      requestType: "Medical Appointment",
      urgency: "high",
      description: "Need assistance for doctor appointment at Lilavati Hospital.",
      timeNeeded: "4 hours",
      compensation: "₹400",
      status: "available"
    },
    {
      id: "REQ003",
      seniorName: "Mrs. Reddy",
      age: 75,
      location: "Juhu, Mumbai",
      distance: "2.8 km",
      requestType: "Home Maintenance",
      urgency: "low",
      description: "Help with changing light bulbs and minor repairs.",
      timeNeeded: "1 hour",
      compensation: "₹150",
      status: "available"
    }
  ];

  const myRequests = [
    {
      id: "REQ004",
      seniorName: "Mrs. Mehta",
      age: 70,
      requestType: "Companionship",
      status: "in-progress",
      scheduledDate: "2024-01-18",
      scheduledTime: "10:00 AM",
      duration: "2 hours"
    },
    {
      id: "REQ005",
      seniorName: "Mr. Kumar",
      age: 65,
      requestType: "Technology Help",
      status: "completed",
      completedDate: "2024-01-15",
      rating: 5,
      feedback: "Very helpful and patient with technology issues."
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'available':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">CareConnect</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger-400"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                  <span className="text-success-600 font-semibold text-sm">P</span>
                </div>
                <span className="text-gray-900 font-medium">Priya Sharma</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Priya!</h1>
          <p className="text-gray-600">Here's your volunteer dashboard and available requests.</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Requests",
              value: volunteerStats.totalRequests,
              icon: <Users className="w-6 h-6" />,
              color: "primary"
            },
            {
              title: "Completed",
              value: volunteerStats.completedRequests,
              icon: <CheckCircle className="w-6 h-6" />,
              color: "success"
            },
            {
              title: "Hours Volunteered",
              value: volunteerStats.hoursVolunteered,
              icon: <Clock className="w-6 h-6" />,
              color: "warning"
            },
            {
              title: "Rating",
              value: volunteerStats.rating,
              icon: <Star className="w-6 h-6" />,
              color: "secondary"
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`card border-l-4 border-${stat.color}-500`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <div className={`text-${stat.color}-600`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'requests', label: 'Available Requests', count: availableRequests.length },
                { id: 'my-requests', label: 'My Requests', count: myRequests.length },
                { id: 'schedule', label: 'Schedule', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Available Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Requests</option>
                  <option value="urgent">Urgent</option>
                  <option value="nearby">Nearby</option>
                  <option value="grocery">Grocery</option>
                  <option value="medical">Medical</option>
                </select>
              </div>
              <button className="btn-primary">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </button>
            </div>

            {/* Requests Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {availableRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.seniorName}</h3>
                      <p className="text-sm text-gray-600">{request.age} years old</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`badge badge-${getUrgencyColor(request.urgency)}`}>
                        {request.urgency === 'high' ? 'Urgent' : request.urgency === 'medium' ? 'Normal' : 'Low Priority'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {request.location} ({request.distance})
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {request.timeNeeded} • {request.compensation}
                    </div>
                    <p className="text-sm text-gray-700">{request.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{request.requestType}</span>
                    <div className="flex space-x-2">
                      <button className="btn-secondary text-sm px-3 py-1">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Message
                      </button>
                      <button className="btn-primary text-sm px-3 py-1">
                        Accept Request
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'my-requests' && (
          <div className="space-y-6">
            {myRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{request.seniorName}</h3>
                    <p className="text-sm text-gray-600">{request.age} years old</p>
                  </div>
                  <span className={`badge badge-${getStatusColor(request.status)}`}>
                    {request.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {request.status === 'in-progress' 
                      ? `Scheduled: ${request.scheduledDate} at ${request.scheduledTime}`
                      : `Completed: ${request.completedDate}`
                    }
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    Duration: {request.duration}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{request.requestType}</p>
                  {request.status === 'completed' && request.rating && (
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(request.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 ml-2">{request.feedback}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button className="btn-secondary text-sm px-3 py-1">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </button>
                  <button className="btn-primary text-sm px-3 py-1">
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </button>
                  {request.status === 'in-progress' && (
                    <button className="btn-success text-sm px-3 py-1">
                      Mark Complete
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Schedule</h3>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming appointments scheduled.</p>
              <Link to="/volunteer/requests" className="btn-primary mt-4">
                Browse Available Requests
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard; 