// カラーパレットアプリの機能

let palettes = [];
let currentColors = [];
let favoriteColors = [];
let recentColors = [];
let currentColor = '#667eea';
let selectedPaletteId = null;
let paletteIdCounter = 1;

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    initializeEventListeners();
    updateCurrentColor(currentColor);
    updateStats();
    renderPalettes();
    
    // デモ用のサンプルデータを追加
    if (palettes.length === 0) {
        addSamplePalettes();
    }
});

// イベントリスナーの初期化
function initializeEventListeners() {
    // カラー入力
    document.getElementById('colorPicker').addEventListener('input', function() {
        updateCurrentColor(this.value);
    });
    
    document.getElementById('hexInput').addEventListener('input', function() {
        const hex = this.value.startsWith('#') ? this.value : '#' + this.value;
        if (isValidHex(hex)) {
            updateCurrentColor(hex);
        }
    });
    
    document.getElementById('rgbInput').addEventListener('input', function() {
        const rgb = parseRGB(this.value);
        if (rgb) {
            const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
            updateCurrentColor(hex);
        }
    });
    
    document.getElementById('hslInput').addEventListener('input', function() {
        const hsl = parseHSL(this.value);
        if (hsl) {
            const hex = hslToHex(hsl.h, hsl.s, hsl.l);
            updateCurrentColor(hex);
        }
    });
    
    // カラーアクション
    document.getElementById('addColorBtn').addEventListener('click', addCurrentColor);
    document.getElementById('favoriteBtn').addEventListener('click', toggleFavorite);
    document.getElementById('saveColorBtn').addEventListener('click', saveCurrentColor);
    
    // パレット作成
    document.getElementById('createPaletteBtn').addEventListener('click', createPalette);
    
    // カラーツール
    document.getElementById('randomColorBtn').addEventListener('click', generateRandomColor);
    document.getElementById('complementaryBtn').addEventListener('click', generateComplementary);
    document.getElementById('analogousBtn').addEventListener('click', generateAnalogous);
    document.getElementById('triadicBtn').addEventListener('click', generateTriadic);
    document.getElementById('monochromaticBtn').addEventListener('click', generateMonochromatic);
    
    // コピーボタン
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const valueType = this.dataset.value;
            copyToClipboard(valueType);
        });
    });
    
    // フィルターボタン
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            filterPalettes(filter);
        });
    });
    
    // エクスポートボタン
    document.getElementById('exportCSS').addEventListener('click', () => exportPalette('css'));
    document.getElementById('exportSCSS').addEventListener('click', () => exportPalette('scss'));
    document.getElementById('exportJSON').addEventListener('click', () => exportPalette('json'));
    document.getElementById('exportASE').addEventListener('click', () => exportPalette('ase'));
    document.getElementById('exportPNG').addEventListener('click', () => exportPalette('png'));
    
    // モーダル関連
    document.getElementById('closePaletteModal').addEventListener('click', closePaletteModal);
    document.getElementById('savePaletteBtn').addEventListener('click', savePaletteFromModal);
    document.getElementById('deletePaletteBtn').addEventListener('click', deletePaletteFromModal);
    document.getElementById('exportPaletteBtn').addEventListener('click', exportCurrentPalette);
    
    // モーダル外クリックで閉じる
    document.getElementById('paletteModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closePaletteModal();
        }
    });
}

// 現在のカラー更新
function updateCurrentColor(color) {
    currentColor = color;
    
    // UI更新
    document.getElementById('colorPicker').value = color;
    document.getElementById('currentColorPreview').style.backgroundColor = color;
    
    // カラー値表示
    const rgb = hexToRgb(color);
    const hsl = hexToHsl(color);
    const hsv = hexToHsv(color);
    
    document.getElementById('currentHex').textContent = color;
    document.getElementById('currentRgb').textContent = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
    document.getElementById('currentHsl').textContent = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
    document.getElementById('currentHsv').textContent = `${hsv.h}, ${hsv.s}%, ${hsv.v}%`;
    
    // 入力フィールド更新
    document.getElementById('hexInput').value = color;
    document.getElementById('rgbInput').value = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
    document.getElementById('hslInput').value = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
    
    // カラーハーモニー更新
    updateColorHarmony(color);
    
    // 最近使用したカラーに追加
    addToRecentColors(color);
}

