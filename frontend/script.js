
/**
 * Weather Dashboard - Main JavaScript
 * Handles API calls, UI updates, and user interactions
 */

// Configuration
const API_URL = 'http://localhost:5000';
let currentUnit = 'metric';
let currentCity = 'London';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const weatherDisplay = document.getElementById('weatherDisplay');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const updateTime = document.getElementById('updateTime');

// Weather Display Elements
const cityName = document.getElementById('cityName');
const weatherCondition = document.getElementById('weatherCondition');
const weatherIcon = document.getElementById('weatherIcon');
const tempDisplay = document.getElementById('tempDisplay');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const uvIndex = document.getElementById('uvIndex');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const forecastContainer = document.getElementById('forecastContainer');
const alertsContainer = document.getElementById('alertsContainer');
const degreeSymbol = document.getElementById('degreeSymbol');

// Unit toggle buttons
const unitBtns = document.querySelectorAll('.unit-btn');

/**
 * Get weather condition icon
 */
function getWeatherIcon(condition) {
    const iconMap = {
        'clear': 'fa-sun',
        'sunny': 'fa-sun',
        'partially cloudy': 'fa-cloud-sun',
        'partly cloudy': 'fa-cloud-sun',
        'cloudy': 'fa-cloud',
        'overcast': 'fa-cloud',
        'rain': 'fa-cloud-rain',
        'heavy rain': 'fa-cloud-showers-heavy',
        'showers': 'fa-cloud-rain',
        'thunderstorm': 'fa-bolt',
        'snow': 'fa-snowflake',
        'fog': 'fa-smog',
        'mist': 'fa-smog',
        'windy': 'fa-wind'
    };

    const lower = condition?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(iconMap)) {
        if (lower.includes(key)) {
            return icon;
        }
    }
    return 'fa-cloud-sun';
}

/**
 * Update connection status
 */
function updateStatus(connected) {
    if (connected) {
        statusDot.className = 'status-dot online';
        statusText.textContent = 'Connected';
        statusText.style.color = '#34d399';
    } else {
        statusDot.className = 'status-dot offline';
        statusText.textContent = 'Offline';
        statusText.style.color = '#f87171';
    }
}

/**
 * Update the timestamp
 */
function updateTimestamp() {
    const now = new Date();
    updateTime.textContent = now.toLocaleTimeString();
}

/**
 * Show loading state
 */
function showLoading() {
    loading.classList.remove('hidden');
    weatherDisplay.classList.add('hidden');
    error.classList.add('hidden');
}

/**
 * Show error state
 */
function showError(message) {
    error.classList.remove('hidden');
    weatherDisplay.classList.add('hidden');
    loading.classList.add('hidden');
    errorMessage.textContent = message;
}

/**
 * Fetch weather data from API
 */
async function fetchWeather(city, unit) {
    try {
        showLoading();
        updateStatus(false);

        const url = `${API_URL}/weather/${encodeURIComponent(city)}?unit=${unit}`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`City "${city}" not found. Please check the spelling.`);
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`Server error (${response.status}). Please try again.`);
            }
        }

        const data = await response.json();
        updateStatus(true);
        displayWeather(data);
        updateTimestamp();

    } catch (err) {
        console.error('Error fetching weather:', err);
        showError(err.message || 'Failed to fetch weather data. Please try again.');
        updateStatus(false);
    }
}

/**
 * Fetch forecast data
 */
async function fetchForecast(city) {
    try {
        const url = `${API_URL}/forecast/${encodeURIComponent(city)}`;
        const response = await fetch(url);

        if (!response.ok) {
            forecastContainer.innerHTML = '<p style="color: var(--text-secondary);">Forecast unavailable</p>';
            return;
        }

        const data = await response.json();
        displayForecast(data);

    } catch (err) {
        console.error('Error fetching forecast:', err);
        forecastContainer.innerHTML = '<p style="color: var(--text-secondary);">Forecast unavailable</p>';
    }
}

/**
 * Fetch alerts data
 */
async function fetchAlerts(city) {
    try {
        const url = `${API_URL}/weather/${encodeURIComponent(city)}/alerts`;
        const response = await fetch(url);

        if (!response.ok) {
            return;
        }

        const data = await response.json();
        displayAlerts(data);

    } catch (err) {
        console.error('Error fetching alerts:', err);
    }
}

/**
 * Display weather data
 */
