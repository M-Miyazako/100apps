// Unit Converter App - Comprehensive JavaScript Implementation

class UnitConverter {
    constructor() {
        this.currentCategory = 'length';
        this.unitData = this.initializeUnitData();
        this.commonConversions = this.initializeCommonConversions();
        this.quickReferences = this.initializeQuickReferences();
        this.init();
    }

    // Initialize all unit conversion data
    initializeUnitData() {
        return {
            length: {
                name: 'Length',
                units: {
                    meter: { name: 'Meter', symbol: 'm', toBase: 1 },
                    kilometer: { name: 'Kilometer', symbol: 'km', toBase: 1000 },
                    centimeter: { name: 'Centimeter', symbol: 'cm', toBase: 0.01 },
                    millimeter: { name: 'Millimeter', symbol: 'mm', toBase: 0.001 },
                    inch: { name: 'Inch', symbol: 'in', toBase: 0.0254 },
                    foot: { name: 'Foot', symbol: 'ft', toBase: 0.3048 },
                    yard: { name: 'Yard', symbol: 'yd', toBase: 0.9144 },
                    mile: { name: 'Mile', symbol: 'mi', toBase: 1609.344 },
                    nauticalMile: { name: 'Nautical Mile', symbol: 'nmi', toBase: 1852 }
                }
            },
            weight: {
                name: 'Weight',
                units: {
                    gram: { name: 'Gram', symbol: 'g', toBase: 1 },
                    kilogram: { name: 'Kilogram', symbol: 'kg', toBase: 1000 },
                    pound: { name: 'Pound', symbol: 'lb', toBase: 453.592 },
                    ounce: { name: 'Ounce', symbol: 'oz', toBase: 28.3495 },
                    ton: { name: 'Metric Ton', symbol: 't', toBase: 1000000 },
                    stone: { name: 'Stone', symbol: 'st', toBase: 6350.29 },
                    milligram: { name: 'Milligram', symbol: 'mg', toBase: 0.001 }
                }
            },
            temperature: {
                name: 'Temperature',
                units: {
                    celsius: { name: 'Celsius', symbol: '°C' },
                    fahrenheit: { name: 'Fahrenheit', symbol: '°F' },
                    kelvin: { name: 'Kelvin', symbol: 'K' },
                    rankine: { name: 'Rankine', symbol: '°R' }
                }
            },
            volume: {
                name: 'Volume',
                units: {
                    liter: { name: 'Liter', symbol: 'L', toBase: 1 },
                    milliliter: { name: 'Milliliter', symbol: 'mL', toBase: 0.001 },
                    gallon: { name: 'Gallon (US)', symbol: 'gal', toBase: 3.78541 },
                    quart: { name: 'Quart (US)', symbol: 'qt', toBase: 0.946353 },
                    pint: { name: 'Pint (US)', symbol: 'pt', toBase: 0.473176 },
                    cup: { name: 'Cup (US)', symbol: 'cup', toBase: 0.236588 },
                    fluidOunce: { name: 'Fluid Ounce (US)', symbol: 'fl oz', toBase: 0.0295735 },
                    tablespoon: { name: 'Tablespoon', symbol: 'tbsp', toBase: 0.0147868 },
                    teaspoon: { name: 'Teaspoon', symbol: 'tsp', toBase: 0.00492892 }
                }
            },
            area: {
                name: 'Area',
                units: {
                    squareMeter: { name: 'Square Meter', symbol: 'm²', toBase: 1 },
                    squareKilometer: { name: 'Square Kilometer', symbol: 'km²', toBase: 1000000 },
                    squareCentimeter: { name: 'Square Centimeter', symbol: 'cm²', toBase: 0.0001 },
                    squareInch: { name: 'Square Inch', symbol: 'in²', toBase: 0.00064516 },
                    squareFoot: { name: 'Square Foot', symbol: 'ft²', toBase: 0.092903 },
                    squareYard: { name: 'Square Yard', symbol: 'yd²', toBase: 0.836127 },
                    acre: { name: 'Acre', symbol: 'ac', toBase: 4046.86 },
                    hectare: { name: 'Hectare', symbol: 'ha', toBase: 10000 }
                }
            }
        };
    }

