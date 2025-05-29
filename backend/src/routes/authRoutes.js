const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/logout', authenticate, authController.logout);

// Admin routes
router.get('/users', authenticate, authorize('admin'), authController.getAllUsers);
router.put('/users/:id/status', authenticate, authorize('admin'), authController.updateUserStatus);
router.put('/users/:id/role', authenticate, authorize('admin'), authController.updateUserRole);

module.exports = router; 