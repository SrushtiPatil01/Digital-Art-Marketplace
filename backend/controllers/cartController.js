// Example: backend/cartController.js
const Artwork = require('../models/Artwork');
const Cart = require('../models/Cart');

const updateCartItem = async (req, res) => {
  const { userId, artworkId, quantity } = req.body;

  try {
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) return res.status(404).json({ error: "Artwork not found" });

    if (quantity > artwork.stock) {
      return res.status(400).json({ error: "Not enough stock available" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const itemIndex = cart.items.findIndex(item => item.artworkId.toString() === artworkId);
    if (itemIndex !== -1) {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.artworkId');
    res.json(updatedCart);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