    // Initialize common conversions for quick access
    initializeCommonConversions() {
        return {
            length: [
                { from: 'meter', to: 'foot', value: 1 },
                { from: 'kilometer', to: 'mile', value: 1 },
                { from: 'inch', to: 'centimeter', value: 1 },
                { from: 'foot', to: 'meter', value: 1 }
            ],
            weight: [
                { from: 'kilogram', to: 'pound', value: 1 },
                { from: 'gram', to: 'ounce', value: 1 },
                { from: 'pound', to: 'kilogram', value: 1 },
                { from: 'ounce', to: 'gram', value: 1 }
            ],
            temperature: [
                { from: 'celsius', to: 'fahrenheit', value: 0 },
                { from: 'fahrenheit', to: 'celsius', value: 32 },
                { from: 'celsius', to: 'kelvin', value: 0 },
                { from: 'kelvin', to: 'celsius', value: 273.15 }
            ],
            volume: [
                { from: 'liter', to: 'gallon', value: 1 },
                { from: 'gallon', to: 'liter', value: 1 },
                { from: 'cup', to: 'milliliter', value: 1 },
                { from: 'milliliter', to: 'fluidOunce', value: 1 }
            ],
            area: [
                { from: 'squareMeter', to: 'squareFoot', value: 1 },
                { from: 'squareFoot', to: 'squareMeter', value: 1 },
                { from: 'acre', to: 'squareMeter', value: 1 },
                { from: 'hectare', to: 'acre', value: 1 }
            ]
        };
    }

    // Initialize quick reference data
    initializeQuickReferences() {
        return {
            length: [
                { unit: '1 meter', value: '3.28084 feet' },
                { unit: '1 kilometer', value: '0.621371 miles' },
                { unit: '1 inch', value: '2.54 centimeters' },
                { unit: '1 foot', value: '0.3048 meters' }
            ],
            weight: [
                { unit: '1 kilogram', value: '2.20462 pounds' },
                { unit: '1 pound', value: '453.592 grams' },
                { unit: '1 ounce', value: '28.3495 grams' },
                { unit: '1 stone', value: '6.35029 kilograms' }
            ],
            temperature: [
                { unit: '0°C', value: '32°F, 273.15K' },
                { unit: '100°C', value: '212°F, 373.15K' },
                { unit: '32°F', value: '0°C, 273.15K' },
                { unit: '273.15K', value: '0°C, 32°F' }
            ],
            volume: [
                { unit: '1 liter', value: '0.264172 gallons' },
                { unit: '1 gallon', value: '3.78541 liters' },
                { unit: '1 cup', value: '236.588 milliliters' },
                { unit: '1 fl oz', value: '29.5735 milliliters' }
            ],
            area: [
                { unit: '1 m²', value: '10.7639 ft²' },
                { unit: '1 acre', value: '4046.86 m²' },
                { unit: '1 hectare', value: '10000 m²' },
                { unit: '1 ft²', value: '0.092903 m²' }
            ]
        };
    }

    // Initialize the app
    init() {
        this.setupEventListeners();
        this.updateUI();
        this.populateUnits();
        this.updateCommonConversions();
        this.updateQuickReference();
    }

