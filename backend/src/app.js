const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const postRoutes = require('./routes/postRoutes');

// Import database setup
const { setupDatabase } = require('./config/db');

// Initialize express app
const app = express();

// Security middleware
// Set security HTTP headers with cross-origin resource policy disabled for images
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Additional security for login route
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // start blocking after 10 requests
  message: 'Too many login attempts from this IP, please try again after an hour'
});
app.use('/api/auth/login', authLimiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // Body limit is 10kb
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser()); // Parse cookies

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['category', 'search', 'page', 'limit'] // Parameters allowed to be duplicated
}));

// CORS setup
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', '*'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Serve uploaded files
const uploadDir = process.env.UPLOAD_PATH || 'uploads';
app.use(`/${uploadDir}`, express.static(path.join(__dirname, '..', uploadDir)));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Blog API',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        getProfile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
        logout: 'POST /api/auth/logout'
      },
      categories: {
        getAll: 'GET /api/categories',
        getOne: 'GET /api/categories/:id',
        create: 'POST /api/categories',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id'
      },
      posts: {
        getAll: 'GET /api/posts',
        getOne: 'GET /api/posts/:id',
        create: 'POST /api/posts',
        update: 'PUT /api/posts/:id',
        delete: 'DELETE /api/posts/:id'
      }
    }
  });
});

// Setup database
setupDatabase()
  .then(() => {
    console.log('Database setup completed');
  })
  .catch(err => {
    console.error('Database setup failed:', err);
  });

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large, maximum size is 5MB'
    });
  }
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.stack
  });
});

module.exports = app; 