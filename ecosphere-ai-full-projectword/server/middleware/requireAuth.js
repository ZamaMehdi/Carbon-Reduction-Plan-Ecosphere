// 📁 server/middleware/requireAuth.js
const User = require('../models/user.model');

const requireAuth = async (req, res, next) => {
  console.log('🔐 requireAuth middleware - Session:', req.session);

  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (!user) {
        console.log('❌ User not found in database');
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      console.log('✅ Authenticated user:', user.email);
      return next();
    } catch (err) {
      console.error('❌ Error in requireAuth middleware:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  } else {
    console.log('❌ No session.userId - user not logged in');
    return res.status(401).json({ message: 'Unauthorized, please log in' });
  }
};

module.exports = requireAuth;
