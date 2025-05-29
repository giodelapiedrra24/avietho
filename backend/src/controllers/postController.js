const supabase = require('../config/supabase');
const { formatResponse } = require('../utils/helpers');
const fs = require('fs');
const path = require('path');

// Get all posts with pagination
exports.getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const categoryId = req.query.category;
  const searchTerm = req.query.search;
  
  const startIndex = (page - 1) * limit;

  try {
    // Base query builder
    let queryBuilder = supabase
      .from('posts')
      .select(`
        *,
        categories:category_id (id, name),
        users:user_id (id, name)
      `);

    // Filter by category if provided
    if (categoryId) {
      queryBuilder = queryBuilder.eq('category_id', categoryId);
    }

    // Search in title or content if search term provided
    if (searchTerm) {
      queryBuilder = queryBuilder.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
    }

    // First, get all posts to calculate total count (for pagination)
    const { data: allPosts, error: countError } = await queryBuilder;
    
    if (countError) {
      return res.status(500).json(
        formatResponse(false, null, 'Error counting posts', 500)
      );
    }
    
    const totalCount = allPosts ? allPosts.length : 0;

    // Execute the paginated query
    const { data: posts, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(startIndex, startIndex + limit - 1);

    if (error) {
      return res.status(500).json(
        formatResponse(false, null, 'Error fetching posts', 500)
      );
    }

    const totalPages = Math.ceil(totalCount / limit);

    res.json(
      formatResponse(true, {
        posts,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages
        }
      }, 'Posts fetched successfully')
    );
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json(
      formatResponse(false, null, 'Server error fetching posts', 500)
    );
  }
};

