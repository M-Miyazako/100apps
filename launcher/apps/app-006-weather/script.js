// Weather App JavaScript

class WeatherApp {
    constructor() {
        this.currentUnit = 'celsius';
        this.currentCity = 'New York';
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCurrentDate();
        this.loadWeatherData(this.currentCity);
    }

    bindEvents() {
        const searchBtn = document.getElementById('searchBtn');
        const cityInput = document.getElementById('cityInput');
        const unitToggle = document.getElementById('unitToggle');

        searchBtn.addEventListener('click', () => this.handleSearch());
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
        unitToggle.addEventListener('click', () => this.toggleUnit());
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
    }

    // Mock weather data for different cities
    getMockWeatherData(city) {
        const weatherData = {
            'New York': {
                current: {
                    temperature: 22,
                    condition: 'Sunny',
                    humidity: 65,
                    windSpeed: 12,
                    feelsLike: 24,
                    icon: 'sunny'
                },
                forecast: [
                    { day: 'Tomorrow', high: 25, low: 18, condition: 'Partly Cloudy', icon: 'cloudy' },
                    { day: 'Tuesday', high: 28, low: 20, condition: 'Sunny', icon: 'sunny' },
                    { day: 'Wednesday', high: 19, low: 14, condition: 'Rainy', icon: 'rainy' },
                    { day: 'Thursday', high: 23, low: 16, condition: 'Cloudy', icon: 'cloudy' },
                    { day: 'Friday', high: 26, low: 19, condition: 'Sunny', icon: 'sunny' }
                ]
            },
            'London': {
                current: {
                    temperature: 15,
                    condition: 'Cloudy',
                    humidity: 78,
                    windSpeed: 8,
                    feelsLike: 13,
                    icon: 'cloudy'
                },
                forecast: [
                    { day: 'Tomorrow', high: 17, low: 12, condition: 'Rainy', icon: 'rainy' },
                    { day: 'Tuesday', high: 16, low: 11, condition: 'Cloudy', icon: 'cloudy' },
                    { day: 'Wednesday', high: 18, low: 13, condition: 'Partly Cloudy', icon: 'cloudy' },
                    { day: 'Thursday', high: 20, low: 15, condition: 'Sunny', icon: 'sunny' },
                    { day: 'Friday', high: 19, low: 14, condition: 'Cloudy', icon: 'cloudy' }
                ]
            },
            'Tokyo': {
                current: {
                    temperature: 28,
                    condition: 'Partly Cloudy',
                    humidity: 72,
                    windSpeed: 15,
                    feelsLike: 30,
                    icon: 'cloudy'
                },
                forecast: [
                    { day: 'Tomorrow', high: 30, low: 24, condition: 'Sunny', icon: 'sunny' },
                    { day: 'Tuesday', high: 32, low: 26, condition: 'Sunny', icon: 'sunny' },
                    { day: 'Wednesday', high: 27, low: 22, condition: 'Rainy', icon: 'rainy' },
                    { day: 'Thursday', high: 25, low: 20, condition: 'Stormy', icon: 'stormy' },
                    { day: 'Friday', high: 29, low: 23, condition: 'Cloudy', icon: 'cloudy' }
                ]
            },
            'Sydney': {
                current: {
                    temperature: 24,
                    condition: 'Sunny',
                    humidity: 58,
                    windSpeed: 18,
                    feelsLike: 26,
                    icon: 'sunny'
                },
                forecast: [
                    { day: 'Tomorrow', high: 26, low: 19, condition: 'Sunny', icon: 'sunny' },
                    { day: 'Tuesday', high: 28, low: 21, condition: 'Partly Cloudy', icon: 'cloudy' },
                    { day: 'Wednesday', high: 25, low: 18, condition: 'Cloudy', icon: 'cloudy' },
                    { day: 'Thursday', high: 23, low: 17, condition: 'Rainy', icon: 'rainy' },
                    { day: 'Friday', high: 27, low: 20, condition: 'Sunny', icon: 'sunny' }
                ]
            },
            'Paris': {
                current: {
                    temperature: 18,
                    condition: 'Rainy',
                    humidity: 85,
                    windSpeed: 10,
                    feelsLike: 16,
                    icon: 'rainy'
                },
                forecast: [
                    { day: 'Tomorrow', high: 20, low: 14, condition: 'Cloudy', icon: 'cloudy' },
                    { day: 'Tuesday', high: 22, low: 16, condition: 'Partly Cloudy', icon: 'cloudy' },
                    { day: 'Wednesday', high: 24, low: 18, condition: 'Sunny', icon: 'sunny' },
                    { day: 'Thursday', high: 21, low: 15, condition: 'Rainy', icon: 'rainy' },
                    { day: 'Friday', high: 19, low: 13, condition: 'Cloudy', icon: 'cloudy' }
                ]
            },
            'Moscow': {
                current: {
                    temperature: -5,
                    condition: 'Snowy',
                    humidity: 92,
                    windSpeed: 25,
                    feelsLike: -8,
                    icon: 'snowy'
                },
                forecast: [
                    { day: 'Tomorrow', high: -3, low: -8, condition: 'Snowy', icon: 'snowy' },
                    { day: 'Tuesday', high: -1, low: -6, condition: 'Cloudy', icon: 'cloudy' },
                    { day: 'Wednesday', high: 2, low: -4, condition: 'Partly Cloudy', icon: 'cloudy' },
                    { day: 'Thursday', high: 0, low: -5, condition: 'Snowy', icon: 'snowy' },
                    { day: 'Friday', high: -2, low: -7, condition: 'Stormy', icon: 'stormy' }
                ]
            },
            'Miami': {
                current: {
                    temperature: 32,
                    condition: 'Stormy',
                    humidity: 88,
                    windSpeed: 35,
                    feelsLike: 38,
                    icon: 'stormy'
                },
                forecast: [
                    { day: 'Tomorrow', high: 30, low: 26, condition: 'Rainy', icon: 'rainy' },
                    { day: 'Tuesday', high: 33, low: 28, condition: 'Sunny', icon: 'sunny' },
                    { day: 'Wednesday', high: 31, low: 27, condition: 'Stormy', icon: 'stormy' },
                    { day: 'Thursday', high: 29, low: 25, condition: 'Cloudy', icon: 'cloudy' },
                    { day: 'Friday', high: 34, low: 29, condition: 'Sunny', icon: 'sunny' }
                ]
            }
        };

        // Default to a random city if not found
        const availableCities = Object.keys(weatherData);
        const normalizedCity = this.findBestCityMatch(city, availableCities);
        
        if (normalizedCity) {
            return weatherData[normalizedCity];
        }

        // Generate random data for unknown cities
        return this.generateRandomWeatherData();
    }

