// Password Generator Application
class PasswordGenerator {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.passwordHistory = [];
        this.loadHistoryFromStorage();
        this.updateUI();
    }

    initializeElements() {
        // Input elements
        this.passwordDisplay = document.getElementById('passwordDisplay');
        this.passwordLength = document.getElementById('passwordLength');
        this.passwordCount = document.getElementById('passwordCount');
        this.includeUppercase = document.getElementById('includeUppercase');
        this.includeLowercase = document.getElementById('includeLowercase');
        this.includeNumbers = document.getElementById('includeNumbers');
        this.includeSymbols = document.getElementById('includeSymbols');
        this.excludeSimilar = document.getElementById('excludeSimilar');
        this.excludeAmbiguous = document.getElementById('excludeAmbiguous');

        // Display elements
        this.lengthValue = document.getElementById('lengthValue');
        this.countValue = document.getElementById('countValue');
        this.strengthFill = document.getElementById('strengthFill');
        this.strengthText = document.getElementById('strengthText');
        this.multiplePasswords = document.getElementById('multiplePasswords');
        this.passwordList = document.getElementById('passwordList');
        this.passwordHistory = document.getElementById('passwordHistory');

        // Button elements
        this.generateBtn = document.getElementById('generateBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.copyToast = document.getElementById('copyToast');
    }

    setupEventListeners() {
        // Slider updates
        this.passwordLength.addEventListener('input', () => {
            this.lengthValue.textContent = this.passwordLength.value;
        });

        this.passwordCount.addEventListener('input', () => {
            this.countValue.textContent = this.passwordCount.value;
        });

        // Button events
        this.generateBtn.addEventListener('click', () => this.generatePasswords());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard(this.passwordDisplay.value));
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Validate character selection
        const checkboxes = [this.includeUppercase, this.includeLowercase, this.includeNumbers, this.includeSymbols];
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.validateCharacterSelection());
        });

        // Generate password on page load
        this.generatePasswords();
    }

    validateCharacterSelection() {
        const hasSelection = this.includeUppercase.checked || 
                           this.includeLowercase.checked || 
                           this.includeNumbers.checked || 
                           this.includeSymbols.checked;
        
        this.generateBtn.disabled = !hasSelection;
        
        if (!hasSelection) {
            this.passwordDisplay.value = '';
            this.updateStrengthIndicator('');
        }
    }

    getCharacterSets() {
        const sets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };

        // Characters to exclude
        const similarChars = '0O1lI';
        const ambiguousChars = '{}[]()\/\\~,;.<>';

        let characterPool = '';
        let requiredChars = [];

        if (this.includeUppercase.checked) {
            let chars = sets.uppercase;
            if (this.excludeSimilar.checked) {
                chars = chars.replace(/[0OlI]/g, '');
            }
            characterPool += chars;
            requiredChars.push(chars);
        }

        if (this.includeLowercase.checked) {
            let chars = sets.lowercase;
            if (this.excludeSimilar.checked) {
                chars = chars.replace(/[0OlI]/g, '');
            }
            characterPool += chars;
            requiredChars.push(chars);
        }

        if (this.includeNumbers.checked) {
            let chars = sets.numbers;
            if (this.excludeSimilar.checked) {
                chars = chars.replace(/[0OlI]/g, '');
            }
            characterPool += chars;
            requiredChars.push(chars);
        }

        if (this.includeSymbols.checked) {
            let chars = sets.symbols;
            if (this.excludeAmbiguous.checked) {
                chars = chars.replace(/[{}[\]()\/\\~,;.<>]/g, '');
            }
            characterPool += chars;
            requiredChars.push(chars);
        }

        return { characterPool, requiredChars };
    }

    generatePassword() {
        const length = parseInt(this.passwordLength.value);
        const { characterPool, requiredChars } = this.getCharacterSets();

        if (characterPool.length === 0) {
            return '';
        }

        let password = '';
        const usedPositions = new Set();

        // Ensure at least one character from each selected set
        requiredChars.forEach(charSet => {
            let position;
            do {
                position = Math.floor(Math.random() * length);
            } while (usedPositions.has(position));
            
            usedPositions.add(position);
            const randomChar = charSet[Math.floor(Math.random() * charSet.length)];
            password = password.padEnd(position, ' ') + randomChar;
        });

        // Fill remaining positions
        for (let i = 0; i < length; i++) {
            if (!usedPositions.has(i)) {
                const randomChar = characterPool[Math.floor(Math.random() * characterPool.length)];
                password = password.substring(0, i) + randomChar + password.substring(i + 1);
            }
        }

        // Shuffle the password to avoid predictable patterns
        return this.shuffleString(password.replace(/ /g, ''));
    }

    shuffleString(str) {
        const array = str.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }

    generatePasswords() {
        const count = parseInt(this.passwordCount.value);
        const passwords = [];

        for (let i = 0; i < count; i++) {
            const password = this.generatePassword();
            if (password) {
                passwords.push(password);
            }
        }

        if (passwords.length === 0) {
            this.passwordDisplay.value = '';
            this.updateStrengthIndicator('');
            return;
        }

        // Display first password in main display
        this.passwordDisplay.value = passwords[0];
        this.updateStrengthIndicator(passwords[0]);

        // Show multiple passwords if count > 1
        if (count > 1) {
            this.displayMultiplePasswords(passwords);
        } else {
            this.multiplePasswords.style.display = 'none';
        }

        // Add to history
        passwords.forEach(password => this.addToHistory(password));
    }

    displayMultiplePasswords(passwords) {
        this.passwordList.innerHTML = '';
        
        passwords.forEach((password, index) => {
            const passwordItem = document.createElement('div');
            passwordItem.className = 'password-item';
            
            passwordItem.innerHTML = `
                <span class="password-text">${password}</span>
                <button class="copy-btn" onclick="passwordGen.copyToClipboard('${password}')" title="Copy to clipboard">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            `;
            
            this.passwordList.appendChild(passwordItem);
        });
        
        this.multiplePasswords.style.display = 'block';
    }

    calculatePasswordStrength(password) {
        if (!password) return { score: 0, feedback: 'No password generated' };

        let score = 0;
        let feedback = '';

        // Length scoring
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;

        // Character variety scoring
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        // Additional strength factors
        if (password.length >= 20) score += 1;
        if (this.hasNoRepeatingChars(password)) score += 1;

        // Determine strength level
        if (score <= 2) {
            feedback = 'Very Weak';
        } else if (score <= 4) {
            feedback = 'Weak';
        } else if (score <= 6) {
            feedback = 'Fair';
        } else if (score <= 7) {
            feedback = 'Good';
        } else {
            feedback = 'Strong';
        }

        return { score, feedback };
    }

    hasNoRepeatingChars(password) {
        const charCount = {};
        for (let char of password) {
            charCount[char] = (charCount[char] || 0) + 1;
            if (charCount[char] > 2) return false;
        }
        return true;
    }

    updateStrengthIndicator(password) {
        const { score, feedback } = this.calculatePasswordStrength(password);
        const percentage = Math.min((score / 8) * 100, 100);
        
        this.strengthFill.style.width = `${percentage}%`;
        this.strengthText.textContent = feedback;
        
        // Remove existing strength classes
        this.strengthFill.className = 'strength-fill';
        
        // Add appropriate strength class
        if (feedback === 'Very Weak') {
            this.strengthFill.classList.add('strength-very-weak');
        } else if (feedback === 'Weak') {
            this.strengthFill.classList.add('strength-weak');
        } else if (feedback === 'Fair') {
            this.strengthFill.classList.add('strength-fair');
        } else if (feedback === 'Good') {
            this.strengthFill.classList.add('strength-good');
        } else if (feedback === 'Strong') {
            this.strengthFill.classList.add('strength-strong');
        }
    }

    async copyToClipboard(text) {
        if (!text) return;
        
        try {
            await navigator.clipboard.writeText(text);
            this.showCopyToast();
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopyToast();
        } catch (err) {
            console.error('Failed to copy password:', err);
        }
        
        document.body.removeChild(textArea);
    }

    showCopyToast() {
        this.copyToast.classList.add('show');
        setTimeout(() => {
            this.copyToast.classList.remove('show');
        }, 3000);
    }

    addToHistory(password) {
        const historyItem = {
            password,
            timestamp: new Date(),
            length: password.length,
            strength: this.calculatePasswordStrength(password).feedback
        };

        this.passwordHistory.unshift(historyItem);
        
        // Keep only last 20 passwords
        if (this.passwordHistory.length > 20) {
            this.passwordHistory = this.passwordHistory.slice(0, 20);
        }
        
        this.updateHistoryDisplay();
        this.saveHistoryToStorage();
    }

    updateHistoryDisplay() {
        const historyContainer = document.getElementById('passwordHistory');
        
        if (this.passwordHistory.length === 0) {
            historyContainer.innerHTML = '<p class="empty-history">No passwords generated yet</p>';
            return;
        }

        historyContainer.innerHTML = '';
        
        this.passwordHistory.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const timeAgo = this.getTimeAgo(item.timestamp);
            
            historyItem.innerHTML = `
                <div class="password-info">
                    <div class="password-text">${item.password}</div>
                    <div class="password-meta">
                        Length: ${item.length} | Strength: ${item.strength} | Generated ${timeAgo}
                    </div>
                </div>
                <button class="copy-btn" onclick="passwordGen.copyToClipboard('${item.password}')" title="Copy to clipboard">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
            `;
            
            historyContainer.appendChild(historyItem);
        });
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - timestamp) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    clearHistory() {
        this.passwordHistory = [];
        this.updateHistoryDisplay();
        this.saveHistoryToStorage();
    }

    saveHistoryToStorage() {
        try {
            localStorage.setItem('passwordHistory', JSON.stringify(this.passwordHistory));
        } catch (err) {
            console.error('Failed to save history to localStorage:', err);
        }
    }

    loadHistoryFromStorage() {
        try {
            const stored = localStorage.getItem('passwordHistory');
            if (stored) {
                this.passwordHistory = JSON.parse(stored).map(item => ({
                    ...item,
                    timestamp: new Date(item.timestamp)
                }));
            }
        } catch (err) {
            console.error('Failed to load history from localStorage:', err);
            this.passwordHistory = [];
        }
    }

    updateUI() {
        this.lengthValue.textContent = this.passwordLength.value;
        this.countValue.textContent = this.passwordCount.value;
        this.updateHistoryDisplay();
        this.validateCharacterSelection();
    }
}

// Initialize the password generator when the page loads
let passwordGen;
document.addEventListener('DOMContentLoaded', () => {
    passwordGen = new PasswordGenerator();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to generate password
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        passwordGen.generatePasswords();
    }
    
    // Ctrl/Cmd + C to copy current password
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === passwordGen.passwordDisplay) {
        e.preventDefault();
        passwordGen.copyToClipboard(passwordGen.passwordDisplay.value);
    }
});