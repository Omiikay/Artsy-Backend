const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite, checkFavorite } = require('../controllers/favoriteController');
const { authenticated } = require('../middleware/auth');

// @route   GET /api/favorites
// @desc    Get user's favorites
// @access  Private
router.get('/', authenticated, getFavorites);

// @route   POST /api/favorites
// @desc    Add artist to favorites
// @access  Private
router.post('/', authenticated, addFavorite);

// @route   DELETE /api/favorites/:artistId
// @desc    Remove artist from favorites
// @access  Private
router.delete('/:artistId', authenticated, removeFavorite);

// @route   GET /api/favorites/check/:artistId
// @desc    Check if artist is in favorites
// @access  Private
router.get('/check/:artistId', authenticated, checkFavorite);

module.exports = router;
