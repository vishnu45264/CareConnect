import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Heart, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  userType: 'senior' | 'volunteer';
  age?: number;
  address?: string;
  emergencyContact?: string;
  skills?: string[];
  availability?: string[];
  agreeToTerms: boolean;
}

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultUserType = searchParams.get('type') as 'senior' | 'volunteer' || 'senior';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<RegisterFormData>({
    defaultValues: {
      userType: defaultUserType,
      agreeToTerms: false
    }
  });

  const userType = watch('userType');
  const password = watch('password');

  const volunteerSkills = [
    'Grocery Shopping',
    'Medical Appointments',
    'Home Maintenance',
    'Companionship',
    'Technology Help',
    'Transportation',
    'Meal Preparation',
    'Medication Reminders'
  ];

  const availabilityOptions = [
    'Monday Morning',
    'Monday Afternoon',
    'Tuesday Morning',
    'Tuesday Afternoon',
    'Wednesday Morning',
    'Wednesday Afternoon',
    'Thursday Morning',
    'Thursday Afternoon',
    'Friday Morning',
    'Friday Afternoon',
    'Saturday Morning',
    'Saturday Afternoon',
    'Sunday Morning',
    'Sunday Afternoon'
  ];

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Welcome to CareConnect! Your ${data.userType} account has been created.`);
      
      // Redirect based on user type
      if (data.userType === 'senior') {
        navigate('/senior/dashboard');
      } else {
        navigate('/volunteer/dashboard');
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <div className="flex justify-center mb-4">
              <Heart className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Join CareConnect</h2>
            <p className="mt-2 text-gray-600">Create your account and start making a difference</p>
          </div>

          {/* User Type Selection */}
          <div className="card mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">I want to join as:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  value: 'senior',
                  label: 'Senior Citizen',
                  description: 'I need assistance with daily tasks and care',
                  icon: '👵',
                  color: 'primary'
                },
                {
                  value: 'volunteer',
                  label: 'Volunteer',
                  description: 'I want to help seniors in my community',
                  icon: '🤝',
                  color: 'success'
                }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setValue('userType', type.value as 'senior' | 'volunteer')}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                    userType === type.value
                      ? `border-${type.color}-500 bg-${type.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{type.label}</h4>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                      id="firstName"
                      type="text"
                      {...register('firstName', { required: 'First name is required' })}
                      className="input-field"
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-danger-600">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      {...register('lastName', { required: 'Last name is required' })}
                      className="input-field"
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-danger-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className="input-field"
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      {...register('phone', { required: 'Phone number is required' })}
                      className="input-field"
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-danger-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Senior-specific fields */}
              {userType === 'senior' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="age" className="form-label">Age</label>
                      <input
                        id="age"
                        type="number"
                        {...register('age', { 
                          required: 'Age is required',
                          min: { value: 60, message: 'Must be 60 or older' }
                        })}
                        className="input-field"
                        placeholder="Enter your age"
                      />
                      {errors.age && (
                        <p className="mt-1 text-sm text-danger-600">{errors.age.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="emergencyContact" className="form-label">Emergency Contact</label>
                      <input
                        id="emergencyContact"
                        type="tel"
                        {...register('emergencyContact', { required: 'Emergency contact is required' })}
                        className="input-field"
                        placeholder="Emergency contact number"
                      />
                      {errors.emergencyContact && (
                        <p className="mt-1 text-sm text-danger-600">{errors.emergencyContact.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="address" className="form-label">Address</label>
                    <textarea
                      id="address"
                      {...register('address', { required: 'Address is required' })}
                      className="input-field"
                      rows={3}
                      placeholder="Enter your full address"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-danger-600">{errors.address.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Volunteer-specific fields */}
              {userType === 'volunteer' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Volunteer Information</h3>
                  <div>
                    <label className="form-label">Skills & Services</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {volunteerSkills.map((skill) => (
                        <label key={skill} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value={skill}
                            {...register('skills')}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="form-label">Availability</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {availabilityOptions.map((option) => (
                        <label key={option} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value={option}
                            {...register('availability')}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters'
                          }
                        })}
                        className="input-field pr-10"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: value => value === password || 'Passwords do not match'
                        })}
                        className="input-field pr-10"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-danger-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    {...register('agreeToTerms', { 
                      required: 'You must agree to the terms and conditions' 
                    })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-danger-600">{errors.agreeToTerms.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage; 