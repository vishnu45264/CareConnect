import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Users, 
  Shield, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  MapPin,
  Phone,
  Mail,
  Filter,
  Search
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const adminStats = {
    totalUsers: 1247,
    seniors: 892,
    volunteers: 355,
    pendingVerifications: 23,
    totalRequests: 456,
    completedRequests: 389,
    activeVolunteers: 234,
    averageRating: 4.6
  };

  const pendingVerifications = [
    {
      id: "VOL001",
      name: "Rahul Kumar",
      email: "rahul.kumar@email.com",
      phone: "+91 98765 43210",
      location: "Mumbai, Maharashtra",
      skills: ["Grocery Shopping", "Medical Appointments", "Companionship"],
      submittedDate: "2024-01-15",
      documents: ["ID Proof", "Address Proof", "Background Check"]
    },
    {
      id: "VOL002",
      name: "Priya Sharma",
      email: "priya.sharma@email.com",
      phone: "+91 87654 32109",
      location: "Delhi, NCR",
      skills: ["Technology Help", "Transportation", "Home Maintenance"],
      submittedDate: "2024-01-14",
      documents: ["ID Proof", "Address Proof"]
    },
    {
      id: "VOL003",
      name: "Amit Patel",
      email: "amit.patel@email.com",
      phone: "+91 76543 21098",
      location: "Bangalore, Karnataka",
      skills: ["Meal Preparation", "Medication Reminders", "Companionship"],
      submittedDate: "2024-01-13",
      documents: ["ID Proof", "Address Proof", "Background Check", "Medical Certificate"]
    }
  ];

  const recentRequests = [
    {
      id: "REQ001",
      seniorName: "Mrs. Mehta",
      volunteerName: "Priya Sharma",
      type: "Grocery Shopping",
      status: "completed",
      date: "2024-01-15",
      rating: 5
    },
    {
      id: "REQ002",
      seniorName: "Mr. Sharma",
      volunteerName: "Rahul Kumar",
      type: "Medical Appointment",
      status: "in-progress",
      date: "2024-01-16",
      rating: null
    },
    {
      id: "REQ003",
      seniorName: "Mrs. Reddy",
      volunteerName: null,
      type: "Home Maintenance",
      status: "pending",
      date: "2024-01-17",
      rating: null
    }
  ];

  const analytics = {
    monthlyGrowth: 12.5,
    requestCompletionRate: 85.3,
    averageResponseTime: "2.3 hours",
    topVolunteer: "Priya Sharma",
    topLocation: "Mumbai",
    mostRequestedService: "Grocery Shopping"
  };

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
              <span className="ml-2 text-xl font-bold text-gray-900">CareConnect Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                  <span className="text-secondary-600 font-semibold text-sm">A</span>
                </div>
                <span className="text-gray-900 font-medium">Admin</span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage the CareConnect platform.</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Users",
              value: adminStats.totalUsers,
              change: "+12%",
              trend: "up",
              icon: <Users className="w-6 h-6" />,
              color: "primary"
            },
            {
              title: "Active Volunteers",
              value: adminStats.activeVolunteers,
              change: "+8%",
              trend: "up",
              icon: <Shield className="w-6 h-6" />,
              color: "success"
            },
            {
              title: "Pending Verifications",
              value: adminStats.pendingVerifications,
              change: "-5%",
              trend: "down",
              icon: <AlertCircle className="w-6 h-6" />,
              color: "warning"
            },
            {
              title: "Avg. Rating",
              value: adminStats.averageRating,
              change: "+0.2",
              trend: "up",
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
                    <div className="flex items-center mt-1">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-success-600 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-danger-600 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
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
                { id: 'overview', label: 'Overview' },
                { id: 'verifications', label: 'Verifications', count: pendingVerifications.length },
                { id: 'requests', label: 'Requests' },
                { id: 'analytics', label: 'Analytics' }
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
                  {tab.count && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentRequests.map((request, index) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-${getStatusColor(request.status)}-500`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{request.seniorName}</p>
                        <p className="text-sm text-gray-600">{request.type}</p>
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

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary">
                  <Shield className="w-4 h-4 mr-2" />
                  Review Pending Verifications
                </button>
                <button className="w-full btn-secondary">
                  <Activity className="w-4 h-4 mr-2" />
                  View Analytics Report
                </button>
                <button className="w-full btn-secondary">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </button>
                <button className="w-full btn-secondary">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Broadcast Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verifications Tab */}
        {activeTab === 'verifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Pending Verifications</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search volunteers..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="">All Skills</option>
                  <option value="grocery">Grocery Shopping</option>
                  <option value="medical">Medical Appointments</option>
                  <option value="technology">Technology Help</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {pendingVerifications.map((volunteer, index) => (
                <motion.div
                  key={volunteer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {volunteer.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{volunteer.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {volunteer.email}
                            </span>
                            <span className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {volunteer.phone}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {volunteer.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Skills & Services</h5>
                        <div className="flex flex-wrap gap-2">
                          {volunteer.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="badge badge-primary">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Submitted Documents</h5>
                        <div className="flex flex-wrap gap-2">
                          {volunteer.documents.map((doc, docIndex) => (
                            <span key={docIndex} className="badge badge-success">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        Submitted: {volunteer.submittedDate}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button className="btn-success text-sm px-4 py-2">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button className="btn-danger text-sm px-4 py-2">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                      <button className="btn-secondary text-sm px-4 py-2">
                        <Mail className="w-4 h-4 mr-1" />
                        Contact
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Analytics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Growth</span>
                  <span className="font-semibold text-success-600">+{analytics.monthlyGrowth}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Request Completion Rate</span>
                  <span className="font-semibold text-primary-600">{analytics.requestCompletionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Response Time</span>
                  <span className="font-semibold text-gray-900">{analytics.averageResponseTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Top Volunteer</span>
                  <span className="font-semibold text-gray-900">{analytics.topVolunteer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Top Location</span>
                  <span className="font-semibold text-gray-900">{analytics.topLocation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Most Requested Service</span>
                  <span className="font-semibold text-gray-900">{analytics.mostRequestedService}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Seniors</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                    <span className="font-semibold text-gray-900">{adminStats.seniors}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Volunteers</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-success-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                    <span className="font-semibold text-gray-900">{adminStats.volunteers}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 