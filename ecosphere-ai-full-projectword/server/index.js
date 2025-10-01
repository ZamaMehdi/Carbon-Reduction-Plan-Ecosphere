const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
// const cors = require('cors'); // DISABLED - using custom CORS
const dotenv = require('dotenv');

const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const reportRoutes = require('./routes/report.routes');

dotenv.config();
const app = express();
app.set('trust proxy', 1); // 🧩 IMPORTANT

// ✅ AGGRESSIVE CORS FIX - OVERRIDE EVERYTHING
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('🔥 AGGRESSIVE CORS - Origin:', origin);
  console.log('🔥 AGGRESSIVE CORS - Method:', req.method);
  console.log('🔥 AGGRESSIVE CORS - URL:', req.url);
  
  // ALWAYS set headers for allowed origins
  if (!origin || origin.includes('localhost') || origin.includes('vercel.app')) {
    console.log('🔥 SETTING CORS HEADERS - Origin allowed:', origin);
    
    // Clear any existing headers first
    res.removeHeader('Access-Control-Allow-Origin');
    res.removeHeader('Access-Control-Allow-Credentials');
    res.removeHeader('Access-Control-Allow-Methods');
    res.removeHeader('Access-Control-Allow-Headers');
    
    // Set new headers
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'false'); // Disable credentials
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    console.log('🔥 CORS HEADERS SET:', {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Credentials': 'false'
    });
  }
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('🔥 PREFLIGHT REQUEST - Returning 200');
    return res.status(200).end();
  }
  
  next();
});

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
  
  