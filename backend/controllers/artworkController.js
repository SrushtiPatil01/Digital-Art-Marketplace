const Artwork = require('../models/Artwork');

const createArtwork = async (req, res) => {
  try {
    let imagePath = '';
    if (req.file) {
      imagePath = '/uploads/' + req.file.filename;
    } else {
      // If not using file upload, check if an image URL is provided in the body
      imagePath = req.body.image;
    }
    
    // Validate required fields manually if needed
    if (!req.body.description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!imagePath) {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    // Destructure values from request body
    const { title, category, description, artist, price, stock, rating, dimensions, medium, yearCreated, inStock, discount } = req.body;
    
    // Convert and calculate the final price after discount.
    const originalPrice = parseFloat(price);
    const discountVal = parseFloat(discount) || 0;
    const finalPrice = originalPrice - (originalPrice * (discountVal / 100));
    
    // Create a new artwork document with the computed final price.
    const newArtwork = new Artwork({
      title,
      category,
      description,
      artist,
      price: finalPrice,  // store final price
      stock,
      rating,
      image: imagePath,
      dimensions,
      medium,
      yearCreated,
      inStock,
      discount: discountVal,
      createdBy: req.user.id,  // requires auth middleware to set req.user
    });
      
    await newArtwork.save();
    res.status(201).json({ message: 'Artwork created successfully', artwork: newArtwork });
  } catch (error) {
    console.error('Error creating artwork:', error);
    res.status(500).json({ message: 'Error creating artwork' });
  }
};

const getAllArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find();
    res.status(200).json(artworks);
  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({ message: 'Error fetching artworks' });
  }
};

const getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.status(200).json(artwork);
  } catch (error) {
    console.error('Error fetching artwork:', error);
    res.status(500).json({ message: 'Error fetching artwork' });
  }
};

const updateArtwork = async (req, res) => {
  try {
    const updateData = {};
    const { price, stock, rating, yearCreated, discount, ...restData } = req.body;
    
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock, 10);
    if (rating !== undefined) updateData.rating = parseFloat(rating);
    if (yearCreated !== undefined) updateData.yearCreated = parseInt(yearCreated, 10);
    if (discount !== undefined) updateData.discount = parseFloat(discount);
    
    Object.assign(updateData, restData);

    if (req.file) {
      updateData.image = '/uploads/' + req.file.filename;
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }

    // Update the artwork document
    const artwork = await Artwork.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    
    res.status(200).json({ message: 'Artwork updated successfully', artwork });
  } catch (error) {
    console.error('Error updating artwork:', error);
    res.status(500).json({ message: 'Error updating artwork' });
  }
};

const deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findByIdAndDelete(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.status(200).json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    console.error('Error deleting artwork:', error);
    res.status(500).json({ message: 'Error deleting artwork' });
  }
};

module.exports = { createArtwork, getAllArtworks, getArtworkById, updateArtwork, deleteArtwork };