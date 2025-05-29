const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

// Generate JWT token with stronger security
const generateToken = (user) => {
  return jwt.sign(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
      algorithm: 'HS512', // Use stronger algorithm
    }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: '7d',
      algorithm: 'HS512'
    }
  );
};

// Hash password with stronger salt
const hashPassword = async (password) => {
  // Using higher salt rounds (12) for better security
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Validate password strength
const validatePasswordStrength = (password) => {
  // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  if (!strongPasswordRegex.test(password)) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long and include uppercase, lowercase, number and special character'
    };
  }
  
  return { isValid: true };
};

// Generate secure random string (for token, etc.)
const generateSecureToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

// Function to format response data
const formatResponse = (success, data, message, statusCode = 200) => {
  return {
    success,
    message,
    data,
    statusCode
  };
};

// Function to sanitize user data before sending to client
const sanitizeOutput = (user) => {
  if (!user) return null;

  const sanitized = { ...user };

  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.refresh_token;
  delete sanitized.failed_login_attempts;
  delete sanitized.last_failed_login;

  return sanitized;
};

module.exports = {
  generateToken,
  generateRefreshToken,
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  generateSecureToken,
  sanitizeOutput,
  formatResponse
}; 