function displayWeather(data) {
    weatherDisplay.classList.remove('hidden');
    error.classList.add('hidden');
    loading.classList.add('hidden');

    // City and condition
    cityName.textContent = data.city || 'Unknown';
    weatherCondition.textContent = data.conditions || 'No data';

    // Temperature
    const temp = Math.round(data.temperature || 0);
    tempDisplay.textContent = temp;

    // Degree symbol
    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';
    degreeSymbol.textContent = unitSymbol;

    // Feels like - FIX: Try both possible field names
    let feelsLikeValue = data.feels_like !== undefined && data.feels_like !== null
        ? data.feels_like
        : data.feelslike;

    // If it's 0, show as '--' or calculate from temperature
    if (feelsLikeValue === 0 || feelsLikeValue === null || feelsLikeValue === undefined) {
        feelsLikeValue = data.temperature || '--';
    }

    feelsLike.textContent = Math.round(feelsLikeValue);

    // Weather icon
    const iconClass = getWeatherIcon(data.conditions);
    weatherIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;

    // Details - with null/undefined handling
    humidity.textContent = data.humidity !== undefined && data.humidity !== null
        ? `${Math.round(data.humidity)}%`
        : '--';

    windSpeed.textContent = data.wind_speed !== undefined && data.wind_speed !== null
        ? `${Math.round(data.wind_speed)} km/h`
        : '--';

    pressure.textContent = data.pressure !== undefined && data.pressure !== null
        ? `${Math.round(data.pressure)} hPa`
        : '--';

    visibility.textContent = data.visibility !== undefined && data.visibility !== null
        ? `${Math.round(data.visibility)} km`
        : '--';

    uvIndex.textContent = data.uv_index !== undefined && data.uv_index !== null
        ? Math.round(data.uv_index)
        : '--';

    // Sun times
    sunrise.textContent = data.sunrise || '--';
    sunset.textContent = data.sunset || '--';

    // Fetch forecast and alerts
    fetchForecast(data.city);
    fetchAlerts(data.city);
}

/**
 * Display forecast data
 */
function displayForecast(data) {
    if (!data.forecast || data.forecast.length === 0) {
        forecastContainer.innerHTML = '<p style="color: var(--text-secondary);">No forecast data available</p>';
        return;
    }

    forecastContainer.innerHTML = '';

    data.forecast.forEach(day => {
        const card = document.createElement('div');
        card.className = 'forecast-card';

        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        const iconClass = getWeatherIcon(day.conditions);
        const tempHigh = Math.round(day.temperature_high || 0);
        const tempLow = Math.round(day.temperature_low || 0);

        card.innerHTML = `
            <div class="day">${dayName}</div>
            <i class="fas ${iconClass}"></i>
            <div class="temp-high">${tempHigh}°</div>
            <div class="temp-low">${tempLow}°</div>
            <div class="condition">${day.conditions || ''}</div>
        `;

        forecastContainer.appendChild(card);
    });
}

/**
 * Display alerts data
 */
function displayAlerts(data) {
    if (!data.alerts || data.alerts.length === 0) {
        alertsContainer.innerHTML = `
            <div class="no-alerts">
                <i class="fas fa-check-circle"></i>
                <span>No active weather alerts</span>
            </div>
        `;
        return;
    }

    alertsContainer.innerHTML = '';

    data.alerts.forEach(alert => {
        const card = document.createElement('div');
        card.className = 'alert-card';

        card.innerHTML = `
            <div class="alert-title">⚠️ ${alert.event || 'Alert'}</div>
            <div class="alert-desc">${alert.description || 'No description'}</div>
        `;

        alertsContainer.appendChild(card);
    });
}

/**
 * Search for weather
 */
function searchWeather() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    currentCity = city;
    fetchWeather(city, currentUnit);
}

/**
 * Change unit (Celsius/Fahrenheit)
 */
function changeUnit(unit) {
    currentUnit = unit;

    // Update button states
    unitBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.unit === unit);
    });

    // Refresh weather with new unit
    if (currentCity) {
        fetchWeather(currentCity, unit);
    }
}

/**
 * Check API health
 */
async function checkHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
            updateStatus(true);
        } else {
            updateStatus(false);
        }
    } catch (err) {
        updateStatus(false);
    }
}

/**
 * Initialize Event Listeners
 */
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

unitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        changeUnit(btn.dataset.unit);
    });
});

/**
 * Initialize
 */
console.log('🌤️ Weather Dashboard loaded!');
console.log('📡 API URL:', API_URL);

// Load default city
fetchWeather('London', 'metric');

// Check health every 30 seconds
setInterval(checkHealth, 30000);
checkHealth();

// Update timestamp every minute
setInterval(updateTimestamp, 60000);
