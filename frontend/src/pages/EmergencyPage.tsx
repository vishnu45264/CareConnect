import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  ArrowLeft, 
  Phone, 
  AlertTriangle,
  Shield,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const EmergencyPage: React.FC = () => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [emergencyType, setEmergencyType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isEmergencyActive && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      triggerEmergency();
    }
    return () => clearTimeout(timer);
  }, [isEmergencyActive, countdown]);

  const triggerEmergency = () => {
    setIsEmergencyActive(false);
    toast.success('Emergency alert sent! Help is on the way.');
    // Simulate emergency response
    setTimeout(() => {
      navigate('/senior/dashboard');
    }, 3000);
  };

  const cancelEmergency = () => {
    setIsEmergencyActive(false);
    setCountdown(10);
    toast.success('Emergency cancelled.');
  };

  const emergencyTypes = [
    {
      id: 'medical',
      name: 'Medical Emergency',
      description: 'Health issue requiring immediate attention',
      icon: '🏥',
      color: 'danger'
    },
    {
      id: 'fall',
      name: 'Fall or Injury',
      description: 'Accident or injury requiring assistance',
      icon: '⚠️',
      color: 'danger'
    },
    {
      id: 'security',
      name: 'Security Concern',
      description: 'Feeling unsafe or security issue',
      icon: '🛡️',
      color: 'warning'
    },
    {
      id: 'other',
      name: 'Other Emergency',
      description: 'Other urgent situation',
      icon: '🚨',
      color: 'danger'
    }
  ];

  const emergencyContacts = [
    {
      name: 'Emergency Services',
      number: '100',
      type: 'Police'
    },
    {
      name: 'Ambulance',
      number: '102',
      type: 'Medical'
    },
    {
      name: 'Fire Department',
      number: '101',
      type: 'Fire'
    },
    {
      name: 'CareConnect Support',
      number: '1800-CARE',
      type: 'Support'
    }
  ];

  const quickActions = [
    {
      title: 'Call Emergency Services',
      description: 'Immediate police, ambulance, or fire response',
      action: () => window.open('tel:100', '_self'),
      color: 'danger'
    },
    {
      title: 'Contact CareConnect',
      description: '24/7 support and volunteer assistance',
      action: () => window.open('tel:1800-CARE', '_self'),
      color: 'primary'
    },
    {
      title: 'Alert Nearby Volunteers',
      description: 'Notify volunteers in your area',
      action: () => {
        toast.success('Nearby volunteers have been alerted!');
      },
      color: 'success'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-danger-50 to-red-50">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Emergency Alert */}
          {isEmergencyActive && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="fixed inset-0 bg-danger-600 bg-opacity-90 flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
                <AlertTriangle className="w-16 h-16 text-danger-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency Alert!</h2>
                <p className="text-gray-600 mb-6">
                  Emergency services and nearby volunteers are being notified.
                </p>
                <div className="text-4xl font-bold text-danger-600 mb-6">{countdown}</div>
                <div className="flex space-x-4">
                  <button
                    onClick={cancelEmergency}
                    className="btn-secondary flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={triggerEmergency}
                    className="btn-danger flex-1"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-danger-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency SOS</h1>
            <p className="text-gray-600">Get immediate help when you need it most.</p>
          </div>

          {/* Emergency Type Selection */}
          {!isEmergencyActive && (
            <div className="card mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What type of emergency?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setEmergencyType(type.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      emergencyType === type.id
                        ? 'border-danger-500 bg-danger-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{type.name}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Actions */}
          {!isEmergencyActive && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={action.action}
                      className={`p-4 border-2 border-${action.color}-500 bg-${action.color}-50 rounded-lg text-left hover:bg-${action.color}-100 transition-colors duration-200`}
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contacts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emergencyContacts.map((contact, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.type}</p>
                      </div>
                      <button
                        onClick={() => window.open(`tel:${contact.number}`, '_self')}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Emergency SOS Button */}
              <div className="card bg-danger-50 border-danger-200">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-danger-600 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Emergency SOS</h2>
                  <p className="text-gray-600 mb-6">
                    Press this button to immediately alert emergency services and nearby volunteers.
                  </p>
                  <button
                    onClick={() => setIsEmergencyActive(true)}
                    className="btn-danger text-lg px-8 py-4 w-full md:w-auto"
                  >
                    <AlertTriangle className="w-6 h-6 mr-2" />
                    SOS - Emergency Alert
                  </button>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Safety Tips</h2>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
                    <p className="text-sm text-gray-700">Stay calm and try to remain in a safe location</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
                    <p className="text-sm text-gray-700">If possible, have your emergency contact information ready</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
                    <p className="text-sm text-gray-700">Keep your phone charged and accessible</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
                    <p className="text-sm text-gray-700">If you're in immediate danger, call emergency services first</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Back to Dashboard */}
          {!isEmergencyActive && (
            <div className="text-center mt-8">
              <Link to="/senior/dashboard" className="btn-secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EmergencyPage; 