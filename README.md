# Care Connect - Senior Care Platform

A comprehensive platform connecting seniors with volunteers for assistance, health tracking, and community support.

## 🌟 Features

### For Seniors
- **Help Request System**: Create and manage requests for various types of assistance
- **Health Tracking**: Monitor medications, health metrics, and appointments
- **Emergency Services**: SOS alerts and emergency contact management
- **Community Events**: Participate in wellness workshops and social activities
- **Real-time Messaging**: Communicate with volunteers through the platform

### For Volunteers
- **Request Management**: Browse and accept help requests from seniors
- **Location-based Matching**: Find nearby seniors who need assistance
- **Rating System**: Build reputation through mutual ratings
- **Community Involvement**: Access volunteer opportunities and support groups

### For Administrators
- **User Management**: Verify and manage senior and volunteer accounts
- **Platform Monitoring**: Track system usage and user statistics
- **Content Management**: Manage community events and resources

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Framer Motion** for animations
- **React Hook Form** for form handling
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **Helmet** for security headers

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd care_connect
```

### 2. Backend Setup

#### Option A: Using Installation Scripts
```bash
# Windows
cd backend
install.bat

# Unix/Linux/Mac
cd backend
chmod +x install.sh
./install.sh
```

#### Option B: Manual Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your configuration
# Set up MongoDB URI and JWT secret

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Database Setup
- Install MongoDB locally or use MongoDB Atlas
- Update the `MONGODB_URI` in your backend `.env` file
- The database will be created automatically when you first run the application

## 🔧 Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory:

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

## 📁 Project Structure

```
care_connect/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── styles/         # CSS styles
│   ├── package.json        # Frontend dependencies
│   └── README.md           # Frontend documentation
├── backend/                 # Node.js backend API
│   ├── models/             # Database models
│   ├── routes/             # API route handlers
│   ├── middleware/         # Custom middleware
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── README.md           # Backend documentation
└── README.md               # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Requests
- `POST /api/requests` - Create help request
- `GET /api/requests` - Get requests (with filters)
- `GET /api/requests/nearby` - Get nearby requests
- `POST /api/requests/:id/accept` - Accept request
- `POST /api/requests/:id/complete` - Complete request

### Health
- `GET /api/health/medications` - Get active medications
- `GET /api/health/metrics` - Get health metrics
- `GET /api/health/appointments` - Get upcoming appointments
- `POST /api/health/:id/taken` - Mark medication as taken

### Emergency
- `POST /api/emergency/sos` - Send emergency SOS
- `GET /api/emergency/contacts` - Get emergency contacts
- `GET /api/emergency/nearby-help` - Get nearby emergency help

### Community
- `GET /api/community/events` - Get community events
- `POST /api/community/events/:id/register` - Register for event
- `GET /api/community/resources` - Get community resources

## 🗄️ Database Models

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

## 🔐 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured for frontend integration
- **Helmet Security**: HTTP headers security
- **Error Handling**: Centralized error handling

## 🌍 Geospatial Features

The platform includes location-based services using MongoDB's geospatial indexes:

- Find nearby volunteers for emergency situations
- Locate nearby help requests for volunteers
- Calculate distances between users and requests
- Support for real-time location updates

## 🧪 Development

### Running in Development Mode
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use production MongoDB URI
3. Configure proper JWT secret
4. Set up email services
5. Enable HTTPS
6. Configure proper CORS origins

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to a static hosting service (Netlify, Vercel, etc.)
3. Configure environment variables
4. Set up custom domain if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `backend/README.md` and `frontend/README.md` files

## 🙏 Acknowledgments

- React team for the amazing frontend framework
- Express.js team for the robust backend framework
- MongoDB team for the flexible database solution
- All contributors and volunteers who help make this platform better

---

**Care Connect** - Connecting seniors with the help they need, when they need it. 