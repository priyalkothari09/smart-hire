const express = require('express');
const router = express.Router();
const { matchJob, getCoverLetter, getJobRecommendations } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/match-job', protect, authorize('candidate'), matchJob);
router.post('/cover-letter', protect, authorize('candidate'), getCoverLetter);
router.get('/job-recommendations', protect, authorize('candidate'), getJobRecommendations);

module.exports = router;