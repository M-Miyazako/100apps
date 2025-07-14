class MediaPlayer {
    constructor() {
        this.audio = document.getElementById('audioPlayer');
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isShuffle = false;
        this.repeatMode = 'off'; // 'off', 'one', 'all'
        this.volume = 0.5;
        this.isDragging = false;
        this.audioContext = null;
        this.analyser = null;
        this.gainNode = null;
        this.eqFilters = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
        this.setupAudioContext();
        this.updateUI();
    }
    
    initializeElements() {
        // Player controls
        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        
        // Progress and time
        this.progressBar = document.querySelector('.progress-bar');
        this.progressFill = document.getElementById('progressFill');
        this.progressHandle = document.getElementById('progressHandle');
        this.currentTimeEl = document.getElementById('currentTime');
        this.totalTimeEl = document.getElementById('totalTime');
        
        // Volume controls
        this.volumeSlider = document.getElementById('volumeSlider');
        this.volumeBtn = document.getElementById('muteBtn');
        this.volumeDisplay = document.getElementById('volumeDisplay');
        
        // Track info
        this.trackTitle = document.getElementById('trackTitle');
        this.trackArtist = document.getElementById('trackArtist');
        this.trackAlbum = document.getElementById('trackAlbum');
        this.albumArt = document.getElementById('albumArt');
        
        // Playlist
        this.fileInput = document.getElementById('fileInput');
        this.playlistItems = document.getElementById('playlistItems');
        this.clearPlaylistBtn = document.getElementById('clearPlaylist');
        this.savePlaylistBtn = document.getElementById('savePlaylist');
        
        // UI controls
        this.themeToggle = document.getElementById('themeToggle');
        this.playlistToggle = document.getElementById('playlistToggle');
        this.sidePanel = document.getElementById('sidePanel');
        this.equalizerPanel = document.getElementById('equalizerPanel');
        
        // Equalizer
        this.eqSliders = document.querySelectorAll('.eq-slider');
        this.presetBtns = document.querySelectorAll('.preset-btn');
    }
    
    setupEventListeners() {
        // Audio events
        this.audio.addEventListener('loadedmetadata', () => this.updateTrackInfo());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleTrackEnd());
        this.audio.addEventListener('error', () => this.handleError());
        
        // Player controls
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // Progress bar
        this.progressBar.addEventListener('click', (e) => this.seekTo(e));
        this.progressHandle.addEventListener('mousedown', (e) => this.startDrag(e));
        
        // Volume controls
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        
        // File input
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Playlist controls
        this.clearPlaylistBtn.addEventListener('click', () => this.clearPlaylist());
        this.savePlaylistBtn.addEventListener('click', () => this.savePlaylist());
        
        // UI controls
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.playlistToggle.addEventListener('click', () => this.togglePlaylist());
        
        // Equalizer
        this.eqSliders.forEach(slider => {
            slider.addEventListener('input', (e) => this.updateEqualizer(e));
        });
        
        this.presetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.applyPreset(e.target.dataset.preset));
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Drag and drop
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => this.handleDrop(e));
    }
    
    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.gainNode = this.audioContext.createGain();
            
            const source = this.audioContext.createMediaElementSource(this.audio);
            
            // Setup equalizer filters
            const frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
            frequencies.forEach((freq, index) => {
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'peaking';
                filter.frequency.value = freq;
                filter.Q.value = 1;
                filter.gain.value = 0;
                this.eqFilters.push(filter);
                
                if (index === 0) {
                    source.connect(filter);
                } else {
                    this.eqFilters[index - 1].connect(filter);
                }
            });
            
            this.eqFilters[this.eqFilters.length - 1].connect(this.gainNode);
            this.gainNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            this.gainNode.gain.value = this.volume;
        } catch (error) {
            console.error('Audio context setup failed:', error);
        }
    }
    
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        files.forEach(file => this.addToPlaylist(file));
    }
    
    handleDrop(event) {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        const audioFiles = files.filter(file => file.type.startsWith('audio/'));
        audioFiles.forEach(file => this.addToPlaylist(file));
    }
    
    addToPlaylist(file) {
        const url = URL.createObjectURL(file);
        const track = {
            id: Date.now() + Math.random(),
            name: file.name.replace(/\.[^/.]+$/, ''),
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            url: url,
            duration: 0,
            file: file
        };
        
        this.playlist.push(track);
        this.updatePlaylistUI();
        this.savePlaylistToStorage();
        
        if (this.playlist.length === 1) {
            this.loadTrack(0);
        }
    }
    
    updatePlaylistUI() {
        if (this.playlist.length === 0) {
            this.playlistItems.innerHTML = `
                <div class="empty-playlist">
                    <p>No tracks in playlist</p>
                    <p>Add some music files to get started</p>
                </div>
            `;
            return;
        }
        
        this.playlistItems.innerHTML = this.playlist.map((track, index) => `
            <div class="playlist-item ${index === this.currentTrackIndex ? 'playing' : ''}" 
                 data-index="${index}">
                <div class="track-name">${track.name}</div>
                <div class="track-details">${track.artist} - ${track.album}</div>
            </div>
        `).join('');
        
        // Add click listeners to playlist items
        this.playlistItems.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.loadTrack(index);
            });
        });
    }
    
    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        this.currentTrackIndex = index;
        const track = this.playlist[index];
        
        this.audio.src = track.url;
        this.audio.load();
        
        this.updatePlaylistUI();
        this.updateTrackInfo();
        this.saveSettings();
    }
    
    updateTrackInfo() {
        if (this.playlist.length === 0) {
            this.trackTitle.textContent = 'No track selected';
            this.trackArtist.textContent = 'Unknown Artist';
            this.trackAlbum.textContent = 'Unknown Album';
            this.totalTimeEl.textContent = '0:00';
            return;
        }
        
        const track = this.playlist[this.currentTrackIndex];
        this.trackTitle.textContent = track.name;
        this.trackArtist.textContent = track.artist;
        this.trackAlbum.textContent = track.album;
        this.totalTimeEl.textContent = this.formatTime(this.audio.duration || 0);
    }
    
    togglePlay() {
        if (this.playlist.length === 0) return;
        
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        if (this.isPlaying) {
            this.audio.pause();
            this.playBtn.textContent = '▶️';
            this.isPlaying = false;
        } else {
            this.audio.play();
            this.playBtn.textContent = '⏸️';
            this.isPlaying = true;
        }
        
        this.updateVisualizerState();
    }
    
    previousTrack() {
        if (this.playlist.length === 0) return;
        
        let newIndex;
        if (this.isShuffle) {
            newIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            newIndex = this.currentTrackIndex - 1;
            if (newIndex < 0) {
                newIndex = this.playlist.length - 1;
            }
        }
        
        this.loadTrack(newIndex);
        if (this.isPlaying) {
            this.audio.play();
        }
    }
    
    nextTrack() {
        if (this.playlist.length === 0) return;
        
        let newIndex;
        if (this.isShuffle) {
            newIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            newIndex = this.currentTrackIndex + 1;
            if (newIndex >= this.playlist.length) {
                newIndex = 0;
            }
        }
        
        this.loadTrack(newIndex);
        if (this.isPlaying) {
            this.audio.play();
        }
    }
    
    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        this.shuffleBtn.classList.toggle('active', this.isShuffle);
        this.saveSettings();
    }
    
    toggleRepeat() {
        const modes = ['off', 'one', 'all'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        this.repeatBtn.classList.toggle('active', this.repeatMode !== 'off');
        this.repeatBtn.textContent = this.repeatMode === 'one' ? '🔂' : '🔁';
        this.saveSettings();
    }
    
    handleTrackEnd() {
        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.audio.play();
        } else if (this.repeatMode === 'all' || this.currentTrackIndex < this.playlist.length - 1) {
            this.nextTrack();
        } else {
            this.isPlaying = false;
            this.playBtn.textContent = '▶️';
            this.updateVisualizerState();
        }
    }
    
    updateProgress() {
        if (this.isDragging) return;
        
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressHandle.style.left = `${progress}%`;
        this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
    }
    
    seekTo(event) {
        const rect = this.progressBar.getBoundingClientRect();
        const progress = (event.clientX - rect.left) / rect.width;
        this.audio.currentTime = progress * this.audio.duration;
    }
    
    startDrag(event) {
        this.isDragging = true;
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.endDrag.bind(this));
    }
    
    drag(event) {
        const rect = this.progressBar.getBoundingClientRect();
        let progress = (event.clientX - rect.left) / rect.width;
        progress = Math.max(0, Math.min(1, progress));
        
        this.progressFill.style.width = `${progress * 100}%`;
        this.progressHandle.style.left = `${progress * 100}%`;
        this.currentTimeEl.textContent = this.formatTime(progress * this.audio.duration);
    }
    
    endDrag(event) {
        this.isDragging = false;
        const rect = this.progressBar.getBoundingClientRect();
        const progress = (event.clientX - rect.left) / rect.width;
        this.audio.currentTime = progress * this.audio.duration;
        
        document.removeEventListener('mousemove', this.drag);
        document.removeEventListener('mouseup', this.endDrag);
    }
    
    setVolume(value) {
        this.volume = value / 100;
        this.audio.volume = this.volume;
        if (this.gainNode) {
            this.gainNode.gain.value = this.volume;
        }
        this.volumeDisplay.textContent = `${value}%`;
        this.updateVolumeIcon();
        this.saveSettings();
    }
    
    toggleMute() {
        if (this.audio.volume > 0) {
            this.audio.volume = 0;
            this.volumeSlider.value = 0;
            this.volumeDisplay.textContent = '0%';
        } else {
            this.audio.volume = this.volume;
            this.volumeSlider.value = this.volume * 100;
            this.volumeDisplay.textContent = `${Math.round(this.volume * 100)}%`;
        }
        this.updateVolumeIcon();
    }
    
    updateVolumeIcon() {
        const volume = this.audio.volume;
        if (volume === 0) {
            this.volumeBtn.textContent = '🔇';
        } else if (volume < 0.3) {
            this.volumeBtn.textContent = '🔈';
        } else if (volume < 0.7) {
            this.volumeBtn.textContent = '🔉';
        } else {
            this.volumeBtn.textContent = '🔊';
        }
    }
    
    updateEqualizer(event) {
        const slider = event.target;
        const frequency = parseInt(slider.dataset.frequency);
        const gain = parseFloat(slider.value);
        const index = Array.from(this.eqSliders).indexOf(slider);
        
        if (this.eqFilters[index]) {
            this.eqFilters[index].gain.value = gain;
        }
        
        slider.nextElementSibling.textContent = `${gain >= 0 ? '+' : ''}${gain}dB`;
        this.saveEQSettings();
    }
    
    applyPreset(preset) {
        const presets = {
            flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            rock: [5, 4, -5, -8, -3, 4, 8, 11, 11, 11],
            pop: [-1, 4, 7, 8, 5, -1, -2, -2, -1, -1],
            jazz: [4, 3, 1, 2, -1, -1, 0, 1, 2, 3],
            classical: [5, 4, 3, 2, -1, -1, 0, 2, 3, 4]
        };
        
        if (presets[preset]) {
            presets[preset].forEach((value, index) => {
                this.eqSliders[index].value = value;
                if (this.eqFilters[index]) {
                    this.eqFilters[index].gain.value = value;
                }
                this.eqSliders[index].nextElementSibling.textContent = `${value >= 0 ? '+' : ''}${value}dB`;
            });
            
            this.presetBtns.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            this.saveEQSettings();
        }
    }
    
    clearPlaylist() {
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.playBtn.textContent = '▶️';
        this.audio.src = '';
        this.updatePlaylistUI();
        this.updateTrackInfo();
        this.savePlaylistToStorage();
        this.updateVisualizerState();
    }
    
    savePlaylist() {
        const playlistData = {
            name: `Playlist ${new Date().toLocaleString()}`,
            tracks: this.playlist.map(track => ({
                name: track.name,
                artist: track.artist,
                album: track.album
            }))
        };
        
        const blob = new Blob([JSON.stringify(playlistData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `playlist_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        this.themeToggle.textContent = newTheme === 'light' ? '☀️' : '🌙';
        localStorage.setItem('mediaPlayerTheme', newTheme);
    }
    
    togglePlaylist() {
        this.sidePanel.classList.toggle('hidden');
    }
    
    updateVisualizerState() {
        const visualizer = document.getElementById('visualizer');
        if (this.isPlaying) {
            visualizer.style.display = 'flex';
        } else {
            visualizer.style.display = 'none';
        }
    }
    
    handleKeyPress(event) {
        if (event.target.tagName === 'INPUT') return;
        
        switch(event.code) {
            case 'Space':
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
                this.setVolume(Math.min(100, this.volume * 100 + 10));
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.setVolume(Math.max(0, this.volume * 100 - 10));
                break;
        }
    }
    
    handleError() {
        console.error('Audio playback error');
        this.nextTrack();
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    saveSettings() {
        const settings = {
            volume: this.volume,
            shuffle: this.isShuffle,
            repeat: this.repeatMode,
            currentTrackIndex: this.currentTrackIndex
        };
        localStorage.setItem('mediaPlayerSettings', JSON.stringify(settings));
    }
    
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('mediaPlayerSettings') || '{}');
            this.volume = settings.volume || 0.5;
            this.isShuffle = settings.shuffle || false;
            this.repeatMode = settings.repeat || 'off';
            this.currentTrackIndex = settings.currentTrackIndex || 0;
            
            this.volumeSlider.value = this.volume * 100;
            this.volumeDisplay.textContent = `${Math.round(this.volume * 100)}%`;
            this.shuffleBtn.classList.toggle('active', this.isShuffle);
            this.repeatBtn.classList.toggle('active', this.repeatMode !== 'off');
            this.repeatBtn.textContent = this.repeatMode === 'one' ? '🔂' : '🔁';
            
            const theme = localStorage.getItem('mediaPlayerTheme') || 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            this.themeToggle.textContent = theme === 'light' ? '☀️' : '🌙';
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    saveEQSettings() {
        const eqSettings = Array.from(this.eqSliders).map(slider => slider.value);
        localStorage.setItem('mediaPlayerEQ', JSON.stringify(eqSettings));
    }
    
    loadEQSettings() {
        try {
            const eqSettings = JSON.parse(localStorage.getItem('mediaPlayerEQ') || '[]');
            eqSettings.forEach((value, index) => {
                if (this.eqSliders[index]) {
                    this.eqSliders[index].value = value;
                    if (this.eqFilters[index]) {
                        this.eqFilters[index].gain.value = parseFloat(value);
                    }
                }
            });
        } catch (error) {
            console.error('Error loading EQ settings:', error);
        }
    }
    
    savePlaylistToStorage() {
        try {
            const playlistData = this.playlist.map(track => ({
                name: track.name,
                artist: track.artist,
                album: track.album,
                // Note: We can't save the actual file data to localStorage
                // In a real app, you'd upload to a server or use IndexedDB
            }));
            localStorage.setItem('mediaPlayerPlaylist', JSON.stringify(playlistData));
        } catch (error) {
            console.error('Error saving playlist:', error);
        }
    }
    
    updateUI() {
        this.updateVolumeIcon();
        this.updateVisualizerState();
        this.updatePlaylistUI();
        this.updateTrackInfo();
    }
}

// Initialize media player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MediaPlayer();
});