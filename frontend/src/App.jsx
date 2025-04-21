import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import { useDispatch } from 'react-redux';
import { setUser } from './features/auth/authSlice';
import Home from './pages/Home';
import Login from './pages/LoginSignup/Login';
import Register from './pages/LoginSignup/Register';
import Navbar from './components/Navbar';
import Events from './pages/Events/Events';
import Marketplace from './pages/ArtworkMarketplace/Marketplace';
import Artwork from './pages/ArtworkMarketplace/Artwork'
import Wishlist from './pages/Wishlist';
import UserDashboard from './pages/User/UserDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import SellerDashboard from './pages/Seller/SellerDashboard';
import UploadArtwork from './pages/Seller/UploadArtwork';
import EditArtwork from './pages/Seller/EditArtwork';
import Cart from './pages/Cart/Cart';
import PaymentSuccess from './pages/Cart/PaymentSuccess';
import EventDetails from './pages/Events/EventDetails';

const AppContent = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [rehydrated, setRehydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      dispatch(setUser(JSON.parse(stored)));
    }
    setRehydrated(true);
  }, [dispatch]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (!rehydrated) return null;

  return (
    <>
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/artwork/:id" element={<Artwork />} />

        {/* Protected Routes */}
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <PrivateRoute>
              <Wishlist />
            </PrivateRoute>
          }
        />
        <Route
          path="/success"
          element={
            <PrivateRoute>
              <PaymentSuccess />
            </PrivateRoute>
          }
        />
        <Route
          path="/admindashboard"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/userdashboard"
          element={
            <PrivateRoute roles={['user']} usertypes={['buyer']}>
              <UserDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/sellerDashboard"
          element={
            <PrivateRoute roles={['user']} usertypes={['seller']}>
              <SellerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/uploadArtwork"
          element={
            <PrivateRoute roles={['user']} usertypes={['seller']}>
              <UploadArtwork />
            </PrivateRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <PrivateRoute roles={['user']} usertypes={['seller']}>
              <EditArtwork />
            </PrivateRoute>
          }
        />

        <Route
          path="/unauthorized"
          element={
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '80vh',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '2rem',
              }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
              <h2 style={{ color: 'crimson', fontWeight: 'bold', fontSize: '2rem' }}>Unauthorized Access</h2>
              <p style={{ color: '#555', maxWidth: '500px', margin: '1rem auto' }}>
                You don’t have permission to view this page. Please log in with appropriate access or go back to home.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  marginTop: '1rem',
                }}
              >
                🔙 Back to Home
              </button>
            </div>
          }
        />
      </Routes >
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