// カラーハーモニー更新
function updateColorHarmony(color) {
    const container = document.getElementById('harmonyColors');
    const harmonies = generateColorHarmony(color);
    
    container.innerHTML = harmonies.map(harmonyColor => `
        <div class="harmony-color" style="background-color: ${harmonyColor}" onclick="updateCurrentColor('${harmonyColor}')">
            ${harmonyColor}
        </div>
    `).join('');
}

// 現在のカラーを追加
function addCurrentColor() {
    if (!currentColors.find(c => c.hex === currentColor)) {
        currentColors.push({
            hex: currentColor,
            name: `Color ${currentColors.length + 1}`,
            createdAt: new Date().toISOString()
        });
        updateStats();
        saveToStorage();
    }
}

// お気に入りトグル
function toggleFavorite() {
    const existingIndex = favoriteColors.findIndex(c => c.hex === currentColor);
    
    if (existingIndex !== -1) {
        favoriteColors.splice(existingIndex, 1);
        document.getElementById('favoriteBtn').textContent = '⭐ お気に入り';
    } else {
        favoriteColors.push({
            hex: currentColor,
            name: `Favorite ${favoriteColors.length + 1}`,
            createdAt: new Date().toISOString()
        });
        document.getElementById('favoriteBtn').textContent = '⭐ お気に入り済み';
    }
    
    updateStats();
    saveToStorage();
}

// 現在のカラーを保存
function saveCurrentColor() {
    addCurrentColor();
    alert('カラーが保存されました！');
}

// パレット作成
function createPalette() {
    const name = document.getElementById('paletteName').value.trim();
    const description = document.getElementById('paletteDescription').value.trim();
    
    if (!name) {
        alert('パレット名を入力してください。');
        return;
    }
    
    if (currentColors.length === 0) {
        alert('パレットに追加するカラーがありません。');
        return;
    }
    
    const palette = {
        id: paletteIdCounter++,
        name: name,
        description: description,
        colors: [...currentColors],
        createdAt: new Date().toISOString(),
        favorite: false
    };
    
    palettes.push(palette);
    currentColors = [];
    
    // フォームリセット
    document.getElementById('paletteName').value = '';
    document.getElementById('paletteDescription').value = '';
    
    updateStats();
    renderPalettes();
    saveToStorage();
    
    alert('パレットが作成されました！');
}

// ランダムカラー生成
function generateRandomColor() {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    updateCurrentColor(randomColor);
}

// 補色生成
function generateComplementary() {
    const rgb = hexToRgb(currentColor);
    const complementary = rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
    updateCurrentColor(complementary);
}

// 類似色生成
function generateAnalogous() {
    const hsl = hexToHsl(currentColor);
    const analogous = [];
    
    for (let i = -2; i <= 2; i++) {
        const newHue = (hsl.h + i * 30) % 360;
        analogous.push(hslToHex(newHue, hsl.s, hsl.l));
    }
    
    updateColorHarmony(currentColor);
    showColorSet(analogous);
}

// 三原色生成
function generateTriadic() {
    const hsl = hexToHsl(currentColor);
    const triadic = [
        currentColor,
        hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
    ];
    
    showColorSet(triadic);
}

// 単色バリエーション生成
function generateMonochromatic() {
    const hsl = hexToHsl(currentColor);
    const monochromatic = [];
    
    for (let i = 0; i < 5; i++) {
        const lightness = Math.max(10, Math.min(90, hsl.l + (i - 2) * 20));
        monochromatic.push(hslToHex(hsl.h, hsl.s, lightness));
    }
    
    showColorSet(monochromatic);
}

