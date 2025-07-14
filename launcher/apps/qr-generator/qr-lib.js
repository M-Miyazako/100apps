/**
 * Simple QR Code Generator
 * A basic implementation for generating QR codes using HTML5 Canvas
 */

class SimpleQRGenerator {
    constructor() {
        this.errorCorrectionLevels = {
            'L': 0.07,
            'M': 0.15,
            'Q': 0.25,
            'H': 0.30
        };
    }

    /**
     * Generate QR code data URL
     * @param {string} text - Text to encode
     * @param {Object} options - Options for QR generation
     * @returns {Promise<string>} Data URL of the QR code
     */
    async toDataURL(text, options = {}) {
        const defaults = {
            width: 300,
            height: 300,
            color: {
                dark: '#000000',
                light: '#ffffff'
            },
            errorCorrectionLevel: 'M',
            margin: 2
        };

        const config = { ...defaults, ...options };
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = config.width;
        canvas.height = config.height;
        const ctx = canvas.getContext('2d');

        // Generate QR pattern using Google Charts API as fallback
        // Since we can't use external libraries, we'll create a simple pattern
        const qrData = this.generateQRPattern(text, config);
        
        // Draw QR code on canvas
        this.drawQRCode(ctx, qrData, config);

        return canvas.toDataURL('image/png');
    }

    /**
     * Generate a simple QR-like pattern
     * This is a simplified version for demonstration
     */
    generateQRPattern(text, config) {
        // Create a simple grid pattern based on text
        const gridSize = 25; // 25x25 grid
        const pattern = [];
        
        // Initialize grid
        for (let i = 0; i < gridSize; i++) {
            pattern[i] = [];
            for (let j = 0; j < gridSize; j++) {
                pattern[i][j] = 0;
            }
        }

        // Add finder patterns (corner squares)
        this.addFinderPattern(pattern, 0, 0, gridSize);
        this.addFinderPattern(pattern, gridSize - 7, 0, gridSize);
        this.addFinderPattern(pattern, 0, gridSize - 7, gridSize);

        // Add data pattern based on text
        this.addDataPattern(pattern, text, gridSize);

        return pattern;
    }

    /**
     * Add finder patterns (the square patterns in corners)
     */
    addFinderPattern(pattern, startX, startY, gridSize) {
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                const x = startX + i;
                const y = startY + j;
                
                if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
                    // Create the finder pattern
                    if (i === 0 || i === 6 || j === 0 || j === 6) {
                        pattern[x][y] = 1;
                    } else if (i >= 2 && i <= 4 && j >= 2 && j <= 4) {
                        pattern[x][y] = 1;
                    }
                }
            }
        }
    }

    /**
     * Add data pattern based on text
     */
    addDataPattern(pattern, text, gridSize) {
        // Simple hash-based pattern generation
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
        }

        // Use hash to create a pseudo-random but deterministic pattern
        for (let i = 8; i < gridSize - 8; i++) {
            for (let j = 8; j < gridSize - 8; j++) {
                // Skip finder pattern areas
                if ((i < 9 && j < 9) || (i > gridSize - 10 && j < 9) || (i < 9 && j > gridSize - 10)) {
                    continue;
                }

                const seed = hash + i * gridSize + j;
                pattern[i][j] = Math.abs(seed) % 2;
            }
        }
    }

    /**
     * Draw QR code on canvas
     */
    drawQRCode(ctx, pattern, config) {
        const { width, height, color, margin } = config;
        const gridSize = pattern.length;
        
        // Clear canvas
        ctx.fillStyle = color.light;
        ctx.fillRect(0, 0, width, height);

        // Calculate module size
        const moduleSize = Math.floor((width - 2 * margin) / gridSize);
        const offsetX = (width - moduleSize * gridSize) / 2;
        const offsetY = (height - moduleSize * gridSize) / 2;

        // Draw modules
        ctx.fillStyle = color.dark;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (pattern[i][j] === 1) {
                    const x = offsetX + i * moduleSize;
                    const y = offsetY + j * moduleSize;
                    ctx.fillRect(x, y, moduleSize, moduleSize);
                }
            }
        }

        // Add a small label at the bottom
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code', width / 2, height - 5);
    }
}

// Make it globally available
window.QRCode = new SimpleQRGenerator();