# Copilot Instructions for Nibert Investments HTML Repository

This document provides specific guidance for GitHub Copilot when working with the Nibert Investments HTML projects repository. Follow these instructions to ensure code consistency, quality, and alignment with repository-specific patterns.

## Repository Overview

This is a multi-project HTML repository focused on financial web applications, particularly the **Stock Market Directory** - a real-time stock data and charting application. The repository uses a shared resource architecture to promote code reuse and consistency across projects.

### Key Characteristics
- **Primary Language**: Vanilla JavaScript, HTML5, CSS3
- **Main Project**: Stock Market Directory (real-time financial data visualization)
- **Architecture**: Modular with shared utilities and resources
- **Target**: Professional financial web applications
- **Deployment**: Static hosting with external API integrations

## Project Structure and Conventions

### Directory Structure
```
├── index.html, main.js, style.css    # Stock Market Directory (main project)
├── projects/                         # All HTML projects
│   └── template/                     # Project boilerplate
├── shared/                           # Shared resources across projects
│   ├── css/                         # Base styles, utilities, normalize.css
│   └── js/                          # Utility functions (DOM, HTTP, storage)
├── docs/                            # Documentation and guidelines
├── tools/scripts/                   # Development automation scripts
└── package.json                     # Development dependencies and scripts
```

### Naming Conventions
- **Project folders**: `kebab-case` (e.g., `stock-tracker`)
- **Files**: `kebab-case.ext` (e.g., `contact-form.html`)
- **CSS classes**: BEM methodology (`.card__header--active`)
- **JavaScript**: `camelCase` for variables, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants
- **API endpoints**: Financial data from Polygon.io and similar services

## Coding Standards and Practices

### HTML Guidelines
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Descriptive content for financial apps">
    <title>Descriptive Title - Stock Market Directory</title>
    
    <!-- Shared CSS first -->
    <link rel="stylesheet" href="shared/css/normalize.css">
    <link rel="stylesheet" href="shared/css/base.css">
    
    <!-- Project-specific CSS -->
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Use semantic HTML5 elements -->
    <header><nav><!-- navigation --></nav></header>
    <main><!-- primary content --></main>
    <footer><!-- site footer --></footer>
    
    <!-- Shared JS utilities first -->
    <script src="shared/js/utils.js"></script>
    
    <!-- Project-specific JS -->
    <script src="main.js"></script>
</body>
</html>
```

**Key Requirements:**
- Always include viewport meta tag for responsive design
- Use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`)
- Include proper meta descriptions for financial applications
- Load shared resources before project-specific ones
- Ensure accessibility with proper ARIA labels and alt attributes

### CSS Architecture
```css
/* 1. CSS Custom Properties */
:root {
    --primary-color: #007bff;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --font-family: 'Arial', sans-serif;
    --transition: all 0.3s ease;
}

/* 2. Base Elements */
body {
    font-family: var(--font-family);
    line-height: 1.6;
    margin: 0;
}

/* 3. Layout Components */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* 4. UI Components (BEM methodology) */
.card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card__header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
}

.card--highlighted {
    border-left: 4px solid var(--primary-color);
}

/* 5. Utilities */
.text-center { text-align: center; }
.mb-3 { margin-bottom: 1rem; }
.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: var(--transition);
}

/* 6. Media Queries */
@media (max-width: 768px) {
    .container {
        padding: 0 10px;
    }
}
```

**Key Requirements:**
- Use CSS custom properties for consistent theming
- Follow BEM naming convention for components
- Implement mobile-first responsive design
- Use relative units (`rem`, `em`, `%`) when appropriate
- Include utility classes for common patterns

### JavaScript Patterns

#### Using Shared Utilities
Always leverage the shared utility functions:

