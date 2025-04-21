// src/pages/UploadArtwork.jsx
import React, { useState } from 'react';
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

const UploadArtwork = () => {
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
  const [validationError, setValidationError] = useState('');

  const currentYear = new Date().getFullYear();
  
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setValidationError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const validateFields = () => {
    // Ensure yearCreated is not in the future.
    if (formData.yearCreated && parseInt(formData.yearCreated, 10) > currentYear) {
      return `Year Created must be less than or equal to ${currentYear}.`;
    }
    // Ensure medium contains only alphabets and optional spaces.
    if (formData.medium && !/^[A-Za-z\s]+$/.test(formData.medium)) {
      return 'Medium should contain only letters and spaces.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMsg = validateFields();
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }

    const token = localStorage.getItem('token');
    const payload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value);
    });
    if (image) payload.append('img', image);

    try {
      const res = await fetch('http://localhost:3002/api/artworks', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });
      const data = await res.json();
      if (res.ok) {
        alert('Artwork uploaded successfully!');
        // Optionally, you may reset the form or redirect here.
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload artwork');
    }
  };

  return (
    <Container maxWidth="xl" style={{
      background: `
        linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
        url('/assets/Login.jpeg') no-repeat center center fixed
      `,
      backgroundSize: 'cover',
      padding: '64px 200px'
    }}>
      <Typography variant="h3" gutterBottom style={{ color: '#fff' }}>Upload New Artwork</Typography>
      {validationError && (
        <Typography variant="body1" color="error" sx={{ mb: 2 }}>
          {validationError}
        </Typography>
      )}
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
                helperText={`Must be ${currentYear} or earlier`}
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
            Submit Artwork
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default UploadArtwork;
