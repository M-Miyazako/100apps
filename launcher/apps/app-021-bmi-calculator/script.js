// BMI Calculator JavaScript
class BMICalculator {
    constructor() {
        this.isMetric = true;
        this.history = JSON.parse(localStorage.getItem('bmiHistory')) || [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadHistory();
        this.updateUnitLabels();
    }

    bindEvents() {
        // Form submission
        document.getElementById('bmiForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateBMI();
        });

        // Unit toggle
        document.getElementById('unitToggle').addEventListener('change', (e) => {
            this.isMetric = !e.target.checked;
            this.updateUnitLabels();
            this.clearForm();
        });

        // Clear history
        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });

        // Input validation
        this.addInputValidation();
    }

    addInputValidation() {
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                if (e.target.value < 0) {
                    e.target.value = '';
                }
            });
        });
    }

    updateUnitLabels() {
        const heightUnit = document.getElementById('heightUnit');
        const weightUnit = document.getElementById('weightUnit');
        const heightInput = document.getElementById('height');
        const weightInput = document.getElementById('weight');
        const metricLabel = document.querySelector('.metric');
        const imperialLabel = document.querySelector('.imperial');

        if (this.isMetric) {
            heightUnit.textContent = 'cm';
            weightUnit.textContent = 'kg';
            heightInput.placeholder = '170';
            weightInput.placeholder = '70';
            metricLabel.classList.add('active');
            imperialLabel.classList.remove('active');
        } else {
            heightUnit.textContent = 'ft';
            weightUnit.textContent = 'lbs';
            heightInput.placeholder = '5.7';
            weightInput.placeholder = '154';
            metricLabel.classList.remove('active');
            imperialLabel.classList.add('active');
        }
    }

    clearForm() {
        document.getElementById('height').value = '';
        document.getElementById('weight').value = '';
        document.getElementById('age').value = '';
        document.getElementById('resultsSection').style.display = 'none';
    }

    calculateBMI() {
        const height = parseFloat(document.getElementById('height').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const age = parseInt(document.getElementById('age').value) || null;
        const gender = document.querySelector('input[name="gender"]:checked').value;

        if (!height || !weight || height <= 0 || weight <= 0) {
            alert('Please enter valid height and weight values.');
            return;
        }

        // Convert to metric if needed
        let heightInMeters, weightInKg;
        
        if (this.isMetric) {
            heightInMeters = height / 100; // cm to meters
            weightInKg = weight;
        } else {
            heightInMeters = height * 0.3048; // feet to meters
            weightInKg = weight * 0.453592; // pounds to kg
        }

        // Calculate BMI
        const bmi = weightInKg / (heightInMeters * heightInMeters);
        
        // Display results
        this.displayResults(bmi, height, weight, age, gender);
        
        // Save to history
        this.saveToHistory(bmi, height, weight, age, gender);
    }

    displayResults(bmi, height, weight, age, gender) {
        const resultsSection = document.getElementById('resultsSection');
        const bmiValue = document.getElementById('bmiValue');
        const bmiCategory = document.getElementById('bmiCategory');
        const bmiPointer = document.getElementById('bmiPointer');

        // Display BMI value
        bmiValue.textContent = bmi.toFixed(1);

        // Determine category and styling
        const category = this.getBMICategory(bmi);
        bmiCategory.textContent = category;
        bmiCategory.className = `bmi-category ${category.toLowerCase()}`;

        // Position BMI pointer
        this.positionBMIPointer(bmi, bmiPointer);

        // Generate recommendations
        this.generateRecommendations(bmi, age, gender);

        // Calculate ideal weight range
        this.calculateIdealWeight(height, gender);

        // Show results
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    getBMICategory(bmi) {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    }

    positionBMIPointer(bmi, pointer) {
        let position;
        
        if (bmi < 18.5) {
            position = (bmi / 18.5) * 25; // 0-25% of first segment
        } else if (bmi < 25) {
            position = 25 + ((bmi - 18.5) / 6.5) * 25; // 25-50% of second segment
        } else if (bmi < 30) {
            position = 50 + ((bmi - 25) / 5) * 25; // 50-75% of third segment
        } else {
            position = 75 + Math.min(((bmi - 30) / 10) * 25, 25); // 75-100% of fourth segment
        }

        position = Math.max(0, Math.min(100, position));
        pointer.style.left = `${position}%`;
    }

    generateRecommendations(bmi, age, gender) {
        const recommendationsContent = document.getElementById('recommendationsContent');
        let recommendations = [];

        if (bmi < 18.5) {
            recommendations = [
                'Consider consulting with a healthcare provider about your weight',
                'Focus on nutrient-dense foods to gain weight healthily',
                'Include strength training to build muscle mass',
                'Eat more frequent, smaller meals throughout the day',
                'Consider working with a registered dietitian'
            ];
        } else if (bmi < 25) {
            recommendations = [
                'Maintain your current healthy weight',
                'Continue with regular physical activity (150 minutes/week)',
                'Eat a balanced diet with fruits, vegetables, and whole grains',
                'Stay hydrated and get adequate sleep',
                'Monitor your weight regularly'
            ];
        } else if (bmi < 30) {
            recommendations = [
                'Consider gradual weight loss (1-2 pounds per week)',
                'Increase physical activity to 300 minutes/week',
                'Reduce portion sizes and limit processed foods',
                'Focus on whole foods and lean proteins',
                'Consider consulting with a healthcare provider'
            ];
        } else {
            recommendations = [
                'Consult with a healthcare provider for a weight management plan',
                'Consider medically supervised weight loss programs',
                'Focus on sustainable lifestyle changes',
                'Include both cardio and strength training exercises',
                'Work with a registered dietitian and fitness professional'
            ];
        }

        // Add age-specific recommendations
        if (age) {
            if (age >= 65) {
                recommendations.push('Focus on maintaining muscle mass and bone density');
                recommendations.push('Consider low-impact exercises like walking or swimming');
            } else if (age >= 40) {
                recommendations.push('Regular health screenings become more important');
                recommendations.push('Focus on cardiovascular health');
            }
        }

        // Add gender-specific recommendations
        if (gender === 'female') {
            recommendations.push('Consider calcium and iron intake in your diet');
            if (age && age >= 50) {
                recommendations.push('Discuss bone health with your healthcare provider');
            }
        }

        const html = `
            <ul>
                ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        `;

        recommendationsContent.innerHTML = html;
    }

    calculateIdealWeight(height, gender) {
        const idealWeightRange = document.getElementById('idealWeightRange');
        let heightInMeters, minWeight, maxWeight;

        if (this.isMetric) {
            heightInMeters = height / 100;
        } else {
            heightInMeters = height * 0.3048;
        }

        // Calculate ideal weight range for BMI 18.5-24.9
        const minWeightKg = 18.5 * heightInMeters * heightInMeters;
        const maxWeightKg = 24.9 * heightInMeters * heightInMeters;

        if (this.isMetric) {
            minWeight = minWeightKg.toFixed(1);
            maxWeight = maxWeightKg.toFixed(1);
            idealWeightRange.innerHTML = `
                <strong>${minWeight} - ${maxWeight} kg</strong>
                <br>
                <small>Based on healthy BMI range (18.5 - 24.9)</small>
            `;
        } else {
            minWeight = (minWeightKg * 2.20462).toFixed(1);
            maxWeight = (maxWeightKg * 2.20462).toFixed(1);
            idealWeightRange.innerHTML = `
                <strong>${minWeight} - ${maxWeight} lbs</strong>
                <br>
                <small>Based on healthy BMI range (18.5 - 24.9)</small>
            `;
        }
    }

    saveToHistory(bmi, height, weight, age, gender) {
        const entry = {
            id: Date.now(),
            date: new Date().toISOString(),
            bmi: bmi,
            height: height,
            weight: weight,
            age: age,
            gender: gender,
            unit: this.isMetric ? 'metric' : 'imperial',
            category: this.getBMICategory(bmi)
        };

        this.history.unshift(entry);
        
        // Keep only last 50 entries
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        localStorage.setItem('bmiHistory', JSON.stringify(this.history));
        this.loadHistory();
    }

    loadHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<p class="no-history">No BMI calculations yet. Start by calculating your BMI above.</p>';
            return;
        }

        const html = this.history.map(entry => {
            const date = new Date(entry.date).toLocaleDateString();
            const time = new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return `
                <div class="history-item">
                    <div class="history-date">${date} at ${time}</div>
                    <div class="history-details">
                        <div class="history-bmi">BMI: ${entry.bmi.toFixed(1)}</div>
                        <div class="history-category ${entry.category.toLowerCase()}">${entry.category}</div>
                    </div>
                </div>
            `;
        }).join('');

        historyList.innerHTML = html;
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all BMI history?')) {
            this.history = [];
            localStorage.removeItem('bmiHistory');
            this.loadHistory();
        }
    }
}

