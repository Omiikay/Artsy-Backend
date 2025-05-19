const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { register, login, getCurrentUser, logout, deleteAccount } = require('../controllers/authController');
const { authenticated, unauthenticated } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (unauthenticated only)
router.post(
  '/register',
  unauthenticated,
  [
    check('fullname', 'Full name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 4 characters').isLength({ min: 4 })
  ],
  register
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public (unauthenticated only)
router.post(
  '/login',
  unauthenticated,
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  login
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticated, getCurrentUser);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticated, logout);

// @route   DELETE /api/auth/delete
// @desc    Delete user account
// @access  Private
router.delete('/delete', authenticated, deleteAccount);

module.exports = router;
