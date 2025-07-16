class LiveStreamApp {
    constructor() {
        this.isStreaming = false;
        this.isCameraOn = false;
        this.isMicOn = false;
        this.stream = null;
        this.mediaRecorder = null;
        this.startTime = null;
        this.streamTimer = null;
        this.viewerCount = 0;
        this.chatMessages = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupUI();
        this.startStatsUpdate();
        this.simulateViewers();
    }

    bindEvents() {
        document.getElementById('startStreamBtn').addEventListener('click', () => this.startStream());
        document.getElementById('stopStreamBtn').addEventListener('click', () => this.stopStream());
        document.getElementById('toggleCameraBtn').addEventListener('click', () => this.toggleCamera());
        document.getElementById('toggleMicBtn').addEventListener('click', () => this.toggleMic());
        document.getElementById('sendChatBtn').addEventListener('click', () => this.sendChat());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChat();
        });
        document.getElementById('qualitySelect').addEventListener('change', (e) => this.changeQuality(e.target.value));
    }

    setupUI() {
        this.updateStreamStatus();
        this.updateButtons();
        this.displayWelcomeMessage();
    }

    async startStream() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: true
            });

            const video = document.getElementById('localVideo');
            video.srcObject = this.stream;
            
            this.isStreaming = true;
            this.isCameraOn = true;
            this.isMicOn = true;
            this.startTime = new Date();
            
            this.startStreamTimer();
            this.updateStreamStatus();
            this.updateButtons();
            this.startRecording();
            
            this.addChatMessage('System', '配信を開始しました！');
            this.showNotification('配信が開始されました', 'success');
            
        } catch (error) {
            console.error('Error starting stream:', error);
            this.showNotification('カメラまたはマイクへのアクセスが拒否されました', 'error');
        }
    }

    stopStream() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        
        const video = document.getElementById('localVideo');
        video.srcObject = null;
        
        this.isStreaming = false;
        this.isCameraOn = false;
        this.isMicOn = false;
        
        this.stopStreamTimer();
        this.updateStreamStatus();
        this.updateButtons();
        this.resetStats();
        
        this.addChatMessage('System', '配信を終了しました。');
        this.showNotification('配信が終了されました', 'info');
    }

    toggleCamera() {
        if (!this.stream) return;
        
        const videoTrack = this.stream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            this.isCameraOn = videoTrack.enabled;
            this.updateButtons();
            
            if (!this.isCameraOn) {
                this.showNoCameraMessage();
            } else {
                this.hideNoCameraMessage();
            }
        }
    }

    toggleMic() {
        if (!this.stream) return;
        
        const audioTrack = this.stream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            this.isMicOn = audioTrack.enabled;
            this.updateButtons();
        }
    }

    startRecording() {
        if (!this.stream) return;
        
        this.mediaRecorder = new MediaRecorder(this.stream);
        this.mediaRecorder.start();
        
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                // In a real app, this would be sent to a streaming server
                console.log('Recording data available:', event.data.size);
            }
        };
    }

    startStreamTimer() {
        this.streamTimer = setInterval(() => {
            if (this.startTime) {
                const elapsed = new Date() - this.startTime;
                const hours = Math.floor(elapsed / 3600000);
                const minutes = Math.floor((elapsed % 3600000) / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                
                const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                document.getElementById('streamTime').textContent = timeString;
            }
        }, 1000);
    }

    stopStreamTimer() {
        if (this.streamTimer) {
            clearInterval(this.streamTimer);
            this.streamTimer = null;
        }
    }

    updateStreamStatus() {
        const statusElement = document.getElementById('streamStatus');
        const viewerElement = document.getElementById('viewerCount');
        
        if (this.isStreaming) {
            statusElement.textContent = 'ライブ配信中';
            statusElement.className = 'status live';
        } else {
            statusElement.textContent = 'オフライン';
            statusElement.className = 'status offline';
        }
        
        viewerElement.textContent = `視聴者: ${this.viewerCount}`;
    }

    updateButtons() {
        const startBtn = document.getElementById('startStreamBtn');
        const stopBtn = document.getElementById('stopStreamBtn');
        const cameraBtn = document.getElementById('toggleCameraBtn');
        const micBtn = document.getElementById('toggleMicBtn');
        
        if (this.isStreaming) {
            startBtn.classList.add('disabled');
            stopBtn.classList.remove('disabled');
            stopBtn.classList.add('danger');
        } else {
            startBtn.classList.remove('disabled');
            stopBtn.classList.add('disabled');
            stopBtn.classList.remove('danger');
        }
        
        cameraBtn.textContent = this.isCameraOn ? 'カメラ OFF' : 'カメラ ON';
        micBtn.textContent = this.isMicOn ? 'マイク OFF' : 'マイク ON';
    }

    sendChat() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message) {
            this.addChatMessage('配信者', message);
            input.value = '';
            
            // Simulate viewer responses
            setTimeout(() => {
                this.simulateViewerChat();
            }, 1000 + Math.random() * 3000);
        }
    }

    addChatMessage(username, message) {
        const chatContainer = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        const timestamp = new Date().toLocaleTimeString();
        messageElement.innerHTML = `
            <span class="username">${username}</span>
            <span class="timestamp">${timestamp}</span>
            <div>${message}</div>
        `;
        
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        this.chatMessages.push({ username, message, timestamp });
    }

    simulateViewerChat() {
        const viewers = ['視聴者1', '視聴者2', '視聴者3', 'ファン', 'リスナー'];
        const messages = [
            'こんにちは！',
            '配信お疲れ様です',
            '面白いですね',
            'いいね！',
            'また見に来ます',
            '楽しい配信ありがとう',
            'フォローしました！'
        ];
        
        if (this.isStreaming && Math.random() < 0.3) {
            const randomViewer = viewers[Math.floor(Math.random() * viewers.length)];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            this.addChatMessage(randomViewer, randomMessage);
        }
    }

    simulateViewers() {
        setInterval(() => {
            if (this.isStreaming) {
                // Simulate viewer count changes
                const change = Math.floor(Math.random() * 5) - 2;
                this.viewerCount = Math.max(0, this.viewerCount + change);
                this.updateStreamStatus();
            } else {
                this.viewerCount = 0;
                this.updateStreamStatus();
            }
        }, 3000);
    }

    startStatsUpdate() {
        setInterval(() => {
            if (this.isStreaming) {
                // Simulate streaming stats
                const frameRate = 25 + Math.floor(Math.random() * 10);
                const bitRate = 2500 + Math.floor(Math.random() * 1000);
                const quality = document.getElementById('qualitySelect').value;
                
                document.getElementById('frameRate').textContent = `${frameRate} fps`;
                document.getElementById('bitRate').textContent = `${bitRate} kbps`;
                document.getElementById('resolution').textContent = this.getResolutionText(quality);
            }
        }, 1000);
    }

    getResolutionText(quality) {
        switch(quality) {
            case '480': return '854x480';
            case '720': return '1280x720';
            case '1080': return '1920x1080';
            default: return '1280x720';
        }
    }

    changeQuality(quality) {
        if (this.stream) {
            // In a real app, this would adjust the stream quality
            console.log('Changing quality to:', quality);
            this.showNotification(`画質を${quality}pに変更しました`, 'info');
        }
    }

    resetStats() {
        document.getElementById('streamTime').textContent = '00:00:00';
        document.getElementById('frameRate').textContent = '0 fps';
        document.getElementById('bitRate').textContent = '0 kbps';
        document.getElementById('resolution').textContent = '0x0';
    }

    showNoCameraMessage() {
        const videoContainer = document.querySelector('.video-container');
        const existingMessage = videoContainer.querySelector('.no-camera-message');
        
        if (!existingMessage) {
            const message = document.createElement('div');
            message.className = 'no-camera-message';
            message.textContent = 'カメラがオフになっています';
            videoContainer.appendChild(message);
        }
    }

    hideNoCameraMessage() {
        const message = document.querySelector('.no-camera-message');
        if (message) {
            message.remove();
        }
    }

    displayWelcomeMessage() {
        this.addChatMessage('System', 'ライブ配信アプリへようこそ！配信を開始するには「配信開始」ボタンをクリックしてください。');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        `;
        
        switch(type) {
            case 'success':
                notification.style.background = '#28a745';
                break;
            case 'error':
                notification.style.background = '#dc3545';
                break;
            case 'info':
                notification.style.background = '#17a2b8';
                break;
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    new LiveStreamApp();
});
