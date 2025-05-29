# CORS Configuration Guide for Supabase

CORS (Cross-Origin Resource Sharing) settings are critical for your application to properly load images and resources from Supabase storage. This guide will help you correctly configure CORS for your application.

## 1. Where to Find CORS Settings in Supabase

1. Log in to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Settings** in the left sidebar
4. Click on **API** in the settings submenu
5. Scroll down to the **CORS** section

You'll see an interface where you can add allowed origins.

## 2. How to Configure CORS in Supabase

### Add Your Production Domain

1. In the **Origins** field, add your production domain (e.g., `https://your-production-domain.com`)
2. Make sure to include the protocol (`https://`)
3. Do not include paths, just the domain with protocol
4. Click **Save** to apply the changes

### Example CORS Configuration

Here's what your CORS configuration should include:

```
Allowed Origins:
- http://localhost:3000 (for local development)
- https://your-production-domain.com (your actual production domain)
```

## 3. CORS Settings in Your Backend Code

Your backend already has CORS configured in `src/app.js`:

```javascript
// CORS setup
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', '*'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));
```

Make sure your `.env` file has `FRONTEND_URL` set to your production domain:

```
FRONTEND_URL=https://your-production-domain.com
```

## 4. Testing CORS Configuration

After deploying, you can test if your CORS configuration is working:

1. Open your browser's developer tools (F12)
2. Go to the Network tab
3. Load your application and look for requests to Supabase storage
4. Check if these requests succeed (Status 200) or fail with CORS errors

## 5. Common CORS Errors and Solutions

### Error: "No 'Access-Control-Allow-Origin' header is present"

**Solution:**
- Verify your domain is correctly added in Supabase CORS settings
- Ensure there are no typos in the domain
- Check that you included the protocol (http:// or https://)

### Error: "Method not allowed"

**Solution:**
- Make sure the allowed methods in Supabase include the ones your app needs (GET, POST, etc.)

### Error: "Request header field Content-Type is not allowed"

**Solution:**
- Add the necessary headers to the allowed headers list in Supabase CORS settings

## 6. Additional Supabase Storage Permissions

Besides CORS, make sure your bucket permissions allow the operations you need:

1. Go to **Storage** in the Supabase dashboard
2. Select your bucket
3. Click on **Policies**
4. Ensure policies allow reading files publicly if needed

## 7. Complete Configuration Example

Here's a complete example of what your Supabase CORS configuration should look like:

```json
{
  "AllowedOrigins": [
    "http://localhost:3000",
    "https://your-production-domain.com"
  ],
  "AllowedMethods": [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "OPTIONS"
  ],
  "AllowedHeaders": [
    "Authorization",
    "Content-Type",
    "x-client-info",
    "apikey",
    "Content-Range",
    "Range"
  ],
  "MaxAgeSeconds": 3600,
  "ExposeHeaders": [
    "Content-Range",
    "Range"
  ]
}
```

Remember to replace `https://your-production-domain.com` with your actual production domain. 