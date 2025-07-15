class URLShortener {
    constructor() {
        this.shortUrls = JSON.parse(localStorage.getItem('shortUrls')) || [];
        this.baseUrl = 'https://short.ly/';
        
        this.initializeElements();
        this.attachEventListeners();
        this.renderHistory();
    }
    
    initializeElements() {
        this.originalUrlInput = document.getElementById('originalUrl');
        this.customAliasInput = document.getElementById('customAlias');
        this.shortenBtn = document.getElementById('shortenBtn');
        this.resultSection = document.getElementById('resultSection');
        this.shortenedUrlInput = document.getElementById('shortenedUrl');
        this.copyBtn = document.getElementById('copyBtn');
        this.qrCodeDiv = document.getElementById('qrCode');
        this.clickCountSpan = document.getElementById('clickCount');
        this.createDateSpan = document.getElementById('createDate');
        this.historyList = document.getElementById('historyList');
    }
    
    attachEventListeners() {
        this.shortenBtn.addEventListener('click', () => this.shortenUrl());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.originalUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.shortenUrl();
            }
        });
        this.customAliasInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.shortenUrl();
            }
        });
    }
    
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    generateShortCode() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    shortenUrl() {
        const originalUrl = this.originalUrlInput.value.trim();
        const customAlias = this.customAliasInput.value.trim();
        
        if (!originalUrl) {
            this.showNotification('URLを入力してください', 'error');
            return;
        }
        
        if (!this.isValidUrl(originalUrl)) {
            this.showNotification('有効なURLを入力してください', 'error');
            return;
        }
        
        // Check if custom alias already exists
        if (customAlias && this.shortUrls.some(url => url.alias === customAlias)) {
            this.showNotification('このエイリアスは既に使用されています', 'error');
            return;
        }
        
        const shortCode = customAlias || this.generateShortCode();
        const shortUrl = this.baseUrl + shortCode;
        const currentDate = new Date();
        
        const urlData = {
            id: Date.now(),
            originalUrl: originalUrl,
            shortUrl: shortUrl,
            alias: shortCode,
            clicks: 0,
            createdAt: currentDate,
            lastClicked: null
        };
        
        this.shortUrls.unshift(urlData);
        this.saveToStorage();
        
        this.displayResult(urlData);
        this.renderHistory();
        this.clearForm();
        
        this.showNotification('短縮URLを作成しました！', 'success');
    }
    
    displayResult(urlData) {
        this.shortenedUrlInput.value = urlData.shortUrl;
        this.clickCountSpan.textContent = urlData.clicks;
        this.createDateSpan.textContent = this.formatDate(urlData.createdAt);
        
        this.generateQRCode(urlData.shortUrl);
        this.resultSection.style.display = 'block';
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    generateQRCode(url) {
        // Simple QR code placeholder - in a real app, you'd use a QR code library
        this.qrCodeDiv.innerHTML = `
            <div style="width: 150px; height: 150px; margin: 0 auto; background: #f0f0f0; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; border-radius: 10px;">
                <div style="text-align: center; color: #666;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">📱</div>
                    <div style="font-size: 0.8rem;">QRコード</div>
                    <div style="font-size: 0.7rem; margin-top: 5px;">※実装中</div>
                </div>
            </div>
        `;
    }
    
    copyToClipboard() {
        this.shortenedUrlInput.select();
        this.shortenedUrlInput.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            this.showNotification('クリップボードにコピーしました', 'success');
        } catch (err) {
            this.showNotification('コピーに失敗しました', 'error');
        }
    }
    
    renderHistory() {
        if (this.shortUrls.length === 0) {
            this.historyList.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📋</span>
                    <p>まだ短縮URLがありません</p>
                </div>
            `;
            return;
        }
        
        this.historyList.innerHTML = this.shortUrls.map(url => `
            <div class="history-item">
                <div class="history-item-header">
                    <span class="history-item-url">${url.shortUrl}</span>
                    <span class="history-item-date">${this.formatDate(url.createdAt)}</span>
                </div>
                <div class="history-item-original">${url.originalUrl}</div>
                <div class="history-item-stats">
                    <span>クリック数: ${url.clicks}</span>
                    <span>最終クリック: ${url.lastClicked ? this.formatDate(url.lastClicked) : '未使用'}</span>
                    <button onclick="urlShortener.copyUrl('${url.shortUrl}')" style="padding: 5px 10px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">コピー</button>
                    <button onclick="urlShortener.deleteUrl(${url.id})" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">削除</button>
                </div>
            </div>
        `).join('');
    }
    
    copyUrl(url) {
        navigator.clipboard.writeText(url).then(() => {
            this.showNotification('URLをコピーしました', 'success');
        }).catch(() => {
            this.showNotification('コピーに失敗しました', 'error');
        });
    }
    
    deleteUrl(id) {
        if (confirm('この短縮URLを削除しますか？')) {
            this.shortUrls = this.shortUrls.filter(url => url.id !== id);
            this.saveToStorage();
            this.renderHistory();
            this.showNotification('削除しました', 'success');
        }
    }
    
    simulateClick(id) {
        const urlData = this.shortUrls.find(url => url.id === id);
        if (urlData) {
            urlData.clicks++;
            urlData.lastClicked = new Date();
            this.saveToStorage();
            this.renderHistory();
        }
    }
    
    formatDate(date) {
        return new Date(date).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    clearForm() {
        this.originalUrlInput.value = '';
        this.customAliasInput.value = '';
    }
    
    saveToStorage() {
        localStorage.setItem('shortUrls', JSON.stringify(this.shortUrls));
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = '#28a745';
                break;
            case 'error':
                notification.style.background = '#dc3545';
                break;
            default:
                notification.style.background = '#17a2b8';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the URL shortener when the page loads
let urlShortener;
document.addEventListener('DOMContentLoaded', () => {
    urlShortener = new URLShortener();
});