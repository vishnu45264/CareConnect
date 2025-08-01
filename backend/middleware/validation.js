const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input data',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validation rules for user registration
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .isIn(['senior', 'volunteer'])
    .withMessage('Role must be either senior or volunteer'),
  
  body('phone')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const age = Math.floor((new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) {
        throw new Error('You must be at least 18 years old to register');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Validation rules for user profile update
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('address.street')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Street address must be between 5 and 100 characters'),
  
  body('address.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('address.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  
  body('address.zipCode')
    .optional()
    .matches(/^[0-9]{6}$/)
    .withMessage('Please provide a valid 6-digit zip code'),
  
  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Emergency contact name must be between 2 and 50 characters'),
  
  body('emergencyContact.phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid emergency contact phone number'),
  
  body('emergencyContact.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid emergency contact email address'),
  
  handleValidationErrors
];

// Validation rules for help request creation
const validateRequestCreation = [
  body('category')
    .isIn([
      'grocery',
      'medical',
      'transportation',
      'home-maintenance',
      'companionship',
      'technology',
      'meal-preparation',
      'medication'
    ])
    .withMessage('Please select a valid category'),
  
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  
  body('urgency')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Urgency must be low, medium, or high'),
  
  body('schedule.preferredDate')
    .isISO8601()
    .withMessage('Please provide a valid preferred date')
    .custom((value) => {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        throw new Error('Preferred date cannot be in the past');
      }
      return true;
    }),
  
  body('schedule.preferredTime')
    .isIn(['morning', 'afternoon', 'evening', 'flexible'])
    .withMessage('Please select a valid preferred time'),
  
  body('schedule.duration')
    .isIn(['1-hour', '2-hours', '3-hours', '4-hours', 'half-day', 'full-day'])
    .withMessage('Please select a valid duration'),
  
  body('location.address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Location address must be between 10 and 200 characters'),
  
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array with exactly 2 numbers'),
  
  body('location.coordinates.*')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Coordinates must be valid latitude/longitude values'),
  
  body('budget')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Budget description must be less than 50 characters'),
  
  body('specialRequirements')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requirements must be less than 500 characters'),
  
  handleValidationErrors
];

// Validation rules for request updates
const validateRequestUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid request ID'),
  
  body('status')
    .optional()
    .isIn(['pending', 'accepted', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
  
  body('schedule.actualDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid actual date'),
  
  body('schedule.actualTime')
    .optional()
    .isIn(['morning', 'afternoon', 'evening'])
    .withMessage('Please select a valid actual time'),
  
  handleValidationErrors
];

// Validation rules for health record creation
const validateHealthRecord = [
  body('type')
    .isIn(['medication', 'metric', 'appointment'])
    .withMessage('Please select a valid record type'),
  
  body('medication.name')
    .if(body('type').equals('medication'))
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Medication name must be between 2 and 100 characters'),
  
  body('medication.dosage')
    .if(body('type').equals('medication'))
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Dosage must be between 1 and 50 characters'),
  
  body('medication.frequency')
    .if(body('type').equals('medication'))
    .isIn(['once-daily', 'twice-daily', 'thrice-daily', 'as-needed'])
    .withMessage('Please select a valid frequency'),
  
  body('medication.startDate')
    .if(body('type').equals('medication'))
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  body('metric.name')
    .if(body('type').equals('metric'))
    .isIn(['blood-pressure', 'blood-sugar', 'weight', 'heart-rate', 'temperature', 'oxygen-saturation'])
    .withMessage('Please select a valid metric type'),
  
  body('metric.value')
    .if(body('type').equals('metric'))
    .trim()
    .notEmpty()
    .withMessage('Metric value is required'),
  
  body('metric.unit')
    .if(body('type').equals('metric'))
    .trim()
    .notEmpty()
    .withMessage('Metric unit is required'),
  
  body('appointment.doctor')
    .if(body('type').equals('appointment'))
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Doctor name must be between 2 and 100 characters'),
  
  body('appointment.specialty')
    .if(body('type').equals('appointment'))
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Specialty must be between 2 and 100 characters'),
  
  body('appointment.date')
    .if(body('type').equals('appointment'))
    .isISO8601()
    .withMessage('Please provide a valid appointment date'),
  
  body('appointment.time')
    .if(body('type').equals('appointment'))
    .trim()
    .notEmpty()
    .withMessage('Appointment time is required'),
  
  body('appointment.location')
    .if(body('type').equals('appointment'))
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Appointment location must be between 5 and 200 characters'),
  
  handleValidationErrors
];

// Validation rules for pagination
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'urgency', 'status'])
    .withMessage('Invalid sort field'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  
  handleValidationErrors
];

// Validation rules for search
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  
  query('category')
    .optional()
    .isIn([
      'grocery',
      'medical',
      'transportation',
      'home-maintenance',
      'companionship',
      'technology',
      'meal-preparation',
      'medication'
    ])
    .withMessage('Invalid category'),
  
  query('urgency')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid urgency level'),
  
  query('status')
    .optional()
    .isIn(['pending', 'accepted', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateRequestCreation,
  validateRequestUpdate,
  validateHealthRecord,
  validatePagination,
  validateSearch
}; 