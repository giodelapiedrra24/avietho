const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected routes - admin only
router.post('/', authenticate, adminOnly, categoryController.createCategory);
router.put('/:id', authenticate, adminOnly, categoryController.updateCategory);
router.delete('/:id', authenticate, adminOnly, categoryController.deleteCategory);

module.exports = router; 