import React, { useEffect } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import axios from 'axios';
import { useSelector } from 'react-redux';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    const placeOrder = async () => {
      try {
        // 1. Get the latest cart
        const cartRes = await axios.get(`http://localhost:3002/api/cart/${user._id}`);
        const cart = cartRes.data;

        // 2. Prepare order payload
        const orderData = {
          userId: user._id,
          artworks: cart.items
            .filter(item => item.artworkId) // ✅ Filter out nulls!
            .map(item => ({
              artworkId: item.artworkId._id,
              quantity: item.quantity,
              priceAtTime: item.priceAtTime
            })),
          total: cart.items
            .filter(item => item.artworkId) // ✅ Again, only valid entries
            .reduce((sum, item) => sum + item.priceAtTime * item.quantity, 0)
        };        

        // 3. Create the order
        await axios.post('http://localhost:3002/api/orders/create', orderData);

        // 4. Clear the cart (optional)
        await axios.delete(`http://localhost:3002/api/cart/clear/${user._id}`);
      } catch (err) {
        console.error('Order placement failed:', err);
      }
    };

    if (user?._id) placeOrder();
  }, [user]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="70vh"
      textAlign="center"
    >
      <CheckCircleOutline sx={{ fontSize: 80, color: 'green', mb: 2 }} />
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Payment Successful!
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Thank you for your purchase. Your order has been placed successfully.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={() => navigate('/')}
      >
        Back to Home
      </Button>
    </Box>
  );
};

export default PaymentSuccess;
