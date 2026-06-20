const express = require('express');
const router = express.Router();
const {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  getCandidateStats,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('candidate'), applyToJob);
router.get('/my', protect, authorize('candidate'), getMyApplications);
router.get('/candidate/stats', protect, authorize('candidate'), getCandidateStats);
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getJobApplicants);
router.put('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);

module.exports = router;