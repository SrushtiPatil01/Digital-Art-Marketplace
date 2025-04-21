import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  Box, Tabs, Tab, Typography,
  TextField, Button, Accordion, AccordionSummary, AccordionDetails,
  InputAdornment, IconButton, Paper, CircularProgress, Grid,
  Card, CardMedia, CardContent, CardActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import './SellerDashboard.css';

function TabPanel({ children, value, index }) {
  return value === index ? (
    <Box sx={{ pt: 2 }}>
      {children}
    </Box>
  ) : null;
}

const SellerDashboard = () => {
  const user = useSelector((s) => s.auth.user);
  const navigate = useNavigate();

  // Tabs state
  const [tab, setTab] = useState(0);
  const handleTab = (_, v) => setTab(v);

  // Profile form state
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [editing, setEditing] = useState(false);
  // Password form state
  const [pwdData, setPwdData] = useState({ current: '', new: '', confirm: '' });
  const [showPwdFields, setShowPwdFields] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  // Artworks state
  const [artworks, setArtworks] = useState([]);
  const [loadingArts, setLoadingArts] = useState(true);
  const [artsError, setArtsError] = useState('');

  // Load profile & artworks
  useEffect(() => {
    if (!user) return;

    axios.get(`http://localhost:3002/api/users/${user._id}`)
      .then(r => setFormData({ username: r.data.username, email: r.data.email }))
      .catch(() => { });

    const token = localStorage.getItem('token');
    fetch('http://localhost:3002/api/artworks/seller', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setArtworks)
      .catch(() => setArtsError('Failed to load artworks'))
      .finally(() => setLoadingArts(false));
  }, [user]);

  // Handlers (same as before)...
  const handleUpdateProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.put(
        `http://localhost:3002/api/users/${user._id}`,
        { username: formData.username, email: formData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData({ username: res.data.username, email: res.data.email });
      setEditing(false);
    } catch { alert('Failed to update profile'); }
  };

  const handleUpdatePassword = async () => {
    if (pwdData.new !== pwdData.confirm) {
      setPwdError('Passwords do not match');
      setPwdSuccess('');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:3002/api/users/${user._id}/password`,
        { current: pwdData.current, new: pwdData.new },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwdSuccess(
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Password updated <CheckCircleIcon fontSize="small" color="success" />
        </span>
      );
      setPwdError('');
      setPwdData({ current: '', new: '', confirm: '' });
      setTimeout(() => {
        setShowPwdFields(false);
        setPwdSuccess('');
      }, 2000);
    } catch {
      setPwdError('Failed to update password');
      setPwdSuccess('');
    }
  };

  const handleDeleteArt = async (id) => {
    if (!window.confirm('Delete this artwork?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3002/api/artworks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setArtworks(a => a.filter(x => x._id !== id));
    } catch { alert('Could not delete'); }
  };

  const totalRevenue = artworks.reduce((s, a) => s + Number(a.price || 0), 0);

  return (
    <div className="dashboard-container" style={{
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
    }}>
      <div className="dashboard-content">

        <Typography variant="h4" gutterBottom>Seller Dashboard</Typography>

        <Tabs value={tab} onChange={handleTab} centered>
          <Tab label="Profile" />
          <Tab label="Security" />
          <Tab label="My Artworks" />
        </Tabs>

        {/* Profile */}
        <TabPanel value={tab} index={0}>
          <Paper className="paper-section">
            <Typography variant="h6" gutterBottom>Profile Information</Typography>
            {editing ? (
              <>
                <TextField
                  label="Username"
                  fullWidth margin="normal"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
                <TextField
                  label="Email"
                  fullWidth margin="normal"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button variant="contained" onClick={handleUpdateProfile}>Save</Button>
                  <Button variant="outlined" onClick={() => setEditing(false)}>Cancel</Button>
                </Box>
              </>
            ) : (
              <>
                <Typography>Name: {formData.username}</Typography>
                <Typography>Email: {formData.email}</Typography>
                <Button sx={{ mt: 2 }} onClick={() => setEditing(true)}>Edit Profile</Button>
              </>
            )}
          </Paper>
        </TabPanel>

        {/* Security */}
        <TabPanel value={tab} index={1}>
          <Paper className="paper-section">
            <Accordion expanded={showPwdFields} onChange={() => setShowPwdFields(!showPwdFields)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Change Password</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Current Password */}
                <TextField
                  label="Current Password"
                  fullWidth
                  margin="normal"
                  type={showCurrentPwd ? 'text' : 'password'}
                  value={pwdData.current}
                  onChange={e => setPwdData({ ...pwdData, current: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowCurrentPwd(!showCurrentPwd)} edge="end">
                          {showCurrentPwd ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                {/* New Password */}
                <TextField
                  label="New Password"
                  fullWidth
                  margin="normal"
                  type={showNewPwd ? 'text' : 'password'}
                  value={pwdData.new}
                  onChange={e => setPwdData({ ...pwdData, new: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNewPwd(!showNewPwd)} edge="end">
                          {showNewPwd ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                {/* Confirm Password */}
                <TextField
                  label="Confirm Password"
                  fullWidth
                  margin="normal"
                  type={showConfirmPwd ? 'text' : 'password'}
                  value={pwdData.confirm}
                  onChange={e => setPwdData({ ...pwdData, confirm: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPwd(!showConfirmPwd)} edge="end">
                          {showConfirmPwd ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                {pwdError && <Typography color="error" sx={{ mt: 1 }}>{pwdError}</Typography>}
                {pwdSuccess && <Typography color="success.main" sx={{ mt: 1 }}>{pwdSuccess}</Typography>}

                <Button sx={{ mt: 2 }} onClick={handleUpdatePassword}>
                  Update Password
                </Button>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </TabPanel>

        {/* My Artworks */}
        <TabPanel value={tab} index={2}>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <Paper className="paper-section">
                <Typography variant="h6">Total Artworks</Typography>
                <Typography variant="h4">{artworks.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper className="paper-section">
                <Typography variant="h6">Total Revenue</Typography>
                <Typography variant="h4">${totalRevenue.toFixed(2)}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {loadingArts ? (
            <CircularProgress />
          ) : artsError ? (
            <Typography color="error">{artsError}</Typography>
          ) : artworks.length === 0 ? (
            <Box textAlign="center" mt={5}>
              <Typography>No artworks yet.</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/uploadArtwork')}
              >
                Upload Artwork
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {artworks.map(a => (
                <Grid item xs={12} sm={6} md={4} key={a._id}>
                  <Card>
                    <CardMedia
                      component="img" height="200"
                      image={`http://localhost:3002${a.image}`}
                      alt={a.title}
                    />
                    <CardContent>
                      <Typography variant="h6">{a.title}</Typography>
                      <Typography color="text.secondary">${a.price}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => navigate(`/artwork/${a._id}`)}>View</Button>
                      <Button size="small" onClick={() => navigate(`/edit/${a._id}`)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleDeleteArt(a._id)}>Delete</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box position="fixed" bottom={16} right={16}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/uploadArtwork')}
            >
              Add Artwork
            </Button>
          </Box>
        </TabPanel>

      </div>
    </div>
  );
};

export default SellerDashboard;
