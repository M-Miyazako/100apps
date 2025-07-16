document.addEventListener('DOMContentLoaded', function() {
    console.log('会議ツールが正常に初期化されました！');
    
    // App state
    let currentRoom = null;
    let localStream = null;
    let participants = [];
    let isVideoEnabled = true;
    let isAudioEnabled = true;
    let isScreenSharing = false;
    let sidebarOpen = false;
    let currentTab = 'chat';
    let chatMessages = [];
    
    // DOM elements
    const joinSection = document.getElementById('joinSection');
    const conferenceRoom = document.getElementById('conferenceRoom');
    const roomIdInput = document.getElementById('roomId');
    const userNameInput = document.getElementById('userName');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const createRoomBtn = document.getElementById('createRoomBtn');
    const currentRoomIdSpan = document.getElementById('currentRoomId');
    const participantCountSpan = document.getElementById('participantCount');
    const localVideo = document.getElementById('localVideo');
    const videoGrid = document.getElementById('videoGrid');
    const toggleVideoBtn = document.getElementById('toggleVideoBtn');
    const toggleAudioBtn = document.getElementById('toggleAudioBtn');
    const screenShareBtn = document.getElementById('screenShareBtn');
    const chatBtn = document.getElementById('chatBtn');
    const participantsBtn = document.getElementById('participantsBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const inviteBtn = document.getElementById('inviteBtn');
    const leaveRoomBtn = document.getElementById('leaveRoomBtn');
    const sidebar = document.getElementById('sidebar');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const participantsList = document.getElementById('participantsList');
    const inviteModal = document.getElementById('inviteModal');
    const inviteCode = document.getElementById('inviteCode');
    const inviteLink = document.getElementById('inviteLink');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const closeInviteBtn = document.getElementById('closeInviteBtn');
    const notification = document.getElementById('notification');
    
    // Initialize
    function init() {
        setupEventListeners();
        loadMediaDevices();
        
        // Check if room ID is in URL
        const urlParams = new URLSearchParams(window.location.search);
        const roomFromUrl = urlParams.get('room');
        if (roomFromUrl) {
            roomIdInput.value = roomFromUrl;
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Join room
        joinRoomBtn.addEventListener('click', joinRoom);
        createRoomBtn.addEventListener('click', createRoom);
        
        // Room controls
        inviteBtn.addEventListener('click', showInviteModal);
        leaveRoomBtn.addEventListener('click', leaveRoom);
        
        // Media controls
        toggleVideoBtn.addEventListener('click', toggleVideo);
        toggleAudioBtn.addEventListener('click', toggleAudio);
        screenShareBtn.addEventListener('click', toggleScreenShare);
        
        // Sidebar controls
        chatBtn.addEventListener('click', () => toggleSidebar('chat'));
        participantsBtn.addEventListener('click', () => toggleSidebar('participants'));
        settingsBtn.addEventListener('click', () => toggleSidebar('settings'));
        
        // Chat
        sendMessageBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Invite modal
        copyCodeBtn.addEventListener('click', () => copyToClipboard(inviteCode.value));
        copyLinkBtn.addEventListener('click', () => copyToClipboard(inviteLink.value));
        closeInviteBtn.addEventListener('click', hideInviteModal);
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                switchTab(e.target.dataset.tab);
            });
        });
        
        // Enter key for room joining
        roomIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                joinRoom();
            }
        });
        
        userNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                joinRoom();
            }
        });
    }
    
    // Create room
    function createRoom() {
        const roomId = generateRoomId();
        const userName = userNameInput.value.trim() || 'Anonymous';
        
        joinRoomWithId(roomId, userName);
    }
    
    // Join room
    function joinRoom() {
        const roomId = roomIdInput.value.trim();
        const userName = userNameInput.value.trim() || 'Anonymous';
        
        if (!roomId) {
            showNotification('ルームIDを入力してください', 'error');
            return;
        }
        
        joinRoomWithId(roomId, userName);
    }
    
    // Join room with ID
    async function joinRoomWithId(roomId, userName) {
        try {
            showNotification('ルームに参加中...');
            
            // Initialize local media
            await initLocalMedia();
            
            // Set room state
            currentRoom = { id: roomId, name: userName };
            currentRoomIdSpan.textContent = roomId;
            
            // Add self to participants
            participants = [{
                id: 'local',
                name: userName,
                isLocal: true,
                videoEnabled: isVideoEnabled,
                audioEnabled: isAudioEnabled
            }];
            
            // Switch to conference room
            joinSection.style.display = 'none';
            conferenceRoom.style.display = 'block';
            
            // Update UI
            updateParticipantsList();
            updateParticipantCount();
            
            // Simulate adding remote participants after a delay
            setTimeout(() => {
                addSimulatedParticipants();
            }, 2000);
            
            showNotification('ルームに正常に参加しました！');
            
        } catch (error) {
            console.error('ルーム参加エラー:', error);
            showNotification('ルームの参加に失敗しました', 'error');
        }
    }
    
    // Initialize local media
    async function initLocalMedia() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            localVideo.srcObject = localStream;
            
        } catch (error) {
            console.error('メディアデバイスアクセスエラー:', error);
            showNotification('カメラ/マイクにアクセスできませんでした', 'error');
            
            // Create a black video as fallback
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const stream = canvas.captureStream();
            localVideo.srcObject = stream;
            localStream = stream;
        }
    }
    
    // Add simulated participants
    function addSimulatedParticipants() {
        const simulatedParticipants = [
            { id: 'user1', name: '田中太郎', videoEnabled: true, audioEnabled: true },
            { id: 'user2', name: '佐藤花子', videoEnabled: true, audioEnabled: false },
            { id: 'user3', name: '鈴木一郎', videoEnabled: false, audioEnabled: true }
        ];
        
        simulatedParticipants.forEach((participant, index) => {
            setTimeout(() => {
                participants.push(participant);
                addParticipantVideo(participant);
                updateParticipantsList();
                updateParticipantCount();
                
                // Add join message
                addChatMessage('システム', `${participant.name}がルームに参加しました`);
            }, index * 1000);
        });
    }
    
    // Add participant video
    function addParticipantVideo(participant) {
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        videoContainer.id = `video-${participant.id}`;
        
        const video = document.createElement('video');
        video.autoplay = true;
        video.muted = true;
        
        // Create simulated video stream
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        // Create a colored background for each participant
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        function drawFrame() {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add participant name
            ctx.fillStyle = 'white';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(participant.name, canvas.width / 2, canvas.height / 2);
            
            requestAnimationFrame(drawFrame);
        }
        
        if (participant.videoEnabled) {
            drawFrame();
            video.srcObject = canvas.captureStream();
        } else {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            video.srcObject = canvas.captureStream();
        }
        
        const label = document.createElement('div');
        label.className = 'video-label';
        label.textContent = participant.name;
        
        const controls = document.createElement('div');
        controls.className = 'video-controls';
        
        const videoBtn = document.createElement('button');
        videoBtn.className = `control-btn ${participant.videoEnabled ? '' : 'muted'}`;
        videoBtn.textContent = participant.videoEnabled ? '📹' : '📹';
        
        const audioBtn = document.createElement('button');
        audioBtn.className = `control-btn ${participant.audioEnabled ? '' : 'muted'}`;
        audioBtn.textContent = participant.audioEnabled ? '🎤' : '🎤';
        
        controls.appendChild(videoBtn);
        controls.appendChild(audioBtn);
        
        videoContainer.appendChild(video);
        videoContainer.appendChild(label);
        videoContainer.appendChild(controls);
        
        videoGrid.appendChild(videoContainer);
    }
    
    // Toggle video
    function toggleVideo() {
        isVideoEnabled = !isVideoEnabled;
        
        if (localStream) {
            const videoTracks = localStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = isVideoEnabled;
            });
        }
        
        toggleVideoBtn.classList.toggle('muted', !isVideoEnabled);
        
        // Update participant status
        const localParticipant = participants.find(p => p.id === 'local');
        if (localParticipant) {
            localParticipant.videoEnabled = isVideoEnabled;
            updateParticipantsList();
        }
        
        showNotification(isVideoEnabled ? 'ビデオが有効になりました' : 'ビデオが無効になりました');
    }
    
    // Toggle audio
    function toggleAudio() {
        isAudioEnabled = !isAudioEnabled;
        
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = isAudioEnabled;
            });
        }
        
        toggleAudioBtn.classList.toggle('muted', !isAudioEnabled);
        
        // Update participant status
        const localParticipant = participants.find(p => p.id === 'local');
        if (localParticipant) {
            localParticipant.audioEnabled = isAudioEnabled;
            updateParticipantsList();
        }
        
        showNotification(isAudioEnabled ? 'オーディオが有効になりました' : 'オーディオが無効になりました');
    }
    
    // Toggle screen share
    async function toggleScreenShare() {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });
                
                // Replace video track
                if (localStream) {
                    const videoTrack = screenStream.getVideoTracks()[0];
                    const sender = localStream.getVideoTracks()[0];
                    
                    localVideo.srcObject = screenStream;
                    isScreenSharing = true;
                    screenShareBtn.classList.add('active');
                    
                    // Handle screen share end
                    videoTrack.onended = () => {
                        stopScreenShare();
                    };
                    
                    showNotification('画面共有を開始しました');
                }
            } catch (error) {
                console.error('画面共有開始エラー:', error);
                showNotification('画面共有を開始できませんでした', 'error');
            }
        } else {
            stopScreenShare();
        }
    }
    
    // Stop screen share
    function stopScreenShare() {
        if (isScreenSharing) {
            // Restore camera stream
            initLocalMedia();
            isScreenSharing = false;
            screenShareBtn.classList.remove('active');
            showNotification('画面共有を停止しました');
        }
    }
    
    // Toggle sidebar
    function toggleSidebar(tab) {
        if (sidebarOpen && currentTab === tab) {
            sidebar.classList.remove('open');
            sidebarOpen = false;
        } else {
            sidebar.classList.add('open');
            sidebarOpen = true;
            switchTab(tab);
        }
    }
    
    // Switch tab
    function switchTab(tab) {
        currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tab + 'Tab');
        });
        
        // Update control buttons
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (tab === 'chat') {
            chatBtn.classList.add('active');
        } else if (tab === 'participants') {
            participantsBtn.classList.add('active');
        } else if (tab === 'settings') {
            settingsBtn.classList.add('active');
        }
    }
    
    // Send message
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;
        
        const userName = currentRoom ? currentRoom.name : 'Anonymous';
        addChatMessage(userName, message);
        messageInput.value = '';
    }
    
    // Add chat message
    function addChatMessage(sender, message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message';
        
        const time = new Date().toLocaleTimeString();
        messageEl.innerHTML = `
            <div class="sender">${sender}</div>
            <div class="time">${time}</div>
            <div class="message">${message}</div>
        `;
        
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Update participants list
    function updateParticipantsList() {
        participantsList.innerHTML = '';
        
        participants.forEach(participant => {
            const item = document.createElement('div');
            item.className = 'participant-item';
            
            const avatar = document.createElement('div');
            avatar.className = 'participant-avatar';
            avatar.textContent = participant.name.charAt(0).toUpperCase();
            
            const info = document.createElement('div');
            info.className = 'participant-info';
            
            const name = document.createElement('div');
            name.className = 'participant-name';
            name.textContent = participant.name + (participant.isLocal ? ' (あなた)' : '');
            
            const status = document.createElement('div');
            status.className = 'participant-status';
            const videoStatus = participant.videoEnabled ? '📹' : '📹❌';
            const audioStatus = participant.audioEnabled ? '🎤' : '🎤❌';
            status.textContent = `${videoStatus} ${audioStatus}`;
            
            info.appendChild(name);
            info.appendChild(status);
            
            item.appendChild(avatar);
            item.appendChild(info);
            
            participantsList.appendChild(item);
        });
    }
    
    // Update participant count
    function updateParticipantCount() {
        participantCountSpan.textContent = participants.length;
    }
    
    // Show invite modal
    function showInviteModal() {
        if (!currentRoom) return;
        
        inviteCode.value = currentRoom.id;
        inviteLink.value = `${window.location.origin}${window.location.pathname}?room=${currentRoom.id}`;
        
        inviteModal.style.display = 'flex';
    }
    
    // Hide invite modal
    function hideInviteModal() {
        inviteModal.style.display = 'none';
    }
    
    // Copy to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('クリップボードにコピーしました！');
        }).catch(() => {
            showNotification('クリップボードにコピーできませんでした', 'error');
        });
    }
    
    // Leave room
    function leaveRoom() {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        
        // Reset state
        currentRoom = null;
        participants = [];
        localStream = null;
        isVideoEnabled = true;
        isAudioEnabled = true;
        isScreenSharing = false;
        
        // Clear video grid
        videoGrid.innerHTML = `
            <div class="video-container local">
                <video id="localVideo" autoplay muted></video>
                <div class="video-label">あなた</div>
                <div class="video-controls">
                    <button id="toggleVideoBtn" class="control-btn">📹</button>
                    <button id="toggleAudioBtn" class="control-btn">🎤</button>
                </div>
            </div>
        `;
        
        // Clear chat
        chatMessages.innerHTML = '';
        
        // Close sidebar
        sidebar.classList.remove('open');
        sidebarOpen = false;
        
        // Switch back to join section
        conferenceRoom.style.display = 'none';
        joinSection.style.display = 'block';
        
        // Re-initialize event listeners for new elements
        init();
        
        showNotification('ルームを退室しました');
    }
    
    // Load media devices
    async function loadMediaDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            
            const micSelect = document.getElementById('micSelect');
            const speakerSelect = document.getElementById('speakerSelect');
            const cameraSelect = document.getElementById('cameraSelect');
            
            // Clear existing options
            micSelect.innerHTML = '';
            speakerSelect.innerHTML = '';
            cameraSelect.innerHTML = '';
            
            devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.textContent = device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`;
                
                if (device.kind === 'audioinput') {
                    micSelect.appendChild(option);
                } else if (device.kind === 'audiooutput') {
                    speakerSelect.appendChild(option);
                } else if (device.kind === 'videoinput') {
                    cameraSelect.appendChild(option);
                }
            });
            
        } catch (error) {
            console.error('メディアデバイス読み込みエラー:', error);
        }
    }
    
    // Generate room ID
    function generateRoomId() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    
    // Show notification
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Initialize app
    init();
});
