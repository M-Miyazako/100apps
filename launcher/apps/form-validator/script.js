class FormValidator {
    constructor() {
        this.form = document.getElementById('validationForm');
        this.summaryContent = document.getElementById('summaryContent');
        this.validationResults = new Map();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSummary();
    }

    setupEventListeners() {
        // Real-time validation on input
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
            input.addEventListener('blur', () => this.validateField(input));
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateForm();
        });

        // Reset form
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetForm();
        });

        // Credit card formatting
        const creditCardInput = document.getElementById('creditCard');
        creditCardInput.addEventListener('input', (e) => {
            this.formatCreditCard(e.target);
        });

        // Expiry date formatting
        const expiryInput = document.getElementById('expiryDate');
        expiryInput.addEventListener('input', (e) => {
            this.formatExpiryDate(e.target);
        });

        // CVV input restriction
        const cvvInput = document.getElementById('cvv');
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });

        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('input', (e) => {
            this.formatPhoneNumber(e.target);
        });
    }

    validateField(input) {
        const fieldName = input.name;
        const value = input.value.trim();
        let isValid = true;
        let message = '';

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                ({ isValid, message } = this.validateName(value));
                break;
            case 'email':
                ({ isValid, message } = this.validateEmail(value));
                break;
            case 'phone':
                ({ isValid, message } = this.validatePhone(value));
                break;
            case 'password':
                ({ isValid, message } = this.validatePassword(value));
                this.updatePasswordStrength(value);
                // Re-validate confirm password if it exists
                const confirmPassword = document.getElementById('confirmPassword');
                if (confirmPassword.value) {
                    this.validateField(confirmPassword);
                }
                break;
            case 'confirmPassword':
                ({ isValid, message } = this.validateConfirmPassword(value));
                break;
            case 'creditCard':
                ({ isValid, message } = this.validateCreditCard(value));
                this.updateCardType(value);
                break;
            case 'expiryDate':
                ({ isValid, message } = this.validateExpiryDate(value));
                break;
            case 'cvv':
                ({ isValid, message } = this.validateCVV(value));
                break;
            case 'age':
                ({ isValid, message } = this.validateAge(value));
                break;
            case 'website':
                ({ isValid, message } = this.validateWebsite(value));
                break;
            case 'username':
                ({ isValid, message } = this.validateUsername(value));
                break;
            case 'terms':
                ({ isValid, message } = this.validateTerms(input.checked));
                break;
        }

        this.updateFieldValidation(input, isValid, message);
        this.validationResults.set(fieldName, { isValid, message });
        this.updateSummary();
    }

    validateName(name) {
        if (!name) {
            return { isValid: false, message: 'Name is required' };
        }
        if (name.length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters' };
        }
        if (!/^[a-zA-Z\s'-]+$/.test(name)) {
            return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
        }
        return { isValid: true, message: 'Valid name' };
    }

    validateEmail(email) {
        if (!email) {
            return { isValid: false, message: 'Email is required' };
        }
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }
        
        // Additional checks
        if (email.length > 254) {
            return { isValid: false, message: 'Email is too long' };
        }
        
        const parts = email.split('@');
        if (parts[0].length > 64) {
            return { isValid: false, message: 'Email username is too long' };
        }
        
        return { isValid: true, message: 'Valid email address' };
    }

    validatePhone(phone) {
        if (!phone) {
            return { isValid: true, message: 'Phone number is optional' };
        }
        
        const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
        if (!phoneRegex.test(phone)) {
            return { isValid: false, message: 'Please enter a valid phone number: (555) 123-4567' };
        }
        
        return { isValid: true, message: 'Valid phone number' };
    }

    validatePassword(password) {
        if (!password) {
            return { isValid: false, message: 'Password is required' };
        }
        
        const issues = [];
        
        if (password.length < 8) {
            issues.push('at least 8 characters');
        }
        if (!/[a-z]/.test(password)) {
            issues.push('lowercase letter');
        }
        if (!/[A-Z]/.test(password)) {
            issues.push('uppercase letter');
        }
        if (!/\d/.test(password)) {
            issues.push('number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            issues.push('special character');
        }
        
        if (issues.length > 0) {
            return { isValid: false, message: `Password needs: ${issues.join(', ')}` };
        }
        
        return { isValid: true, message: 'Strong password' };
    }

    validateConfirmPassword(confirmPassword) {
        const password = document.getElementById('password').value;
        
        if (!confirmPassword) {
            return { isValid: false, message: 'Please confirm your password' };
        }
        
        if (password !== confirmPassword) {
            return { isValid: false, message: 'Passwords do not match' };
        }
        
        return { isValid: true, message: 'Passwords match' };
    }

    validateCreditCard(cardNumber) {
        if (!cardNumber) {
            return { isValid: true, message: 'Credit card is optional' };
        }
        
        const cleanNumber = cardNumber.replace(/\s/g, '');
        
        if (!/^\d+$/.test(cleanNumber)) {
            return { isValid: false, message: 'Credit card must contain only numbers' };
        }
        
        if (!this.luhnCheck(cleanNumber)) {
            return { isValid: false, message: 'Invalid credit card number' };
        }
        
        const cardType = this.getCardType(cleanNumber);
        if (!cardType) {
            return { isValid: false, message: 'Unsupported card type' };
        }
        
        return { isValid: true, message: `Valid ${cardType} card` };
    }

    validateExpiryDate(expiryDate) {
        if (!expiryDate) {
            return { isValid: true, message: 'Expiry date is optional' };
        }
        
        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expiryRegex.test(expiryDate)) {
            return { isValid: false, message: 'Use MM/YY format' };
        }
        
        const [month, year] = expiryDate.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const now = new Date();
        
        if (expiry < now) {
            return { isValid: false, message: 'Card has expired' };
        }
        
        return { isValid: true, message: 'Valid expiry date' };
    }

    validateCVV(cvv) {
        if (!cvv) {
            return { isValid: true, message: 'CVV is optional' };
        }
        
        const creditCard = document.getElementById('creditCard').value.replace(/\s/g, '');
        const cardType = this.getCardType(creditCard);
        
        let requiredLength = 3;
        if (cardType === 'American Express') {
            requiredLength = 4;
        }
        
        if (cvv.length !== requiredLength) {
            return { isValid: false, message: `CVV must be ${requiredLength} digits` };
        }
        
        return { isValid: true, message: 'Valid CVV' };
    }

    validateAge(age) {
        if (!age) {
            return { isValid: true, message: 'Age is optional' };
        }
        
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
            return { isValid: false, message: 'Age must be between 13 and 120' };
        }
        
        return { isValid: true, message: 'Valid age' };
    }

    validateWebsite(website) {
        if (!website) {
            return { isValid: true, message: 'Website is optional' };
        }
        
        try {
            const url = new URL(website);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                return { isValid: false, message: 'Website must use HTTP or HTTPS' };
            }
            return { isValid: true, message: 'Valid website URL' };
        } catch {
            return { isValid: false, message: 'Please enter a valid URL' };
        }
    }

    validateUsername(username) {
        if (!username) {
            return { isValid: false, message: 'Username is required' };
        }
        
        if (username.length < 3 || username.length > 20) {
            return { isValid: false, message: 'Username must be 3-20 characters' };
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
        }
        
        return { isValid: true, message: 'Valid username' };
    }

    validateTerms(checked) {
        if (!checked) {
            return { isValid: false, message: 'You must agree to the terms and conditions' };
        }
        
        return { isValid: true, message: 'Terms accepted' };
    }

    updateFieldValidation(input, isValid, message) {
        const messageElement = document.getElementById(input.name + 'Message');
        
        // Update input styling
        input.classList.remove('valid', 'invalid');
        input.classList.add(isValid ? 'valid' : 'invalid');
        
        // Update message
        messageElement.classList.remove('success', 'error');
        messageElement.classList.add(isValid ? 'success' : 'error');
        messageElement.textContent = message;
        
        // Add animation
        messageElement.classList.add('success-animation');
        setTimeout(() => {
            messageElement.classList.remove('success-animation');
        }, 300);
    }

    updatePasswordStrength(password) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        let strength = 0;
        let strengthLabel = '';
        
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        
        strengthFill.className = 'strength-fill';
        
        switch (strength) {
            case 0:
            case 1:
                strengthFill.classList.add('weak');
                strengthLabel = 'Weak';
                break;
            case 2:
                strengthFill.classList.add('fair');
                strengthLabel = 'Fair';
                break;
            case 3:
            case 4:
                strengthFill.classList.add('good');
                strengthLabel = 'Good';
                break;
            case 5:
                strengthFill.classList.add('strong');
                strengthLabel = 'Strong';
                break;
        }
        
        strengthText.textContent = password ? `Password strength: ${strengthLabel}` : 'Password strength';
    }

    updateCardType(cardNumber) {
        const cardType = this.getCardType(cardNumber.replace(/\s/g, ''));
        const cardTypeElement = document.getElementById('cardType');
        
        if (cardType) {
            cardTypeElement.textContent = `Card type: ${cardType}`;
        } else {
            cardTypeElement.textContent = '';
        }
    }

    getCardType(cardNumber) {
        const patterns = {
            'Visa': /^4\d{12}(\d{3})?$/,
            'MasterCard': /^5[1-5]\d{14}$/,
            'American Express': /^3[47]\d{13}$/,
            'Discover': /^6(?:011|5\d{2})\d{12}$/
        };
        
        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(cardNumber)) {
                return type;
            }
        }
        
        return null;
    }

    luhnCheck(cardNumber) {
        let sum = 0;
        let isEven = false;
        
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }

    formatCreditCard(input) {
        let value = input.value.replace(/\s/g, '');
        let formatted = '';
        
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formatted += ' ';
            }
            formatted += value[i];
        }
        
        input.value = formatted;
    }

    formatExpiryDate(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        
        input.value = value;
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length >= 6) {
            value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6, 10)}`;
        } else if (value.length >= 3) {
            value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
        } else if (value.length > 0) {
            value = `(${value}`;
        }
        
        input.value = value;
    }

    updateSummary() {
        const validFields = [];
        const invalidFields = [];
        
        for (const [fieldName, result] of this.validationResults.entries()) {
            const fieldData = {
                name: this.getFieldDisplayName(fieldName),
                message: result.message
            };
            
            if (result.isValid) {
                validFields.push(fieldData);
            } else {
                invalidFields.push(fieldData);
            }
        }
        
        let summaryHTML = '';
        
        if (validFields.length === 0 && invalidFields.length === 0) {
            summaryHTML = '<p>Fill out the form to see validation results</p>';
        } else {
            if (validFields.length > 0) {
                summaryHTML += '<h4 style="color: #28a745; margin-bottom: 10px;">Valid Fields:</h4>';
                validFields.forEach(field => {
                    summaryHTML += `<div class="summary-item valid">${field.name}: ${field.message}</div>`;
                });
            }
            
            if (invalidFields.length > 0) {
                summaryHTML += '<h4 style="color: #dc3545; margin: 15px 0 10px 0;">Invalid Fields:</h4>';
                invalidFields.forEach(field => {
                    summaryHTML += `<div class="summary-item invalid">${field.name}: ${field.message}</div>`;
                });
            }
        }
        
        this.summaryContent.innerHTML = summaryHTML;
    }

    getFieldDisplayName(fieldName) {
        const displayNames = {
            'firstName': 'First Name',
            'lastName': 'Last Name',
            'email': 'Email',
            'phone': 'Phone',
            'password': 'Password',
            'confirmPassword': 'Confirm Password',
            'creditCard': 'Credit Card',
            'expiryDate': 'Expiry Date',
            'cvv': 'CVV',
            'age': 'Age',
            'website': 'Website',
            'username': 'Username',
            'terms': 'Terms & Conditions'
        };
        
        return displayNames[fieldName] || fieldName;
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('input[required]');
        let allValid = true;
        
        inputs.forEach(input => {
            this.validateField(input);
            if (!this.validationResults.get(input.name)?.isValid) {
                allValid = false;
            }
        });
        
        if (allValid) {
            this.showSuccessMessage();
        } else {
            this.showErrorMessage();
        }
    }

    showSuccessMessage() {
        const summaryContent = this.summaryContent;
        summaryContent.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #d4edda; color: #155724; border-radius: 8px; margin: 20px 0;">
                <h3>✅ Form Validation Successful!</h3>
                <p>All required fields are valid and ready for submission.</p>
            </div>
        `;
        
        // Add success animation to form
        this.form.classList.add('success-animation');
        setTimeout(() => {
            this.form.classList.remove('success-animation');
        }, 300);
    }

    showErrorMessage() {
        const summaryContent = this.summaryContent;
        const errorCount = Array.from(this.validationResults.values()).filter(result => !result.isValid).length;
        
        summaryContent.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #f8d7da; color: #721c24; border-radius: 8px; margin: 20px 0;">
                <h3>❌ Form Validation Failed</h3>
                <p>Please fix ${errorCount} error${errorCount === 1 ? '' : 's'} before submitting.</p>
            </div>
        ` + summaryContent.innerHTML;
    }

    resetForm() {
        this.form.reset();
        this.validationResults.clear();
        
        // Reset all field styles
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
            const messageElement = document.getElementById(input.name + 'Message');
            messageElement.classList.remove('success', 'error');
            messageElement.textContent = '';
        });
        
        // Reset password strength
        document.getElementById('strengthFill').className = 'strength-fill';
        document.getElementById('strengthText').textContent = 'Password strength';
        
        // Reset card type
        document.getElementById('cardType').textContent = '';
        
        this.updateSummary();
    }
}

// Initialize the form validator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FormValidator();
});

// Add some utility functions for enhanced UX
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    document.getElementById('submitBtn').click();
                    break;
                case 'r':
                    e.preventDefault();
                    document.getElementById('resetBtn').click();
                    break;
            }
        }
    });
    
    // Add tooltips for better UX
    const tooltips = {
        'password': 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
        'creditCard': 'Enter a valid credit card number (Visa, MasterCard, American Express, or Discover)',
        'phone': 'Enter phone number in format: (555) 123-4567',
        'expiryDate': 'Enter expiry date in MM/YY format',
        'cvv': 'Enter 3-4 digit security code from your card',
        'username': 'Username must be 3-20 characters, alphanumeric and underscores only'
    };
    
    Object.entries(tooltips).forEach(([fieldName, tooltip]) => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.title = tooltip;
        }
    });
});