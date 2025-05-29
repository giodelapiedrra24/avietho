# Gabay sa Pag-deploy ng Sistema sa Production

Ang dokumentong ito ay naglalaman ng mga hakbang para i-deploy ang iyong sistema sa production server, i-setup ang Supabase, at i-connect ito sa iyong custom domain.

## 1. I-deploy ang Backend

### Ihanda ang Backend para sa Deployment

1. **I-update ang `.env` file sa backend:**

```
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_secure_production_secret
JWT_REFRESH_SECRET=your_secure_production_refresh_secret

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Upload Configuration
UPLOAD_PATH=uploads

# CORS Configuration
FRONTEND_URL=https://yourdomain.com
```

2. **Gumawa ng production build:**

```powershell
cd backend
npm install
npm run build    # Kung mayroon kang build script
```

### I-deploy sa Hosting Provider (Mga Options)

#### Option 1: Render.com

1. Gumawa ng account sa [Render](https://render.com/)
2. Pumili ng "Web Service"
3. I-connect ang iyong GitHub repository
4. I-set ang build command: `npm install`
5. I-set ang start command: `npm start`
6. I-add ang environment variables mula sa `.env` file

#### Option 2: DigitalOcean App Platform

1. Gumawa ng account sa [DigitalOcean](https://www.digitalocean.com/)
2. Pumili ng "Apps" at gumawa ng bagong app
3. I-connect ang iyong GitHub repository
4. I-configure ang deployment settings
5. I-set ang environment variables

#### Option 3: Deploy sa Virtual Private Server (VPS)

1. Kumuha ng VPS (DigitalOcean, AWS, GCP, atbp.)
2. I-SSH sa server
3. I-clone ang repository
4. I-install ang dependencies:
   ```bash
   npm install
   ```
5. I-setup ang PM2 para process management:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name "avietho-api"
   pm2 save
   pm2 startup
   ```
6. I-setup ang Nginx bilang reverse proxy:
   ```nginx
   server {
     listen 80;
     server_name api.yourdomain.com;
     
     location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```
7. I-setup ang SSL gamit ang Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

## 2. I-deploy ang Frontend

### Ihanda ang Frontend para sa Deployment

1. **I-update ang `.env` file sa frontend:**

```
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

2. **Gumawa ng production build:**

```powershell
cd frontend
npm install
npm run build
```

### I-deploy sa Hosting Provider (Mga Options)

#### Option 1: Vercel

1. Gumawa ng account sa [Vercel](https://vercel.com/)
2. I-import ang iyong repository
3. I-configure ang build settings:
   - Build Command: `npm run build`
   - Output Directory: `build`
4. I-add ang environment variables
5. I-deploy

#### Option 2: Netlify

1. Gumawa ng account sa [Netlify](https://www.netlify.com/)
2. I-drag-and-drop ang `build` folder o i-connect ang GitHub repository
3. I-configure ang build settings kung nag-connect ng repository
4. I-add ang environment variables

#### Option 3: GitHub Pages

1. I-update ang `package.json` para sa GitHub Pages:
   ```json
   "homepage": "https://yourusername.github.io/your-repo-name",
   ```
2. I-install ang gh-pages package:
   ```
   npm install --save-dev gh-pages
   ```
3. I-add ang deploy scripts sa `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```
4. I-deploy ang app:
   ```
   npm run deploy
   ```

## 3. I-setup ang Custom Domain

### A. Bumili ng Domain

1. Bumili ng domain sa provider gaya ng Namecheap, GoDaddy, o Google Domains
2. I-access ang DNS settings ng domain

### B. I-setup ang DNS Records

#### Para sa Frontend (Halimbawa Vercel):
1. I-add ang mga sumusunod na DNS records:
   - Type: A
   - Name: @
   - Value: IP ng hosting provider
   - TTL: Automatic

   - Type: CNAME
   - Name: www
   - Value: yourdomain.vercel.app
   - TTL: Automatic

#### Para sa Backend (Halimbawa VPS):
1. I-add ang mga sumusunod na DNS records:
   - Type: A
   - Name: api
   - Value: IP ng VPS
   - TTL: Automatic

### C. I-verify ang Domain at Setup SSL

1. Sundin ang mga hakbang ng hosting provider para i-verify ang domain
2. I-enable ang SSL/HTTPS para sa secure connections

## 4. I-configure ang Supabase para sa Production

### A. I-setup ang Supabase Project

1. Pumunta sa [Supabase Dashboard](https://app.supabase.com/)
2. Gumawa ng bagong project para sa production
3. I-copy ang `SUPABASE_URL` at `SUPABASE_ANON_KEY` para sa environment variables

### B. I-setup ang Supabase Database

1. I-import ang database schema:
   - Pumunta sa SQL Editor
   - I-upload at patakbuhin ang migration SQL file

### C. I-setup ang Supabase Storage

1. Gumawa ng storage bucket para sa uploads:
   - Pumunta sa Storage section
   - Gumawa ng "uploads" bucket
   - I-set ang proper permissions

2. I-update ang RLS (Row Level Security) policies:
   - I-configure kung sino ang pwedeng mag-upload, mag-view, atbp.

3. **I-note na wala nang explicit CORS configuration**:
   - Ayon sa latest update (tingnan ang SUPABASE_CORS_LEGACY.md), hindi na kailangan i-configure ang CORS settings sa dashboard
   - Automatic na naglalagay ng CORS headers ang Supabase REST API

## 5. I-migrate ang Data (Kung kailangan)

### A. I-export ang Data mula sa Development

```bash
# Mga file uploads
cd backend/uploads
zip -r uploads.zip *

# Database data (kung hindi Supabase ang development)
# Gamitin ang appropriate tool para sa iyong database
```

### B. I-import ang Data sa Production

```bash
# File uploads
unzip uploads.zip -d /path/to/production/uploads

# O i-upload sa Supabase Storage gamit ang script o UI
```

## 6. I-test ang Production Deployment

1. I-test ang frontend: `https://yourdomain.com`
2. I-test ang backend API: `https://api.yourdomain.com`
3. I-verify ang Supabase connections
4. I-test ang image uploads at retrieval
5. I-check ang lahat ng core features

## 7. Monitoring at Maintenance

### A. I-setup ang Monitoring

1. I-setup ang server monitoring (New Relic, Datadog, atbp.)
2. I-configure ang error tracking (Sentry)
3. I-setup ang performance monitoring

### B. Regular Maintenance

1. I-schedule ang regular backups
2. I-update ang dependencies regularly
3. I-monitor ang server logs
4. I-check ang security vulnerabilities

## 8. Troubleshooting

### Common Issues at Solutions

1. **CORS Errors**:
   - Tingnan ang console errors sa browser
   - I-verify na tama ang FRONTEND_URL sa backend `.env`
   - I-verify na gumagana ang `crossOriginResourcePolicy: false` sa helmet configuration

2. **Image Loading Issues**:
   - I-check ang network tab sa browser dev tools
   - I-verify ang image URLs sa database
   - I-check kung accessible ang mga Supabase Storage URLs

3. **Database Connection Issues**:
   - I-verify ang Supabase credentials
   - I-check ang IP restrictions kung mayroon
   - I-verify ang connection strings

4. **Authentication Issues**:
   - I-clear ang browser cache at cookies
   - I-verify ang JWT settings at keys
   - I-check ang user data sa database

Para sa anumang issues na hindi nalutas sa guide na ito, kontakin ang Supabase support o tumingin sa mga latest documentation. 