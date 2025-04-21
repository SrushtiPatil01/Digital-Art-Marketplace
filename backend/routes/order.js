const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.post('/create', async (req, res) => {
  try {
    const { userId, artworks, total } = req.body;
    const newOrder = new Order({ userId, artworks, total });
    await newOrder.save();
    res.status(201).json({ message: 'Order created successfully' });
  } catch (err) {
    console.error('ORDER SAVE ERROR ❌', err);
    res.status(500).json({ error: 'Failed to save order' });
  }
});


router.get('/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate('artworks.artworkId');
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

module.exports = router;
