const User = require('../models/User');
const Artwork = require('../models/Artwork');
const bcrypt = require('bcrypt');

/// POST /api/users/favorites/:artworkId
const toggleFavorite = async (req, res) => {
  const userId = req.user?.id;
  const { artworkId } = req.params;

  if (!userId || !artworkId) {
    return res.status(400).json({ message: 'Missing userId or artworkId' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.favorites.indexOf(artworkId);
    let isFavorited;

    if (index === -1) {
      user.favorites.push(artworkId);
      isFavorited = true;
    } else {
      user.favorites.splice(index, 1);
      isFavorited = false;
    }

    await user.save();

    return res.status(200).json({ message: 'Favorite status updated', isFavorited });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch favorites', error: err });
  }
};


const getUserById = async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select('-password');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const u = await User.findByIdAndUpdate(
      req.params.id,
      { username, email },
      { new: true, runValidators: true }
    ).select('-password');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/users/:id/password
const updatePassword = async (req, res) => {
  try {
    const { current, new: newPass } = req.body;
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(current, u.password);
    if (!ok) return res.status(400).json({ message: 'Current password incorrect' });

    u.password = await bcrypt.hash(newPass, 10);
    await u.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  toggleFavorite,
  getFavorites,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser
};
