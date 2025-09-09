// Sample Market Data for Stock Market Directory
// Used when external APIs are blocked or unavailable

const SAMPLE_DATA = {
    majorIndexes: [
        {
            symbol: '^NYA',
            name: 'NYSE Composite',
            latestClose: 16847.23,
            pointChange: 123.45,
            percentChange: 0.74,
            high: 16895.67,
            low: 16723.12,
            volume: 3.2e9
        },
        {
            symbol: '^IXIC',
            name: 'NASDAQ Composite',
            latestClose: 14234.56,
            pointChange: -78.90,
            percentChange: -0.55,
            high: 14345.23,
            low: 14198.67,
            volume: 4.1e9
        },
        {
            symbol: '^GSPC',
            name: 'S&P 500',
            latestClose: 4789.12,
            pointChange: 15.67,
            percentChange: 0.33,
            high: 4798.45,
            low: 4765.23,
            volume: 2.8e9
        },
        {
            symbol: '^DJI',
            name: 'Dow Jones Industrial Average',
            latestClose: 37234.89,
            pointChange: 234.56,
            percentChange: 0.63,
            high: 37345.67,
            low: 37098.23,
            volume: 5.2e8
        },
        {
            symbol: '^RUT',
            name: 'Russell 2000',
            latestClose: 2089.45,
            pointChange: -12.34,
            percentChange: -0.59,
            high: 2098.67,
            low: 2076.23,
            volume: 1.7e9
        },
        {
            symbol: '^VIX',
            name: 'CBOE Volatility Index',
            latestClose: 16.78,
            pointChange: 1.23,
            percentChange: 7.91,
            high: 17.45,
            low: 15.67,
            volume: 0
        }
    ]
};

// Generate sample chart data for different time ranges
function generateSampleChartData(symbol, range = '1d') {
    const basePrice = SAMPLE_DATA.majorIndexes.find(idx => idx.symbol === symbol)?.latestClose || 100;
    const numPoints = getNumPointsForRange(range);
    const timestamps = generateTimestamps(range, numPoints);
    
    // Generate realistic price movements
    const closes = [];
    let currentPrice = basePrice * 0.98; // Start slightly lower
    
    for (let i = 0; i < numPoints; i++) {
        // Add some realistic volatility
        const change = (Math.random() - 0.5) * basePrice * 0.02; // 2% max change per point
        currentPrice += change;
        closes.push(Math.max(currentPrice, basePrice * 0.9)); // Don't go below 90% of base
    }
    
    // Ensure the last price matches our target
    closes[closes.length - 1] = basePrice;
    
    const highs = closes.map(close => close + Math.random() * basePrice * 0.01);
    const lows = closes.map(close => close - Math.random() * basePrice * 0.01);
    const volumes = closes.map(() => Math.floor(Math.random() * 1e9 + 1e8));
    
    const firstClose = closes[0];
    const latestClose = closes[closes.length - 1];
    const pointChange = latestClose - firstClose;
    const percentChange = (pointChange / firstClose) * 100;
    
    return {
        timestamps,
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
            symbol: symbol,
            currency: 'USD',
            exchangeName: 'NYSE',
            instrumentType: 'INDEX'
        }
    };
}

function getNumPointsForRange(range) {
    switch (range) {
        case '1d': return 78; // 6.5 hours * 12 (5-minute intervals)
        case '10d': return 240; // 10 days * 24 hours
        case '1mo': return 22; // ~22 trading days
        case '3mo': return 65; // ~65 trading days
        case '6mo': return 130; // ~130 trading days
        case '1y': return 260; // ~260 trading days
        case '5y': return 1300; // ~5 years of trading days
        case 'max': return 2600; // ~10 years
        default: return 78;
    }
}

function generateTimestamps(range, numPoints) {
    const now = new Date();
    const timestamps = [];
    
    switch (range) {
        case '1d':
            // Generate timestamps for trading hours (9:30 AM - 4:00 PM)
            const startOfDay = new Date(now);
            startOfDay.setHours(9, 30, 0, 0);
            
            for (let i = 0; i < numPoints; i++) {
                const time = new Date(startOfDay.getTime() + i * 5 * 60 * 1000); // 5-minute intervals
                timestamps.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            }
            break;
            
        case '10d':
            for (let i = numPoints - 1; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 60 * 60 * 1000); // Hourly
                timestamps.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
            }
            break;
            
        case '1mo':
        case '3mo':
        case '6mo':
            for (let i = numPoints - 1; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000); // Daily
                timestamps.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
            }
            break;
            
        default:
            for (let i = numPoints - 1; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000); // Weekly
                timestamps.push(date.toLocaleDateString([], { month: 'short', year: '2-digit' }));
            }
    }
    
    return timestamps;
}

// Function to get sample data for a specific stock symbol
function getSampleStockData(symbol, range = '1d') {
    // For known indexes, use predefined data
    const indexData = SAMPLE_DATA.majorIndexes.find(idx => idx.symbol === symbol);
    if (indexData) {
        const chartData = generateSampleChartData(symbol, range);
        return {
            ...chartData,
            latestClose: indexData.latestClose,
            pointChange: indexData.pointChange,
            percentChange: indexData.percentChange,
            high: indexData.high,
            low: indexData.low,
            volume: indexData.volume
        };
    }
    
    // For other symbols, generate random but realistic data
    const basePrice = Math.random() * 200 + 50; // Random price between $50-$250
    return generateSampleChartData(symbol, range);
}

// Export for use in main script
window.SAMPLE_DATA = SAMPLE_DATA;
window.getSampleStockData = getSampleStockData;