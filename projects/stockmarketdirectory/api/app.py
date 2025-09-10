#!/usr/bin/env python3
"""
Stock Market Directory API
A Flask-based API for serving real-time stock market data using yfinance
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import json
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/stock/<symbol>', methods=['GET'])
def get_stock_data(symbol):
    """Get current stock data for a given symbol"""
    try:
        # Get stock ticker
        ticker = yf.Ticker(symbol.upper())
        
        # Get current info
        info = ticker.info
        
        # Get current price data
        hist = ticker.history(period='1d')
        
        if hist.empty:
            return jsonify({'error': f'No data found for symbol {symbol}'}), 404
        
        current_price = hist['Close'].iloc[-1]
        previous_close = info.get('previousClose', hist['Close'].iloc[-1])
        
        # Calculate change
        change = current_price - previous_close
        change_percent = (change / previous_close) * 100 if previous_close else 0
        
        # Prepare response data
        stock_data = {
            'symbol': symbol.upper(),
            'name': info.get('longName', symbol.upper()),
            'current_price': round(current_price, 2),
            'previous_close': round(previous_close, 2),
            'change': round(change, 2),
            'change_percent': round(change_percent, 2),
            'volume': info.get('volume', 0),
            'market_cap': info.get('marketCap', 0),
            'pe_ratio': info.get('trailingPE', 0),
            'high_52w': info.get('fiftyTwoWeekHigh', 0),
            'low_52w': info.get('fiftyTwoWeekLow', 0),
            'dividend_yield': info.get('dividendYield', 0),
            'currency': info.get('currency', 'USD'),
            'exchange': info.get('exchange', 'UNKNOWN'),
            'market_state': info.get('marketState', 'CLOSED'),
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(stock_data)
        
    except Exception as e:
        logger.error(f"Error fetching data for {symbol}: {str(e)}")
        return jsonify({'error': f'Failed to fetch data for {symbol}'}), 500

@app.route('/api/stock/<symbol>/chart', methods=['GET'])
def get_stock_chart(symbol):
    """Get historical chart data for a given symbol"""
    try:
        period = request.args.get('period', '1y')
        interval = request.args.get('interval', '1d')
        
        # Validate period
        valid_periods = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max']
        if period not in valid_periods:
            period = '1y'
        
        # Get stock ticker
        ticker = yf.Ticker(symbol.upper())
        
        # Get historical data
        hist = ticker.history(period=period, interval=interval)
        
        if hist.empty:
            return jsonify({'error': f'No chart data found for symbol {symbol}'}), 404
        
        # Convert to chart format
        chart_data = []
        for index, row in hist.iterrows():
            chart_data.append({
                'date': index.strftime('%Y-%m-%d'),
                'timestamp': int(index.timestamp() * 1000),  # JavaScript timestamp
                'open': round(row['Open'], 2),
                'high': round(row['High'], 2),
                'low': round(row['Low'], 2),
                'close': round(row['Close'], 2),
                'volume': int(row['Volume'])
            })
        
        response_data = {
            'symbol': symbol.upper(),
            'period': period,
            'interval': interval,
            'data': chart_data,
            'count': len(chart_data),
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error fetching chart data for {symbol}: {str(e)}")
        return jsonify({'error': f'Failed to fetch chart data for {symbol}'}), 500

@app.route('/api/market/indices', methods=['GET'])
def get_market_indices():
    """Get data for major market indices"""
    try:
        indices = {
            '^GSPC': 'S&P 500',
            '^DJI': 'Dow Jones',
            '^IXIC': 'NASDAQ'
        }
        
        results = {}
        
        for symbol, name in indices.items():
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                hist = ticker.history(period='1d')
                
                if not hist.empty:
                    current_price = hist['Close'].iloc[-1]
                    previous_close = info.get('previousClose', hist['Close'].iloc[-1])
                    change = current_price - previous_close
                    change_percent = (change / previous_close) * 100 if previous_close else 0
                    
                    results[symbol] = {
                        'name': name,
                        'symbol': symbol,
                        'current_price': round(current_price, 2),
                        'change': round(change, 2),
                        'change_percent': round(change_percent, 2),
                        'timestamp': datetime.now().isoformat()
                    }
            except Exception as e:
                logger.error(f"Error fetching {symbol}: {str(e)}")
                continue
        
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Error fetching market indices: {str(e)}")
        return jsonify({'error': 'Failed to fetch market indices'}), 500

@app.route('/api/search/<query>', methods=['GET'])
def search_stocks(query):
    """Search for stock symbols (simplified version)"""
    try:
        # This is a simplified search - in production you'd want a proper symbol database
        # For now, we'll just try to validate if the symbol exists
        if len(query) > 5:
            return jsonify({'suggestions': []})
        
        ticker = yf.Ticker(query.upper())
        info = ticker.info
        
        suggestions = []
        if info and info.get('longName'):
            suggestions.append({
                'symbol': query.upper(),
                'name': info.get('longName', query.upper()),
                'exchange': info.get('exchange', 'UNKNOWN')
            })
        
        return jsonify({'suggestions': suggestions})
        
    except Exception as e:
        logger.error(f"Error searching for {query}: {str(e)}")
        return jsonify({'suggestions': []})

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("Starting Stock Market Directory API...")
    print("Available endpoints:")
    print("  GET /api/health - Health check")
    print("  GET /api/stock/<symbol> - Get stock data")
    print("  GET /api/stock/<symbol>/chart?period=<period> - Get chart data")
    print("  GET /api/market/indices - Get market indices")
    print("  GET /api/search/<query> - Search stocks")
    
    app.run(host='0.0.0.0', port=5000, debug=True)