class FontManager {
    constructor() {
        this.uploadedFonts = new Map();
        this.systemFonts = [
            'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New', 
            'Verdana', 'Tahoma', 'Comic Sans MS', 'Impact', 'Trebuchet MS',
            'Palatino', 'Garamond', 'Bookman', 'Avant Garde', 'Calibri',
            'Cambria', 'Candara', 'Consolas', 'Corbel', 'Franklin Gothic Medium',
            'Lucida Console', 'Lucida Sans Unicode', 'MS Gothic', 'MS Mincho',
            'Yu Gothic', 'Meiryo', 'Noto Sans CJK JP', 'Hiragino Sans'
        ];
        this.initializeEventListeners();
        this.loadSystemFonts();
    }
    
    initializeEventListeners() {
        const uploadBtn = document.getElementById('uploadBtn');
        const fontUpload = document.getElementById('fontUpload');
        const fontSelect = document.getElementById('fontSelect');
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const previewText = document.getElementById('previewText');
        
        uploadBtn.addEventListener('click', () => this.handleFontUpload());
        fontUpload.addEventListener('change', (e) => this.previewUploadedFonts(e));
        fontSelect.addEventListener('change', () => this.updatePreview());
        fontSizeSlider.addEventListener('input', (e) => this.updateFontSize(e));
        previewText.addEventListener('input', () => this.updatePreview());
    }
    
    loadSystemFonts() {
        const fontSelect = document.getElementById('fontSelect');
        const fontListContainer = document.getElementById('fontListContainer');
        
        this.systemFonts.forEach(font => {
            // フォント選択に追加
            const option = document.createElement('option');
            option.value = font;
            option.textContent = font;
            fontSelect.appendChild(option);
            
            // フォントリストに追加
            this.addFontToList(font, 'system');
        });
    }
    
    addFontToList(fontName, type) {
        const fontListContainer = document.getElementById('fontListContainer');
        const fontItem = document.createElement('div');
        fontItem.className = 'font-item';
        
        fontItem.innerHTML = `
            <div class="font-info">
                <span class="font-name" style="font-family: '${fontName}', sans-serif">${fontName}</span>
                <span class="font-type">${type === 'system' ? 'システム' : 'アップロード'}</span>
            </div>
            <div class="font-actions">
                <button onclick="fontManager.previewFont('${fontName}')">プレビュー</button>
                ${type === 'uploaded' ? `<button onclick="fontManager.removeFont('${fontName}')">削除</button>` : ''}
            </div>
        `;
        
        fontListContainer.appendChild(fontItem);
    }
    
    previewUploadedFonts(event) {
        const files = event.target.files;
        Array.from(files).forEach(file => {
            if (file.type.includes('font') || file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const fontName = file.name.replace(/\.[^/.]+$/, "");
                    this.loadCustomFont(fontName, e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    loadCustomFont(fontName, fontData) {
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: '${fontName}';
                src: url('${fontData}');
            }
        `;
        document.head.appendChild(style);
        
        this.uploadedFonts.set(fontName, fontData);
        
        // フォント選択に追加
        const fontSelect = document.getElementById('fontSelect');
        const option = document.createElement('option');
        option.value = fontName;
        option.textContent = fontName;
        fontSelect.appendChild(option);
        
        // フォントリストに追加
        this.addFontToList(fontName, 'uploaded');
    }
    
    handleFontUpload() {
        const fontUpload = document.getElementById('fontUpload');
        if (fontUpload.files.length === 0) {
            alert('フォントファイルを選択してください。');
            return;
        }
        
        alert(`${fontUpload.files.length}個のフォントファイルをアップロードしました。`);
    }
    
    previewFont(fontName) {
        const fontSelect = document.getElementById('fontSelect');
        fontSelect.value = fontName;
        this.updatePreview();
    }
    
    removeFont(fontName) {
        if (this.uploadedFonts.has(fontName)) {
            this.uploadedFonts.delete(fontName);
            
            // フォント選択から削除
            const fontSelect = document.getElementById('fontSelect');
            const option = fontSelect.querySelector(`option[value="${fontName}"]`);
            if (option) option.remove();
            
            // フォントリストから削除
            const fontItems = document.querySelectorAll('.font-item');
            fontItems.forEach(item => {
                if (item.querySelector('.font-name').textContent === fontName) {
                    item.remove();
                }
            });
            
            alert(`${fontName}を削除しました。`);
        }
    }
    
    updateFontSize(event) {
        const size = event.target.value;
        document.getElementById('fontSizeDisplay').textContent = size + 'px';
        this.updatePreview();
    }
    
    updatePreview() {
        const fontSelect = document.getElementById('fontSelect');
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        const previewText = document.getElementById('previewText');
        const previewDisplay = document.getElementById('previewDisplay');
        
        const selectedFont = fontSelect.value;
        const fontSize = fontSizeSlider.value;
        const text = previewText.value;
        
        if (selectedFont && text) {
            previewDisplay.style.fontFamily = `'${selectedFont}', sans-serif`;
            previewDisplay.style.fontSize = fontSize + 'px';
            previewDisplay.textContent = text;
            previewDisplay.style.display = 'block';
        } else {
            previewDisplay.style.display = 'none';
        }
    }
}

let fontManager;

document.addEventListener('DOMContentLoaded', () => {
    fontManager = new FontManager();
});