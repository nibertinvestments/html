// Stock Market Directory JavaScript

// Configuration
const UPDATE_INTERVAL = 60000; // 60 seconds (reduced to respect rate limits)
const DEFAULT_SYMBOL = 'SPY'; // S&P 500 ETF as default (more reliable than index)
const USE_POLYGON_API = true; // Using polygon.io API

// Global variables
let currentChart = null;
let currentSymbol = DEFAULT_SYMBOL;
let updateTimer = null;

document.addEventListener('DOMContentLoaded', function () {
    console.log('Stock Market Directory loaded successfully!');

    // Initialize application
    initializeStockSearch();
    initializeChart();
    initializeContactForm();
    initializeMarketIndices();
    initializeAutoUpdates();

    // Load default chart (NYSE)
    loadStockData(DEFAULT_SYMBOL);
});

/**
 * Initialize stock search functionality
 */
function initializeStockSearch() {
    const searchInput = DOM.$('#stockSymbol');
    const searchBtn = DOM.$('#searchBtn');
    const suggestions = DOM.$('#searchSuggestions');

    if (!searchInput || !searchBtn) return;

    // Search button click
    DOM.on(searchBtn, 'click', function () {
        const symbol = searchInput.value.trim().toUpperCase();
        if (symbol) {
            loadStockData(symbol);
            suggestions.style.display = 'none';
        }
    });

    // Enter key search
    DOM.on(searchInput, 'keypress', function (e) {
        if (e.key === 'Enter') {
            const symbol = this.value.trim().toUpperCase();
            if (symbol) {
                loadStockData(symbol);
                suggestions.style.display = 'none';
            }
        }
    });

    // Real-time search suggestions (debounced)
    let searchTimeout;
    DOM.on(searchInput, 'input', function () {
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        if (query.length < 1) {
            suggestions.style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(() => {
            searchStockSymbols(query);
        }, 300);
    });

    // Hide suggestions when clicking outside
    DOM.on(document, 'click', function (e) {
        if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.style.display = 'none';
        }
    });
}

/**
 * Search for stock symbols
 */
async function searchStockSymbols(query) {
    try {
        let data;
        if (USE_POLYGON_API && window.PolygonAPI) {
            data = await window.PolygonAPI.searchStocks(query);
        } else {
            // Fallback: return empty suggestions
            data = { suggestions: [] };
        }

        const suggestions = DOM.$('#searchSuggestions');
        suggestions.innerHTML = '';

        if (data.suggestions && data.suggestions.length > 0) {
            data.suggestions.forEach(suggestion => {
                const item = DOM.create('div', { className: 'suggestion-item' });
                item.innerHTML = `
                    <strong>${suggestion.symbol}</strong> - ${suggestion.name}
                    <br><small>${suggestion.exchange}</small>
                `;

                DOM.on(item, 'click', function () {
                    DOM.$('#stockSymbol').value = suggestion.symbol;
                    loadStockData(suggestion.symbol);
                    suggestions.style.display = 'none';
                });

                suggestions.appendChild(item);
            });

            suggestions.style.display = 'block';
        } else {
            suggestions.style.display = 'none';
        }
    } catch (error) {
        console.error('Error searching stocks:', error);
        showError('Stock search temporarily unavailable. Please try again later.');
    }
}

/**
 * Load stock data and update display
 */
async function loadStockData(symbol) {
    try {
        showLoadingState();
        currentSymbol = symbol;

        // Fetch stock data
        const [stockData, chartData] = await Promise.all([
            fetchStockData(symbol),
            fetchChartData(symbol, DOM.$('#timeRange')?.value || '1y')
        ]);

        if (stockData && chartData) {
            updateStockDisplay(stockData);
            updateChart(chartData);
            updateTitle(stockData);
        }
    } catch (error) {
        console.error('Error loading stock data:', error);
        showError(`Failed to load data for ${symbol}`);
    }
}

/**
 * Fetch stock data from API
 */
async function fetchStockData(symbol) {
    try {
        if (USE_POLYGON_API && window.PolygonAPI) {
            return await window.PolygonAPI.getStockData(symbol);
        } else {
            throw new Error('API not available');
        }
    } catch (error) {
        console.error(`Error fetching stock data for ${symbol}:`, error);
        if (error.message.includes('Rate limit')) {
            showError(error.message);
        } else {
            showError(`Unable to load data for ${symbol}. Please try again later.`);
        }
        return null;
    }
}

/**
 * Fetch chart data from API
 */
