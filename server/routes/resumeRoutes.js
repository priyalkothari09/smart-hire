const express = require('express');
const router = express.Router();
const {
  uploadResume,
  getMyResume,
  scoreAgainstJob,
  scoreApplicantResume,
} = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Candidate routes
router.post('/upload', protect, authorize('candidate'), upload.single('resume'), uploadResume);
router.get('/my', protect, authorize('candidate'), getMyResume);
router.post('/score-job', protect, authorize('candidate'), scoreAgainstJob);

// Employer/admin route — score a specific applicant's resume against a job
router.get('/score/:jobId/:candidateId', protect, authorize('employer', 'admin'), scoreApplicantResume);

module.exports = router;