import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Filter,
  Search,
  Phone,
  MessageCircle
} from 'lucide-react';

const VolunteerRequestsPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDistance, setFilterDistance] = useState('all');

  const requests = [
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
      status: "available",
      seniorRating: 4.8,
      seniorRequests: 15
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
      status: "available",
      seniorRating: 4.9,
      seniorRequests: 8
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
      status: "available",
      seniorRating: 4.7,
      seniorRequests: 12
    },
    {
      id: "REQ004",
      seniorName: "Mr. Kumar",
      age: 70,
      location: "Santacruz, Mumbai",
      distance: "4.1 km",
      requestType: "Technology Help",
      urgency: "medium",
      description: "Help with setting up video calls and using smartphone apps.",
      timeNeeded: "2 hours",
      compensation: "₹250",
      status: "available",
      seniorRating: 4.6,
      seniorRequests: 6
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
            <Link to="/volunteer/dashboard" className="btn-secondary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Requests</h1>
            <p className="text-gray-600">Browse and accept requests from seniors in your area.</p>
          </div>

          {/* Filters */}
          <div className="card mb-6">
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
                  <option value="technology">Technology</option>
                </select>
                <select
                  value={filterDistance}
                  onChange={(e) => setFilterDistance(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Any Distance</option>
                  <option value="near">Within 2 km</option>
                  <option value="medium">Within 5 km</option>
                  <option value="far">Within 10 km</option>
                </select>
              </div>
              <button className="btn-primary">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </button>
            </div>
          </div>

          {/* Requests Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map((request, index) => (
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

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-900">{request.requestType}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{request.seniorRating}</span>
                    <span className="text-sm text-gray-600">({request.seniorRequests} requests)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button className="btn-secondary text-sm px-3 py-1">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </button>
                    <button className="btn-secondary text-sm px-3 py-1">
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </button>
                  </div>
                  <button className="btn-primary text-sm px-4 py-2">
                    Accept Request
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* No Requests Message */}
          {requests.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Requests Available</h3>
              <p className="text-gray-600 mb-4">
                There are currently no requests in your area. Check back later or adjust your filters.
              </p>
              <button className="btn-primary">
                Refresh Requests
              </button>
            </div>
          )}

          {/* Tips Section */}
          <div className="mt-8 card bg-primary-50 border-primary-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Volunteer Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Be Punctual</h4>
                <p className="text-sm text-gray-600">Arrive on time for scheduled appointments</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Communicate</h4>
                <p className="text-sm text-gray-600">Keep seniors informed about your arrival</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Be Patient</h4>
                <p className="text-sm text-gray-600">Show understanding and compassion</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VolunteerRequestsPage; 