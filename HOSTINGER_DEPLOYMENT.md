# Pag-deploy ng Application sa Hostinger Shared Hosting

Oo, pwede mong i-upload at i-host ang iyong application sa Hostinger shared hosting. Narito ang step-by-step na gabay kung paano ito gawin.

## 1. Preparation para sa Deployment

### A. I-prepare ang Frontend Files

1. **Gumawa ng production build ng frontend**:
   ```powershell
   cd frontend
   npm install
   npm run build
   ```
   
   Ito ay gagawa ng `build` folder na naglalaman ng static files (HTML, CSS, JS) na pwede mong i-upload sa Hostinger.

### B. I-prepare ang Backend Files

1. **Gumawa ng production build ng backend** (kung may build script):
   ```powershell
   cd backend
   npm install
   npm run build  # Kung mayroon
   ```

2. **I-update ang environment variables para sa production**:
   - I-edit ang `.env` file para gamitin ang production settings

## 2. Pag-setup ng Hostinger Account

1. **Mag-sign up o mag-login** sa iyong Hostinger account
2. **Bumili ng shared hosting plan** kung wala ka pa
3. **I-register o i-connect ang iyong domain**

## 3. Pag-setup ng Database sa Hostinger

1. **Mag-login sa Hostinger control panel (hPanel)**
2. **Pumunta sa "Databases" section**
3. **Gumawa ng bagong MySQL database**:
   - I-set ang database name
   - I-set ang username at password
   - I-note ang database credentials dahil kakailanganin mo ito sa pag-configure ng application

4. **I-import ang database data** (kung mayroon):
   - Gamitin ang phpMyAdmin sa Hostinger para i-import ang SQL dump file
   - O i-manually create ang tables kung wala kang existing data

## 4. Pag-setup ng Supabase

Kung gusto mong gamitin pa rin ang Supabase bilang storage backend, pwede mong i-keep ang Supabase connection habang naka-host ang main application sa Hostinger:

1. **I-ensure na proper CORS settings ang nakaset sa Supabase**:
   - I-add ang iyong Hostinger domain sa Supabase allowlist (kung applicable)
   - I-verify na maayos ang permissions sa storage buckets

2. **I-update ang application environment variables** para gamitin ang existing Supabase project

## 5. Pag-deploy ng Frontend sa Hostinger

### A. I-upload ang Frontend Files

1. **Mag-login sa Hostinger File Manager** o gamitin ang FTP client (FileZilla, etc.)
2. **Pumunta sa `public_html` folder**
3. **I-upload ang lahat ng files mula sa frontend `build` folder** sa root ng `public_html`

### B. I-configure ang Single Page Application (SPA) Routing

1. **Gumawa ng `.htaccess` file** sa root ng `public_html` para i-handle ang client-side routing:

```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

## 6. Pag-deploy ng Backend sa Hostinger

### Option 1: Gamitin ang Hostinger's Node.js Support (kung available)

Ang ilang premium shared hosting plans sa Hostinger ay may support para sa Node.js:

1. **I-check kung may Node.js support ang plan mo**
2. **I-upload ang backend files** sa isang separate folder (e.g., `backend` folder)
3. **I-setup ang application gamit ang Hostinger Node.js config panel**
4. **I-update ang environment variables**

### Option 2: I-convert ang Backend sa Shared Hosting Compatible

Kung walang Node.js support, kailangan mo i-adapt ang backend para gumana sa traditional shared hosting:

1. **I-consider ang mga alternative approaches**:
   - I-keep ang Supabase bilang primary backend at i-update lang ang frontend para mag-connect directly sa Supabase
   - Gumawa ng simple PHP proxy scripts para sa authentication at file operations
   - I-host ang Node.js backend sa ibang provider (Render, Heroku, etc.) at i-update lang ang frontend

## 7. Pag-configure ng Custom Domain at SSL

1. **I-verify na nakaset up na ang domain** sa Hostinger
2. **I-enable ang SSL**:
   - Pumunta sa "SSL" section sa hPanel
   - I-click ang "Setup" para sa domain mo
   - Piliin ang "Let's Encrypt" certificate
   - I-wait na ma-complete ang SSL installation

## 8. Pag-update ng Frontend Environment Variables

1. **I-update ang API endpoint URLs** sa frontend code bago mag-build:
   - REACT_APP_API_URL=https://yourdomain.com/api (kung PHP proxy ang gamit)
   - O REACT_APP_API_URL=https://your-backend-domain.com (kung separate ang backend hosting)
   - REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   - REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

## 9. I-test ang Deployment

1. **I-verify ang frontend access**:
   - I-access ang `https://yourdomain.com`
   - I-check kung naka-load lahat ng resources (images, CSS, JS)
   - I-test ang navigation at routing

2. **I-verify ang backend connections**:
   - I-test ang authentication
   - I-test ang data fetching
   - I-test ang image uploads sa Supabase storage

## 10. Troubleshooting sa Hostinger

### Common Issues at Mga Solusyon

1. **500 Internal Server Error**:
   - I-check ang mga permissions ng files (644 para sa files, 755 para sa directories)
   - I-verify ang PHP version compatibility kung gumagamit ka ng PHP scripts
   - I-check ang error logs sa hPanel

2. **404 Page Not Found**:
   - I-verify na tama ang path sa .htaccess file
   - I-check kung naka-upload ang files sa tamang directory

3. **CORS Errors**:
   - I-configure ang proper CORS headers sa backend
   - I-verify na tama ang domains sa Supabase CORS settings

4. **Database Connection Issues**:
   - I-double check ang database credentials
   - I-verify na ang IP address ng server ay allowed sa database (kung separate database server)

## Advantages ng Hostinger para sa Shared Hosting

1. **Cost-effective** - Mas mura kaysa sa dedicated cloud hosting
2. **Easy setup** - Simple UI at helpful documentation
3. **Decent performance** - Magandang performance para sa simple to medium websites
4. **LiteSpeed servers** - Karamihan ng Hostinger plans ay may LiteSpeed web servers
5. **Support** - 24/7 customer support

## Limitations ng Shared Hosting para sa Full-stack Applications

1. **Limited Node.js support** - Hindi lahat ng shared hosting plans ay may Node.js support
2. **Resource constraints** - Limited CPU at memory resources
3. **No SSH access** sa basic plans - Limited server configuration options
4. **No PM2 or similar process managers** - May challenges sa keeping Node.js apps running

Para sa mas advanced features at better performance, maaaring i-consider mo ang:
- Hostinger's Cloud Hosting plans (may dedicated resources)
- Digital Ocean, Render, o Vercel para sa frontend
- Supabase para sa backend at storage (gaya ng kasalukuyang setup)

Pero kung gusto mo talaga ng simple at affordable solution, ang Hostinger shared hosting ay pwede para sa iyong application, lalo na kung ang focus ay static frontend na kumokonekta sa Supabase backend services. 