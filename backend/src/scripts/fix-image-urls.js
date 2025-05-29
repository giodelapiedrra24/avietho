/**
 * Script to fix image URLs in the database
 * This script corrects the path structure for Supabase image URLs
 */

require('dotenv').config({ path: '../../.env' });
const supabase = require('../config/supabase');

async function fixImageUrls() {
  console.log('Starting to fix image URLs...');
  
  try {
    // Get all posts with image_url
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, image_url')
      .not('image_url', 'is', null);
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${posts.length} posts with images to check`);
    
    let updatedCount = 0;
    
    // Process each post
    for (const post of posts) {
      if (post.image_url && post.image_url.includes('supabase.co')) {
        // Check if URL contains redundant 'uploads/' folder
        if (post.image_url.includes('/upload/uploads/')) {
          // Fix the URL by removing the redundant 'uploads/' folder
          const newUrl = post.image_url.replace('/upload/uploads/', '/upload/');
          
          // Update the post with corrected URL
          const { error: updateError } = await supabase
            .from('posts')
            .update({ image_url: newUrl })
            .eq('id', post.id);
          
          if (updateError) {
            console.error(`Error updating post ${post.id}:`, updateError);
          } else {
            console.log(`Updated post ${post.id}:`);
            console.log(`  Old URL: ${post.image_url}`);
            console.log(`  New URL: ${newUrl}`);
            updatedCount++;
          }
        }
      }
    }
    
    console.log(`Fixed ${updatedCount} image URLs`);
    console.log('URL correction completed successfully.');
  } catch (err) {
    console.error('Error fixing image URLs:', err);
  }
}

// Run the function
fixImageUrls(); 