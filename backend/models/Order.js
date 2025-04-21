const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artworks: [{
    artworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
    quantity: Number,
    priceAtTime: Number
  }],
  total: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
