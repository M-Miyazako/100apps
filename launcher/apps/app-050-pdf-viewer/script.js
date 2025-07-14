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
    
    displayPDF() {\n        const container = document.getElementById('pdf-container');\n        \n        // シンプルなPDFビューアー（実際にはpdf.jsライブラリを使用します）\n        container.innerHTML = `\n            <div class=\"pdf-page\" style=\"transform: scale(${this.zoom / 100})\">\n                <h2>PDF Document</h2>\n                <p>This is a demo PDF viewer. In a real implementation, you would use PDF.js library to render PDF pages.</p>\n                <p>File loaded successfully!</p>\n                <p>Page ${this.currentPage} of ${this.totalPages}</p>\n                <div style=\"margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 5px; color: #333;\">\n                    <h3>Sample Content</h3>\n                    <p>This would be the actual PDF content rendered using PDF.js library.</p>\n                    <p>Navigate using the arrow buttons or keyboard arrows.</p>\n                </div>\n            </div>\n        `;\n        \n        this.updateUI();\n    }\n    \n    prevPage() {\n        if (this.currentPage > 1) {\n            this.currentPage--;\n            this.updateUI();\n        }\n    }\n    \n    nextPage() {\n        if (this.currentPage < this.totalPages) {\n            this.currentPage++;\n            this.updateUI();\n        }\n    }\n    \n    zoomIn() {\n        this.zoom = Math.min(this.zoom + 25, 200);\n        this.updateZoom();\n    }\n    \n    zoomOut() {\n        this.zoom = Math.max(this.zoom - 25, 50);\n        this.updateZoom();\n    }\n    \n    updateZoom() {\n        document.getElementById('zoom-info').textContent = `${this.zoom}%`;\n        if (this.pdfData) {\n            this.displayPDF();\n        }\n    }\n    \n    updateUI() {\n        document.getElementById('page-info').textContent = `Page ${this.currentPage} of ${this.totalPages}`;\n        document.getElementById('prev-btn').disabled = this.currentPage === 1;\n        document.getElementById('next-btn').disabled = this.currentPage === this.totalPages;\n    }\n    \n    toggleFullscreen() {\n        if (document.fullscreenElement) {\n            document.exitFullscreen();\n        } else {\n            document.documentElement.requestFullscreen();\n        }\n    }\n}\n\ndocument.addEventListener('DOMContentLoaded', () => {\n    new PDFViewer();\n});"