    findBestCityMatch(inputCity, availableCities) {
        const input = inputCity.toLowerCase().trim();
        
        // Direct match
        for (const city of availableCities) {
            if (city.toLowerCase() === input) {
                return city;
            }
        }
        
        // Partial match
        for (const city of availableCities) {
            if (city.toLowerCase().includes(input) || input.includes(city.toLowerCase())) {
                return city;
            }
        }
        
        return null;
    }

    generateRandomWeatherData() {
        const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Stormy'];
        const icons = ['sunny', 'cloudy', 'rainy', 'cloudy', 'stormy'];
        
        const randomCondition = Math.floor(Math.random() * conditions.length);
        const baseTemp = Math.floor(Math.random() * 30) + 5; // 5-35°C
        
        return {
            current: {
                temperature: baseTemp,
                condition: conditions[randomCondition],
                humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
                windSpeed: Math.floor(Math.random() * 30) + 5, // 5-35 km/h
                feelsLike: baseTemp + Math.floor(Math.random() * 6) - 3, // ±3°C
                icon: icons[randomCondition]
            },
            forecast: this.generateRandomForecast(baseTemp)
        };
    }

    generateRandomForecast(baseTemp) {
        const days = ['Tomorrow', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Stormy'];
        const icons = ['sunny', 'cloudy', 'rainy', 'cloudy', 'stormy'];
        
        return days.map(day => {
            const randomCondition = Math.floor(Math.random() * conditions.length);
            const tempVariation = Math.floor(Math.random() * 10) - 5; // ±5°C
            const high = baseTemp + tempVariation + Math.floor(Math.random() * 5);
            const low = high - Math.floor(Math.random() * 8) - 3;
            
            return {
                day,
                high,
                low,
                condition: conditions[randomCondition],
                icon: icons[randomCondition]
            };
        });
    }

    async handleSearch() {
        const cityInput = document.getElementById('cityInput');
        const city = cityInput.value.trim();
        
        if (!city) {
            this.showError('Please enter a city name');
            return;
        }

        await this.loadWeatherData(city);
        cityInput.value = '';
    }

    async loadWeatherData(city) {
        this.showLoading();
        
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const weatherData = this.getMockWeatherData(city);
            this.currentCity = city;
            this.displayWeatherData(weatherData);
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            this.showError(`Unable to load weather data for ${city}`);
        }
    }