// Initialize the BMI Calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BMICalculator();
});

// Additional utility functions
function validateInput(input, min, max) {
    const value = parseFloat(input.value);
    if (value < min || value > max) {
        input.setCustomValidity(`Please enter a value between ${min} and ${max}`);
    } else {
        input.setCustomValidity('');
    }
}

// Add smooth scrolling for better UX
function smoothScroll(target) {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth'
    });
}

// Format numbers for display
function formatNumber(num, decimals = 1) {
    return parseFloat(num).toFixed(decimals);
}

// Convert units
function convertUnits(value, from, to) {
    const conversions = {
        'cm_to_ft': value * 0.0328084,
        'ft_to_cm': value * 30.48,
        'kg_to_lbs': value * 2.20462,
        'lbs_to_kg': value * 0.453592,
        'cm_to_in': value * 0.393701,
        'in_to_cm': value * 2.54
    };
    
    return conversions[`${from}_to_${to}`] || value;
}

// Health tips based on BMI category
function getHealthTips(category) {
    const tips = {
        'underweight': [
            'Eat nutrient-dense foods',
            'Include healthy fats in your diet',
            'Consider strength training',
            'Get adequate sleep',
            'Manage stress levels'
        ],
        'normal': [
            'Maintain current healthy habits',
            'Stay physically active',
            'Eat a balanced diet',
            'Get regular health check-ups',
            'Stay hydrated'
        ],
        'overweight': [
            'Increase physical activity',
            'Focus on portion control',
            'Choose whole foods',
            'Limit processed foods',
            'Stay consistent with healthy habits'
        ],
        'obese': [
            'Consult healthcare professionals',
            'Start with small, sustainable changes',
            'Focus on behavior modification',
            'Consider professional support',
            'Be patient with the process'
        ]
    };
    
    return tips[category.toLowerCase()] || [];
}

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BMICalculator;
}