import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Shield,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }

      // Validate response structure
      if (!data.data || (!data.data.user && !data.data.token)) {
        throw new Error('Invalid response structure from server');
      }

      // Store token and user data in localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user || data.data));

      toast.success('Welcome back! Redirecting to your dashboard...');

      // Redirect based on role
      const userRole = (data.data.user || data.data).role;
      if (userRole === 'senior') {
        navigate('/senior-dashboard');
      } else {
        navigate('/volunteer-dashboard');
      }

    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Secure & Private",
      description: "Your data is protected with end-to-end encryption"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Community First",
      description: "Connect with verified volunteers in your area"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Always Available",
      description: "Get help whenever you need it, 24/7"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* iOS-style background with subtle gradients */}
      <div className="absolute inset-0">
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-100/40 via-transparent to-transparent"></div>
        
        {/* Floating orbs - iOS style */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-indigo-200/30 to-pink-200/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-28 h-28 bg-gradient-to-br from-green-200/30 to-blue-200/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-indigo-100/40 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left side - iOS-style content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:block"
        >
          <div className="text-center lg:text-left">
            {/* iOS-style logo */}
            <div className="flex items-center justify-center lg:justify-start mb-12">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="ml-6">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">CareConnect</h1>
                <p className="text-slate-600 mt-1">Connecting hearts, building communities</p>
              </div>
            </div>
            
            {/* iOS-style headline */}
            <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
              Welcome back to
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> your community</span>
            </h2>
            
            <p className="text-xl text-slate-600 mb-16 leading-relaxed max-w-lg">
              Sign in to access your personalized dashboard and continue making meaningful connections with your local community.
            </p>

            {/* iOS-style feature cards */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                  className="flex items-center space-x-4 group"
                >
                  <div className="w-12 h-12 bg-white/60 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg shadow-black/5 border border-white/20 group-hover:scale-105 transition-transform duration-200">
                    <div className="text-blue-600">
                      {feature.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                    <p className="text-slate-600 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right side - iOS-style login form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex justify-center lg:justify-end"
        >
          <div className="w-full max-w-md">
            {/* iOS-style card */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/10 border border-white/20 p-8">
              {/* iOS-style header */}
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/25">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                  Sign In
                </h2>
                <p className="text-slate-600">
                  Welcome back to CareConnect
                </p>
              </div>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-4 py-3 rounded-2xl flex items-center space-x-3"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}

                <div className="space-y-5">
                  {/* iOS-style email input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 border border-slate-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200 text-slate-900 placeholder-slate-400"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* iOS-style password input */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-3">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-12 py-4 border border-slate-200/50 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200 text-slate-900 placeholder-slate-400"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* iOS-style button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                {/* iOS-style footer */}
                <div className="text-center pt-6">
                  <p className="text-slate-600 text-sm">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Create one now
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage; 