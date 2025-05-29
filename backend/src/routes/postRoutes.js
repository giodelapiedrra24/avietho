const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticate } = require('../middleware/auth');
const { upload, uploadToSupabase } = require('../middleware/supabaseUpload');

// Public routes
router.get('/', postController.getPosts);
router.get('/:id', postController.getPostById);

// Test route for uploads (no authentication required)
router.post('/test-upload', upload.single('image'), uploadToSupabase('upload'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      message: 'No image uploaded' 
    });
  }
  
  return res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      imageUrl: req.file.url
    }
  });
});

// Protected routes - use Supabase storage
router.post('/', authenticate, upload.single('image'), uploadToSupabase('upload'), postController.createPost);
router.put('/:id', authenticate, upload.single('image'), uploadToSupabase('upload'), postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

module.exports = router; 