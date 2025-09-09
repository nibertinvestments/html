// Stock Market Directory - Enhanced Interactive Charts
// Professional JavaScript for real-time stock market data

// Configuration
const CONFIG = {
    proxyUrl: 'https://api.allorigins.win/raw?url=',
    updateInterval: 60000, // 1 minute
    chartColors: {
        positive: '#22c55e',
        negative: '#ef4444',
        neutral: '#6b7280',
        background: 'rgba(196, 30, 58, 0.1)',
        grid: '#e2e8f0'
    },
    animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
    }
};

// Global variables
let updateInterval = null;
let activeCharts = new Map();

// Major market indexes configuration
const majorIndexes = [
    { symbol: '^NYA', name: 'NYSE Composite' },
    { symbol: '^IXIC', name: 'NASDAQ Composite' },
    { symbol: '^GSPC', name: 'S&P 500' },
    { symbol: '^DJI', name: 'Dow Jones Industrial Average' },
    { symbol: '^RUT', name: 'Russell 2000' },
    { symbol: '^VIX', name: 'CBOE Volatility Index' }
];

// Time range configurations
const timeRanges = [
    { label: '1D', range: '1d', interval: '5m' },
    { label: '10D', range: '10d', interval: '1h' },
    { label: '1M', range: '1mo', interval: '1d' },
    { label: '3M', range: '3mo', interval: '1d' },
    { label: '6M', range: '6mo', interval: '1wk' },
    { label: '1Y', range: '1y', interval: '1wk' },
    { label: '5Y', range: '5y', interval: '1mo' },
    { label: 'Max', range: 'max', interval: '1mo' }
];

// Utility functions
function sanitizeId(symbol) {
    return symbol.replace(/[^a-zA-Z0-9]/g, '_');
}

function isMarketOpen() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hour * 60 + minutes;
    
    // Market hours: Monday-Friday, 9:30 AM - 4:00 PM EST
    const marketOpen = 9 * 60 + 30; // 9:30 AM
    const marketClose = 16 * 60; // 4:00 PM
    
    return day >= 1 && day <= 5 && currentTime >= marketOpen && currentTime <= marketClose;
}

function formatNumber(num, decimals = 2) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

function formatLargeNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
}

// Enhanced error handling
class StockDataError extends Error {
    constructor(message, code, symbol) {
        super(message);
        this.name = 'StockDataError';
        this.code = code;
        this.symbol = symbol;
    }
}

// Enhanced data fetching with retry logic
async function fetchChartData(symbol, range = '1d', interval = '5m', retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
            const response = await fetch(CONFIG.proxyUrl + encodeURIComponent(yahooUrl));
            
            if (!response.ok) {
                if (response.status === 429) {
                    throw new StockDataError('Rate limit exceeded', 'RATE_LIMIT', symbol);
                }
                throw new StockDataError(`HTTP ${response.status}`, 'HTTP_ERROR', symbol);
            }
            
            const data = await response.json();
            const chartData = JSON.parse(data.contents).chart.result[0];
            
            if (!chartData || !chartData.timestamp) {
                throw new StockDataError('No chart data available', 'NO_DATA', symbol);
            }
            
            return processChartData(chartData, range);
            
        } catch (error) {
            console.error(`Attempt ${attempt} failed for ${symbol}:`, error.message);
            
            if (attempt === retries) {
                throw error;
            }
            
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
}