// Get single post by ID
exports.getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        categories:category_id (id, name),
        users:user_id (id, name)
      `)
      .eq('id', id)
      .single();

    if (error || !post) {
      return res.status(404).json(
        formatResponse(false, null, 'Post not found', 404)
      );
    }

    res.json(formatResponse(true, { post }, 'Post fetched successfully'));
  } catch (err) {
    console.error('Get post error:', err);
    res.status(500).json(
      formatResponse(false, null, 'Server error fetching post', 500)
    );
  }
};

// Create new post
exports.createPost = async (req, res) => {
  const { title, content, category_id, image_url: directImageUrl } = req.body;
  const user_id = req.user.id;

  console.log('Creating post with data:', {
    title: title ? 'Provided' : 'Missing',
    content: content ? 'Provided' : 'Missing',
    category_id,
    user_id,
    directImageUrl: directImageUrl ? 'Provided' : 'Missing',
    fileUploaded: req.file ? 'Yes' : 'No'
  });

  if (!title || !content) {
    return res.status(400).json(
      formatResponse(false, null, 'Please provide title and content', 400)
    );
  }

  // Handle missing category_id
  const finalCategoryId = category_id || null;
  
  try {
    // Verify category exists if provided
    if (finalCategoryId) {
      console.log('Checking if category exists:', finalCategoryId);
      const { data: categoryCheck, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('id', finalCategoryId)
        .single();
        
      if (categoryError || !categoryCheck) {
        console.error('Category check error:', categoryError);
        return res.status(400).json(
          formatResponse(false, null, 'Selected category does not exist', 400)
        );
      }
    }

    // Handle image from either file upload or direct URL
    let image_url = null;
    if (req.file && req.file.url) {
      console.log('Using uploaded file URL:', req.file.url);
      image_url = req.file.url;
    } else if (directImageUrl) {
      console.log('Using direct image URL:', directImageUrl);
      image_url = directImageUrl;
    }

    // Create new post
    console.log('Inserting post into database');
    const postData = {
      title,
      content,
      user_id,
      image_url
    };
    
    // Only add category_id if it exists
    if (finalCategoryId) {
      postData.category_id = finalCategoryId;
    }
    
    try {
      console.log('Creating post with data:', postData);
      
      const { data: newPost, error } = await supabase
        .from('posts')
        .insert([postData])
        .select(`
          *,
          categories:category_id (id, name),
          users:user_id (id, name)
        `);

      if (error) {
        console.error('Error creating post in Supabase:', error);
        
        // Check for foreign key error
        if (error.message && (error.message.includes('foreign key') || error.message.includes('violates foreign key'))) {
          // Try again without category_id if that's the issue
          if (finalCategoryId) {
            console.log('Trying to create post without category_id');
            delete postData.category_id;
            
            const { data: retryPost, error: retryError } = await supabase
              .from('posts')
              .insert([postData])
              .select(`
                *,
                users:user_id (id, name)
              `);
              
            if (retryError) {
              console.error('Error in retry attempt:', retryError);
              return res.status(500).json(
                formatResponse(false, null, `Error creating post: ${retryError.message}`, 500)
              );
            }
            
            console.log('Post created successfully on retry:', retryPost[0].id);
            return res.status(201).json(
              formatResponse(true, { post: retryPost[0] }, 'Post created successfully (without category)', 201)
            );
          }
          
          return res.status(400).json(
            formatResponse(false, null, 'Invalid category or user ID', 400)
          );
        }
        
        return res.status(500).json(
          formatResponse(false, null, `Error creating post: ${error.message}`, 500)
        );
      }

      console.log('Post created successfully:', newPost[0].id);
      return res.status(201).json(
        formatResponse(true, { post: newPost[0] }, 'Post created successfully', 201)
      );
    } catch (err) {
      console.error('Create post error - detailed:', err);
      if (err.message) console.error('Error message:', err.message);
      if (err.stack) console.error('Error stack:', err.stack);
      
      return res.status(500).json(
        formatResponse(false, null, `Server error creating post: ${err.message}`, 500)
      );
    }
  } catch (err) {
    console.error('Create post error - detailed:', err);
    if (err.message) console.error('Error message:', err.message);
    if (err.stack) console.error('Error stack:', err.stack);
    
    res.status(500).json(
      formatResponse(false, null, `Server error creating post: ${err.message}`, 500)
    );
  }
};

// Update post
exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, category_id, image_url: directImageUrl } = req.body;
  
  if (!title && !content && !category_id && !req.file && !directImageUrl) {
    return res.status(400).json(
      formatResponse(false, null, 'Please provide at least one field to update', 400)
    );
  }

  try {
    // Check if post exists and user is the owner
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return res.status(404).json(
        formatResponse(false, null, 'Post not found', 404)
      );
    }

    // Check if user is the owner or an admin
    if (existingPost.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json(
        formatResponse(false, null, 'Not authorized to update this post', 403)
      );
    }

    // Update data
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category_id) updateData.category_id = category_id;

    // Handle image from either file upload or direct URL
    let shouldDeleteExistingImage = false;
    
    if (req.file && req.file.url) {
      updateData.image_url = req.file.url;
      shouldDeleteExistingImage = true;
    } else if (directImageUrl) {
      // Only update if different from existing image
      if (existingPost.image_url !== directImageUrl) {
        updateData.image_url = directImageUrl;
        shouldDeleteExistingImage = true;
      }
    }
    
    // Delete old image if needed and a new one is provided
    if (shouldDeleteExistingImage && existingPost.image_url && existingPost.image_url.includes('supabase')) {
      try {
        // Extract file path from the URL
        const urlParts = existingPost.image_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `uploads/${fileName}`;

        // Delete the file from Supabase storage
        const { error: deleteError } = await supabase.storage
          .from('upload')
          .remove([filePath]);
          
        if (deleteError) {
          console.error('Failed to delete old image from Supabase:', deleteError);
        }
      } catch (deleteErr) {
        console.error('Error deleting old image:', deleteErr);
      }
    }

    // Update post in database
    const { data: updatedPost, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        categories:category_id (id, name),
        users:user_id (id, name)
      `)
      .single();

    if (error) {
      return res.status(500).json(
        formatResponse(false, null, 'Error updating post', 500)
      );
    }

    res.json(
      formatResponse(true, { post: updatedPost }, 'Post updated successfully')
    );
  } catch (err) {
    console.error('Update post error:', err);
    
    res.status(500).json(
      formatResponse(false, null, 'Server error updating post', 500)
    );
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if post exists and user is the owner
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return res.status(404).json(
        formatResponse(false, null, 'Post not found', 404)
      );
    }

    // Check if user is the owner or an admin
    if (existingPost.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json(
        formatResponse(false, null, 'Not authorized to delete this post', 403)
      );
    }

    // Delete image from Supabase if exists
    if (existingPost.image_url && existingPost.image_url.includes('supabase')) {
      try {
        // Extract file path from the URL
        const urlParts = existingPost.image_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `uploads/${fileName}`;

        console.log('Attempting to delete file from Supabase:', filePath);
        
        // Delete the file from Supabase storage
        const { error: deleteError } = await supabase.storage
          .from('upload')
          .remove([filePath]);
          
        if (deleteError) {
          console.error('Failed to delete image from Supabase:', deleteError);
        } else {
          console.log('Successfully deleted image from Supabase');
        }
      } catch (deleteErr) {
        console.error('Error deleting image from Supabase:', deleteErr);
      }
    } 
    // Handle legacy local file storage
    else if (existingPost.image_url) {
      try {
        const imagePath = path.join(process.cwd(), existingPost.image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('Deleted local file:', imagePath);
        }
      } catch (fsErr) {
        console.error('Error deleting local file:', fsErr);
      }
    }

    // Delete the post
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json(
        formatResponse(false, null, 'Error deleting post', 500)
      );
    }

    res.json(
      formatResponse(true, null, 'Post deleted successfully')
    );
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json(
      formatResponse(false, null, 'Server error deleting post', 500)
    );
  }
}; 