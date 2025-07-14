// Social Network App JavaScript
class SocialNetwork {
    constructor() {
        this.posts = [
            {
                id: 1,
                author: '田中太郎',
                time: '2時間前',
                content: '新しいプロジェクトを開始しました！みんなで協力してすばらしいものを作りましょう 🚀',
                image: true,
                likes: 12,
                comments: 3,
                liked: false
            },
            {
                id: 2,
                author: '佐藤花子',
                time: '4時間前',
                content: '今日は素晴らしい一日でした！みんなにシェアしたいと思います ✨',
                image: false,
                likes: 8,
                comments: 1,
                liked: false
            },
            {
                id: 3,
                author: '鈴木一郎',
                time: '6時間前',
                content: 'テクノロジーの進歩は本当に素晴らしい！みんなで学び続けましょう 💻',
                image: false,
                likes: 15,
                comments: 5,
                liked: false
            }
        ];
        
        this.messages = [
            {
                id: 1,
                sender: '田中太郎',
                content: 'こんにちは！',
                time: '10:30',
                sent: false
            },
            {
                id: 2,
                sender: 'あなた',
                content: 'こんにちは！元気ですか？',
                time: '10:32',
                sent: true
            }
        ];
        
        this.notifications = [
            {
                id: 1,
                type: 'like',
                user: '田中太郎',
                action: 'があなたの投稿にいいねしました',
                time: '5分前',
                icon: '👍'
            },
            {
                id: 2,
                type: 'comment',
                user: '佐藤花子',
                action: 'があなたの投稿にコメントしました',
                time: '1時間前',
                icon: '💬'
            },
            {
                id: 3,
                type: 'follow',
                user: '鈴木一郎',
                action: 'があなたをフォローしました',
                time: '2時間前',
                icon: '👤'
            }
        ];
        
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupPostComposer();
        this.setupPostActions();
        this.setupMessaging();
        this.setupNotifications();
        this.setupProfileActions();
        this.loadInitialData();
    }
    
