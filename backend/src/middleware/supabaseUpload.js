const multer = require('multer');
const path = require('path');
const supabase = require('../config/supabase');
const crypto = require('crypto');
require('dotenv').config();

// Temporary storage for multer
const storage = multer.memoryStorage();

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const filetypes = /jpeg|jpg|png|gif/;
  
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images only (jpeg, jpg, png, gif)!'));
  }
};

// Initialize multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter
});

// Middleware to handle Supabase upload
const uploadToSupabase = (bucketName) => {
  return async (req, res, next) => {
    // Skip if no file
    if (!req.file) {
      return next();
    }

    try {
      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      const randomName = crypto.randomBytes(16).toString('hex');
      const fileName = `${Date.now()}-${randomName}${fileExtension}`;
      
      // Upload to Supabase Storage - remove redundant 'uploads/' folder
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600'
        });
      
      if (error) {
        console.error('Supabase storage upload error:', error);
        return res.status(500).json({
          success: false,
          message: 'Error uploading file to storage',
          error: error.message
        });
      }
      
      // Get public URL - remove redundant 'uploads/' folder
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      // Add file info to request
      req.file.path = urlData.publicUrl;
      req.file.filename = fileName;
      req.file.url = urlData.publicUrl;
      
      next();
    } catch (err) {
      console.error('File upload error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error processing file upload',
        error: err.message
      });
    }
  };
};

module.exports = {
  upload,
  uploadToSupabase
}; 