```javascript
// DOM manipulation - use shared DOM utility
const element = DOM.$('#stock-symbol');
const elements = DOM.$$('.stock-item');

// Create elements programmatically
const stockCard = DOM.create('div', {
    className: 'card stock-card',
    'data-symbol': 'AAPL'
});

// Event handling with delegation
DOM.on('.stock-button', 'click', handleStockClick);

// HTTP requests - use shared HTTP utility
async function fetchStockData(symbol) {
    try {
        const data = await HTTP.get(`/api/stocks/${symbol}`);
        return data;
    } catch (error) {
        console.error('Failed to fetch stock data:', error);
        throw error;
    }
}

// Local storage - use shared Storage utility
Storage.set('user-preferences', { 
    theme: 'dark',
    defaultSymbols: ['AAPL', 'GOOGL', 'MSFT']
});

const preferences = Storage.get('user-preferences', {});

// Validation - use shared Validate utility
if (Validate.required(symbolInput.value) && Validate.alphanumeric(symbolInput.value)) {
    // Process valid stock symbol
}

// Formatting - use shared Format utility
const price = Format.currency(stock.price);
const change = Format.percentage(stock.changePercent);
const lastUpdate = Format.date(stock.timestamp);
```

#### Application Structure Pattern
```javascript
// Financial application pattern
class StockApplication {
    constructor() {
        this.config = {
            apiKey: process.env.POLYGON_API_KEY || 'demo',
            baseURL: 'https://api.polygon.io/v2',
            updateInterval: 30000 // 30 seconds
        };
        this.cache = new Map();
        this.activeSymbols = new Set();
    }

    async init() {
        this.setupEventListeners();
        this.loadUserPreferences();
        await this.loadDefaultStocks();
        this.startRealTimeUpdates();
    }

    setupEventListeners() {
        DOM.on('#search-form', 'submit', this.handleSearch.bind(this));
        DOM.on('.stock-item', 'click', this.handleStockSelect.bind(this));
    }

    async handleSearch(event) {
        event.preventDefault();
        const symbol = DOM.$('#symbol-input').value.toUpperCase();
        
        if (!Validate.required(symbol)) {
            this.showError('Please enter a stock symbol');
            return;
        }

        try {
            await this.addStock(symbol);
        } catch (error) {
            this.showError(`Failed to add ${symbol}: ${error.message}`);
        }
    }

    async addStock(symbol) {
        const stockData = await this.fetchStock(symbol);
        this.renderStock(stockData);
        this.activeSymbols.add(symbol);
        Storage.set('active-symbols', Array.from(this.activeSymbols));
    }

    async fetchStock(symbol) {
        // Check cache first
        if (this.cache.has(symbol)) {
            const cached = this.cache.get(symbol);
            if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
                return cached.data;
            }
        }

        const data = await HTTP.get(`${this.config.baseURL}/aggs/ticker/${symbol}/prev`);
        
        // Cache the result
        this.cache.set(symbol, {
            data,
            timestamp: Date.now()
        });

        return data;
    }

    renderStock(stockData) {
        const stockElement = DOM.create('div', {
            className: 'stock-item card',
            'data-symbol': stockData.symbol
        });

        stockElement.innerHTML = `
            <div class="card__header">
                <h3>${stockData.symbol}</h3>
                <span class="price">${Format.currency(stockData.price)}</span>
            </div>
            <div class="card__body">
                <span class="change ${stockData.change >= 0 ? 'positive' : 'negative'}">
                    ${Format.percentage(stockData.changePercent)}
                </span>
            </div>
        `;

        DOM.$('#stocks-container').appendChild(stockElement);
    }

    showError(message) {
        // Use shared notification system if available
        const errorElement = DOM.create('div', {
            className: 'alert alert--error'
        }, message);
        
        DOM.$('#notifications').appendChild(errorElement);
        
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    const app = new StockApplication();
    app.init().catch(console.error);
});
```

## Data Structures and API Patterns

