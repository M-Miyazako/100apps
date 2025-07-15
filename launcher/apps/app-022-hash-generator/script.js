// Hash Generator Application
class HashGenerator {
    constructor() {
        this.currentHash = null;
        this.history = JSON.parse(localStorage.getItem('hashHistory') || '[]');
        this.favorites = JSON.parse(localStorage.getItem('hashFavorites') || '[]');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderHistory();
        this.renderFavorites();
        this.setupRealtimeHashing();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Hash generation
        document.getElementById('hash-text').addEventListener('click', () => this.hashText());
        document.getElementById('hash-file').addEventListener('click', () => this.hashFile());

        // Clear buttons
        document.getElementById('clear-text').addEventListener('click', () => this.clearText());
        document.getElementById('clear-file').addEventListener('click', () => this.clearFile());

        // Copy functionality
        document.getElementById('copy-hash').addEventListener('click', () => this.copyHash());

        // Comparison
        document.getElementById('compare-btn').addEventListener('click', () => this.compareHash());

        // History and favorites
        document.getElementById('clear-history').addEventListener('click', () => this.clearHistory());
        document.getElementById('clear-favorites').addEventListener('click', () => this.clearFavorites());
        document.getElementById('save-favorite').addEventListener('click', () => this.saveFavorite());

        // File upload
        this.setupFileUpload();

        // Algorithm change
        document.querySelectorAll('input[name="algorithm"]').forEach(radio => {
            radio.addEventListener('change', () => this.onAlgorithmChange());
        });
    }

