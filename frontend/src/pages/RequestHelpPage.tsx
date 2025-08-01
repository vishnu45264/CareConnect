import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  Heart, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Phone,
  MessageCircle,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RequestFormData {
  category: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  preferredDate: string;
  preferredTime: string;
  duration: string;
  location: string;
  budget: string;
  specialRequirements: string;
}

const RequestHelpPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<RequestFormData>({
    defaultValues: {
      urgency: 'medium'
    }
  });

  const selectedCategory = watch('category');

  const categories = [
    {
      id: 'grocery',
      name: 'Grocery Shopping',
      icon: '🛒',
      description: 'Help with grocery shopping and errands',
      color: 'primary'
    },
    {
      id: 'medical',
      name: 'Medical Appointments',
      icon: '🏥',
      description: 'Assistance with doctor visits and medical care',
      color: 'danger'
    },
    {
      id: 'transportation',
      name: 'Transportation',
      icon: '🚗',
      description: 'Help with getting around and travel',
      color: 'warning'
    },
    {
      id: 'home-maintenance',
      name: 'Home Maintenance',
      icon: '🔧',
      description: 'Minor repairs and home improvement tasks',
      color: 'secondary'
    },
    {
      id: 'companionship',
      name: 'Companionship',
      icon: '👥',
      description: 'Social visits and companionship',
      color: 'success'
    },
    {
      id: 'technology',
      name: 'Technology Help',
      icon: '💻',
      description: 'Help with phones, computers, and devices',
      color: 'primary'
    },
    {
      id: 'meal-preparation',
      name: 'Meal Preparation',
      icon: '🍽️',
      description: 'Help with cooking and meal planning',
      color: 'warning'
    },
    {
      id: 'medication',
      name: 'Medication Reminders',
      icon: '💊',
      description: 'Help with medication management',
      color: 'danger'
    }
  ];

  const urgencyOptions = [
    { value: 'low', label: 'Low Priority', description: 'Can wait a few days', color: 'success' },
    { value: 'medium', label: 'Normal Priority', description: 'Within 1-2 days', color: 'warning' },
    { value: 'high', label: 'Urgent', description: 'Needed today or tomorrow', color: 'danger' }
  ];

  const durationOptions = [
    { value: '1-hour', label: '1 Hour' },
    { value: '2-hours', label: '2 Hours' },
    { value: '3-hours', label: '3 Hours' },
    { value: '4-hours', label: '4 Hours' },
    { value: 'half-day', label: 'Half Day' },
    { value: 'full-day', label: 'Full Day' }
  ];

  const onSubmit = async (data: RequestFormData) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Your request has been submitted successfully! We\'ll match you with a volunteer soon.');
      navigate('/senior/dashboard');
    }, 2000);
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Help</h1>
            <p className="text-gray-600">Tell us what kind of assistance you need and we'll connect you with a volunteer.</p>
          </div>

          {/* Request Form */}
          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Category Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What type of help do you need?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedCategory === category.id
                          ? `border-${category.color}-500 bg-${category.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={category.id}
                        {...register('category', { required: 'Please select a category' })}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-2xl mb-2">{category.icon}</div>
                        <h4 className="font-semibold text-gray-900 text-sm">{category.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.category && (
                  <p className="mt-2 text-sm text-danger-600">{errors.category.message}</p>
                )}
              </div>

              {/* Request Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="form-label">Request Title</label>
                    <input
                      id="title"
                      type="text"
                      {...register('title', { required: 'Title is required' })}
                      className="input-field"
                      placeholder="Brief description of what you need"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-danger-600">{errors.title.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="urgency" className="form-label">Urgency Level</label>
                    <select
                      id="urgency"
                      {...register('urgency', { required: 'Please select urgency level' })}
                      className="input-field"
                    >
                      {urgencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} - {option.description}
                        </option>
                      ))}
                    </select>
                    {errors.urgency && (
                      <p className="mt-1 text-sm text-danger-600">{errors.urgency.message}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="description" className="form-label">Detailed Description</label>
                  <textarea
                    id="description"
                    {...register('description', { 
                      required: 'Description is required',
                      minLength: { value: 20, message: 'Please provide more details (at least 20 characters)' }
                    })}
                    className="input-field"
                    rows={4}
                    placeholder="Please provide detailed information about what you need help with..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
                  )}
                </div>
              </div>

              {/* Schedule */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">When do you need help?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="preferredDate" className="form-label">Preferred Date</label>
                    <input
                      id="preferredDate"
                      type="date"
                      {...register('preferredDate', { required: 'Date is required' })}
                      className="input-field"
                    />
                    {errors.preferredDate && (
                      <p className="mt-1 text-sm text-danger-600">{errors.preferredDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="preferredTime" className="form-label">Preferred Time</label>
                    <select
                      id="preferredTime"
                      {...register('preferredTime', { required: 'Time is required' })}
                      className="input-field"
                    >
                      <option value="">Select time</option>
                      <option value="morning">Morning (8 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                      <option value="evening">Evening (4 PM - 8 PM)</option>
                      <option value="flexible">Flexible</option>
                    </select>
                    {errors.preferredTime && (
                      <p className="mt-1 text-sm text-danger-600">{errors.preferredTime.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="duration" className="form-label">Expected Duration</label>
                    <select
                      id="duration"
                      {...register('duration', { required: 'Duration is required' })}
                      className="input-field"
                    >
                      <option value="">Select duration</option>
                      {durationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.duration && (
                      <p className="mt-1 text-sm text-danger-600">{errors.duration.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location and Budget */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Budget</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                      id="location"
                      type="text"
                      {...register('location', { required: 'Location is required' })}
                      className="input-field"
                      placeholder="Your address or meeting point"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-danger-600">{errors.location.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="budget" className="form-label">Budget (Optional)</label>
                    <input
                      id="budget"
                      type="text"
                      {...register('budget')}
                      className="input-field"
                      placeholder="e.g., ₹200-500"
                    />
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requirements</h3>
                <textarea
                  id="specialRequirements"
                  {...register('specialRequirements')}
                  className="input-field"
                  rows={3}
                  placeholder="Any special requirements, preferences, or additional information..."
                />
              </div>

              {/* Emergency Contact */}
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-warning-800">Emergency Contact</h4>
                    <p className="text-sm text-warning-700 mt-1">
                      Make sure your emergency contact information is up to date in your profile. 
                      Volunteers will have access to this information for your safety.
                    </p>
                    <Link to="/senior/dashboard" className="text-sm text-warning-600 hover:text-warning-500 font-medium mt-2 inline-block">
                      Update Emergency Contact →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <Link to="/senior/dashboard" className="btn-secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting Request...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Submit Request
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Help Section */}
          <div className="mt-8 card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Immediate Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/emergency" className="btn-danger w-full">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Emergency SOS
              </Link>
              <button className="btn-secondary w-full">
                <Phone className="w-5 h-5 mr-2" />
                Call Support
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RequestHelpPage; 