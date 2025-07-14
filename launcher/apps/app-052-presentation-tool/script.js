class PresentationTool {
    constructor() {
        this.slides = [
            { title: 'Click to add title', content: 'Click to add content' }
        ];
        this.currentSlide = 0;
        this.presentationMode = false;
        
        this.setupEventListeners();
        this.renderSlides();
        this.loadSlide(0);
    }
    
    setupEventListeners() {
        document.getElementById('add-slide').addEventListener('click', () => this.addSlide());
        document.getElementById('present-btn').addEventListener('click', () => this.startPresentation());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.presentationMode) {
                if (e.key === 'ArrowLeft') this.prevSlide();
                if (e.key === 'ArrowRight') this.nextSlide();
                if (e.key === 'Escape') this.endPresentation();
            }
        });
    }
    
    addSlide() {
        this.slides.push({
            title: 'New Slide Title',
            content: 'Add your content here'
        });
        this.renderSlides();
    }
    
    renderSlides() {
        const slidesList = document.getElementById('slides-list');
        slidesList.innerHTML = '';
        
        this.slides.forEach((slide, index) => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'slide-thumbnail';
            thumbnail.textContent = `${index + 1}. ${slide.title}`;
            
            if (index === this.currentSlide) {
                thumbnail.classList.add('active');
            }
            
            thumbnail.addEventListener('click', () => this.loadSlide(index));
            slidesList.appendChild(thumbnail);
        });
    }
    
    loadSlide(index) {
        this.currentSlide = index;
        const slide = this.slides[index];
        
        const slideContent = document.getElementById('slide-content');
        slideContent.innerHTML = `
            <h1 contenteditable="true">${slide.title}</h1>
            <p contenteditable="true">${slide.content}</p>
        `;
        
        // Update slide content on edit
        slideContent.addEventListener('input', (e) => {
            if (e.target.tagName === 'H1') {
                this.slides[this.currentSlide].title = e.target.textContent;
            } else if (e.target.tagName === 'P') {
                this.slides[this.currentSlide].content = e.target.textContent;
            }
            this.renderSlides();
        });
        
        this.renderSlides();
    }
    
    startPresentation() {
        this.presentationMode = true;
        this.currentSlide = 0;
        
        // Create presentation overlay
        const overlay = document.createElement('div');
        overlay.className = 'presentation-mode';
        overlay.style.display = 'flex';
        overlay.id = 'presentation-overlay';
        
        overlay.innerHTML = `
            <div class="presentation-slide">
                <h1>${this.slides[this.currentSlide].title}</h1>
                <p>${this.slides[this.currentSlide].content}</p>
            </div>
            <div class="presentation-controls">
                <button onclick="presentationTool.prevSlide()">← Previous</button>
                <button onclick="presentationTool.nextSlide()">Next →</button>
                <button onclick="presentationTool.endPresentation()">End</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }
    
    prevSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updatePresentationSlide();
        }
    }
    
    nextSlide() {
        if (this.currentSlide < this.slides.length - 1) {
            this.currentSlide++;
            this.updatePresentationSlide();
        }
    }
    
    updatePresentationSlide() {
        const overlay = document.getElementById('presentation-overlay');
        const slide = overlay.querySelector('.presentation-slide');
        
        slide.innerHTML = `
            <h1>${this.slides[this.currentSlide].title}</h1>
            <p>${this.slides[this.currentSlide].content}</p>
        `;
    }
    
    endPresentation() {
        this.presentationMode = false;
        const overlay = document.getElementById('presentation-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
}

let presentationTool;
document.addEventListener('DOMContentLoaded', () => {
    presentationTool = new PresentationTool();
});