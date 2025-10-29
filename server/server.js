import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://vybe-sigma.vercel.app',
  process.env.CLIENT_URL
];

// Function to check if origin is allowed
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow requests with no origin
  
  // Allow Vercel deployments
  if (origin.includes('.vercel.app') || origin.includes('vercel.app')) return true;
  
  // Allow localhost with any port
  if (origin.match(/^http:\/\/localhost:\d+$/)) return true;
  
  // Allow local network IPs (192.168.x.x, 10.x.x.x, etc.)
  if (origin.match(/^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+):\d+$/)) return true;
  
  // Check against allowed origins
  return allowedOrigins.includes(origin);
};

app.use(cors({
  origin: function(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.log(`⚠️  Blocked origin: ${origin}`);
      callback(null, true); // Allow all for now during debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // 24 hours
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`📱 ${req.method} ${req.path}`);
  console.log(`🌐 Origin: ${req.headers.origin || 'No origin'}`);
  console.log(`🔑 Auth: ${req.headers.authorization ? 'Bearer token present' : 'No auth header'}`);
  console.log(`🍪 Cookie: ${req.headers.cookie ? 'Cookie present' : 'No cookie'}`);
  console.log(`📦 Content-Type: ${req.headers['content-type'] || 'Not set'}`);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vybe-store')
  .then(() => console.log('✅ MongoDB connected successfully'))
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
  res.json({ status: 'ok', message: 'VYBE API is running' });
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
