import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  let dashboardPath = '/dashboard';
  let role = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role;
      if (decoded.role === 'admin') dashboardPath = '/adminDashboard';
      else if (decoded.userType === 'seller') dashboardPath = '/sellerDashboard';
      else dashboardPath = '/userDashboard';
    } catch (e) {
      console.error('Invalid token:', e);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleNavbar = () => setIsCollapsed(!isCollapsed);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">PaletteSquare</Link>

        {/* Toggler for mobile view */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          aria-controls="navbarNav"
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible menu */}
        <div className={`collapse navbar-collapse justify-content-end ${!isCollapsed ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/events" className="nav-link">Events</Link>
            </li>
            <li className="nav-item">
              <Link to="/marketplace" className="nav-link">ArtWorks</Link>
            </li>

            {isLoggedIn && role !== 'admin' && (
              <li className="nav-item">
                <Link to="/cart" className="nav-link">Cart</Link>
              </li>
            )}

            {!isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link to="/login" className="btn btn-primary me-2 mt-2 mt-lg-0">Login</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="btn btn-outline-secondary mt-2 mt-lg-0">Sign Up</Link>
                </li>
              </>
            ) : (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#!"
                  id="profileDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src="/assets/profile.png"
                    alt="Profile"
                    style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                  />
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                  <li>
                    <Link className="dropdown-item" to={dashboardPath}>Dashboard</Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/wishlist">Wishlist</Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
