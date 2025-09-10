// Mock API for Stock Market Directory (for development/demo purposes)
// This provides sample data while the Python backend is being set up

const MockStockAPI = {
    // Mock stock data
    stockData: {
        AAPL: {
            symbol: 'AAPL',
            name: 'Apple Inc.',
            current_price: 174.28,
            previous_close: 171.48,
            change: 2.8,
            change_percent: 1.63,
            volume: 45678900,
            market_cap: 2800000000000,
            pe_ratio: 28.5,
            high_52w: 199.62,
            low_52w: 164.08,
            dividend_yield: 0.0047,
            currency: 'USD',
            exchange: 'NASDAQ',
            market_state: 'CLOSED',
            timestamp: new Date().toISOString()
        },
        MSFT: {
            symbol: 'MSFT',
            name: 'Microsoft Corporation',
            current_price: 378.85,
            previous_close: 376.04,
            change: 2.81,
            change_percent: 0.75,
            volume: 28945600,
            market_cap: 2810000000000,
            pe_ratio: 32.1,
            high_52w: 468.35,
            low_52w: 309.45,
            dividend_yield: 0.0067,
            currency: 'USD',
            exchange: 'NASDAQ',
            market_state: 'CLOSED',
            timestamp: new Date().toISOString()
        },
        '^NYA': {
            symbol: '^NYA',
            name: 'NYSE Composite Index',
            current_price: 17234.56,
            previous_close: 17156.78,
            change: 77.78,
            change_percent: 0.45,
            volume: 0,
            market_cap: 0,
            pe_ratio: 0,
            high_52w: 18567.23,
            low_52w: 15678.45,
            dividend_yield: 0,
            currency: 'USD',
            exchange: 'NYSE',
            market_state: 'CLOSED',
            timestamp: new Date().toISOString()
        }
    },

    // Mock chart data generator
    generateChartData(symbol, period) {
        const days = this.getPeriodDays(period);
        const basePrice = this.stockData[symbol]?.current_price || 100;
        const data = [];

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            // Generate realistic price variation
            const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
            const price = basePrice * (1 + variation * (i / days));

            data.push({
                date: date.toISOString().split('T')[0],
                timestamp: date.getTime(),
                open: price * 0.99,
                high: price * 1.02,
                low: price * 0.98,
                close: price,
                volume: Math.floor(Math.random() * 50000000) + 10000000
            });
        }

        return data;
    },

    getPeriodDays(period) {
        const periodMap = {
            '1d': 1,
            '5d': 5,
            '1mo': 30,
            '3mo': 90,
            '6mo': 180,
            '1y': 365,
            '2y': 730,
            '5y': 1825
        };
        return periodMap[period] || 365;
    },

    // Mock market indices
    marketIndices: {
        '^GSPC': {
            name: 'S&P 500',
            symbol: '^GSPC',
            current_price: 4567.89,
            change: 23.45,
            change_percent: 0.52,
            timestamp: new Date().toISOString()
        },
        '^DJI': {
            name: 'Dow Jones',
            symbol: '^DJI',
            current_price: 34567.12,
            change: -89.34,
            change_percent: -0.26,
            timestamp: new Date().toISOString()
        },
        '^IXIC': {
            name: 'NASDAQ',
            symbol: '^IXIC',
            current_price: 14234.67,
            change: 67.89,
            change_percent: 0.48,
            timestamp: new Date().toISOString()
        }
    },

    // API methods
    async getStock(symbol) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const data = this.stockData[symbol.toUpperCase()];
        if (!data) {
            throw new Error(`No data found for symbol ${symbol}`);
        }

        return data;
    },

    async getChartData(symbol, period = '1y') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 750));

        if (!this.stockData[symbol.toUpperCase()]) {
            throw new Error(`No chart data found for symbol ${symbol}`);
        }

        return {
            symbol: symbol.toUpperCase(),
            period: period,
            interval: '1d',
            data: this.generateChartData(symbol.toUpperCase(), period),
            count: this.getPeriodDays(period),
            timestamp: new Date().toISOString()
        };
    },

    async getMarketIndices() {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        return this.marketIndices;
    },

    async searchStocks(query) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));

        const suggestions = [];
        const queryUpper = query.toUpperCase();

        // Search through our mock data
        Object.values(this.stockData).forEach(stock => {
            if (
                stock.symbol.includes(queryUpper) ||
                stock.name.toUpperCase().includes(queryUpper)
            ) {
                suggestions.push({
                    symbol: stock.symbol,
                    name: stock.name,
                    exchange: stock.exchange
                });
            }
        });

        // Add some common stocks
        const commonStocks = [
            { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
            { symbol: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ' },
            { symbol: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ' },
            { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' }
        ];

        commonStocks.forEach(stock => {
            if (
                stock.symbol.includes(queryUpper) ||
                stock.name.toUpperCase().includes(queryUpper)
            ) {
                suggestions.push(stock);
            }
        });

        return { suggestions: suggestions.slice(0, 5) };
    }
};

// Export for use in main.js
window.MockStockAPI = MockStockAPI;
