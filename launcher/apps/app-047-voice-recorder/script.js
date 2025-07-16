class VoiceRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordings = JSON.parse(localStorage.getItem('voiceRecordings') || '[]');
        this.isRecording = false;
        this.startTime = 0;
        this.timerInterval = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.renderRecordings();
        this.updateStats();
    }
    
    initializeElements() {
        this.elements = {
            recordBtn: document.getElementById('recordBtn'),
            stopBtn: document.getElementById('stopBtn'),
            playBtn: document.getElementById('playBtn'),
            timer: document.getElementById('timer'),
            visualizer: document.getElementById('visualizer'),
            recordingsList: document.getElementById('recordingsList'),
            clearAllBtn: document.getElementById('clearAllBtn'),
            exportBtn: document.getElementById('exportBtn'),
            totalRecordings: document.getElementById('totalRecordings'),
            totalDuration: document.getElementById('totalDuration'),
            recordingQuality: document.getElementById('recordingQuality'),
            volumeLevel: document.getElementById('volumeLevel'),
            status: document.getElementById('status')
        };
    }
    
    setupEventListeners() {
        this.elements.recordBtn.addEventListener('click', () => this.startRecording());
        this.elements.stopBtn.addEventListener('click', () => this.stopRecording());
        this.elements.playBtn.addEventListener('click', () => this.playLastRecording());
        this.elements.clearAllBtn.addEventListener('click', () => this.clearAllRecordings());
        this.elements.exportBtn.addEventListener('click', () => this.exportRecordings());
        
        // 録音品質設定
        this.elements.recordingQuality.addEventListener('change', () => {
            this.updateStatus('録音品質を変更しました');
        });
    }
    
    async startRecording() {
        try {
            this.updateStatus('マイクアクセスを要求中...');
            
            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: this.getSelectedSampleRate()
                }
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // AudioContext for visualization
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.analyser);
            
            this.analyser.fftSize = 256;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            // MediaRecorder setup
            const options = {
                mimeType: this.getSupportedMimeType(),
                audioBitsPerSecond: this.getSelectedBitrate()
            };
            
            this.mediaRecorder = new MediaRecorder(stream, options);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.saveRecording();
                stream.getTracks().forEach(track => track.stop());
                if (this.audioContext) {
                    this.audioContext.close();
                }
            };
            
            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            this.startTime = Date.now();
            
            this.updateUIForRecording();
            this.startTimer();
            this.startVisualizer();
            
            this.updateStatus('録音中...');
            
        } catch (error) {
            console.error('録音開始エラー:', error);
            this.updateStatus('マイクへのアクセスが拒否されました', 'error');
            alert('マイクへのアクセスが必要です。ブラウザの設定を確認してください。');
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            this.updateUIForStopped();
            this.stopTimer();
            this.stopVisualizer();
            
            this.updateStatus('録音を保存中...');
        }
    }
    
    saveRecording() {
        const audioBlob = new Blob(this.audioChunks, { 
            type: this.getSupportedMimeType() 
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        const duration = Date.now() - this.startTime;
        
        const recording = {
            id: Date.now(),
            url: audioUrl,
            blob: audioBlob,
            duration: duration,
            durationFormatted: this.formatTime(duration),
            timestamp: new Date().toISOString(),
            name: `録音 ${new Date().toLocaleString('ja-JP')}`,
            size: audioBlob.size,
            quality: this.elements.recordingQuality.value
        };
        
        this.recordings.unshift(recording);
        this.saveToLocalStorage();
        this.renderRecordings();
        this.updateStats();
        
        this.elements.playBtn.disabled = false;
        this.updateStatus(`録音完了！（${recording.durationFormatted}）`);
    }
    
    playLastRecording() {
        if (this.recordings.length > 0) {
            this.playRecording(this.recordings[0].id);
        }
    }
    
    playRecording(id) {
        const recording = this.recordings.find(r => r.id === id);
        if (recording) {
            const audio = new Audio(recording.url);
            audio.play().catch(error => {
                console.error('再生エラー:', error);
                this.updateStatus('音声の再生に失敗しました', 'error');
            });
            
            this.updateStatus(`再生中: ${recording.name}`);
        }
    }
    
    deleteRecording(id) {
        if (confirm('この録音を削除しますか？')) {
            const index = this.recordings.findIndex(r => r.id === id);
            if (index !== -1) {
                // URL.revokeObjectURL to free memory
                if (this.recordings[index].url) {
                    URL.revokeObjectURL(this.recordings[index].url);
                }
                
                this.recordings.splice(index, 1);
                this.saveToLocalStorage();
                this.renderRecordings();
                this.updateStats();
                
                this.updateStatus('録音を削除しました');
            }
        }
    }
    
    renameRecording(id, newName) {
        const recording = this.recordings.find(r => r.id === id);
        if (recording && newName.trim()) {
            recording.name = newName.trim();
            this.saveToLocalStorage();
            this.renderRecordings();
            this.updateStatus('録音名を変更しました');
        }
    }
    
    clearAllRecordings() {
        if (this.recordings.length === 0) {
            alert('削除する録音がありません');
            return;
        }
        
        if (confirm('すべての録音を削除しますか？この操作は元に戻せません。')) {
            // Free all URLs
            this.recordings.forEach(recording => {
                if (recording.url) {
                    URL.revokeObjectURL(recording.url);
                }
            });
            
            this.recordings = [];
            this.saveToLocalStorage();
            this.renderRecordings();
            this.updateStats();
            
            this.elements.playBtn.disabled = true;
            this.updateStatus('すべての録音を削除しました');
        }
    }
    
    exportRecordings() {
        if (this.recordings.length === 0) {
            alert('エクスポートする録音がありません');
            return;
        }
        
        // Create a zip-like structure info
        const exportData = {
            exportDate: new Date().toISOString(),
            recordingsCount: this.recordings.length,
            totalDuration: this.recordings.reduce((sum, r) => sum + r.duration, 0),
            recordings: this.recordings.map(r => ({
                id: r.id,
                name: r.name,
                duration: r.durationFormatted,
                timestamp: r.timestamp,
                size: r.size,
                quality: r.quality
            }))
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `voice-recordings-info-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.updateStatus('録音情報をエクスポートしました');
    }
    
    downloadRecording(id) {
        const recording = this.recordings.find(r => r.id === id);
        if (recording) {
            const link = document.createElement('a');
            link.href = recording.url;
            link.download = `${recording.name.replace(/[^a-z0-9]/gi, '_')}.webm`;
            link.click();
            
            this.updateStatus(`${recording.name}をダウンロードしました`);
        }
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            this.elements.timer.textContent = this.formatTime(elapsed);
        }, 100);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    startVisualizer() {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 100;
        this.elements.visualizer.innerHTML = '';
        this.elements.visualizer.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        const draw = () => {
            if (!this.isRecording) return;
            
            requestAnimationFrame(draw);
            
            this.analyser.getByteFrequencyData(this.dataArray);
            
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / this.dataArray.length) * 2.5;
            let barHeight;
            let x = 0;
            
            for (let i = 0; i < this.dataArray.length; i++) {
                barHeight = (this.dataArray[i] / 255) * canvas.height;
                
                const red = barHeight + 25 * (i / this.dataArray.length);
                const green = 250 * (i / this.dataArray.length);
                const blue = 50;
                
                ctx.fillStyle = `rgb(${red},${green},${blue})`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
            
            // Volume level
            const average = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
            this.elements.volumeLevel.style.width = `${(average / 255) * 100}%`;
        };
        
        draw();
    }
    
    stopVisualizer() {
        this.elements.visualizer.innerHTML = '<p style="color: #666; text-align: center; margin: 40px 0;">録音を開始すると音声の波形が表示されます</p>';
        this.elements.volumeLevel.style.width = '0%';
    }
    
    renderRecordings() {
        if (this.recordings.length === 0) {
            this.elements.recordingsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">録音がありません</p>';
            return;
        }
        
        this.elements.recordingsList.innerHTML = this.recordings
            .map(recording => `
                <div class="recording-item">
                    <div class="recording-info">
                        <h4 class="recording-name" onclick="voiceRecorder.editRecordingName(${recording.id})" title="クリックして名前を編集">
                            ${recording.name}
                        </h4>
                        <div class="recording-details">
                            <span>時間: ${recording.durationFormatted}</span>
                            <span>サイズ: ${this.formatFileSize(recording.size)}</span>
                            <span>品質: ${recording.quality}</span>
                            <span>日時: ${new Date(recording.timestamp).toLocaleString('ja-JP')}</span>
                        </div>
                    </div>
                    <div class="recording-controls">
                        <button onclick="voiceRecorder.playRecording(${recording.id})" class="play-btn">▶️ 再生</button>
                        <button onclick="voiceRecorder.downloadRecording(${recording.id})" class="download-btn">💾 保存</button>
                        <button onclick="voiceRecorder.deleteRecording(${recording.id})" class="delete-btn">🗑️ 削除</button>
                    </div>
                </div>
            `)
            .join('');
    }
    
    editRecordingName(id) {
        const recording = this.recordings.find(r => r.id === id);
        if (recording) {
            const newName = prompt('新しい名前を入力してください:', recording.name);
            if (newName !== null) {
                this.renameRecording(id, newName);
            }
        }
    }
    
    updateUIForRecording() {
        this.elements.recordBtn.disabled = true;
        this.elements.stopBtn.disabled = false;
        this.elements.recordBtn.textContent = '録音中...';
        this.elements.recordBtn.style.backgroundColor = '#ff6b6b';
    }
    
    updateUIForStopped() {
        this.elements.recordBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        this.elements.recordBtn.textContent = '🎤 録音開始';
        this.elements.recordBtn.style.backgroundColor = '';
    }
    
    updateStats() {
        this.elements.totalRecordings.textContent = this.recordings.length;
        
        const totalDuration = this.recordings.reduce((sum, r) => sum + r.duration, 0);
        this.elements.totalDuration.textContent = this.formatTime(totalDuration);
    }
    
    updateStatus(message, type = 'info') {
        this.elements.status.textContent = message;
        this.elements.status.className = `status ${type}`;
        
        // Auto clear status after 3 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                this.elements.status.textContent = '準備完了';
                this.elements.status.className = 'status';
            }, 3000);
        }
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/mpeg',
            'audio/wav'
        ];
        
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        
        return 'audio/webm'; // fallback
    }
    
    getSelectedSampleRate() {
        const quality = this.elements.recordingQuality.value;
        switch (quality) {
            case 'low': return 16000;
            case 'medium': return 22050;
            case 'high': return 44100;
            default: return 44100;
        }
    }
    
    getSelectedBitrate() {
        const quality = this.elements.recordingQuality.value;
        switch (quality) {
            case 'low': return 64000;
            case 'medium': return 128000;
            case 'high': return 256000;
            default: return 128000;
        }
    }
    
    saveToLocalStorage() {
        try {
            // Only save metadata, not the actual audio blobs
            const recordingsToSave = this.recordings.map(r => ({
                id: r.id,
                name: r.name,
                duration: r.duration,
                durationFormatted: r.durationFormatted,
                timestamp: r.timestamp,
                size: r.size,
                quality: r.quality
                // Note: url and blob are not saved to localStorage
            }));
            
            localStorage.setItem('voiceRecordings', JSON.stringify(recordingsToSave));
        } catch (error) {
            console.error('LocalStorage保存エラー:', error);
            this.updateStatus('データの保存に失敗しました', 'error');
        }
    }
}

// アプリ初期化
let voiceRecorder;
document.addEventListener('DOMContentLoaded', () => {
    // Check if browser supports required APIs
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('このブラウザは音声録音をサポートしていません。');
        return;
    }
    
    if (!window.MediaRecorder) {
        alert('このブラウザはMediaRecorder APIをサポートしていません。');
        return;
    }
    
    voiceRecorder = new VoiceRecorder();
});