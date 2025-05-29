# Production Deployment Checklist

Use this checklist to ensure your application is ready for production deployment with Supabase integration.

## Backend Preparation

- [ ] Update environment variables for production
  - [ ] Set `NODE_ENV=production`
  - [ ] Configure secure JWT secrets
  - [ ] Set correct Supabase URL and API key
  - [ ] Update FRONTEND_URL to production domain

- [ ] Verify CORS configuration
  - [ ] Ensure production domain is allowed in cors options
  - [ ] Keep `crossOriginResourcePolicy: false` in Helmet config

- [ ] Test file uploads
  - [ ] Confirm correct path structure in uploaded files
  - [ ] Verify no redundant path segments (e.g., no `uploads/uploads`)

- [ ] Database verification
  - [ ] Run `npm run verify-images` to check existing image URLs
  - [ ] Fix any incorrect URLs with `npm run fix-images` if needed

## Frontend Preparation

- [ ] Update API endpoint to production backend
  - [ ] Configure `REACT_APP_API_URL` in .env file
  - [ ] Verify all API calls use the environment variable

- [ ] Build and test production bundle
  - [ ] Run `npm run build`
  - [ ] Test production build locally if possible

- [ ] Image component checks
  - [ ] Confirm all components use direct `<img>` tags (not custom components)
  - [ ] Verify error handling for failed image loads

## Supabase Configuration

- [ ] Update Storage bucket permissions
  - [ ] Verify policies allow necessary operations
  - [ ] Check public/authenticated access settings

- [ ] Configure CORS settings
  - [ ] Add production frontend domain to allowed origins
  - [ ] Use settings from SUPABASE_CORS_CONFIG.json as reference

- [ ] Test Supabase direct access
  - [ ] Verify direct image URL access from production domain
  - [ ] Test authenticated operations if using RLS

## Deployment Process

- [ ] Deploy backend first
  - [ ] Verify backend API endpoints are accessible
  - [ ] Check logs for any startup errors

- [ ] Deploy frontend
  - [ ] Verify connection to backend API
  - [ ] Test all key functionality

- [ ] Post-deployment verification
  - [ ] Test image uploads on production
  - [ ] Verify existing images load correctly
  - [ ] Check console for any CORS or resource errors

## Security Considerations

- [ ] Implement rate limiting
  - [ ] Protect authentication endpoints
  - [ ] Limit file upload requests

- [ ] Enable proper logging
  - [ ] Log API errors without sensitive information
  - [ ] Set up monitoring for critical endpoints

- [ ] Review Supabase security settings
  - [ ] Verify RLS policies are correctly configured
  - [ ] Ensure API keys have appropriate permissions

## Performance Optimization

- [ ] Enable compression for API responses
- [ ] Configure appropriate cache headers for static assets
- [ ] Consider using a CDN for faster image delivery

## Monitoring Setup

- [ ] Set up uptime monitoring
- [ ] Configure error notification system
- [ ] Establish regular database backup process 