    displayWeatherData(data) {
        this.displayCurrentWeather(data.current);
        this.displayForecast(data.forecast);
    }

    displayCurrentWeather(current) {
        document.getElementById('currentCity').textContent = this.currentCity;
        document.getElementById('currentTemp').textContent = this.formatTemperature(current.temperature);
        document.getElementById('currentCondition').textContent = current.condition;
        document.getElementById('currentHumidity').textContent = `${current.humidity}%`;
        document.getElementById('currentWindSpeed').textContent = `${current.windSpeed} km/h`;
        document.getElementById('feelsLike').textContent = this.formatTemperature(current.feelsLike) + '°' + (this.currentUnit === 'celsius' ? 'C' : 'F');
        
        const iconElement = document.getElementById('mainWeatherIcon');
        iconElement.className = `weather-icon-display ${current.icon}`;
    }

    displayForecast(forecast) {
        const container = document.getElementById('forecastContainer');
        container.innerHTML = '';
        
        forecast.forEach(day => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            forecastItem.innerHTML = `
                <div class="forecast-day">${day.day}</div>
                <div class="forecast-icon weather-icon-display ${day.icon}"></div>
                <div class="forecast-temps">
                    <span class="forecast-high">${this.formatTemperature(day.high)}°</span>
                    <span class="forecast-low">${this.formatTemperature(day.low)}°</span>
                </div>
                <div class="forecast-condition">${day.condition}</div>
            `;
            
            container.appendChild(forecastItem);
        });
    }

    toggleUnit() {
        this.currentUnit = this.currentUnit === 'celsius' ? 'fahrenheit' : 'celsius';
        const toggleBtn = document.getElementById('unitToggle');
        toggleBtn.textContent = this.currentUnit === 'celsius' ? '°F' : '°C';
        
        // Update the unit display
        const unitDisplay = document.querySelector('.unit');
        unitDisplay.textContent = this.currentUnit === 'celsius' ? '°C' : '°F';
        
        // Reload current weather data to update temperatures
        this.loadWeatherData(this.currentCity);
    }

    formatTemperature(celsius) {
        if (this.currentUnit === 'fahrenheit') {
            return Math.round((celsius * 9/5) + 32);
        }
        return Math.round(celsius);
    }

    showLoading() {
        document.getElementById('loadingSpinner').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingSpinner').classList.add('hidden');
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.querySelector('p').textContent = message;
        errorElement.classList.remove('hidden');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 3000);
    }
}

// Initialize the weather app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add click-to-refresh functionality on weather icon
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('weather-icon-display')) {
            const app = new WeatherApp();
            app.loadWeatherData(app.currentCity);
        }
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' && e.ctrlKey) {
            e.preventDefault();
            const app = new WeatherApp();
            app.loadWeatherData(app.currentCity);
        }
    });
});