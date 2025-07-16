class VideoStreamer {
    constructor() {
        this.videos = new Map();
        this.currentVideo = null;
        this.isStreaming = false;
        this.chatMessages = [];
        this.viewers = 0;
        this.sampleVideos = [
            {
                id: 'sample1',
                title: 'サンプル動画1 - 自然の風景',
                description: '美しい自然の風景を撮影した動画です',
                url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                thumbnail: 'https://via.placeholder.com/160x90?text=自然',
                views: 1250,
                uploadDate: '2024-01-15'
            },
            {
                id: 'sample2',
                title: 'サンプル動画2 - 音楽パフォーマンス',
                description: 'アコースティックギターの演奏動画です',
                url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
                thumbnail: 'https://via.placeholder.com/160x90?text=音楽',
                views: 3420,
                uploadDate: '2024-01-20'
            },
            {
                id: 'sample3',
                title: 'サンプル動画3 - 料理レシピ',
                description: '簡単にできる料理のレシピを紹介します',
                url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
                thumbnail: 'https://via.placeholder.com/160x90?text=料理',
                views: 2100,
                uploadDate: '2024-01-25'
            }
        ];
        
        this.initializeEventListeners();
        this.loadSampleVideos();
        this.initializeChatSystem();
    }
    
    initializeEventListeners() {
        // Video controls
        document.getElementById('playBtn').addEventListener('click', () => this.playVideo());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseVideo());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopVideo());
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        
        // Volume control
        const volumeSlider = document.getElementById('volumeSlider');
        volumeSlider.addEventListener('input', (e) => this.updateVolume(e.target.value));
        
        // Video upload
        document.getElementById('uploadBtn').addEventListener('click', () => this.handleVideoUpload());
        document.getElementById('videoUpload').addEventListener('change', (e) => this.previewUploadedVideos(e));
        
        // Streaming controls
        document.getElementById('startStreamBtn').addEventListener('click', () => this.startStreaming());
        document.getElementById('stopStreamBtn').addEventListener('click', () => this.stopStreaming());
        
        // Chat system
        document.getElementById('sendChatBtn').addEventListener('click', () => this.sendChatMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });
        
        // Main video events
        const mainVideo = document.getElementById('mainVideo');
        mainVideo.addEventListener('loadedmetadata', () => this.updateVideoInfo());
        mainVideo.addEventListener('play', () => this.onVideoPlay());
        mainVideo.addEventListener('pause', () => this.onVideoPause());
        mainVideo.addEventListener('ended', () => this.onVideoEnd());
    }
    
    loadSampleVideos() {
        this.sampleVideos.forEach(video => {
            this.videos.set(video.id, video);
        });
        this.displayVideoList();
    }
    
    displayVideoList() {
        const container = document.getElementById('videoListContainer');
        container.innerHTML = '';
        
        this.videos.forEach(video => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            videoItem.innerHTML = `
                <img src="${video.thumbnail}" alt="${video.title}">
                <div class="video-item-info">
                    <h4>${video.title}</h4>
                    <p>${video.description}</p>
                    <div class="video-meta">
                        <span>${video.views} views</span>
                        <span>${video.uploadDate}</span>
                    </div>
                </div>
                <button onclick="videoStreamer.playVideoById('${video.id}')">再生</button>
            `;
            container.appendChild(videoItem);
        });
    }
    
    playVideoById(videoId) {
        const video = this.videos.get(videoId);
        if (video) {
            this.currentVideo = video;
            const mainVideo = document.getElementById('mainVideo');
            mainVideo.src = video.url;
            mainVideo.load();
            
            document.getElementById('videoTitle').textContent = video.title;
            document.getElementById('videoDescription').textContent = video.description;
            document.getElementById('viewCount').textContent = `${video.views} views`;
            document.getElementById('uploadDate').textContent = video.uploadDate;
            
            // Simulate view count increase
            video.views += 1;
            this.displayVideoList();
        }
    }
    
    playVideo() {
        const mainVideo = document.getElementById('mainVideo');
        if (mainVideo.src) {
            mainVideo.play();
        } else {
            alert('動画を選択してください');
        }
    }
    
    pauseVideo() {
        const mainVideo = document.getElementById('mainVideo');
        mainVideo.pause();
    }
    
    stopVideo() {
        const mainVideo = document.getElementById('mainVideo');
        mainVideo.pause();
        mainVideo.currentTime = 0;
    }
    
    toggleFullscreen() {
        const mainVideo = document.getElementById('mainVideo');
        if (mainVideo.requestFullscreen) {
            mainVideo.requestFullscreen();
        } else if (mainVideo.webkitRequestFullscreen) {
            mainVideo.webkitRequestFullscreen();
        } else if (mainVideo.msRequestFullscreen) {
            mainVideo.msRequestFullscreen();
        }
    }
    
    updateVolume(value) {
        const mainVideo = document.getElementById('mainVideo');
        mainVideo.volume = value / 100;
        document.getElementById('volumeValue').textContent = `${value}%`;
    }
    
    handleVideoUpload() {
        const videoUpload = document.getElementById('videoUpload');
        if (videoUpload.files.length === 0) {
            alert('動画ファイルを選択してください');
            return;
        }
        
        alert(`${videoUpload.files.length}個の動画ファイルをアップロードしました`);
    }
    
    previewUploadedVideos(event) {
        const files = event.target.files;
        Array.from(files).forEach(file => {
            if (file.type.startsWith('video/')) {
                const videoId = 'uploaded_' + Date.now();
                const videoUrl = URL.createObjectURL(file);
                
                const videoData = {
                    id: videoId,
                    title: file.name,
                    description: 'アップロードされた動画',
                    url: videoUrl,
                    thumbnail: 'https://via.placeholder.com/160x90?text=動画',
                    views: 0,
                    uploadDate: new Date().toISOString().split('T')[0]
                };
                
                this.videos.set(videoId, videoData);
            }
        });
        
        this.displayVideoList();
    }
    
    startStreaming() {
        if (!this.isStreaming) {
            this.isStreaming = true;
            this.viewers = Math.floor(Math.random() * 100) + 1;
            
            document.getElementById('streamStatus').textContent = 'ライブ配信中';
            document.getElementById('streamStatus').className = 'status live';
            document.getElementById('viewerCount').textContent = `視聴者: ${this.viewers}`;
            
            document.getElementById('startStreamBtn').classList.add('disabled');
            document.getElementById('stopStreamBtn').classList.remove('disabled');
            
            // Simulate viewer count changes
            this.viewerInterval = setInterval(() => {
                this.viewers += Math.floor(Math.random() * 3) - 1;
                if (this.viewers < 0) this.viewers = 0;
                document.getElementById('viewerCount').textContent = `視聴者: ${this.viewers}`;
            }, 5000);
            
            this.addChatMessage('システム', '配信を開始しました');
        }
    }
    
    stopStreaming() {
        if (this.isStreaming) {
            this.isStreaming = false;
            
            document.getElementById('streamStatus').textContent = 'オフライン';
            document.getElementById('streamStatus').className = 'status offline';
            document.getElementById('viewerCount').textContent = '視聴者: 0';
            
            document.getElementById('startStreamBtn').classList.remove('disabled');
            document.getElementById('stopStreamBtn').classList.add('disabled');
            
            if (this.viewerInterval) {
                clearInterval(this.viewerInterval);
            }
            
            this.addChatMessage('システム', '配信を終了しました');
        }
    }
    
    initializeChatSystem() {
        // Add some sample chat messages
        this.addChatMessage('視聴者1', 'こんにちは！');
        this.addChatMessage('視聴者2', '配信楽しみにしています');
        this.addChatMessage('視聴者3', '音質がとても良いですね');
    }
    
    sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (message) {
            this.addChatMessage('あなた', message);
            chatInput.value = '';
            
            // Simulate response from other users
            setTimeout(() => {
                const responses = [
                    'いいですね！',
                    'そうですね',
                    '同感です',
                    'ありがとう！',
                    '次も期待してます'
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                this.addChatMessage('視聴者' + Math.floor(Math.random() * 10), randomResponse);
            }, 1000 + Math.random() * 2000);
        }
    }
    
    addChatMessage(username, message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        const timestamp = new Date().toLocaleTimeString();
        messageElement.innerHTML = `
            <span class="chat-username">${username}</span>
            <span class="chat-timestamp">${timestamp}</span>
            <div class="chat-text">${message}</div>
        `;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        this.chatMessages.push({ username, message, timestamp });
    }
    
    updateVideoInfo() {
        const mainVideo = document.getElementById('mainVideo');
        if (this.currentVideo) {
            console.log(`Video loaded: ${this.currentVideo.title}`);
        }
    }
    
    onVideoPlay() {
        console.log('Video started playing');
    }
    
    onVideoPause() {
        console.log('Video paused');
    }
    
    onVideoEnd() {
        console.log('Video ended');
    }
}

let videoStreamer;

document.addEventListener('DOMContentLoaded', () => {
    videoStreamer = new VideoStreamer();
});
