// routes/authRoutes.js
// Defines all authentication-related API endpoints

const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────
// PUBLIC ROUTES — No token needed
// ─────────────────────────────────────────────

// POST /api/auth/register — Create new account
router.post('/register', registerUser);

// POST /api/auth/login — Login and get token
router.post('/login', loginUser);

// ─────────────────────────────────────────────
// PRIVATE ROUTES — Token required (protect middleware)
// ─────────────────────────────────────────────

// GET /api/auth/me — Get my own profile
router.get('/me', protect, getMe);

// PUT /api/auth/profile — Update my profile
router.put('/profile', protect, updateProfile);

module.exports = router;