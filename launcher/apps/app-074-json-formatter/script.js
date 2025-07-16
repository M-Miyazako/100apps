class JsonFormatter {
    constructor() {
        this.inputElement = document.getElementById('jsonInput');
        this.outputElement = document.getElementById('jsonOutput');
        this.statusElement = document.getElementById('validationStatus');
        this.charCountElement = document.getElementById('charCount');
        this.lineCountElement = document.getElementById('lineCount');
        this.sizeInfoElement = document.getElementById('sizeInfo');
        this.errorSection = document.getElementById('errorSection');
        this.errorDetails = document.getElementById('errorDetails');
        this.indentSelect = document.getElementById('indentSelect');
        
        this.initializeEventListeners();
        this.updateStats();
    }
    
    initializeEventListeners() {
        // ボタンイベント
        document.getElementById('formatBtn').addEventListener('click', () => {
            this.formatJson();
        });
        
        document.getElementById('validateBtn').addEventListener('click', () => {
            this.validateJson();
        });
        
        document.getElementById('minifyBtn').addEventListener('click', () => {
            this.minifyJson();
        });
        
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAll();
        });
        
        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyToClipboard();
        });
        
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadJson();
        });
        
        // 入力変更イベント
        this.inputElement.addEventListener('input', () => {
            this.updateStats();
        });
        
        // インデント変更イベント
        this.indentSelect.addEventListener('change', () => {
            if (this.outputElement.textContent.trim()) {
                this.formatJson();
            }
        });
    }
    
    formatJson() {
        const input = this.inputElement.value.trim();
        if (!input) {
            this.showError('入力が空です');
            return;
        }
        
        try {
            const parsed = JSON.parse(input);
            const indentValue = this.getIndentValue();
            const formatted = JSON.stringify(parsed, null, indentValue);
            
            this.outputElement.textContent = formatted;
            this.setStatus('整形完了', 'status-valid');
            this.hideError();
            this.updateStats();
        } catch (error) {
            this.showError('JSON構文エラー: ' + error.message);
            this.setStatus('構文エラー', 'status-error');
        }
    }
    
    validateJson() {
        const input = this.inputElement.value.trim();
        if (!input) {
            this.showError('入力が空です');
            return;
        }
        
        try {
            JSON.parse(input);
            this.setStatus('有効なJSON', 'status-valid');
            this.hideError();
            this.outputElement.textContent = '✓ JSONは有効です';
        } catch (error) {
            this.showError('JSON構文エラー: ' + error.message);
            this.setStatus('無効なJSON', 'status-error');
            this.outputElement.textContent = '✗ JSONが無効です';
        }
    }
    
    minifyJson() {
        const input = this.inputElement.value.trim();
        if (!input) {
            this.showError('入力が空です');
            return;
        }
        
        try {
            const parsed = JSON.parse(input);
            const minified = JSON.stringify(parsed);
            
            this.outputElement.textContent = minified;
            this.setStatus('圧縮完了', 'status-valid');
            this.hideError();
            this.updateStats();
        } catch (error) {
            this.showError('JSON構文エラー: ' + error.message);
            this.setStatus('構文エラー', 'status-error');
        }
    }
    
    clearAll() {
        this.inputElement.value = '';
        this.outputElement.textContent = '';
        this.setStatus('準備完了', 'status-valid');
        this.hideError();
        this.updateStats();
    }
    
    async copyToClipboard() {
        const output = this.outputElement.textContent;
        if (!output) {
            this.showError('コピーする内容がありません');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(output);
            this.setStatus('コピー完了', 'status-valid');
            setTimeout(() => {
                this.setStatus('準備完了', 'status-valid');
            }, 2000);
        } catch (error) {
            this.showError('コピーに失敗しました: ' + error.message);
        }
    }
    
    downloadJson() {
        const output = this.outputElement.textContent;
        if (!output) {
            this.showError('ダウンロードする内容がありません');
            return;
        }
        
        const blob = new Blob([output], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formatted.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.setStatus('ダウンロード完了', 'status-valid');
        setTimeout(() => {
            this.setStatus('準備完了', 'status-valid');
        }, 2000);
    }
    
    getIndentValue() {
        const value = this.indentSelect.value;
        if (value === 'tab') {
            return '\t';
        }
        return parseInt(value);
    }
    
    setStatus(message, className) {
        this.statusElement.textContent = message;
        this.statusElement.className = className;
    }
    
    showError(message) {
        this.errorDetails.textContent = message;
        this.errorSection.style.display = 'block';
    }
    
    hideError() {
        this.errorSection.style.display = 'none';
    }
    
    updateStats() {
        const input = this.inputElement.value;
        const output = this.outputElement.textContent;
        const text = output || input;
        
        this.charCountElement.textContent = text.length;
        this.lineCountElement.textContent = text.split('\n').length;
        this.sizeInfoElement.textContent = this.formatBytes(new Blob([text]).size);
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 bytes';
        const k = 1024;
        const sizes = ['bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new JsonFormatter();
    console.log('JSON Formatter app initialized');
});