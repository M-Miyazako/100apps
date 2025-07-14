class WeatherWidget {
    constructor() {
        this.API_KEY = ''; // 実際のAPIキーを設定する場合はここに入力
        this.favorites = JSON.parse(localStorage.getItem('weather-favorites') || '[]');
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadFavorites();
        this.loadDefaultWeather();
    }
    
    initializeElements() {
        this.locationInput = document.getElementById('location-input');
        this.searchBtn = document.getElementById('search-btn');
        this.locationBtn = document.getElementById('location-btn');
        this.loading = document.getElementById('loading');
        this.weatherMain = document.getElementById('weather-main');
        this.errorMessage = document.getElementById('error-message');
        this.errorText = document.getElementById('error-text');
        
        // Weather display elements
        this.locationName = document.getElementById('location-name');
        this.currentDate = document.getElementById('current-date');
        this.weatherEmoji = document.getElementById('weather-emoji');
        this.currentTemp = document.getElementById('current-temp');
        this.weatherDesc = document.getElementById('weather-desc');
        this.feelsLike = document.getElementById('feels-like');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('wind-speed');
        this.visibility = document.getElementById('visibility');
        this.sunrise = document.getElementById('sunrise');
        this.sunset = document.getElementById('sunset');
        this.pressure = document.getElementById('pressure');
        this.forecastContainer = document.getElementById('forecast-container');
        this.hourlyContainer = document.getElementById('hourly-container');
        this.favoritesContainer = document.getElementById('favorites-container');
    }
    
    setupEventListeners() {
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        this.locationBtn.addEventListener('click', () => this.getCurrentLocationWeather());
        this.locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
    }
    
    loadDefaultWeather() {
        // デモ用のデフォルト天気データを表示
        const defaultWeather = {
            location: '東京',
            temperature: 25,
            description: '晴れ',
            feelsLike: 27,
            humidity: 60,
            windSpeed: 5,
            visibility: 10,
            sunrise: '06:30',
            sunset: '18:30',
            pressure: 1013,
            emoji: '☀️'
        };
        
        this.displayWeatherData(defaultWeather);
        this.generateForecastData();
        this.generateHourlyData();
    }
    
    async searchWeather() {
        const location = this.locationInput.value.trim();
        if (!location) return;
        
        this.showLoading();
        
        try {
            // 実際のAPIを使用する場合はここで天気データを取得
            // const weatherData = await this.fetchWeatherData(location);
            
            // デモ用のモックデータ
            const mockWeather = this.generateMockWeather(location);
            
            setTimeout(() => {
                this.displayWeatherData(mockWeather);
                this.generateForecastData();
                this.generateHourlyData();
                this.hideLoading();
                this.addToFavorites(location);
            }, 1000);
            
        } catch (error) {
            this.showError('天気情報の取得に失敗しました。都市名を確認してください。');
        }
    }
    
    async getCurrentLocationWeather() {
        if (!navigator.geolocation) {
            this.showError('位置情報がサポートされていません。');
            return;
        }
        
        this.showLoading();
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                // 実際のAPIを使用する場合はここで座標から天気データを取得
                // const weatherData = await this.fetchWeatherByCoords(latitude, longitude);
                
                // デモ用のモックデータ
                const mockWeather = this.generateMockWeather('現在地');
                
                setTimeout(() => {
                    this.displayWeatherData(mockWeather);
                    this.generateForecastData();
                    this.generateHourlyData();
                    this.hideLoading();
                }, 1000);
            },
            (error) => {
                this.showError('位置情報の取得に失敗しました。');
            }
        );
    }
    
    generateMockWeather(location) {
        const weathers = [
            { emoji: '☀️', desc: '晴れ', temp: 25 },
            { emoji: '⛅', desc: '曇り', temp: 22 },
            { emoji: '🌧️', desc: '雨', temp: 18 },
            { emoji: '⛈️', desc: '雷雨', temp: 20 },
            { emoji: '❄️', desc: '雪', temp: 5 },
            { emoji: '🌫️', desc: '霧', temp: 15 }
        ];
        
        const weather = weathers[Math.floor(Math.random() * weathers.length)];
        
        return {
            location: location,
            temperature: weather.temp + Math.floor(Math.random() * 10 - 5),
            description: weather.desc,
            feelsLike: weather.temp + Math.floor(Math.random() * 6 - 3),
            humidity: 40 + Math.floor(Math.random() * 40),
            windSpeed: 2 + Math.floor(Math.random() * 8),
            visibility: 8 + Math.floor(Math.random() * 5),
            sunrise: '06:' + (20 + Math.floor(Math.random() * 40)).toString().padStart(2, '0'),
            sunset: '18:' + (10 + Math.floor(Math.random() * 40)).toString().padStart(2, '0'),
            pressure: 1000 + Math.floor(Math.random() * 40),
            emoji: weather.emoji
        };
    }
    
    displayWeatherData(weather) {
        this.locationName.textContent = weather.location;
        this.currentDate.textContent = new Date().toLocaleDateString('ja-JP', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        this.weatherEmoji.textContent = weather.emoji;
        this.currentTemp.textContent = weather.temperature;
        this.weatherDesc.textContent = weather.description;
        this.feelsLike.textContent = `体感温度: ${weather.feelsLike}°C`;
        this.humidity.textContent = `${weather.humidity}%`;
        this.windSpeed.textContent = `${weather.windSpeed} m/s`;
        this.visibility.textContent = `${weather.visibility} km`;
        this.sunrise.textContent = weather.sunrise;
        this.sunset.textContent = weather.sunset;
        this.pressure.textContent = `${weather.pressure} hPa`;
        
        this.weatherMain.classList.add('weather-update');
        setTimeout(() => {
            this.weatherMain.classList.remove('weather-update');
        }, 500);
    }
    
    generateForecastData() {
        const days = ['今日', '明日', '明後日', '3日後', '4日後'];
        const weathers = [
            { emoji: '☀️', desc: '晴れ' },
            { emoji: '⛅', desc: '曇り' },
            { emoji: '🌧️', desc: '雨' },
            { emoji: '⛈️', desc: '雷雨' },
            { emoji: '❄️', desc: '雪' }
        ];
        
        this.forecastContainer.innerHTML = '';
        
        days.forEach((day, index) => {
            const weather = weathers[Math.floor(Math.random() * weathers.length)];
            const high = 20 + Math.floor(Math.random() * 15);
            const low = high - 5 - Math.floor(Math.random() * 10);
            
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="forecast-day">${day}</div>
                <div class="forecast-icon">${weather.emoji}</div>
                <div class="forecast-temps">
                    <span class="forecast-high">${high}°</span>
                    <span class="forecast-low">${low}°</span>
                </div>
            `;
            
            this.forecastContainer.appendChild(forecastItem);
        });
    }
    
    generateHourlyData() {
        const weathers = ['☀️', '⛅', '🌧️', '⛈️', '❄️', '🌫️'];
        
        this.hourlyContainer.innerHTML = '';
        
        for (let i = 0; i < 24; i++) {
            const hour = new Date();
            hour.setHours(hour.getHours() + i);
            
            const weather = weathers[Math.floor(Math.random() * weathers.length)];
            const temp = 15 + Math.floor(Math.random() * 20);
            
            const hourlyItem = document.createElement('div');
            hourlyItem.className = 'hourly-item';
            hourlyItem.innerHTML = `
                <div class="hourly-time">${hour.getHours()}:00</div>
                <div class="hourly-icon">${weather}</div>
                <div class="hourly-temp">${temp}°</div>
            `;
            
            this.hourlyContainer.appendChild(hourlyItem);
        }
    }
    
    addToFavorites(location) {
        if (!this.favorites.includes(location) && location !== '現在地') {
            this.favorites.push(location);
            if (this.favorites.length > 5) {
                this.favorites.shift(); // 最大5個まで
            }
            localStorage.setItem('weather-favorites', JSON.stringify(this.favorites));
            this.loadFavorites();
        }
    }
    
    loadFavorites() {
        this.favoritesContainer.innerHTML = '';
        
        this.favorites.forEach(location => {
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'favorite-item';
            favoriteItem.innerHTML = `
                <span>${location}</span>
                <button class="favorite-remove" onclick="weatherWidget.removeFavorite('${location}')">×</button>
            `;
            
            favoriteItem.addEventListener('click', (e) => {
                if (e.target.classList.contains('favorite-remove')) return;
                this.locationInput.value = location;
                this.searchWeather();
            });
            
            this.favoritesContainer.appendChild(favoriteItem);
        });
    }
    
    removeFavorite(location) {
        this.favorites = this.favorites.filter(fav => fav !== location);
        localStorage.setItem('weather-favorites', JSON.stringify(this.favorites));
        this.loadFavorites();
    }
    
    showLoading() {
        this.loading.style.display = 'block';
        this.weatherMain.style.display = 'none';
        this.errorMessage.style.display = 'none';
    }
    
    hideLoading() {
        this.loading.style.display = 'none';
        this.weatherMain.style.display = 'block';
        this.errorMessage.style.display = 'none';
    }
    
    showError(message) {
        this.loading.style.display = 'none';
        this.weatherMain.style.display = 'none';
        this.errorMessage.style.display = 'block';
        this.errorText.textContent = message;
    }
    
    // 実際のAPIを使用する場合のメソッド例
    async fetchWeatherData(location) {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${this.API_KEY}&units=metric&lang=ja`
        );
        
        if (!response.ok) {
            throw new Error('Weather data not found');
        }
        
        return await response.json();
    }
    
    async fetchWeatherByCoords(lat, lon) {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric&lang=ja`
        );
        
        if (!response.ok) {
            throw new Error('Weather data not found');
        }
        
        return await response.json();
    }
}

// Initialize the weather widget when the page loads
let weatherWidget;
document.addEventListener('DOMContentLoaded', () => {
    weatherWidget = new WeatherWidget();
});