async function fetchChartData(symbol, period = '1y') {
    try {
        if (USE_POLYGON_API && window.PolygonAPI) {
            return await window.PolygonAPI.getChartData(symbol, period);
        } else {
            throw new Error('API not available');
        }
    } catch (error) {
        console.error(`Error fetching chart data for ${symbol}:`, error);
        if (error.message.includes('Rate limit')) {
            showError(error.message);
        } else {
            showError(`Unable to load chart data for ${symbol}. Please try again later.`);
        }
        return null;
    }
}

/**
 * Update stock price display
 */
function updateStockDisplay(stockData) {
    // Update current price
    const priceElement = DOM.$('#currentPrice');
    const changeElement = DOM.$('#priceChange');
    const statusElement = DOM.$('#marketStatus');

    if (priceElement) {
        priceElement.textContent = `$${stockData.current_price}`;
    }

    if (changeElement) {
        const changeText = `${stockData.change >= 0 ? '+' : ''}${stockData.change} (${stockData.change_percent.toFixed(2)}%)`;
        changeElement.textContent = changeText;
        changeElement.className = `price-change ${stockData.change >= 0 ? 'positive' : 'negative'}`;
    }

    if (statusElement) {
        statusElement.textContent = stockData.market_state || 'Market Closed';
    }

    // Update stock info
    updateStockInfo(stockData);
}

/**
 * Update stock information grid
 */
function updateStockInfo(stockData) {
    const infoMappings = {
        volume: formatNumber(stockData.volume),
        marketCap: formatMarketCap(stockData.market_cap),
        peRatio: stockData.pe_ratio ? stockData.pe_ratio.toFixed(2) : 'N/A',
        high52w: stockData.high_52w ? `$${stockData.high_52w}` : 'N/A',
        low52w: stockData.low_52w ? `$${stockData.low_52w}` : 'N/A',
        dividendYield: stockData.dividend_yield
            ? `${(stockData.dividend_yield * 100).toFixed(2)}%`
            : 'N/A'
    };

    Object.entries(infoMappings).forEach(([id, value]) => {
        const element = DOM.$(`#${id}`);
        if (element) {
            element.textContent = value;
        }
    });
}

/**
 * Update chart title
 */
function updateTitle(stockData) {
    const titleElement = DOM.$('#chartTitle');
    if (titleElement && stockData.name) {
        titleElement.textContent = `${stockData.name} (${stockData.symbol})`;
    }
}

/**
 * Initialize Chart.js chart
 */
function initializeChart() {
    const canvas = DOM.$('#stockChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Price',
                    data: [],
                    borderColor: '#C41E3A',
                    backgroundColor: 'rgba(196, 30, 58, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        color: '#333333'
                    },
                    ticks: {
                        color: '#000000'
                    }
                },
                y: {
                    display: true,
                    grid: {
                        color: '#333333'
                    },
                    ticks: {
                        color: '#000000',
                        callback: function (value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });

    // Time range selector
    const timeRange = DOM.$('#timeRange');
    if (timeRange) {
        DOM.on(timeRange, 'change', function () {
            if (currentSymbol) {
                fetchChartData(currentSymbol, this.value).then(chartData => {
                    if (chartData) updateChart(chartData);
                });
            }
        });
    }
}

/**
 * Update chart with new data
 */
function updateChart(chartData) {
    if (!currentChart || !chartData.data) return;

    const labels = chartData.data.map(point => {
        const date = new Date(point.timestamp);
        return date.toLocaleDateString();
    });

    const prices = chartData.data.map(point => point.close);

    currentChart.data.labels = labels;
    currentChart.data.datasets[0].data = prices;
    currentChart.data.datasets[0].label = `${chartData.symbol} Price`;

    currentChart.update();
}

/**
 * Initialize market indices display
 */
async function initializeMarketIndices() {
    try {
        let data;
        if (USE_POLYGON_API && window.PolygonAPI) {
            data = await window.PolygonAPI.getMarketIndices();
        } else {
            throw new Error('API not available');
        }

        // Update each index
        const indexMappings = {
            '^GSPC': { price: 'sp500Price', change: 'sp500Change' },
            '^DJI': { price: 'dowPrice', change: 'dowChange' },
            '^IXIC': { price: 'nasdaqPrice', change: 'nasdaqChange' }
        };

        Object.entries(indexMappings).forEach(([symbol, elements]) => {
            const indexData = data[symbol];
            if (indexData) {
                const priceElement = DOM.$(`#${elements.price}`);
                const changeElement = DOM.$(`#${elements.change}`);

                if (priceElement) {
                    priceElement.textContent = `$${indexData.current_price.toLocaleString()}`;
                }

                if (changeElement) {
                    const changeText = `${indexData.change >= 0 ? '+' : ''}${indexData.change.toFixed(2)} (${indexData.change_percent.toFixed(2)}%)`;
                    changeElement.textContent = changeText;
                    changeElement.className = `index-change ${indexData.change >= 0 ? 'positive' : 'negative'}`;
                }
            }
        });
    } catch (error) {
        console.error('Error loading market indices:', error);
        if (
            error.message.includes('Rate limit') ||
            error.message.includes('Not enough API calls')
        ) {
            showError('Market data update postponed due to rate limits.');
        }
    }
}

