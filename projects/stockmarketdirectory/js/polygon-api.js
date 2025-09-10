// Polygon.io API integration for Stock Market Directory
// Handles all API calls with rate limiting and caching

const PolygonAPI = {
    // Configuration
    API_KEY: '8tJpGlsLeSouJEH7LN7Ltpc_HWQb10EJ',
    BASE_URL: 'https://api.polygon.io',
    RATE_LIMIT: {
        MAX_CALLS: 3,
        WINDOW_MS: 60000 // 1 minute
    },

    // Rate limiting storage
    apiCalls: [],
    cache: new Map(),
    CACHE_DURATION: 30000, // 30 seconds

    /**
     * Check if we can make an API call within rate limits
     */
    canMakeCall() {
        const now = Date.now();
        // Remove calls older than 1 minute
        this.apiCalls = this.apiCalls.filter(
            timestamp => now - timestamp < this.RATE_LIMIT.WINDOW_MS
        );

        return this.apiCalls.length < this.RATE_LIMIT.MAX_CALLS;
    },

    /**
     * Record an API call for rate limiting
     */
    recordCall() {
        this.apiCalls.push(Date.now());
    },

    /**
     * Get cached data if available and not expired
     */
    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    },

    /**
     * Store data in cache
     */
    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    },

    /**
     * Make API request with rate limiting and caching
     */
    async makeRequest(endpoint, cacheKey = null) {
        // Check cache first
        if (cacheKey) {
            const cached = this.getCached(cacheKey);
            if (cached) {
                console.log(`Using cached data for ${cacheKey}`);
                return cached;
            }
        }

        // Check rate limit
        if (!this.canMakeCall()) {
            const waitTime = this.RATE_LIMIT.WINDOW_MS - (Date.now() - this.apiCalls[0]);
            console.warn(
                `Rate limit reached. Next call available in ${Math.ceil(waitTime / 1000)} seconds`
            );
            throw new Error(
                `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`
            );
        }

        try {
            this.recordCall();
            const url = `${this.BASE_URL}${endpoint}&apikey=${this.API_KEY}`;
            console.log(`Making API call to: ${endpoint}`);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Cache the response if cache key provided
            if (cacheKey) {
                this.setCache(cacheKey, data);
            }

            return data;
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    },

    /**
     * Get current stock data
     */
    async getStockData(symbol) {
        const endpoint = `/v2/snapshot/locale/us/markets/stocks/tickers/${symbol.toUpperCase()}?`;
        const cacheKey = `stock_${symbol.toUpperCase()}`;

        try {
            const response = await this.makeRequest(endpoint, cacheKey);

            if (!response.results || !response.results.value) {
                throw new Error(`No data found for ${symbol}`);
            }

            const result = response.results;
            const value = result.value;
            const prevClose = result.prevDay?.c || value;
            const change = value - prevClose;
            const changePercent = (change / prevClose) * 100;

            return {
                symbol: symbol.toUpperCase(),
                name: result.name || symbol.toUpperCase(),
                current_price: value,
                previous_close: prevClose,
                change: change,
                change_percent: changePercent,
                volume: result.day?.v || 0,
                market_cap: result.market_cap || 0,
                pe_ratio: 0, // Not available in snapshot
                high_52w: result.day?.h || 0,
                low_52w: result.day?.l || 0,
                dividend_yield: 0, // Not available in snapshot
                currency: 'USD',
                exchange: result.market || 'UNKNOWN',
                market_state: result.market_status || 'CLOSED',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Error fetching stock data for ${symbol}:`, error);
            throw error;
        }
    },

    /**
     * Get historical chart data
     */
    async getChartData(symbol, period = '1y') {
        const { from, to, multiplier, timespan } = this.getPeriodParams(period);
        const endpoint = `/v2/aggs/ticker/${symbol.toUpperCase()}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&`;
        const cacheKey = `chart_${symbol.toUpperCase()}_${period}`;

        try {
            const response = await this.makeRequest(endpoint, cacheKey);

            if (!response.results || response.results.length === 0) {
                throw new Error(`No chart data found for ${symbol}`);
            }

            const chartData = response.results.map(point => ({
                date: new Date(point.t).toISOString().split('T')[0],
                timestamp: point.t,
                open: point.o,
                high: point.h,
                low: point.l,
                close: point.c,
                volume: point.v
            }));

            return {
                symbol: symbol.toUpperCase(),
                period: period,
                interval: timespan,
                data: chartData,
                count: chartData.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Error fetching chart data for ${symbol}:`, error);
            throw error;
        }
    },

    /**
     * Get market indices data
     */
    async getMarketIndices() {
        const indices = ['SPY', 'DIA', 'QQQ']; // ETFs that track the major indices
        const cacheKey = 'market_indices';

        try {
            // Check cache first
            const cached = this.getCached(cacheKey);
            if (cached) {
                return cached;
            }

            // We need to make individual calls, so check if we have enough rate limit
            if (this.apiCalls.length + indices.length > this.RATE_LIMIT.MAX_CALLS) {
                throw new Error('Not enough API calls remaining for market indices');
            }

            const results = {};
            const indexMap = {
                SPY: { symbol: '^GSPC', name: 'S&P 500' },
                DIA: { symbol: '^DJI', name: 'Dow Jones' },
                QQQ: { symbol: '^IXIC', name: 'NASDAQ' }
            };

            for (const etf of indices) {
                try {
                    const data = await this.getStockData(etf);
                    const indexInfo = indexMap[etf];

                    results[indexInfo.symbol] = {
                        name: indexInfo.name,
                        symbol: indexInfo.symbol,
                        current_price: data.current_price,
                        change: data.change,
                        change_percent: data.change_percent,
                        timestamp: data.timestamp
                    };
                } catch (error) {
                    console.error(`Error fetching ${etf} data:`, error);
                    continue;
                }
            }

            this.setCache(cacheKey, results);
            return results;
        } catch (error) {
            console.error('Error fetching market indices:', error);
            throw error;
        }
    },

    /**
     * Search for stock symbols
     */
    async searchStocks(query) {
        if (!query || query.length < 1) {
            return { suggestions: [] };
        }

        const endpoint = `/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&limit=10&`;
        const cacheKey = `search_${query.toLowerCase()}`;

        try {
            const response = await this.makeRequest(endpoint, cacheKey);

            if (!response.results) {
                return { suggestions: [] };
            }

            const suggestions = response.results
                .filter(ticker => ticker.market === 'stocks')
                .slice(0, 5)
                .map(ticker => ({
                    symbol: ticker.ticker,
                    name: ticker.name,
                    exchange: ticker.primary_exchange || 'UNKNOWN'
                }));

            return { suggestions };
        } catch (error) {
            console.error(`Error searching stocks for ${query}:`, error);
            return { suggestions: [] };
        }
    },

    /**
     * Convert period to polygon.io API parameters
     */
    getPeriodParams(period) {
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
        case '1d':
            startDate.setDate(endDate.getDate() - 1);
            return {
                from: this.formatDate(startDate),
                to: this.formatDate(endDate),
                multiplier: 5,
                timespan: 'minute'
            };
        case '5d':
            startDate.setDate(endDate.getDate() - 5);
            return {
                from: this.formatDate(startDate),
                to: this.formatDate(endDate),
                multiplier: 1,
                timespan: 'hour'
            };
        case '1mo':
            startDate.setMonth(endDate.getMonth() - 1);
            return {
                from: this.formatDate(startDate),
                to: this.formatDate(endDate),
                multiplier: 1,
                timespan: 'day'
            };
        case '3mo':
            startDate.setMonth(endDate.getMonth() - 3);
            return {
                from: this.formatDate(startDate),
                to: this.formatDate(endDate),
                multiplier: 1,
                timespan: 'day'
            };
        case '6mo':
            startDate.setMonth(endDate.getMonth() - 6);
            return {
                from: this.formatDate(startDate),
                to: this.formatDate(endDate),
                multiplier: 1,
                timespan: 'day'
            };
        case '1y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            return {
                from: this.formatDate(startDate),
                to: this.formatDate(endDate),
                multiplier: 1,
                timespan: 'day'
            };
        case '2y':
            startDate.setFullYear(endDate.getFullYear() - 2);
            return {
                from: this.formatDate(startDate),
                to: this.formatDate(endDate),
                multiplier: 1,
                timespan: 'week'
            };
        case '5y':
            startDate.setFullYear(endDate.getFullYear() - 5);
            return {
                from: this.formatDate(startDate),
                to: this.formatDate(endDate),
                multiplier: 1,
                timespan: 'month'
            };
        default:
            startDate.setFullYear(endDate.getFullYear() - 1);
            return {
                from: this.formatDate(startDate),
                to: this.formatDate(endDate),
                multiplier: 1,
                timespan: 'day'
            };
        }
    },

    /**
     * Format date for polygon.io API (YYYY-MM-DD)
     */
    formatDate(date) {
        return date.toISOString().split('T')[0];
    },

    /**
     * Get API usage statistics
     */
    getUsageStats() {
        const now = Date.now();
        const recentCalls = this.apiCalls.filter(
            timestamp => now - timestamp < this.RATE_LIMIT.WINDOW_MS
        );

        return {
            callsInLastMinute: recentCalls.length,
            maxCalls: this.RATE_LIMIT.MAX_CALLS,
            remainingCalls: this.RATE_LIMIT.MAX_CALLS - recentCalls.length,
            cacheSize: this.cache.size
        };
    }
};

// Export for use in main.js
window.PolygonAPI = PolygonAPI;
