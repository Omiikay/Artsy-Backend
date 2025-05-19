const express = require('express');
const router = express.Router();
const { search, getArtist, getSimilar, getArtworks, getCategories } = require('../controllers/artsyController');
const { authenticated } = require('../middleware/auth');

// @route   GET /api/artsy/search
// @desc    Search for artists
// @access  Public
router.get('/search', search);

// @route   GET /api/artsy/artists/:id
// @desc    Get artist details
// @access  Public
router.get('/artists/:id', getArtist);

// @route   GET /api/artsy/artists/:id/similar
// @desc    Get similar artists
// @access  Private
router.get('/artists/:id/similar', authenticated, getSimilar);

// @route   GET /api/artsy/artists/:id/artworks
// @desc    Get artworks by artist
// @access  Public
router.get('/artists/:id/artworks', getArtworks);

// @route   GET /api/artsy/artworks/:id/categories
// @desc    Get artwork categories
// @access  Public
router.get('/artworks/:id/categories', getCategories);

module.exports = router;
