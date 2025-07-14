class AudioEditor {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.source = null;
        this.gainNode = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseTime = 0;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupAudioContext();
    }
    
    initializeElements() {
        this.fileInput = document.getElementById('file-input');
        this.playBtn = document.getElementById('play-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.recordBtn = document.getElementById('record-btn');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeValue = document.getElementById('volume-value');
        this.waveform = document.getElementById('waveform');
        this.playhead = document.getElementById('playhead');
        this.currentTimeEl = document.getElementById('current-time');
        this.durationEl = document.getElementById('duration');
        this.progressBar = document.getElementById('progress-bar');
        this.progressFill = document.getElementById('progress-fill');
        this.uploadArea = document.getElementById('upload-area');
        
        // Effects
        this.reverbSlider = document.getElementById('reverb-slider');
        this.echoSlider = document.getElementById('echo-slider');
        this.distortionSlider = document.getElementById('distortion-slider');
        this.reverbValue = document.getElementById('reverb-value');
        this.echoValue = document.getElementById('echo-value');
        this.distortionValue = document.getElementById('distortion-value');
        this.applyEffectsBtn = document.getElementById('apply-effects');
        
        this.ctx = this.waveform.getContext('2d');
    }
    
    setupEventListeners() {
        this.fileInput.addEventListener('change', (e) => this.loadAudio(e.target.files[0]));
        this.playBtn.addEventListener('click', () => this.play());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.recordBtn.addEventListener('click', () => this.record());
        
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        
        // Effects
        this.reverbSlider.addEventListener('input', (e) => this.updateEffectValue('reverb', e.target.value));
        this.echoSlider.addEventListener('input', (e) => this.updateEffectValue('echo', e.target.value));
        this.distortionSlider.addEventListener('input', (e) => this.updateEffectValue('distortion', e.target.value));
        this.applyEffectsBtn.addEventListener('click', () => this.applyEffects());
        
        // Drag and drop
        this.setupDragAndDrop();
    }
    
    setupAudioContext() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
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
                this.loadAudio(files[0]);
            }
        });
    }
    
    async loadAudio(file) {
        if (!file) return;
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.drawWaveform();
            this.updateDuration();
            this.uploadArea.classList.add('hidden');
            
        } catch (error) {
            console.error('Error loading audio:', error);
            alert('Error loading audio file. Please try a different file.');
        }
    }
    
    drawWaveform() {
        const canvas = this.waveform;
        const ctx = this.ctx;
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        if (!this.audioBuffer) return;
        
        const data = this.audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / width);
        const amp = height / 2;
        
        ctx.fillStyle = '#667eea';
        ctx.beginPath();
        
        for (let i = 0; i < width; i++) {
            let min = 1.0;
            let max = -1.0;
            
            for (let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }
            
            ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
        }
    }
    
    play() {
        if (!this.audioBuffer) return;
        
        if (this.isPlaying) return;
        
        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.audioBuffer;
        this.source.connect(this.gainNode);
        
        this.startTime = this.audioContext.currentTime - this.pauseTime;
        this.source.start(0, this.pauseTime);
        this.isPlaying = true;
        
        this.source.onended = () => {
            this.isPlaying = false;
            this.pauseTime = 0;
            this.updateProgress();
        };
        
        this.updateProgress();
    }
    
    pause() {
        if (!this.isPlaying) return;
        
        this.source.stop();
        this.pauseTime = this.audioContext.currentTime - this.startTime;
        this.isPlaying = false;
    }
    
    stop() {
        if (this.source) {
            this.source.stop();
        }
        this.isPlaying = false;
        this.pauseTime = 0;
        this.updateProgress();
    }
    
    setVolume(value) {
        const volume = value / 100;
        this.gainNode.gain.value = volume;
        this.volumeValue.textContent = `${value}%`;
    }
    
    seek(e) {
        if (!this.audioBuffer) return;
        
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        
        this.pauseTime = percentage * this.audioBuffer.duration;
        
        if (this.isPlaying) {
            this.source.stop();
            this.play();
        }
        
        this.updateProgress();
    }
    
    updateProgress() {
        if (!this.audioBuffer) return;
        
        const currentTime = this.isPlaying ? 
            this.audioContext.currentTime - this.startTime : 
            this.pauseTime;
        
        const progress = (currentTime / this.audioBuffer.duration) * 100;
        this.progressFill.style.width = `${Math.min(100, progress)}%`;
        this.currentTimeEl.textContent = this.formatTime(currentTime);
        
        if (this.isPlaying) {
            requestAnimationFrame(() => this.updateProgress());
        }
    }
    
    updateDuration() {
        if (this.audioBuffer) {
            this.durationEl.textContent = this.formatTime(this.audioBuffer.duration);
        }
    }
    
    updateEffectValue(effect, value) {
        document.getElementById(`${effect}-value`).textContent = `${value}%`;
    }
    
    applyEffects() {
        // This is a simplified example. In a real audio editor, you would apply actual audio effects
        const reverb = this.reverbSlider.value;
        const echo = this.echoSlider.value;
        const distortion = this.distortionSlider.value;
        
        alert(`Effects applied:\\nReverb: ${reverb}%\\nEcho: ${echo}%\\nDistortion: ${distortion}%\\n\\nIn a real audio editor, these effects would be applied to the audio buffer.`);
    }
    
    async record() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];
            
            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };
            
            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                const arrayBuffer = await blob.arrayBuffer();
                this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                
                this.drawWaveform();
                this.updateDuration();
                this.uploadArea.classList.add('hidden');
                
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.start();
            this.recordBtn.textContent = '⏹️ Stop Recording';
            this.recordBtn.style.background = '#ff6b6b';
            
            this.recordBtn.onclick = () => {
                mediaRecorder.stop();
                this.recordBtn.textContent = '🎙️ Record';
                this.recordBtn.style.background = '';
                this.recordBtn.onclick = () => this.record();
            };
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Error accessing microphone. Please ensure you have granted permission.');
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AudioEditor();
});