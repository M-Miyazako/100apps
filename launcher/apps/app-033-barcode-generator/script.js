class BarcodeGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.currentBarcode = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
        this.updateSliderValues();
    }
    
    initializeElements() {
        this.elements = {
            textInput: document.getElementById('textInput'),
            barcodeType: document.getElementById('barcodeType'),
            widthSlider: document.getElementById('width'),
            heightSlider: document.getElementById('height'),
            colorPicker: document.getElementById('color'),
            displayValueCheck: document.getElementById('displayValue'),
            generateBtn: document.getElementById('generateBtn'),
            clearBtn: document.getElementById('clearBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            copyBtn: document.getElementById('copyBtn'),
            canvas: document.getElementById('barcodeCanvas'),
            placeholder: document.getElementById('barcodePlaceholder'),
            widthValue: document.getElementById('widthValue'),
            heightValue: document.getElementById('heightValue'),
            historyList: document.getElementById('historyList')
        };
        
        this.canvas = this.elements.canvas;
        this.ctx = this.canvas.getContext('2d');
    }
    
    bindEvents() {
        this.elements.generateBtn.addEventListener('click', () => this.generateBarcode());
        this.elements.clearBtn.addEventListener('click', () => this.clearBarcode());
        this.elements.downloadBtn.addEventListener('click', () => this.downloadBarcode());
        this.elements.copyBtn.addEventListener('click', () => this.copyBarcodeToClipboard());
        
        this.elements.textInput.addEventListener('input', () => this.validateInput());
        this.elements.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateBarcode();
        });
        
        this.elements.widthSlider.addEventListener('input', () => this.updateSliderValues());
        this.elements.heightSlider.addEventListener('input', () => this.updateSliderValues());
        
        this.elements.barcodeType.addEventListener('change', () => this.validateInput());
    }
    
    updateSliderValues() {
        this.elements.widthValue.textContent = this.elements.widthSlider.value;
        this.elements.heightValue.textContent = this.elements.heightSlider.value;
    }
    
    validateInput() {
        const text = this.elements.textInput.value.trim();
        const type = this.elements.barcodeType.value;
        
        let isValid = true;
        let errorMessage = '';
        
        if (!text) {
            isValid = false;
            errorMessage = 'ƭ�Ȓe�WfO`UD';
        } else {
            // ���%n�������
            switch (type) {
                case 'EAN13':
                    if (!/^\d{12,13}$/.test(text)) {
                        isValid = false;
                        errorMessage = 'EAN13o12~_o13AnpWge�WfO`UD';
                    }
                    break;
                case 'EAN8':
                    if (!/^\d{7,8}$/.test(text)) {
                        isValid = false;
                        errorMessage = 'EAN8o7~_o8AnpWge�WfO`UD';
                    }
                    break;
                case 'UPC':
                    if (!/^\d{11,12}$/.test(text)) {
                        isValid = false;
                        errorMessage = 'UPCo11~_o12AnpWge�WfO`UD';
                    }
                    break;
                case 'CODE39':
                    if (!/^[A-Z0-9\-\. \$\/\+\%]*$/.test(text)) {
                        isValid = false;
                        errorMessage = 'CODE39o�pWh ��n(��gY';
                    }
                    break;
            }
        }
        
        this.elements.generateBtn.disabled = !isValid;
        
        if (errorMessage) {
            this.elements.textInput.style.borderColor = '#f44336';
            this.elements.textInput.title = errorMessage;
        } else {
            this.elements.textInput.style.borderColor = '#e0e0e0';
            this.elements.textInput.title = '';
        }
    }
    
    generateBarcode() {
        const text = this.elements.textInput.value.trim();
        if (!text) return;
        
        const options = {
            text: text,
            type: this.elements.barcodeType.value,
            width: parseFloat(this.elements.widthSlider.value),
            height: parseInt(this.elements.heightSlider.value),
            color: this.elements.colorPicker.value,
            displayValue: this.elements.displayValueCheck.checked
        };
        
        try {
            this.drawBarcode(options);
            this.saveToHistory(options);
            this.showCanvas();
            this.enableActionButtons();
        } catch (error) {
            console.error('Barcode generation error:', error);
            alert("コピーに失敗しました");
        }
    }
    
    drawBarcode(options) {
        // ����jCODE128����ɒ�;�ï��	
        const { text, width, height, color, displayValue } = options;
        
        // ���й�����
        const barWidth = width;
        const barCount = text.length * 8 + 20; // �ï�
        const canvasWidth = barCount * barWidth;
        const canvasHeight = height + (displayValue ? 40 : 0);
        
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        
        // �o�}g^��
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // ����;
        this.ctx.fillStyle = color;
        
        // ����jѿ��g����;
        for (let i = 0; i < barCount; i++) {
            const shouldDraw = this.shouldDrawBar(i, text);
            if (shouldDraw) {
                this.ctx.fillRect(i * barWidth, 0, barWidth, height);
            }
        }
        
        // ƭ��h:
        if (displayValue) {
            this.ctx.fillStyle = color;
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(text, canvasWidth / 2, height + 25);
        }
        
        this.currentBarcode = {
            text,
            dataURL: this.canvas.toDataURL('image/png'),
            options
        };
    }
    
    shouldDrawBar(index, text) {
        // ����jѿ���ï��	
        const charCode = text.charCodeAt(index % text.length);
        return (charCode + index) % 3 !== 0;
    }
    
    showCanvas() {
        this.elements.placeholder.style.display = 'none';
        this.elements.canvas.style.display = 'block';
    }
    
    hideCanvas() {
        this.elements.placeholder.style.display = 'block';
        this.elements.canvas.style.display = 'none';
    }
    
    enableActionButtons() {
        this.elements.downloadBtn.disabled = false;
        this.elements.copyBtn.disabled = false;
    }
    
    disableActionButtons() {
        this.elements.downloadBtn.disabled = true;
        this.elements.copyBtn.disabled = true;
    }
    
    clearBarcode() {
        this.elements.textInput.value = '';
        this.elements.textInput.style.borderColor = '#e0e0e0';
        this.elements.textInput.title = '';
        this.currentBarcode = null;
        this.hideCanvas();
        this.disableActionButtons();
        this.elements.generateBtn.disabled = true;
    }
    
    downloadBarcode() {
        if (!this.currentBarcode) return;
        
        const link = document.createElement('a');
        link.download = `barcode-${this.currentBarcode.text}-${Date.now()}.png`;
        link.href = this.currentBarcode.dataURL;
        link.click();
    }
    
    async copyBarcodeToClipboard() {
        if (!this.currentBarcode) return;
        
        try {
            // Data URL�Blobk	�
            const response = await fetch(this.currentBarcode.dataURL);
            const blob = await response.blob();
            
            // �������k���
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            
            // գ���ïh:
            const originalText = this.elements.copyBtn.innerHTML;
            this.elements.copyBtn.innerHTML = '<span class="btn-icon"></span>�����';
            this.elements.copyBtn.style.background = 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';
            
            setTimeout(() => {
                this.elements.copyBtn.innerHTML = originalText;
                this.elements.copyBtn.style.background = '';
            }, 2000);
        } catch (error) {
            console.error('Copy failed:', error);
            alert("コピーに失敗しました");
        }
    }
    
    saveToHistory(options) {
        let history = JSON.parse(localStorage.getItem('barcodeHistory') || '[]');
        
        const historyItem = {
            text: options.text,
            type: options.type,
            timestamp: new Date().toISOString(),
            options: options
        };
        
        history.unshift(historyItem);
        history = history.slice(0, 20); //  �20�~g�
        
        localStorage.setItem('barcodeHistory', JSON.stringify(history));
        this.displayHistory();
    }
    
    loadHistory() {
        this.history = JSON.parse(localStorage.getItem('barcodeHistory') || '[]');
        this.displayHistory();
    }
    
    displayHistory() {
        if (this.history.length === 0) {
            this.elements.historyList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">~`etLB�~[�</p>';
            return;
        }
        
        this.elements.historyList.innerHTML = this.history
            .map(item => {
                const date = new Date(item.timestamp).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                return `
                    <div class="history-item" onclick="barcodeGen.loadFromHistory('${item.text}', '${item.type}')">
                        <div>
                            <div class="history-text">${item.text}</div>
                            <div class="history-date">${date}</div>
                        </div>
                        <div class="history-type">${item.type}</div>
                    </div>
                `;
            })
            .join('');
    }
    
    loadFromHistory(text, type) {
        this.elements.textInput.value = text;
        this.elements.barcodeType.value = type;
        this.validateInput();
        this.generateBarcode();
    }
    
    clearHistory() {
        localStorage.removeItem('barcodeHistory');
        this.history = [];
        this.displayHistory();
    }
}

// �������
let barcodeGen;

// 
document.addEventListener('DOMContentLoaded', () => {
    barcodeGen = new BarcodeGenerator();
});