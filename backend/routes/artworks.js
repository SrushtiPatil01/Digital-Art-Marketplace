const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const authMiddleware = require('../middleware/auth');

const {
  createArtwork,
  getAllArtworks,
  getArtworkById,
  updateArtwork,
  deleteArtwork
} = require('../controllers/artworkController');
const upload = require('../upload'); // if you are handling image uploads

// Create a new artwork (with image upload)
router.post('/', authMiddleware, upload.single('img'), createArtwork);

// GET /api/artworks/seller - get all artworks by the logged-in seller
router.get('/seller', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const artworks = await Artwork.find({ createdBy: userId }); // or 'sellerId'
    res.json(artworks);

  } catch (err) {
    console.error('Error fetching seller artworks:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all artworks
router.get('/', getAllArtworks);

// Get a single artwork by ID
router.get('/:id', getArtworkById);

// Update an artwork by ID
router.put('/:id', authMiddleware, upload.single('img'), updateArtwork);

// Delete an artwork by ID
router.delete('/:id', deleteArtwork);

module.exports = router;