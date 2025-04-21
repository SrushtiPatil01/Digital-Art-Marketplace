const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Role for access control: 'admin' or 'user'
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  // Conditionally require userType only if role is 'user'
  userType: {
    type: String,
    enum: ['buyer', 'seller'],
    required: function () {
      return this.role === 'user';
    },
    default: function () {
      return this.role === 'user' ? 'buyer' : undefined;
    }
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork'
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
