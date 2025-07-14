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
            this.audioChunks = [];\n            \n            this.mediaRecorder.ondataavailable = (e) => {\n                this.audioChunks.push(e.data);\n            };\n            \n            this.mediaRecorder.onstop = () => {\n                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });\n                const audioUrl = URL.createObjectURL(audioBlob);\n                \n                const recording = {\n                    id: Date.now(),\n                    url: audioUrl,\n                    duration: this.formatTime(Date.now() - this.startTime),\n                    timestamp: new Date().toLocaleString()\n                };\n                \n                this.recordings.unshift(recording);\n                localStorage.setItem('recordings', JSON.stringify(this.recordings));\n                this.renderRecordings();\n                \n                this.playBtn.disabled = false;\n            };\n            \n            this.mediaRecorder.start();\n            this.isRecording = true;\n            this.startTime = Date.now();\n            \n            this.recordBtn.disabled = true;\n            this.stopBtn.disabled = false;\n            \n            this.startTimer();\n            this.startVisualizer();\n            \n        } catch (error) {\n            alert('マイクへのアクセスが許可されていません');\n        }\n    }\n    \n    stopRecording() {\n        if (this.mediaRecorder && this.isRecording) {\n            this.mediaRecorder.stop();\n            this.isRecording = false;\n            \n            this.recordBtn.disabled = false;\n            this.stopBtn.disabled = true;\n            \n            this.stopTimer();\n            this.stopVisualizer();\n        }\n    }\n    \n    playLastRecording() {\n        if (this.recordings.length > 0) {\n            const audio = new Audio(this.recordings[0].url);\n            audio.play();\n        }\n    }\n    \n    startTimer() {\n        this.timerInterval = setInterval(() => {\n            const elapsed = Date.now() - this.startTime;\n            this.timer.textContent = this.formatTime(elapsed);\n        }, 1000);\n    }\n    \n    stopTimer() {\n        if (this.timerInterval) {\n            clearInterval(this.timerInterval);\n            this.timerInterval = null;\n        }\n    }\n    \n    formatTime(ms) {\n        const seconds = Math.floor(ms / 1000);\n        const minutes = Math.floor(seconds / 60);\n        const secs = seconds % 60;\n        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;\n    }\n    \n    startVisualizer() {\n        this.visualizer.innerHTML = '<div style=\"color: #ff6b6b; font-size: 1.5rem; animation: pulse 1s infinite;\">🎙️ 録音中...</div>';\n    }\n    \n    stopVisualizer() {\n        this.visualizer.innerHTML = '<div style=\"color: #666;\">録音停止</div>';\n    }\n    \n    renderRecordings() {\n        this.recordingsList.innerHTML = '';\n        \n        this.recordings.forEach((recording, index) => {\n            const item = document.createElement('div');\n            item.className = 'recording-item';\n            \n            item.innerHTML = `\n                <div>\n                    <strong>Recording ${index + 1}</strong><br>\n                    <small>${recording.timestamp} • ${recording.duration}</small>\n                </div>\n                <div class=\"recording-controls\">\n                    <button class=\"play-recording\" onclick=\"voiceRecorder.playRecording(${recording.id})\">▶️ Play</button>\n                    <button class=\"delete-recording\" onclick=\"voiceRecorder.deleteRecording(${recording.id})\">🗑️ Delete</button>\n                </div>\n            `;\n            \n            this.recordingsList.appendChild(item);\n        });\n    }\n    \n    playRecording(id) {\n        const recording = this.recordings.find(r => r.id === id);\n        if (recording) {\n            const audio = new Audio(recording.url);\n            audio.play();\n        }\n    }\n    \n    deleteRecording(id) {\n        if (confirm('この録音を削除しますか？')) {\n            this.recordings = this.recordings.filter(r => r.id !== id);\n            localStorage.setItem('recordings', JSON.stringify(this.recordings));\n            this.renderRecordings();\n        }\n    }\n}\n\nlet voiceRecorder;\ndocument.addEventListener('DOMContentLoaded', () => {\n    voiceRecorder = new VoiceRecorder();\n});"