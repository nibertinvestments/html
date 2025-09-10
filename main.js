// Stock Market Directory - Real-time data from Polygon.io
// No fake data - only real market data

'use strict';

// Configuration
const CONFIG = {
    POLYGON_API_KEY: '8tJpGlsLeSouJEH7LN7Ltpc_HWQb10EJ',
    POLYGON_BASE_URL: 'https://api.polygon.io',
    S3_ENDPOINT: 'https://files.polygon.io',
    S3_BUCKET: 'flatfiles',
    S3_ACCESS_KEY: '4766cbb6-69a1-4309-af8b-7463694bfa0c',
    S3_SECRET: '8tJpGlsLeSouJEH7LN7Ltpc_HWQb10EJ',
    DEFAULT_SYMBOL: 'SPY',
    CACHE_DURATION: 60000, // 1 minute cache
    UPDATE_INTERVAL: 30000  // Update every 30 seconds
};

// Application state
const STATE = {
    currentSymbol: CONFIG.DEFAULT_SYMBOL,
    currentTimeRange: 365,
    chart: null,
    cache: new Map(),
    isMarketOpen: false,
    lastUpdate: null
};

// Stock Market Directory Application
class StockMarketDirectory {
    constructor() {
        this.initializeEventListeners();
        this.initializeChart();
        this.loadDefaultData();
        this.startPeriodicUpdates();
        this.checkMarketStatus();
    }

