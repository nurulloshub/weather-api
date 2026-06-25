# Weather API 🌤️

A RESTful weather API built with Flask, Redis, and Visual Crossing Weather API.

## Features

- 🌡️ Real-time weather data
- 🔄 Redis caching with 12-hour TTL
- 🚦 Rate limiting (100 requests/hour)
- 📊 5-day forecast
- 🔄 Unit conversion (Celsius/Fahrenheit)
- ⚠️ Weather alerts
- 💬 Human-friendly descriptions
- 🏥 Health check endpoint

## Tech Stack

- Python 3.8+
- Flask (Web framework)
- Redis (Caching)
- Visual Crossing Weather API
- Flask-Limiter (Rate limiting)

## Installation

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/weather-api.git
cd weather-api
\`\`\`

### 2. Create virtual environment
\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
\`\`\`

### 3. Install dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 4. Configure environment variables
\`\`\`bash
cp .env.example .env
# Edit .env with your API key
\`\`\`

### 5. Run the application
\`\`\`bash
python app.py
\`\`\`

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/` | API information |
| `/health` | Health check |
| `/weather/<city>` | Current weather |
| `/weather/<city>?unit=imperial` | Current weather (Fahrenheit) |
| `/forecast/<city>` | 5-day forecast |
| `/weather/<city>/alerts` | Weather alerts |
| `/weather/<city>/nice` | Human-friendly summary |
| `/cache/stats` | Cache statistics |
| `/cache/clear` | Clear cache |

## Example Usage

\`\`\`bash
# Get weather for London
curl http://localhost:5000/weather/London

# Get 5-day forecast
curl http://localhost:5000/forecast/London

# Get weather in Fahrenheit
curl http://localhost:5000/weather/NewYork?unit=imperial

# Get human-friendly summary
curl http://localhost:5000/weather/Tokyo/nice
\`\`\`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `WEATHER_API_KEY` | Your Visual Crossing API key |
| `REDIS_URL` | Redis connection string |
| `CACHE_EXPIRY_SECONDS` | Cache TTL in seconds (default: 43200) |
| `RATE_LIMIT` | Rate limit per IP (default: 100/hour) |

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request
- `401` - Invalid API key
- `404` - City not found
- `429` - Rate limit exceeded
- `503` - Weather service unavailable

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Author

Your Name

## Acknowledgments

- [Visual Crossing Weather API](https://www.visualcrossing.com/weather-api)
- [Flask](https://flask.palletsprojects.com/)
- [Redis](https://redis.io/)