// カラーセット表示
function showColorSet(colors) {
    const container = document.getElementById('harmonyColors');
    container.innerHTML = colors.map(color => `
        <div class="harmony-color" style="background-color: ${color}" onclick="updateCurrentColor('${color}')">
            ${color}
        </div>
    `).join('');
}

// カラーハーモニー生成
function generateColorHarmony(color) {
    const hsl = hexToHsl(color);
    return [
        color,
        hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 60) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)
    ];
}

// 最近使用したカラーに追加
function addToRecentColors(color) {
    const existingIndex = recentColors.findIndex(c => c.hex === color);
    
    if (existingIndex !== -1) {
        recentColors.splice(existingIndex, 1);
    }
    
    recentColors.unshift({
        hex: color,
        usedAt: new Date().toISOString()
    });
    
    // 最新10個まで保持
    recentColors = recentColors.slice(0, 10);
    updateStats();
    saveToStorage();
}

// 統計情報更新
function updateStats() {
    document.getElementById('totalPalettes').textContent = palettes.length;
    document.getElementById('totalColors').textContent = currentColors.length;
    document.getElementById('favoriteColors').textContent = favoriteColors.length;
    document.getElementById('recentColors').textContent = recentColors.length;
}

// パレット描画
function renderPalettes(filteredPalettes = null) {
    const container = document.getElementById('palettesGrid');
    const palettesToRender = filteredPalettes || palettes;
    
    if (palettesToRender.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h4>該当するパレットがありません</h4>
                <p>新しいパレットを作成してください</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = palettesToRender.map(palette => `
        <div class="palette-card" onclick="openPaletteModal(${palette.id})">
            <div class="palette-title">${palette.name}</div>
            <div class="palette-description">${palette.description || 'なし'}</div>
            <div class="palette-colors">
                ${palette.colors.slice(0, 6).map(color => `
                    <div class="palette-color" style="background-color: ${color.hex}"></div>
                `).join('')}
                ${palette.colors.length > 6 ? `<div class="palette-color" style="background: #ccc; display: flex; align-items: center; justify-content: center; font-size: 0.7rem;">+${palette.colors.length - 6}</div>` : ''}
            </div>
            <div class="palette-meta">
                <span>${palette.colors.length} colors</span>
                <span>${new Date(palette.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

// パレットフィルター
function filterPalettes(filter) {
    let filtered = [...palettes];
    
    switch (filter) {
        case 'recent':
            filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
            break;
        case 'favorite':
            filtered = filtered.filter(p => p.favorite);
            break;
        case 'custom':
            filtered = filtered.filter(p => p.colors.length > 5);
            break;
    }
    
    renderPalettes(filtered);
}

// パレットモーダル開く
function openPaletteModal(paletteId) {
    const palette = palettes.find(p => p.id === paletteId);
    if (!palette) return;
    
    selectedPaletteId = paletteId;
    
    document.getElementById('modalPaletteTitle').textContent = palette.name;
    document.getElementById('modalPaletteName').value = palette.name;
    document.getElementById('modalPaletteDescription').value = palette.description || '';
    document.getElementById('modalPaletteDate').textContent = new Date(palette.createdAt).toLocaleString();
    
    // カラー一覧表示
    const colorsGrid = document.getElementById('modalColorsGrid');
    colorsGrid.innerHTML = palette.colors.map(color => `
        <div class="color-item" onclick="updateCurrentColor('${color.hex}')">
            <div class="color-swatch" style="background-color: ${color.hex}"></div>
            <div class="color-code">${color.hex}</div>
        </div>
    `).join('');
    
    document.getElementById('paletteModal').style.display = 'block';
}

// パレットモーダル閉じる
function closePaletteModal() {
    document.getElementById('paletteModal').style.display = 'none';
    selectedPaletteId = null;
}

// モーダルからパレット保存
function savePaletteFromModal() {
    const palette = palettes.find(p => p.id === selectedPaletteId);
    if (!palette) return;
    
    palette.name = document.getElementById('modalPaletteName').value;
    palette.description = document.getElementById('modalPaletteDescription').value;
    
    renderPalettes();
    saveToStorage();
    closePaletteModal();
    alert('パレットが保存されました！');
}

// モーダルからパレット削除
function deletePaletteFromModal() {
    if (!confirm('このパレットを削除しますか？')) return;
    
    const index = palettes.findIndex(p => p.id === selectedPaletteId);
    if (index !== -1) {
        palettes.splice(index, 1);
        renderPalettes();
        updateStats();
        saveToStorage();
        closePaletteModal();
        alert('パレットが削除されました！');
    }
}

// 現在のパレットをエクスポート
function exportCurrentPalette() {
    const palette = palettes.find(p => p.id === selectedPaletteId);
    if (!palette) return;
    
    exportPalette('json', palette);
}

// パレットエクスポート
function exportPalette(format, palette = null) {
    const targetPalette = palette || {
        name: 'Current Colors',
        colors: currentColors,
        createdAt: new Date().toISOString()
    };
    
    switch (format) {
        case 'css':
            exportAsCSS(targetPalette);
            break;
        case 'scss':
            exportAsSCSS(targetPalette);
            break;
        case 'json':
            exportAsJSON(targetPalette);
            break;
        case 'ase':
            alert('ASE エクスポートは開発中です。');
            break;
        case 'png':
            exportAsPNG(targetPalette);
            break;
    }
}

// CSS形式でエクスポート
function exportAsCSS(palette) {
    const css = `:root {
${palette.colors.map((color, index) => `  --color-${index + 1}: ${color.hex};`).join('\n')}
}

/* ${palette.name} */
${palette.colors.map((color, index) => `
.color-${index + 1} {
  background-color: var(--color-${index + 1});
  color: ${isLightColor(color.hex) ? '#000' : '#fff'};
}`).join('')}`;
    
    downloadFile(`${palette.name}.css`, css, 'text/css');
}

// SCSS形式でエクスポート
function exportAsSCSS(palette) {
    const scss = `// ${palette.name}
${palette.colors.map((color, index) => `$color-${index + 1}: ${color.hex};`).join('\n')}

$palette: (
${palette.colors.map((color, index) => `  "color-${index + 1}": $color-${index + 1},`).join('\n')}
);`;
    
    downloadFile(`${palette.name}.scss`, scss, 'text/scss');
}

// JSON形式でエクスポート
function exportAsJSON(palette) {
    const json = JSON.stringify(palette, null, 2);
    downloadFile(`${palette.name}.json`, json, 'application/json');
}

// PNG形式でエクスポート
function exportAsPNG(palette) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = palette.colors.length * 100;
    canvas.height = 100;
    
    palette.colors.forEach((color, index) => {
        ctx.fillStyle = color.hex;
        ctx.fillRect(index * 100, 0, 100, 100);
    });
    
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${palette.name}.png`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

// クリップボードにコピー
function copyToClipboard(valueType) {
    let value;
    
    switch (valueType) {
        case 'hex':
            value = document.getElementById('currentHex').textContent;
            break;
        case 'rgb':
            value = `rgb(${document.getElementById('currentRgb').textContent})`;
            break;
        case 'hsl':
            value = `hsl(${document.getElementById('currentHsl').textContent})`;
            break;
        case 'hsv':
            value = document.getElementById('currentHsv').textContent;
            break;
    }
    
    navigator.clipboard.writeText(value).then(() => {
        alert(`${value} をクリップボードにコピーしました！`);
    });
}

// サンプルパレット追加
function addSamplePalettes() {
    const samplePalettes = [
        {
            id: paletteIdCounter++,
            name: 'Material Design',
            description: 'Google Material Design カラーパレット',
            colors: [
                { hex: '#F44336', name: 'Red' },
                { hex: '#E91E63', name: 'Pink' },
                { hex: '#9C27B0', name: 'Purple' },
                { hex: '#673AB7', name: 'Deep Purple' },
                { hex: '#3F51B5', name: 'Indigo' },
                { hex: '#2196F3', name: 'Blue' }
            ],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            favorite: false
        },
        {
            id: paletteIdCounter++,
            name: 'Sunset',
            description: '夕焼けをイメージしたパレット',
            colors: [
                { hex: '#FF6B6B', name: 'Coral' },
                { hex: '#FFE66D', name: 'Yellow' },
                { hex: '#FF8E53', name: 'Orange' },
                { hex: '#C06C84', name: 'Pink' },
                { hex: '#6C5B7B', name: 'Purple' }
            ],
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            favorite: true
        },
        {
            id: paletteIdCounter++,
            name: 'Ocean',
            description: '海をイメージしたパレット',
            colors: [
                { hex: '#355C7D', name: 'Deep Blue' },
                { hex: '#6C5CE7', name: 'Blue' },
                { hex: '#A8E6CF', name: 'Light Green' },
                { hex: '#7FDBFF', name: 'Aqua' },
                { hex: '#39CCCC', name: 'Teal' }
            ],
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            favorite: false
        }
    ];
    
    palettes = samplePalettes;
    saveToStorage();
    updateStats();
    renderPalettes();
}

// ユーティリティ関数
function isValidHex(hex) {
    return /^#[0-9A-F]{6}$/i.test(hex);
}

function parseRGB(rgb) {
    const match = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3])
        };
    }
    return null;
}

