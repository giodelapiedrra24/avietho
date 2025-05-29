# Supabase Storage Setup Instructions

Follow these steps to set up Supabase Storage for file uploads in your application:

## 1. Create a Storage Bucket

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Navigate to your project (the one you set up for this application)
3. Click on "Storage" in the left sidebar
4. Click "Create new bucket"
5. Name the bucket `upload` (this must match the bucket name in the code)
6. Select "Public" bucket type for this example (you can use private buckets with more security later)
7. Click "Create bucket"

## 2. Set Up Bucket Permissions

1. Inside your new `upload` bucket, click on the "Policies" tab
2. Click "Add Policies" and create the following policies:

### For Public Read Access:
- Policy name: `Public Read Access`
- Allowed operations: `SELECT`
- Policy definition: `true` (allows anyone to read files)

### For Authenticated User Upload:
- Policy name: `Authenticated Can Upload`
- Allowed operations: `INSERT`
- Policy definition: `auth.role() = 'authenticated'`

### For File Owner Delete:
- Policy name: `Owner Can Delete`
- Allowed operations: `DELETE`
- Policy definition: `auth.uid() = owner` (if you're tracking ownership) or `auth.role() = 'authenticated'` (if any logged-in user can delete)

## 3. Configure Your .env File

Update your `.env` file to include your Supabase URL and API key:

```
# Existing variables...

# Supabase Configuration
SUPABASE_URL=https://hwdysokpfslmotmgusqd.supabase.co
SUPABASE_KEY=your_supabase_anon_key
```

Replace `your_supabase_anon_key` with your actual anon key from the Supabase dashboard.

## 4. Create Upload Directory

The code is configured to upload files to an `uploads` folder inside your bucket.

1. Go to the "Objects" tab in your bucket
2. Click "Create folder"
3. Name it `uploads`
4. Click "Create folder"

## 5. Testing Your Setup

After implementing the code changes:

1. Start your backend server: `npm run dev`
2. Test uploading an image through your API (using Postman or your frontend)
3. Check that the image appears in your Supabase Storage `upload/uploads` folder
4. Verify that the URL in your database is accessible and displays the image correctly

## Troubleshooting

If you encounter issues:

1. **Upload Errors**: Check Supabase Storage bucket permissions and ensure your SUPABASE_KEY has the correct permissions.
2. **Access Errors**: Make sure your bucket is set to public for easy access, or implement proper authentication for private buckets.
3. **URL Issues**: The endpoint for your storage should be in this format: `https://hwdysokpfslmotmgusqd.supabase.co/storage/v1/object/public/upload/[filename]`

## Security Considerations

For production environments:
- Consider using private buckets with proper access control
- Implement file type validation and scanning
- Set file size limits appropriate for your application
- Consider implementing signed URLs for temporary access to files 