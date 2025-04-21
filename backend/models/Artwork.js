const mongoose = require('mongoose');

const ArtworkSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  artist: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  image: { type: String, required: true },
  dimensions: { type: String },
  medium: { type: String },
  yearCreated: { type: Number },
  createdBy: {  type: mongoose.Schema.Types.ObjectId,  ref: 'user',  required: true},
  inStock: { type: Boolean, default: true },
  discount: { type: Number, default: 0 },
  artworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Artwork', ArtworkSchema);
