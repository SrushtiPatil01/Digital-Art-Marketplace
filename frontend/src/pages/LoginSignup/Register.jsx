// client/src/pages/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    userType: 'buyer',
  });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Helper function to validate the fields
  const validateForm = () => {
    const { username, email, password } = formData;
    // Username should contain only alphabets (no spaces or special characters)
    const usernameRegex = /^[A-Za-z]+$/;
    if (!usernameRegex.test(username)) {
      return "Username must contain only letters (A-Z or a-z).";
    }
    // Simple email validation: must include "@" and end with ".com"
    if (!email.includes('@') || !email.endsWith('.com')) {
      return "Email must be a valid email address (e.g., user@example.com).";
    }
    // Password should be more than 6 characters
    if (password.length <= 6) {
      return "Password must be at least 7 characters long.";
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMessage('');
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setMessage(error);
      return;
    }
    try {
      const response = await fetch('http://localhost:3002/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Registration failed');
    }
  };

  return (
    <div className="login-bg" style={{
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
      backgroundSize: 'cover'
    }}>
      <div className="login-content-row">
        {/* LEFT SECTION: Info with semi-transparent overlay */}
        <div className="info-section">
          <div className="info-overlay">
            <h1>Join PaletteSquare</h1>
            <p>
              Sign up now to start buying or selling unique artworks. Become part of our creative community!
            </p>
          </div>
        </div>

        {/* RIGHT SECTION: Registration form */}
        <div className="login-container">
          <div className="card login-card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Register</h2>
              {message && <div className="alert alert-info">{message}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username:</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3 position-relative">
                  <label htmlFor="password" className="form-label">Password:</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="form-control"
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
                <div className="mb-3">
                  <label htmlFor="userType" className="form-label">User Type:</label>
                  <select
                    id="userType"
                    name="userType"
                    className="form-select"
                    value={formData.userType}
                    onChange={handleChange}
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100">Register</button>
              </form>
              <div className="mt-4 text-center">
                <p>
                  Already have an account? <Link to="/login">Login here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
