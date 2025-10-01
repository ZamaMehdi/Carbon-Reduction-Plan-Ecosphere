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

// ✅ CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://carbon-reduction-plan-ecosphere.vercel.app'
];

// Function to check if origin is allowed (including all Vercel domains)
function isOriginAllowed(origin) {
  if (!origin) return true; // Allow requests with no origin
  if (origin.includes('localhost')) return true; // Allow localhost
  if (origin.includes('vercel.app')) return true; // Allow all Vercel domains
  return allowedOrigins.includes(origin);
}

app.use(cors({
  origin: function (origin, callback) {
    console.log('🔍 CORS Origin check:', origin);
    
    if (isOriginAllowed(origin)) {
      console.log('✅ Allowing origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ Blocking origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
}));

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
  
  