/**
 * Initialize auto-updates with rate limit awareness
 */
function initializeAutoUpdates() {
    // Update data every 60 seconds to respect rate limits
    updateTimer = setInterval(() => {
        if (USE_POLYGON_API && window.PolygonAPI) {
            const stats = window.PolygonAPI.getUsageStats();
            console.log('API Usage:', stats);

            // Only update if we have API calls remaining
            if (stats.remainingCalls > 0) {
                if (currentSymbol) {
                    loadStockData(currentSymbol);
                }
                // Skip market indices update if no calls remaining for multiple calls
                if (stats.remainingCalls >= 3) {
                    initializeMarketIndices();
                }
            } else {
                console.log('Skipping update due to rate limits');
            }
        } else {
            if (currentSymbol) {
                loadStockData(currentSymbol);
            }
            initializeMarketIndices();
        }
    }, UPDATE_INTERVAL);

    // Clear timer when page is hidden
    DOM.on(document, 'visibilitychange', function () {
        if (document.hidden) {
            clearInterval(updateTimer);
        } else {
            initializeAutoUpdates();
        }
    });
}

/**
 * Initialize contact form functionality
 */
function initializeContactForm() {
    const form = DOM.$('#contactForm');
    if (!form) return;

    const messageField = DOM.$('#message');
    const charCount = DOM.$('#charCount');

    // Character counter
    if (messageField && charCount) {
        DOM.on(messageField, 'input', function () {
            const count = this.value.length;
            charCount.textContent = count;

            if (count > 700) {
                charCount.parentNode.classList.add('warning');
            } else {
                charCount.parentNode.classList.remove('warning');
            }
        });
    }

    // Form submission
    DOM.on(form, 'submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        if (!validateContactForm(data)) {
            return;
        }

        // Show loading state
        const submitBtn = DOM.$('#submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled = true;

        try {
            // Simulate email sending (in production, this would call your email API)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Show success message
            form.style.display = 'none';
            DOM.$('#successMessage').style.display = 'block';
        } catch (error) {
            console.error('Error sending message:', error);
            showError('Failed to send message. Please try again later.');
        } finally {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}

/**
 * Validate contact form
 */
function validateContactForm(data) {
    let isValid = true;

    // Clear previous errors
    DOM.$$('.error-message').forEach(error => {
        error.classList.remove('show');
    });

    // Validate name
    if (!data.name || data.name.trim().length < 2) {
        showFieldError('nameError', 'Name must be at least 2 characters long');
        isValid = false;
    }

    // Validate email
    if (!data.email || !isValidEmail(data.email)) {
        showFieldError('emailError', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate subject
    if (!data.subject) {
        showFieldError('subjectError', 'Please select a subject');
        isValid = false;
    }

    // Validate message
    if (!data.message || data.message.trim().length < 10) {
        showFieldError('messageError', 'Message must be at least 10 characters long');
        isValid = false;
    } else if (data.message.length > 750) {
        showFieldError('messageError', 'Message cannot exceed 750 characters');
        isValid = false;
    }

    return isValid;
}

/**
 * Show field error
 */
function showFieldError(errorId, message) {
    const errorElement = DOM.$(`#${errorId}`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

/**
 * Utility functions
 */
function formatNumber(num) {
    if (!num) return 'N/A';
    return num.toLocaleString();
}

function formatMarketCap(cap) {
    if (!cap) return 'N/A';

    if (cap >= 1e12) {
        return `$${(cap / 1e12).toFixed(2)}T`;
    } else if (cap >= 1e9) {
        return `$${(cap / 1e9).toFixed(2)}B`;
    } else if (cap >= 1e6) {
        return `$${(cap / 1e6).toFixed(2)}M`;
    } else {
        return `$${cap.toLocaleString()}`;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showLoadingState() {
    const priceElement = DOM.$('#currentPrice');
    const changeElement = DOM.$('#priceChange');

    if (priceElement) priceElement.textContent = 'Loading...';
    if (changeElement) changeElement.textContent = '--';
}

function showError(message) {
    // Create and show error notification
    const errorDiv = DOM.create(
        'div',
        {
            className: 'error-notification',
            style: `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--metallic-red);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(196, 30, 58, 0.3);
        `
        },
        message
    );

    document.body.appendChild(errorDiv);

    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Clean up on page unload
window.addEventListener('beforeunload', function () {
    if (updateTimer) {
        clearInterval(updateTimer);
    }
});
