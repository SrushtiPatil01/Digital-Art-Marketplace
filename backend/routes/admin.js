const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const User = require('../models/User');
const Order = require('../models/Order');
const Artwork = require('../models/Artwork');

// ==================== MULTER SETUP ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/artworks'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

// ==================== DASHBOARD ROUTES ====================

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'username email')
      .populate('artworks.artworkId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/revenue', async (req, res) => {
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    res.json({ totalRevenue });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate revenue' });
  }
});

router.get('/top-artworks', async (req, res) => {
  try {
    const orders = await Order.find().populate('artworks.artworkId');
    const salesMap = {};

    orders.forEach(order => {
      order.artworks.forEach(({ artworkId, quantity }) => {
        const id = artworkId._id.toString();
        if (!salesMap[id]) {
          salesMap[id] = { artwork: artworkId, quantity: 0 };
        }
        salesMap[id].quantity += quantity;
      });
    });

    const topArtworks = Object.values(salesMap).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    res.json(topArtworks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get top-selling artworks' });
  }
});

router.get('/recent-users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get recent users' });
  }
});

router.get('/recent-orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'username');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get recent orders' });
  }
});

// ==================== USER CRUD ====================

router.post('/users', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const newUser = new User({ username, email, password, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ==================== ARTWORK CRUD ====================

router.post('/artworks', upload.single('image'), async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const image = req.file ? `/uploads/artworks/${req.file.filename}` : '';

    const newArtwork = new Artwork({ title, description, price, image });
    await newArtwork.save();
    res.status(201).json(newArtwork);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create artwork' });
  }
});

router.put('/artworks/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const updateFields = {
      title,
      description,
      price,
    };

    if (req.file) {
      updateFields.image = `/uploads/artworks/${req.file.filename}`;
    }

    const updatedArtwork = await Artwork.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    res.json(updatedArtwork);
  } catch (err) {
    console.error('Artwork update error:', err);
    res.status(500).json({ error: 'Failed to update artwork' });
  }
});


router.delete('/artworks/:id', async (req, res) => {
  try {
    await Artwork.findByIdAndDelete(req.params.id);
    res.json({ message: 'Artwork deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete artwork' });
  }
});

module.exports = router;
