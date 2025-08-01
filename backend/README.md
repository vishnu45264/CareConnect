# Care Connect Backend API

A comprehensive Node.js/Express backend API for the Care Connect senior care platform, providing authentication, request management, health tracking, and emergency services.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Help Request Management**: Create, manage, and track help requests between seniors and volunteers
- **Health Tracking**: Medication management, health metrics, and appointment tracking
- **Emergency Services**: SOS alerts, emergency contacts, and nearby help
- **Community Features**: Events, support groups, and volunteer opportunities
- **Geospatial Queries**: Location-based services for finding nearby users and requests
- **Real-time Messaging**: In-app messaging between seniors and volunteers
- **Rating System**: Mutual rating system for completed requests

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, rate limiting
- **File Upload**: multer

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd care_connect/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `MONGODB_URI` in your `.env` file

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/care_connect
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/care_connect

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Emergency Services
EMERGENCY_PHONE=112
SUPPORT_EMAIL=support@careconnect.com
```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| POST | `/logout` | User logout | Private |
| GET | `/me` | Get current user profile | Private |
| PUT | `/me` | Update user profile | Private |
| PUT | `/me/password` | Update password | Private |
| DELETE | `/me` | Deactivate account | Private |
| POST | `/refresh` | Refresh JWT token | Private |

### Users (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all users | Admin |
| GET | `/nearby` | Get nearby users | Private |
| GET | `/:id` | Get specific user | Private |
| PUT | `/:id` | Update user profile | Private |
| PUT | `/:id/verify` | Verify user | Admin |
| PUT | `/:id/activate` | Activate/deactivate user | Admin |
| DELETE | `/:id` | Delete user | Admin |

### Requests (`/api/requests`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/` | Create help request | Senior |
| GET | `/` | Get requests (with filters) | Private |
| GET | `/nearby` | Get nearby requests | Volunteer |
| GET | `/:id` | Get specific request | Private |
| PUT | `/:id` | Update request | Private |
| POST | `/:id/accept` | Accept request | Volunteer |
| POST | `/:id/complete` | Complete request | Private |
| POST | `/:id/cancel` | Cancel request | Private |
| POST | `/:id/message` | Add message | Private |
| POST | `/:id/rate` | Rate request | Private |
| DELETE | `/:id` | Delete request | Private |

### Health (`/api/health`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/` | Create health record | Private |
| GET | `/` | Get health records | Private |
| GET | `/medications` | Get active medications | Private |
| GET | `/metrics` | Get health metrics | Private |
| GET | `/appointments` | Get upcoming appointments | Private |
| GET | `/adherence` | Get medication adherence | Private |
| GET | `/:id` | Get specific health record | Private |
| PUT | `/:id` | Update health record | Private |
| POST | `/:id/taken` | Mark medication as taken | Private |
| POST | `/:id/reading` | Add metric reading | Private |
| POST | `/:id/status` | Update appointment status | Private |
| DELETE | `/:id` | Delete health record | Private |

### Emergency (`/api/emergency`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/sos` | Send emergency SOS | Private |
| GET | `/contacts` | Get emergency contacts | Private |
| POST | `/alert` | Send emergency alert | Private |
| GET | `/nearby-help` | Get nearby emergency help | Private |
| POST | `/check-in` | Emergency check-in | Private |
| GET | `/status` | Get emergency status | Private |

### Community (`/api/community`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/events` | Get community events | Private |
| GET | `/events/:id` | Get specific event | Private |
| POST | `/events/:id/register` | Register for event | Private |
| GET | `/resources` | Get community resources | Private |
| GET | `/support-groups` | Get support groups | Private |
| GET | `/volunteer-opportunities` | Get volunteer opportunities | Private |

## Database Models

### User Model
- Authentication fields (email, password)
- Profile information (name, phone, address, date of birth)
- Role-based fields (senior/volunteer preferences)
- Location data for geospatial queries
- Emergency contact information
- Rating and statistics

### Request Model
- Request details (category, title, description, urgency)
- Scheduling information
- Location data
- Status tracking
- Messaging system
- Rating system

### HealthRecord Model
- Medication tracking
- Health metrics
- Appointment management
- Adherence statistics

## Authentication & Authorization

### JWT Token Structure
```json
{
  "id": "user_id",
  "iat": "issued_at",
  "exp": "expiration_time"
}
```

### Role-Based Access Control
- **Senior**: Can create requests, manage health records, access emergency services
- **Volunteer**: Can view and accept requests, manage profile, access community features
- **Admin**: Full access to all features and user management

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured for frontend integration
- **Helmet Security**: HTTP headers security
- **Error Handling**: Centralized error handling

## Geospatial Features

The API includes location-based services using MongoDB's geospatial indexes:

- Find nearby volunteers for emergency situations
- Locate nearby help requests for volunteers
- Calculate distances between users and requests
- Support for real-time location updates

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": [
    {
      "field": "field_name",
      "message": "validation_message",
      "value": "invalid_value"
    }
  ]
}
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Code Structure
```
backend/
├── models/          # Database models
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## Production Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Use production MongoDB URI
   - Configure proper JWT secret
   - Set up email services

2. **Security Considerations**
   - Use HTTPS in production
   - Configure proper CORS origins
   - Set up rate limiting
   - Enable helmet security headers

3. **Performance Optimization**
   - Enable MongoDB connection pooling
   - Implement caching strategies
   - Use compression middleware
   - Monitor API performance

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository. 