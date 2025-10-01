const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
// const cors = require('cors'); // DISABLED - using manual CORS
const dotenv = require('dotenv');

const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const reportRoutes = require('./routes/report.routes');

dotenv.config();
const app = express();
app.set('trust proxy', 1); // 🧩 IMPORTANT

// ✅ BULLETPROOF CORS - Manual implementation
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('🚀 BULLETPROOF CORS - Origin:', origin);
  
  // Allow specific origins based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    // Add your Vercel domain(s) here
    'https://carbon-reduction-plan-ecosphere-dta2cnql3-zamamehdis-projects.vercel.app'
  ];

  const isAllowedOrigin = !origin || 
    allowedOrigins.includes(origin) || 
    (!isProduction && origin.includes('localhost')) ||
    (isProduction && origin.includes('vercel.app'));

  if (isAllowedOrigin) {
    console.log('✅ Setting CORS headers for:', origin);
    
    // CRITICAL: Set exact origin, never wildcard
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true'); // Re-enabled for local development
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  } else {
    console.log('❌ Blocking origin:', origin);
  }
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('🔄 PREFLIGHT handled');
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || "eco-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
    ttl: 14 * 24 * 60 * 60,
  }),
  cookie: {
    maxAge: 2 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
    secure: process.env.NODE_ENV === 'production', // true for HTTPS, false for HTTP
  },
}));

// ✅ Attach logged-in user from session to req.user
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await require('./models/user.model').findById(req.session.userId);
      req.user = user;
    } catch (err) {
      console.error('User fetch failed:', err);
    }
  }
  next();
});

// ✅ Health check endpoint (works before MongoDB connection)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    status: 'OK'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.get('/test-cors', (req, res) => {
  console.log('🧪 TEST CORS endpoint hit');
  res.json({ 
    message: 'CORS test successful', 
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

app.get('/test-set-cookie', (req, res) => {
  console.log('🧪 TEST SET COOKIE endpoint hit');
  res.cookie('debugCookie', 'cookie123', {
    maxAge: 60 * 1000, // 1 minute
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ 
    message: 'Test cookie set', 
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// ✅ Test route to verify server is working
app.get('/test-server', (req, res) => {
  res.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString(),
    routes: ['/auth', '/reports', '/admin']
  });
});

// ✅ Direct auth/me test route - REMOVED (was overriding actual auth route)

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/reports', reportRoutes);
app.use('/admin', adminRoutes);

// ✅ Connect to MongoDB and start server
console.log('🔍 Starting server...');
console.log('🔍 NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('🔍 Session config - secure:', process.env.NODE_ENV === 'production' ? 'true (HTTPS)' : 'false (HTTP)');
console.log('🔍 Session config - sameSite:', process.env.NODE_ENV === 'production' ? 'none' : 'lax');
console.log('🔍 MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
console.log('🔍 PORT:', process.env.PORT || 5000);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🚀 Server URL: https://carbon-emission-2.onrender.com`);
      console.log(`🚀 Test endpoint: https://carbon-emission-2.onrender.com/test-server`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.error('❌ Server failed to start');
  });
  