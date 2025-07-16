class StyleGuide {
    constructor() {
        this.currentSection = 'colors';
        this.styleData = {
            colors: [
                { name: 'プライマリーブルー', hex: '#007bff', rgb: 'RGB(0, 123, 255)' },
                { name: 'サクセスグリーン', hex: '#28a745', rgb: 'RGB(40, 167, 69)' },
                { name: 'デンジャーレッド', hex: '#dc3545', rgb: 'RGB(220, 53, 69)' },
                { name: 'ワーニングイエロー', hex: '#ffc107', rgb: 'RGB(255, 193, 7)' }
            ],
            typography: [
                { name: 'H1', size: '2rem', weight: 'bold' },
                { name: 'H2', size: '1.5rem', weight: 'bold' },
                { name: 'H3', size: '1.25rem', weight: 'bold' },
                { name: 'Body', size: '1rem', weight: 'normal' }
            ]
        };
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // セクション切り替え
        document.querySelectorAll('.menu-item').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });
        
        // カラー追加ボタン
        const addColorBtn = document.querySelector('.add-color-btn');
        if (addColorBtn) {
            addColorBtn.addEventListener('click', () => {
                this.addColor();
            });
        }
        
        // エクスポートボタン
        document.getElementById('exportCss').addEventListener('click', () => {
            this.exportCss();
        });
        
        document.getElementById('exportJson').addEventListener('click', () => {
            this.exportJson();
        });
        
        document.getElementById('exportPdf').addEventListener('click', () => {
            this.exportPdf();
        });
    }
    
    switchSection(sectionName) {
        // メニューアイテムのアクティブ状態を更新
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        // セクションの表示を更新
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');
        
        this.currentSection = sectionName;
    }
    
    addColor() {
        const colorName = prompt('カラー名を入力してください:');
        if (!colorName) return;
        
        const colorHex = prompt('カラーコード（HEX）を入力してください:', '#000000');
        if (!colorHex) return;
        
        // HEXをRGBに変換
        const rgb = this.hexToRgb(colorHex);
        const rgbString = `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        
        // データに追加
        this.styleData.colors.push({
            name: colorName,
            hex: colorHex,
            rgb: rgbString
        });
        
        // UIを更新
        this.updateColorGrid();
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    updateColorGrid() {
        const colorGrid = document.querySelector('.color-grid');
        colorGrid.innerHTML = '';
        
        this.styleData.colors.forEach(color => {
            const colorCard = document.createElement('div');
            colorCard.className = 'color-card';
            colorCard.innerHTML = `
                <div class="color-swatch" style="background-color: ${color.hex};"></div>
                <div class="color-info">
                    <h4>${color.name}</h4>
                    <p>${color.hex}</p>
                    <p>${color.rgb}</p>
                </div>
            `;
            colorGrid.appendChild(colorCard);
        });
    }
    
    exportCss() {
        let css = `/* Generated Style Guide CSS */\n\n`;
        
        // カラー変数
        css += `:root {\n`;
        this.styleData.colors.forEach(color => {
            const varName = color.name.toLowerCase().replace(/\s+/g, '-');
            css += `  --${varName}: ${color.hex};\n`;
        });
        css += `}\n\n`;
        
        // タイポグラフィ
        css += `/* Typography */\n`;
        this.styleData.typography.forEach(type => {
            css += `${type.name.toLowerCase()} {\n`;
            css += `  font-size: ${type.size};\n`;
            css += `  font-weight: ${type.weight};\n`;
            css += `}\n\n`;
        });
        
        // ボタンスタイル
        css += `/* Button Styles */\n`;
        css += `.btn {\n`;
        css += `  padding: 0.375rem 0.75rem;\n`;
        css += `  border-radius: 0.25rem;\n`;
        css += `  border: 1px solid transparent;\n`;
        css += `  cursor: pointer;\n`;
        css += `  transition: all 0.15s ease-in-out;\n`;
        css += `}\n\n`;
        
        css += `.btn-primary {\n`;
        css += `  background-color: var(--primary-blue, #007bff);\n`;
        css += `  color: white;\n`;
        css += `}\n\n`;
        
        this.downloadFile('style-guide.css', css, 'text/css');
    }
    
    exportJson() {
        const jsonData = {
            metadata: {
                name: 'Style Guide',
                version: '1.0.0',
                generated: new Date().toISOString()
            },
            colors: this.styleData.colors,
            typography: this.styleData.typography
        };
        
        const jsonString = JSON.stringify(jsonData, null, 2);
        this.downloadFile('style-guide.json', jsonString, 'application/json');
    }
    
    exportPdf() {
        // PDF生成の代替として、印刷ダイアログを開く
        window.print();
    }
    
    downloadFile(filename, content, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new StyleGuide();
    console.log('Style Guide app initialized');
});