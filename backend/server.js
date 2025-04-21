const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((error) => console.error('MongoDB connection error:', error));

// auth routes under /api/auth
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// user routes
const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

// event routes
const eventRoutes = require('./routes/event');
app.use('/api/events', eventRoutes);

// artworks routes
const artworkRoutes = require('./routes/artworks');
app.use('/api/artworks', artworkRoutes);

// cart routes
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);

// payment routes
const paymentRoutes = require('./routes/paymentsuccess');
app.use('/api/payment', paymentRoutes);

// Orders (User Dashboard)
const orderRoutes = require('./routes/order');
app.use('/api/orders', orderRoutes);

// Admin Dashboard
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});