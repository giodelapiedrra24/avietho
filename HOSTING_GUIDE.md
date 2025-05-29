# Deploying Your Application with Supabase

This guide will walk you through deploying your application to a hosting provider while ensuring the Supabase integration continues to work properly.

## 1. Update Environment Variables

Before deploying, make sure to update your environment variables for production:

### Backend (.env)

```
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_token_secret_change_in_production

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Upload Configuration
UPLOAD_PATH=uploads

# CORS Configuration
FRONTEND_URL=https://your-production-domain.com
```

### Frontend (.env)

```
REACT_APP_API_URL=https://your-backend-api-domain.com
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Update CORS Configuration on Supabase

1. Log in to your Supabase project dashboard
2. Go to Storage > Policies
3. Add your production domain to the allowed origins:
   - Go to Settings > API
   - Scroll down to "CORS" section
   - Add your frontend domain (e.g., `https://your-production-domain.com`)

## 3. Deploy the Frontend

You can deploy the frontend to services like Vercel, Netlify, or any other hosting provider:

### Build the frontend

```bash
cd frontend
npm run build
```

This creates a `build` folder with optimized production files. Upload these files to your hosting provider.

### Hosting-specific Settings

For Vercel or Netlify:
- Connect your GitHub repository
- Set the build command to `npm run build`
- Set the publish directory to `build`
- Add your environment variables in the hosting provider's dashboard

## 4. Deploy the Backend

You can deploy the backend to services like Heroku, DigitalOcean, or any other Node.js hosting provider:

### Prepare your backend for deployment

1. Ensure your `package.json` has a proper start script:
   ```json
   "scripts": {
     "start": "node src/server.js"
   }
   ```

2. Create a `Procfile` (for Heroku) if needed:
   ```
   web: node src/server.js
   ```

### Deploy to your hosting provider

Follow your hosting provider's specific instructions for deploying Node.js applications.

## 5. Testing Your Deployment

After deploying both frontend and backend:

1. Visit your deployed frontend application
2. Test the image upload functionality using the `/upload-test` page
3. Verify that existing images are loading properly
4. Check the browser console for any CORS-related errors

## Common Issues and Solutions

### CORS Errors

If you're seeing CORS errors after deployment:

1. Verify that your backend's CORS configuration includes your production domain:
   ```javascript
   // backend/src/app.js
   const corsOptions = {
     origin: process.env.NODE_ENV === 'production' 
       ? process.env.FRONTEND_URL 
       : ['http://localhost:3000', '*'],
     // other options...
   };
   ```

2. Check that your Supabase Storage CORS settings include your production domain

### Image Loading Issues

If images aren't loading in production:

1. Verify the URLs in your database are correct and don't have redundant path segments
2. Ensure your Helmet configuration is still set with `crossOriginResourcePolicy: false`
3. Check that the Supabase storage bucket permissions are set correctly

## Important Security Considerations

For production deployment:

1. Use strong, unique secrets for JWT tokens
2. Set up proper storage bucket permissions in Supabase
3. Consider implementing rate limiting for your API endpoints
4. Ensure your environment variables are properly secured in your hosting provider

## Monitoring

After deployment, monitor your application for:

1. API errors in the backend logs
2. Image loading issues in the frontend console
3. Performance metrics from your hosting provider
4. Supabase usage metrics in your Supabase dashboard 