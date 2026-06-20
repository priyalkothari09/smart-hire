// utils/generateToken.js
// Generates a signed JWT token for authenticated users

const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token
 * @param {string} id - MongoDB user _id
 * @returns {string} Signed JWT token (expires in 7 days)
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },                          // Payload — what we store in the token
    process.env.JWT_SECRET,          // Secret key from .env
    { expiresIn: '7d' }              // Token valid for 7 days
  );
};

module.exports = generateToken;