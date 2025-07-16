class PDFViewer {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.zoom = 100;
        this.pdfData = null;
        this.pdfDocument = null;
        this.currentPageObject = null;
        this.isLoading = false;
        this.recentFiles = JSON.parse(localStorage.getItem('pdfViewerRecent') || '[]');
        
        this.initializeElements();
        this.setupEventListeners();
        this.renderRecentFiles();
        this.updateStatus('PDFファイルを選択してください');
    }
    
    initializeElements() {
        this.elements = {
            fileInput: document.getElementById('fileInput'),
            dropZone: document.getElementById('dropZone'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            pageInfo: document.getElementById('pageInfo'),
            pageInput: document.getElementById('pageInput'),
            zoomOutBtn: document.getElementById('zoomOutBtn'),
            zoomInBtn: document.getElementById('zoomInBtn'),
            zoomInfo: document.getElementById('zoomInfo'),
            zoomSelect: document.getElementById('zoomSelect'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),
            rotateBtn: document.getElementById('rotateBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            pdfContainer: document.getElementById('pdfContainer'),
            canvas: document.getElementById('pdfCanvas'),
            loadingSpinner: document.getElementById('loadingSpinner'),
            status: document.getElementById('status'),
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            searchResults: document.getElementById('searchResults'),
            recentFilesList: document.getElementById('recentFilesList'),
            clearRecentBtn: document.getElementById('clearRecentBtn'),
            toolbar: document.getElementById('toolbar'),
            fitWidthBtn: document.getElementById('fitWidthBtn'),
            fitPageBtn: document.getElementById('fitPageBtn')
        };
        
        this.ctx = this.elements.canvas.getContext('2d');
        this.rotation = 0;
    }
    
    setupEventListeners() {
        // ファイル関連
        this.elements.fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.loadPDF(e.target.files[0]);
            }
        });
        
        // ドラッグ&ドロップ
        this.elements.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.dropZone.classList.add('drag-over');
        });
        
        this.elements.dropZone.addEventListener('dragleave', () => {
            this.elements.dropZone.classList.remove('drag-over');
        });
        
        this.elements.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.dropZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                this.loadPDF(files[0]);
            } else {
                this.updateStatus('PDFファイルをドロップしてください', 'error');
            }
        });
        
        // ナビゲーション
        this.elements.prevBtn.addEventListener('click', () => this.prevPage());
        this.elements.nextBtn.addEventListener('click', () => this.nextPage());
        this.elements.pageInput.addEventListener('change', () => this.goToPage());
        
        // ズーム
        this.elements.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.elements.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.elements.zoomSelect.addEventListener('change', () => this.setZoom());
        this.elements.fitWidthBtn.addEventListener('click', () => this.fitToWidth());
        this.elements.fitPageBtn.addEventListener('click', () => this.fitToPage());
        
        // その他の機能
        this.elements.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.elements.rotateBtn.addEventListener('click', () => this.rotatePage());
        this.elements.downloadBtn.addEventListener('click', () => this.downloadPDF());
        
        // 検索
        this.elements.searchBtn.addEventListener('click', () => this.searchText());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchText();
        });
        
        // 最近のファイル
        this.elements.clearRecentBtn.addEventListener('click', () => this.clearRecentFiles());
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // リサイズイベント
        window.addEventListener('resize', () => {
            if (this.pdfDocument) {
                this.renderPage();
            }
        });
    }
    
    handleKeydown(e) {
        if (!this.pdfDocument) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.prevPage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextPage();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.zoomIn();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.zoomOut();
                break;
            case 'Home':
                e.preventDefault();
                this.goToFirstPage();
                break;
            case 'End':
                e.preventDefault();
                this.goToLastPage();
                break;
            case 'f':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.elements.searchInput.focus();
                }
                break;
            case 'F11':
                e.preventDefault();
                this.toggleFullscreen();
                break;
        }
    }
    
    async loadPDF(file) {
        try {
            this.isLoading = true;
            this.showLoading(true);
            this.updateStatus('PDFを読み込み中...');
            
            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
                try {
                    // Note: In a real implementation, you would use PDF.js library
                    // For this demo, we'll simulate PDF loading
                    await this.simulatePDFLoading(file);
                    
                    // Add to recent files
                    this.addToRecentFiles(file);
                    
                } catch (error) {
                    console.error('PDF読み込みエラー:', error);
                    this.updateStatus('PDFの読み込みに失敗しました', 'error');
                    this.showLoading(false);
                }
            };
            
            fileReader.onerror = () => {
                this.updateStatus('ファイルの読み込みに失敗しました', 'error');
                this.showLoading(false);
            };
            
            fileReader.readAsArrayBuffer(file);
            
        } catch (error) {
            console.error('ファイル処理エラー:', error);
            this.updateStatus('ファイルの処理中にエラーが発生しました', 'error');
            this.showLoading(false);
        }
    }
    
    async simulatePDFLoading(file) {
        // Simulate PDF.js loading (in real implementation, use PDF.js)
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate PDF document
                this.pdfDocument = {
                    numPages: Math.floor(Math.random() * 20) + 5, // 5-24 pages
                    filename: file.name,
                    fileSize: file.size
                };
                
                this.totalPages = this.pdfDocument.numPages;
                this.currentPage = 1;
                this.zoom = 100;
                this.rotation = 0;
                
                this.renderPage();
                this.updateUI();
                this.showLoading(false);
                this.updateStatus(`PDF読み込み完了: ${this.totalPages}ページ`);
                
                resolve();
            }, 1500);
        });
    }
    
    renderPage() {
        if (!this.pdfDocument) return;
        
        // Simulate page rendering (in real implementation, use PDF.js page.render())
        const canvas = this.elements.canvas;
        const ctx = this.ctx;
        
        // Calculate dimensions
        const containerWidth = this.elements.pdfContainer.clientWidth - 40;
        const containerHeight = this.elements.pdfContainer.clientHeight - 40;
        
        let pageWidth = 595; // A4 width in points
        let pageHeight = 842; // A4 height in points
        
        // Apply rotation
        if (this.rotation === 90 || this.rotation === 270) {
            [pageWidth, pageHeight] = [pageHeight, pageWidth];
        }
        
        const scale = this.zoom / 100;
        canvas.width = pageWidth * scale;
        canvas.height = pageHeight * scale;
        
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw page content simulation
        ctx.fillStyle = '#000000';
        ctx.font = `${16 * scale}px Arial`;
        
        const text = `PDFビューアー デモ
        
ページ ${this.currentPage} / ${this.totalPages}

これは実際のPDFコンテンツではなく、
デモ用のシミュレーションです。

実際の実装では、PDF.jsライブラリを使用して
PDFの内容を正確に表示します。

ファイル名: ${this.pdfDocument.filename}
ファイルサイズ: ${this.formatFileSize(this.pdfDocument.fileSize)}
ズーム: ${this.zoom}%
回転: ${this.rotation}°

キーボードショートカット:
← → : ページ移動
↑ ↓ : ズーム
Home/End : 最初/最後のページ
Ctrl+F : 検索
F11 : フルスクリーン`;
        
        const lines = text.split('\n');
        lines.forEach((line, index) => {
            ctx.fillText(line.trim(), 50 * scale, (50 + index * 20) * scale);
        });
        
        // Draw page border
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }
    
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderPage();
            this.updateUI();
            this.updateStatus(`ページ ${this.currentPage}/${this.totalPages}`);
        }
    }
    
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.renderPage();
            this.updateUI();
            this.updateStatus(`ページ ${this.currentPage}/${this.totalPages}`);
        }
    }
    
    goToPage() {
        const pageNum = parseInt(this.elements.pageInput.value);
        if (pageNum >= 1 && pageNum <= this.totalPages) {
            this.currentPage = pageNum;
            this.renderPage();
            this.updateUI();
            this.updateStatus(`ページ ${this.currentPage}/${this.totalPages}`);
        } else {
            this.elements.pageInput.value = this.currentPage;
            this.updateStatus(`無効なページ番号: 1-${this.totalPages}の範囲で入力してください`, 'error');
        }
    }
    
    goToFirstPage() {
        this.currentPage = 1;
        this.renderPage();
        this.updateUI();
        this.updateStatus(`最初のページ`);
    }
    
    goToLastPage() {
        this.currentPage = this.totalPages;
        this.renderPage();
        this.updateUI();
        this.updateStatus(`最後のページ`);
    }
    
    zoomIn() {
        this.zoom = Math.min(this.zoom + 25, 300);
        this.renderPage();
        this.updateZoomUI();
        this.updateStatus(`ズーム: ${this.zoom}%`);
    }
    
    zoomOut() {
        this.zoom = Math.max(this.zoom - 25, 25);
        this.renderPage();
        this.updateZoomUI();
        this.updateStatus(`ズーム: ${this.zoom}%`);
    }
    
    setZoom() {
        const zoomValue = this.elements.zoomSelect.value;
        if (zoomValue === 'fit-width') {
            this.fitToWidth();
        } else if (zoomValue === 'fit-page') {
            this.fitToPage();
        } else {
            this.zoom = parseInt(zoomValue);
            this.renderPage();
            this.updateZoomUI();
            this.updateStatus(`ズーム: ${this.zoom}%`);
        }
    }
    
    fitToWidth() {
        const containerWidth = this.elements.pdfContainer.clientWidth - 40;
        const pageWidth = 595; // A4 width in points
        this.zoom = Math.floor((containerWidth / pageWidth) * 100);
        this.renderPage();
        this.updateZoomUI();
        this.updateStatus(`幅に合わせる: ${this.zoom}%`);
    }
    
    fitToPage() {
        const containerWidth = this.elements.pdfContainer.clientWidth - 40;
        const containerHeight = this.elements.pdfContainer.clientHeight - 40;
        const pageWidth = 595;
        const pageHeight = 842;
        
        const widthScale = containerWidth / pageWidth;
        const heightScale = containerHeight / pageHeight;
        
        this.zoom = Math.floor(Math.min(widthScale, heightScale) * 100);
        this.renderPage();
        this.updateZoomUI();
        this.updateStatus(`ページに合わせる: ${this.zoom}%`);
    }
    
    rotatePage() {
        this.rotation = (this.rotation + 90) % 360;
        this.renderPage();
        this.updateStatus(`回転: ${this.rotation}°`);
    }
    
    searchText() {
        const query = this.elements.searchInput.value.trim();
        if (!query) {
            this.updateStatus('検索キーワードを入力してください', 'error');
            return;
        }
        
        // Simulate search (in real implementation, use PDF.js text extraction)
        const results = [];
        for (let i = 1; i <= this.totalPages; i++) {
            if (Math.random() > 0.5) { // Random search results for demo
                results.push({
                    page: i,
                    text: `"${query}"が見つかりました（デモ）`
                });
            }
        }
        
        this.displaySearchResults(results, query);
    }
    
    displaySearchResults(results, query) {
        if (results.length === 0) {
            this.elements.searchResults.innerHTML = `<p>「${query}」は見つかりませんでした</p>`;
            this.updateStatus(`検索結果: 0件`);
            return;
        }
        
        this.elements.searchResults.innerHTML = `
            <h4>検索結果: ${results.length}件</h4>
            ${results.map(result => `
                <div class="search-result" onclick="pdfViewer.goToSearchResult(${result.page})">
                    <strong>ページ ${result.page}</strong>: ${result.text}
                </div>
            `).join('')}
        `;
        
        this.updateStatus(`検索結果: ${results.length}件`);
    }
    
    goToSearchResult(pageNum) {
        this.currentPage = pageNum;
        this.renderPage();
        this.updateUI();
        this.updateStatus(`検索結果へジャンプ: ページ ${pageNum}`);
    }
    
    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            this.updateStatus('フルスクリーン終了');
        } else {
            document.documentElement.requestFullscreen();
            this.updateStatus('フルスクリーン表示');
        }
    }
    
    downloadPDF() {
        if (!this.pdfDocument) {
            this.updateStatus('ダウンロードするPDFがありません', 'error');
            return;
        }
        
        // In real implementation, you would download the original PDF
        this.updateStatus('PDF機能はデモ版では利用できません', 'warning');
    }
    
    addToRecentFiles(file) {
        const fileInfo = {
            name: file.name,
            size: file.size,
            lastOpened: new Date().toISOString(),
            pages: this.totalPages
        };
        
        // Remove if already exists
        this.recentFiles = this.recentFiles.filter(f => f.name !== file.name);
        
        // Add to beginning
        this.recentFiles.unshift(fileInfo);
        
        // Keep only last 10 files
        this.recentFiles = this.recentFiles.slice(0, 10);
        
        localStorage.setItem('pdfViewerRecent', JSON.stringify(this.recentFiles));
        this.renderRecentFiles();
    }
    
    renderRecentFiles() {
        if (this.recentFiles.length === 0) {
            this.elements.recentFilesList.innerHTML = '<p>最近開いたファイルはありません</p>';
            return;
        }
        
        this.elements.recentFilesList.innerHTML = this.recentFiles
            .map(file => `
                <div class="recent-file">
                    <div class="file-info">
                        <strong>${file.name}</strong>
                        <div class="file-details">
                            ${file.pages}ページ • ${this.formatFileSize(file.size)} • ${new Date(file.lastOpened).toLocaleDateString('ja-JP')}
                        </div>
                    </div>
                </div>
            `)
            .join('');
    }
    
    clearRecentFiles() {
        if (confirm('最近開いたファイルの履歴をクリアしますか？')) {
            this.recentFiles = [];
            localStorage.removeItem('pdfViewerRecent');
            this.renderRecentFiles();
            this.updateStatus('履歴をクリアしました');
        }
    }
    
    updateUI() {
        if (!this.pdfDocument) return;
        
        this.elements.pageInfo.textContent = `${this.currentPage} / ${this.totalPages}`;
        this.elements.pageInput.value = this.currentPage;
        this.elements.pageInput.max = this.totalPages;
        
        this.elements.prevBtn.disabled = this.currentPage === 1;
        this.elements.nextBtn.disabled = this.currentPage === this.totalPages;
        
        this.updateZoomUI();
    }
    
    updateZoomUI() {
        this.elements.zoomInfo.textContent = `${this.zoom}%`;
        this.elements.zoomSelect.value = this.zoom.toString();
    }
    
    showLoading(show) {
        this.elements.loadingSpinner.style.display = show ? 'block' : 'none';
        this.isLoading = show;
    }
    
    updateStatus(message, type = 'info') {
        this.elements.status.textContent = message;
        this.elements.status.className = `status ${type}`;
        
        if (type !== 'error') {
            setTimeout(() => {
                this.elements.status.textContent = 'PDFビューアー準備完了';
                this.elements.status.className = 'status';
            }, 3000);
        }
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// アプリ初期化
let pdfViewer;
document.addEventListener('DOMContentLoaded', () => {
    pdfViewer = new PDFViewer();
});