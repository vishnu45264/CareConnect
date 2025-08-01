import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  Star,
  Plus,
  Filter,
  Search
} from 'lucide-react';

const CommunityEventsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filterCategory, setFilterCategory] = useState('all');

  const upcomingEvents = [
    {
      id: 1,
      title: "Senior Yoga Session",
      description: "Gentle yoga session designed for seniors to improve flexibility and balance.",
      category: "Health & Wellness",
      date: "2024-01-20",
      time: "9:00 AM - 10:30 AM",
      location: "Community Center, Andheri West",
      participants: 12,
      maxParticipants: 20,
      organizer: "Priya Sharma",
      rating: 4.8,
      isRegistered: true
    },
    {
      id: 2,
      title: "Technology Workshop",
      description: "Learn to use smartphones and tablets for staying connected with family.",
      category: "Technology",
      date: "2024-01-22",
      time: "2:00 PM - 4:00 PM",
      location: "Digital Learning Center, Bandra",
      participants: 8,
      maxParticipants: 15,
      organizer: "Rahul Kumar",
      rating: 4.6,
      isRegistered: false
    },
    {
      id: 3,
      title: "Book Club Meeting",
      description: "Monthly book discussion and social gathering for literature lovers.",
      category: "Social",
      date: "2024-01-25",
      time: "3:00 PM - 5:00 PM",
      location: "Public Library, Juhu",
      participants: 15,
      maxParticipants: 25,
      organizer: "Mrs. Mehta",
      rating: 4.9,
      isRegistered: false
    }
  ];

  const pastEvents = [
    {
      id: 4,
      title: "Cooking Class",
      description: "Learn healthy cooking techniques and recipes suitable for seniors.",
      category: "Cooking",
      date: "2024-01-15",
      time: "11:00 AM - 1:00 PM",
      location: "Community Kitchen, Andheri",
      participants: 18,
      maxParticipants: 20,
      organizer: "Chef Amit",
      rating: 4.7,
      isRegistered: true
    }
  ];

  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'health', name: 'Health & Wellness' },
    { id: 'technology', name: 'Technology' },
    { id: 'social', name: 'Social' },
    { id: 'cooking', name: 'Cooking' },
    { id: 'arts', name: 'Arts & Crafts' }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Health & Wellness':
        return 'success';
      case 'Technology':
        return 'primary';
      case 'Social':
        return 'secondary';
      case 'Cooking':
        return 'warning';
      case 'Arts & Crafts':
        return 'danger';
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
            <Link to="/senior/dashboard" className="btn-secondary">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Events</h1>
            <p className="text-gray-600">Join social activities and connect with your community.</p>
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'upcoming', label: 'Upcoming Events', count: upcomingEvents.length },
                  { id: 'past', label: 'Past Events', count: pastEvents.length }
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

          {/* Events Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(activeTab === 'upcoming' ? upcomingEvents : pastEvents).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  </div>
                  <span className={`badge badge-${getCategoryColor(event.category)}`}>
                    {event.category}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {event.participants}/{event.maxParticipants} participants
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>Organized by: {event.organizer}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{event.rating}</span>
                  </div>
                  <div className="flex space-x-2">
                    {event.isRegistered ? (
                      <span className="badge badge-success">Registered</span>
                    ) : (
                      <button className="btn-primary text-sm px-4 py-2">
                        Register
                      </button>
                    )}
                    <button className="btn-secondary text-sm px-4 py-2">
                      Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Featured Event */}
          <div className="mt-8 card bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Event</h2>
              <div className="max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Monthly Community Meetup</h3>
                <p className="text-gray-600 mb-4">
                  Join us for our monthly community gathering where seniors can socialize, 
                  share experiences, and participate in various activities.
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mb-6">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    January 30, 2024
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    4:00 PM - 6:00 PM
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Community Hall
                  </span>
                </div>
                <button className="btn-primary px-8 py-3">
                  Join Featured Event
                </button>
              </div>
            </div>
          </div>

          {/* Event Categories */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(1).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFilterCategory(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    filterCategory === category.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityEventsPage; 