// 📁 server/routes/auth.routes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
// const { sendPasswordResetCode } = require('../utils/email'); // Temporarily disabled

const router = express.Router();
const crypto = require('crypto');

// In-memory store for reset codes (temporary)
const resetCodes = new Map();


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
  console.log('🔍 Login attempt for email:', email);
  
  try {
    const user = await User.findOne({ email });
    console.log('🔍 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const passwordMatch = await user.matchPassword(password);
    console.log('🔍 Password match:', passwordMatch);
    
    if (!passwordMatch) {
      console.log('❌ Password does not match');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 🔍 BEFORE setting session
    console.log('🔍 Session BEFORE setting userId:', req.session);
    
    req.session.userId = user._id;
    
    // Save the session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save failed:', err);
        return res.status(500).json({ message: 'Session save failed' });
      }

      // ✅ AFTER setting session
      console.log('✅ Session AFTER setting userId:', req.session);

      res.json({ userId: user._id });
    });
    
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

  // sendPasswordResetCode(email, code); // Temporarily disabled
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
  console.log('👀 Session ID:', req.sessionID);
  console.log('👀 Session userId:', req.session.userId);

  if (!req.session.userId) {
    console.log('❌ No userId in session');
    return res.status(401).json({ message: 'Not logged in' });
  }

  const user = await User.findById(req.session.userId).select('email');
  if (!user) {
    console.log('❌ User not found in database');
    return res.status(404).json({ message: 'User not found' });
  }

  console.log('✅ User found:', user.email);
  res.json({ userId: user._id, email: user.email });
});

module.exports = router;