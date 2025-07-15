class PDFViewer {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.zoom = 100;
        this.pdfData = null;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('file-input').addEventListener('change', (e) => {
            this.loadPDF(e.target.files[0]);
        });
        
        document.getElementById('prev-btn').addEventListener('click', () => {
            this.prevPage();
        });
        
        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextPage();
        });
        
        document.getElementById('zoom-out').addEventListener('click', () => {
            this.zoomOut();
        });
        
        document.getElementById('zoom-in').addEventListener('click', () => {
            this.zoomIn();
        });
        
        document.getElementById('fullscreen').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevPage();
            if (e.key === 'ArrowRight') this.nextPage();
            if (e.key === '+') this.zoomIn();
            if (e.key === '-') this.zoomOut();
        });
    }
    
    loadPDF(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.pdfData = e.target.result;
            this.displayPDF();
        };
        reader.readAsDataURL(file);
    }
    
    displayPDF() {
        const container = document.getElementById('pdf-container');
        
        // シンプルなPDFビューアー（実際にはpdf.jsライブラリを使用します）
        container.innerHTML = `
            <div class="pdf-page" style="transform: scale(${this.zoom / 100})">
                <h2>PDF Document</h2>
                <p>This is a demo PDF viewer. In a real implementation, you would use PDF.js library to render PDF pages.</p>
                <p>File loaded successfully!</p>
                <p>Page ${this.currentPage} of ${this.totalPages}</p>
                <div style="margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 5px; color: #333;">
                    <h3>Sample Content</h3>
                    <p>This would be the actual PDF content rendered using PDF.js library.</p>
                    <p>Navigate using the arrow buttons or keyboard arrows.</p>
                </div>
            </div>
        `;
        
        this.updateUI();
    }
    
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateUI();
        }
    }
    
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updateUI();
        }
    }
    
    zoomIn() {
        this.zoom = Math.min(this.zoom + 25, 200);
        this.updateZoom();
    }
    
    zoomOut() {
        this.zoom = Math.max(this.zoom - 25, 50);
        this.updateZoom();
    }
    
    updateZoom() {
        document.getElementById('zoom-info').textContent = `${this.zoom}%`;
        if (this.pdfData) {
            this.displayPDF();
        }
    }
    
    updateUI() {
        document.getElementById('page-info').textContent = `Page ${this.currentPage} of ${this.totalPages}`;
        document.getElementById('prev-btn').disabled = this.currentPage === 1;
        document.getElementById('next-btn').disabled = this.currentPage === this.totalPages;
    }
    
    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PDFViewer();
});"