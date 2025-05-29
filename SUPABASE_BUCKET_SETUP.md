# Pag-setup ng Supabase Storage Buckets para sa Production

Ang guide na ito ay tutulungan ka na i-setup nang maayos ang Supabase Storage buckets para sa iyong production website, kasama ang tamang permissions at security settings.

## 1. Gumawa ng Storage Buckets

1. **Mag-login sa Supabase dashboard**: https://app.supabase.com
2. **Piliin ang iyong project**
3. **Pumunta sa Storage section** sa left sidebar
4. **Gumawa ng bagong bucket**:
   - I-click ang "New Bucket" button
   - Pangalan: `uploads` (o anumang pangalan na ginagamit mo sa code)
   - Public/Private: Depende sa iyong requirements
     - **Public**: Lahat ng files ay accessible sa public
     - **Private**: Files ay hindi accessible maliban kung may permission

## 2. I-configure ang RLS (Row Level Security) Policies

### Para sa Public Bucket

Kung gusto mo na lahat ng images ay public (recommended para sa blog images):

1. Pumunta sa **Storage** > **Policies**
2. I-click ang bucket mo (e.g., `uploads`)
3. I-add ang mga sumusunod na policies:

#### Policy para sa Pag-view ng Files (Public Read)

```sql
-- Policy name: Allow public read access
-- Definition: 
true

-- Description: Allows anyone to view files
```

#### Policy para sa Pag-upload ng Files (Authenticated Users Only)

```sql
-- Policy name: Allow authenticated uploads
-- Definition: 
(auth.role() = 'authenticated')

-- Description: Only authenticated users can upload files
```

#### Policy para sa Pag-update/Delete ng Files (Admin Only)

```sql
-- Policy name: Admin file management
-- Definition: 
(auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin')

-- Description: Only admin users can update or delete files
```

### Para sa Private Bucket

Kung gusto mo na ang files ay hindi accessible sa public:

```sql
-- Policy name: Private file access
-- Definition: 
(auth.role() = 'authenticated' AND (auth.uid() = owner_id OR auth.jwt() ->> 'role' = 'admin'))

-- Description: Only file owners and admins can access files
```

## 3. I-setup ang File Upload Size Limits

1. Sa Supabase dashboard, pumunta sa **Settings** > **Storage**
2. I-set ang maximum file size na naaangkop sa iyong application
   - Recommended: 5MB para sa regular images
   - Hanggang 10-50MB kung kailangan mo ng high-resolution images

## 4. I-secure ang File Types

Para limitahan ang mga file types na pwedeng i-upload:

1. Sa backend code, i-update ang upload middleware para i-validate ang file extensions:

```javascript
// Sa backend/src/middleware/supabaseUpload.js
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.'), false);
    }
    
    cb(null, true);
  }
});
```

## 5. I-setup ang Folder Structure

Mas mainam na i-organize ang mga files sa loob ng bucket gamit ang folders:

1. Gumawa ng mga folders sa loob ng bucket:
   - `/avatars` - Para sa user profile images
   - `/posts` - Para sa blog post images
   - `/general` - Para sa ibang images

2. I-update ang upload middleware para gamitin ang tamang folder:

```javascript
// Sa backend/src/middleware/supabaseUpload.js
const uploadToSupabase = (folderName) => async (req, res, next) => {
  if (!req.file) return next();
  
  try {
    const timestamp = Date.now();
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${timestamp}${fileExt}`;
    const filePath = `${folderName}/${fileName}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabaseClient
      .storage
      .from('uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600'
      });
      
    if (error) throw error;
    
    // Generate URL
    const { data: urlData } = supabaseClient
      .storage
      .from('uploads')
      .getPublicUrl(filePath);
      
    req.file.url = urlData.publicUrl;
    next();
  } catch (error) {
    next(error);
  }
};
```

## 6. I-setup ang Cache Control

Para sa better performance, i-setup ang proper cache control:

```javascript
// Sa backend/src/middleware/supabaseUpload.js
// Add cache control options when uploading
const { data, error } = await supabaseClient
  .storage
  .from('uploads')
  .upload(filePath, req.file.buffer, {
    contentType: req.file.mimetype,
    cacheControl: '3600' // 1 hour cache
  });
```

## 7. I-handle ang Old Files/Cleanup

Kung kailangan mo ng automatic cleanup para sa old o unused files:

1. Gumawa ng scheduled function para sa cleanup:

```javascript
// Sample cleanup function
async function cleanupOldFiles() {
  const olderThan = new Date();
  olderThan.setDate(olderThan.getDate() - 30); // Files older than 30 days
  
  // Get list of files to delete
  const { data: filesToDelete, error } = await supabaseClient
    .storage
    .from('uploads')
    .list('temp', {
      sortBy: { column: 'created_at', order: 'asc' }
    });
    
  if (error) {
    console.error('Error fetching files:', error);
    return;
  }
  
  // Delete old files
  for (const file of filesToDelete) {
    if (new Date(file.created_at) < olderThan) {
      await supabaseClient
        .storage
        .from('uploads')
        .remove([`temp/${file.name}`]);
    }
  }
}
```

## 8. I-test ang Storage Setup

Bago i-deploy sa production, i-test ang lahat ng file operations:

1. **Upload Test**: I-test ang file upload functionality
2. **Download Test**: I-verify na ang files ay accessible sa frontend
3. **Permission Test**: I-check na ang permissions ay gumagana nang tama
4. **Error Handling**: I-test kung paano ina-handle ang errors (e.g., upload failures)

## 9. Monitoring at Maintenance

1. **I-monitor ang storage usage** sa Supabase dashboard
2. **I-backup regularly** ang importante na files
3. **I-check ang error logs** para sa anumang storage-related issues

## 10. Performance Optimization

1. **Image Resizing**: I-consider ang pag-resize ng images bago i-upload para sa better performance
2. **Thumbnails**: Gumawa ng thumbnails para sa faster loading
3. **Progressive Loading**: I-implement ang progressive image loading sa frontend

Para sa karagdagang tulong, i-refer sa [Supabase Storage Documentation](https://supabase.com/docs/guides/storage) para sa latest best practices at features. 