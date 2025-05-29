# Supabase Storage Setup Guide

This document outlines the steps needed to properly set up Supabase Storage for your application.

## 1. Create a Storage Bucket

1. Log in to your Supabase dashboard
2. Navigate to "Storage" in the sidebar
3. Click "Create a new bucket"
4. Name your bucket "upload" (or your preferred name)
5. Choose the appropriate access level:
   - **Private** - For authenticated users only
   - **Public** - For publicly accessible files
   - For this application, "Public" is recommended for image uploads

## 2. Configure CORS Policies

CORS (Cross-Origin Resource Sharing) issues are common when accessing files from different domains. To fix this:

1. In the Supabase dashboard, go to "Storage" → "Policies"
2. Click on the "CORS" tab
3. Add the following CORS configuration:

```json
[
  {
    "origin": "*",
    "methods": ["GET", "HEAD"],
    "headers": ["Range", "Content-Type", "Accept", "Content-Length", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
```

For better security in production, replace `"*"` with your specific frontend domain.

## 3. Set Up Storage Permissions

For each bucket, set up RLS (Row Level Security) policies:

1. Go to "Storage" → "Policies"
2. For your "upload" bucket, add these policies:

### For Public Read Access
- **Name**: "Public Read Access"
- **Allowed Operations**: SELECT
- **Policy Definition**:
```sql
true
```

### For Authenticated User Uploads
- **Name**: "Authenticated Users Can Upload"
- **Allowed Operations**: INSERT
- **Policy Definition**:
```sql
auth.role() = 'authenticated'
```

### For Owner Delete
- **Name**: "Owners Can Delete"
- **Allowed Operations**: DELETE
- **Policy Definition**:
```sql
auth.uid() = owner
```

## 4. Fixing Image Loading Issues

### Common Problems

1. **CORS Issues**: If images don't load due to CORS errors
2. **Improper URL Construction**: Mixing local and Supabase URLs
3. **crossorigin attribute problems**: Can cause issues with Supabase-hosted images
4. **Redundant path segments**: URLs with `/upload/uploads/` pattern cause issues (FIXED)

### Solutions

1. **Remove crossorigin attribute** for Supabase images:
   ```jsx
   // Don't use this with Supabase images
   <img src={supabaseUrl} crossorigin="anonymous" />
   
   // Instead use this
   <img src={supabaseUrl} />
   ```

2. **Configure Express properly**:
   If using Express.js, ensure the CORS middleware is configured correctly:
   ```js
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }));
   ```

3. **Use the ImageComponent** from this project:
   This component handles both local and Supabase images correctly.

4. **Correct path structure**: 
   - Correct: `https://[PROJECT_ID].supabase.co/storage/v1/object/public/upload/image.jpg`
   - Incorrect: `https://[PROJECT_ID].supabase.co/storage/v1/object/public/upload/uploads/image.jpg`

## 5. Debugging Image Loading

When images aren't loading:

1. Open browser developer tools (F12)
2. Check the Network tab for failed image requests
3. Look for CORS errors in the Console tab
4. Verify the image URL is correct and accessible
5. Use the ImageDebug component to troubleshoot specific images

## 6. Image URL Formats

Understanding the difference between URL formats:

- **Local images**: `http://localhost:5000/uploads/image.jpg`
- **Supabase images**: `https://[PROJECT_ID].supabase.co/storage/v1/object/public/upload/image.jpg`

The ImageComponent in this project handles both formats automatically.

## 7. Recent Fixes (May 2025)

We've addressed and fixed the following issues:

1. **Redundant path segments in URLs**: Fixed URLs that had `/upload/uploads/` pattern
2. **Updated the upload middleware**: Now creates correct paths without redundant folders
3. **Fixed Express helmet settings**: Properly configured crossOriginResourcePolicy
4. **Removed crossorigin attribute**: Eliminated this attribute which was causing issues
5. **Added ImageDebug component**: For diagnosing image loading problems

If you encounter issues with existing images, run the fix script:
```
cd backend
npm run fix-images
``` 