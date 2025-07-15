class VoiceRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordings = JSON.parse(localStorage.getItem('recordings') || '[]');
        this.isRecording = false;
        this.startTime = 0;
        this.timerInterval = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.renderRecordings();
    }
    
    initializeElements() {
        this.recordBtn = document.getElementById('record-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.playBtn = document.getElementById('play-btn');
        this.timer = document.getElementById('timer');
        this.visualizer = document.getElementById('visualizer');
        this.recordingsList = document.getElementById('recordings');
    }
    
    setupEventListeners() {
        this.recordBtn.addEventListener('click', () => this.startRecording());
        this.stopBtn.addEventListener('click', () => this.stopRecording());
        this.playBtn.addEventListener('click', () => this.playLastRecording());
    }
    
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (e) => {
                this.audioChunks.push(e.data);
            };
            
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                
                const recording = {
                    id: Date.now(),
                    url: audioUrl,
                    duration: this.formatTime(Date.now() - this.startTime),
                    timestamp: new Date().toLocaleString()
                };
                
                this.recordings.unshift(recording);
                localStorage.setItem('recordings', JSON.stringify(this.recordings));
                this.renderRecordings();
                
                this.playBtn.disabled = false;
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.startTime = Date.now();
            
            this.recordBtn.disabled = true;
            this.stopBtn.disabled = false;
            
            this.startTimer();
            this.startVisualizer();
            
        } catch (error) {
            alert('マイクへのアクセスが許可されていません');
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            this.recordBtn.disabled = false;
            this.stopBtn.disabled = true;
            
            this.stopTimer();
            this.stopVisualizer();
        }
    }
    
    playLastRecording() {
        if (this.recordings.length > 0) {
            const audio = new Audio(this.recordings[0].url);
            audio.play();
        }
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            this.timer.textContent = this.formatTime(elapsed);
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    startVisualizer() {
        this.visualizer.innerHTML = '<div style="color: #ff6b6b; font-size: 1.5rem; animation: pulse 1s infinite;">🎙️ 録音中...</div>';
    }
    
    stopVisualizer() {
        this.visualizer.innerHTML = '<div style="color: #666;">録音停止</div>';
    }
    
    renderRecordings() {
        this.recordingsList.innerHTML = '';
        
        this.recordings.forEach((recording, index) => {
            const item = document.createElement('div');
            item.className = 'recording-item';
            
            item.innerHTML = `
                <div>
                    <strong>Recording ${index + 1}</strong><br>
                    <small>${recording.timestamp} • ${recording.duration}</small>
                </div>
                <div class="recording-controls">
                    <button class="play-recording" onclick="voiceRecorder.playRecording(${recording.id})">▶️ Play</button>
                    <button class="delete-recording" onclick="voiceRecorder.deleteRecording(${recording.id})">🗑️ Delete</button>
                </div>
            `;
            
            this.recordingsList.appendChild(item);
        });
    }
    
    playRecording(id) {
        const recording = this.recordings.find(r => r.id === id);
        if (recording) {
            const audio = new Audio(recording.url);
            audio.play();
        }
    }
    
    deleteRecording(id) {
        if (confirm('この録音を削除しますか？')) {
            this.recordings = this.recordings.filter(r => r.id !== id);
            localStorage.setItem('recordings', JSON.stringify(this.recordings));
            this.renderRecordings();
        }
    }
}

let voiceRecorder;
document.addEventListener('DOMContentLoaded', () => {
    voiceRecorder = new VoiceRecorder();
});"