import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Button,
  TextField,
  IconButton,
  Tabs,
  Tab,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import "./AdminDashboard.css";

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ mt: 2 }}>{children}</Box> : null;
}

const AdminDashboard = () => {
  const admin = useSelector((s) => s.auth.user);
  const nav = useNavigate();

  // --- Tabs ---
  const [tab, setTab] = useState(0);
  const handleChangeTab = (_, v) => setTab(v);

  // --- Data lists & loading flag ---
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [topArtworks, setTopArtworks] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  // --- Forms for users & artworks (unchanged) ---
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "user" });
  const [newArtwork, setNewArtwork] = useState({ title: "", description: "", price: "" });
  const [artworkImage, setArtworkImage] = useState(null);
  const [editingArtworkId, setEditingArtworkId] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({ title: "", location: "", date: "", description: "" });
  const [eventImage, setEventImage] = useState(null);

  // --- Admin’s own profile & password forms ---
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ username: "", email: "" });
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Fetch everything + role guard
  useEffect(() => {
    if (!admin) return;
    if (admin.role !== "admin") return nav("/");

    // initialize profile fields
    setProfileData({ username: admin.username, email: admin.email });

    const fetchAll = async () => {
      try {
        const [uRes, oRes, rRes, tRes, aRes, eRes] = await Promise.all([
          axios.get("http://localhost:3002/api/admin/users"),
          axios.get("http://localhost:3002/api/admin/orders"),
          axios.get("http://localhost:3002/api/admin/revenue"),
          axios.get("http://localhost:3002/api/admin/top-artworks"),
          axios.get("http://localhost:3002/api/artworks"),
          axios.get("http://localhost:3002/api/events"),
        ]);
        setUsers(uRes.data);
        setOrders(oRes.data);
        setRevenue(rRes.data.totalRevenue);
        setTopArtworks(tRes.data);
        setArtworks(aRes.data);
        setEvents(eRes.data);
      } catch (e) {
        console.error("Admin fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [admin, nav]);

  if (loading) {
    return (
      <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  // —— PROFILE SAVE ——
  const handleProfileSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3002/api/users/${admin._id}`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingProfile(false);
      // (optionally refresh your Redux user slice here)
    } catch {
      alert("Failed to save profile");
    }
  };

  // —— PASSWORD UPDATE ——
  const handlePasswordSave = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError("Passwords do not match");
      setPasswordSuccess("");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3002/api/users/${admin._id}/password`,
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordError("");
      setPasswordSuccess("Password updated!");
      setPasswordData({ current: "", new: "", confirm: "" });
      setTimeout(() => setPasswordSuccess(""), 2000);
    } catch {
      setPasswordError("Failed to update password");
      setPasswordSuccess("");
    }
  };

  // —— CREATE / DELETE USER ——
  const handleCreateUser = async () => {
    try {
      const res = await axios.post("http://localhost:3002/api/admin/users", newUser);
      setUsers((u) => [...u, res.data]);
      setNewUser({ username: "", email: "", password: "", role: "user" });
    } catch {
      alert("Failed to create user");
    }
  };
  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:3002/api/admin/users/${id}`);
      setUsers((u) => u.filter((x) => x._id !== id));
    } catch {
      alert("Failed to delete user");
    }
  };

  // —— CREATE / EDIT / DELETE ARTWORK ——
  const handleCreateOrUpdateArtwork = async () => {
    const fd = new FormData();
    fd.append("title", newArtwork.title);
    fd.append("description", newArtwork.description);
    fd.append("price", newArtwork.price);
    if (artworkImage) fd.append("image", artworkImage);
    try {
      if (editingArtworkId) {
        const res = await axios.put(
          `http://localhost:3002/api/admin/artworks/${editingArtworkId}`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setArtworks((a) => a.map((x) => (x._id === editingArtworkId ? res.data : x)));
        setEditingArtworkId(null);
      } else {
        const res = await axios.post(
          "http://localhost:3002/api/admin/artworks",
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setArtworks((a) => [...a, res.data]);
      }
      setNewArtwork({ title: "", description: "", price: "" });
      setArtworkImage(null);
    } catch {
      alert("Failed to save artwork");
    }
  };
  const handleEditArtwork = (a) => {
    setNewArtwork({ title: a.title, description: a.description, price: a.price });
    setEditingArtworkId(a._id);
  };
  const handleDeleteArtwork = async (id) => {
    try {
      await axios.delete(`http://localhost:3002/api/admin/artworks/${id}`);
      setArtworks((a) => a.filter((x) => x._id !== id));
    } catch {
      alert("Failed to delete artwork");
    }
  };

  // — EVENT handlers
  const handleEventSubmit = async () => {
    const fd = new FormData();
    Object.entries(eventForm).forEach(([k, v]) => fd.append(k, v));
    if (eventImage) fd.append("image", eventImage);

    try {
      let res;
      if (editingEvent) {
        res = await axios.put(`http://localhost:3002/api/events/${editingEvent}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setEvents(evts =>
          evts.map(e => e._id === editingEvent ? res.data.event : e)
        );
      } else {
        res = await axios.post("http://localhost:3002/api/events", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setEvents(evts => [...evts, res.data.event]);
      }
      // reset form
      setEditingEvent(null);
      setEventForm({ title: "", location: "", date: "", description: "" });
      setEventImage(null);
    } catch {
      alert("Failed to save event");
    }
  };

  const handleEditEvent = evt => {
    setEditingEvent(evt._id);
    setEventForm({
      title: evt.title,
      location: evt.location,
      date: evt.date.split("T")[0],
      description: evt.description,
    });
  };

  const handleDeleteEvent = async id => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await axios.delete(`http://localhost:3002/api/events/${id}`);
      setEvents(evts => evts.filter(e => e._id !== id));
    } catch {
      alert("Failed to delete event");
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
      <Box className="dashboard-content">
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Admin Dashboard
        </Typography>

        <Tabs value={tab} onChange={handleChangeTab} variant="fullWidth" sx={{ mb: 3 }}>
          <Tab label="Profile" />
          <Tab label="Security" />
          <Tab label="Overview" />
          <Tab label="Users" />
          <Tab label="Artworks" />
          <Tab label="Events" />
          <Tab label="Orders" />
        </Tabs>

        {/* — PROFILE (0) */}
        <TabPanel value={tab} index={0}>
          <Paper className="paper-section">
            <Typography variant="h6" mb={2}>
              My Profile
            </Typography>
            {editingProfile ? (
              <>
                <TextField
                  label="Username"
                  fullWidth
                  margin="normal"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                />
                <TextField
                  label="Email"
                  fullWidth
                  margin="normal"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
                <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                  <Button variant="contained" onClick={handleProfileSave}>
                    Save
                  </Button>
                  <Button onClick={() => setEditingProfile(false)}>Cancel</Button>
                </Box>
              </>
            ) : (
              <>
                <Typography>Name: {profileData.username}</Typography>
                <Typography>Email: {profileData.email}</Typography>
                <Button sx={{ mt: 2 }} variant="contained" onClick={() => setEditingProfile(true)}>
                  Edit Profile
                </Button>
              </>
            )}
          </Paper>
        </TabPanel>

        {/* — SECURITY (1) */}
        <TabPanel value={tab} index={1}>
          <Paper className="paper-section">
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Change Password</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  label="Current Password"
                  type={showCurrent ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowCurrent(!showCurrent)}>
                          {showCurrent ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="New Password"
                  type={showNew ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNew(!showNew)}>
                          {showNew ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
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
                <Button variant="contained" sx={{ mt: 2 }} onClick={handlePasswordSave}>
                  Update Password
                </Button>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </TabPanel>

        {/* — OVERVIEW (2) */}
        <TabPanel value={tab} index={2}>
          <Box className="metrics-grid">
            <Paper className="paper-section">
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <MonetizationOnIcon color="success" />
                <Typography variant="h6">Total Revenue</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                ${revenue.toFixed(2)}
              </Typography>
            </Paper>
            <Paper className="paper-section">
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6">Top‑Selling Artworks</Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Sold</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topArtworks.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.artwork.title}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </TabPanel>

        {/* — USERS (3) */}
        <TabPanel value={tab} index={3}>
          <Paper className="paper-section">
            <Typography variant="h6" mb={2}>
              Create New User
            </Typography>
            <TextField
              fullWidth
              margin="dense"
              label="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <Button variant="contained" sx={{ mt: 1 }} onClick={handleCreateUser}>
              Create User
            </Button>
          </Paper>
          <Paper className="paper-section">
            <Typography variant="h6">All Users</Typography>
            {users.map((u, i) => (
              <Box key={i} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                <Typography>
                  {u.username} ({u.email})
                </Typography>
                <IconButton color="error" onClick={() => handleDeleteUser(u._id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Paper>
        </TabPanel>

        {/* — ARTWORKS (4) */}
        <TabPanel value={tab} index={4}>
          <Paper className="paper-section">
            <Typography variant="h6" mb={2}>
              {editingArtworkId ? "Edit Artwork" : "Create New Artwork"}
            </Typography>
            <TextField
              fullWidth
              margin="dense"
              label="Title"
              value={newArtwork.title}
              onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Description"
              value={newArtwork.description}
              onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Price"
              type="number"
              value={newArtwork.price}
              onChange={(e) => setNewArtwork({ ...newArtwork, price: e.target.value })}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setArtworkImage(e.target.files[0])}
              style={{ marginTop: "1rem" }}
            />
            <Button variant="contained" sx={{ mt: 1 }} onClick={handleCreateOrUpdateArtwork}>
              {editingArtworkId ? "Update" : "Create"} Artwork
            </Button>
          </Paper>
          <Paper className="paper-section">
            <Typography variant="h6">All Artworks</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {artworks.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell>{a.title}</TableCell>
                      <TableCell>{a.description}</TableCell>
                      <TableCell>${a.price}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton color="primary" onClick={() => handleEditArtwork(a)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error" onClick={() => handleDeleteArtwork(a._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* — EVENTS (index 5) — */}
        <TabPanel value={tab} index={5}>
          <Paper className="paper-section">
            <Typography variant="h6" mb={2}>
              {editingEvent ? "Edit Event" : "Create New Event"}
            </Typography>

            <TextField
              label="Title"
              fullWidth margin="dense"
              value={eventForm.title}
              onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
            />
            <TextField
              label="Location"
              fullWidth margin="dense"
              value={eventForm.location}
              onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
            />
            <TextField
              label="Date"
              type="date"
              fullWidth margin="dense"
              value={eventForm.date}
              onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Description"
              fullWidth margin="dense" multiline rows={3}
              value={eventForm.description}
              onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
            />
            <input
              type="file"
              accept="image/*"
              onChange={e => setEventImage(e.target.files[0])}
              style={{ marginTop: "1rem" }}
            />
            <Button
              variant="contained" sx={{ mt: 1 }}
              onClick={handleEventSubmit}
            >
              {editingEvent ? "Update Event" : "Create Event"}
            </Button>
          </Paper>

          <Paper className="paper-section">
            <Typography variant="h6" mb={1}>All Events</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map(evt => (
                    <TableRow key={evt._id}>
                      <TableCell>{evt.title}</TableCell>
                      <TableCell>
                        {new Date(evt.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{evt.location}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton color="primary" onClick={() => handleEditEvent(evt)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error" onClick={() => handleDeleteEvent(evt._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* — ORDERS (6) */}
        <TabPanel value={tab} index={6}>
          <Paper className="paper-section">
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <ShoppingCartIcon color="primary" />
              <Typography variant="h6">All Orders</Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            {orders.map((order, i) => (
              <Accordion key={i}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={600}>
                    {order.userId?.username || "Unknown"} — ${order.total}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {order.artworks.map((item, j) => (
                    <Typography key={j} variant="body2">
                      {item.artworkId?.title} — Qty: {item.quantity}
                    </Typography>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </TabPanel>
      </Box>
    </div>
  );
};

export default AdminDashboard;