### Financial Data Structures
```javascript
// Stock data structure
const Stock = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 150.25,
    change: 2.50,
    changePercent: 1.69,
    volume: 75000000,
    marketCap: 2400000000000,
    timestamp: '2024-01-15T16:00:00Z',
    exchange: 'NASDAQ'
};

// Portfolio structure
const Portfolio = {
    id: 'user_portfolio_1',
    name: 'My Portfolio',
    totalValue: 25000.00,
    totalGain: 1250.00,
    totalGainPercent: 5.26,
    positions: [
        {
            symbol: 'AAPL',
            shares: 100,
            avgCost: 145.00,
            currentValue: 15025.00,
            gain: 525.00,
            gainPercent: 3.62
        }
    ],
    lastUpdated: '2024-01-15T16:00:00Z'
};

// Market data structure
const MarketData = {
    indices: {
        'SPY': { price: 450.25, change: 5.50, changePercent: 1.24 },
        'DIA': { price: 350.75, change: -2.25, changePercent: -0.64 },
        'QQQ': { price: 375.00, change: 8.75, changePercent: 2.39 }
    },
    sectors: {
        'Technology': { change: 2.15, topGainer: 'NVDA', topLoser: 'INTC' },
        'Healthcare': { change: -0.85, topGainer: 'JNJ', topLoser: 'PFE' }
    },
    timestamp: '2024-01-15T16:00:00Z'
};
```

### API Integration Patterns
```javascript
// API service class for financial data
class FinancialAPI {
    constructor(apiKey, baseURL = 'https://api.polygon.io/v2') {
        this.apiKey = apiKey;
        this.baseURL = baseURL;
        this.rateLimiter = new Map(); // Simple rate limiting
    }

    async request(endpoint, params = {}) {
        // Rate limiting check
        const now = Date.now();
        const lastRequest = this.rateLimiter.get(endpoint) || 0;
        if (now - lastRequest < 1000) { // 1 second between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        this.rateLimiter.set(endpoint, now);

        const url = new URL(`${this.baseURL}${endpoint}`);
        url.searchParams.append('apikey', this.apiKey);
        
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        const response = await HTTP.get(url.toString());
        
        if (response.status === 'ERROR') {
            throw new Error(response.error || 'API request failed');
        }
        
        return response.results || response;
    }

    async getStock(symbol) {
        return await this.request(`/aggs/ticker/${symbol}/prev`);
    }

    async getStockDetails(symbol) {
        return await this.request(`/reference/tickers/${symbol}`);
    }

    async searchStocks(query) {
        return await this.request('/reference/tickers', { 
            search: query,
            market: 'stocks',
            active: true,
            limit: 10
        });
    }

    async getMarketStatus() {
        return await this.request('/marketstatus/now');
    }
}
```

## Problem-Solving Guidelines

### Common Issues and Solutions

#### 1. Chart.js Integration Issues
```javascript
// Problem: Charts not loading due to CDN blocking
// Solution: Host Chart.js locally and implement fallback

// Check if Chart.js is loaded
if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded, loading fallback...');
    // Load local version or show alternative visualization
    await loadLocalChartLibrary();
}

// Defensive chart creation
function createStockChart(canvas, data) {
    if (!canvas || typeof Chart === 'undefined') {
        console.error('Chart.js not available, using fallback visualization');
        return createFallbackChart(canvas, data);
    }

    return new Chart(canvas, {
        type: 'line',
        data: {
            labels: data.timestamps,
            datasets: [{
                label: 'Stock Price',
                data: data.prices,
                borderColor: 'var(--primary-color)',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return Format.currency(value);
                        }
                    }
                }
            }
        }
    });
}
```

#### 2. API Rate Limiting and Error Handling
```javascript
// Robust API error handling
class APIService {
    async fetchWithRetry(url, options = {}, maxRetries = 3) {
        for (let i = 0; i <= maxRetries; i++) {
            try {
                const response = await HTTP.get(url, options);
                return response;
            } catch (error) {
                if (i === maxRetries) {
                    // Final retry failed
                    throw new Error(`API request failed after ${maxRetries} retries: ${error.message}`);
                }
                
                // Exponential backoff
                const delay = Math.pow(2, i) * 1000;
                console.warn(`API request failed, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    async getStockWithFallback(symbol) {
        try {
            return await this.fetchWithRetry(`/api/stocks/${symbol}`);
        } catch (error) {
            console.warn('Real-time data unavailable, using cached data');
            return this.getCachedStock(symbol) || this.getMockStock(symbol);
        }
    }
}
```

#### 3. Performance Optimization for Financial Data
```javascript
// Efficient data updates and rendering
class StockTracker {
    constructor() {
        this.updateQueue = new Set();
        this.isUpdating = false;
    }