    // Set up all event listeners
    setupEventListeners() {
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeCategory(e.target.dataset.category);
            });
        });

        // Input fields
        document.getElementById('fromValue').addEventListener('input', () => {
            this.performConversion();
        });

        document.getElementById('fromUnit').addEventListener('change', () => {
            this.performConversion();
        });

        document.getElementById('toUnit').addEventListener('change', () => {
            this.performConversion();
        });

        // Swap button
        document.getElementById('swapBtn').addEventListener('click', () => {
            this.swapUnits();
        });

        // Clear button (if needed)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearInputs();
            }
        });
    }

    // Change category
    changeCategory(category) {
        this.currentCategory = category;
        
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Update UI
        this.populateUnits();
        this.updateCommonConversions();
        this.updateQuickReference();
        this.clearInputs();
    }

    // Populate unit dropdowns
    populateUnits() {
        const fromUnit = document.getElementById('fromUnit');
        const toUnit = document.getElementById('toUnit');
        const units = this.unitData[this.currentCategory].units;
        
        // Clear existing options
        fromUnit.innerHTML = '';
        toUnit.innerHTML = '';
        
        // Add new options
        Object.keys(units).forEach(unitKey => {
            const unit = units[unitKey];
            const option1 = new Option(`${unit.name} (${unit.symbol})`, unitKey);
            const option2 = new Option(`${unit.name} (${unit.symbol})`, unitKey);
            fromUnit.appendChild(option1);
            toUnit.appendChild(option2);
        });
        
        // Set default selections
        const unitKeys = Object.keys(units);
        if (unitKeys.length > 1) {
            fromUnit.value = unitKeys[0];
            toUnit.value = unitKeys[1];
        }
    }

    // Perform unit conversion
    performConversion() {
        const fromValue = parseFloat(document.getElementById('fromValue').value);
        const fromUnit = document.getElementById('fromUnit').value;
        const toUnit = document.getElementById('toUnit').value;
        const toValueElement = document.getElementById('toValue');
        const resultDisplay = document.getElementById('resultDisplay');
        
        if (isNaN(fromValue) || fromValue === '') {
            toValueElement.value = '';
            resultDisplay.innerHTML = '<p>Enter a value to see the conversion</p>';
            resultDisplay.classList.remove('highlight');
            return;
        }
        
        let result;
        
        if (this.currentCategory === 'temperature') {
            result = this.convertTemperature(fromValue, fromUnit, toUnit);
        } else {
            result = this.convertStandardUnit(fromValue, fromUnit, toUnit);
        }
        
        if (result !== null) {
            const formattedResult = this.formatNumber(result);
            toValueElement.value = formattedResult;
            
            const fromUnitData = this.unitData[this.currentCategory].units[fromUnit];
            const toUnitData = this.unitData[this.currentCategory].units[toUnit];
            
            resultDisplay.innerHTML = `
                <p class="result-text">
                    <strong>${this.formatNumber(fromValue)} ${fromUnitData.symbol}</strong> equals 
                    <strong>${formattedResult} ${toUnitData.symbol}</strong>
                </p>
            `;
            resultDisplay.classList.add('highlight');
        } else {
            toValueElement.value = 'Error';
            resultDisplay.innerHTML = '<p>Conversion error</p>';
            resultDisplay.classList.remove('highlight');
        }
    }

    // Convert standard units (non-temperature)
    convertStandardUnit(value, fromUnit, toUnit) {
        const units = this.unitData[this.currentCategory].units;
        
        if (!units[fromUnit] || !units[toUnit]) {
            return null;
        }
        
        // Convert to base unit first, then to target unit
        const baseValue = value * units[fromUnit].toBase;
        const result = baseValue / units[toUnit].toBase;
        
        return result;
    }

    // Convert temperature units
    convertTemperature(value, fromUnit, toUnit) {
        if (fromUnit === toUnit) {
            return value;
        }
        
        // Convert to Celsius first
        let celsius;
        switch (fromUnit) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5 / 9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
            case 'rankine':
                celsius = (value - 491.67) * 5 / 9;
                break;
            default:
                return null;
        }
        
        // Convert from Celsius to target unit
        switch (toUnit) {
            case 'celsius':
                return celsius;
            case 'fahrenheit':
                return celsius * 9 / 5 + 32;
            case 'kelvin':
                return celsius + 273.15;
            case 'rankine':
                return celsius * 9 / 5 + 491.67;
            default:
                return null;
        }
    }

    // Swap units
    swapUnits() {
        const fromUnit = document.getElementById('fromUnit');
        const toUnit = document.getElementById('toUnit');
        const fromValue = document.getElementById('fromValue');
        const toValue = document.getElementById('toValue');
        
        // Swap unit selections
        const tempUnit = fromUnit.value;
        fromUnit.value = toUnit.value;
        toUnit.value = tempUnit;
        
        // Swap values
        const tempValue = fromValue.value;
        fromValue.value = toValue.value;
        toValue.value = tempValue;
        
        // Perform conversion
        this.performConversion();
    }

    // Update common conversions display
    updateCommonConversions() {
        const grid = document.getElementById('conversionGrid');
        const conversions = this.commonConversions[this.currentCategory];
        
        grid.innerHTML = '';
        
        conversions.forEach(conversion => {
            const fromUnit = this.unitData[this.currentCategory].units[conversion.from];
            const toUnit = this.unitData[this.currentCategory].units[conversion.to];
            
            let result;
            if (this.currentCategory === 'temperature') {
                result = this.convertTemperature(conversion.value, conversion.from, conversion.to);
            } else {
                result = this.convertStandardUnit(conversion.value, conversion.from, conversion.to);
            }
            
            const item = document.createElement('div');
            item.className = 'conversion-item';
            item.innerHTML = `
                <span class="from">${conversion.value} ${fromUnit.symbol}</span>
                <span class="to">${this.formatNumber(result)} ${toUnit.symbol}</span>
            `;
            
            item.addEventListener('click', () => {
                document.getElementById('fromValue').value = conversion.value;
                document.getElementById('fromUnit').value = conversion.from;
                document.getElementById('toUnit').value = conversion.to;
                this.performConversion();
            });
            
            grid.appendChild(item);
        });
    }

    // Update quick reference
    updateQuickReference() {
        const referenceContent = document.getElementById('referenceContent');
        const references = this.quickReferences[this.currentCategory];
        
        referenceContent.innerHTML = '';
        
        references.forEach(ref => {
            const item = document.createElement('div');
            item.className = 'reference-item';
            item.innerHTML = `
                <span class="unit">${ref.unit}</span>
                <span class="value">${ref.value}</span>
            `;
            referenceContent.appendChild(item);
        });
    }

    // Format number for display
    formatNumber(num) {
        if (num === 0) return '0';
        
        const absNum = Math.abs(num);
        
        if (absNum >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (absNum >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        } else if (absNum >= 1) {
            return num.toFixed(6).replace(/\.?0+$/, '');
        } else if (absNum >= 0.01) {
            return num.toFixed(4).replace(/\.?0+$/, '');
        } else {
            return num.toExponential(3);
        }
    }

    // Clear inputs
    clearInputs() {
        document.getElementById('fromValue').value = '';
        document.getElementById('toValue').value = '';
        document.getElementById('resultDisplay').innerHTML = '<p>Enter a value to see the conversion</p>';
        document.getElementById('resultDisplay').classList.remove('highlight');
    }

    // Update UI elements
    updateUI() {
        // Add fade-in animation to main container
        const container = document.querySelector('.converter-container');
        container.classList.add('fade-in');
        
        // Initialize with default values
        this.performConversion();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UnitConverter();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                document.querySelector('[data-category="length"]').click();
                break;
            case '2':
                e.preventDefault();
                document.querySelector('[data-category="weight"]').click();
                break;
            case '3':
                e.preventDefault();
                document.querySelector('[data-category="temperature"]').click();
                break;
            case '4':
                e.preventDefault();
                document.querySelector('[data-category="volume"]').click();
                break;
            case '5':
                e.preventDefault();
                document.querySelector('[data-category="area"]').click();
                break;
        }
    }
});

// Add service worker support for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker registration would go here
        console.log('Unit Converter App loaded successfully');
    });
}

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnitConverter;
}