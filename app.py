""" Weather API"""

import requests

from flask import Flask, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import Config
import redis
import logging
import json
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Redis connection
try:
    redis_client = redis.Redis.from_url(Config.REDIS_URL, decode_responses=True)
    redis_client.ping()  # Test connection
    logger.info("✅ Connected to Redis successfully")
except redis.ConnectionError as e:
    logger.error(f"❌ Failed to connect to Redis: {e}")
    redis_client = None
    logger.warning("⚠️ Using fallback in-memory cache (no persistence)")

# Initialize rate limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=[Config.DEFAULT_RATE_LIMIT]
)

# ---------- Cache Functions ----------

def get_cached_weather(city):
    """Retrieve weather data from cache"""
    if redis_client:
        key = f"weather:{city.lower()}"
        cached_data = redis_client.get(key)
        if cached_data:
            logger.info(f"✅ Cache HIT for city: {city}")
            return json.loads(cached_data)
    logger.info(f"❌ Cache MISS for city: {city}")
    return None

def set_cached_weather(city, data):
    """Store weather data in cache with TTL"""
    if redis_client:
        key = f"weather:{city.lower()}"
        redis_client.setex(key, Config.CACHE_EXPIRY, json.dumps(data))
        logger.info(f"💾 Cached data for {city} with TTL of {Config.CACHE_EXPIRY}s")

# ---------- API Endpoints ----------

