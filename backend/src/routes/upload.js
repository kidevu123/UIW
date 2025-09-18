const express = require('express');
const router = express.Router();

// Placeholder routes for file upload feature
router.post('/image', async (req, res) => {
  res.json({ success: true, message: 'Image upload coming soon' });
});

router.post('/audio', async (req, res) => {
  res.json({ success: true, message: 'Audio upload coming soon' });
});

module.exports = router;