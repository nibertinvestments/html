# HTML Projects Repository

A structured environment for housing multiple HTML projects with shared resources, development tools, and learning materials. This repository currently hosts the **Stock Market Directory** project - a real-time stock market data and charting application.

## 🌐 Live Website

**Stock Market Directory**: [https://stockmarketdirectory.org](https://stockmarketdirectory.org)
- **Status**: Live (may experience intermittent issues with external dependencies)
- **Primary Project**: Real-time stock market data, charts, and analysis tools
- **Known Issues**: Charts may not display due to CDN blocking or API limitations (see [Troubleshooting](#-troubleshooting))

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Create your first project:**
   ```bash
   npm run new-project
   ```

4. **Get help:**
   ```bash
   npm run help
   ```

## 📁 Directory Structure

```
├── projects/              # All your HTML projects
│   └── template/          # Project template with modern HTML5 boilerplate
├── Stock Market Directory # Main project (root level files)
│   ├── index.html         # Stock market data and charts application
│   ├── about.html         # About page
│   ├── contact.html       # Contact information
│   ├── main.js           # Application logic and API integration
│   └── style.css         # Application styles
├── shared/                # Shared resources across all projects
│   ├── css/              # Normalize.css, base styles, utilities
│   ├── js/               # Utility functions (DOM, HTTP, storage, etc.)
│   └── assets/           # Shared images, fonts, icons
├── docs/                 # Documentation and learning resources
│   ├── getting-started.md
│   ├── project-guidelines.md
│   └── web-development-resources.md
├── tools/                # Development tools and scripts
│   └── scripts/          # Project creation and optimization scripts
└── package.json          # Development dependencies and scripts
```

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with live reload |
| `npm run serve` | Start server and open projects directory |
| `npm run new-project` | Create a new project from template |
| `npm run lint` | Lint HTML, CSS, and JavaScript files |
| `npm run format` | Format CSS and JavaScript files |
| `npm run validate` | Validate HTML files |
| `npm run build` | Run all quality checks |
| `npm run help` | Show detailed help guide |

## ✨ Features

### Project Templates
- Modern HTML5 boilerplate
- Responsive CSS with flexbox and grid
- JavaScript utilities and smooth scrolling
- Proper meta tags and accessibility features

### Shared Resources
- **CSS Reset & Base Styles**: Normalize.css and common utilities
- **JavaScript Utilities**: DOM manipulation, HTTP requests, storage, validation
- **Development Tools**: Live server, linting, formatting, validation

### Development Environment
- Live reloading development server
- Code quality tools (ESLint, Stylelint, HTMLHint)
- HTML validation
- Code formatting with Prettier
- Browser compatibility guidelines

### Learning Resources
- Comprehensive getting started guide
- Project guidelines and best practices
- Curated web development learning resources
- Code examples and templates

## 🎯 Creating a New Project

### Using the Generator (Recommended)
```bash
npm run new-project
```

The generator will ask for:
- Project name (lowercase, no spaces)
- Project title (display name)
- Project description
- Author name

### Manual Creation
1. Create a folder in `projects/`
2. Copy files from `projects/template/`
3. Customize the content and metadata
4. Start coding!

## 🔧 Shared Utilities

All projects can use powerful shared utilities:

### CSS Features
- Responsive grid system
- Utility classes for spacing, text alignment
- Card components and alerts
- CSS custom properties for theming

### JavaScript Utilities
```javascript
// DOM manipulation
const element = DOM.$('#my-element');
DOM.on('.buttons', 'click', handler);

// HTTP requests
const data = await HTTP.get('/api/endpoint');
await HTTP.post('/api/data', payload);

// Local storage
Storage.set('key', value);
const value = Storage.get('key', defaultValue);

// Validation
if (Validate.email(email)) { /* valid email */ }

// Formatting
const price = Format.currency(29.99);
const date = Format.date(new Date());

// Animations
Animate.fadeIn(element);
Animate.slideDown(element);
```

## 📚 Documentation

- **[Getting Started](docs/getting-started.md)** - Setup and first project
- **[Project Guidelines](docs/project-guidelines.md)** - Best practices and conventions
- **[Web Development Resources](docs/web-development-resources.md)** - Learning materials and tools
- **[Troubleshooting Guide](docs/troubleshooting.md)** - Common issues and solutions
- **[Deployment Guide](docs/deployment.md)** - Hosting and deployment instructions

## 🎨 Featured Project: Stock Market Directory

### Current Implementation
The main project is a real-time stock market data application featuring:
- Real-time stock price data via Polygon.io API
- Interactive charts using Chart.js
- Market overview with major indices (S&P 500, Dow Jones, NASDAQ)
- Stock search functionality
- Responsive design for mobile and desktop

### Technical Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Charts**: Chart.js library
- **API**: Polygon.io for real-time financial data
- **Hosting**: Available at stockmarketdirectory.org
- **Development**: Live-server for local development

### Known Limitations
- External dependencies may be blocked in some environments
- API rate limits may affect real-time data updates
- Requires active internet connection for full functionality
- Chart rendering depends on CDN availability

## 🚨 Troubleshooting

### Charts Not Displaying
The Stock Market Directory application uses Chart.js for data visualization. If charts are not loading:

**Common Causes:**
- CDN blocking (Chart.js loaded from cdn.jsdelivr.net)
- Ad blockers preventing external script loading
- Network connectivity issues
- Browser security policies blocking third-party resources

**Solutions:**
1. **Disable ad blockers** temporarily to test chart functionality
2. **Check browser console** for script loading errors
3. **Verify network connectivity** to CDN resources
4. **Alternative**: Download Chart.js locally and update script references in index.html

### Real-Time Data Issues
The application fetches real-time stock data from Polygon.io API:

**Common Issues:**
- API rate limiting (free tier limitations)
- API key authentication issues
- CORS (Cross-Origin Resource Sharing) restrictions
- Network blocking of financial APIs

**Current Status:**
- Data may show "Loading..." indefinitely due to API restrictions
- External API dependencies may be unreliable in certain environments
- Consider implementing fallback data or offline mode

### Development Server Issues
```bash
# If development server fails to start
npm install          # Reinstall dependencies
npm run serve-project # Start local server on port 3000
```

## 🏗️ Technical Debt & Improvement Roadmap

### Immediate Issues to Address
1. **Chart.js Dependency**: Download and host Chart.js locally to avoid CDN blocking
2. **API Reliability**: Implement fallback data sources or offline mode
3. **Error Handling**: Add proper error handling for API failures
4. **Loading States**: Improve user feedback during data loading

### Recommended Improvements
1. **Progressive Web App (PWA)**: Add offline functionality
2. **Data Caching**: Implement client-side data caching
3. **Alternative APIs**: Research backup data sources
4. **Error Boundaries**: Add comprehensive error handling
5. **Performance**: Optimize asset loading and rendering
6. **Accessibility**: Improve screen reader support for charts
7. **Testing**: Add automated testing for critical functionality

### Future Enhancements
- Real-time WebSocket connections for live data
- Portfolio tracking and management features
- Advanced charting tools and technical indicators
- Mobile app development
- User authentication and personalization

## 🌐 Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## 🤝 Contributing

1. Follow the project guidelines
2. Use the linting and formatting tools
3. Test in multiple browsers
4. Document your code appropriately

## 📜 License

MIT License - feel free to use this structure for your own projects!

## 🆘 Getting Help

### Quick References
- Run `npm run help` for quick reference
- Check the documentation in the `docs/` folder
- Look at the template project for examples
- Use browser developer tools for debugging

### Common Support Topics
1. **Charts not loading**: See [Troubleshooting](#-troubleshooting) section
2. **API data issues**: Check network connectivity and API status
3. **Development server**: Ensure Node.js and npm are properly installed
4. **Deployment**: Reference the deployment guide for hosting options

### Community Resources
- [MDN Web Docs](https://developer.mozilla.org/) - Comprehensive web development reference
- [Stack Overflow](https://stackoverflow.com/) - Programming questions and answers
- [Chart.js Documentation](https://www.chartjs.org/docs/) - Charting library reference
- [Polygon.io API Docs](https://polygon.io/docs/) - Financial data API documentation

---

**Current Status**: Active development with focus on reliability and user experience improvements.

**Nibert Investments** - Building practical web applications for financial analysis and market research.
