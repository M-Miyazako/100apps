class WebRTCChat {
    constructor() {
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.dataChannel = null;
        this.isConnected = false;
        this.username = '';
        this.roomId = '';
        this.isVideoEnabled = true;
        this.isAudioEnabled = true;
        this.isScreenSharing = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStatus('Ready to connect');
    }

    bindEvents() {
        // Connection events
        document.getElementById('connect-btn').addEventListener('click', () => this.initializeConnection());
        document.getElementById('create-room-btn').addEventListener('click', () => this.createRoom());
        document.getElementById('join-room-btn').addEventListener('click', () => this.joinRoom());
        
        // Control events
        document.getElementById('toggle-video').addEventListener('click', () => this.toggleVideo());
        document.getElementById('toggle-audio').addEventListener('click', () => this.toggleAudio());
        document.getElementById('screen-share').addEventListener('click', () => this.toggleScreenShare());
        document.getElementById('disconnect-btn').addEventListener('click', () => this.disconnect());
        
        // Chat events
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Username input
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.initializeConnection();
            }
        });
        
        // Room ID input
        document.getElementById('room-id').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.joinRoom();
            }
        });
    }

    async initializeConnection() {
        const usernameInput = document.getElementById('username');
        this.username = usernameInput.value.trim();
        
        if (!this.username) {
            this.updateStatus('Please enter your name', 'error');
            return;
        }
        
        try {
            this.updateStatus('Accessing camera and microphone...');
            await this.getUserMedia();
            this.updateStatus('Media access granted. Create or join a room.', 'connected');
        } catch (error) {
            this.updateStatus('Failed to access camera/microphone: ' + error.message, 'error');
        }
    }

    async getUserMedia() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });
            
            const localVideo = document.getElementById('local-video');
            localVideo.srcObject = this.localStream;
            
            this.updateControlButtons();
        } catch (error) {
            throw new Error('Could not access camera or microphone');
        }
    }

    createRoom() {
        if (!this.localStream) {
            this.updateStatus('Please connect first', 'error');
            return;
        }
        
        this.roomId = this.generateRoomId();
        document.getElementById('room-id').value = this.roomId;
        this.showChatSection();
        this.setupPeerConnection();
        this.updateStatus(`Room created: ${this.roomId}. Share this ID with others to join.`, 'connected');
    }

    async joinRoom() {
        if (!this.localStream) {
            this.updateStatus('Please connect first', 'error');
            return;
        }
        
        const roomInput = document.getElementById('room-id');
        this.roomId = roomInput.value.trim();
        
        if (!this.roomId) {
            this.updateStatus('Please enter a room ID', 'error');
            return;
        }
        
        this.showChatSection();
        this.setupPeerConnection();
        this.updateStatus(`Joining room: ${this.roomId}...`);
        
        // In a real implementation, you would connect to a signaling server here
        // For this demo, we'll simulate the connection process
        setTimeout(() => {
            this.updateStatus(`Connected to room: ${this.roomId}`, 'connected');
            this.addChatMessage('System', 'You joined the room');
        }, 1000);
    }

    setupPeerConnection() {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        this.peerConnection = new RTCPeerConnection(configuration);
        
        // Add local stream tracks
        this.localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, this.localStream);
        });
        
        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            const remoteVideo = document.getElementById('remote-video');
            if (event.streams && event.streams[0]) {
                remoteVideo.srcObject = event.streams[0];
                this.remoteStream = event.streams[0];
            }
        };
        
        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // In a real implementation, send this to the signaling server
                console.log('ICE candidate:', event.candidate);
            }
        };
        
        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection.connectionState;
            if (state === 'connected') {
                this.isConnected = true;
                this.updateStatus('Connected to peer', 'connected');
            } else if (state === 'disconnected' || state === 'failed') {
                this.isConnected = false;
                this.updateStatus('Disconnected from peer', 'error');
            }
        };
        
        // Setup data channel for chat
        this.dataChannel = this.peerConnection.createDataChannel('chat');
        this.dataChannel.onopen = () => {
            console.log('Data channel opened');
        };
        
        this.dataChannel.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.addChatMessage(message.sender, message.text);
        };
        
        // Handle incoming data channel
        this.peerConnection.ondatachannel = (event) => {
            const channel = event.channel;
            channel.onmessage = (event) => {
                const message = JSON.parse(event.data);
                this.addChatMessage(message.sender, message.text);
            };
        };
    }

    async toggleVideo() {
        if (!this.localStream) return;
        
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
            this.isVideoEnabled = !this.isVideoEnabled;
            videoTrack.enabled = this.isVideoEnabled;
            this.updateControlButtons();
        }
    }

    async toggleAudio() {
        if (!this.localStream) return;
        
        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
            this.isAudioEnabled = !this.isAudioEnabled;
            audioTrack.enabled = this.isAudioEnabled;
            this.updateControlButtons();
        }
    }

    async toggleScreenShare() {
        if (!this.isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });
                
                // Replace video track with screen share
                const videoTrack = screenStream.getVideoTracks()[0];
                const sender = this.peerConnection.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                
                if (sender) {
                    await sender.replaceTrack(videoTrack);
                }
                
                // Update local video
                const localVideo = document.getElementById('local-video');
                localVideo.srcObject = screenStream;
                
                this.isScreenSharing = true;
                this.updateControlButtons();
                
                // Handle screen share end
                videoTrack.onended = () => {
                    this.stopScreenShare();
                };
                
            } catch (error) {
                this.updateStatus('Screen sharing failed: ' + error.message, 'error');
            }
        } else {
            this.stopScreenShare();
        }
    }

    async stopScreenShare() {
        if (!this.localStream) return;
        
        const videoTrack = this.localStream.getVideoTracks()[0];
        const sender = this.peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
        );
        
        if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack);
        }
        
        // Restore local video
        const localVideo = document.getElementById('local-video');
        localVideo.srcObject = this.localStream;
        
        this.isScreenSharing = false;
        this.updateControlButtons();
    }

    sendMessage() {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            const messageData = {
                sender: this.username,
                text: message,
                timestamp: new Date().toISOString()
            };
            
            this.dataChannel.send(JSON.stringify(messageData));
            this.addChatMessage(this.username, message, true);
        } else {
            // Fallback for demo - add message locally
            this.addChatMessage(this.username, message, true);
        }
        
        messageInput.value = '';
    }

    addChatMessage(sender, text, isOwn = false) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwn ? 'own' : 'other'}`;
        
        const time = new Date().toLocaleTimeString();
        messageDiv.innerHTML = `
            <div class="message-author">${sender}</div>
            <div class="message-text">${text}</div>
            <div class="message-time">${time}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    updateControlButtons() {
        const videoBtn = document.getElementById('toggle-video');
        const audioBtn = document.getElementById('toggle-audio');
        const screenBtn = document.getElementById('screen-share');
        
        videoBtn.className = `control-btn ${this.isVideoEnabled ? 'active' : 'inactive'}`;
        audioBtn.className = `control-btn ${this.isAudioEnabled ? 'active' : 'inactive'}`;
        screenBtn.className = `control-btn ${this.isScreenSharing ? 'active' : ''}`;
    }

    showChatSection() {
        document.getElementById('chat-section').style.display = 'block';
        document.querySelector('.connection-section').style.display = 'none';
        
        // Show room ID
        const roomDisplay = document.createElement('div');
        roomDisplay.className = 'room-id-display';
        roomDisplay.innerHTML = `<strong>Room ID:</strong> ${this.roomId}`;
        document.querySelector('.container').insertBefore(roomDisplay, document.getElementById('chat-section'));
    }

    disconnect() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }
        
        // Reset UI
        document.getElementById('chat-section').style.display = 'none';
        document.querySelector('.connection-section').style.display = 'block';
        document.getElementById('local-video').srcObject = null;
        document.getElementById('remote-video').srcObject = null;
        document.getElementById('chat-messages').innerHTML = '';
        
        // Remove room ID display
        const roomDisplay = document.querySelector('.room-id-display');
        if (roomDisplay) {
            roomDisplay.remove();
        }
        
        this.isConnected = false;
        this.isVideoEnabled = true;
        this.isAudioEnabled = true;
        this.isScreenSharing = false;
        
        this.updateStatus('Disconnected. Ready to connect again.');
    }

    updateStatus(message, type = '') {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
    }

    generateRoomId() {
        return Math.random().toString(36).substr(2, 9).toUpperCase();
    }
}

// Initialize the WebRTC Chat when the page loads
document.addEventListener('DOMContentLoaded', function() {
    window.webrtcChat = new WebRTCChat();
});
