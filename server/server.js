import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import os from 'os';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';
import featuredPostersRoutes from './routes/featuredPosters.js';
import imageRoutes from './routes/images.js';
import heroItemsRoutes from './routes/heroItems.js';
import customizationRoutes from './routes/customizations.js';
import customApprovalsRoutes from './routes/customApprovals.js';

// Import Redis config
import { connectRedis, closeRedis } from './config/redis.js';

dotenv.config();

// Set Node environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://vybe-nu.vercel.app',
  process.env.CLIENT_URL
];

// Function to check if origin is allowed - Enhanced for multi-device access
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow requests with no origin (e.g., Postman, mobile apps, native apps)
  
  // Allow Vercel deployments (including preview deployments)
  if (origin.includes('.vercel.app') || origin.includes('vercel.app')) return true;
  
  // Allow Railway deployments
  if (origin.includes('.railway.app') || origin.includes('railway.app')) return true;
  
  // Allow localhost with any port (for development)
  if (origin.match(/^https?:\/\/localhost:\d+$/)) return true;
  
  // Allow 127.0.0.1 with any port
  if (origin.match(/^https?:\/\/127\.0\.0\.1:\d+$/)) return true;
  
  // Allow local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x) - for mobile devices on same network
  if (origin.match(/^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$/)) return true;
  
  // Allow ngrok tunnels (for remote testing)
  if (origin.includes('ngrok.io') || origin.includes('ngrok-free.app')) return true;
  
  // Allow production domain if set
  if (process.env.PRODUCTION_DOMAIN && origin.includes(process.env.PRODUCTION_DOMAIN)) return true;
  
  // Check against allowed origins
  return allowedOrigins.includes(origin);
};

app.use(cors({
  origin: function(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.log(`⚠️  Blocked origin: ${origin}`);
      callback(null, true); // Allow all for now during debugging - consider tightening in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cookie', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'User-Agent',
    'DNT',
    'Cache-Control',
    'X-Mx-ReqToken',
    'Keep-Alive',
    'X-Requested-With',
    'If-Modified-Since',
    'X-Device-Type', // Custom header for device detection
    'X-App-Version' // Custom header for app version tracking
  ],
  exposedHeaders: ['Set-Cookie', 'Authorization', 'X-Total-Count', 'X-Upload-Progress'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

// Compression middleware - must come before routes
app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Increase body size limits for large file uploads (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Request logging middleware (for debugging and device tracking)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📱 ${req.method} ${req.path}`);
    console.log(`🌐 Origin: ${req.headers.origin || 'No origin'}`);
    console.log(`🔑 Auth: ${req.headers.authorization ? 'Bearer token present' : 'No auth header'}`);
    console.log(`🍪 Cookie: ${req.headers.cookie ? 'Cookie present' : 'No cookie'}`);
    console.log(`📦 Content-Type: ${req.headers['content-type'] || 'Not set'}`);
    console.log(`💻 User-Agent: ${req.headers['user-agent']?.substring(0, 60) || 'Not set'}`);
    console.log(`🌍 IP: ${req.ip || req.connection.remoteAddress}`);
  }
  next();
});

// MongoDB connection with optimization options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vybe-store', {
  maxPoolSize: 10, // Connection pool size
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    // Connect to Redis (optional, continues without it if unavailable)
    connectRedis();
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'VYBE Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      payment: '/api/payment',
      admin: '/api/admin'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'VYBE API is running',
    emailConfigured: !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/featured-posters', featuredPostersRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/hero-items', heroItemsRoutes);
app.use('/api/customizations', customizationRoutes);
app.use('/api/admin/custom-approvals', customApprovalsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server with increased timeout for file uploads
// Bind to 0.0.0.0 to allow external access (global network)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Accessible on your network at:`);
  
  // Get all network interfaces
  const networkInterfaces = os.networkInterfaces();
  
  Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName].forEach(iface => {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`   http://${iface.address}:${PORT}`);
      }
    });
  });
  
  console.log(`📱 Local: http://localhost:${PORT}`);
});

// Increase timeout for large file uploads (5 minutes)
server.timeout = 300000; // 5 minutes
server.keepAliveTimeout = 65000; // Keep alive for 65 seconds
server.headersTimeout = 66000; // Headers timeout slightly longer than keep alive

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('🔒 HTTP server closed');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
    
    // Close Redis connection
    await closeRedis();
    
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('🔒 HTTP server closed');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
    
    // Close Redis connection
    await closeRedis();
    
    process.exit(0);
  });
});
