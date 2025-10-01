const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const dotenv = require('dotenv');

const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const reportRoutes = require('./routes/report.routes');

dotenv.config();
const app = express();
app.set('trust proxy', 1); // 🧩 IMPORTANT

// ✅ COMPLETE CORS OVERRIDE - NO WILDCARDS ALLOWED
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('🚨 CORS OVERRIDE - Request origin:', origin);
  console.log('🚨 CORS OVERRIDE - Request method:', req.method);
  console.log('🚨 CORS OVERRIDE - Request URL:', req.url);
  
  // Define allowed origins explicitly
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://carbon-reduction-plan-ecosphere.vercel.app'
  ];
  
  // Check if origin is allowed
  let isAllowed = false;
  if (!origin) {
    isAllowed = true; // Allow requests with no origin
    console.log('✅ Allowing request with no origin');
  } else if (origin.includes('localhost')) {
    isAllowed = true; // Allow localhost
    console.log('✅ Allowing localhost origin:', origin);
  } else if (origin.includes('vercel.app')) {
    isAllowed = true; // Allow all Vercel domains
    console.log('✅ Allowing Vercel origin:', origin);
  } else if (allowedOrigins.includes(origin)) {
    isAllowed = true; // Allow specific origins
    console.log('✅ Allowing specific origin:', origin);
  }
  
  if (isAllowed) {
    console.log('✅ SETTING CORS HEADERS for:', origin);
    // Set specific origin (NEVER use *)
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  } else {
    console.log('❌ BLOCKING origin:', origin);
    // Don't set any CORS headers for blocked origins
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling preflight OPTIONS request');
    if (isAllowed) {
      res.status(200).end();
    } else {
      res.status(403).json({ error: 'CORS blocked' });
    }
    return;
  }
  
  next();
});

// ✅ DISABLE default CORS completely
// app.use(cors()); // Commented out to prevent conflicts

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'eco-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // Set to false for local development
    },
  })
);

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

// ✅ Test CORS endpoint
app.get('/test-cors', (req, res) => {
  console.log('🧪 TEST CORS endpoint hit');
  res.json({ 
    message: 'CORS test successful', 
    origin: req.headers.origin,
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
  
  