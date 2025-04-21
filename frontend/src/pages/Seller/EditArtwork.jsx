// src/pages/EditArtwork.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Grid
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const EditArtwork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    artist: '',
    description: '',
    price: '',
    stock: '',
    rating: '',
    dimensions: '',
    medium: '',
    yearCreated: '',
    discount: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch the current artwork details
  useEffect(() => {
    const fetchArtwork = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:3002/api/artworks/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch artwork details');
        const data = await response.json();
        setFormData({
          title: data.title,
          category: data.category,
          artist: data.artist,
          description: data.description,
          price: data.price,
          stock: data.stock,
          rating: data.rating,
          dimensions: data.dimensions || '',
          medium: data.medium || '',
          yearCreated: data.yearCreated,
          discount: data.discount,
        });
        setPreview(`http://localhost:3002${data.image}`);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const payload = new FormData();

    // Append all the form data fields to FormData
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value);
    });
    if (image) payload.append('img', image);

    try {
      const res = await fetch(`http://localhost:3002/api/artworks/${id}`, {
        method: 'PUT',
        // Do not set 'Content-Type' manually when sending FormData.
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });
      const data = await res.json();
      if (res.ok) {
        alert('Artwork updated successfully!');
        navigate('/sellerDashboard');
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update artwork');
    }
  };

  if (loading) return <Container><Typography>Loading artwork details...</Typography></Container>;
  if (error) return <Container><Typography color="error">Error: {error}</Typography></Container>;

  return (
    <Container maxWidth="xl" style={{
      background: `
        linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
        url('/assets/Login.jpeg') no-repeat center center fixed
      `,
      backgroundSize: 'cover',
      padding: '64px 200px'}}>
      <Typography variant="h4" gutterBottom style={{ color: '#fff' }}>Edit Artwork</Typography>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Basic Info Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Basic Info</Typography>
          <Grid container spacing={2}>
            <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
              />
            </Grid>
            <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField
                fullWidth
                label="Artist"
                name="artist"
                required
                value={formData.artist}
                onChange={handleChange}
              />
            </Grid>
            <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField
                fullWidth
                label="Price ($)"
                type="number"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Artwork Specs Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Artwork Specs</Typography>
          <Grid container spacing={2}>
            <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField
                fullWidth
                label="Dimensions"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
              />
            </Grid>
            <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField
                fullWidth
                label="Medium"
                name="medium"
                value={formData.medium}
                onChange={handleChange}
                helperText="Only letters and spaces allowed"
              />
            </Grid>
            <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField
                fullWidth
                label="Year Created"
                type="number"
                name="yearCreated"
                value={formData.yearCreated}
                onChange={handleChange}
                helperText={`Must be ${new Date().getFullYear()} or earlier`}
              />
            </Grid>
            <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField
                fullWidth
                label="Discount (%)"
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
              />
            </Grid>
            {/* New uneditable fields for Stock and Rating */}
            <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField
                fullWidth
                label="Stock"
                name="stock"
                value={formData.stock}
                disabled
              />
            </Grid>
            <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
              <TextField
                fullWidth
                label="Rating"
                name="rating"
                value={formData.rating}
                disabled
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Image Upload Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Upload Image</Typography>
          <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
            Choose File
            <input type="file" hidden onChange={handleImageChange} accept="image/*" />
          </Button>
          {preview && (
            <Box mt={2} textAlign="center">
              <img
                src={preview}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
              />
            </Box>
          )}
        </Paper>

        {/* Submit Button */}
        <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Update Artwork
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default EditArtwork;
