import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  CardActionArea,
  Typography,
  IconButton,
  Container,
  CircularProgress,
  Button
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link, useNavigate } from 'react-router-dom';
import './Wishlist.css';

const Wishlist = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3002/api/users/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Couldn’t load favorites');
        const data = await res.json();
        setFavorites(Array.isArray(data) ? data : data.favorites || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const removeFavorite = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/users/favorites/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(favs => favs.filter(a => (a._id || a.id) !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <Container className="wishlist-container">
      <CircularProgress />
    </Container>
  );
  if (error) return (
    <Container className="wishlist-container">
      <Typography color="error">Error: {error}</Typography>
    </Container>
  );
  if (!favorites.length) return (
    <Container className="wishlist-container">
      <Typography variant="h3" gutterBottom>No favorites yet!</Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/marketplace')}
      >
        Browse Artworks
      </Button>
    </Container>
  );

  return (
    <Container className="wishlist-container" maxWidth="lg">
      <Typography variant="h4" fontWeight={700} gutterBottom>
        My Wishlist
      </Typography>
      <Grid container spacing={4}>
        {favorites.map(art => {
          const id = art._id || art.id;
          return (
            <Grid item xs={12} sm={6} md={4} key={id}>
              <Card className="wishlist-card">
                {/* Make the whole top area clickable */}
                <CardActionArea
                  component={Link}
                  to={`/artwork/${id}`}
                >
                  <CardMedia
                    component="img"
                    height="240"
                    image={`http://localhost:3002${art.image}`}
                    alt={art.title}
                    className="wishlist-media"
                  />
                  <CardContent className="wishlist-content">
                    <Typography variant="h6" gutterBottom>
                      {art.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {art.artist}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      ${art.price}
                    </Typography>
                  </CardContent>
                </CardActionArea>

                {/* Only the heart is a remove button */}
                <CardActions className="wishlist-actions">
                  <IconButton
                    onClick={() => removeFavorite(id)}
                    color="error"
                    title="Remove from Wishlist"
                  >
                    <FavoriteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default Wishlist;
