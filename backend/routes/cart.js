const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Artwork = require('../models/Artwork');

// ADD item to cart
router.post('/add', async (req, res) => {
  const { userId, artworkId, quantity } = req.body;

  try {
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found or has been removed' });
    }

    if (artwork.stock === 0) {
      return res.status(400).json({ error: 'Artwork is out of stock' });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{
          artworkId,
          quantity,
          priceAtTime: artwork.price
        }]
      });
    } else {
      const existingItem = cart.items.find(item => item.artworkId.equals(artworkId));
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          artworkId,
          quantity,
          priceAtTime: artwork.price
        });
      }
    }

    await cart.save();

    // ✅ Return fully populated cart
    const updatedCart = await Cart.findOne({ userId }).populate('items.artworkId');
    res.status(200).json(updatedCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// GET cart for a user
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.artworkId');
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching cart' });
  }
});

// UPDATE quantity of item in cart
router.put('/update', async (req, res) => {
  const { userId, artworkId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.find(item => item.artworkId.equals(artworkId));
    if (item) {
      item.quantity = quantity;
      await cart.save();

      // ✅ Return populated cart
      const updatedCart = await Cart.findOne({ userId }).populate('items.artworkId');
      res.status(200).json(updatedCart);
    } else {
      res.status(404).json({ error: 'Item not found in cart' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error updating quantity' });
  }
});

// REMOVE item from cart
router.delete('/remove/:userId/:artworkId', async (req, res) => {
  try {
    const { userId, artworkId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter(item => !item.artworkId.equals(artworkId));
    await cart.save();

    // ✅ Return populated cart
    const updatedCart = await Cart.findOne({ userId }).populate('items.artworkId');
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: 'Error removing item from cart' });
  }
});

// CLEAR cart after checkout
router.delete('/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = []; // empty the cart
    await cart.save();

    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('Clear Cart Error:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});


module.exports = router;
