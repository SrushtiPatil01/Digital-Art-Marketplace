import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setUser } from '../../features/auth/authSlice';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
  
      if (data.token) {
        localStorage.setItem('token', data.token);

        localStorage.setItem('userData', JSON.stringify(data.user));
        dispatch(setUser(data.user));
  
        setMessage('Login successful');
        navigate('/');
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Login failed');
    }
  };
  

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
          url('/assets/Login.jpeg') no-repeat center center fixed
        `,
        backgroundSize: 'cover',
      }}
    >
      <div className="login-content-row">
        {/* LEFT SECTION */}
        <div className="info-section">
          <div className="info-overlay">
            <h1>Welcome to PaletteSquare</h1>
            <p>
              Your interactive art marketplace. Discover unique artworks, 
              connect with talented artists, and bring creativity into your life.
            </p>
          </div>
        </div>

        {/* RIGHT SECTION: Login card */}
        <div className="login-container">
          <div className="card login-card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login</h2>
              {message && <div className="alert alert-info">{message}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control custom-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3 position-relative">
                  <label htmlFor="password" className="form-label">Password:</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="form-control custom-input"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      top: '38px',
                      right: '10px',
                      cursor: 'pointer',
                      color: '#555',
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <button type="submit" className="btn btn-primary w-100 custom-btn">
                  Login
                </button>
              </form>
              <div className="mt-4 text-center">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="custom-link">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
