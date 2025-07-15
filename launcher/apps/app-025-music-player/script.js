class MusicPlayer {
    constructor() {
        this.currentTrack = null;
        this.currentIndex = 0;
        this.playlist = [];
        this.isPlaying = false;
        this.isShuffled = false;
        this.repeatMode = 'none'; // none, one, all
        this.volume = 0.5;
        this.isMuted = false;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.animationId = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupAudioContext();
        this.setupVisualizer();
    }

    initializeElements() {
        // Audio element
        this.audio = document.getElementById('audioPlayer');
        
        // File input
        this.fileInput = document.getElementById('fileInput');
        this.uploadArea = document.getElementById('uploadArea');
        
        // Player controls
        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        
        // Volume controls
        this.muteBtn = document.getElementById('muteBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        
        // Progress controls
        this.progressBar = document.querySelector('.progress-bar');
        this.progressFill = document.getElementById('progressFill');
        this.progressHandle = document.getElementById('progressHandle');
        
        // Display elements
        this.trackTitle = document.getElementById('trackTitle');
        this.trackArtist = document.getElementById('trackArtist');
        this.trackDuration = document.getElementById('trackDuration');
        this.currentTime = document.getElementById('currentTime');
        this.totalTime = document.getElementById('totalTime');
        
        // Playlist elements
        this.playlist = document.getElementById('playlist');
        this.clearPlaylistBtn = document.getElementById('clearPlaylistBtn');
        
        // Visualizer
        this.visualizer = document.getElementById('visualizer');
        this.visualizerCtx = this.visualizer.getContext('2d');
        
        // Set initial volume
        this.audio.volume = this.volume;
        this.volumeSlider.value = this.volume * 100;
    }

    setupEventListeners() {
        // File upload
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Player controls
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // Volume controls
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value / 100));
        
        // Progress bar
        this.progressBar.addEventListener('click', (e) => this.setProgress(e));
        this.progressBar.addEventListener('mousedown', (e) => this.startProgressDrag(e));
        
        // Audio events
        this.audio.addEventListener('loadedmetadata', () => this.updateTrackInfo());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleTrackEnd());
        this.audio.addEventListener('error', (e) => this.handleAudioError(e));
        
        // Playlist actions
        this.clearPlaylistBtn.addEventListener('click', () => this.clearPlaylist());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            // Connect audio element to analyser
            this.audio.addEventListener('play', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                
                if (!this.source) {
                    this.source = this.audioContext.createMediaElementSource(this.audio);
                    this.source.connect(this.analyser);
                    this.analyser.connect(this.audioContext.destination);
                }
            });
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    setupVisualizer() {
        this.visualizerCtx.fillStyle = '#667eea';
        this.visualizerCtx.fillRect(0, 0, this.visualizer.width, this.visualizer.height);
        
        // Draw initial placeholder
        this.visualizerCtx.fillStyle = '#ffffff';
        this.visualizerCtx.font = '16px Inter';
        this.visualizerCtx.textAlign = 'center';
        this.visualizerCtx.fillText('Audio visualizer will appear here when music is playing', 
                                   this.visualizer.width / 2, this.visualizer.height / 2);
    }

    // File handling
    handleFileUpload(event) {
        const files = Array.from(event.target.files);
        this.addFilesToPlaylist(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = Array.from(event.dataTransfer.files);
        const audioFiles = files.filter(file => file.type.startsWith('audio/'));
        
        if (audioFiles.length > 0) {
            this.addFilesToPlaylist(audioFiles);
        }
    }

    addFilesToPlaylist(files) {
        files.forEach(file => {
            if (file.type.startsWith('audio/')) {
                const track = {
                    id: Date.now() + Math.random(),
                    file: file,
                    name: file.name.replace(/\.[^/.]+$/, ''),
                    artist: 'Unknown Artist',
                    duration: 0,
                    url: URL.createObjectURL(file)
                };
                
                this.playlist.push(track);
                this.addTrackToPlaylistUI(track);
            }
        });
        
        // If no current track, set first track
        if (!this.currentTrack && this.playlist.length > 0) {
            this.loadTrack(0);
        }
    }

    addTrackToPlaylistUI(track) {
        const playlistContainer = document.getElementById('playlist');
        
        // Remove empty playlist message
        const emptyMessage = playlistContainer.querySelector('.empty-playlist');
        if (emptyMessage) {
            emptyMessage.remove();
        }
        
        const trackElement = document.createElement('div');
        trackElement.className = 'playlist-item';
        trackElement.dataset.trackId = track.id;
        
        trackElement.innerHTML = `
            <div class="playlist-item-number">${this.playlist.length}</div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${track.name}</div>
                <div class="playlist-item-artist">${track.artist}</div>
            </div>
            <div class="playlist-item-duration">--:--</div>
            <div class="playlist-item-actions">
                <button class="playlist-item-btn" onclick="musicPlayer.removeTrack('${track.id}')" title="Remove">🗑️</button>
            </div>
        `;
        
        trackElement.addEventListener('click', () => {
            const index = this.playlist.findIndex(t => t.id === track.id);
            if (index !== -1) {
                this.loadTrack(index);
            }
        });
        
        playlistContainer.appendChild(trackElement);
        
        // Get duration for the track
        const tempAudio = new Audio(track.url);
        tempAudio.addEventListener('loadedmetadata', () => {
            track.duration = tempAudio.duration;
            const durationElement = trackElement.querySelector('.playlist-item-duration');
            durationElement.textContent = this.formatTime(track.duration);
        });
    }

    // Player controls
    togglePlay() {
        if (!this.currentTrack) return;
        
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (!this.currentTrack) return;
        
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.playBtn.innerHTML = '⏸️';
            this.playBtn.title = 'Pause';
            this.updatePlayingState();
            this.startVisualizer();
        }).catch(error => {
            console.error('Error playing audio:', error);
        });
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.playBtn.innerHTML = '▶️';
        this.playBtn.title = 'Play';
        this.updatePlayingState();
        this.stopVisualizer();
    }

    previousTrack() {
        if (this.playlist.length === 0) return;
        
        let newIndex;
        if (this.isShuffled) {
            newIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            newIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.playlist.length - 1;
        }
        
        this.loadTrack(newIndex);
    }

    nextTrack() {
        if (this.playlist.length === 0) return;
        
        let newIndex;
        if (this.isShuffled) {
            newIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            newIndex = this.currentIndex < this.playlist.length - 1 ? this.currentIndex + 1 : 0;
        }
        
        this.loadTrack(newIndex);
    }

    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        this.currentIndex = index;
        this.currentTrack = this.playlist[index];
        
        this.audio.src = this.currentTrack.url;
        this.updateTrackInfo();
        this.updatePlayingState();
        
        // Auto-play if was playing
        if (this.isPlaying) {
            this.play();
        }
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        this.shuffleBtn.classList.toggle('active', this.isShuffled);
        this.shuffleBtn.title = this.isShuffled ? 'Shuffle: On' : 'Shuffle: Off';
    }

    toggleRepeat() {
        const modes = ['none', 'one', 'all'];
        const currentModeIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentModeIndex + 1) % modes.length];
        
        this.repeatBtn.classList.toggle('active', this.repeatMode !== 'none');
        
        const icons = { none: '🔁', one: '🔂', all: '🔁' };
        this.repeatBtn.innerHTML = icons[this.repeatMode];
        this.repeatBtn.title = `Repeat: ${this.repeatMode}`;
    }

    // Volume controls
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
        this.volumeSlider.value = this.volume * 100;
        this.updateVolumeIcon();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.audio.muted = this.isMuted;
        this.updateVolumeIcon();
    }

    updateVolumeIcon() {
        let icon = '🔊';
        if (this.isMuted || this.volume === 0) {
            icon = '🔇';
        } else if (this.volume < 0.5) {
            icon = '🔉';
        }
        this.muteBtn.innerHTML = icon;
        this.muteBtn.title = this.isMuted ? 'Unmute' : 'Mute';
    }

    // Progress controls
    setProgress(event) {
        if (!this.currentTrack) return;
        
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        const newTime = percent * this.audio.duration;
        
        this.audio.currentTime = newTime;
    }

    startProgressDrag(event) {
        event.preventDefault();
        const handleMouseMove = (e) => this.setProgress(e);
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    updateProgress() {
        if (!this.currentTrack || !this.audio.duration) return;
        
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressFill.style.width = `${percent}%`;
        
        this.currentTime.textContent = this.formatTime(this.audio.currentTime);
        this.totalTime.textContent = this.formatTime(this.audio.duration);
    }

    // Track info and UI updates
    updateTrackInfo() {
        if (!this.currentTrack) {
            this.trackTitle.textContent = 'No track selected';
            this.trackArtist.textContent = 'Unknown Artist';
            this.trackDuration.textContent = '0:00 / 0:00';
            return;
        }
        
        this.trackTitle.textContent = this.currentTrack.name;
        this.trackArtist.textContent = this.currentTrack.artist;
        
        if (this.audio.duration) {
            this.trackDuration.textContent = `${this.formatTime(this.audio.currentTime)} / ${this.formatTime(this.audio.duration)}`;
        }
    }

    updatePlayingState() {
        // Update playlist items
        const playlistItems = document.querySelectorAll('.playlist-item');
        playlistItems.forEach((item, index) => {
            item.classList.toggle('playing', index === this.currentIndex);
        });
    }

    // Audio event handlers
    handleTrackEnd() {
        switch (this.repeatMode) {
            case 'one':
                this.audio.currentTime = 0;
                this.play();
                break;
            case 'all':
                this.nextTrack();
                break;
            default:
                if (this.currentIndex < this.playlist.length - 1) {
                    this.nextTrack();
                } else {
                    this.pause();
                }
        }
    }

    handleAudioError(error) {
        console.error('Audio error:', error);
        this.pause();
    }

    // Visualizer
    startVisualizer() {
        if (!this.analyser) return;
        
        const draw = () => {
            if (!this.isPlaying) return;
            
            this.analyser.getByteFrequencyData(this.dataArray);
            
            this.visualizerCtx.clearRect(0, 0, this.visualizer.width, this.visualizer.height);
            
            // Create gradient
            const gradient = this.visualizerCtx.createLinearGradient(0, 0, 0, this.visualizer.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            
            const barWidth = this.visualizer.width / this.dataArray.length * 2;
            let x = 0;
            
            for (let i = 0; i < this.dataArray.length; i++) {
                const barHeight = (this.dataArray[i] / 255) * this.visualizer.height;
                
                this.visualizerCtx.fillStyle = gradient;
                this.visualizerCtx.fillRect(x, this.visualizer.height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
            
            this.animationId = requestAnimationFrame(draw);
        };
        
        draw();
    }

    stopVisualizer() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Draw static visualization
        this.visualizerCtx.clearRect(0, 0, this.visualizer.width, this.visualizer.height);
        this.visualizerCtx.fillStyle = '#e0e0e0';
        this.visualizerCtx.fillRect(0, 0, this.visualizer.width, this.visualizer.height);
    }

    // Playlist management
    removeTrack(trackId) {
        const index = this.playlist.findIndex(track => track.id === trackId);
        if (index === -1) return;
        
        // Remove from playlist array
        const track = this.playlist[index];
        URL.revokeObjectURL(track.url);
        this.playlist.splice(index, 1);
        
        // Remove from UI
        const trackElement = document.querySelector(`[data-track-id="${trackId}"]`);
        if (trackElement) {
            trackElement.remove();
        }
        
        // Update track numbers
        this.updatePlaylistNumbers();
        
        // Handle current track removal
        if (index === this.currentIndex) {
            if (this.playlist.length > 0) {
                const newIndex = Math.min(this.currentIndex, this.playlist.length - 1);
                this.loadTrack(newIndex);
            } else {
                this.currentTrack = null;
                this.currentIndex = 0;
                this.pause();
                this.updateTrackInfo();
                this.showEmptyPlaylist();
            }
        } else if (index < this.currentIndex) {
            this.currentIndex--;
        }
    }

    clearPlaylist() {
        // Clean up object URLs
        this.playlist.forEach(track => {
            URL.revokeObjectURL(track.url);
        });
        
        this.playlist = [];
        this.currentTrack = null;
        this.currentIndex = 0;
        this.pause();
        this.updateTrackInfo();
        
        // Clear UI
        const playlistContainer = document.getElementById('playlist');
        playlistContainer.innerHTML = '';
        this.showEmptyPlaylist();
    }

    updatePlaylistNumbers() {
        const playlistItems = document.querySelectorAll('.playlist-item');
        playlistItems.forEach((item, index) => {
            const numberElement = item.querySelector('.playlist-item-number');
            if (numberElement) {
                numberElement.textContent = index + 1;
            }
        });
    }

    showEmptyPlaylist() {
        const playlistContainer = document.getElementById('playlist');
        playlistContainer.innerHTML = `
            <div class="empty-playlist">
                <div class="empty-icon">🎵</div>
                <div class="empty-text">No songs in playlist</div>
                <div class="empty-subtext">Upload some music files to get started</div>
            </div>
        `;
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(event) {
        // Don't handle shortcuts if user is typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.key) {
            case ' ':
                event.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.previousTrack();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextTrack();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.setVolume(Math.min(1, this.volume + 0.1));
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.setVolume(Math.max(0, this.volume - 0.1));
                break;
            case 'm':
                event.preventDefault();
                this.toggleMute();
                break;
            case 's':
                event.preventDefault();
                this.toggleShuffle();
                break;
            case 'r':
                event.preventDefault();
                this.toggleRepeat();
                break;
        }
    }

    // Utility functions
    formatTime(seconds) {
        if (isNaN(seconds) || seconds === 0) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize the music player when the page loads
let musicPlayer;

document.addEventListener('DOMContentLoaded', () => {
    musicPlayer = new MusicPlayer();
    
    // Add some helpful instructions
    console.log('🎵 Music Player Controls:');
    console.log('Space: Play/Pause');
    console.log('Left/Right Arrow: Previous/Next track');
    console.log('Up/Down Arrow: Volume up/down');
    console.log('M: Mute/Unmute');
    console.log('S: Toggle shuffle');
    console.log('R: Toggle repeat');
});

// Export for global access
window.musicPlayer = musicPlayer;