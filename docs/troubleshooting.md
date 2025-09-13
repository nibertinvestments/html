# Troubleshooting Guide

This guide addresses common issues encountered when developing and running the Stock Market Directory application and other projects in this repository.

## Stock Market Directory Issues

### Charts Not Displaying

**Symptoms:**
- Empty chart area where stock charts should appear
- Console errors mentioning "Chart is not defined"
- Charts show loading state indefinitely

**Root Cause:**
The application relies on Chart.js loaded from a CDN (cdn.jsdelivr.net). This external dependency can be blocked by:
- Ad blockers and privacy extensions
- Corporate firewalls
- Network security policies
- Browser security settings

**Solutions (in order of recommendation):**

#### 1. Temporary Quick Fix
```bash
# Disable ad blockers temporarily
# Check browser console for specific error messages
# Test in incognito/private browsing mode
```

#### 2. Local Chart.js Installation (Recommended)
```bash
# Download Chart.js and host locally
cd /path/to/project
mkdir -p assets/js
# Download from https://cdn.jsdelivr.net/npm/chart.js
# Save as assets/js/chart.min.js
```

Update `index.html`:
```html
<!-- Replace CDN link -->
<!-- <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> -->

<!-- With local file -->
<script src="assets/js/chart.min.js"></script>
```

#### 3. Alternative Chart Libraries
Consider replacing Chart.js with:
- **D3.js** - More complex but fully customizable
- **ApexCharts** - Modern alternative with good documentation
- **Canvas-based custom charts** - Full control over rendering

### Real-Time Data Not Loading

**Symptoms:**
- Stock prices show "Loading..." indefinitely
- Market data displays "--" for all values
- Console errors related to API requests

**Root Causes:**
1. **API Rate Limiting**: Polygon.io free tier has strict limits
2. **CORS Issues**: Browser blocking cross-origin requests
3. **API Key Issues**: Invalid or expired authentication
4. **Network Blocking**: Corporate firewalls blocking financial APIs

**Solutions:**

#### 1. Check API Status
```javascript
// Add to browser console to test API directly
fetch('https://api.polygon.io/v1/meta/symbols/SPY/company?apikey=YOUR_API_KEY')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('API Error:', error));
```

#### 2. Implement Fallback Data
```javascript
// Add to main.js - fallback data when API fails
const FALLBACK_DATA = {
    SPY: { price: 450.00, change: '+2.50', changePercent: '+0.56%' },
    // ... more fallback data
};

// Use fallback when API fails
function loadDataWithFallback(symbol) {
    return fetchRealData(symbol)
        .catch(() => {
            console.warn('Using fallback data for', symbol);
            return FALLBACK_DATA[symbol];
        });
}
```

#### 3. Alternative APIs
Consider switching to:
- **Alpha Vantage** - Free tier with reasonable limits
- **IEX Cloud** - Developer-friendly financial API
- **Yahoo Finance (unofficial)** - Free but unofficial APIs available
- **Mock Data** - For development and testing

### Website Access Issues (stockmarketdirectory.org)

**Symptoms:**
- Site inaccessible or loading slowly
- SSL certificate warnings
- DNS resolution failures

**Solutions:**
1. **Check DNS**: Use tools like `nslookup` or `dig` to verify DNS resolution
2. **Test from different networks**: Try mobile data vs WiFi
3. **Clear browser cache**: Hard refresh (Ctrl+F5) or clear browser data
4. **Check hosting status**: Contact hosting provider if issues persist

## Development Environment Issues

### Node.js and npm Problems

**Symptoms:**
- `npm install` fails
- Development server won't start
- Module not found errors

**Solutions:**
```bash
# Check versions
node --version  # Should be 14.0.0 or higher
npm --version   # Should be 6.0.0 or higher

# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use specific Node version with nvm (if available)
nvm use 18
npm install
```

### Live Server Issues

**Symptoms:**
- Server fails to start on port 3000
- "Port already in use" errors
- Live reload not working

**Solutions:**
```bash
# Kill existing processes on port 3000
lsof -ti:3000 | xargs kill -9

# Use alternative port
npx live-server --port=3001

# Start with specific project directory
npm run serve-project
```

### Linting and Validation Errors

**Symptoms:**
- HTML validation failures
- CSS/JS linting errors
- Build process failing

**Solutions:**
```bash
# Fix formatting automatically
npm run format

# Check specific issues
npm run lint:html
npm run lint:css  
npm run lint:js

# Skip linting temporarily (not recommended)
# Comment out lint scripts in package.json
```

## Browser-Specific Issues

### Ad Blockers and Extensions

