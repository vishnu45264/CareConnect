import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Bell
} from 'lucide-react';

const SeniorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

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

  const currentVolunteer = {
    name: "Priya Sharma",
    avatar: "PS",
    rating: 4.8,
    location: "2.5 km away",
    nextVisit: "Tomorrow, 10:00 AM",
    services: ["Grocery Shopping", "Medication Pickup"],
    phone: "+91 98765 43210"
  };

  const upcomingMedications = [
    {
      name: "Blood Pressure Medicine",
      time: "9:00 AM",
      taken: true,
      dosage: "1 tablet"
    },
    {
      name: "Diabetes Medicine",
      time: "2:00 PM",
      taken: false,
      dosage: "1 tablet"
    },
    {
      name: "Vitamin D",
      time: "8:00 PM",
      taken: false,
      dosage: "1 capsule"
    }
  ];

  const recentRequests = [
    {
      id: "REQ001",
      type: "Grocery Shopping",
      status: "completed",
      date: "2024-01-15",
      volunteer: "Priya Sharma"
    },
    {
      id: "REQ002",
      type: "Medical Appointment",
      status: "in-progress",
      date: "2024-01-16",
      volunteer: "Rahul Kumar"
    },
    {
      id: "REQ003",
      type: "Home Maintenance",
      status: "pending",
      date: "2024-01-17",
      volunteer: null
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
      default:
        return 'gray';
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
      default:
        return status;
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
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">M</span>
                </div>
                <span className="text-gray-900 font-medium">Mrs. Mehta</span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Mrs. Mehta!</h1>
          <p className="text-gray-600">Here's what's happening with your care today.</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={action.link} className="block">
                <div className={`card hover:shadow-md transition-shadow duration-200 cursor-pointer border-l-4 border-${action.color}-500`}>
                  <div className={`w-12 h-12 bg-${action.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                    <div className={`text-${action.color}-600`}>
                      {action.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Volunteer */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Volunteer</h2>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{currentVolunteer.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-xl">{currentVolunteer.avatar}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentVolunteer.name}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {currentVolunteer.location}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Next Visit:</span>
                  <span className="font-medium">{currentVolunteer.nextVisit}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{currentVolunteer.phone}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Services Provided:</h4>
                <div className="space-y-1">
                  {currentVolunteer.services.map((service, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-success-500 mr-2" />
                      {service}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 btn-primary">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </button>
                <button className="flex-1 btn-secondary">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Medication Reminders */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Today's Medications</h2>
                <Link to="/senior/health-tracker" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All
                </Link>
              </div>
              
              <div className="space-y-3">
                {upcomingMedications.map((medication, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Pill className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">{medication.name}</p>
                        <p className="text-sm text-gray-600">{medication.dosage}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{medication.time}</span>
                      {medication.taken ? (
                        <CheckCircle className="w-5 h-5 text-success-500" />
                      ) : (
                        <button className="btn-success text-sm px-3 py-1">
                          Mark Taken
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Requests */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Requests</h2>
                <Link to="/senior/request-help" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  New Request
                </Link>
              </div>
              
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-${getStatusColor(request.status)}-500`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{request.type}</p>
                        <p className="text-sm text-gray-600">
                          {request.volunteer ? `Assigned to ${request.volunteer}` : 'Awaiting volunteer'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{request.date}</p>
                      <span className={`badge badge-${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Summary */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Health Summary</h2>
                <Activity className="w-5 h-5 text-primary-600" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Heart className="w-6 h-6 text-success-600" />
                  </div>
                  <p className="text-sm text-gray-600">Blood Pressure</p>
                  <p className="font-semibold text-gray-900">120/80</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Activity className="w-6 h-6 text-primary-600" />
                  </div>
                  <p className="text-sm text-gray-600">Blood Sugar</p>
                  <p className="font-semibold text-gray-900">95 mg/dL</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6 text-warning-600" />
                  </div>
                  <p className="text-sm text-gray-600">Last Check</p>
                  <p className="font-semibold text-gray-900">2 days ago</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-6 h-6 text-secondary-600" />
                  </div>
                  <p className="text-sm text-gray-600">Next Visit</p>
                  <p className="font-semibold text-gray-900">Jan 20</p>
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