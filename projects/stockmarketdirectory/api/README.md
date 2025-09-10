# Stock Market Directory API

A Python Flask API for serving real-time stock market data using yfinance library.

## Setup Instructions

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Installation

1. Navigate to the API directory:
```bash
cd projects/stockmarketdirectory/api
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the API

1. Start the Flask development server:
```bash
python app.py
```

2. The API will be available at `http://localhost:5000`

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/stock/<symbol>` - Get current stock data
- `GET /api/stock/<symbol>/chart?period=<period>` - Get historical chart data
- `GET /api/market/indices` - Get major market indices data
- `GET /api/search/<query>` - Search for stock symbols

### Example Usage

```bash
# Get Apple stock data
curl http://localhost:5000/api/stock/AAPL

# Get chart data for Tesla
curl http://localhost:5000/api/stock/TSLA/chart?period=1y

# Get market indices
curl http://localhost:5000/api/market/indices
```

### Production Deployment

For production deployment, consider:
- Using a WSGI server like Gunicorn
- Setting up environment variables for configuration
- Implementing proper error handling and logging
- Adding rate limiting to prevent API abuse
- Using a proper database for caching
- Setting up SSL/TLS encryption

### Notes

- The API uses Yahoo Finance as the data source through the yfinance library
- Data is fetched in real-time and may be subject to Yahoo Finance's rate limits
- The API includes CORS headers for frontend integration
- Error handling is implemented for invalid symbols and network issues