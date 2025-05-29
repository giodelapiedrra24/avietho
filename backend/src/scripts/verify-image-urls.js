/**
 * Script to verify image URLs in the database and check if they exist in Supabase storage
 */

require('dotenv').config({ path: '../../.env' });
const supabase = require('../config/supabase');
const fetch = require('node-fetch');

/**
 * Function to check if a URL exists by sending a HEAD request
 */
async function urlExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return {
      exists: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    console.error(`Error checking URL ${url}:`, error.message);
    return {
      exists: false,
      status: 0,
      statusText: error.message
    };
  }
}

/**
 * Function to list all files in a Supabase bucket
 */
async function listBucketFiles(bucketName) {
  try {
    const { data, error } = await supabase.storage.from(bucketName).list();
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error('Error listing bucket files:', err);
    return [];
  }
}

/**
 * Function to list all files in a folder within a bucket
 */
async function listFolderFiles(bucketName, folderName) {
  try {
    const { data, error } = await supabase.storage.from(bucketName).list(folderName);
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error(`Error listing files in folder ${folderName}:`, err);
    return [];
  }
}

async function verifyImageUrls() {
  console.log('Starting image URL verification...');
  
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
    
    // First, list all files in the bucket to see what we're working with
    console.log('Listing files in "upload" bucket...');
    const rootFiles = await listBucketFiles('upload');
    console.log(`Found ${rootFiles.length} files in root of bucket`);
    
    // Print the actual files in the root
    if (rootFiles.length > 0) {
      console.log('Files in root:');
      rootFiles.forEach(file => {
        console.log(`- ${file.name} (${file.id})`);
      });
    }
    
    // Check if there's an 'uploads' folder
    const hasUploadsFolder = rootFiles.some(file => 
      file.name === 'uploads' && 
      file.metadata && 
      file.metadata.mimetype === 'application/octet-stream'
    );
    
    // Check for uploads folder based on name only if mimetype check didn't find it
    const uploadsFolder = rootFiles.find(file => file.name === 'uploads');
    
    if (hasUploadsFolder || uploadsFolder) {
      console.log('Found "uploads" folder in bucket, checking its contents...');
      const uploadsFiles = await listFolderFiles('upload', 'uploads');
      console.log(`Found ${uploadsFiles.length} files in "uploads" folder`);
      
      // Display some files for reference
      if (uploadsFiles.length > 0) {
        console.log('Sample files in "uploads" folder:');
        uploadsFiles.slice(0, 5).forEach(file => {
          console.log(`- ${file.name}`);
        });
      }
    }
    
    // Check all image URLs
    console.log('\nVerifying each image URL...');
    
    for (const post of posts) {
      if (!post.image_url) continue;
      
      console.log(`\nChecking post ${post.id}:`);
      console.log(`Original URL: ${post.image_url}`);
      
      // Check if the URL exists
      const originalUrlCheck = await urlExists(post.image_url);
      console.log(`Status: ${originalUrlCheck.exists ? 'EXISTS' : 'MISSING'} (HTTP ${originalUrlCheck.status} ${originalUrlCheck.statusText})`);
      
      // Try alternative URL formats if original doesn't exist
      if (!originalUrlCheck.exists) {
        // Case 1: If URL doesn't have 'uploads' but should
        if (!post.image_url.includes('/upload/uploads/')) {
          const fileName = post.image_url.split('/upload/')[1];
          const alternativeUrl1 = post.image_url.replace(`/upload/${fileName}`, `/upload/uploads/${fileName}`);
          
          console.log(`Trying alternative URL (with uploads folder): ${alternativeUrl1}`);
          const alternativeCheck1 = await urlExists(alternativeUrl1);
          console.log(`Status: ${alternativeCheck1.exists ? 'EXISTS' : 'MISSING'} (HTTP ${alternativeCheck1.status} ${alternativeCheck1.statusText})`);
          
          if (alternativeCheck1.exists) {
            console.log('Found correct URL! Updating database...');
            const { error: updateError } = await supabase
              .from('posts')
              .update({ image_url: alternativeUrl1 })
              .eq('id', post.id);
            
            if (updateError) {
              console.error(`Error updating post ${post.id}:`, updateError);
            } else {
              console.log(`Updated post ${post.id} with correct URL`);
            }
          }
        }
        
        // Case 2: If URL has 'uploads' but shouldn't
        else if (post.image_url.includes('/upload/uploads/')) {
          const alternativeUrl2 = post.image_url.replace('/upload/uploads/', '/upload/');
          
          console.log(`Trying alternative URL (without uploads folder): ${alternativeUrl2}`);
          const alternativeCheck2 = await urlExists(alternativeUrl2);
          console.log(`Status: ${alternativeCheck2.exists ? 'EXISTS' : 'MISSING'} (HTTP ${alternativeCheck2.status} ${alternativeCheck2.statusText})`);
          
          if (alternativeCheck2.exists) {
            console.log('Found correct URL! Updating database...');
            const { error: updateError } = await supabase
              .from('posts')
              .update({ image_url: alternativeUrl2 })
              .eq('id', post.id);
            
            if (updateError) {
              console.error(`Error updating post ${post.id}:`, updateError);
            } else {
              console.log(`Updated post ${post.id} with correct URL`);
            }
          }
        }
        
        // Case 3: Try without file extension
        const urlWithoutExtension = post.image_url.replace(/\.[^/.]+$/, '');
        console.log(`Trying URL without extension: ${urlWithoutExtension}`);
        const extensionCheck = await urlExists(urlWithoutExtension);
        console.log(`Status: ${extensionCheck.exists ? 'EXISTS' : 'MISSING'} (HTTP ${extensionCheck.status} ${extensionCheck.statusText})`);
        
        if (extensionCheck.exists) {
          console.log('Found correct URL! Updating database...');
          const { error: updateError } = await supabase
            .from('posts')
            .update({ image_url: urlWithoutExtension })
            .eq('id', post.id);
          
          if (updateError) {
            console.error(`Error updating post ${post.id}:`, updateError);
          } else {
            console.log(`Updated post ${post.id} with correct URL`);
          }
        }
      }
    }
    
    console.log('\nURL verification completed.');
    
  } catch (err) {
    console.error('Error verifying image URLs:', err);
  }
}

// Run the function
verifyImageUrls(); 