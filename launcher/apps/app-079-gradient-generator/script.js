class GradientGenerator {
    constructor() {
        this.gradientType = 'linear';
        this.angle = 45;
        this.radialShape = 'circle';
        this.radialPosition = 'center';
        this.colorStops = [
            { color: '#ff6b6b', position: 0 },
            { color: '#4ecdc4', position: 100 }
        ];
        this.presets = this.loadPresets();
        
        this.initializeEventListeners();
        this.loadPresetGradients();
        this.renderColorStops();
        this.updateGradient();
        this.updateLivePreview();
    }

    initializeEventListeners() {
        // グラデーションタイプ
        document.querySelectorAll('input[name="gradientType"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.gradientType = e.target.value;
                this.toggleDirectionControls();
                this.updateGradient();
            });
        });

        // 角度調整
        const angleSlider = document.getElementById('angleSlider');
        const angleValue = document.getElementById('angleValue');
        angleSlider.addEventListener('input', (e) => {
            this.angle = parseInt(e.target.value);
            angleValue.textContent = `${this.angle}°`;
            this.updateGradient();
        });

        // プリセット方向
        document.querySelectorAll('.preset-directions button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const angle = parseInt(e.target.dataset.angle);
                this.angle = angle;
                angleSlider.value = angle;
                angleValue.textContent = `${angle}°`;
                this.updateGradient();
            });
        });

        // 放射状グラデーション設定
        document.getElementById('radialShape').addEventListener('change', (e) => {
            this.radialShape = e.target.value;
            this.updateGradient();
        });

        document.getElementById('radialPosition').addEventListener('change', (e) => {
            this.radialPosition = e.target.value;
            this.updateGradient();
        });

        // カラーストップ操作
        document.getElementById('addColorStop').addEventListener('click', () => {
            this.addColorStop();
        });

        document.getElementById('sortColors').addEventListener('click', () => {
            this.sortColorStops();
        });

        // クイックアクション
        document.getElementById('randomGradient').addEventListener('click', () => {
            this.generateRandomGradient();
        });

        document.getElementById('copyCSS').addEventListener('click', () => {
            this.copyGradientCSS();
        });

        document.getElementById('downloadImage').addEventListener('click', () => {
            this.downloadGradientImage();
        });

        // プリセット関連
        document.getElementById('savePreset').addEventListener('click', () => {
            this.showSaveModal();
        });

        document.getElementById('confirmSave').addEventListener('click', () => {
            this.savePreset();
        });

        document.getElementById('cancelSave').addEventListener('click', () => {
            this.hideSaveModal();
        });

        // エクスポート
        document.getElementById('imageSize').addEventListener('change', (e) => {
            const customSize = document.getElementById('customSize');
            customSize.style.display = e.target.value === 'custom' ? 'flex' : 'none';
        });

        document.getElementById('exportCode').addEventListener('click', () => {
            this.showGeneratedCode();
        });

        document.getElementById('exportFile').addEventListener('click', () => {
            this.exportFile();
        });

        document.getElementById('closeCode').addEventListener('click', () => {
            this.hideGeneratedCode();
        });

        document.getElementById('copyGeneratedCode').addEventListener('click', () => {
            this.copyGeneratedCode();
        });

        // ライブプレビュー
        document.getElementById('togglePreview').addEventListener('click', () => {
            this.toggleLivePreview();
        });

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'c':
                        if (e.target.tagName !== 'INPUT') {
                            e.preventDefault();
                            this.copyGradientCSS();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        this.downloadGradientImage();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.generateRandomGradient();
                        break;
                }
            }
        });
    }

    toggleDirectionControls() {
        const linearControls = document.getElementById('linearControls');
        const radialControls = document.getElementById('radialControls');
        
        linearControls.style.display = this.gradientType === 'linear' ? 'block' : 'none';
        radialControls.style.display = this.gradientType === 'radial' ? 'block' : 'none';
    }

    renderColorStops() {
        const container = document.getElementById('colorStops');
        container.innerHTML = '';

        this.colorStops.forEach((stop, index) => {
            const stopElement = this.createColorStopElement(stop, index);
            container.appendChild(stopElement);
        });
    }

    createColorStopElement(stop, index) {
        const stopDiv = document.createElement('div');
        stopDiv.className = 'color-stop';
        stopDiv.innerHTML = `
            <input type="color" value="${stop.color}" data-index="${index}">
            <input type="range" min="0" max="100" value="${stop.position}" data-index="${index}" class="position-slider">
            <span class="position-value">${stop.position}%</span>
            ${this.colorStops.length > 2 ? `<button class="remove-btn" data-index="${index}"><i class="fas fa-times"></i></button>` : ''}
        `;

        // イベントリスナー
        const colorInput = stopDiv.querySelector('input[type="color"]');
        const positionInput = stopDiv.querySelector('input[type="range"]');
        const positionValue = stopDiv.querySelector('.position-value');
        const removeBtn = stopDiv.querySelector('.remove-btn');

        colorInput.addEventListener('input', (e) => {
            this.colorStops[index].color = e.target.value;
            this.updateGradient();
        });

        positionInput.addEventListener('input', (e) => {
            this.colorStops[index].position = parseInt(e.target.value);
            positionValue.textContent = `${e.target.value}%`;
            this.updateGradient();
        });

        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.removeColorStop(index);
            });
        }

        return stopDiv;
    }

    addColorStop() {
        const lastStop = this.colorStops[this.colorStops.length - 1];
        const newPosition = Math.min(lastStop.position + 20, 100);
        const newColor = this.generateRandomColor();
        
        this.colorStops.push({
            color: newColor,
            position: newPosition
        });

        this.renderColorStops();
        this.updateGradient();
    }

    removeColorStop(index) {
        if (this.colorStops.length > 2) {
            this.colorStops.splice(index, 1);
            this.renderColorStops();
            this.updateGradient();
        }
    }

    sortColorStops() {
        this.colorStops.sort((a, b) => a.position - b.position);
        this.renderColorStops();
        this.updateGradient();
    }

    updateGradient() {
        const gradientCSS = this.generateGradientCSS();
        const previewElement = document.getElementById('gradientPreview');
        const codeElement = document.getElementById('gradientCode');
        
        previewElement.style.background = gradientCSS;
        codeElement.textContent = gradientCSS;
        
        this.updateLivePreview();
    }

    generateGradientCSS() {
        const sortedStops = [...this.colorStops].sort((a, b) => a.position - b.position);
        const colorStopsString = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');

        switch (this.gradientType) {
            case 'linear':
                return `linear-gradient(${this.angle}deg, ${colorStopsString})`;
            case 'radial':
                return `radial-gradient(${this.radialShape} at ${this.radialPosition}, ${colorStopsString})`;
            case 'conic':
                return `conic-gradient(from ${this.angle}deg, ${colorStopsString})`;
            default:
                return `linear-gradient(${this.angle}deg, ${colorStopsString})`;
        }
    }

    generateRandomGradient() {
        // ランダムなタイプ
        const types = ['linear', 'radial', 'conic'];
        this.gradientType = types[Math.floor(Math.random() * types.length)];
        
        // ランダムな角度
        this.angle = Math.floor(Math.random() * 360);
        
        // ランダムなカラーストップ
        const stopCount = Math.floor(Math.random() * 3) + 2; // 2-4個
        this.colorStops = [];
        
        for (let i = 0; i < stopCount; i++) {
            this.colorStops.push({
                color: this.generateRandomColor(),
                position: Math.floor((100 / (stopCount - 1)) * i)
            });
        }

        // UI更新
        document.querySelector(`input[value="${this.gradientType}"]`).checked = true;
        document.getElementById('angleSlider').value = this.angle;
        document.getElementById('angleValue').textContent = `${this.angle}°`;
        
        this.toggleDirectionControls();
        this.renderColorStops();
        this.updateGradient();
        
        this.showFeedback('ランダムグラデーションを生成しました');
    }

    generateRandomColor() {
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
            '#fd79a8', '#6c5ce7', '#a29bfe', '#fd79a8', '#e17055',
            '#00b894', '#0984e3', '#e84393', '#9b59b6', '#e67e22',
            '#1abc9c', '#3498db', '#e74c3c', '#f39c12', '#2ecc71'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    loadPresetGradients() {
        const defaultPresets = [
            {
                name: 'Sunset',
                type: 'linear',
                angle: 45,
                stops: [
                    { color: '#ff6b6b', position: 0 },
                    { color: '#ffa500', position: 50 },
                    { color: '#ffed4a', position: 100 }
                ]
            },
            {
                name: 'Ocean',
                type: 'linear',
                angle: 135,
                stops: [
                    { color: '#667eea', position: 0 },
                    { color: '#764ba2', position: 100 }
                ]
            },
            {
                name: 'Forest',
                type: 'linear',
                angle: 90,
                stops: [
                    { color: '#134e5e', position: 0 },
                    { color: '#71b280', position: 100 }
                ]
            },
            {
                name: 'Purple',
                type: 'radial',
                angle: 0,
                stops: [
                    { color: '#667eea', position: 0 },
                    { color: '#764ba2', position: 100 }
                ]
            },
            {
                name: 'Fire',
                type: 'linear',
                angle: 45,
                stops: [
                    { color: '#ff9a56', position: 0 },
                    { color: '#ff6b6b', position: 50 },
                    { color: '#ee5a24', position: 100 }
                ]
            },
            {
                name: 'Cool',
                type: 'linear',
                angle: 180,
                stops: [
                    { color: '#74b9ff', position: 0 },
                    { color: '#0984e3', position: 100 }
                ]
            }
        ];

        // カスタムプリセットと合併
        this.presets = [...defaultPresets, ...this.presets];
        this.renderPresets();
    }

    renderPresets() {
        const container = document.getElementById('presetsGrid');
        container.innerHTML = '';

        this.presets.forEach((preset, index) => {
            const presetElement = this.createPresetElement(preset, index);
            container.appendChild(presetElement);
        });
    }

    createPresetElement(preset, index) {
        const presetDiv = document.createElement('div');
        presetDiv.className = 'preset-item';
        
        // グラデーションを生成
        const tempColorStops = preset.stops;
        const colorStopsString = tempColorStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
        let gradientCSS;
        
        switch (preset.type) {
            case 'radial':
                gradientCSS = `radial-gradient(circle, ${colorStopsString})`;
                break;
            case 'conic':
                gradientCSS = `conic-gradient(${colorStopsString})`;
                break;
            default:
                gradientCSS = `linear-gradient(${preset.angle}deg, ${colorStopsString})`;
        }
        
        presetDiv.style.background = gradientCSS;
        presetDiv.innerHTML = `<div class="preset-name">${preset.name}</div>`;
        
        presetDiv.addEventListener('click', () => {
            this.applyPreset(preset);
        });

        return presetDiv;
    }

    applyPreset(preset) {
        this.gradientType = preset.type;
        this.angle = preset.angle;
        this.colorStops = [...preset.stops];

        // UI更新
        document.querySelector(`input[value="${this.gradientType}"]`).checked = true;
        document.getElementById('angleSlider').value = this.angle;
        document.getElementById('angleValue').textContent = `${this.angle}°`;

        this.toggleDirectionControls();
        this.renderColorStops();
        this.updateGradient();
        
        this.showFeedback(`プリセット "${preset.name}" を適用しました`);
    }

    showSaveModal() {
        document.getElementById('saveModal').classList.add('show');
        document.getElementById('presetName').focus();
    }

    hideSaveModal() {
        document.getElementById('saveModal').classList.remove('show');
        document.getElementById('presetName').value = '';
    }

    savePreset() {
        const name = document.getElementById('presetName').value.trim();
        if (!name) {
            this.showFeedback('プリセット名を入力してください');
            return;
        }

        const preset = {
            name: name,
            type: this.gradientType,
            angle: this.angle,
            stops: [...this.colorStops]
        };

        this.presets.push(preset);
        this.savePresets();
        this.renderPresets();
        this.hideSaveModal();
        
        this.showFeedback(`プリセット "${name}" を保存しました`);
    }

    loadPresets() {
        try {
            return JSON.parse(localStorage.getItem('gradientPresets') || '[]');
        } catch {
            return [];
        }
    }

    savePresets() {
        const customPresets = this.presets.filter((_, index) => index >= 6); // デフォルト以外
        localStorage.setItem('gradientPresets', JSON.stringify(customPresets));
    }

    updateLivePreview() {
        const gradientCSS = this.generateGradientCSS();
        document.querySelectorAll('.gradient-bg').forEach(element => {
            element.style.background = gradientCSS;
        });
    }

    toggleLivePreview() {
        const preview = document.getElementById('livePreview');
        preview.classList.toggle('open');
    }

    showGeneratedCode() {
        const format = document.querySelector('input[name="exportFormat"]:checked').value;
        const code = this.generateCode(format);
        
        document.getElementById('generatedCode').textContent = code;
        document.getElementById('codeSection').style.display = 'block';
        document.getElementById('codeSection').scrollIntoView({ behavior: 'smooth' });
    }

    hideGeneratedCode() {
        document.getElementById('codeSection').style.display = 'none';
    }

    generateCode(format) {
        const gradientCSS = this.generateGradientCSS();
        
        switch (format) {
            case 'css':
                return `.gradient {
    background: ${gradientCSS};
}`;
            case 'scss':
                return `$gradient: ${gradientCSS};

.gradient {
    background: $gradient;
}`;
            case 'svg':
                return this.generateSVG();
            case 'png':
                return '// PNG export is handled by download function';
            default:
                return gradientCSS;
        }
    }

    generateSVG() {
        const sortedStops = [...this.colorStops].sort((a, b) => a.position - b.position);
        const stops = sortedStops.map((stop, index) => 
            `<stop offset="${stop.position}%" stop-color="${stop.color}" />`
        ).join('\n        ');

        if (this.gradientType === 'linear') {
            const radians = (this.angle * Math.PI) / 180;
            const x1 = Math.cos(radians + Math.PI) * 0.5 + 0.5;
            const y1 = Math.sin(radians + Math.PI) * 0.5 + 0.5;
            const x2 = Math.cos(radians) * 0.5 + 0.5;
            const y2 = Math.sin(radians) * 0.5 + 0.5;

            return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="gradient" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
            ${stops}
        </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#gradient)" />
</svg>`;
        } else if (this.gradientType === 'radial') {
            return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <radialGradient id="gradient" cx="50%" cy="50%" r="50%">
            ${stops}
        </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#gradient)" />
</svg>`;
        }
        
        return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${this.colorStops[0].color}" />
</svg>`;
    }

    copyGeneratedCode() {
        const code = document.getElementById('generatedCode').textContent;
        this.copyToClipboard(code, 'コードをコピーしました');
    }

    copyGradientCSS() {
        const gradientCSS = this.generateGradientCSS();
        this.copyToClipboard(gradientCSS, 'CSSをコピーしました');
    }

    exportFile() {
        const format = document.querySelector('input[name="exportFormat"]:checked').value;
        
        if (format === 'png') {
            this.downloadGradientImage();
        } else {
            const code = this.generateCode(format);
            const filename = `gradient.${format}`;
            const mimeType = format === 'svg' ? 'image/svg+xml' : 'text/plain';
            
            this.downloadFile(code, filename, mimeType);
            this.showFeedback(`${format.toUpperCase()}ファイルをダウンロードしました`);
        }
    }

    downloadGradientImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // サイズを取得
        const sizeSelect = document.getElementById('imageSize');
        let width, height;
        
        if (sizeSelect.value === 'custom') {
            width = parseInt(document.getElementById('customWidth').value) || 800;
            height = parseInt(document.getElementById('customHeight').value) || 600;
        } else {
            [width, height] = sizeSelect.value.split('x').map(s => parseInt(s));
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // グラデーションを描画
        let gradient;
        const sortedStops = [...this.colorStops].sort((a, b) => a.position - b.position);
        
        if (this.gradientType === 'linear') {
            const radians = (this.angle * Math.PI) / 180;
            const x1 = Math.cos(radians + Math.PI) * width * 0.5 + width * 0.5;
            const y1 = Math.sin(radians + Math.PI) * height * 0.5 + height * 0.5;
            const x2 = Math.cos(radians) * width * 0.5 + width * 0.5;
            const y2 = Math.sin(radians) * height * 0.5 + height * 0.5;
            
            gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        } else {
            gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.min(width, height)/2);
        }
        
        sortedStops.forEach(stop => {
            gradient.addColorStop(stop.position / 100, stop.color);
        });
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // ダウンロード
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gradient.png';
            a.click();
            URL.revokeObjectURL(url);
        });
        
        this.showFeedback('画像をダウンロードしました');
    }

    copyToClipboard(text, message) {
        navigator.clipboard.writeText(text).then(() => {
            this.showFeedback(message);
        }).catch(() => {
            this.showFeedback('コピーに失敗しました');
        });
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    showFeedback(message) {
        const feedback = document.getElementById('feedback');
        feedback.querySelector('span').textContent = message;
        feedback.classList.add('show');
        
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 3000);
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new GradientGenerator();
});