function parseHSL(hsl) {
    const match = hsl.match(/(\d+),\s*(\d+)%?,\s*(\d+)%?/);
    if (match) {
        return {
            h: parseInt(match[1]),
            s: parseInt(match[2]),
            l: parseInt(match[3])
        };
    }
    return null;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToHsl(hex) {
    const rgb = hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function hslToHex(h, s, l) {
    h = h % 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c/2;
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return rgbToHex(r, g, b);
}

function hexToHsv(hex) {
    const rgb = hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    
    const h = d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    
    return {
        h: Math.round(h * 60),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}

function isLightColor(hex) {
    const rgb = hexToRgb(hex);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128;
}

function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// データの保存と読み込み
function saveToStorage() {
    localStorage.setItem('colorPalette_palettes', JSON.stringify(palettes));
    localStorage.setItem('colorPalette_currentColors', JSON.stringify(currentColors));
    localStorage.setItem('colorPalette_favoriteColors', JSON.stringify(favoriteColors));
    localStorage.setItem('colorPalette_recentColors', JSON.stringify(recentColors));
    localStorage.setItem('colorPalette_currentColor', currentColor);
    localStorage.setItem('colorPalette_counter', JSON.stringify(paletteIdCounter));
}

function loadFromStorage() {
    const storedPalettes = localStorage.getItem('colorPalette_palettes');
    const storedCurrentColors = localStorage.getItem('colorPalette_currentColors');
    const storedFavoriteColors = localStorage.getItem('colorPalette_favoriteColors');
    const storedRecentColors = localStorage.getItem('colorPalette_recentColors');
    const storedCurrentColor = localStorage.getItem('colorPalette_currentColor');
    const storedCounter = localStorage.getItem('colorPalette_counter');
    
    if (storedPalettes) {
        palettes = JSON.parse(storedPalettes);
    }
    
    if (storedCurrentColors) {
        currentColors = JSON.parse(storedCurrentColors);
    }
    
    if (storedFavoriteColors) {
        favoriteColors = JSON.parse(storedFavoriteColors);
    }
    
    if (storedRecentColors) {
        recentColors = JSON.parse(storedRecentColors);
    }
    
    if (storedCurrentColor) {
        currentColor = storedCurrentColor;
    }
    
    if (storedCounter) {
        paletteIdCounter = JSON.parse(storedCounter);
    }
}