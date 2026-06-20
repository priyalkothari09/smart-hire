const express = require('express');
const router = express.Router();
const {
  getJobs,
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  getEmployerStats,
  syncPinecone,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/',        getJobs);
router.post('/',       protect, authorize('employer', 'admin'), createJob);
router.get('/my',      protect, authorize('employer', 'admin'), getMyJobs);
router.get('/stats',   protect, authorize('employer', 'admin'), getEmployerStats);
router.post('/sync-pinecone', protect, authorize('admin'), syncPinecone);
router.get('/:id',     getJobById);
router.put('/:id',     protect, authorize('employer', 'admin'), updateJob);
router.delete('/:id',  protect, authorize('employer', 'admin'), deleteJob);

module.exports = router;