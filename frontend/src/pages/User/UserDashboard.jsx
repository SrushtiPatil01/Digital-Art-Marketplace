// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Box,
    Typography,
    Paper,
    Divider,
    CircularProgress,
    Button,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    InputAdornment,
    IconButton,
    Tooltip,
    Tabs,
    Tab,
} from '@mui/material';
import './UserDashboard.css';

function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ mt: 2 }}>{children}</Box> : null;
}

const UserDashboard = () => {
    const navigate = useNavigate();
    const user = useSelector(state => state?.auth?.user);

    const [tab, setTab] = useState(0);
    const handleTabChange = (_, v) => setTab(v);

    const [userInfo, setUserInfo] = useState(null);
    const [editing, setEditing] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({ username: '', email: '' });
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user?._id) return;

        axios.get(`http://localhost:3002/api/users/${user._id}`)
            .then(res => {
                setFormData({ username: res.data.username, email: res.data.email });
                setUserInfo(res.data);
            })
            .catch(() => { }); // ignore for now

        axios.get(`http://localhost:3002/api/orders/${user._id}`)
            .then(res => setOrders(res.data))
            .catch(() => setError('Failed to load orders'))
            .finally(() => setLoading(false));
    }, [user]);

    // Unauthorized guard
    if (user && user.role !== 'user') {
        return (
            <Box sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h3" color="error" gutterBottom>
                    403 ‑ Unauthorized
                </Typography>
                <Typography variant="h6">You do not have permission to view this page.</Typography>
                <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate('/')}>
                    Go Home
                </Button>
            </Box>
        );
    }

    const handleUpdate = async () => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };
        const res = await axios.put(
            `http://localhost:3002/api/users/${user._id}`,
            { username: formData.username, email: formData.email },
            config
        );
        setUserInfo(res.data);
        setFormData({ username: res.data.username, email: res.data.email });
        setEditing(false);
    };


    const handlePasswordUpdate = async () => {
        if (passwordData.new !== passwordData.confirm) {
            setPasswordError('Passwords do not match');
            setPasswordSuccess('');
            return;
        }
        try {
            // grab the token and include it in headers
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:3002/api/users/${user._id}/password`,
                passwordData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setPasswordData({ current: '', new: '', confirm: '' });
            setPasswordError('');
            setPasswordSuccess(
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Password updated successfully <CheckCircleIcon fontSize="small" color="success" />
                </span>
            );

            setTimeout(() => {
                setPasswordSuccess('');
                setShowPasswordFields(false);
            }, 2000);
        } catch {
            setPasswordError('Failed to update password');
            setPasswordSuccess('');
        }
    };


    const handleDelete = async () => {
        if (!window.confirm('Delete account?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:3002/api/users/${user._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            localStorage.removeItem('token');
            window.location.href = '/';
        } catch {
            alert('Failed to delete account');
        }
    };


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
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Welcome to your Dashboard
                </Typography>

                <Tabs value={tab} onChange={handleTabChange} centered>
                    <Tab label="Profile" />
                    <Tab label="Security" />
                    <Tab label="Orders" />
                </Tabs>

                {/* — PROFILE TAB — */}
                <TabPanel value={tab} index={0}>
                    <Paper className="paper-section" sx={{ position: 'relative' }}>
                        <Tooltip title="Delete Account">
                            <IconButton
                                onClick={handleDelete}
                                color="error"
                                size="small"
                                sx={{ position: 'absolute', top: 16, right: 16 }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        <Typography variant="h6" mb={2}>Profile Information</Typography>
                        {editing ? (
                            <>
                                <TextField
                                    label="Username"
                                    fullWidth
                                    margin="normal"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                                <TextField
                                    label="Email"
                                    fullWidth
                                    margin="normal"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <Button variant="contained" onClick={handleUpdate}>Save</Button>
                                    <Button onClick={() => setEditing(false)}>Cancel</Button>
                                </Box>
                            </>
                        ) : (
                            <>
                                <Typography>Name: {userInfo?.username}</Typography>
                                <Typography>Email: {userInfo?.email}</Typography>
                                <Button sx={{ mt: 2 }} variant="contained" onClick={() => setEditing(true)}>
                                    Edit Profile
                                </Button>
                            </>
                        )}
                    </Paper>
                </TabPanel>

                {/* — SECURITY TAB — */}
                <TabPanel value={tab} index={1}>
                    <Paper className="paper-section">
                        <Accordion
                            expanded={showPasswordFields}
                            onChange={() => setShowPasswordFields(!showPasswordFields)}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">Change Password</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {/* Current Password */}
                                <TextField
                                    label="Current Password"
                                    fullWidth
                                    margin="normal"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={passwordData.current}
                                    onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                >
                                                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
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
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordData.new}
                                    onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
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
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={passwordData.confirm}
                                    onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />

                                {passwordError && (
                                    <Typography color="error" sx={{ mt: 1 }}>
                                        {passwordError}
                                    </Typography>
                                )}
                                {passwordSuccess && (
                                    <Typography color="success.main" sx={{ mt: 1 }}>
                                        {passwordSuccess}
                                    </Typography>
                                )}

                                <Button sx={{ mt: 2 }} variant="contained" onClick={handlePasswordUpdate}>
                                    Update Password
                                </Button>
                            </AccordionDetails>
                        </Accordion>
                    </Paper>
                </TabPanel>

                {/* — ORDERS TAB — */}
                <TabPanel value={tab} index={2}>
                    <Typography variant="h6" mb={2}>Order History</Typography>

                    {loading ? (
                        <CircularProgress />
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : orders.length === 0 ? (
                        <Typography>No orders found.</Typography>
                    ) : (
                        orders.map((order, i) => (
                            <Paper className="paper-section" key={i}>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography fontWeight={600}>
                                            Order on {new Date(order.date).toLocaleDateString()} — ${order.total}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {order.artworks.map((item, idx) => (
                                            <Box key={idx} sx={{ mb: 1 }}>
                                                <Typography>{item.artworkId.title}</Typography>
                                                <Typography variant="body2">Qty: {item.quantity}</Typography>
                                                <Typography variant="body2">Price: ${item.priceAtTime}</Typography>
                                                <Divider sx={{ my: 1 }} />
                                            </Box>
                                        ))}
                                    </AccordionDetails>
                                </Accordion>
                            </Paper>
                        ))
                    )}
                </TabPanel>
            </div>
        </div>
    );
};

export default UserDashboard;
