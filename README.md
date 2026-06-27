<div align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Flask-3.0.0-blue?style=for-the-badge&logo=flask&logoColor=white" alt="Flask">
  <img src="https://img.shields.io/badge/Redis-5.0.1-red?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript&logoColor=white" alt="JavaScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</div>

<br>

<h1 align="center">🌤️ Weather API & Dashboard</h1>

<p align="center">
  <strong>A production-ready full-stack weather application with real-time data, caching, and a beautiful dashboard.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-live-demo">Live Demo</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-documentation">API Docs</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-contributing">Contributing</a>
</p>

<br>

## 📸 Screenshots

<div align="center">
  <img src="https://github.com/nurulloshub/weather-api/raw/main/screenshots/dashboard.png" alt="Weather Dashboard" width="600">
  <br>
  <em>Beautiful weather dashboard with real-time data</em>
</div>

<br>

## ✨ Features

### Backend (API)
- ✅ **RESTful API** with Flask
- ✅ **Redis Caching** - 12-hour TTL for fast responses
- ✅ **Rate Limiting** - 100 requests/hour per IP
- ✅ **Real-time Weather** - Powered by Visual Crossing API
- ✅ **5-Day Forecast** - Detailed daily predictions
- ✅ **Weather Alerts** - Severe weather warnings
- ✅ **Unit Conversion** - Celsius/Fahrenheit toggle
- ✅ **Error Handling** - Graceful failures with meaningful messages
- ✅ **Health Checks** - Monitoring endpoint
- ✅ **Cache Management** - Stats and clear endpoints

### Frontend (Dashboard)
- ✅ **Modern UI** - Clean, responsive, glass-morphism design
- ✅ **Search Cities** - 100,000+ cities worldwide
- ✅ **Current Weather** - Temperature, conditions, feels like
- ✅ **Detailed Metrics** - Humidity, wind, pressure, visibility, UV index
- ✅ **5-Day Forecast** - Visual forecast cards
- ✅ **Weather Alerts** - Active warnings display
- ✅ **Unit Toggle** - Celsius/Fahrenheit switch
- ✅ **Loading States** - Smooth user experience
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Responsive Design** - Works on all devices

<br>

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Python 3.8+** | Programming language |
| **Flask 3.0** | Web framework |
| **Redis 5.0** | Caching layer |
| **Flask-Limiter** | Rate limiting |
| **Requests** | HTTP client for API calls |
| **Gunicorn** | Production WSGI server |

### Frontend
| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure |
| **CSS3** | Styling with glass-morphism |
| **JavaScript ES6+** | Interactivity and API calls |
| **Font Awesome** | Weather icons |
| **Google Fonts** | Typography (Inter) |

### Deployment
| Service | Purpose |
|---------|---------|
| **Render** | Backend hosting |
| **Netlify** | Frontend hosting |
| **GitHub** | Version control |

<br>

## 🚀 Live Demo

### 🌐 Frontend Dashboard
[https://weather-dashboard.netlify.app](https://weather-dashboard.netlify.app)

### 🔌 Backend API
[https://weather-api.onrender.com](https://weather-api.onrender.com)

### 📚 API Documentation
Postman Collection: [Weather API Collection](https://documenter.getpostman.com/view/...)

<br>

## 📋 Quick Start

### Prerequisites
- Python 3.8 or higher
- Redis server (optional, fallback cache available)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/nurulloshub/weather-api.git
cd weather-api