const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  deleteUser,
  deactivateUser,
  getAllJobs,
  deleteAnyJob,
  getAllApplications,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/deactivate', deactivateUser);
router.get('/jobs', getAllJobs);
router.delete('/jobs/:id', deleteAnyJob);
router.get('/applications', getAllApplications);

module.exports = router;