const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artistId: {
    type: String,
    required: true
  },
  artistName: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  nationality: {
    type: String,
    default: ''
  },
  birthday: {
    type: String,
    default: ''
  },
  deathday: {
    type: String,
    default: ''
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can't add the same artist twice
FavoriteSchema.index({ user: 1, artistId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
