const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const requestRoutes = require('./routes/requests');
const healthRoutes = require('./routes/health');
const emergencyRoutes = require('./routes/emergency');
const communityRoutes = require('./routes/community');
const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting - More lenient for development
const createRateLimiter = (windowMs, maxRequests) => rateLimit({
  windowMs,
  max: maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(windowMs / 1000 / 60) // minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000 / 60),
      message: `Rate limit exceeded. Try again in ${Math.ceil(windowMs / 1000 / 60)} minutes.`
    });
  }
});

// Different rate limits for different environments
const isDevelopment = process.env.NODE_ENV === 'development';
const disableRateLimit = process.env.DISABLE_RATE_LIMIT === 'true';
const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (isDevelopment ? 1000 : 100);

if (disableRateLimit && isDevelopment) {
  console.log('⚠️  Rate limiting disabled for development');
} else {
  const limiter = createRateLimiter(rateLimitWindow, rateLimitMax);
  // Apply rate limiting to API routes
  app.use('/api/', limiter);
  // Log rate limiting configuration
  console.log(`Rate limiting: ${rateLimitMax} requests per ${Math.ceil(rateLimitWindow / 1000 / 60)} minutes (${isDevelopment ? 'development' : 'production'} mode)`);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Care Connect API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGODB_URI_PROD 
      : process.env.MONGODB_URI;
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();

module.exports = app; 