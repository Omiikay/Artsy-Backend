const {
  searchArtists,
  getArtistDetails,
  getSimilarArtists,
  getArtworksByArtist,
  getArtworkCategories,
} = require("../utils/artsy");

/**
 * Search for artists
 */
const search = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const results = await searchArtists(q);

    return res.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get artist details
 */
const getArtist = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Artist ID is required" });
    }

    console.log("Fetching artist details for ID:", id);
    const artist = await getArtistDetails(id);

    return res.json({ artist });
  } catch (error) {
    console.error("Get artist error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get similar artists
 */
const getSimilar = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Artist ID is required" });
    }

    const similarArtists = await getSimilarArtists(id);

    return res.json({ similarArtists });
  } catch (error) {
    console.error("Get similar artists error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get artworks by artist
 */
const getArtworks = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Artist ID is required" });
    }

    const artworks = await getArtworksByArtist(id);

    return res.json({ artworks });
  } catch (error) {
    console.error("Get artworks error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get artwork categories
 */
const getCategories = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Artwork ID is required" });
    }

    const categories = await getArtworkCategories(id);

    console.log("Fetched categories:", categories);

    return res.json({ categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  search,
  getArtist,
  getSimilar,
  getArtworks,
  getCategories,
};