    setupFileUpload() {
        const fileUploadArea = document.getElementById('file-upload-area');
        const fileInput = document.getElementById('file-input');

        fileUploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));

        // Drag and drop
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('drag-over');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('drag-over');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('drag-over');
            this.handleFileSelect(e.dataTransfer.files[0]);
        });
    }

    setupRealtimeHashing() {
        const textInput = document.getElementById('text-input');
        let timeout;

        textInput.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (textInput.value.trim()) {
                    this.hashText(false); // Don't add to history for real-time
                }
            }, 500);
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Clear output if switching tabs
        this.clearOutput();
    }

    async hashText(addToHistory = true) {
        const textInput = document.getElementById('text-input');
        const text = textInput.value.trim();

        if (!text) {
            this.showToast('Please enter some text to hash', 'error');
            return;
        }

        try {
            if (addToHistory) this.showLoading();
            
            const algorithm = this.getSelectedAlgorithm();
            const hash = await this.generateHash(text, algorithm);
            
            this.displayHash(hash, algorithm, `Text: ${text.substring(0, 50)}...`);
            
            if (addToHistory) {
                this.addToHistory(text, hash, algorithm, 'text');
                this.showToast('Hash generated successfully!', 'success');
            }
        } catch (error) {
            this.showToast('Error generating hash: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async hashFile() {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];

        if (!file) {
            this.showToast('Please select a file to hash', 'error');
            return;
        }

        try {
            this.showLoading();
            
            const algorithm = this.getSelectedAlgorithm();
            const arrayBuffer = await file.arrayBuffer();
            const hash = await this.generateHashFromBuffer(arrayBuffer, algorithm);
            
            this.displayHash(hash, algorithm, `File: ${file.name}`);
            this.addToHistory(file.name, hash, algorithm, 'file');
            this.showToast('File hash generated successfully!', 'success');
        } catch (error) {
            this.showToast('Error generating file hash: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async generateHash(text, algorithm) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        return await this.generateHashFromBuffer(data, algorithm);
    }

    async generateHashFromBuffer(buffer, algorithm) {
        // For MD5, we'll use a simple implementation
        if (algorithm === 'md5') {
            return this.md5(buffer);
        }

        // For SHA algorithms, use Web Crypto API
        let hashAlgorithm;
        switch (algorithm) {
            case 'sha1':
                hashAlgorithm = 'SHA-1';
                break;
            case 'sha256':
                hashAlgorithm = 'SHA-256';
                break;
            case 'sha512':
                hashAlgorithm = 'SHA-512';
                break;
            default:
                throw new Error('Unsupported algorithm');
        }

        const hashBuffer = await crypto.subtle.digest(hashAlgorithm, buffer);
        return this.bufferToHex(hashBuffer);
    }

    // Simple MD5 implementation
    md5(buffer) {
        // Convert ArrayBuffer to Uint8Array
        const uint8Array = new Uint8Array(buffer);
        
        // Simple MD5 implementation (basic version)
        // Note: This is a simplified version. In production, use a proper MD5 library
        const md5Hash = this.simpleMD5(uint8Array);
        return md5Hash;
    }

    simpleMD5(data) {
        // This is a basic MD5 implementation for demonstration
        // In a real application, you would use a proper MD5 library
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data[i];
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Convert to hex and pad to 32 characters (MD5 length)
        let hex = Math.abs(hash).toString(16);
        while (hex.length < 32) {
            hex = '0' + hex;
        }
        
        return hex;
    }

    bufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    displayHash(hash, algorithm, input) {
        const hashOutput = document.getElementById('hash-output');
        const outputActions = document.getElementById('output-actions');

        hashOutput.innerHTML = `
            <div class="hash-result">
                <div class="hash-algorithm">${algorithm.toUpperCase()}</div>
                <div class="hash-value">${hash}</div>
            </div>
        `;

        outputActions.style.display = 'flex';
        this.currentHash = { hash, algorithm, input };
    }

    clearOutput() {
        const hashOutput = document.getElementById('hash-output');
        const outputActions = document.getElementById('output-actions');

        hashOutput.innerHTML = `
            <div class="hash-placeholder">
                <div class="placeholder-icon">🔐</div>
                <p>Your hash will appear here</p>
            </div>
        `;

        outputActions.style.display = 'none';
        this.currentHash = null;
    }

    getSelectedAlgorithm() {
        return document.querySelector('input[name="algorithm"]:checked').value;
    }

    clearText() {
        document.getElementById('text-input').value = '';
        this.clearOutput();
    }

    clearFile() {
        document.getElementById('file-input').value = '';
        document.getElementById('file-info').style.display = 'none';
        this.clearOutput();
    }

    handleFileSelect(file) {
        if (!file) return;

        const fileInfo = document.getElementById('file-info');
        const fileName = fileInfo.querySelector('.file-name');
        const fileSize = fileInfo.querySelector('.file-size');

        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        fileInfo.style.display = 'flex';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async copyHash() {
        if (!this.currentHash) return;

        try {
            await navigator.clipboard.writeText(this.currentHash.hash);
            this.showToast('Hash copied to clipboard!', 'success');
        } catch (error) {
            this.showToast('Failed to copy hash', 'error');
        }
    }

    compareHash() {
        const compareInput = document.getElementById('compare-hash');
        const compareResult = document.getElementById('comparison-result');
        const inputHash = compareInput.value.trim().toLowerCase();

        if (!inputHash) {
            this.showToast('Please enter a hash to compare', 'error');
            return;
        }

        if (!this.currentHash) {
            this.showToast('Please generate a hash first', 'error');
            return;
        }

        const currentHashValue = this.currentHash.hash.toLowerCase();
        const isMatch = inputHash === currentHashValue;

        compareResult.className = `comparison-result ${isMatch ? 'match' : 'no-match'}`;
        compareResult.textContent = isMatch ? 
            '✓ Hashes match! The input produces the same hash.' :
            '✗ Hashes do not match. The input produces a different hash.';
        compareResult.style.display = 'block';
    }

    addToHistory(input, hash, algorithm, type) {
        const historyItem = {
            id: Date.now(),
            input: input,
            hash: hash,
            algorithm: algorithm,
            type: type,
            timestamp: new Date().toISOString()
        };

        this.history.unshift(historyItem);
        
        // Keep only last 50 items
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        localStorage.setItem('hashHistory', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        const container = document.getElementById('history-container');
        
        if (this.history.length === 0) {
            container.innerHTML = `
                <div class="history-placeholder">
                    <p>No hash history yet. Generate your first hash to see it here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.history.map(item => `
            <div class="history-item">
                <div class="item-info">
                    <div class="item-algorithm">${item.algorithm.toUpperCase()}</div>
                    <div class="item-input">${item.input}</div>
                    <div class="item-hash">${item.hash}</div>
                </div>
                <div class="item-actions">
                    <button class="copy-btn" onclick="hashGenerator.copyToClipboard('${item.hash}')">Copy</button>
                    <button class="favorite-btn" onclick="hashGenerator.addToFavorites('${item.id}')">★</button>
                    <button class="remove-btn" onclick="hashGenerator.removeFromHistory('${item.id}')">Remove</button>
                </div>
            </div>
        `).join('');
    }

    renderFavorites() {
        const container = document.getElementById('favorites-container');
        
        if (this.favorites.length === 0) {
            container.innerHTML = `
                <div class="favorites-placeholder">
                    <p>No favorites yet. Save your important hashes here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.favorites.map(item => `
            <div class="favorite-item">
                <div class="item-info">
                    <div class="item-algorithm">${item.algorithm.toUpperCase()}</div>
                    <div class="item-input">${item.input}</div>
                    <div class="item-hash">${item.hash}</div>
                </div>
                <div class="item-actions">
                    <button class="copy-btn" onclick="hashGenerator.copyToClipboard('${item.hash}')">Copy</button>
                    <button class="remove-btn" onclick="hashGenerator.removeFromFavorites('${item.id}')">Remove</button>
                </div>
            </div>
        `).join('');
    }

    async copyToClipboard(hash) {
        try {
            await navigator.clipboard.writeText(hash);
            this.showToast('Hash copied to clipboard!', 'success');
        } catch (error) {
            this.showToast('Failed to copy hash', 'error');
        }
    }

    addToFavorites(historyId) {
        const historyItem = this.history.find(item => item.id == historyId);
        if (!historyItem) return;

        // Check if already in favorites
        if (this.favorites.some(fav => fav.hash === historyItem.hash)) {
            this.showToast('Hash already in favorites', 'error');
            return;
        }

        this.favorites.unshift(historyItem);
        localStorage.setItem('hashFavorites', JSON.stringify(this.favorites));
        this.renderFavorites();
        this.showToast('Added to favorites!', 'success');
    }

    saveFavorite() {
        if (!this.currentHash) {
            this.showToast('Please generate a hash first', 'error');
            return;
        }

        // Check if already in favorites
        if (this.favorites.some(fav => fav.hash === this.currentHash.hash)) {
            this.showToast('Hash already in favorites', 'error');
            return;
        }

        const favoriteItem = {
            id: Date.now(),
            input: this.currentHash.input,
            hash: this.currentHash.hash,
            algorithm: this.currentHash.algorithm,
            type: 'manual',
            timestamp: new Date().toISOString()
        };

        this.favorites.unshift(favoriteItem);
        localStorage.setItem('hashFavorites', JSON.stringify(this.favorites));
        this.renderFavorites();
        this.showToast('Added to favorites!', 'success');
    }

    removeFromHistory(id) {
        this.history = this.history.filter(item => item.id != id);
        localStorage.setItem('hashHistory', JSON.stringify(this.history));
        this.renderHistory();
        this.showToast('Removed from history', 'success');
    }

    removeFromFavorites(id) {
        this.favorites = this.favorites.filter(item => item.id != id);
        localStorage.setItem('hashFavorites', JSON.stringify(this.favorites));
        this.renderFavorites();
        this.showToast('Removed from favorites', 'success');
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all history?')) {
            this.history = [];
            localStorage.removeItem('hashHistory');
            this.renderHistory();
            this.showToast('History cleared', 'success');
        }
    }

    clearFavorites() {
        if (confirm('Are you sure you want to clear all favorites?')) {
            this.favorites = [];
            localStorage.removeItem('hashFavorites');
            this.renderFavorites();
            this.showToast('Favorites cleared', 'success');
        }
    }

    onAlgorithmChange() {
        // Re-hash if there's content and we're in real-time mode
        const textInput = document.getElementById('text-input');
        if (textInput.value.trim()) {
            this.hashText(false);
        }
    }

    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Enhanced MD5 implementation using a proper algorithm
class MD5 {
    constructor() {
        this.h = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476];
    }

    static hash(data) {
        const md5 = new MD5();
        
        // Convert string to bytes if needed
        if (typeof data === 'string') {
            data = new TextEncoder().encode(data);
        }
        
        // Convert ArrayBuffer to Uint8Array if needed
        if (data instanceof ArrayBuffer) {
            data = new Uint8Array(data);
        }
        
        return md5.update(data).digest();
    }

    update(data) {
        const bytes = new Uint8Array(data);
        const bitLength = bytes.length * 8;
        
        // Pre-processing: adding padding bits
        const paddedLength = Math.ceil((bitLength + 65) / 512) * 512;
        const paddedBytes = new Uint8Array(paddedLength / 8);
        paddedBytes.set(bytes);
        
        // Append '1' bit
        paddedBytes[bytes.length] = 0x80;
        
        // Append length in bits as 64-bit little-endian
        const lengthArray = new Uint32Array(paddedBytes.buffer, paddedBytes.byteLength - 8, 2);
        lengthArray[0] = bitLength;
        lengthArray[1] = Math.floor(bitLength / 0x100000000);
        
        // Process in 512-bit chunks
        const words = new Uint32Array(paddedBytes.buffer);
        for (let i = 0; i < words.length; i += 16) {
            this.processChunk(words.subarray(i, i + 16));
        }
        
        return this;
    }

    processChunk(chunk) {
        const [a, b, c, d] = this.h;
        let [A, B, C, D] = this.h;
        
        // Main loop
        for (let i = 0; i < 64; i++) {
            let F, g;
            
            if (i < 16) {
                F = (B & C) | (~B & D);
                g = i;
            } else if (i < 32) {
                F = (D & B) | (~D & C);
                g = (5 * i + 1) % 16;
            } else if (i < 48) {
                F = B ^ C ^ D;
                g = (3 * i + 5) % 16;
            } else {
                F = C ^ (B | ~D);
                g = (7 * i) % 16;
            }
            
            const K = this.getK(i);
            const temp = this.addUnsigned(
                this.addUnsigned(A, F),
                this.addUnsigned(
                    this.addUnsigned(chunk[g], K),
                    this.rotateLeft(
                        this.addUnsigned(A, this.addUnsigned(F, this.addUnsigned(chunk[g], K))),
                        this.getS(i)
                    )
                )
            );
            
            A = D;
            D = C;
            C = B;
            B = this.addUnsigned(B, this.rotateLeft(temp, this.getS(i)));
        }
        
        this.h[0] = this.addUnsigned(this.h[0], A);
        this.h[1] = this.addUnsigned(this.h[1], B);
        this.h[2] = this.addUnsigned(this.h[2], C);
        this.h[3] = this.addUnsigned(this.h[3], D);
    }

    getK(i) {
        const K = [
            0xD76AA478, 0xE8C7B756, 0x242070DB, 0xC1BDCEEE, 0xF57C0FAF, 0x4787C62A, 0xA8304613, 0xFD469501,
            0x698098D8, 0x8B44F7AF, 0xFFFF5BB1, 0x895CD7BE, 0x6B901122, 0xFD987193, 0xA679438E, 0x49B40821,
            0xF61E2562, 0xC040B340, 0x265E5A51, 0xE9B6C7AA, 0xD62F105D, 0x02441453, 0xD8A1E681, 0xE7D3FBC8,
            0x21E1CDE6, 0xC33707D6, 0xF4D50D87, 0x455A14ED, 0xA9E3E905, 0xFCEFA3F8, 0x676F02D9, 0x8D2A4C8A,
            0xFFFA3942, 0x8771F681, 0x6D9D6122, 0xFDE5380C, 0xA4BEEA44, 0x4BDECFA9, 0xF6BB4B60, 0xBEBFBC70,
            0x289B7EC6, 0xEAA127FA, 0xD4EF3085, 0x04881D05, 0xD9D4D039, 0xE6DB99E5, 0x1FA27CF8, 0xC4AC5665,
            0xF4292244, 0x432AFF97, 0xAB9423A7, 0xFC93A039, 0x655B59C3, 0x8F0CCC92, 0xFFEFF47D, 0x85845DD1,
            0x6FA87E4F, 0xFE2CE6E0, 0xA3014314, 0x4E0811A1, 0xF7537E82, 0xBD3AF235, 0x2AD7D2BB, 0xEB86D391
        ];
        return K[i];
    }

    getS(i) {
        const S = [
            7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
            5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
            4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
            6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
        ];
        return S[i];
    }

    addUnsigned(a, b) {
        return (a + b) >>> 0;
    }

    rotateLeft(value, shift) {
        return (value << shift) | (value >>> (32 - shift));
    }

    digest() {
        // Convert hash to hex string
        const hex = this.h.map(h => {
            return Array.from(new Uint8Array(new Uint32Array([h]).buffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }).join('');
        
        return hex;
    }
}

// Override the simple MD5 with the proper implementation
HashGenerator.prototype.md5 = function(buffer) {
    return MD5.hash(buffer);
};

// Initialize the application
let hashGenerator;
document.addEventListener('DOMContentLoaded', () => {
    hashGenerator = new HashGenerator();
});