@app.route('/', methods=['GET'])
def home():
    """Home page - API documentation"""
    return jsonify({
        "message": "Welcome to Weather API",
        "version": "1.0.0",
        "endpoints": {
            "/": "API information (GET)",
            "/weather/<city>": "Get weather for a city (GET)",
            "/health": "Health check (GET)",
            "/cache/stats": "Cache statistics (GET)",
            "/cache/clear": "Clear cache (DELETE)"
        },
        "features": {
            "caching": "✅ Enabled" if redis_client else "❌ Disabled",
            "rate_limiting": "✅ Enabled",
            "cache_expiry": f"{Config.CACHE_EXPIRY / 3600} hours"
        }
    }), 200

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring"""
    redis_ok = False
    if redis_client:
        try:
            redis_client.ping()
            redis_ok = True
        except:
            redis_ok = False
    
    return jsonify({
        "status": "healthy" if (redis_ok or redis_client is None) else "degraded",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "checks": {
            "redis": "connected" if redis_ok else "disconnected" if redis_client else "disabled",
            "cache_expiry_hours": Config.CACHE_EXPIRY / 3600
        }
    }), 200 if (redis_ok or redis_client is None) else 503

@app.route('/weather/<city>', methods=['GET'])
@limiter.limit(Config.RATE_LIMIT)
def get_weather(city):
    """Get weather for a specific city"""
    logger.info(f"📥 Received request for city: {city}")
    
    # Check cache first
    cached_data = get_cached_weather(city)
    if cached_data:
        cached_data['from_cache'] = True
        cached_data['cached_at'] = datetime.now().isoformat()
        return jsonify(cached_data), 200
    
    # Fetch REAL weather data from Visual Crossing
    try:
        # Build the API URL
        url = f"{Config.WEATHER_API_URL}/{city}"

        # Parameters for the API request
        params = {
            'key': Config.WEATHER_API_KEY,
            'unitGroup': 'metric', # Celsius,
            'contentType': 'json'
        }

        logger.info(f"Fetching weather from Visual Crossing for: {city}")

        # Make the request to Visual Crossing
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status() # Raise exception if status code is not 200

        # Parse the JSON response
        data = response.json()

        # Extract the weather data we want
        weather_data = {
            "city": city,
            "temperature": data.get('currentConditions', {}).get('temp'),
            "conditions": data.get('currentConditions', {}).get('conditions'),
            "humidity": data.get('currentConditions', {}).get('humidity'),
            "wind_speed": data.get('currentConditions', {}).get('windspeed'),
            "feelslike": data.get('currentConditions', {}).get('feelslike'),
            "wind_direction": data.get('currentConditions', {}).get('winddir'),
            "pressure": data.get('currentConditions', {}).get('pressure'),
            "visibility": data.get('currentConditions', {}).get('visibility'),
            "uv_index": data.get('currentConditions', {}).get('uvindex'),
            "sunrise": data.get('currentConditions', {}).get('sunrise'),
            "sunset": data.get('currentConditions', {}).get('sunset'),
            "timestamp": datetime.now().isoformat(),
            "from_cache": False,
            "data_source": "Visual Crossing API (Real Data)"
        }

        logger.info(f"Successfully fetched weather for: {city}")

    except requests.exceptions.HTTPError as e:
        # Handle HTTP errors (404, 401, etc.)
        if e.response.status_code == 404:
            logger.error(f"City not found: {city}")
            return jsonify({
                "error": "City not found",
                "message" : f"City '{city}' was not found. Please check the spelling."
            }), 404
        elif e.response.status_code == 401:
            logger.error("Invalid API key")
            return jsonify({
                "error": "Invalid API key",
                "message": "Weather API key is invalid. Please check you .env file."
            }), 401
        else:
            logger.error(f"Weather API error: {e}")
            return jsonify({
                "error": "Weather service error",
                "message": "Failed to fetch weather data. Please try again later."
            }), 503
        
    except requests.exceptions.Timeout:
        logger.error("Weather API timeout for: {city}")
        return jsonify ({
            "error": "Service timeout",
            "message": "The weather service took too long to respond."
        }), 504
    
    except requests.exceptions.ConnectionError:
        logger.error("Cannot cannect to Weather API")
        return jsonify({
            "error": "Service unavailable",
            "message": "Cannot connect to weather service. Please check your internet connection."
        }), 503
    
    except Exception as e:
        logger.error(f"Unexcpected error: {e}")
        return jsonify({
            "error": "Internal server error",
            "message": "An unexpected error occured. Please try again later."
        }), 500
    
    # Store in cache
    set_cached_weather(city, weather_data)
    
    return jsonify(weather_data), 200

@app.route('/cache/stats', methods=['GET'])
def cache_stats():
    """Get cache statistics"""
    if not redis_client:
        return jsonify({
            "error": "Redis not connected",
            "status": "unavailable"
        }), 503
    
    keys = list(redis_client.scan_iter("weather:*"))
    
    return jsonify({
        "redis_connected": True,
        "total_cached_cities": len(keys),
        "cached_cities": [key.replace('weather:', '') for key in keys[:10]],
        "cache_expiry_seconds": Config.CACHE_EXPIRY,
        "cache_expiry_hours": Config.CACHE_EXPIRY / 3600,
        "timestamp": datetime.now().isoformat()
    }), 200

@app.route('/cache/clear', methods=['DELETE'])
def clear_cache():
    """Clear all cached weather data"""
    if not redis_client:
        return jsonify({"error": "Redis not available"}), 503
    
    count = 0
    for key in redis_client.scan_iter("weather:*"):
        redis_client.delete(key)
        count += 1
    
    logger.info(f"🗑️ Cleared {count} cache entries")
    return jsonify({
        "message": f"Cleared {count} cache entries",
        "timestamp": datetime.now().isoformat()
    }), 200

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        "error": "Not found",
        "message": "The requested URL was not found on the server"
    }), 404

@app.errorhandler(429)
def rate_limit_exceeded(error):
    """Handle rate limit exceeded"""
    return jsonify({
        "error": "Rate limit exceeded",
        "message": "Too many requests. Please try again later."
    }), 429

# ---------- Start the App ----------
if __name__ == '__main__':
    logger.info("🚀 Starting Weather API")
    logger.info(f"🔧 Redis: {'Connected' if redis_client else 'Not Connected'}")
    logger.info(f"⏰ Cache TTL: {Config.CACHE_EXPIRY / 3600} hours")
    logger.info(f"🔄 Rate Limit: {Config.RATE_LIMIT}")
    logger.info(f"🌐 Server: http://{Config.HOST}:{Config.PORT}")
    logger.info(f"Weather Source: Visual Crossing API (Real Data)")

    app.run(
        debug=Config.DEBUG,
        host=Config.HOST,
        port=Config.PORT
    )