    setupNavigation() {
        const navBtns = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.section');
        
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetSection = btn.dataset.section;
                
                // Remove active class from all nav buttons and sections
                navBtns.forEach(navBtn => navBtn.classList.remove('active'));
                sections.forEach(section => section.classList.remove('active'));
                
                // Add active class to clicked button and corresponding section
                btn.classList.add('active');
                document.getElementById(targetSection).classList.add('active');
            });
        });
    }
    
    setupPostComposer() {
        const postBtn = document.querySelector('.post-btn');
        const composerInput = document.querySelector('.composer-input');
        
        postBtn.addEventListener('click', () => {
            const content = composerInput.value.trim();
            if (content) {
                this.createPost(content);
                composerInput.value = '';
            }
        });
        
        composerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                const content = composerInput.value.trim();
                if (content) {
                    this.createPost(content);
                    composerInput.value = '';
                }
            }
        });
        
        // Character counter
        composerInput.addEventListener('input', () => {
            const charCount = composerInput.value.length;
            const maxChars = 280;
            
            if (charCount > maxChars) {
                composerInput.value = composerInput.value.substring(0, maxChars);
            }
        });
    }
    
    createPost(content) {
        const newPost = {
            id: Date.now(),
            author: 'あなた',
            time: 'たった今',
            content: content,
            image: false,
            likes: 0,
            comments: 0,
            liked: false
        };
        
        this.posts.unshift(newPost);
        this.renderPosts();
        this.showNotification('投稿が作成されました！', 'success');
    }
    
    setupPostActions() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('like-btn') || e.target.closest('.like-btn')) {
                const likeBtn = e.target.classList.contains('like-btn') ? e.target : e.target.closest('.like-btn');
                const postId = parseInt(likeBtn.closest('.post').dataset.postId);
                this.toggleLike(postId, likeBtn);
            }
            
            if (e.target.classList.contains('comment-btn') || e.target.closest('.comment-btn')) {
                const commentBtn = e.target.classList.contains('comment-btn') ? e.target : e.target.closest('.comment-btn');
                const postId = parseInt(commentBtn.closest('.post').dataset.postId);
                this.showCommentDialog(postId);
            }
            
            if (e.target.classList.contains('share-btn') || e.target.closest('.share-btn')) {
                const shareBtn = e.target.classList.contains('share-btn') ? e.target : e.target.closest('.share-btn');
                const postId = parseInt(shareBtn.closest('.post').dataset.postId);
                this.sharePost(postId);
            }
        });
    }
    
    toggleLike(postId, likeBtn) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.liked = !post.liked;
            post.likes += post.liked ? 1 : -1;
            
            likeBtn.classList.toggle('liked', post.liked);
            const countSpan = likeBtn.querySelector('.count');
            countSpan.textContent = post.likes;
            
            this.animateButton(likeBtn);
            this.showNotification(post.liked ? 'いいね！' : 'いいねを取り消しました', 'info');
        }
    }
    
    showCommentDialog(postId) {
        const comment = prompt('コメントを入力してください:');
        if (comment) {
            const post = this.posts.find(p => p.id === postId);
            if (post) {
                post.comments++;
                this.renderPosts();
                this.showNotification('コメントが追加されました！', 'success');
            }
        }
    }
    
    sharePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            if (navigator.share) {
                navigator.share({
                    title: 'SocialNet - 投稿をシェア',
                    text: post.content,
                    url: window.location.href
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                navigator.clipboard.writeText(post.content).then(() => {
                    this.showNotification('投稿がクリップボードにコピーされました！', 'success');
                });
            }
        }
    }
    
    setupMessaging() {
        const sendBtn = document.querySelector('.send-btn');
        const messageInput = document.querySelector('.message-input');
        const chatMessages = document.querySelector('.chat-messages');
        
        if (sendBtn && messageInput) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
            
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        
        // Chat item selection
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(item => {
            item.addEventListener('click', () => {
                chatItems.forEach(chatItem => chatItem.classList.remove('active'));
                item.classList.add('active');
                // In a real app, this would load the chat history for the selected user
            });
        });
    }
    
    sendMessage() {
        const messageInput = document.querySelector('.message-input');
        const content = messageInput.value.trim();
        
        if (content) {
            const newMessage = {
                id: Date.now(),
                sender: 'あなた',
                content: content,
                time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
                sent: true
            };
            
            this.messages.push(newMessage);
            this.renderMessages();
            messageInput.value = '';
            
            // Simulate received message after a delay
            setTimeout(() => {
                this.simulateReceivedMessage();
            }, 1000 + Math.random() * 2000);
        }
    }
    
    simulateReceivedMessage() {
        const responses = [
            'ありがとうございます！',
            'そうですね',
            'いいですね！',
            '了解しました',
            'お疲れ様でした',
            'また連絡します'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const receivedMessage = {
            id: Date.now(),
            sender: '田中太郎',
            content: randomResponse,
            time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            sent: false
        };
        
        this.messages.push(receivedMessage);
        this.renderMessages();
    }
    
    renderMessages() {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;
        
        chatMessages.innerHTML = '';
        
        this.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.sent ? 'sent' : 'received'}`;
            messageDiv.innerHTML = `
                <div class="message-content">${message.content}</div>
                <div class="message-time">${message.time}</div>
            `;
            chatMessages.appendChild(messageDiv);
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    setupNotifications() {
        // In a real app, this would set up real-time notifications
        // For demo purposes, we'll just render the existing notifications
        this.renderNotifications();
    }
    
    renderNotifications() {
        const notificationsContainer = document.querySelector('.notifications-container');
        if (!notificationsContainer) return;
        
        // Clear existing notifications except the title
        const existingNotifications = notificationsContainer.querySelectorAll('.notification-item');
        existingNotifications.forEach(item => item.remove());
        
        this.notifications.forEach(notification => {
            const notificationDiv = document.createElement('div');
            notificationDiv.className = 'notification-item';
            notificationDiv.innerHTML = `
                <div class="notification-icon">${notification.icon}</div>
                <div class="notification-content">
                    <p><strong>${notification.user}</strong>${notification.action}</p>
                    <span class="notification-time">${notification.time}</span>
                </div>
            `;
            notificationsContainer.appendChild(notificationDiv);
        });
    }
    
    setupProfileActions() {
        const editProfileBtn = document.querySelector('.btn-primary');
        const settingsBtn = document.querySelector('.btn-secondary');
        const logoutBtn = document.querySelector('.logout-btn');
        
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.showNotification('プロフィール編集機能は開発中です', 'info');
            });
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showNotification('設定機能は開発中です', 'info');
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('ログアウトしますか？')) {
                    this.showNotification('ログアウトしました', 'info');
                    // In a real app, this would redirect to login page
                }
            });
        }
    }
    
    loadInitialData() {
        this.renderPosts();
        this.renderMessages();
        this.renderNotifications();
        this.updateStats();
    }
    
    renderPosts() {
        const feed = document.querySelector('.feed');
        if (!feed) return;
        
        feed.innerHTML = '';
        
        this.posts.forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.className = 'post';
            postDiv.dataset.postId = post.id;
            
            const avatarColor = this.getAvatarColor(post.author);
            const postImage = post.image ? `
                <div class="post-image">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDUwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjI1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LXNpemU9IjE4Ij5TYW1wbGUgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=" alt="Post image" />
                </div>
            ` : '';
            
            postDiv.innerHTML = `
                <div class="post-header">
                    <div class="post-avatar">
                        <img src="${avatarColor}" alt="User" />
                    </div>
                    <div class="post-info">
                        <div class="post-author">${post.author}</div>
                        <div class="post-time">${post.time}</div>
                    </div>
                    <div class="post-menu">⋮</div>
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                </div>
                ${postImage}
                <div class="post-actions">
                    <button class="action-btn like-btn ${post.liked ? 'liked' : ''}">👍 いいね <span class="count">${post.likes}</span></button>
                    <button class="action-btn comment-btn">💬 コメント <span class="count">${post.comments}</span></button>
                    <button class="action-btn share-btn">📤 シェア</button>
                </div>
            `;
            
            feed.appendChild(postDiv);
        });
    }
    
    getAvatarColor(author) {
        const colors = ['#6366f1', '#f56565', '#34d4aa', '#f59147', '#9f7aea', '#48bb78'];
        const hash = author.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const color = colors[hash % colors.length];
        
        return `data:image/svg+xml;base64,${btoa(`
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="${color}"/>
                <circle cx="20" cy="16" r="6" fill="white"/>
                <path d="M10 30C10 25 14.4772 21 20 21C25.5228 21 30 25 30 30H10Z" fill="white"/>
            </svg>
        `)}`;
    }
    
    updateStats() {
        // Update profile statistics
        const stats = document.querySelectorAll('.stat-number');
        if (stats.length >= 3) {
            stats[0].textContent = '1,234'; // Followers
            stats[1].textContent = '567';   // Following
            stats[2].textContent = this.posts.length; // Posts
        }
    }
    
    animateButton(button) {
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#34d4aa' : type === 'error' ? '#f56565' : '#6366f1'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Auto-refresh feed (simulate real-time updates)
    startAutoRefresh() {
        setInterval(() => {
            // Simulate new posts from friends
            if (Math.random() < 0.3) { // 30% chance every 10 seconds
                this.simulateNewPost();
            }
        }, 10000);
    }
    
    simulateNewPost() {
        const authors = ['田中太郎', '佐藤花子', '鈴木一郎', '山田三郎', '佐々木恵'];
        const contents = [
            'おはようございます！今日も頑張りましょう ☀️',
            'コーヒーが美味しい季節ですね ☕',
            '新しい技術を学んでいます 💻',
            '友達と楽しい時間を過ごしています 🎉',
            '今日はいい天気ですね 🌤️'
        ];
        
        const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
        const randomContent = contents[Math.floor(Math.random() * contents.length)];
        
        const newPost = {
            id: Date.now(),
            author: randomAuthor,
            time: 'たった今',
            content: randomContent,
            image: Math.random() < 0.3,
            likes: Math.floor(Math.random() * 10),
            comments: Math.floor(Math.random() * 5),
            liked: false
        };
        
        this.posts.unshift(newPost);
        this.renderPosts();
        this.updateStats();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new SocialNetwork();
    app.startAutoRefresh();
});

// Service Worker registration for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('SW registered: ', registration);
        }).catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                document.querySelector('[data-section="home"]').click();
                break;
            case '2':
                e.preventDefault();
                document.querySelector('[data-section="profile"]').click();
                break;
            case '3':
                e.preventDefault();
                document.querySelector('[data-section="messages"]').click();
                break;
            case '4':
                e.preventDefault();
                document.querySelector('[data-section="notifications"]').click();
                break;
        }
    }
});

// Add smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add intersection observer for lazy loading
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    });
    
    document.querySelectorAll('.post').forEach(post => {
        observer.observe(post);
    });
};

// Call observe elements after initial render
setTimeout(observeElements, 1000);