    // Initialize event listeners
    initializeEventListeners() {
        const searchBtn = document.getElementById('search-btn');
        const stockSymbol = document.getElementById('stock-symbol');
        const timeRange = document.getElementById('time-range');

        searchBtn?.addEventListener('click', () => this.searchStock());
        stockSymbol?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchStock();
        });
        timeRange?.addEventListener('change', () => this.updateTimeRange());

        // Index card clicks
        document.querySelectorAll('.index-card').forEach(card => {
            card.addEventListener('click', () => {
                const symbol = card.dataset.symbol;
                if (symbol) {
                    this.loadStockData(symbol);
                }
            });
        });
    }

    // Initialize Chart.js chart
    initializeChart() {
        const canvas = document.getElementById('stock-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        STATE.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Price',
                    data: [],
                    borderColor: '#45aaf2',
                    backgroundColor: 'rgba(69, 170, 242, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
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
                        grid: {
                            color: '#2d3748'
                        },
                        ticks: {
                            color: '#b8c5d6'
                        }
                    },
                    y: {
                        grid: {
                            color: '#2d3748'
                        },
                        ticks: {
                            color: '#b8c5d6',
                            callback: function(value) {
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
    }

    // Load default data (SPY)
    async loadDefaultData() {
        await this.loadStockData(CONFIG.DEFAULT_SYMBOL);
        await this.loadMarketIndices();
    }

    // Search for stock
    async searchStock() {
        const symbolInput = document.getElementById('stock-symbol');
        const symbol = symbolInput?.value?.trim()?.toUpperCase();
        
        if (!symbol) {
            this.showError('Please enter a stock symbol');
            return;
        }

        await this.loadStockData(symbol);
        symbolInput.value = '';
    }

    // Update time range
    async updateTimeRange() {
        const timeRange = document.getElementById('time-range');
        const days = parseInt(timeRange?.value) || 365;
        STATE.currentTimeRange = days;
        await this.loadHistoricalData(STATE.currentSymbol, days);
    }

    // Load stock data (quote + historical)
    async loadStockData(symbol) {
        try {
            this.showLoading(true);
            STATE.currentSymbol = symbol;
            
            // Update title
            const chartTitle = document.getElementById('chart-title');
            if (chartTitle) {
                chartTitle.textContent = `${symbol} - Loading...`;
            }

            // Load current quote and historical data in parallel
            const [quote, historical] = await Promise.all([
                this.getStockQuote(symbol),
                this.loadHistoricalData(symbol, STATE.currentTimeRange)
            ]);

            if (quote) {
                this.updateStockInfo(symbol, quote);
            }

        } catch (error) {
            console.error('Error loading stock data:', error);
            this.showError(`Failed to load data for ${symbol}. Please try again.`);
        } finally {
            this.showLoading(false);
        }
    }

    // Get real-time stock quote from Polygon.io
    async getStockQuote(symbol) {
        const cacheKey = `quote_${symbol}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            // Get current quote
            const quoteUrl = `${CONFIG.POLYGON_BASE_URL}/v2/aggs/ticker/${symbol}/prev?apikey=${CONFIG.POLYGON_API_KEY}`;
            const quoteResponse = await fetch(quoteUrl);
            
            if (!quoteResponse.ok) {
                throw new Error(`Quote API error: ${quoteResponse.status}`);
            }
            
            const quoteData = await quoteResponse.json();
            
            if (quoteData.status === 'OK' && quoteData.results && quoteData.results.length > 0) {
                const result = quoteData.results[0];
                
                // Get additional ticker details
                const detailsUrl = `${CONFIG.POLYGON_BASE_URL}/v3/reference/tickers/${symbol}?apikey=${CONFIG.POLYGON_API_KEY}`;
                const detailsResponse = await fetch(detailsUrl);
                let details = {};
                
                if (detailsResponse.ok) {
                    const detailsData = await detailsResponse.json();
                    if (detailsData.status === 'OK' && detailsData.results) {
                        details = detailsData.results;
                    }
                }

                const quote = {
                    symbol: symbol,
                    price: result.c, // close price
                    change: result.c - result.o, // change from open
                    changePercent: ((result.c - result.o) / result.o) * 100,
                    volume: result.v,
                    high: result.h,
                    low: result.l,
                    open: result.o,
                    marketCap: details.market_cap || null,
                    name: details.name || symbol
                };

                this.setCachedData(cacheKey, quote);
                return quote;
            } else {
                throw new Error('No quote data available');
            }
        } catch (error) {
            console.error('Error fetching quote:', error);
            // Try to get data from S3 as fallback
            return await this.getS3FallbackData(symbol);
        }
    }

    // Load historical data from Polygon.io
    async loadHistoricalData(symbol, days = 365) {
        const cacheKey = `historical_${symbol}_${days}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) {
            this.updateChart(cached);
            return cached;
        }

        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const multiplier = days <= 7 ? 1 : days <= 30 ? 1 : days <= 365 ? 1 : 1;
            const timespan = days <= 7 ? 'hour' : days <= 30 ? 'day' : 'day';
            
            const formatDate = (date) => date.toISOString().split('T')[0];
            
            const url = `${CONFIG.POLYGON_BASE_URL}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${formatDate(startDate)}/${formatDate(endDate)}?adjusted=true&sort=asc&apikey=${CONFIG.POLYGON_API_KEY}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Historical data API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'OK' && data.results && data.results.length > 0) {
                const chartData = data.results.map(item => ({
                    date: new Date(item.t),
                    price: item.c // closing price
                }));

                this.setCachedData(cacheKey, chartData);
                this.updateChart(chartData);
                return chartData;
            } else {
                throw new Error('No historical data available');
            }
        } catch (error) {
            console.error('Error fetching historical data:', error);
            // Try S3 fallback
            return await this.getS3HistoricalFallback(symbol, days);
        }
    }

    // Update chart with historical data
    updateChart(data) {
        if (!STATE.chart || !data || data.length === 0) return;

        const labels = data.map(item => {
            const date = new Date(item.date);
            if (STATE.currentTimeRange <= 7) {
                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            } else if (STATE.currentTimeRange <= 30) {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else {
                return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            }
        });

        const prices = data.map(item => item.price);

        // Determine color based on price movement
        const firstPrice = prices[0];
        const lastPrice = prices[prices.length - 1];
        const isPositive = lastPrice >= firstPrice;
        
        const color = isPositive ? '#26de81' : '#fc5c65';
        const backgroundColor = isPositive ? 'rgba(38, 222, 129, 0.1)' : 'rgba(252, 92, 101, 0.1)';

        STATE.chart.data.labels = labels;
        STATE.chart.data.datasets[0].data = prices;
        STATE.chart.data.datasets[0].borderColor = color;
        STATE.chart.data.datasets[0].backgroundColor = backgroundColor;
        STATE.chart.update('none');
    }

    // Update stock information display
    updateStockInfo(symbol, quote) {
        // Update title
        const chartTitle = document.getElementById('chart-title');
        if (chartTitle) {
            chartTitle.textContent = `${quote.name || symbol} (${symbol})`;
        }

        // Update current price
        const currentPrice = document.getElementById('current-price');
        if (currentPrice && quote.price) {
            currentPrice.textContent = `$${quote.price.toFixed(2)}`;
        }

        // Update price change
        const priceChange = document.getElementById('price-change');
        if (priceChange && quote.change !== undefined) {
            const changeText = `${quote.change >= 0 ? '+' : ''}$${quote.change.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`;
            priceChange.textContent = changeText;
            priceChange.className = `price-change ${quote.change >= 0 ? 'positive' : 'negative'}`;
        }

        // Update volume
        const volume = document.getElementById('volume');
        if (volume && quote.volume) {
            volume.textContent = this.formatNumber(quote.volume);
        }

        // Update market cap
        const marketCap = document.getElementById('market-cap');
        if (marketCap && quote.marketCap) {
            marketCap.textContent = this.formatCurrency(quote.marketCap);
        }

        // Update high/low (52-week data would need separate API call)
        const high52w = document.getElementById('high-52w');
        const low52w = document.getElementById('low-52w');
        if (high52w && quote.high) high52w.textContent = `$${quote.high.toFixed(2)}`;
        if (low52w && quote.low) low52w.textContent = `$${quote.low.toFixed(2)}`;
    }

    // Load market indices
    async loadMarketIndices() {
        const indices = ['SPY', 'DIA', 'QQQ'];
        
        for (const symbol of indices) {
            try {
                const quote = await this.getStockQuote(symbol);
                if (quote) {
                    this.updateIndexCard(symbol, quote);
                }
            } catch (error) {
                console.error(`Error loading ${symbol}:`, error);
            }
        }
    }

    // Update index card
    updateIndexCard(symbol, quote) {
        const card = document.querySelector(`[data-symbol="${symbol}"]`);
        if (!card) return;

        const priceElement = card.querySelector('.index-price');
        const changeElement = card.querySelector('.index-change');

        if (priceElement && quote.price) {
            priceElement.textContent = `$${quote.price.toFixed(2)}`;
        }

        if (changeElement && quote.change !== undefined) {
            const changeText = `${quote.change >= 0 ? '+' : ''}$${quote.change.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`;
            changeElement.textContent = changeText;
            changeElement.className = `index-change ${quote.change >= 0 ? 'positive' : 'negative'}`;
        }
    }

    // S3 fallback data (when API fails)
    async getS3FallbackData(symbol) {
        try {
            // This would require proper S3 authentication setup
            // For now, return null and handle gracefully
            console.warn(`S3 fallback not implemented for ${symbol}`);
            return null;
        } catch (error) {
            console.error('S3 fallback failed:', error);
            return null;
        }
    }

    // S3 historical fallback
    async getS3HistoricalFallback(symbol, days) {
        try {
            console.warn(`S3 historical fallback not implemented for ${symbol}`);
            return [];
        } catch (error) {
            console.error('S3 historical fallback failed:', error);
            return [];
        }
    }

    // Check if market is open
    checkMarketStatus() {
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 6 = Saturday
        const hour = now.getHours();
        
        // Market is open Monday-Friday, 9:30 AM - 4:00 PM EST
        const isWeekday = day >= 1 && day <= 5;
        const isMarketHours = hour >= 9 && hour < 16; // Simplified
        
        STATE.isMarketOpen = isWeekday && isMarketHours;
        
        const statusElement = document.getElementById('market-status');
        if (statusElement) {
            statusElement.textContent = STATE.isMarketOpen ? 'Market Open' : 'Market Closed';
            statusElement.className = `market-status ${STATE.isMarketOpen ? 'open' : ''}`;
        }
    }

    // Start periodic updates
    startPeriodicUpdates() {
        setInterval(() => {
            this.checkMarketStatus();
            if (STATE.isMarketOpen) {
                this.loadStockData(STATE.currentSymbol);
                this.loadMarketIndices();
            }
        }, CONFIG.UPDATE_INTERVAL);
    }

    // Cache management
    getCachedData(key) {
        const cached = STATE.cache.get(key);
        if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        STATE.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    // Utility functions
    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toString();
    }

    formatCurrency(amount) {
        if (amount >= 1e12) return `$${(amount / 1e12).toFixed(2)}T`;
        if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
        if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
        return `$${amount.toLocaleString()}`;
    }

    showLoading(show) {
        const elements = document.querySelectorAll('.loading-target');
        elements.forEach(el => {
            if (show) {
                el.classList.add('loading');
            } else {
                el.classList.remove('loading');
            }
        });
    }

    showError(message) {
        // Remove existing errors
        document.querySelectorAll('.error').forEach(el => el.remove());
        
        // Create and show new error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        
        const container = document.querySelector('.chart-display .container');
        if (container) {
            container.insertBefore(errorDiv, container.firstChild);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StockMarketDirectory();
});

// Handle errors gracefully
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
});

// Export for debugging
window.StockMarketDirectory = StockMarketDirectory;