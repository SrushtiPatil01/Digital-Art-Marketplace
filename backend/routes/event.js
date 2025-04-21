const express = require('express');
const router = express.Router();
const upload = require('../upload');

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

// Create new event (with optional image upload)
router.post('/', upload.single('image'), createEvent);

// Get all events
router.get('/', getAllEvents);

// Get one event by ID
router.get('/:id', getEventById);

// Update an event by ID (you can also allow image upload here if desired)
router.put('/:id', upload.single('image'), updateEvent);

// Delete an event by ID
router.delete('/:id', deleteEvent);

module.exports = router;
