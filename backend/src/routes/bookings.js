const express = require('express');
const router = express.Router();

// Placeholder routes for bookings feature
router.get('/', async (req, res) => {
  res.json({ success: true, bookings: [], message: 'Bookings feature coming soon' });
});

router.post('/', async (req, res) => {
  res.json({ success: true, message: 'Booking creation coming soon' });
});

module.exports = router;