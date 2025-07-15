// Color Picker App - Complete JavaScript Implementation

class ColorPicker {
    constructor() {
        this.currentColor = { h: 0, s: 100, l: 50 };
        this.colorHistory = JSON.parse(localStorage.getItem('colorHistory') || '[]');
        this.colorFavorites = JSON.parse(localStorage.getItem('colorFavorites') || '[]');
        this.gradientColors = [
            { color: '#ff0000', position: 0 },
            { color: '#0000ff', position: 100 }
        ];
        
        this.initializeElements();
        this.bindEvents();
        this.setupColorWheel();
        this.updateColor();
        this.loadHistory();
        this.loadFavorites();
        this.updateGradient();
    }

    initializeElements() {
        // Color display elements
        this.colorPreview = document.getElementById('colorPreview');
        this.hexInput = document.getElementById('hexInput');
        this.rgbInput = document.getElementById('rgbInput');
        this.hslInput = document.getElementById('hslInput');

        // Slider elements
        this.hueSlider = document.getElementById('hueSlider');
        this.saturationSlider = document.getElementById('saturationSlider');
        this.lightnessSlider = document.getElementById('lightnessSlider');
        this.hueValue = document.getElementById('hueValue');
        this.saturationValue = document.getElementById('saturationValue');
        this.lightnessValue = document.getElementById('lightnessValue');

        // Color wheel elements
        this.colorWheel = document.getElementById('colorWheel');
        this.wheelCursor = document.getElementById('wheelCursor');
        this.ctx = this.colorWheel.getContext('2d');

        // Harmony elements
        this.harmonyType = document.getElementById('harmonyType');
        this.harmonyColors = document.getElementById('harmonyColors');

        // Gradient elements
        this.gradientType = document.getElementById('gradientType');
        this.gradientDirection = document.getElementById('gradientDirection');
        this.gradientPreview = document.getElementById('gradientPreview');
        this.gradientColors = document.getElementById('gradientColors');
        this.gradientCSS = document.getElementById('gradientCSS');

        // History and favorites elements
        this.colorHistory = document.getElementById('colorHistory');
        this.colorFavorites = document.getElementById('colorFavorites');

        // Toast element
        this.toast = document.getElementById('toast');
    }

