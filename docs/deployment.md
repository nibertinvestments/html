# Deployment Guide

This guide provides comprehensive instructions for deploying the Stock Market Directory application and other projects in this repository.

## Current Deployment Status

### Live Website
- **URL**: [https://stockmarketdirectory.org](https://stockmarketdirectory.org)
- **Status**: Active (intermittent issues may occur)
- **Hosting**: Currently deployed and accessible
- **SSL**: HTTPS enabled and configured

### Infrastructure Overview
The Stock Market Directory is deployed as a static website with the following characteristics:
- **Type**: Client-side JavaScript application
- **Dependencies**: External APIs and CDN resources
- **Requirements**: HTTPS for API access, modern browser support
- **Performance**: Lightweight HTML/CSS/JS stack

## Deployment Options

### 1. Static Site Hosting (Recommended)

#### GitHub Pages (Free)
**Pros**: Free, integrated with repository, automatic deployments
**Cons**: Limited to static sites, no server-side processing

```bash
# Setup GitHub Pages deployment
# 1. Go to repository Settings
# 2. Scroll to Pages section
# 3. Select source branch (main)
# 4. Custom domain: stockmarketdirectory.org
```

**Configuration:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

#### Netlify (Free/Paid)
**Pros**: Excellent performance, form handling, serverless functions
**Cons**: Build minutes limited on free plan

```bash
# Deploy to Netlify
# 1. Connect GitHub repository
# 2. Build command: npm run build
# 3. Publish directory: ./
# 4. Custom domain: stockmarketdirectory.org
```

**Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Vercel (Free/Paid)
**Pros**: Excellent performance, edge functions, great developer experience
**Cons**: More complex for simple static sites

```bash
# Deploy to Vercel
npm install -g vercel
vercel --prod
```

**Configuration** (`vercel.json`):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### 2. Traditional Web Hosting

#### Shared Hosting
**Suitable for**: Simple deployments, cost-effective hosting
**Requirements**: FTP/SFTP access, custom domain support

```bash
# Manual deployment via FTP
# 1. Build the project locally
npm run build

# 2. Upload files via FTP client
# - Upload all HTML, CSS, JS files
# - Ensure proper file permissions (644 for files, 755 for directories)
# - Configure custom domain in hosting control panel
```

#### VPS/Dedicated Server
**Suitable for**: Full control, custom configurations, high traffic

```bash
# Example: Nginx configuration
server {
    listen 80;
    listen 443 ssl;
    server_name stockmarketdirectory.org www.stockmarketdirectory.org;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /var/www/stockmarketdirectory;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Domain Configuration

### DNS Setup
**Required Records for stockmarketdirectory.org:**

```dns
# A Records (replace with actual IP addresses)
@    A    192.0.2.1
www  A    192.0.2.1

# CNAME for GitHub Pages (alternative)
www  CNAME  nibertinvestments.github.io

# CNAME for Netlify (alternative)
www  CNAME  amazing-site-name.netlify.app
```

### SSL Certificate
**Options:**
1. **Let's Encrypt** (Free, automatic renewal)
2. **Cloudflare** (Free tier available)
3. **Commercial SSL** (paid, extended validation available)

```bash
# Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d stockmarketdirectory.org -d www.stockmarketdirectory.org
```

## Build Process

### Pre-deployment Checklist

```bash
# 1. Install dependencies
npm install

# 2. Run quality checks
npm run lint
npm run validate
npm run format

# 3. Test locally
npm run dev
# Verify all functionality works

# 4. Build for production (if applicable)
npm run build
```

### Environment Configuration

**Production Environment Variables:**
```javascript
// config/production.js
const PRODUCTION_CONFIG = {
    API_BASE_URL: 'https://api.polygon.io',
    API_KEY: process.env.POLYGON_API_KEY, // Set in hosting environment
    ENVIRONMENT: 'production',
    DEBUG: false,
    CACHE_DURATION: 300000, // 5 minutes
    UPDATE_INTERVAL: 60000   // 1 minute
};
```

**Environment-specific settings:**
```bash
# Production
NODE_ENV=production
POLYGON_API_KEY=your_production_api_key

# Development
NODE_ENV=development
POLYGON_API_KEY=your_development_api_key
```

## Performance Optimization

### Asset Optimization

```bash
# Image optimization
npm run optimize

# CSS/JS minification (add to package.json)
"scripts": {
    "minify:css": "cssnano style.css style.min.css",
    "minify:js": "terser main.js -o main.min.js",
    "build:prod": "npm run minify:css && npm run minify:js"
}
```

### CDN Configuration
**Local Asset Hosting** (recommended for reliability):

```bash
# Download external dependencies
mkdir -p assets/js assets/css

# Chart.js
curl -o assets/js/chart.min.js https://cdn.jsdelivr.net/npm/chart.js

# Update HTML references
# <script src="assets/js/chart.min.js"></script>
```

### Caching Strategy

```html
<!-- Cache static assets -->
<link rel="stylesheet" href="style.css?v=1.0.0">
<script src="main.js?v=1.0.0"></script>

<!-- Service Worker for caching (future enhancement) -->
<script>
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
</script>
```

## Monitoring and Maintenance

### Health Checks

**Basic Monitoring Script:**
```javascript
// health-check.js
const https = require('https');

function checkWebsite(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            resolve({
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                headers: res.headers
            });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => reject(new Error('Timeout')));
    });
}

