const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate routes that require authentication
 */
const authenticated = async (req, res, next) => {
  try {
    console.log('Auth middleware called');
    console.log('Cookies:', req.cookies);

    // Get token from cookie
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
      console.log('No token found, returning 401');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id
    const user = await User.findById(decoded.id).select('-password');

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Authentication required' });
  }
};

/**
 * Middleware to restrict routes to unauthenticated users only
 */
const unauthenticated = (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;

    // If token exists, user is authenticated
    if (token) {
      return res.status(400).json({ message: 'You are already authenticated' });
    }

    next();
  } catch (error) {
    console.error('Unauth middleware error:', error);
    next();
  }
};

module.exports = { authenticated, unauthenticated };
