class VideoPlayer {
    constructor() {
        this.video = document.getElementById('video');
        this.controls = document.getElementById('controls');
        this.playBtn = document.getElementById('play-btn');
        this.currentTimeEl = document.getElementById('current-time');
        this.durationEl = document.getElementById('duration');
        this.progressBar = document.getElementById('progress-bar');
        this.progressFill = document.getElementById('progress-fill');
        this.volumeBtn = document.getElementById('volume-btn');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeFill = document.getElementById('volume-fill');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.videoPlayer = document.querySelector('.video-player');
        
        this.isPlaying = false;
        this.isDragging = false;
        this.controlsTimeout = null;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // File input and drag & drop
        this.fileInput.addEventListener('change', (e) => this.loadVideo(e.target.files[0]));
        this.setupDragAndDrop();
        
        // Video events
        this.video.addEventListener('loadedmetadata', () => this.updateDuration());
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('ended', () => this.videoEnded());
        
        // Control events
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        this.volumeSlider.addEventListener('click', (e) => this.setVolume(e));
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Mouse movement for controls
        this.videoPlayer.addEventListener('mousemove', () => this.showControls());
        this.videoPlayer.addEventListener('mouseleave', () => this.hideControls());
    }
    
    setupDragAndDrop() {
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.loadVideo(files[0]);
            }
        });
    }
    
    loadVideo(file) {
        if (!file) return;
        
        const url = URL.createObjectURL(file);
        this.video.src = url;
        this.video.load();
        
        this.uploadArea.style.display = 'none';
        this.videoPlayer.style.display = 'block';
    }
    
    togglePlay() {
        if (this.video.paused) {
            this.video.play();
            this.playBtn.textContent = '⏸️';
            this.isPlaying = true;
        } else {
            this.video.pause();
            this.playBtn.textContent = '▶️';
            this.isPlaying = false;
        }
    }
    
    updateDuration() {
        const duration = this.video.duration;
        this.durationEl.textContent = this.formatTime(duration);
    }
    
    updateProgress() {
        if (!this.isDragging) {
            const progress = (this.video.currentTime / this.video.duration) * 100;
            this.progressFill.style.width = `${progress}%`;
            this.currentTimeEl.textContent = this.formatTime(this.video.currentTime);
        }
    }
    
    seek(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        
        this.video.currentTime = percentage * this.video.duration;
    }
    
    setVolume(e) {
        const rect = this.volumeSlider.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const volume = clickX / width;
        
        this.video.volume = Math.max(0, Math.min(1, volume));
        this.volumeFill.style.width = `${volume * 100}%`;
        
        this.updateVolumeIcon();
    }
    
    updateVolumeIcon() {
        if (this.video.muted || this.video.volume === 0) {
            this.volumeBtn.textContent = '🔇';
        } else if (this.video.volume < 0.5) {
            this.volumeBtn.textContent = '🔉';
        } else {
            this.volumeBtn.textContent = '🔊';
        }
    }
    
    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            this.videoPlayer.classList.remove('fullscreen');
        } else {
            this.videoPlayer.requestFullscreen();
            this.videoPlayer.classList.add('fullscreen');
        }
    }
    
    handleKeyboard(e) {
        if (this.videoPlayer.style.display === 'none') return;
        
        switch (e.key) {
            case ' ':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'f':
                this.toggleFullscreen();
                break;
            case 'ArrowLeft':
                this.video.currentTime -= 10;
                break;
            case 'ArrowRight':
                this.video.currentTime += 10;
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.video.volume = Math.min(1, this.video.volume + 0.1);
                this.volumeFill.style.width = `${this.video.volume * 100}%`;
                this.updateVolumeIcon();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.video.volume = Math.max(0, this.video.volume - 0.1);
                this.volumeFill.style.width = `${this.video.volume * 100}%`;
                this.updateVolumeIcon();
                break;
        }
    }
    
    showControls() {
        this.controls.style.opacity = '1';
        clearTimeout(this.controlsTimeout);
        
        if (this.isPlaying) {
            this.controlsTimeout = setTimeout(() => {
                this.controls.style.opacity = '0';
            }, 3000);
        }
    }
    
    hideControls() {
        if (this.isPlaying) {
            this.controls.style.opacity = '0';
        }
    }
    
    videoEnded() {
        this.playBtn.textContent = '▶️';
        this.isPlaying = false;
        this.controls.style.opacity = '1';
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new VideoPlayer();
});