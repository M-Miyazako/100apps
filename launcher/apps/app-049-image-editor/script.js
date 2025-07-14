class ImageEditor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = null;
        this.filters = {
            brightness: 100,
            contrast: 100,
            saturate: 100,
            blur: 0
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('file-input').addEventListener('change', (e) => {
            this.loadImage(e.target.files[0]);
        });
        
        Object.keys(this.filters).forEach(filter => {
            document.getElementById(filter).addEventListener('input', (e) => {
                this.filters[filter] = e.target.value;
                this.applyFilters();
            });
        });
        
        document.querySelector('.reset-btn').addEventListener('click', () => {
            this.resetFilters();
        });
        
        document.querySelector('.save-btn').addEventListener('click', () => {
            this.saveImage();
        });
    }
    
    loadImage(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                this.resetFilters();
                this.applyFilters();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    applyFilters() {
        if (!this.originalImage) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const filterString = `
            brightness(${this.filters.brightness}%)
            contrast(${this.filters.contrast}%)
            saturate(${this.filters.saturate}%)
            blur(${this.filters.blur}px)
        `;
        
        this.ctx.filter = filterString;
        this.ctx.drawImage(this.originalImage, 0, 0);
    }
    
    resetFilters() {
        this.filters = {
            brightness: 100,
            contrast: 100,
            saturate: 100,
            blur: 0
        };
        
        Object.keys(this.filters).forEach(filter => {
            document.getElementById(filter).value = this.filters[filter];
        });
        
        this.applyFilters();
    }
    
    saveImage() {
        if (!this.originalImage) return;
        
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageEditor();
});