    // Batch DOM updates for better performance
    async batchUpdate() {
        if (this.isUpdating) return;
        this.isUpdating = true;

        const symbols = Array.from(this.updateQueue);
        this.updateQueue.clear();

        // Fetch all data in parallel
        const promises = symbols.map(symbol => this.fetchStock(symbol));
        const results = await Promise.allSettled(promises);

        // Update DOM in a single batch
        const fragment = document.createDocumentFragment();
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const element = this.createStockElement(result.value);
                fragment.appendChild(element);
            }
        });

        DOM.$('#stocks-container').appendChild(fragment);
        this.isUpdating = false;
    }

    // Throttled update function
    scheduleUpdate(symbol) {
        this.updateQueue.add(symbol);
        
        if (!this.updateTimeout) {
            this.updateTimeout = setTimeout(() => {
                this.batchUpdate();
                this.updateTimeout = null;
            }, 100); // Batch updates every 100ms
        }
    }
}
```

### Memory Management
```javascript
// Proper cleanup for financial applications
class Application {
    constructor() {
        this.intervals = [];
        this.eventListeners = [];
        this.cache = new Map();
    }

    addInterval(callback, delay) {
        const id = setInterval(callback, delay);
        this.intervals.push(id);
        return id;
    }

    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    cleanup() {
        // Clear intervals
        this.intervals.forEach(clearInterval);
        this.intervals = [];

        // Remove event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        // Clear cache
        this.cache.clear();
    }

    // Call cleanup on page unload
    init() {
        window.addEventListener('beforeunload', () => this.cleanup());
    }
}
```

## Development Workflow

### Quality Assurance Commands
```bash
# Run all quality checks
npm run build

# Individual checks
npm run lint:html    # HTML validation
npm run lint:css     # CSS linting (may have warnings in existing code)
npm run lint:js      # JavaScript linting
npm run format       # Code formatting
npm run validate     # HTML validation

# Development server
npm run dev          # Start development server with live reload
```

### Project Creation
```bash
# Create new project using template
npm run new-project

# Manual setup
mkdir projects/my-new-project
cp -r projects/template/* projects/my-new-project/
```

### Testing and Validation
- Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- Validate responsive design on different screen sizes
- Check financial calculations for accuracy
- Test API error handling and fallback scenarios
- Verify accessibility compliance
- Test performance with large datasets

## Repository-Specific Best Practices

### Financial Data Accuracy
- Always format currency values using `Format.currency()`
- Validate numerical inputs with `Validate.number()`
- Use proper rounding for financial calculations
- Handle edge cases (market closed, invalid symbols, API errors)
- Cache data appropriately to reduce API calls

### User Experience
- Provide loading states for data fetching
- Show clear error messages for failed operations
- Implement progressive loading for large datasets
- Use debouncing for search functionality
- Maintain responsive design for mobile users

### Security Considerations
- Never expose API keys in client-side code
- Validate all user inputs
- Sanitize data before displaying
- Use HTTPS for all API communications
- Implement proper CORS handling

### Performance
- Minimize API requests through intelligent caching
- Use requestAnimationFrame for smooth animations
- Implement virtual scrolling for large lists
- Optimize images and assets
- Bundle and minify code for production

## Integration with Existing Codebase

When working with this repository:

1. **Always use shared utilities** from `shared/js/utils.js`
2. **Follow the established CSS architecture** with custom properties and BEM
3. **Maintain the project structure** outlined in the template
4. **Test financial calculations** thoroughly
5. **Document API integrations** clearly
6. **Handle errors gracefully** with user-friendly messages
7. **Respect rate limits** of financial APIs
8. **Maintain accessibility** standards for financial applications

This repository is specifically designed for professional financial web applications. Focus on reliability, accuracy, and user experience when suggesting code improvements or new features.