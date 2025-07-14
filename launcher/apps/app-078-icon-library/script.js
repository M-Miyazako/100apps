class IconLibrary {
    constructor() {
        this.icons = [];
        this.filteredIcons = [];
        this.selectedIcon = null;
        this.currentSize = 32;
        this.currentView = 'grid';
        
        this.initializeIcons();
        this.initializeEventListeners();
        this.loadIcons();
    }

    initializeIcons() {
        // Font Awesome アイコンのデータ
        this.icons = [
            // インターフェース
            { name: 'home', class: 'fas fa-home', category: 'interface', style: 'solid' },
            { name: 'user', class: 'fas fa-user', category: 'interface', style: 'solid' },
            { name: 'settings', class: 'fas fa-cog', category: 'interface', style: 'solid' },
            { name: 'search', class: 'fas fa-search', category: 'interface', style: 'solid' },
            { name: 'menu', class: 'fas fa-bars', category: 'interface', style: 'solid' },
            { name: 'close', class: 'fas fa-times', category: 'interface', style: 'solid' },
            { name: 'edit', class: 'fas fa-edit', category: 'interface', style: 'solid' },
            { name: 'trash', class: 'fas fa-trash', category: 'interface', style: 'solid' },
            { name: 'save', class: 'fas fa-save', category: 'interface', style: 'solid' },
            { name: 'plus', class: 'fas fa-plus', category: 'interface', style: 'solid' },
            { name: 'minus', class: 'fas fa-minus', category: 'interface', style: 'solid' },
            { name: 'check', class: 'fas fa-check', category: 'interface', style: 'solid' },
            { name: 'star', class: 'fas fa-star', category: 'interface', style: 'solid' },
            { name: 'heart', class: 'fas fa-heart', category: 'interface', style: 'solid' },
            { name: 'bookmark', class: 'fas fa-bookmark', category: 'interface', style: 'solid' },
            
            // コミュニケーション
            { name: 'envelope', class: 'fas fa-envelope', category: 'communication', style: 'solid' },
            { name: 'phone', class: 'fas fa-phone', category: 'communication', style: 'solid' },
            { name: 'comment', class: 'fas fa-comment', category: 'communication', style: 'solid' },
            { name: 'comments', class: 'fas fa-comments', category: 'communication', style: 'solid' },
            { name: 'bell', class: 'fas fa-bell', category: 'communication', style: 'solid' },
            { name: 'share', class: 'fas fa-share', category: 'communication', style: 'solid' },
            { name: 'paper-plane', class: 'fas fa-paper-plane', category: 'communication', style: 'solid' },
            
            // メディア
            { name: 'play', class: 'fas fa-play', category: 'media', style: 'solid' },
            { name: 'pause', class: 'fas fa-pause', category: 'media', style: 'solid' },
            { name: 'stop', class: 'fas fa-stop', category: 'media', style: 'solid' },
            { name: 'volume-up', class: 'fas fa-volume-up', category: 'media', style: 'solid' },
            { name: 'volume-mute', class: 'fas fa-volume-mute', category: 'media', style: 'solid' },
            { name: 'image', class: 'fas fa-image', category: 'media', style: 'solid' },
            { name: 'video', class: 'fas fa-video', category: 'media', style: 'solid' },
            { name: 'music', class: 'fas fa-music', category: 'media', style: 'solid' },
            { name: 'camera', class: 'fas fa-camera', category: 'media', style: 'solid' },
            { name: 'microphone', class: 'fas fa-microphone', category: 'media', style: 'solid' },
            
            // ビジネス
            { name: 'briefcase', class: 'fas fa-briefcase', category: 'business', style: 'solid' },
            { name: 'chart-bar', class: 'fas fa-chart-bar', category: 'business', style: 'solid' },
            { name: 'chart-line', class: 'fas fa-chart-line', category: 'business', style: 'solid' },
            { name: 'chart-pie', class: 'fas fa-chart-pie', category: 'business', style: 'solid' },
            { name: 'calculator', class: 'fas fa-calculator', category: 'business', style: 'solid' },
            { name: 'calendar', class: 'fas fa-calendar', category: 'business', style: 'solid' },
            { name: 'clock', class: 'fas fa-clock', category: 'business', style: 'solid' },
            { name: 'dollar-sign', class: 'fas fa-dollar-sign', category: 'business', style: 'solid' },
            { name: 'shopping-cart', class: 'fas fa-shopping-cart', category: 'business', style: 'solid' },
            { name: 'credit-card', class: 'fas fa-credit-card', category: 'business', style: 'solid' },
            
            // ソーシャル
            { name: 'facebook', class: 'fab fa-facebook', category: 'social', style: 'brands' },
            { name: 'twitter', class: 'fab fa-twitter', category: 'social', style: 'brands' },
            { name: 'instagram', class: 'fab fa-instagram', category: 'social', style: 'brands' },
            { name: 'linkedin', class: 'fab fa-linkedin', category: 'social', style: 'brands' },
            { name: 'youtube', class: 'fab fa-youtube', category: 'social', style: 'brands' },
            { name: 'github', class: 'fab fa-github', category: 'social', style: 'brands' },
            { name: 'google', class: 'fab fa-google', category: 'social', style: 'brands' },
            
            // ナビゲーション
            { name: 'arrow-up', class: 'fas fa-arrow-up', category: 'navigation', style: 'solid' },
            { name: 'arrow-down', class: 'fas fa-arrow-down', category: 'navigation', style: 'solid' },
            { name: 'arrow-left', class: 'fas fa-arrow-left', category: 'navigation', style: 'solid' },
            { name: 'arrow-right', class: 'fas fa-arrow-right', category: 'navigation', style: 'solid' },
            { name: 'chevron-up', class: 'fas fa-chevron-up', category: 'navigation', style: 'solid' },
            { name: 'chevron-down', class: 'fas fa-chevron-down', category: 'navigation', style: 'solid' },
            { name: 'chevron-left', class: 'fas fa-chevron-left', category: 'navigation', style: 'solid' },
            { name: 'chevron-right', class: 'fas fa-chevron-right', category: 'navigation', style: 'solid' },
            { name: 'map-marker', class: 'fas fa-map-marker-alt', category: 'navigation', style: 'solid' },
            { name: 'compass', class: 'fas fa-compass', category: 'navigation', style: 'solid' },
            
            // 天気
            { name: 'sun', class: 'fas fa-sun', category: 'weather', style: 'solid' },
            { name: 'moon', class: 'fas fa-moon', category: 'weather', style: 'solid' },
            { name: 'cloud', class: 'fas fa-cloud', category: 'weather', style: 'solid' },
            { name: 'cloud-rain', class: 'fas fa-cloud-rain', category: 'weather', style: 'solid' },
            { name: 'bolt', class: 'fas fa-bolt', category: 'weather', style: 'solid' },
            { name: 'snowflake', class: 'fas fa-snowflake', category: 'weather', style: 'solid' },
            { name: 'temperature-high', class: 'fas fa-temperature-high', category: 'weather', style: 'solid' },
            { name: 'temperature-low', class: 'fas fa-temperature-low', category: 'weather', style: 'solid' },
            
            // テクノロジー
            { name: 'laptop', class: 'fas fa-laptop', category: 'technology', style: 'solid' },
            { name: 'mobile', class: 'fas fa-mobile-alt', category: 'technology', style: 'solid' },
            { name: 'desktop', class: 'fas fa-desktop', category: 'technology', style: 'solid' },
            { name: 'tablet', class: 'fas fa-tablet-alt', category: 'technology', style: 'solid' },
            { name: 'wifi', class: 'fas fa-wifi', category: 'technology', style: 'solid' },
            { name: 'bluetooth', class: 'fab fa-bluetooth', category: 'technology', style: 'brands' },
            { name: 'database', class: 'fas fa-database', category: 'technology', style: 'solid' },
            { name: 'server', class: 'fas fa-server', category: 'technology', style: 'solid' },
            { name: 'code', class: 'fas fa-code', category: 'technology', style: 'solid' },
            { name: 'bug', class: 'fas fa-bug', category: 'technology', style: 'solid' },
            
            // アウトラインスタイルの追加
            { name: 'user-outline', class: 'far fa-user', category: 'interface', style: 'outline' },
            { name: 'heart-outline', class: 'far fa-heart', category: 'interface', style: 'outline' },
            { name: 'star-outline', class: 'far fa-star', category: 'interface', style: 'outline' },
            { name: 'bookmark-outline', class: 'far fa-bookmark', category: 'interface', style: 'outline' },
            { name: 'envelope-outline', class: 'far fa-envelope', category: 'communication', style: 'outline' },
            { name: 'comment-outline', class: 'far fa-comment', category: 'communication', style: 'outline' },
            { name: 'bell-outline', class: 'far fa-bell', category: 'communication', style: 'outline' },
            { name: 'image-outline', class: 'far fa-image', category: 'media', style: 'outline' },
            { name: 'play-circle-outline', class: 'far fa-play-circle', category: 'media', style: 'outline' },
            { name: 'clock-outline', class: 'far fa-clock', category: 'business', style: 'outline' },
            { name: 'calendar-outline', class: 'far fa-calendar', category: 'business', style: 'outline' },
            { name: 'file-outline', class: 'far fa-file', category: 'business', style: 'outline' }
        ];
        
        this.filteredIcons = [...this.icons];
    }

    initializeEventListeners() {
        // 検索
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterIcons();
        });

        // フィルター
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterIcons();
        });

        document.getElementById('styleFilter').addEventListener('change', () => {
            this.filterIcons();
        });

        // サイズ調整
        const sizeSlider = document.getElementById('sizeSlider');
        const sizeValue = document.getElementById('sizeValue');
        
        sizeSlider.addEventListener('input', (e) => {
            this.currentSize = e.target.value;
            sizeValue.textContent = `${this.currentSize}px`;
            this.updateIconSizes();
        });

        // ビューモード
        document.getElementById('gridView').addEventListener('click', () => {
            this.setViewMode('grid');
        });

        document.getElementById('listView').addEventListener('click', () => {
            this.setViewMode('list');
        });

        // プレビューパネル
        document.getElementById('closePreview').addEventListener('click', () => {
            this.closePreview();
        });

        // プレビューカスタマイズ
        this.initializePreviewControls();

        // エクスポート
        this.initializeExportButtons();

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePreview();
            }
        });
    }

    initializePreviewControls() {
        const previewSize = document.getElementById('previewSize');
        const previewSizeValue = document.getElementById('previewSizeValue');
        const previewColor = document.getElementById('previewColor');
        const previewRotation = document.getElementById('previewRotation');
        const previewRotationValue = document.getElementById('previewRotationValue');

        previewSize.addEventListener('input', (e) => {
            const size = e.target.value;
            previewSizeValue.textContent = `${size}px`;
            this.updatePreviewIcon();
        });

        previewColor.addEventListener('input', () => {
            this.updatePreviewIcon();
        });

        previewRotation.addEventListener('input', (e) => {
            const rotation = e.target.value;
            previewRotationValue.textContent = `${rotation}°`;
            this.updatePreviewIcon();
        });
    }

    initializeExportButtons() {
        document.getElementById('copyHTML').addEventListener('click', () => {
            this.exportHTML();
        });

        document.getElementById('copyCSS').addEventListener('click', () => {
            this.exportCSS();
        });

        document.getElementById('downloadSVG').addEventListener('click', () => {
            this.downloadSVG();
        });

        document.getElementById('downloadPNG').addEventListener('click', () => {
            this.downloadPNG();
        });
    }

    loadIcons() {
        const iconGrid = document.getElementById('iconGrid');
        iconGrid.innerHTML = '';

        this.filteredIcons.forEach(icon => {
            const iconElement = this.createIconElement(icon);
            iconGrid.appendChild(iconElement);
        });

        this.updateStats();
        document.getElementById('loadingIndicator').style.display = 'none';
    }

    createIconElement(icon) {
        const iconItem = document.createElement('div');
        iconItem.className = `icon-item ${this.currentView === 'list' ? 'list-view' : ''}`;
        
        iconItem.innerHTML = `
            <i class="${icon.class}" style="font-size: ${this.currentSize}px;"></i>
            <div class="icon-name">${icon.name}</div>
            <div class="icon-category">${icon.category}</div>
        `;

        iconItem.addEventListener('click', () => {
            this.selectIcon(icon, iconItem);
        });

        return iconItem;
    }

    selectIcon(icon, element) {
        // 前の選択を解除
        document.querySelectorAll('.icon-item.selected').forEach(item => {
            item.classList.remove('selected');
        });

        // 新しい選択
        element.classList.add('selected');
        this.selectedIcon = icon;
        this.showPreview(icon);
        this.updateStats();
    }

    showPreview(icon) {
        const previewPanel = document.getElementById('previewPanel');
        const previewIconElement = document.getElementById('previewIconElement');
        const previewName = document.getElementById('previewName');
        const previewCategory = document.getElementById('previewCategory');

        previewIconElement.className = icon.class;
        previewName.textContent = icon.name;
        previewCategory.textContent = `${icon.category} / ${icon.style}`;

        // プレビューパネルを表示
        previewPanel.classList.add('open');
        
        // プレビューアイコンを更新
        this.updatePreviewIcon();
    }

    updatePreviewIcon() {
        const previewIconElement = document.getElementById('previewIconElement');
        const size = document.getElementById('previewSize').value;
        const color = document.getElementById('previewColor').value;
        const rotation = document.getElementById('previewRotation').value;

        previewIconElement.style.fontSize = `${size}px`;
        previewIconElement.style.color = color;
        previewIconElement.style.transform = `rotate(${rotation}deg)`;
    }

    closePreview() {
        document.getElementById('previewPanel').classList.remove('open');
        document.querySelectorAll('.icon-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        this.selectedIcon = null;
        this.updateStats();
    }

    filterIcons() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const styleFilter = document.getElementById('styleFilter').value;

        this.filteredIcons = this.icons.filter(icon => {
            const matchesSearch = icon.name.toLowerCase().includes(searchTerm) ||
                                icon.category.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || icon.category === categoryFilter;
            const matchesStyle = !styleFilter || icon.style === styleFilter;

            return matchesSearch && matchesCategory && matchesStyle;
        });

        this.loadIcons();
    }

    setViewMode(mode) {
        this.currentView = mode;
        
        // ボタンの状態更新
        document.getElementById('gridView').classList.toggle('active', mode === 'grid');
        document.getElementById('listView').classList.toggle('active', mode === 'list');
        
        // グリッドの表示更新
        const iconGrid = document.getElementById('iconGrid');
        iconGrid.classList.toggle('list-view', mode === 'list');
        
        this.loadIcons();
    }

    updateIconSizes() {
        document.querySelectorAll('.icon-item i').forEach(icon => {
            icon.style.fontSize = `${this.currentSize}px`;
        });
    }

    updateStats() {
        document.getElementById('totalIcons').textContent = this.icons.length;
        document.getElementById('visibleIcons').textContent = this.filteredIcons.length;
        document.getElementById('selectedIcon').textContent = 
            this.selectedIcon ? this.selectedIcon.name : 'なし';
    }

    // エクスポート機能
    exportHTML() {
        if (!this.selectedIcon) return;
        
        const size = document.getElementById('previewSize').value;
        const color = document.getElementById('previewColor').value;
        const rotation = document.getElementById('previewRotation').value;
        
        const html = `<i class="${this.selectedIcon.class}" style="font-size: ${size}px; color: ${color}; transform: rotate(${rotation}deg);"></i>`;
        
        this.copyToClipboard(html, 'HTMLコードをコピーしました');
    }

    exportCSS() {
        if (!this.selectedIcon) return;
        
        const size = document.getElementById('previewSize').value;
        const color = document.getElementById('previewColor').value;
        const rotation = document.getElementById('previewRotation').value;
        
        const css = `.icon-${this.selectedIcon.name} {
    font-family: "Font Awesome 5 Free";
    font-size: ${size}px;
    color: ${color};
    transform: rotate(${rotation}deg);
}`;
        
        this.copyToClipboard(css, 'CSSコードをコピーしました');
    }

    downloadSVG() {
        if (!this.selectedIcon) return;
        
        const size = document.getElementById('previewSize').value;
        const color = document.getElementById('previewColor').value;
        const rotation = document.getElementById('previewRotation').value;
        
        // 簡単なSVG生成（実際の実装では適切なSVGパスが必要）
        const svg = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <text x="12" y="16" text-anchor="middle" font-family="Font Awesome 5 Free" font-size="16" fill="${color}" transform="rotate(${rotation} 12 12)">&#xf015;</text>
</svg>`;
        
        this.downloadFile(svg, `${this.selectedIcon.name}.svg`, 'image/svg+xml');
        this.showFeedback('SVGファイルをダウンロードしました');
    }

    downloadPNG() {
        if (!this.selectedIcon) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = parseInt(document.getElementById('previewSize').value);
        const color = document.getElementById('previewColor').value;
        
        canvas.width = size;
        canvas.height = size;
        
        // フォントとアイコンの描画（簡略化版）
        ctx.font = `${size}px "Font Awesome 5 Free"`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', size/2, size/2); // プレースホルダー
        
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.selectedIcon.name}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
        
        this.showFeedback('PNGファイルをダウンロードしました');
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
        const feedback = document.getElementById('copyFeedback');
        feedback.querySelector('span').textContent = message;
        feedback.classList.add('show');
        
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 2000);
    }
}

// アプリの初期化
document.addEventListener('DOMContentLoaded', () => {
    new IconLibrary();
});