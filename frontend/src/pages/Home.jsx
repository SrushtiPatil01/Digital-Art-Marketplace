// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from 'react-bootstrap';
import './Home.css';

const Home = () => {
  // Check if the user is logged in by seeing if a token is stored
  const isLoggedIn = !!localStorage.getItem('token');
  const [featuredArtworks, setFeaturedArtworks] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Fetch artworks and extract top 3 from the digital category sorted by rating descending
    const fetchArtworks = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/artworks');
        if (!response.ok) {
          throw new Error('Failed to fetch artworks');
        }
        const data = await response.json();
        const top3Digital = data
          .filter((art) => art.category.toLowerCase() === 'digital')
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3);
        setFeaturedArtworks(top3Digital);
      } catch (err) {
        console.error('Error fetching artworks:', err);
      }
    };

    // Fetch events and filter for those marked as top events
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3002/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        const top = data.filter((event) => event.isTopEvent);
        setTopEvents(top);
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    fetchArtworks();
    fetchEvents();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || user.username || '');
      } catch (e) {
        console.error('Error parsing userData:', e);
      }
    }
  }, []);
  
  return (
    <div className="home">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="hero-title">Discover Unique Artworks</h1>
              <p className="hero-subtitle">
                {isLoggedIn && userName
                  ? `Welcome back, ${userName}! 🎉 Explore cutting-edge art and connect with visionary creators.`
                  : `Welcome to PaletteSquare – your interactive art marketplace. Explore cutting-edge art and connect with visionary creators.`}
              </p>
              <div className="hero-buttons">
                {!isLoggedIn && (
                  <Link className="btn btn-primary hero-btn me-2" to="/register">
                    Join Now
                  </Link>
                )}
                <Link className="btn btn-outline-secondary hero-btn" to="/marketplace">
                  Browse Artworks
                </Link>
              </div>
            </div>
            <div className="col-md-6 hero-img-container">
              <img src="/assets/Home.png" alt="Featured Artwork" className="img-fluid hero-img" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED DIGITAL ARTWORKS CAROUSEL */}
      <section className="featured-section my-5">
        <div className="container">
          <h2 className="text-center mb-4">Featured Digital Artworks</h2>
          {featuredArtworks.length > 0 ? (
            <Carousel pause="hover" className="featured-carousel">
              {featuredArtworks.map((art) => (
                <Carousel.Item key={art._id || art.id}>
                  {art.image && (
                    <img
                      className="d-block w-100 carousel-img"
                      src={`http://localhost:3002${art.image}`}
                      alt={art.title}
                    />
                  )}
                  <Carousel.Caption className="carousel-caption-custom">
                    <h3>{art.title}</h3>
                    <p>
                      <strong>Rating:</strong> {art.rating} / 5&nbsp;|&nbsp;
                      <strong>Artist:</strong> {art.artist}
                    </p>
                  </Carousel.Caption>
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <p className="text-center">No featured artworks available.</p>
          )}
        </div>
      </section>

      {/* TOP EVENTS CAROUSEL */}
      {topEvents.length > 0 && (
        <section className="top-events-section my-5">
          <div className="container">
            <h2 className="text-center mb-4">Top Events</h2>
            <Carousel pause="hover" className="events-carousel">
              {topEvents.map((event) => (
                <Carousel.Item key={event._id}>
                  {event.image && (
                    <img
                      className="d-block w-100 carousel-img"
                      src={`http://localhost:3002${event.image}`}
                      alt={event.title}
                    />
                  )}
                  <Carousel.Caption className="carousel-caption-custom">
                    <h3>{event.title}</h3>
                    <p>
                      <strong>Date:</strong> {new Date(event.date).toLocaleDateString()} | <strong>Location:</strong> {event.location}
                    </p>
                    <p>{event.description}</p>
                    <Link to={`/events/${event._id}`}>
                      <button className="btn btn-outline-primary">Learn More</button>
                    </Link>
                  </Carousel.Caption>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* ARTIST HIGHLIGHTS SECTION */}
      <section className="artist-highlights my-5">
        <div className="container">
          <h2 className="text-center mb-4">Artist Highlights</h2>
          <div className="row">
            <div className="col-md-3 mb-4">
              <div className="artist-card text-center">
                <img
                  src="/assets/Artists/PP_1.avif"
                  alt="Artist 1"
                  className="img-fluid rounded-circle artist-img"
                />
                <h5 className="mt-2">Mikael Gustafsson</h5>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="artist-card text-center">
                <img
                  src="/assets/Artists/PP_3.avif"
                  alt="Artist 2"
                  className="img-fluid rounded-circle artist-img"
                />
                <h5 className="mt-2">Rowan Stormfeather</h5>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="artist-card text-center">
                <img
                  src="/assets/Artists/PP_2.avif"
                  alt="Artist 3"
                  className="img-fluid rounded-circle artist-img"
                />
                <h5 className="mt-2">Evelynn Nighthollow</h5>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="artist-card text-center">
                <img
                  src="/assets/Artists/PP_4.avif"
                  alt="Artist 4"
                  className="img-fluid rounded-circle artist-img"
                />
                <h5 className="mt-2">Aurora Lumen</h5>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
