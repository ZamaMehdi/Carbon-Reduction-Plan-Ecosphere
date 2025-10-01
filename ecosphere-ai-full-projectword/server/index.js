const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const dotenv = require('dotenv');

console.log('🔍 Loading routes...');
const adminRoutes = require('./routes/admin.routes');
console.log('✅ Admin routes loaded');
const authRoutes = require('./routes/auth.routes');
console.log('✅ Auth routes loaded');
const reportRoutes = require('./routes/report.routes');
console.log('✅ Report routes loaded');

dotenv.config();
const app = express();
app.set('trust proxy', 1); // 🧩 IMPORTANT

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://carbonreductionplanning.netlify.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log('🚀 CORS - Origin:', origin);
      if (!origin) return callback(null, true); // allow REST tools / server-to-server
      if (allowedOrigins.includes(origin)) {
        console.log('✅ CORS - Origin allowed:', origin);
        return callback(null, origin);
      }
      console.log('❌ CORS - Origin not allowed:', origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Debug middleware to log all response headers
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    console.log('🔍 Final CORS headers being sent:');
    console.log('  Access-Control-Allow-Origin:', res.get('Access-Control-Allow-Origin'));
    console.log('  Access-Control-Allow-Credentials:', res.get('Access-Control-Allow-Credentials'));
    originalSend.call(this, data);
  };
  next();
});

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
    secure: process.env.NODE_ENV === 'production',
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
    routes: ['/auth', '/reports', '/admin'],
    version: '1.0.0'
  });
});

// ✅ Test route for auth specifically
app.get('/test-auth', (req, res) => {
  res.json({
    message: 'Auth routes should be working!',
    timestamp: new Date().toISOString(),
    authRoutes: ['/auth/me', '/auth/login', '/auth/signup']
  });
});

// ✅ Routes
console.log('🔍 Mounting auth routes...');
app.use('/auth', authRoutes);
console.log('🔍 Mounting report routes...');
app.use('/reports', reportRoutes);
console.log('🔍 Mounting admin routes...');
app.use('/admin', adminRoutes);
console.log('✅ All routes mounted successfully');

// ✅ Connect to MongoDB and start server
console.log('🔍 Starting server...');
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
  