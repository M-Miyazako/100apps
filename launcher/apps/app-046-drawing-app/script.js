class DrawingApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentTool = 'pen';
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        
        this.setupCanvas();
        this.setupEventListeners();
    }
    
    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }
    
    setupEventListeners() {
        // Tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelector('.tool-btn.active').classList.remove('active');
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
            });
        });
        
        // Color and size
        document.getElementById('color-picker').addEventListener('change', (e) => {
            this.ctx.strokeStyle = e.target.value;
        });
        
        document.getElementById('brush-size').addEventListener('input', (e) => {
            this.ctx.lineWidth = e.target.value;
            document.getElementById('size-display').textContent = e.target.value + 'px';
        });
        
        // Action buttons
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        });
        
        document.getElementById('save-btn').addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'drawing.png';
            link.href = this.canvas.toDataURL();
            link.click();
        });
        
        document.getElementById('load-btn').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                        this.ctx.drawImage(img, 0, 0);
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            };
            input.click();
        });
        
        // Drawing events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.startX = pos.x;
        this.startY = pos.y;
        
        if (this.currentTool === 'pen' || this.currentTool === 'eraser') {
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
        }
        
        if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
        }
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        
        if (this.currentTool === 'pen' || this.currentTool === 'eraser') {
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();
        }
    }
    
    stopDrawing() {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        
        if (this.currentTool === 'line') {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
            this.ctx.lineTo(this.startX, this.startY);
            this.ctx.stroke();
        } else if (this.currentTool === 'circle') {
            const radius = Math.sqrt(Math.pow(this.startX - this.startX, 2) + Math.pow(this.startY - this.startY, 2));
            this.ctx.beginPath();
            this.ctx.arc(this.startX, this.startY, 50, 0, 2 * Math.PI);
            this.ctx.stroke();
        } else if (this.currentTool === 'rect') {
            this.ctx.beginPath();
            this.ctx.rect(this.startX, this.startY, 100, 80);
            this.ctx.stroke();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DrawingApp();
});