# Pag-setup ng Custom Domain para sa Web Application

Ang guide na ito ay gagabay sa iyo sa proseso ng pag-setup ng custom domain para sa iyong web application, pag-configure ng DNS settings, at pag-secure ng website gamit ang SSL.

## 1. Bumili ng Domain Name

1. **Pumili ng Domain Registrar**:
   - [Namecheap](https://www.namecheap.com)
   - [GoDaddy](https://www.godaddy.com)
   - [Google Domains](https://domains.google)
   - [NameSilo](https://www.namesilo.com)

2. **Mag-search at bumili ng domain name**:
   - Piliin ang domain extension (.com, .ph, .net, etc.)
   - Bayaran ang domain registration fee (karaniwang 1-2 taon ang registration)
   - I-complete ang registration details at contact information

## 2. I-connect ang Domain sa Frontend Hosting

### A. Kung Vercel ang gamit mong hosting:

1. **Sa Vercel Dashboard**:
   - Pumunta sa iyong project
   - I-click ang "Settings" tab
   - I-click ang "Domains" sa sidebar
   - I-add ang iyong domain (e.g., `yourdomain.com`)

2. **Sa Domain Registrar Dashboard**:
   - Pumunta sa DNS settings/management
   - I-add ang mga sumusunod na records:

     **Para sa root domain (yourdomain.com)**:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21 (Vercel's IP address)
     TTL: Automatic/Default
     ```

     **Para sa www subdomain**:
     ```
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com. (or your vercel project URL)
     TTL: Automatic/Default
     ```

### B. Kung Netlify ang gamit mong hosting:

1. **Sa Netlify Dashboard**:
   - Pumunta sa iyong site
   - I-click ang "Domain settings" o "Domain management"
   - I-click ang "Add custom domain"
   - I-enter ang iyong domain name
   - Sundin ang instructions para sa DNS configuration

2. **Sa Domain Registrar Dashboard**:
   - I-add ang mga sumusunod na records:

     **Para sa root domain**:
     ```
     Type: A
     Name: @
     Value: 75.2.60.5 (Netlify's load balancer IP)
     TTL: Automatic/Default
     ```

     **Para sa www subdomain**:
     ```
     Type: CNAME
     Name: www
     Value: yoursitename.netlify.app
     TTL: Automatic/Default
     ```

### C. Kung DigitalOcean, AWS, o ibang cloud provider ang gamit mo:

1. **Sa Provider Dashboard**:
   - I-locate ang IP address ng iyong server o load balancer
   - I-note ang IP address para sa A record

2. **Sa Domain Registrar Dashboard**:
   - I-add ang mga sumusunod na records:

     **Para sa root domain**:
     ```
     Type: A
     Name: @
     Value: [Your server IP address]
     TTL: Automatic/Default
     ```

     **Para sa www subdomain**:
     ```
     Type: CNAME
     Name: www
     Value: yourdomain.com
     TTL: Automatic/Default
     ```

## 3. I-configure ang Subdomain para sa Backend API

Kung ang backend at frontend mo ay nasa magkaibang servers:

1. **Sa Domain Registrar Dashboard**:
   - I-add ang subdomain para sa API:
     ```
     Type: A
     Name: api
     Value: [Your backend server IP address]
     TTL: Automatic/Default
     ```

2. **Sa Backend Server**:
   - I-configure ang web server (Nginx, Apache) para i-recognize ang subdomain
   - I-update ang SSL certificate para kasama ang subdomain

## 4. I-secure ang Domain gamit ang SSL/HTTPS

### A. Automatic SSL sa Managed Hosting (Vercel, Netlify):

Karamihan ng managed hosting services ay automatically nag-provide ng SSL:
- Vercel: Automatic SSL via Let's Encrypt
- Netlify: Automatic SSL via Let's Encrypt

Kailangan mo lang i-verify na ang domain ay correctly set up sa platform.

### B. Manual SSL Setup (Sa server tulad ng DigitalOcean, AWS EC2):

1. **I-install ang Certbot**:
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx  # for Nginx
   # OR
   sudo apt install certbot python3-certbot-apache  # for Apache
   ```

2. **I-generate ang SSL Certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
   # OR
   sudo certbot --apache -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
   ```

3. **I-verify ang Auto-renewal**:
   ```bash
   sudo certbot renew --dry-run
   ```

## 5. I-verify ang DNS Propagation

1. **I-check ang DNS propagation** gamit ang mga tools tulad ng:
   - [DNSChecker](https://dnschecker.org)
   - [WhatsMyDNS](https://whatsmydns.net)
   - [DNS Propagation Checker](https://www.whatsmydns.net)

2. **Maghintay ng DNS propagation time** (karaniwang 15 minuto hanggang 48 oras)

## 6. I-test ang Domain Setup

1. **I-test ang domain access**:
   - I-access ang `https://yourdomain.com`
   - I-access ang `https://www.yourdomain.com`
   - I-access ang `https://api.yourdomain.com` (kung applicable)

2. **I-verify ang SSL setup**:
   - I-check ang lock icon sa address bar
   - I-verify na walang mixed content warnings
   - I-test gamit ang [SSL Labs](https://www.ssllabs.com/ssltest/)

## 7. I-troubleshoot ang Common Issues

### A. DNS Issues:
- I-double check ang DNS records para sa typos
- I-verify na may tamang format ang values
- I-clear ang browser cache

### B. SSL Issues:
- I-check ang SSL certificate expiration
- I-verify na ang certificate ay para sa correct domain
- I-check ang mixed content issues

### C. Routing Issues:
- I-verify ang web server configuration
- I-check ang firewall settings
- I-test ang connectivity sa server

## 8. I-setup ang Domain Email (Optional)

1. **I-setup ang MX Records** para sa email provider:
   ```
   Type: MX
   Name: @
   Priority: 10
   Value: [mail server address from your email provider]
   TTL: Automatic/Default
   ```

2. **I-add ang SPF Record** para protektahin laban sa email spoofing:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.google.com ~all
   TTL: Automatic/Default
   ```

## 9. I-optimize para sa Search Engines

1. **I-setup ang www to non-www redirection** (o kabaligtaran):
   - I-configure ito sa web server o hosting platform
   - I-set ang canonical URLs sa application

2. **I-verify ang website sa Google Search Console**:
   - I-add ang iyong domain sa Google Search Console
   - I-upload ang HTML verification file o i-add ang DNS TXT record

## 10. I-maintain ang Domain Registration

1. **I-enable ang auto-renewal** para hindi mag-expire ang domain
2. **I-keep updated ang contact information** para makatanggap ng renewal notices
3. **I-consider ang domain privacy protection** para protektahan ang personal information

Para sa anumang issues o tanong tungkol sa domain setup, i-contact ang iyong domain registrar support o hosting provider. 