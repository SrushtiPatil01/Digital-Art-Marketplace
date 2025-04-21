// src/pages/Marketplace.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Marketplace.css';

const Marketplace = () => {
  const [artworks, setArtworks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('priceAsc'); // default sort: price ascending
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Advanced Filters
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [minRating, setMinRating] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Adjust as needed

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch artworks from the backend on mount
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/artworks');
        if (!response.ok) {
          throw new Error('Failed to fetch artworks');
        }
        const data = await response.json();
        setArtworks(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching artworks:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  // Filtering function – if title/artist are missing, fallback to empty string
  const filterArtworks = (art) => {
    const title = art.title || "";
    const artist = art.artist || "";

    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.toLowerCase().includes(searchTerm.toLowerCase());

    const price = Number(art.price);
    const matchesPrice =
      (priceMin === '' || price >= Number(priceMin)) &&
      (priceMax === '' || price <= Number(priceMax));

    const matchesRating = minRating === '' || Number(art.rating) >= Number(minRating);
    const matchesStock = !inStockOnly || art.inStock === true;

    return matchesSearch && matchesPrice && matchesRating && matchesStock;
  };

  // Sorting function
  const sortFunction = (a, b) => {
    switch (sortBy) {
      case 'priceAsc':
        return a.price - b.price;
      case 'priceDesc':
        return b.price - a.price;
      case 'ratingAsc':
        return a.rating - b.rating;
      case 'ratingDesc':
        return b.rating - a.rating;
      default:
        return a.title.localeCompare(b.title);
    }
  };

  // Apply filter and sort
  const filteredArtworks = artworks.filter(filterArtworks);
  const sortedArtworks = [...filteredArtworks].sort(sortFunction);

  // Pagination calculations
  const totalItems = sortedArtworks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedArtworks = sortedArtworks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Modal open/close handlers
  const handleOpenFilters = () => setShowFilterModal(true);
  const handleCloseFilters = () => setShowFilterModal(false);
  const handleResetFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setMinRating('');
    setInStockOnly(false);
  };
  const handleApplyFilters = () => {
    setShowFilterModal(false);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="container text-center my-5">
        <p>Loading artworks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center my-5">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="marketplace-page">
      <div className="container my-4">
        <h1 className="text-center mb-4">Marketplace</h1>
        
        {/* Search, Sort & Filter Row */}
        <div className="row mb-3 align-items-center">
          <div className="col-md-7">
            <input
              type="text"
              className="form-control"
              placeholder="Search artworks or artists..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="priceAsc">Sort by Price: Low to High</option>
              <option value="priceDesc">Sort by Price: High to Low</option>
              <option value="ratingAsc">Sort by Rating: Low to High</option>
              <option value="ratingDesc">Sort by Rating: High to Low</option>
            </select>
          </div>
          <div className="col-md-2 text-end">
            <Button variant="outline-primary" onClick={handleOpenFilters} style={{ marginRight: '1rem' }}>
              <i className="bi bi-funnel"></i> Filters
            </Button>
            <Button variant="secondary" onClick={handleResetFilters}>
              Reset
            </Button>
          </div>
        </div>

        {/* Artwork Cards */}
        <div className="row">
          {paginatedArtworks.length > 0 ? (
            paginatedArtworks.map((art) => (
              <div key={art._id || art.id} className="col-md-4 mb-4">
                <Link to={`/artwork/${art._id || art.id}`} className="text-decoration-none text-dark">
                  <div className="card artwork-card h-100 shadow">
                    <img
                      src={`http://localhost:3002${art.image}`}
                      className="card-img-top"
                      alt={art.title}
                    />
                    <div className="card-body text-center">
                      <h5 className="card-title">{art.title}</h5>
                      <p className="card-text">{art.artist}</p>
                      <p className="card-text"><strong>Price:</strong> ${art.price}</p>
                      <p className="card-text"><strong>Rating:</strong> {art.rating} / 5</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-center">No artworks found.</p>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-controls d-flex justify-content-center my-4">
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`btn ${currentPage === index + 1 ? 'btn-primary' : 'btn-outline-secondary'} me-2`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="btn btn-outline-secondary"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters Modal */}
      <Modal show={showFilterModal} onHide={handleCloseFilters}>
        <Modal.Header closeButton>
          <Modal.Title>Advanced Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Min Price</label>
            <input
              type="number"
              className="form-control"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Max Price</label>
            <input
              type="number"
              className="form-control"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Min Rating</label>
            <input
              type="number"
              className="form-control"
              min="0"
              max="5"
              step="0.1"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            />
          </div>
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="filterInStock"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="filterInStock">
              In Stock Only
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleResetFilters}>
            Reset
          </Button>
          <Button variant="primary" onClick={handleApplyFilters}>
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Marketplace;
