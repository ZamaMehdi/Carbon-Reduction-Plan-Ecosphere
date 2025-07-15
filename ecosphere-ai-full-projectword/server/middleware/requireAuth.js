// 📁 server/routes/auth.routes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { sendPasswordResetCode } = require('../utils/email');

const router = express.Router();
const crypto = require('crypto');

// In-memory store for reset codes (temporary)
const resetCodes = new Map();

// Signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ email, password });
    req.session.userId = user._id;
    res.status(201).json({ userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    req.session.userId = user._id;
    res.json({ userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  resetCodes.set(email, { code, expires: Date.now() + 15 * 60 * 1000 });

  sendPasswordResetCode(email, code);
  res.json({ message: 'Reset code sent' });
});

// Verify code
router.post('/verify-reset-code', (req, res) => {
  const { email, code } = req.body;
  const record = resetCodes.get(email);

  if (!record || record.code !== code || Date.now() > record.expires) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }

  res.json({ message: 'Code verified' });
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  const record = resetCodes.get(email);

  if (!record || record.code !== code || Date.now() > record.expires) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found' });

  user.password = newPassword;
  await user.save();
  resetCodes.delete(email);

  res.json({ message: 'Password reset successfully' });
});

// Me (session check)
router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Not logged in' });

  const user = await User.findById(req.session.userId).select('email');
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ userId: user._id, email: user.email });
});

module.exports = router


// const authMiddleware = async (req, res, next) => {
//   console.log('🧪 Incoming session:', req.session);

//   if (req.session.userId) {
//     try {
//       const user = await User.findById(req.session.userId);
//       if (!user) return res.status(401).json({ message: 'User not found' });

//       req.user = user;
//       console.log('✅ Authenticated user:', user.email);
//       return next();
//     } catch (err) {
//       console.error('❌ Error in authMiddleware:', err);
//       return res.status(500).json({ message: 'Server error' });
//     }
//   } else {
//     console.warn('⚠️ No session.userId – not logged in');
//     return res.status(401).json({ message: 'Unauthorized, not logged in' });
//   }
// };
