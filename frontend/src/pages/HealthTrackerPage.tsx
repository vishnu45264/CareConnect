import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  ArrowLeft, 
  Pill, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const HealthTrackerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('medications');

  const medications = [
    {
      id: 1,
      name: "Blood Pressure Medicine",
      dosage: "1 tablet",
      frequency: "Twice daily",
      time: "9:00 AM & 9:00 PM",
      taken: true,
      lastTaken: "2024-01-16 09:00",
      nextDose: "2024-01-16 21:00"
    },
    {
      id: 2,
      name: "Diabetes Medicine",
      dosage: "1 tablet",
      frequency: "Once daily",
      time: "8:00 AM",
      taken: false,
      lastTaken: "2024-01-15 08:00",
      nextDose: "2024-01-16 08:00"
    },
    {
      id: 3,
      name: "Vitamin D",
      dosage: "1 capsule",
      frequency: "Once daily",
      time: "8:00 PM",
      taken: false,
      lastTaken: "2024-01-15 20:00",
      nextDose: "2024-01-16 20:00"
    }
  ];

  const healthMetrics = [
    {
      name: "Blood Pressure",
      value: "120/80",
      unit: "mmHg",
      status: "normal",
      trend: "stable",
      lastChecked: "2024-01-15"
    },
    {
      name: "Blood Sugar",
      value: "95",
      unit: "mg/dL",
      status: "normal",
      trend: "improving",
      lastChecked: "2024-01-14"
    },
    {
      name: "Weight",
      value: "65",
      unit: "kg",
      status: "normal",
      trend: "stable",
      lastChecked: "2024-01-10"
    },
    {
      name: "Heart Rate",
      value: "72",
      unit: "bpm",
      status: "normal",
      trend: "stable",
      lastChecked: "2024-01-15"
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Patel",
      specialty: "Cardiology",
      date: "2024-01-20",
      time: "10:00 AM",
      location: "Lilavati Hospital",
      type: "Follow-up"
    },
    {
      id: 2,
      doctor: "Dr. Sharma",
      specialty: "General Medicine",
      date: "2024-01-25",
      time: "2:00 PM",
      location: "Local Clinic",
      type: "Check-up"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'success';
      case 'high':
        return 'danger';
      case 'low':
        return 'warning';
      default:
        return 'gray';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="w-4 h-4 text-success-600" />;
      case 'worsening':
        return <TrendingUp className="w-4 h-4 text-danger-600" />;
      case 'stable':
        return <Activity className="w-4 h-4 text-gray-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Tracker</h1>
            <p className="text-gray-600">Manage your medications and track your health metrics.</p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'medications', label: 'Medications' },
                  { id: 'metrics', label: 'Health Metrics' },
                  { id: 'appointments', label: 'Appointments' }
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
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Medications Tab */}
          {activeTab === 'medications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Today's Medications</h2>
                <button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </button>
              </div>

              <div className="space-y-4">
                {medications.map((medication, index) => (
                  <motion.div
                    key={medication.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Pill className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{medication.dosage}</span>
                            <span>•</span>
                            <span>{medication.frequency}</span>
                            <span>•</span>
                            <span>{medication.time}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                            <span>Last taken: {medication.lastTaken}</span>
                            <span>Next dose: {medication.nextDose}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {medication.taken ? (
                          <div className="flex items-center text-success-600">
                            <CheckCircle className="w-5 h-5 mr-1" />
                            <span className="text-sm font-medium">Taken</span>
                          </div>
                        ) : (
                          <button className="btn-success text-sm px-4 py-2">
                            Mark as Taken
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Health Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Health Metrics</h2>
                <button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reading
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {healthMetrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {metric.value}
                      </div>
                      <div className="text-sm text-gray-600 mb-3">{metric.unit}</div>
                      <span className={`badge badge-${getStatusColor(metric.status)}`}>
                        {metric.status}
                      </span>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500">Last checked: {metric.lastChecked}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Health Tips */}
              <div className="card bg-primary-50 border-primary-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Tips</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
                    <p className="text-sm text-gray-700">Take your medications at the same time each day</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
                    <p className="text-sm text-gray-700">Monitor your blood pressure regularly</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
                    <p className="text-sm text-gray-700">Keep track of any side effects</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                <button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Appointment
                </button>
              </div>

              <div className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{appointment.doctor}</h3>
                          <p className="text-sm text-gray-600">{appointment.specialty}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {appointment.date}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {appointment.time}
                            </span>
                            <span>{appointment.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <span className="badge badge-primary">{appointment.type}</span>
                        <button className="btn-secondary text-sm px-3 py-1">
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Emergency Contact */}
              <div className="card bg-warning-50 border-warning-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-warning-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-warning-800">Emergency Contact</h4>
                    <p className="text-sm text-warning-700 mt-1">
                      If you experience any adverse reactions to your medications, contact your doctor immediately.
                    </p>
                    <button className="text-sm text-warning-600 hover:text-warning-500 font-medium mt-2">
                      Contact Doctor →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HealthTrackerPage; 