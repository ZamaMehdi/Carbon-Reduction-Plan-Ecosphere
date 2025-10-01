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
  
  // Allow specific origins
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://carbon-reduction-plan-ecosphere-dta2cnql3-zamamehdis-projects.vercel.app'
  ];
  
  if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app') || origin.includes('localhost')) {
    console.log('✅ Setting CORS headers for:', origin);
    
    // CRITICAL: Set exact origin, never wildcard
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'false'); // TEMPORARILY DISABLED
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
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
    sameSite: "none",   // 👈 needed for cross-domain
    secure: true,       // 👈 must be true on HTTPS
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

// ✅ Test endpoints for debugging
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
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
    sameSite: "none",
    secure: true
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

// ✅ Direct auth/me test route
app.get('/auth/me', (req, res) => {
  console.log('🧪 DIRECT /auth/me route hit');
  res.json({ 
    message: 'Direct auth/me route working!', 
    session: req.session,
    timestamp: new Date().toISOString()
  });
});

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/reports', reportRoutes);
app.use('/admin', adminRoutes);

// ✅ Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  app.get('/test-set-cookie', (req, res) => {
    res.cookie('debugCookie', 'cookie123', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });
    res.send('🍪 Debug cookie set!');
  });

  app.get('/test-auth', (req, res) => {
    res.json({ user: req.user || null, session: req.session });
  });
  
  