    bindEvents() {
        // Slider events
        this.hueSlider.addEventListener('input', (e) => {
            this.currentColor.h = parseInt(e.target.value);
            this.updateColor();
        });

        this.saturationSlider.addEventListener('input', (e) => {
            this.currentColor.s = parseInt(e.target.value);
            this.updateColor();
        });

        this.lightnessSlider.addEventListener('input', (e) => {
            this.currentColor.l = parseInt(e.target.value);
            this.updateColor();
        });

        // Color wheel events
        this.colorWheel.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.updateColorFromWheel(e);
        });

        this.colorWheel.addEventListener('mousemove', (e) => {
            if (this.isMouseDown) {
                this.updateColorFromWheel(e);
            }
        });

        document.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        // Copy button events
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.getAttribute('data-target');
                this.copyToClipboard(target);
            });
        });

        // Harmony events
        document.getElementById('generateHarmony').addEventListener('click', () => {
            this.generateHarmony();
        });

        // Gradient events
        this.gradientType.addEventListener('change', () => this.updateGradient());
        this.gradientDirection.addEventListener('change', () => this.updateGradient());
        
        document.getElementById('addGradientColor').addEventListener('click', () => {
            this.addGradientColor();
        });

        // History and favorites events
        document.getElementById('addToFavorites').addEventListener('click', () => {
            this.addToFavorites();
        });

        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });

        document.getElementById('clearFavorites').addEventListener('click', () => {
            this.clearFavorites();
        });
    }

    setupColorWheel() {
        const canvas = this.colorWheel;
        const ctx = this.ctx;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw color wheel
        for (let angle = 0; angle < 360; angle += 1) {
            const startAngle = (angle - 1) * Math.PI / 180;
            const endAngle = angle * Math.PI / 180;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.lineWidth = 2;
            ctx.strokeStyle = `hsl(${angle}, 100%, 50%)`;
            ctx.stroke();
        }

        // Draw saturation/lightness gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    updateColorFromWheel(e) {
        const rect = this.colorWheel.getBoundingClientRect();
        const x = e.clientX - rect.left - this.colorWheel.width / 2;
        const y = e.clientY - rect.top - this.colorWheel.height / 2;
        
        const angle = Math.atan2(y, x) * 180 / Math.PI;
        const hue = angle < 0 ? angle + 360 : angle;
        
        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = Math.min(this.colorWheel.width, this.colorWheel.height) / 2 - 10;
        
        if (distance <= maxDistance) {
            this.currentColor.h = Math.round(hue);
            this.currentColor.s = Math.round((distance / maxDistance) * 100);
            this.updateColor();
        }
    }

    updateColor() {
        const { h, s, l } = this.currentColor;
        
        // Update sliders
        this.hueSlider.value = h;
        this.saturationSlider.value = s;
        this.lightnessSlider.value = l;
        
        // Update value displays
        this.hueValue.textContent = h + '°';
        this.saturationValue.textContent = s + '%';
        this.lightnessValue.textContent = l + '%';
        
        // Update color preview
        const hslColor = `hsl(${h}, ${s}%, ${l}%)`;
        this.colorPreview.style.backgroundColor = hslColor;
        
        // Update format inputs
        const rgb = this.hslToRgb(h, s, l);
        const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        
        this.hexInput.value = hex;
        this.rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        this.hslInput.value = hslColor;
        
        // Update wheel cursor
        this.updateWheelCursor();
        
        // Add to history
        this.addToHistory(hex);
    }

    updateWheelCursor() {
        const { h, s } = this.currentColor;
        const centerX = this.colorWheel.width / 2;
        const centerY = this.colorWheel.height / 2;
        const radius = (Math.min(centerX, centerY) - 10) * (s / 100);
        
        const angle = h * Math.PI / 180;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        this.wheelCursor.style.left = x + 'px';
        this.wheelCursor.style.top = y + 'px';
    }

    // Color conversion functions
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = l - c / 2;
        
        let r, g, b;
        
        if (h < 1/6) {
            r = c; g = x; b = 0;
        } else if (h < 2/6) {
            r = x; g = c; b = 0;
        } else if (h < 3/6) {
            r = 0; g = c; b = x;
        } else if (h < 4/6) {
            r = 0; g = x; b = c;
        } else if (h < 5/6) {
            r = x; g = 0; b = c;
        } else {
            r = c; g = 0; b = x;
        }
        
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Copy to clipboard functionality
    async copyToClipboard(targetId) {
        const element = document.getElementById(targetId);
        try {
            await navigator.clipboard.writeText(element.value);
            this.showToast('Copied to clipboard!');
        } catch (err) {
            // Fallback for older browsers
            element.select();
            document.execCommand('copy');
            this.showToast('Copied to clipboard!');
        }
    }

    // Toast notification
    showToast(message, isError = false) {
        this.toast.textContent = message;
        this.toast.className = `toast ${isError ? 'error' : ''} show`;
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    // Color harmony generation
    generateHarmony() {
        const type = this.harmonyType.value;
        const baseHue = this.currentColor.h;
        const { s, l } = this.currentColor;
        
        let harmonies = [];
        
        switch (type) {
            case 'monochromatic':
                harmonies = this.generateMonochromatic(baseHue, s, l);
                break;
            case 'analogous':
                harmonies = this.generateAnalogous(baseHue, s, l);
                break;
            case 'complementary':
                harmonies = this.generateComplementary(baseHue, s, l);
                break;
            case 'triadic':
                harmonies = this.generateTriadic(baseHue, s, l);
                break;
            case 'tetradic':
                harmonies = this.generateTetradic(baseHue, s, l);
                break;
            case 'split-complementary':
                harmonies = this.generateSplitComplementary(baseHue, s, l);
                break;
        }
        
        this.displayHarmonyColors(harmonies);
    }

    generateMonochromatic(h, s, l) {
        return [
            { h, s, l: Math.max(10, l - 30) },
            { h, s, l: Math.max(10, l - 15) },
            { h, s, l },
            { h, s, l: Math.min(90, l + 15) },
            { h, s, l: Math.min(90, l + 30) }
        ];
    }

    generateAnalogous(h, s, l) {
        return [
            { h: (h - 60 + 360) % 360, s, l },
            { h: (h - 30 + 360) % 360, s, l },
            { h, s, l },
            { h: (h + 30) % 360, s, l },
            { h: (h + 60) % 360, s, l }
        ];
    }

    generateComplementary(h, s, l) {
        return [
            { h, s, l },
            { h: (h + 180) % 360, s, l }
        ];
    }

    generateTriadic(h, s, l) {
        return [
            { h, s, l },
            { h: (h + 120) % 360, s, l },
            { h: (h + 240) % 360, s, l }
        ];
    }

    generateTetradic(h, s, l) {
        return [
            { h, s, l },
            { h: (h + 90) % 360, s, l },
            { h: (h + 180) % 360, s, l },
            { h: (h + 270) % 360, s, l }
        ];
    }

    generateSplitComplementary(h, s, l) {
        return [
            { h, s, l },
            { h: (h + 150) % 360, s, l },
            { h: (h + 210) % 360, s, l }
        ];
    }

    displayHarmonyColors(harmonies) {
        this.harmonyColors.innerHTML = '';
        
        harmonies.forEach(color => {
            const rgb = this.hslToRgb(color.h, color.s, color.l);
            const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
            
            const colorDiv = document.createElement('div');
            colorDiv.className = 'harmony-color';
            colorDiv.style.backgroundColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
            colorDiv.setAttribute('data-color', hex);
            
            colorDiv.addEventListener('click', () => {
                this.currentColor = color;
                this.updateColor();
            });
            
            this.harmonyColors.appendChild(colorDiv);
        });
    }

    // Gradient functionality
    addGradientColor() {
        const container = this.gradientColors;
        const colorStop = document.createElement('div');
        colorStop.className = 'gradient-color-stop';
        
        const currentHex = this.hexInput.value;
        const position = 50;
        
        colorStop.innerHTML = `
            <input type="color" value="${currentHex}">
            <input type="range" min="0" max="100" value="${position}">
            <span>${position}%</span>
            <button class="remove-color">×</button>
        `;
        
        // Add event listeners for the new color stop
        const colorInput = colorStop.querySelector('input[type="color"]');
        const rangeInput = colorStop.querySelector('input[type="range"]');
        const spanElement = colorStop.querySelector('span');
        const removeBtn = colorStop.querySelector('.remove-color');
        
        colorInput.addEventListener('change', () => this.updateGradient());
        rangeInput.addEventListener('input', (e) => {
            spanElement.textContent = e.target.value + '%';
            this.updateGradient();
        });
        
        removeBtn.addEventListener('click', () => {
            if (container.children.length > 2) {
                colorStop.remove();
                this.updateGradient();
            }
        });
        
        container.appendChild(colorStop);
        this.updateGradient();
    }

    updateGradient() {
        const colorStops = Array.from(this.gradientColors.children);
        const stops = colorStops.map(stop => {
            const color = stop.querySelector('input[type="color"]').value;
            const position = stop.querySelector('input[type="range"]').value;
            return { color, position: parseInt(position) };
        });
        
        // Sort by position
        stops.sort((a, b) => a.position - b.position);
        
        const type = this.gradientType.value;
        const direction = this.gradientDirection.value;
        
        let gradientCSS;
        const colorString = stops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
        
        if (type === 'linear') {
            gradientCSS = `linear-gradient(${direction}, ${colorString})`;
        } else {
            gradientCSS = `radial-gradient(circle, ${colorString})`;
        }
        
        this.gradientPreview.style.background = gradientCSS;
        this.gradientCSS.value = `background: ${gradientCSS};`;
    }

    // History and favorites functionality
    addToHistory(color) {
        if (!this.colorHistoryArray.includes(color)) {
            this.colorHistoryArray.unshift(color);
            if (this.colorHistoryArray.length > 20) {
                this.colorHistoryArray.pop();
            }
            localStorage.setItem('colorHistory', JSON.stringify(this.colorHistoryArray));
            this.loadHistory();
        }
    }

    addToFavorites() {
        const color = this.hexInput.value;
        if (!this.colorFavoritesArray.includes(color)) {
            this.colorFavoritesArray.unshift(color);
            localStorage.setItem('colorFavorites', JSON.stringify(this.colorFavoritesArray));
            this.loadFavorites();
            this.showToast('Added to favorites!');
        } else {
            this.showToast('Color already in favorites!', true);
        }
    }

    loadHistory() {
        this.colorHistoryArray = JSON.parse(localStorage.getItem('colorHistory') || '[]');
        this.colorHistory.innerHTML = '';
        
        this.colorHistoryArray.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'color-item';
            colorDiv.style.backgroundColor = color;
            colorDiv.setAttribute('data-color', color);
            
            colorDiv.addEventListener('click', () => {
                this.setColorFromHex(color);
            });
            
            this.colorHistory.appendChild(colorDiv);
        });
    }

    loadFavorites() {
        this.colorFavoritesArray = JSON.parse(localStorage.getItem('colorFavorites') || '[]');
        this.colorFavorites.innerHTML = '';
        
        this.colorFavoritesArray.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'color-item';
            colorDiv.style.backgroundColor = color;
            colorDiv.setAttribute('data-color', color);
            
            colorDiv.addEventListener('click', () => {
                this.setColorFromHex(color);
            });
            
            this.colorFavorites.appendChild(colorDiv);
        });
    }

    setColorFromHex(hex) {
        const rgb = this.hexToRgb(hex);
        if (rgb) {
            const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
            this.currentColor = hsl;
            this.updateColor();
        }
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    clearHistory() {
        this.colorHistoryArray = [];
        localStorage.removeItem('colorHistory');
        this.loadHistory();
        this.showToast('History cleared!');
    }

    clearFavorites() {
        this.colorFavoritesArray = [];
        localStorage.removeItem('colorFavorites');
        this.loadFavorites();
        this.showToast('Favorites cleared!');
    }
}

// Initialize the color picker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ColorPicker();
});

// Add gradient color stop event listeners for existing elements
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.gradient-color-stop').forEach(stop => {
        const colorInput = stop.querySelector('input[type="color"]');
        const rangeInput = stop.querySelector('input[type="range"]');
        const spanElement = stop.querySelector('span');
        const removeBtn = stop.querySelector('.remove-color');
        
        if (colorInput) colorInput.addEventListener('change', () => window.colorPicker?.updateGradient());
        if (rangeInput) {
            rangeInput.addEventListener('input', (e) => {
                spanElement.textContent = e.target.value + '%';
                window.colorPicker?.updateGradient();
            });
        }
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                const container = stop.parentElement;
                if (container.children.length > 2) {
                    stop.remove();
                    window.colorPicker?.updateGradient();
                }
            });
        }
    });
});

// Store reference globally for gradient functionality
window.colorPicker = null;
document.addEventListener('DOMContentLoaded', () => {
    window.colorPicker = new ColorPicker();
});