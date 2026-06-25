import os
from dotenv import load_dotenv # Load environment variables from .env file

load_dotenv()

class Config:

    # Weather API
    WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')
    # The base URL for the Visual Crossing Weather API. This is used to construct the full API request URL. 
    WEATHER_API_URL = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline"
    
    # Redis
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

    # Cache - 12 hours in seconds
    CACHE_EXPIRY = int(os.getenv('CACHE_EXPIRY_SECONDS', 43200))

    # Rate Liiting 
    RATE_LIMIT = os.getenv('RATE_LIMIT', '100 per hour')
    DEFAULT_RATE_LIMIT = os.getenv('DEFAULT_RATE_LIMIT', '100 per hour')

    # Flask
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    HOST = os.getenv('FLASK_HOST', '0.0.0.0')
    PORT = int(os.getenv('FLASK_PORT', 5000))  

    @classmethod
    def validate(cls):
        if not cls.WEATHER_API_KEY:
            raise ValueError("WEATHER_API_KEY is not set in the environment variables")
        return True