// Enhanced data processing
function processChartData(chartData, range) {
    const timestamps = chartData.timestamp.map(ts => {
        const date = new Date(ts * 1000);
        if (range === '1d' || range === '10d') {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (range === '1mo' || range === '3mo') {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } else {
            return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
        }
    });
    
    const quote = chartData.indicators.quote[0];
    const meta = chartData.meta;
    
    // Filter out null values and ensure data integrity
    const validData = quote.close
        .map((close, index) => ({
            close,
            high: quote.high[index],
            low: quote.low[index],
            volume: quote.volume[index],
            timestamp: timestamps[index]
        }))
        .filter(item => item.close !== null);
    
    if (!validData.length) {
        throw new StockDataError('No valid price data', 'INVALID_DATA', meta.symbol);
    }
    
    const closes = validData.map(item => item.close);
    const highs = validData.map(item => item.high).filter(h => h !== null);
    const lows = validData.map(item => item.low).filter(l => l !== null);
    const volumes = validData.map(item => item.volume || 0);
    
    const latestClose = meta.regularMarketPrice || closes[closes.length - 1];
    const firstClose = closes[0];
    const pointChange = latestClose - firstClose;
    const percentChange = (pointChange / firstClose) * 100;
    
    return {
        timestamps: validData.map(item => item.timestamp),
        closes,
        highs,
        lows,
        volumes,
        high: Math.max(...highs),
        low: Math.min(...lows),
        volume: volumes.reduce((a, b) => a + b, 0),
        latestClose,
        pointChange,
        percentChange,
        meta: {
            symbol: meta.symbol,
            currency: meta.currency || 'USD',
            exchangeName: meta.exchangeName || 'Unknown',
            instrumentType: meta.instrumentType || 'EQUITY'
        }
    };
}

// Enhanced index box updates with loading states
async function updateIndexBox() {
    const list = document.getElementById('indexList');
    list.innerHTML = '<li class="loading-item">Loading market data...</li>';
    
    try {
        const indexData = await Promise.allSettled(
            majorIndexes.map(index => 
                fetchChartData(index.symbol, '1d', '5m')
                    .then(data => ({ ...data, name: index.name, symbol: index.symbol }))
            )
        );
        
        list.innerHTML = '';
        
        indexData.forEach((result, i) => {
            const li = document.createElement('li');
            
            if (result.status === 'fulfilled') {
                const data = result.value;
                const changeColorClass = data.pointChange >= 0 ? 'change-positive' : 'change-negative';
                const changeSymbol = data.pointChange >= 0 ? '+' : '';
                
                li.innerHTML = `
                    <div class="index-name">${data.name}</div>
                    <div class="index-price">$${formatNumber(data.latestClose)}</div>
                    <div class="index-change ${changeColorClass}">
                        ${changeSymbol}${formatNumber(data.pointChange)} 
                        (${changeSymbol}${formatNumber(data.percentChange)}%)
                    </div>
                `;
                
                // Add click handler for detailed view
                li.addEventListener('click', () => {
                    swapToMainChart(data.symbol, data.name, '1d');
                });
                li.style.cursor = 'pointer';
                
            } else {
                li.innerHTML = `
                    <div class="index-name">${majorIndexes[i].name}</div>
                    <div class="index-error">Data unavailable</div>
                `;
                li.classList.add('error-item');
            }
            
            list.appendChild(li);
        });
        
    } catch (error) {
        list.innerHTML = '<li class="error-item">Failed to load market data</li>';
        console.error('Failed to update index box:', error);
    }
}

// Enhanced chart rendering with better styling
function renderChart(symbol, container, title, timestamps, data, activeRange = '1d', isMain = false) {
    const sanitizedSymbol = sanitizeId(symbol);
    const card = document.createElement('article');
    card.className = isMain ? 'main-chart' : 'chart-card';
    card.id = `chart-container-${sanitizedSymbol}`;
    
    const changeColorClass = data.pointChange >= 0 ? 'change-positive' : 'change-negative';
    const changeSymbol = data.pointChange >= 0 ? '+' : '';
    
    card.innerHTML = `
        <div class="chart-header">
            <h2>${title}</h2>
            <div class="chart-meta">
                ${data.meta ? `${data.meta.exchangeName} • ${data.meta.currency}` : ''}
            </div>
        </div>
        <div class="stats">
            <div class="stat-item">
                <span class="stat-label">Latest:</span>
                <span class="stat-value">$${formatNumber(data.latestClose)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Change:</span>
                <span class="stat-value ${changeColorClass}">
                    ${changeSymbol}${formatNumber(data.pointChange)} 
                    (${changeSymbol}${formatNumber(data.percentChange)}%)
                </span>
            </div>
            <div class="stat-item">
                <span class="stat-label">High:</span>
                <span class="stat-value">$${formatNumber(data.high)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Low:</span>
                <span class="stat-value">$${formatNumber(data.low)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Volume:</span>
                <span class="stat-value">${formatLargeNumber(data.volume)}</span>
            </div>
        </div>
        <div class="time-range" id="range-${sanitizedSymbol}"></div>
        <div class="chart-wrapper">
            <div class="loader" id="loader-${sanitizedSymbol}"></div>
            <canvas id="chart-${sanitizedSymbol}" style="display: none;"></canvas>
        </div>
    `;
    
    container.appendChild(card);
    
    // Add time range buttons
    const rangeContainer = card.querySelector(`#range-${sanitizedSymbol}`);
    timeRanges.forEach(range => {
        const btn = document.createElement('button');
        btn.textContent = range.label;
        btn.className = range.range === activeRange ? 'active' : '';
        btn.onclick = () => updateChart(symbol, container, title, range.range, range.interval, isMain);
        rangeContainer.appendChild(btn);
    });
    
    // Add click handler for non-main charts
    if (!isMain) {
        card.onclick = (e) => {
            if (!e.target.closest('.time-range')) {
                swapToMainChart(symbol, title, activeRange);
            }
        };
    }
    
    // Render the actual chart
    return renderChartCanvas(sanitizedSymbol, timestamps, data, isMain);
}

// Enhanced chart canvas rendering
function renderChartCanvas(sanitizedSymbol, timestamps, data, isMain) {
    const loader = document.getElementById(`loader-${sanitizedSymbol}`);
    const canvas = document.getElementById(`chart-${sanitizedSymbol}`);
    
    if (!canvas || !loader) return null;
    
    loader.style.display = 'none';
    canvas.style.display = 'block';
    
    try {
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (activeCharts.has(sanitizedSymbol)) {
            activeCharts.get(sanitizedSymbol).destroy();
        }
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, data.pointChange >= 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timestamps,
                datasets: [{
                    label: `Price ($)`,
                    data: data.closes,
                    borderColor: data.pointChange >= 0 ? CONFIG.chartColors.positive : CONFIG.chartColors.negative,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: data.pointChange >= 0 ? CONFIG.chartColors.positive : CONFIG.chartColors.negative,
                    pointHoverBorderWidth: 2,
                    borderWidth: isMain ? 3 : 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: CONFIG.animation.duration,
                    easing: CONFIG.animation.easing
                },
                scales: {
                    x: {
                        display: true,
                        ticks: {
                            color: '#6b7280',
                            maxTicksLimit: isMain ? 12 : 8,
                            maxRotation: 0,
                            minRotation: 0,
                            font: { size: isMain ? 12 : 10 }
                        },
                        grid: { 
                            color: CONFIG.chartColors.grid,
                            display: true
                        }
                    },
                    y: {
                        display: true,
                        position: 'right',
                        ticks: { 
                            color: '#6b7280', 
                            font: { size: isMain ? 12 : 10 },
                            callback: function(value) {
                                return '$' + formatNumber(value);
                            }
                        },
                        grid: { 
                            color: CONFIG.chartColors.grid,
                            display: true
                        }
                    }
                },
                plugins: {
                    legend: { 
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: data.pointChange >= 0 ? CONFIG.chartColors.positive : CONFIG.chartColors.negative,
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `Price: $${formatNumber(context.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });
        
        activeCharts.set(sanitizedSymbol, chart);
        return chart;
        
    } catch (error) {
        console.error(`Chart render error for ${sanitizedSymbol}:`, error.message);
        canvas.style.display = 'none';
        loader.innerHTML = `<p class="error-message">Chart failed to render</p>`;
        loader.style.display = 'block';
        return null;
    }
}

// Enhanced chart updating with smooth transitions
async function updateChart(symbol, container, title, range, interval, isMain = false) {
    const sanitizedSymbol = sanitizeId(symbol);
    
    // Show loading state
    const existingCard = document.getElementById(`chart-container-${sanitizedSymbol}`);
    if (existingCard) {
        const loader = existingCard.querySelector('.loader');
        const canvas = existingCard.querySelector('canvas');
        if (loader && canvas) {
            loader.style.display = 'block';
            canvas.style.display = 'none';
        }
    }
    
    try {
        const data = await fetchChartData(symbol, range, interval);
        
        // Clear container and render new chart
        container.innerHTML = '';
        const chart = renderChart(symbol, container, title, data.timestamps, data, range, isMain);
        
        if (!chart) return;
        
        // Set up real-time updates for 1D range
        if (range === '1d' && isMarketOpen()) {
            setupRealTimeUpdates(symbol, chart, container);
        } else {
            clearRealTimeUpdates();
        }
        
    } catch (error) {
        console.error(`Failed to update chart for ${symbol}:`, error);
        container.innerHTML = `
            <div class="chart-card error-card">
                <h2>${title}</h2>
                <p class="error-message">Chart unavailable: ${error.message}</p>
                <button onclick="updateChart('${symbol}', document.getElementById('${container.id}'), '${title}', '${range}', '${interval}', ${isMain})" class="retry-btn">
                    Retry
                </button>
            </div>
        `;
    }
}

// Real-time updates management
function setupRealTimeUpdates(symbol, chart, container) {
    clearRealTimeUpdates();
    
    updateInterval = setInterval(async () => {
        try {
            const newData = await fetchChartData(symbol, '1d', '5m');
            
            // Update chart data
            chart.data.labels = newData.timestamps;
            chart.data.datasets[0].data = newData.closes;
            chart.data.datasets[0].borderColor = newData.pointChange >= 0 ? CONFIG.chartColors.positive : CONFIG.chartColors.negative;
            chart.update('active');
            
            // Update stats
            updateStatsDisplay(container, newData);
            
            // Update index box
            updateIndexBox();
            
        } catch (error) {
            console.error(`Real-time update failed for ${symbol}:`, error.message);
        }
    }, CONFIG.updateInterval);
}

function clearRealTimeUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

function updateStatsDisplay(container, data) {
    const stats = container.querySelector('.stats');
    if (!stats) return;
    
    const changeColorClass = data.pointChange >= 0 ? 'change-positive' : 'change-negative';
    const changeSymbol = data.pointChange >= 0 ? '+' : '';
    
    stats.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Latest:</span>
            <span class="stat-value">$${formatNumber(data.latestClose)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Change:</span>
            <span class="stat-value ${changeColorClass}">
                ${changeSymbol}${formatNumber(data.pointChange)} 
                (${changeSymbol}${formatNumber(data.percentChange)}%)
            </span>
        </div>
        <div class="stat-item">
            <span class="stat-label">High:</span>
            <span class="stat-value">$${formatNumber(data.high)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Low:</span>
            <span class="stat-value">$${formatNumber(data.low)}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Volume:</span>
            <span class="stat-value">${formatLargeNumber(data.volume)}</span>
        </div>
    `;
}

// Main chart swapping
async function swapToMainChart(symbol, title, range) {
    const mainContainer = document.getElementById('mainChart');
    mainContainer.innerHTML = '<div class="loader"></div>';
    
    await updateChart(symbol, mainContainer, title, range, timeRanges.find(r => r.range === range).interval, true);
    await loadSmallCharts(symbol);
}

// Load small charts (excluding the main one)
async function loadSmallCharts(excludeSymbol = '^NYA') {
    const container = document.getElementById('charts');
    container.innerHTML = '<div class="loading-message">Loading charts...</div>';
    
    const filteredIndexes = majorIndexes.filter(index => index.symbol !== excludeSymbol);
    
    try {
        const chartPromises = filteredIndexes.map(index => 
            fetchAndRenderChart(index.symbol, index.name, '1d', '5m', false)
        );
        
        const chartResults = await Promise.allSettled(chartPromises);
        
        container.innerHTML = '';
        
        chartResults.forEach((result, i) => {
            if (result.status === 'fulfilled') {
                container.appendChild(result.value);
            } else {
                const errorCard = document.createElement('div');
                errorCard.className = 'chart-card error-card';
                errorCard.innerHTML = `
                    <h2>${filteredIndexes[i].name}</h2>
                    <p class="error-message">Chart unavailable</p>
                `;
                container.appendChild(errorCard);
            }
        });
        
    } catch (error) {
        container.innerHTML = '<div class="error-message">Failed to load charts</div>';
        console.error('Failed to load small charts:', error);
    }
}

// Helper function for chart rendering
async function fetchAndRenderChart(symbol, title, range = '1d', interval = '5m', isMain = false) {
    try {
        const data = await fetchChartData(symbol, range, interval);
        const tempContainer = document.createElement('div');
        renderChart(symbol, tempContainer, title, data.timestamps, data, range, isMain);
        return tempContainer.firstChild;
    } catch (error) {
        throw new StockDataError(`Failed to render ${title}`, 'RENDER_ERROR', symbol);
    }
}

// Enhanced stock search
async function searchStock() {
    const input = document.getElementById('searchInput');
    const symbol = input.value.trim().toUpperCase();
    
    if (!symbol) {
        showSearchError('Please enter a stock symbol');
        return;
    }
    
    // Show loading state
    const searchResult = document.getElementById('searchResult');
    searchResult.innerHTML = '<div class="loader"></div>';
    
    try {
        await swapToMainChart(symbol, `${symbol} Chart`, '1d');
        input.value = '';
        searchResult.innerHTML = '';
    } catch (error) {
        showSearchError(`Failed to load ${symbol}: ${error.message}`);
    }
}

function showSearchError(message) {
    const searchResult = document.getElementById('searchResult');
    searchResult.innerHTML = `
        <div class="search-error">
            <p>${message}</p>
        </div>
    `;
    setTimeout(() => {
        searchResult.innerHTML = '';
    }, 3000);
}

// Initialize the application
async function loadInitialCharts() {
    try {
        // Load main chart (NYSE Composite)
        const mainContainer = document.getElementById('mainChart');
        await updateChart('^NYA', mainContainer, 'NYSE Composite', '1d', '5m', true);
        
        // Load other charts
        await loadSmallCharts('^NYA');
        
        // Update index box
        await updateIndexBox();
        
        console.log('Stock Market Directory loaded successfully');
        
    } catch (error) {
        console.error('Failed to load initial charts:', error);
        
        // Show fallback content
        const mainContainer = document.getElementById('mainChart');
        mainContainer.innerHTML = `
            <div class="error-card">
                <h2>Welcome to Stock Market Directory</h2>
                <p>Unable to load initial charts. Please try refreshing the page or search for a specific stock symbol.</p>
            </div>
        `;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize charts
    loadInitialCharts();
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchStock();
            }
        });
        
        // Clear search results when input is cleared
        searchInput.addEventListener('input', (e) => {
            if (!e.target.value.trim()) {
                document.getElementById('searchResult').innerHTML = '';
            }
        });
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        clearRealTimeUpdates();
        activeCharts.forEach(chart => chart.destroy());
    });
});

// Export for global access
window.stockMarketApp = {
    searchStock,
    updateChart,
    swapToMainChart,
    CONFIG
};