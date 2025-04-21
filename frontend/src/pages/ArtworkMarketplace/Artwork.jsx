import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './Artwork.css';

const Artwork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [liked, setLiked] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);

  // Get the current logged-in user from Redux
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  // Fetch artwork details
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await fetch(`http://localhost:3002/api/artworks/${id}`);
        if (!response.ok) throw new Error('Failed to fetch artwork details');
        const data = await response.json();
        setArtwork(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching artwork:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  useEffect(() => {
    const fetchCartQuantity = async () => {
      if (user && artwork?._id) {
        try {
          const res = await axios.get(`http://localhost:3002/api/cart/${user._id}`);
          const item = res.data.items.find(i => i.artworkId?._id === artwork._id);
          if (item) setCartQuantity(item.quantity);
        } catch (err) {
          console.error("Failed to fetch cart quantity:", err);
        }
      }
    };
    fetchCartQuantity();
  }, [user, artwork]);

  // Fetch user favorites to check if this artwork is liked
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:3002/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        const isLiked = data.favorites?.includes(id);
        setLiked(isLiked);
      } catch (err) {
        console.error('Error fetching user favorites:', err);
      }
    };

    fetchFavorites();
  }, [id]);

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to like an artwork.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3002/api/users/favorites/${artwork._id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.isFavorited);
      } else {
        const err = await response.json();
        console.error('Backend error:', err);
        alert(err.message || 'Failed to update favorite status');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Function to handle adding artwork to the cart
  const handleAddToCart = async () => {
    if (!user) {
      alert("Please log in to add items to your cart.");
      navigate('/login');
      return;
    }
  
    if (artwork.stock <= 0) {
      alert("Sorry, this artwork is currently out of stock.");
      return;
    }
  
    try {
      await axios.post('http://localhost:3002/api/cart/add', {
        userId: user._id,
        artworkId: artwork._id,
        quantity: 1,
      });
      setCartQuantity(1);
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add artwork to cart.");
    }
  };
  
  const handleIncrement = async () => {
    if (cartQuantity >= artwork.stock) return;
    await updateCartQuantity(cartQuantity + 1);
  };
  
  const handleDecrement = async () => {
    if (cartQuantity <= 1) return;
    await updateCartQuantity(cartQuantity - 1);
  };
  
  const updateCartQuantity = async (newQty) => {
    try {
      await axios.put('http://localhost:3002/api/cart/update', {
        userId: user._id,
        artworkId: artwork._id,
        quantity: newQty
      });
      setCartQuantity(newQty);
    } catch (err) {
      console.error("Update cart quantity error:", err);
      alert("Could not update cart.");
    }
  };
  
  const toggleDescription = () => {
    setShowFullDescription((prev) => !prev);
  };

  if (loading) return <div className="container text-center my-5"><p>Loading artwork details...</p></div>;
  if (error) return <div className="container text-center my-5"><p>Error: {error}</p></div>;
  if (!artwork) return <div className="container text-center my-5"><p>Artwork not found.</p></div>;

  const descriptionPreview =
    artwork.description.length > 200
      ? artwork.description.substring(0, 200) + '...'
      : artwork.description;

  return (
    <div className="artwork-details-page">
      <div className="container my-5">
        <Link to="/marketplace" className="btn btn-outline-info mb-4 back-btn">
          &larr; Back to Marketplace
        </Link>

        <div className="artwork-details-container">
          <div className="artwork-header">
            <h2 className="artwork-title">{artwork.title}</h2>
            <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={toggleFavorite}>
              {liked ? '♥ Liked' : '♡ Like'}
            </button>
          </div>

          <div className="row">
            <div className="col-md-6 artwork-image-wrapper">
              <img
                src={`http://localhost:3002${artwork.image}`}
                alt={artwork.title}
                className="img-fluid artwork-detail-img"
              />
            </div>

            <div className="col-md-6 artwork-info">
              <div className="tabs">
                <button
                  className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specs')}
                >
                  Specifications
                </button>
              </div>

              {activeTab === 'overview' && (
                <div className="tab-content">
                  <p><strong>Artist:</strong> {artwork.artist}</p>
                  <p><strong>Category:</strong> {artwork.category}</p>
                  <p><strong>Price:</strong> ${artwork.price}</p>
                  <p><strong>Rating:</strong> {artwork.rating} / 5</p>
                  <div className="artwork-description-wrapper">
                    <p>
                      <strong>Description:</strong> {showFullDescription ? artwork.description : descriptionPreview}
                    </p>
                    {artwork.description.length > 200 && (
                      <button className="read-more-btn" onClick={toggleDescription}>
                        {showFullDescription ? 'Show Less' : 'Read More'}
                      </button>
                    )}
                  </div>
                  {!isAdmin && (
                    cartQuantity === 0 ? (
                      <button
                        className="btn btn-primary mt-3"
                        onClick={handleAddToCart}
                        disabled={artwork.stock <= 0}
                      >
                        {artwork.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    ) : (
                      <div className="d-flex align-items-center gap-2 mt-3">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={handleDecrement}
                          disabled={cartQuantity <= 1}
                        >
                          −
                        </button>
                        <span>{cartQuantity}</span>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={handleIncrement}
                          disabled={cartQuantity >= artwork.stock}
                        >
                          +
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="tab-content">
                  {artwork.dimensions && <p><strong>Dimensions:</strong> {artwork.dimensions}</p>}
                  {artwork.medium && <p><strong>Medium:</strong> {artwork.medium}</p>}
                  {artwork.yearCreated && <p><strong>Year Created:</strong> {artwork.yearCreated}</p>}
                  {artwork.discount > 0 && <p><strong>Discount:</strong> {artwork.discount}%</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Artwork;
