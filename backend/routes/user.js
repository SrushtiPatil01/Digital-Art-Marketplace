const express = require('express');
const router = express.Router();
const {
  toggleFavorite,
  getFavorites,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser
} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Artwork = require('../models/Artwork');

router.patch('/favorite/:artworkId', authMiddleware, toggleFavorite);
router.get('/favorites', authMiddleware, getFavorites);

// GET /api/users/me – Get current logged-in user's profile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('favorites');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ ...user.toObject(), favorites: user.favorites.map(f => f._id.toString()) });
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/favorites/:artworkId', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      const { artworkId } = req.params;
  
      if (!user.favorites) user.favorites = [];
  
      const alreadyFavorited = user.favorites.includes(artworkId);
      let isFavorited = false;
  
      if (alreadyFavorited) {
        user.favorites = user.favorites.filter(fav => fav.toString() !== artworkId);
        isFavorited = false;
      } else {
        user.favorites.push(artworkId);
        isFavorited = true;
      }
  
      await user.save();
  
      res.status(200).json({ message: 'Favorite status updated', isFavorited });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  router.get('/:id', getUserById);
  router.put('/:id', authMiddleware, updateUser);
  router.put('/:id/password', authMiddleware, updatePassword);
  router.delete('/:id', authMiddleware, deleteUser);
  

module.exports = router;
