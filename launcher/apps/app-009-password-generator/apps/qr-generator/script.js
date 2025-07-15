class QRGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentQRData = null;
    }

    initializeElements() {
        // Input elements
        this.textInput = document.getElementById('text-input');
        this.sizeSelect = document.getElementById('size-select');
        this.errorCorrectionSelect = document.getElementById('error-correction');
        this.fgColorInput = document.getElementById('fg-color');
        this.bgColorInput = document.getElementById('bg-color');
        
        // Button elements
        this.generateBtn = document.getElementById('generate-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.downloadBtn = document.getElementById('download-btn');
        
        // Display elements
        this.charCount = document.getElementById('char-count');
        this.qrContainer = document.getElementById('qr-container');
        this.qrPlaceholder = document.getElementById('qr-placeholder');
        this.qrCanvas = document.getElementById('qr-canvas');
        this.previewArea = document.querySelector('.preview-area');
        
        // Initialize character count
        this.updateCharacterCount();
    }

    bindEvents() {
        // Input events
        this.textInput.addEventListener('input', () => {
            this.updateCharacterCount();
            this.validateInput();
        });

        this.textInput.addEventListener('paste', () => {
            setTimeout(() => {
                this.updateCharacterCount();
                this.validateInput();
            }, 0);
        });

        // Option change events
        this.sizeSelect.addEventListener('change', () => this.regenerateQRCode());
        this.errorCorrectionSelect.addEventListener('change', () => this.regenerateQRCode());
        this.fgColorInput.addEventListener('change', () => this.regenerateQRCode());
        this.bgColorInput.addEventListener('change', () => this.regenerateQRCode());

        // Button events
        this.generateBtn.addEventListener('click', () => this.generateQRCode());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.downloadBtn.addEventListener('click', () => this.downloadQRCode());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.generateQRCode();
                } else if (e.key === 'l') {
                    e.preventDefault();
                    this.clearAll();
                }
            }
        });

        // Real-time generation (with debounce)
        this.textInput.addEventListener('input', this.debounce(() => {
            if (this.textInput.value.trim() && this.textInput.value.trim().length > 0) {
                this.generateQRCode();
            }
        }, 500));
    }

    updateCharacterCount() {
        const length = this.textInput.value.length;
        this.charCount.textContent = length;
        
        // Update character count color based on limit
        if (length > 800) {
            this.charCount.style.color = '#dc3545';
        } else if (length > 600) {
            this.charCount.style.color = '#fd7e14';
        } else {
            this.charCount.style.color = '#666';
        }
    }

    validateInput() {
        const text = this.textInput.value.trim();
        const isValid = text.length > 0 && text.length <= 1000;
        
        this.generateBtn.disabled = !isValid;
        
        // Remove any existing error messages
        this.clearMessages();
        
        if (!isValid && text.length > 0) {
            if (text.length > 1000) {
                this.showError('Text exceeds maximum length of 1000 characters');
            }
        }
        
        return isValid;
    }

    async generateQRCode() {
        const text = this.textInput.value.trim();
        
        if (!this.validateInput()) {
            return;
        }

        try {
            this.showLoading();
            this.clearMessages();

            const options = {
                width: parseInt(this.sizeSelect.value),
                height: parseInt(this.sizeSelect.value),
                errorCorrectionLevel: this.errorCorrectionSelect.value,
                color: {
                    dark: this.fgColorInput.value,
                    light: this.bgColorInput.value
                },
                margin: 2,
                type: 'image/png'
            };

            // Generate QR code
            const dataURL = await QRCode.toDataURL(text, options);
            
            // Store current QR data for download
            this.currentQRData = {
                dataURL: dataURL,
                text: text,
                size: options.width
            };

            this.displayQRCode(dataURL);
            this.showSuccess('QR code generated successfully!');
            
        } catch (error) {
            console.error('QR generation error:', error);
            this.showError('Failed to generate QR code. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async regenerateQRCode() {
        if (this.currentQRData && this.textInput.value.trim()) {
            await this.generateQRCode();
        }
    }

    displayQRCode(dataURL) {
        // Hide placeholder
        this.qrPlaceholder.style.display = 'none';
        
        // Show canvas
        this.qrCanvas.style.display = 'block';
        
        // Create image and draw on canvas
        const img = new Image();
        img.onload = () => {
            const ctx = this.qrCanvas.getContext('2d');
            const size = parseInt(this.sizeSelect.value);
            
            this.qrCanvas.width = size;
            this.qrCanvas.height = size;
            
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
            
            // Add animation class
            this.qrCanvas.classList.add('qr-generated');
            setTimeout(() => {
                this.qrCanvas.classList.remove('qr-generated');
            }, 500);
        };
        img.src = dataURL;
        
        // Update preview area
        this.previewArea.classList.add('has-qr');
        
        // Enable download button
        this.downloadBtn.disabled = false;
    }

    downloadQRCode() {
        if (!this.currentQRData) {
            this.showError('No QR code to download');
            return;
        }

        try {
            // Create download link
            const link = document.createElement('a');
            link.download = `qr-code-${Date.now()}.png`;
            link.href = this.currentQRData.dataURL;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('QR code downloaded successfully!');
            
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Failed to download QR code');
        }
    }

    clearAll() {
        // Clear input
        this.textInput.value = '';
        
        // Reset options to defaults
        this.sizeSelect.value = '300';
        this.errorCorrectionSelect.value = 'M';
        this.fgColorInput.value = '#000000';
        this.bgColorInput.value = '#ffffff';
        
        // Clear QR code display
        this.qrPlaceholder.style.display = 'flex';
        this.qrCanvas.style.display = 'none';
        this.previewArea.classList.remove('has-qr');
        
        // Disable download button
        this.downloadBtn.disabled = true;
        
        // Clear current QR data
        this.currentQRData = null;
        
        // Update character count
        this.updateCharacterCount();
        
        // Clear messages
        this.clearMessages();
        
        // Focus on input
        this.textInput.focus();
    }

    showLoading() {
        this.generateBtn.disabled = true;
        this.generateBtn.textContent = 'Generating...';
        this.generateBtn.classList.add('loading');
    }

    hideLoading() {
        this.generateBtn.disabled = false;
        this.generateBtn.textContent = 'Generate QR Code';
        this.generateBtn.classList.remove('loading');
    }

    showError(message) {
        this.clearMessages();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        this.textInput.parentNode.appendChild(errorDiv);
        this.textInput.classList.add('error');
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            this.clearMessages();
        }, 5000);
    }

    showSuccess(message) {
        this.clearMessages();
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        this.textInput.parentNode.appendChild(successDiv);
        this.textInput.classList.add('success');
        
        // Auto-hide success after 3 seconds
        setTimeout(() => {
            this.clearMessages();
        }, 3000);
    }

    clearMessages() {
        // Remove error/success messages
        const messages = document.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => msg.remove());
        
        // Remove error/success classes
        this.textInput.classList.remove('error', 'success');
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    reinitialize() {
        // This method is called when the QR library is loaded via fallback
        console.log('QR Generator reinitializing with loaded library');
        this.clearMessages();
        this.showSuccess('QR Code library loaded successfully!');
    }
}

