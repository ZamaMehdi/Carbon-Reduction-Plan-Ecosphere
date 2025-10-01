// 📁 server/routes/auth.routes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { sendPasswordResetCode } = require('../utils/email');

const router = express.Router();
const crypto = require('crypto');

// In-memory store for reset codes (temporary)
const resetCodes = new Map();

// In-memory store for signup codes
const signupCodes = new Map();

// Send 6-digit code for signup
router.post('/request-signup-code', async (req, res) => {
  const { email } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already registered' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  signupCodes.set(email, { code, expires: Date.now() + 15 * 60 * 1000 });

  sendPasswordResetCode(email, code); // Reuse same email function

  res.json({ message: 'Verification code sent' });
});

router.post('/verify-signup-code', (req, res) => {
  const { email, code } = req.body;
  const record = signupCodes.get(email);

  if (!record || record.code !== code || Date.now() > record.expires) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }

  // Mark verified — here we just set a flag for use in final signup
  record.verified = true;
  signupCodes.set(email, record);

  res.json({ message: 'Email verified. Proceed to set password.' });
});


// Signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  // Create user directly without email verification
  const user = await User.create({ email, password });
  req.session.userId = user._id;

  res.status(201).json({ userId: user._id });
});


// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 🔍 BEFORE setting session
    console.log('🔍 Session BEFORE setting userId:', req.session);
    
    req.session.userId = user._id;

    // ✅ AFTER setting session
    console.log('✅ Session AFTER setting userId:', req.session);

    res.json({ userId: user._id });
  } catch (err) {
    console.error('❌ Login failed:', err);

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
  console.log('👀 Session on /me:', req.session); // 🔍

  if (!req.session.userId) return res.status(401).json({ message: 'Not logged in' });

  const user = await User.findById(req.session.userId).select('email');
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ userId: user._id, email: user.email });
});

module.exports = router;