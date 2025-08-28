const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          error: 'User not found',
          message: 'The user associated with this token no longer exists'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          error: 'Account deactivated',
          message: 'Your account has been deactivated'
        });
      }

      // Update last active
      await req.user.updateLastActive();

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Your session has expired. Please log in again.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'No token provided',
      message: 'Access denied. Please log in to continue.'
    });
  }
};

// Middleware to authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: `You don't have permission to access this resource. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware to check if user is senior
const isSenior = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }

  if (req.user.role !== 'senior') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'This resource is only available for seniors'
    });
  }

  next();
};

// Middleware to check if user is volunteer (case-insensitive)
const isVolunteer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }

  const role = String(req.user.role || '').toLowerCase();
  if (role !== 'volunteer') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'This resource is only available for volunteers'
    });
  }

  next();
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'This resource is only available for administrators'
    });
  }

  next();
};

// Middleware to check if user owns the resource or is admin
const isOwnerOrAdmin = (resourceUserIdField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        error: 'Resource ID required',
        message: 'Resource ID is required to verify ownership'
      });
    }

    if (req.user._id.toString() !== resourceUserId.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own resources'
      });
    }

    next();
  };
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = {
  protect,
  authorize,
  isSenior,
  isVolunteer,
  isAdmin,
  isOwnerOrAdmin,
  generateToken
}; 