// Usage
checkWebsite('https://stockmarketdirectory.org')
    .then(result => console.log('Site status:', result.statusCode))
    .catch(error => console.error('Site down:', error.message));
```

### Error Monitoring

**Client-side Error Tracking:**
```javascript
// Add to main.js
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    
    // Optional: Send to monitoring service
    // fetch('/api/errors', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         message: event.error.message,
    //         stack: event.error.stack,
    //         url: window.location.href,
    //         userAgent: navigator.userAgent
    //     })
    // });
});
```

### Update Procedures

**Regular Maintenance Tasks:**
```bash
# Weekly checks
1. Verify website accessibility
2. Check API functionality
3. Review browser console for errors
4. Test on multiple devices/browsers

# Monthly updates
1. Update dependencies: npm update
2. Security audit: npm audit
3. Performance review
4. Content updates as needed

# Quarterly reviews
1. SSL certificate renewal
2. Hosting plan evaluation
3. Analytics review
4. User feedback incorporation
```

## Security Considerations

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://pagead2.googlesyndication.com; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://api.polygon.io;">
```

### API Key Security

**Best Practices:**
```javascript
// Never commit API keys to repository
// Use environment variables or secure configuration

// Client-side considerations (API keys are visible)
// Consider server-side proxy for sensitive operations
// Implement rate limiting and monitoring
```

### HTTPS Requirements

**Modern API Requirements:**
- Polygon.io API requires HTTPS
- Geolocation APIs require HTTPS
- Service Workers require HTTPS
- Progressive Web App features require HTTPS

## Backup and Recovery

### Automated Backups

```bash
# Git-based backup
git remote add backup https://github.com/nibertinvestments/html-backup
git push backup main

# File-based backup
rsync -av --delete /path/to/project/ /backup/location/
```

### Recovery Procedures

**Complete Site Recovery:**
```bash
# 1. Clone repository
git clone https://github.com/nibertinvestments/html.git

# 2. Install dependencies
cd html && npm install

# 3. Deploy using preferred method
npm run deploy
```

## Troubleshooting Deployment Issues

### Common Problems

**1. DNS Not Propagating**
```bash
# Check DNS propagation
nslookup stockmarketdirectory.org
dig stockmarketdirectory.org

# Flush local DNS cache
sudo systemctl flush-dns  # Linux
dscacheutil -flushcache   # macOS
ipconfig /flushdns        # Windows
```

**2. SSL Certificate Issues**
```bash
# Test SSL configuration
openssl s_client -connect stockmarketdirectory.org:443
curl -I https://stockmarketdirectory.org
```

**3. API CORS Issues**
```javascript
// Add CORS handling for production
const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const apiUrl = corsProxy + 'https://api.polygon.io/...';
```

### Emergency Procedures

**Site Down Recovery:**
1. Check hosting service status
2. Verify DNS resolution
3. Test from multiple locations
4. Check SSL certificate validity
5. Review recent changes in git history
6. Deploy from known good commit if needed

## Cost Optimization

### Free Tier Recommendations

**Hosting**: GitHub Pages (free for public repos)
**CDN**: Cloudflare (free tier available)
**SSL**: Let's Encrypt (free)
**API**: Polygon.io free tier (limited but functional)
**Monitoring**: UptimeRobot (free tier)

**Estimated Monthly Costs (minimal deployment):**
- Domain registration: $1-2/month
- Everything else: $0 (using free tiers)

### Scaling Considerations

**Traffic Growth Plan:**
1. **0-1K visitors/month**: Free hosting sufficient
2. **1K-10K visitors/month**: Consider paid hosting for better performance
3. **10K+ visitors/month**: CDN, caching, and performance optimization critical

---

**Next Steps**: After deployment, monitor the site regularly and maintain documentation of any configuration changes or issues encountered.