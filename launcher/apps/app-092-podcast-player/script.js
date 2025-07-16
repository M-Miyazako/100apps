document.addEventListener('DOMContentLoaded', function() {
    console.log('ポッドキャストプレイヤーが正常に初期化されました！');
    
    // Sample podcast data
    const samplePodcasts = [
        {
            id: 1,
            title: "テックトーク・デイリー",
            description: "最新技術についての日々の議論",
            artwork: "https://via.placeholder.com/80x80/667eea/ffffff?text=TT",
            episodes: [
                {
                    id: 1,
                    title: "2024年のAIの未来",
                    description: "人工知能が私たちの未来をどう形成するかを探る",
                    duration: "32:45",
                    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
                    artwork: "https://via.placeholder.com/80x80/667eea/ffffff?text=AI"
                },
                {
                    id: 2,
                    title: "量子コンピューティングの突破口",
                    description: "量子コンピューティング技術の最近の進歩",
                    duration: "28:12",
                    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
                    artwork: "https://via.placeholder.com/80x80/667eea/ffffff?text=QC"
                }
            ]
        },
        {
            id: 2,
            title: "歴史の発見",
            description: "歴史からの魅力的な物語",
            artwork: "https://via.placeholder.com/80x80/764ba2/ffffff?text=HU",
            episodes: [
                {
                    id: 3,
                    title: "古代ローマ：興亡の歴史",
                    description: "ローマ帝国の完全な歴史",
                    duration: "45:30",
                    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
                    artwork: "https://via.placeholder.com/80x80/764ba2/ffffff?text=RO"
                },
                {
                    id: 4,
                    title: "中世の城",
                    description: "中世の生活と城の建設",
                    duration: "38:22",
                    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
                    artwork: "https://via.placeholder.com/80x80/764ba2/ffffff?text=MC"
                }
            ]
        },
        {
            id: 3,
            title: "今日の科学",
            description: "科学と研究の最新発見",
            artwork: "https://via.placeholder.com/80x80/28a745/ffffff?text=ST",
            episodes: [
                {
                    id: 5,
                    title: "気候変動の解決策",
                    description: "気候変動に対処する革新的なアプローチ",
                    duration: "41:15",
                    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
                    artwork: "https://via.placeholder.com/80x80/28a745/ffffff?text=CC"
                }
            ]
        }
    ];
    
    // Player state
    let currentPlaylist = [];
    let currentEpisodeIndex = 0;
    let playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    let currentSpeedIndex = 2;
    
    // DOM elements
    const podcastList = document.getElementById('podcastList');
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const speedBtn = document.getElementById('speed-btn');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const playlistItems = document.getElementById('playlistItems');
    const currentEpisodeEl = document.getElementById('currentEpisode');
    
    // Initialize app
    function init() {
        loadPodcasts();
        setupEventListeners();
        setupAudioPlayer();
    }
    
    // Load podcasts
    function loadPodcasts() {
        podcastList.innerHTML = '';
        
        samplePodcasts.forEach(podcast => {
            const podcastItem = document.createElement('div');
            podcastItem.className = 'podcast-item';
            podcastItem.innerHTML = `
                <img src="${podcast.artwork}" alt="${podcast.title}">
                <div class="podcast-title">${podcast.title}</div>
                <div class="podcast-description">${podcast.description}</div>
                <div class="episodes-list" id="episodes-${podcast.id}">
                    ${podcast.episodes.map(episode => `
                        <div class="episode-item" data-episode-id="${episode.id}">
                            <img src="${episode.artwork}" alt="${episode.title}">
                            <div class="episode-item-info">
                                <div class="episode-item-title">${episode.title}</div>
                                <div class="episode-item-description">${episode.description}</div>
                                <div class="episode-item-duration">${episode.duration}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            podcastItem.addEventListener('click', (e) => {
                if (!e.target.closest('.episode-item')) {
                    toggleEpisodes(podcast.id);
                }
            });
            
            podcastList.appendChild(podcastItem);
            
            // Add episode click listeners
            const episodeItems = podcastItem.querySelectorAll('.episode-item');
            episodeItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const episodeId = parseInt(item.dataset.episodeId);
                    playEpisode(episodeId, podcast.episodes);
                });
            });
        });
    }
    
    // Toggle episodes list
    function toggleEpisodes(podcastId) {
        const episodesList = document.getElementById(`episodes-${podcastId}`);
        episodesList.classList.toggle('show');
    }
    
    // Play episode
    function playEpisode(episodeId, episodes) {
        const episode = episodes.find(ep => ep.id === episodeId);
        if (!episode) return;
        
        currentPlaylist = episodes;
        currentEpisodeIndex = episodes.findIndex(ep => ep.id === episodeId);
        
        loadEpisode(episode);
        updatePlaylist();
        updateCurrentEpisodeInfo(episode);
    }
    
    // Load episode into player
    function loadEpisode(episode) {
        audioPlayer.src = episode.audioUrl;
        audioPlayer.load();
    }
    
    // Update current episode info
    function updateCurrentEpisodeInfo(episode) {
        const episodeInfo = currentEpisodeEl.querySelector('.episode-info');
        episodeInfo.innerHTML = `
            <img src="${episode.artwork}" alt="${episode.title}" class="episode-artwork">
            <div class="episode-details">
                <h3 class="episode-title">${episode.title}</h3>
                <p class="episode-description">${episode.description}</p>
            </div>
        `;
    }
    
    // Update playlist
    function updatePlaylist() {
        playlistItems.innerHTML = '';
        
        currentPlaylist.forEach((episode, index) => {
            const playlistItem = document.createElement('div');
            playlistItem.className = `playlist-item ${index === currentEpisodeIndex ? 'playing' : ''}`;
            playlistItem.innerHTML = `
                <img src="${episode.artwork}" alt="${episode.title}">
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${episode.title}</div>
                    <div class="playlist-item-duration">${episode.duration}</div>
                </div>
            `;
            
            playlistItem.addEventListener('click', () => {
                currentEpisodeIndex = index;
                loadEpisode(episode);
                updateCurrentEpisodeInfo(episode);
                updatePlaylist();
            });
            
            playlistItems.appendChild(playlistItem);
        });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Play/Pause button
        playPauseBtn.addEventListener('click', togglePlayPause);
        
        // Previous/Next buttons
        prevBtn.addEventListener('click', playPrevious);
        nextBtn.addEventListener('click', playNext);
        
        // Speed control
        speedBtn.addEventListener('click', changeSpeed);
        
        // Volume control
        volumeBtn.addEventListener('click', toggleMute);
        volumeSlider.addEventListener('input', changeVolume);
        
        // Progress bar
        progressBar.addEventListener('click', seekTo);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeydown);
    }
    
    // Setup audio player
    function setupAudioPlayer() {
        audioPlayer.volume = 0.5;
        
        audioPlayer.addEventListener('loadedmetadata', () => {
            durationEl.textContent = formatTime(audioPlayer.duration);
        });
        
        audioPlayer.addEventListener('timeupdate', () => {
            const current = audioPlayer.currentTime;
            const duration = audioPlayer.duration;
            
            currentTimeEl.textContent = formatTime(current);
            
            if (duration) {
                const progress = (current / duration) * 100;
                progressFill.style.width = progress + '%';
            }
        });
        
        audioPlayer.addEventListener('ended', () => {
            playNext();
        });
        
        audioPlayer.addEventListener('play', () => {
            updatePlayPauseButton(true);
        });
        
        audioPlayer.addEventListener('pause', () => {
            updatePlayPauseButton(false);
        });
    }
    
    // Toggle play/pause
    function togglePlayPause() {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    }
    
    // Update play/pause button
    function updatePlayPauseButton(isPlaying) {
        const playIcon = playPauseBtn.querySelector('.play-icon');
        const pauseIcon = playPauseBtn.querySelector('.pause-icon');
        
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }
    
    // Play previous episode
    function playPrevious() {
        if (currentPlaylist.length === 0) return;
        
        currentEpisodeIndex = (currentEpisodeIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        const episode = currentPlaylist[currentEpisodeIndex];
        loadEpisode(episode);
        updateCurrentEpisodeInfo(episode);
        updatePlaylist();
    }
    
    // Play next episode
    function playNext() {
        if (currentPlaylist.length === 0) return;
        
        currentEpisodeIndex = (currentEpisodeIndex + 1) % currentPlaylist.length;
        const episode = currentPlaylist[currentEpisodeIndex];
        loadEpisode(episode);
        updateCurrentEpisodeInfo(episode);
        updatePlaylist();
    }
    
    // Change playback speed
    function changeSpeed() {
        currentSpeedIndex = (currentSpeedIndex + 1) % playbackSpeeds.length;
        const speed = playbackSpeeds[currentSpeedIndex];
        audioPlayer.playbackRate = speed;
        speedBtn.textContent = speed + 'x';
    }
    
    // Toggle mute
    function toggleMute() {
        audioPlayer.muted = !audioPlayer.muted;
        volumeBtn.textContent = audioPlayer.muted ? '🔇' : '🔊';
    }
    
    // Change volume
    function changeVolume() {
        audioPlayer.volume = volumeSlider.value;
        if (audioPlayer.muted) {
            audioPlayer.muted = false;
            volumeBtn.textContent = '🔊';
        }
    }
    
    // Seek to position
    function seekTo(e) {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = pos * audioPlayer.duration;
    }
    
    // Format time
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
    
    // Handle keyboard shortcuts
    function handleKeydown(e) {
        switch(e.key) {
            case ' ':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'ArrowLeft':
                audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
                break;
            case 'ArrowRight':
                audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                audioPlayer.volume = Math.min(1, audioPlayer.volume + 0.1);
                volumeSlider.value = audioPlayer.volume;
                break;
            case 'ArrowDown':
                e.preventDefault();
                audioPlayer.volume = Math.max(0, audioPlayer.volume - 0.1);
                volumeSlider.value = audioPlayer.volume;
                break;
        }
    }
    
    // Initialize the app
    init();
});
