const Favorite = require("../models/Favorite");
const { getArtistDetails } = require("../utils/artsy");

/**
 * Get user's favorite artists
 */
const getFavorites = async (req, res) => {
  try {
    // Find all favorites for the current user
    const favorites = await Favorite.find({ user: req.user.id }).sort({
      addedAt: -1,
    }); // Sort by newest first

    return res.json({ favorites });
  } catch (error) {
    console.error("Get favorites error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Add artist to favorites
 */
const addFavorite = async (req, res) => {
  try {
    const { artistId } = req.body;

    if (!artistId) {
      console.error("Artist ID is required to add to favorites");
      return res.status(400).json({ message: "Artist ID is required" });
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      user: req.user.id,
      artistId,
    });

    if (existingFavorite) {
      console.error("Artist already in favorites");
      return res.status(400).json({ message: "Artist already in favorites" });
    }

    console.log("Adding artist to favorites:", artistId);

    // Get artist details from Artsy API
    const artistDetails = await getArtistDetails(artistId);
    
    // Create new favorite
    const favorite = new Favorite({
      user: req.user.id,
      artistId,
      artistName: artistDetails.name,
      // imageUrl: artistDetails._links.thumbnail.href,
      imageUrl: artistDetails.imageUrl || "artsy_logo.svg",
      nationality: artistDetails.nationality || "",
      birthday: artistDetails.birthday || "",
      deathday: artistDetails.deathday || "",
      addedAt: new Date(),
    });

    // Save to database
    await favorite.save();
    console.log("Favorite added for artist:", artistId);

    return res.status(201).json({ favorite });
  } catch (error) {
    console.error("Add favorite error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Remove artist from favorites
 */
const removeFavorite = async (req, res) => {
  try {
    const { artistId } = req.params;

    if (!artistId) {
      return res.status(400).json({ message: "Artist ID is required" });
    }

    // Find and remove favorite
    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      artistId,
    });

    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    return res.json({ message: "Removed from favorites", artistId });
  } catch (error) {
    console.error("Remove favorite error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Check if artist is in favorites
 */
const checkFavorite = async (req, res) => {
  try {
    const { artistId } = req.params;

    if (!artistId) {
      return res.status(400).json({ message: "Artist ID is required" });
    }

    // Find favorite
    const favorite = await Favorite.findOne({
      user: req.user.id,
      artistId,
    });

    return res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error("Check favorite error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Remove all favorites (used when deleting account)
 */
const removeAllFavorites = async (userId) => {
  try {
    await Favorite.deleteMany({ user: userId });
  } catch (error) {
    console.error("Remove all favorites error:", error);
    throw error;
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
  removeAllFavorites,
};