**Common Blocking Patterns:**
- Chart.js CDN requests
- Google AdSense scripts
- Financial API requests
- Analytics scripts

**Testing:**
```bash
# Test in different browsers
# Chrome: Open incognito mode
# Firefox: Open private window
# Safari: Develop menu > Disable extensions
```

### CORS and Security Policies

**Symptoms:**
- Console errors mentioning "CORS policy"
- "Mixed content" warnings
- CSP (Content Security Policy) violations

**Solutions:**
```html
<!-- Add to <head> if needed -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self' 'unsafe-inline' 'unsafe-eval' 
               https://cdn.jsdelivr.net https://api.polygon.io 
               https://pagead2.googlesyndication.com;">
```

## Performance Issues

### Slow Loading Times

**Diagnosis:**
```bash
# Open browser dev tools
# Go to Network tab
# Reload page and check for slow resources
```

**Common Culprits:**
- Large Chart.js library from CDN
- High-resolution images
- Multiple API requests
- Unoptimized CSS/JS

**Solutions:**
```bash
# Optimize images
npm run optimize

# Minify assets (add to package.json)
# "minify": "terser main.js -o main.min.js"
```

### Memory Usage

**Symptoms:**
- Browser tab becomes unresponsive
- High CPU usage
- Chart animations stuttering

**Solutions:**
```javascript
// Destroy charts when no longer needed
if (chartInstance) {
    chartInstance.destroy();
}

// Limit update frequency
const updateThrottle = setInterval(() => {
    updateMarketData();
}, 30000); // Every 30 seconds instead of every second
```

## API-Specific Troubleshooting

### Polygon.io API Issues

**Rate Limiting:**
- Free tier: 5 calls per minute
- Basic plan: 100 calls per minute
- Solution: Implement caching and reduce request frequency

**Authentication:**
```javascript
// Verify API key is valid
const API_KEY = 'YOUR_API_KEY';
fetch(`https://api.polygon.io/v3/reference/tickers?apikey=${API_KEY}&limit=1`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => console.log('API working:', data))
    .catch(error => console.error('API Error:', error));
```

## Deployment Issues

### Hosting Configuration

**Static Site Hosting (Recommended):**
- GitHub Pages
- Netlify
- Vercel
- Amazon S3 + CloudFront

**Server Requirements:**
- HTTPS enabled (required for modern APIs)
- CORS headers configured
- Proper MIME types for static assets

### Domain and DNS

**Custom Domain Setup:**
```bash
# Verify DNS propagation
nslookup stockmarketdirectory.org

# Check SSL certificate
openssl s_client -connect stockmarketdirectory.org:443
```

## Debugging Tools and Techniques

### Browser Developer Tools

**Console Commands for Debugging:**
```javascript
// Check if Chart.js is loaded
console.log(typeof Chart);

// Monitor API calls
const originalFetch = fetch;
fetch = function(...args) {
    console.log('API Call:', args[0]);
    return originalFetch.apply(this, args);
};

// Check application state
console.log('Current State:', STATE);
console.log('Config:', CONFIG);
```

### Network Analysis

**Key Metrics to Monitor:**
- Failed requests (4xx/5xx status codes)
- Slow loading resources (>3 seconds)
- Blocked requests (typically show as "blocked" in Network tab)
- Large payload sizes (>1MB for this application is excessive)

### Performance Monitoring

**Lighthouse Audit:**
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --output html --output-path report.html
```

## Recovery Procedures

### Complete Reset

If all else fails, perform a complete reset:

```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 2. Reset git state (if needed)
git clean -fd
git reset --hard HEAD

# 3. Restart development server
npm run dev
```

### Backup Procedures

**Before Making Changes:**
```bash
# Create backup branch
git checkout -b backup-$(date +%Y%m%d)
git add .
git commit -m "Backup before troubleshooting"

# Return to main branch
git checkout main
```

## Getting Additional Help

### Log Collection

When reporting issues, include:
```bash
# System information
node --version
npm --version
cat package.json

# Error logs
npm run dev 2>&1 | tee debug.log

# Browser console errors (copy from dev tools)
```

### Community Resources

- **GitHub Issues**: Report bugs specific to this repository
- **Stack Overflow**: General web development questions
- **Chart.js Community**: Chart-specific issues
- **Polygon.io Support**: API-related problems

### Professional Support

For production deployments or critical issues:
- Consider upgrading to paid API tiers for better reliability
- Implement proper monitoring and alerting
- Set up automated testing and deployment pipelines
- Consult with web development professionals for scalability

---

**Remember**: Most issues in this application stem from external dependencies (CDNs, APIs) being blocked or rate-limited. The most reliable solution is to host dependencies locally and implement proper fallback mechanisms.