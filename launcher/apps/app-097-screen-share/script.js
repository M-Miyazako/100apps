document.addEventListener('DOMContentLoaded', function() {
    console.log('Screen Share App initialized successfully!');
    
    // App state
    let isSharing = false;
    let isPaused = false;
    let isRecording = false;
    let currentStream = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let startTime = null;
    let recordingStartTime = null;
    let shareTimer = null;
    let recordingTimer = null;
    let currentRoomCode = null;
    let viewers = [];
    let recordings = [];
    
    // DOM elements
    const startShareBtn = document.getElementById('startShareBtn');
    const stopShareBtn = document.getElementById('stopShareBtn');
    const pauseShareBtn = document.getElementById('pauseShareBtn');
    const recordBtn = document.getElementById('recordBtn');
    const screenVideo = document.getElementById('screenVideo');
    const videoOverlay = document.getElementById('videoOverlay');
    const shareStatus = document.getElementById('shareStatus');
    const shareDuration = document.getElementById('shareDuration');
    const shareResolution = document.getElementById('shareResolution');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const pipBtn = document.getElementById('pipBtn');
    const snapshotBtn = document.getElementById('snapshotBtn');
    const sharingPanel = document.getElementById('sharingPanel');
    const shareLink = document.getElementById('shareLink');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const roomCode = document.getElementById('roomCode');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const qrCanvas = document.getElementById('qrCanvas');
    const viewerCount = document.getElementById('viewerCount');
    const viewersList = document.getElementById('viewersList');
    const recordingPanel = document.getElementById('recordingPanel');
    const recordingTime = document.getElementById('recordingTime');
    const stopRecordBtn = document.getElementById('stopRecordBtn');
    const pauseRecordBtn = document.getElementById('pauseRecordBtn');
    const recordingsContainer = document.getElementById('recordingsContainer');
    const notification = document.getElementById('notification');
    
    // Initialize
    function init() {
        setupEventListeners();
        loadSavedRecordings();
        
        // Disable buttons initially
        updateButtonStates();
        
        // Simulate some viewers joining
        setTimeout(() => {
            if (isSharing) {
                addSimulatedViewers();
            }
        }, 5000);
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Share controls
        startShareBtn.addEventListener('click', startScreenShare);
        stopShareBtn.addEventListener('click', stopScreenShare);
        pauseShareBtn.addEventListener('click', togglePauseShare);
        
        // Recording controls
        recordBtn.addEventListener('click', toggleRecording);
        stopRecordBtn.addEventListener('click', stopRecording);
        pauseRecordBtn.addEventListener('click', togglePauseRecording);
        
        // Preview controls
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        pipBtn.addEventListener('click', togglePictureInPicture);
        snapshotBtn.addEventListener('click', takeSnapshot);
        
        // Share controls
        copyLinkBtn.addEventListener('click', () => copyToClipboard(shareLink.value));
        copyCodeBtn.addEventListener('click', () => copyToClipboard(roomCode.textContent));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }
    
    // Start screen sharing
    async function startScreenShare() {
        try {
            const shareType = document.querySelector('input[name="shareType"]:checked').value;
            const includeAudio = document.getElementById('includeAudio').checked;
            const quality = document.getElementById('qualitySelect').value;
            
            // Get display media constraints
            const constraints = getDisplayMediaConstraints(shareType, includeAudio, quality);
            
            showNotification('Starting screen share...');
            
            // Request screen share permission
            currentStream = await navigator.mediaDevices.getDisplayMedia(constraints);
            
            // Set up video element
            screenVideo.srcObject = currentStream;
            videoOverlay.style.display = 'none';
            
            // Update state
            isSharing = true;
            startTime = Date.now();
            currentRoomCode = generateRoomCode();
            
            // Update UI
            updateButtonStates();
            updateShareStatus('Sharing');
            updateShareResolution();
            startShareTimer();
            
            // Show sharing panel
            sharingPanel.style.display = 'block';
            setupSharingInfo();
            
            // Handle stream end
            currentStream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };
            
            showNotification('Screen sharing started!');
            
        } catch (error) {
            console.error('Error starting screen share:', error);
            showNotification('Failed to start screen sharing', 'error');
        }
    }
    
    // Stop screen sharing
    function stopScreenShare() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
        }
        
        // Reset video
        screenVideo.srcObject = null;
        videoOverlay.style.display = 'flex';
        
        // Update state
        isSharing = false;
        isPaused = false;
        startTime = null;
        currentRoomCode = null;
        viewers = [];
        
        // Update UI
        updateButtonStates();
        updateShareStatus('Not sharing');
        updateShareResolution('-');
        stopShareTimer();
        
        // Hide sharing panel
        sharingPanel.style.display = 'none';
        
        // Stop recording if active
        if (isRecording) {
            stopRecording();
        }
        
        showNotification('Screen sharing stopped');
    }
    
    // Toggle pause sharing
    function togglePauseShare() {
        if (!isSharing) return;
        
        isPaused = !isPaused;
        
        if (isPaused) {
            // Pause video tracks
            currentStream.getVideoTracks().forEach(track => {
                track.enabled = false;
            });
            updateShareStatus('Paused');
            pauseShareBtn.textContent = 'Resume';
            showNotification('Screen sharing paused');
        } else {
            // Resume video tracks
            currentStream.getVideoTracks().forEach(track => {
                track.enabled = true;
            });
            updateShareStatus('Sharing');
            pauseShareBtn.textContent = 'Pause';
            showNotification('Screen sharing resumed');
        }
    }
    
    // Toggle recording
    function toggleRecording() {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }
    
    // Start recording
    function startRecording() {
        if (!isSharing || !currentStream) {
            showNotification('Please start screen sharing first', 'warning');
            return;
        }
        
        try {
            const options = {
                mimeType: 'video/webm;codecs=vp9'
            };
            
            mediaRecorder = new MediaRecorder(currentStream, options);
            recordedChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
            
            mediaRecorder.onstop = () => {
                saveRecording();
            };
            
            mediaRecorder.start();
            isRecording = true;
            recordingStartTime = Date.now();
            
            // Update UI
            updateButtonStates();
            recordingPanel.style.display = 'block';
            startRecordingTimer();
            
            showNotification('Recording started');
            
        } catch (error) {
            console.error('Error starting recording:', error);
            showNotification('Failed to start recording', 'error');
        }
    }
    
    // Stop recording
    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            recordingStartTime = null;
            
            // Update UI
            updateButtonStates();
            recordingPanel.style.display = 'none';
            stopRecordingTimer();
            
            showNotification('Recording stopped');
        }
    }
    
    // Toggle pause recording
    function togglePauseRecording() {
        if (!isRecording) return;
        
        if (mediaRecorder.state === 'recording') {
            mediaRecorder.pause();
            pauseRecordBtn.textContent = 'Resume';
            showNotification('Recording paused');
        } else if (mediaRecorder.state === 'paused') {
            mediaRecorder.resume();
            pauseRecordBtn.textContent = 'Pause';
            showNotification('Recording resumed');
        }
    }
    
    // Save recording
    function saveRecording() {
        if (recordedChunks.length === 0) return;
        
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString();
        
        const recording = {
            id: Date.now(),
            title: `Screen Recording ${new Date().toLocaleString()}`,
            url: url,
            blob: blob,
            timestamp: timestamp,
            duration: Date.now() - recordingStartTime,
            size: blob.size
        };
        
        recordings.push(recording);
        saveRecordingsToStorage();
        displayRecordings();
        
        showNotification('Recording saved successfully!');
    }
    
    // Toggle fullscreen
    function toggleFullscreen() {
        if (!screenVideo.srcObject) return;
        
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            screenVideo.requestFullscreen();
        }
    }
    
    // Toggle picture-in-picture
    function togglePictureInPicture() {
        if (!screenVideo.srcObject) return;
        
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        } else {
            screenVideo.requestPictureInPicture();
        }
    }
    
    // Take snapshot
    function takeSnapshot() {
        if (!screenVideo.srcObject) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = screenVideo.videoWidth;
        canvas.height = screenVideo.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(screenVideo, 0, 0);
        
        // Download image
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `screenshot-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
        
        showNotification('Screenshot saved!');
    }
    
    // Get display media constraints
    function getDisplayMediaConstraints(shareType, includeAudio, quality) {
        const constraints = {
            video: true,
            audio: includeAudio
        };
        
        // Set video quality
        if (quality === 'high') {
            constraints.video = {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                frameRate: { ideal: 30 }
            };
        } else if (quality === 'medium') {
            constraints.video = {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 }
            };
        } else {
            constraints.video = {
                width: { ideal: 640 },
                height: { ideal: 360 },
                frameRate: { ideal: 15 }
            };
        }
        
        return constraints;
    }
    
    // Update button states
    function updateButtonStates() {
        startShareBtn.disabled = isSharing;
        stopShareBtn.disabled = !isSharing;
        pauseShareBtn.disabled = !isSharing;
        recordBtn.disabled = !isSharing;
        recordBtn.textContent = isRecording ? 'Stop Recording' : 'Start Recording';
        stopRecordBtn.disabled = !isRecording;
        pauseRecordBtn.disabled = !isRecording;
        fullscreenBtn.disabled = !isSharing;
        pipBtn.disabled = !isSharing;
        snapshotBtn.disabled = !isSharing;
    }
    
    // Update share status
    function updateShareStatus(status) {
        shareStatus.textContent = status;
        shareStatus.className = `status-value ${status.toLowerCase().replace(' ', '-')}`;
    }
    
    // Update share resolution
    function updateShareResolution() {
        if (currentStream) {
            const track = currentStream.getVideoTracks()[0];
            if (track) {
                const settings = track.getSettings();
                shareResolution.textContent = `${settings.width}x${settings.height}`;
            }
        }
    }
    
    // Start share timer
    function startShareTimer() {
        shareTimer = setInterval(() => {
            if (startTime && !isPaused) {
                const elapsed = Date.now() - startTime;
                shareDuration.textContent = formatDuration(elapsed);
            }
        }, 1000);
    }
    
    // Stop share timer
    function stopShareTimer() {
        if (shareTimer) {
            clearInterval(shareTimer);
            shareTimer = null;
        }
        shareDuration.textContent = '00:00:00';
    }
    
    // Start recording timer
    function startRecordingTimer() {
        recordingTimer = setInterval(() => {
            if (recordingStartTime) {
                const elapsed = Date.now() - recordingStartTime;
                recordingTime.textContent = formatDuration(elapsed);
            }
        }, 1000);
    }
    
    // Stop recording timer
    function stopRecordingTimer() {
        if (recordingTimer) {
            clearInterval(recordingTimer);
            recordingTimer = null;
        }
        recordingTime.textContent = '00:00:00';
    }
    
    // Setup sharing info
    function setupSharingInfo() {
        const baseUrl = window.location.origin + window.location.pathname;
        const url = `${baseUrl}?room=${currentRoomCode}`;
        
        shareLink.value = url;
        roomCode.textContent = currentRoomCode;
        
        // Generate QR code
        generateQRCode(url);
        
        // Update viewer count
        updateViewerCount();
    }
    
    // Generate QR code
    function generateQRCode(text) {
        const canvas = qrCanvas;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Simple QR code simulation (just display text)
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText('(Simulated)', canvas.width / 2, canvas.height / 2 + 10);
        
        // Add border
        ctx.strokeStyle = '#000';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }
    
    // Add simulated viewers
    function addSimulatedViewers() {
        const simulatedViewers = [
            'John Doe',
            'Jane Smith',
            'Mike Johnson',
            'Sarah Wilson',
            'David Brown'
        ];
        
        simulatedViewers.forEach((name, index) => {
            setTimeout(() => {
                if (isSharing) {
                    viewers.push({
                        id: Date.now() + index,
                        name: name,
                        joinTime: Date.now()
                    });
                    updateViewersList();
                    updateViewerCount();
                }
            }, index * 2000);
        });
    }
    
    // Update viewer count
    function updateViewerCount() {
        viewerCount.textContent = viewers.length;
    }
    
    // Update viewers list
    function updateViewersList() {
        viewersList.innerHTML = '';
        
        viewers.forEach(viewer => {
            const item = document.createElement('div');
            item.className = 'viewer-item';
            item.textContent = viewer.name;
            viewersList.appendChild(item);
        });
    }
    
    // Display recordings
    function displayRecordings() {
        recordingsContainer.innerHTML = '';
        
        if (recordings.length === 0) {
            recordingsContainer.innerHTML = '<p>No recordings yet</p>';
            return;
        }
        
        recordings.forEach(recording => {
            const item = document.createElement('div');
            item.className = 'recording-item';
            
            item.innerHTML = `
                <div class="recording-thumbnail">
                    <video src="${recording.url}" controls></video>
                </div>
                <div class="recording-info">
                    <div class="recording-title">${recording.title}</div>
                    <div class="recording-meta">Duration: ${formatDuration(recording.duration)}</div>
                    <div class="recording-meta">Size: ${formatFileSize(recording.size)}</div>
                    <div class="recording-meta">Created: ${new Date(recording.timestamp).toLocaleDateString()}</div>
                </div>
                <div class="recording-actions">
                    <button class="btn small primary" onclick="downloadRecording(${recording.id})">Download</button>
                    <button class="btn small secondary" onclick="shareRecording(${recording.id})">Share</button>
                    <button class="btn small danger" onclick="deleteRecording(${recording.id})">Delete</button>
                </div>
            `;
            
            recordingsContainer.appendChild(item);
        });
    }
    
    // Download recording
    window.downloadRecording = function(id) {
        const recording = recordings.find(r => r.id === id);
        if (recording) {
            const a = document.createElement('a');
            a.href = recording.url;
            a.download = `${recording.title}.webm`;
            a.click();
        }
    };
    
    // Share recording
    window.shareRecording = function(id) {
        const recording = recordings.find(r => r.id === id);
        if (recording) {
            if (navigator.share) {
                navigator.share({
                    title: recording.title,
                    files: [new File([recording.blob], `${recording.title}.webm`, { type: 'video/webm' })]
                });
            } else {
                copyToClipboard(recording.url);
                showNotification('Recording URL copied to clipboard');
            }
        }
    };
    
    // Delete recording
    window.deleteRecording = function(id) {
        const index = recordings.findIndex(r => r.id === id);
        if (index !== -1) {
            URL.revokeObjectURL(recordings[index].url);
            recordings.splice(index, 1);
            saveRecordingsToStorage();
            displayRecordings();
            showNotification('Recording deleted');
        }
    };
    
    // Save recordings to storage
    function saveRecordingsToStorage() {
        try {
            const recordingsData = recordings.map(r => ({
                id: r.id,
                title: r.title,
                timestamp: r.timestamp,
                duration: r.duration,
                size: r.size
            }));
            localStorage.setItem('screenShareRecordings', JSON.stringify(recordingsData));
        } catch (error) {
            console.error('Error saving recordings:', error);
        }
    }
    
    // Load saved recordings
    function loadSavedRecordings() {
        try {
            const saved = localStorage.getItem('screenShareRecordings');
            if (saved) {
                const recordingsData = JSON.parse(saved);
                // Note: URLs would need to be recreated from saved blobs in a real implementation
                recordings = []; // Reset for demo
            }
        } catch (error) {
            console.error('Error loading recordings:', error);
        }
        
        displayRecordings();
    }
    
    // Handle keyboard shortcuts
    function handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    if (isSharing) {
                        togglePauseShare();
                    } else {
                        startScreenShare();
                    }
                    break;
                case 'r':
                    e.preventDefault();
                    toggleRecording();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'p':
                    e.preventDefault();
                    togglePictureInPicture();
                    break;
            }
        }
    }
    
    // Generate room code
    function generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    // Copy to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Copied to clipboard!');
        }).catch(() => {
            showNotification('Failed to copy to clipboard', 'error');
        });
    }
    
    // Format duration
    function formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
