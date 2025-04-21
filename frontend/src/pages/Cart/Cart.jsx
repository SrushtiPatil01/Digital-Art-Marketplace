import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  IconButton,
  Divider,
  TextField
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

import { loadStripe } from '@stripe/stripe-js';
await loadStripe('pk_test_51REDzrPc6dvswIWIcNPs6GhoUMmGuLK4wEV8ViU2fa2rdnRMXBVpB3IWmMkqiPte04QHhItEvwnmtY3BaMAN3xCM00m381huG5');

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(true);
  const [discountApplied, setDiscountApplied] = useState(false);

  // Get the user from the Redux store
  const user = useSelector(state => state?.auth?.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) {
      axios.get(`http://localhost:3002/api/cart/${user._id}`)
        .then(res => {
          setCart(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Cart API error:", err.response?.data || err.message);
          setError('Error loading cart');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const updateQuantity = async (artworkId, quantity) => {
    try {
      const res = await axios.put('http://localhost:3002/api/cart/update', {
        userId: user._id,
        artworkId,
        quantity
      });
      setCart(res.data);
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const removeItem = async (artworkId) => {
    try {
      const res = await axios.delete(`http://localhost:3002/api/cart/remove/${user._id}/${artworkId}`);
      setCart(res.data);
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const handleCheckout = async () => {
    try {
      // filter out any items whose artworkId is null
      const validItems = cart.items.filter(item => item.artworkId);
      const lineItems = validItems.map(item => ({
        title: item.artworkId.title || 'Unknown artwork',
        price: item.priceAtTime,
        quantity: item.quantity
      }));

      const response = await axios.post(
        'http://localhost:3002/api/payment/create-checkout-session',
        { cartItems: lineItems }
      );
      window.location.href = response.data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong while redirecting to Stripe.');
    }
  };

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'ILOVEART') {
      setDiscountApplied(true);
      setIsCodeValid(true);
    } else {
      setIsCodeValid(false);
      setDiscountApplied(false);
    }
  };

  const subtotal = cart?.items?.reduce((acc, item) => acc + item.priceAtTime * item.quantity, 0) || 0;
  const discountedTotal = discountApplied ? (subtotal * 0.7).toFixed(2) : subtotal.toFixed(2);

  if (!user) {
    return (
      <Box className="cart-wrapper">
        <Container>
          <Typography variant="h5">Please log in to view your cart.</Typography>
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box className="cart-wrapper">
        <Container>
          <Typography>Loading...</Typography>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="cart-wrapper">
        <Container>
          <Typography variant="h6" color="error">{error}</Typography>
        </Container>
      </Box>
    );
  }

  if (!cart?.items?.length) {
    return (
      <Box className="cart-wrapper" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Box textAlign="center">
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Oops! Your cart is empty 🛒
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Why don't you check out some beautiful artworks?
          </Typography>
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate('/marketplace')}>
            Browse Artworks
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="cart-wrapper" sx={{ minHeight: '100vh' }}>
      <Container maxWidth={false}>
        <Grid container spacing={4} alignItems="stretch" className="cart-container">
          <Grid item xs={12} md={7} className="cart-left">
            <Typography variant="h5" fontWeight={700} gutterBottom>Cart</Typography>

            {cart.items
              .filter(item => item.artworkId)               // drop nulls
              .map((item, index) => (
                <Card className="cart-item-card" key={index}>
                  <CardMedia
                    component="img"
                    className="cart-image"
                    // optional‐chain to be extra safe:
                    image={
                      item.artworkId.image
                        ? `http://localhost:3002${item.artworkId.image}`
                        : '/placeholder.png'
                    }
                    alt={item.artworkId.title || 'Artwork'}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {item.artworkId.title || 'Unknown title'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Price: ${item.priceAtTime?.toFixed(2) ?? '0.00'}
                    </Typography>

                    <Box className="cart-actions">
                      <IconButton
                        onClick={() =>
                          updateQuantity(item.artworkId._id, Math.max(1, item.quantity - 1))
                        }
                      >
                        <Remove />
                      </IconButton>
                      <Typography>{item.quantity}</Typography>
                      <IconButton
                        onClick={() => updateQuantity(item.artworkId._id, item.quantity + 1)}
                        disabled={item.quantity >= item.artworkId.stock}
                      >
                        <Add />
                      </IconButton>
                      <IconButton onClick={() => removeItem(item.artworkId._id)} color="error">
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))
            }

            <Box className="cart-promo">
              <TextField
                fullWidth
                variant="outlined"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                placeholder='Enter promo code (Try "ILOVEART")'
              />
              <Button variant="contained" color="primary" onClick={applyPromo} className="checkout-button" sx={{ whiteSpace: 'nowrap' }}>
                Apply
              </Button>
            </Box>
            {!isCodeValid && <Typography className="promo-error">Invalid code</Typography>}
          </Grid>

          <Grid item xs={12} md={5} className="cart-right">
            <Box className="order-summary">
              <Typography variant="h6" fontWeight={700}>Order Summary</Typography>
              <Box>
                <Typography variant="body1">Subtotal:</Typography>
                {discountApplied ? (
                  <>
                    <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>
                      ${subtotal.toFixed(2)}
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>${discountedTotal}</Typography>
                  </>
                ) : (
                  <Typography variant="h6" fontWeight={700}>${subtotal.toFixed(2)}</Typography>
                )}
              </Box>
              <Button className="checkout-button" fullWidth onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircleIcon fontSize="small" color="success" />
                  <Typography variant="body2">Satisfaction Guaranteed</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <LockIcon fontSize="small" color="primary" />
                  <Typography variant="body2">Secure Checkout</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <FavoriteIcon fontSize="small" color="error" />
                  <Typography variant="body2">Support Independent Artists</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Cart;
