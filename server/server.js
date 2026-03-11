import 'dotenv/config';
import { createServer } from 'http';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
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
import bulkImportRoutes from './routes/bulkImport.js';
import sitemapRoute from './routes/sitemap.js';
import ogRoute from './routes/og.js';
import analyticsRoutes from './routes/analytics.js';

// Import Redis config
import { connectRedis, closeRedis } from './config/redis.js';

// Import analytics service
import { setSocketIO, activeSessions, deactivateSession, broadcastActiveCount, sanitizeSessionId } from './services/analyticsService.js';

// Import security middleware
import { generalLimiter } from './middleware/security.js';

// Import cache warming
import { warmCache } from './middleware/cache.js';

// Set Node environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://vybe-nu.vercel.app',
  'https://vybebd.store',
  'https://www.vybebd.store',
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

const corsOptions = {
  origin: function (origin, callback) {
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
    'If-Modified-Since',
    'X-Device-Type', // Custom header for device detection
    'X-App-Version' // Custom header for app version tracking
  ],
  exposedHeaders: ['Set-Cookie', 'Authorization', 'X-Total-Count', 'X-Upload-Progress'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Security middleware - Helmet for HTTP headers protection
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now (can be configured later)
  crossOriginEmbedderPolicy: false, // Allow embedded content
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin resources
}));

app.use(cors(corsOptions));

// Handle preflight requests with the SAME config (important for credentials)
app.options('*', cors(corsOptions));

// Apply general rate limiting to all routes
// Socket.IO — mounted on same HTTP server, separate path to avoid CORS conflicts
const io = new SocketIOServer(httpServer, {
  path: '/socket.io',
  cors: {
    origin: (origin, cb) => cb(null, true), // mirror main CORS config
    credentials: true,
    methods: ['GET', 'POST'],
  },
  // Accept both polling and websocket; client starts with polling, upgrades to ws
  transports: ['polling', 'websocket'],
  allowEIO3: true,           // compatibility with older socket.io-client versions
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
});

// Provide IO to analytics service so it can broadcast
setSocketIO(io);

// Socket.IO connection handler
io.on('connection', (socket) => {
  const rawSid = socket.handshake.query.sessionId;
  const sessionId = sanitizeSessionId(rawSid);

  // Admin clients join a dedicated room to receive broadcast events
  socket.on('join-admin', () => {
    socket.join('admin-room');
    // Send current count immediately upon admin joining
    socket.emit('active-visitors', { count: activeSessions.size, timestamp: Date.now() });
  });

  if (sessionId) {
    activeSessions.add(sessionId);
    broadcastActiveCount();
  }

  socket.on('heartbeat', () => {
    // Client sends periodic heartbeats to confirm they are still active
    if (sessionId) {
      activeSessions.add(sessionId); // refresh membership
      broadcastActiveCount();
    }
  });

  socket.on('disconnect', () => {
    if (sessionId) {
      activeSessions.delete(sessionId);
      broadcastActiveCount();
      // Mark session inactive in DB (non-blocking)
      deactivateSession(sessionId).catch(() => {});
    }
  });
});

app.use('/api/', generalLimiter);

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
app.use('/api/admin/bulk-import', bulkImportRoutes);
app.use('/api', sitemapRoute);
app.use('/api/og', ogRoute);
app.use('/api/analytics', analyticsRoutes);

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
const server = httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);

  // Warm Redis cache for popular routes after server starts
  setTimeout(() => {
    warmCache(`http://localhost:${PORT}/api`).catch(() => {});
  }, 3000);
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