// Utility functions for QR code validation
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function getQRContentType(text) {
    if (isValidURL(text)) {
        return 'URL';
    } else if (isValidEmail(text)) {
        return 'Email';
    } else if (/^\+?[\d\s\-\(\)]+$/.test(text)) {
        return 'Phone';
    } else {
        return 'Text';
    }
}

// Initialize the QR generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if QRCode library is loaded
    if (typeof QRCode === 'undefined') {
        console.error('QRCode library not loaded');
        
        // Show a user-friendly error message
        const qrPlaceholder = document.getElementById('qr-placeholder');
        if (qrPlaceholder) {
            qrPlaceholder.innerHTML = `
                <div class="placeholder-icon">⚠️</div>
                <p>QR Code library failed to load.</p>
                <p><small>Please refresh the page to try again.</small></p>
            `;
        }
        return;
    }
    
    // Initialize the QR generator
    const qrGenerator = new QRGenerator();
    
    // Make it globally accessible for fallback loading
    window.qrGenerator = qrGenerator;
    
    // Add some sample text suggestions
    const sampleTexts = [
        'https://example.com',
        'Hello, World!',
        'Check out this QR code generator!',
        'mailto:example@email.com',
        'This is a sample QR code text'
    ];
    
    // Add sample text functionality (optional)
    const textInput = document.getElementById('text-input');
    textInput.addEventListener('focus', () => {
        if (!textInput.value) {
            textInput.placeholder = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        }
    });
    
    // Add keyboard shortcuts info to footer
    const footer = document.querySelector('.footer p');
    footer.innerHTML = `
        Enter text above and click "Generate QR Code" to create your QR code<br>
        <small>Keyboard shortcuts: Ctrl/Cmd + Enter (Generate), Ctrl/Cmd + L (Clear)</small>
    `;
    
    console.log('QR Code Generator initialized successfully');
});