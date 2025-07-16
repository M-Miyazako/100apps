// フォーラムアプリの機能

let topics = [];
let posts = [];
let currentUser = null;
let selectedCategory = 'all';
let selectedTopicId = null;
let topicIdCounter = 1;
let postIdCounter = 1;

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    initializeEventListeners();
    updateStats();
    renderTopics();
    
    // デモ用のサンプルデータを追加
    if (topics.length === 0) {
        addSampleData();
    }
});

// イベントリスナーの初期化
function initializeEventListeners() {
    // ユーザーログイン
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // トピック作成
    document.getElementById('topicForm').addEventListener('submit', handleTopicSubmit);
    
    // カテゴリ選択
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            selectedCategory = this.dataset.category;
            renderTopics();
        });
    });
    
    // ソート機能
    document.getElementById('sortBy').addEventListener('change', function() {
        renderTopics();
    });
    
    // モーダル関連
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('replyBtn').addEventListener('click', handleReply);
    
    // モーダル外クリックで閉じる
    document.getElementById('topicModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// ユーザーログイン処理
function handleLogin() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        currentUser = {
            name: username,
            joinDate: new Date().toISOString()
        };
        
        document.getElementById('userLogin').style.display = 'none';
        document.getElementById('userInfo').style.display = 'block';
        document.getElementById('currentUser').textContent = username;
        
        saveToStorage();
        updateStats();
        renderTopics();
    }
}

// ログアウト処理
function handleLogout() {
    currentUser = null;
    
    document.getElementById('userLogin').style.display = 'block';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('username').value = '';
    
    saveToStorage();
    updateStats();
    renderTopics();
}

// トピック作成処理
function handleTopicSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('トピックを作成するにはログインが必要です。');
        return;
    }
    
    const topic = {
        id: topicIdCounter++,
        title: document.getElementById('topicTitle').value,
        content: document.getElementById('topicContent').value,
        category: document.getElementById('topicCategory').value,
        author: currentUser.name,
        createdAt: new Date().toISOString(),
        views: 0,
        replies: 0,
        lastActivity: new Date().toISOString()
    };
    
    topics.push(topic);
    saveToStorage();
    updateStats();
    renderTopics();
    
    // フォームをリセット
    document.getElementById('topicForm').reset();
    alert('トピックが作成されました！');
}

// 返信処理
function handleReply() {
    if (!currentUser) {
        alert('返信するにはログインが必要です。');
        return;
    }
    
    const content = document.getElementById('replyContent').value.trim();
    if (!content || !selectedTopicId) return;
    
    const post = {
        id: postIdCounter++,
        topicId: selectedTopicId,
        content: content,
        author: currentUser.name,
        createdAt: new Date().toISOString()
    };
    
    posts.push(post);
    
    // トピックの返信数を更新
    const topic = topics.find(t => t.id === selectedTopicId);
    if (topic) {
        topic.replies++;
        topic.lastActivity = new Date().toISOString();
    }
    
    saveToStorage();
    updateStats();
    renderTopics();
    renderPosts();
    
    // フォームをリセット
    document.getElementById('replyContent').value = '';
}

// 統計情報更新
function updateStats() {
    const totalTopics = topics.length;
    const totalPosts = posts.length;
    const activeUsers = currentUser ? 1 : 0; // 簡単な実装
    const totalCategories = 4; // 固定値
    
    document.getElementById('totalTopics').textContent = totalTopics;
    document.getElementById('totalPosts').textContent = totalPosts;
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('totalCategories').textContent = totalCategories;
}

// トピック一覧描画
function renderTopics() {
    const container = document.getElementById('topicsList');
    const sortBy = document.getElementById('sortBy').value;
    
    // フィルター処理
    let filteredTopics = [...topics];
    if (selectedCategory !== 'all') {
        filteredTopics = filteredTopics.filter(topic => topic.category === selectedCategory);
    }
    
    // ソート処理
    filteredTopics.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'popular':
                return b.views - a.views;
            case 'activity':
                return new Date(b.lastActivity) - new Date(a.lastActivity);
            default:
                return 0;
        }
    });
    
    if (filteredTopics.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h4>該当するトピックがありません</h4>
                <p>新しいトピックを作成してみてください</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTopics.map(topic => `
        <div class="topic-item" onclick="openTopic(${topic.id})">
            <div class="topic-title">${topic.title}</div>
            <div class="topic-preview">${topic.content.substring(0, 100)}${topic.content.length > 100 ? '...' : ''}</div>
            <div class="topic-meta">
                <div style="display: flex; gap: 15px; align-items: center;">
                    <span class="topic-author">${topic.author}</span>
                    <span class="topic-date">${new Date(topic.createdAt).toLocaleDateString()}</span>
                    <span class="topic-category">${getCategoryText(topic.category)}</span>
                </div>
                <div class="topic-stats">
                    <div class="stat-item">
                        <span>👁️ ${topic.views}</span>
                    </div>
                    <div class="stat-item">
                        <span>💬 ${topic.replies}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// トピック詳細表示
function openTopic(topicId) {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;
    
    // ビュー数を増加
    topic.views++;
    selectedTopicId = topicId;
    
    // モーダルにデータを設定
    document.getElementById('modalTopicTitle').textContent = topic.title;
    document.getElementById('modalTopicAuthor').textContent = `投稿者: ${topic.author}`;
    document.getElementById('modalTopicDate').textContent = new Date(topic.createdAt).toLocaleString();
    document.getElementById('modalTopicCategory').textContent = getCategoryText(topic.category);
    document.getElementById('modalTopicContent').textContent = topic.content;
    
    // 返信を表示
    renderPosts();
    
    // モーダルを表示
    document.getElementById('topicModal').style.display = 'block';
    
    saveToStorage();
    updateStats();
    renderTopics();
}

// 返信一覧描画
function renderPosts() {
    const container = document.getElementById('postsList');
    const topicPosts = posts.filter(post => post.topicId === selectedTopicId);
    
    if (topicPosts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #666;">
                <p>まだ返信がありません</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = topicPosts.map(post => `
        <div class="post-item">
            <div class="post-header">
                <span class="post-author">${post.author}</span>
                <span class="post-date">${new Date(post.createdAt).toLocaleString()}</span>
            </div>
            <div class="post-content">${post.content}</div>
        </div>
    `).join('');
}

// モーダル閉じる
function closeModal() {
    document.getElementById('topicModal').style.display = 'none';
    selectedTopicId = null;
    document.getElementById('replyContent').value = '';
}

// サンプルデータ追加
function addSampleData() {
    const sampleTopics = [
        {
            id: topicIdCounter++,
            title: 'フォーラムへようこそ！',
            content: 'このフォーラムの使い方や基本的なルールについて説明します。新しいメンバーの方はこちらを読んでください。',
            category: 'general',
            author: 'Admin',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1日前
            views: 25,
            replies: 3,
            lastActivity: new Date(Date.now() - 3600000).toISOString() // 1時間前
        },
        {
            id: topicIdCounter++,
            title: 'JavaScriptの最新トレンド',
            content: '2024年のJavaScriptの最新トレンドについて話し合いましょう。新しいフレームワークやライブラリの情報も共有してください。',
            category: 'tech',
            author: 'Developer',
            createdAt: new Date(Date.now() - 172800000).toISOString(), // 2日前
            views: 42,
            replies: 8,
            lastActivity: new Date(Date.now() - 7200000).toISOString() // 2時間前
        },
        {
            id: topicIdCounter++,
            title: 'バグ報告の方法',
            content: 'バグを見つけた場合の報告方法について説明します。効果的なバグ報告のテンプレートも提供します。',
            category: 'help',
            author: 'Support',
            createdAt: new Date(Date.now() - 259200000).toISOString(), // 3日前
            views: 18,
            replies: 2,
            lastActivity: new Date(Date.now() - 10800000).toISOString() // 3時間前
        }
    ];
    
    const samplePosts = [
        {
            id: postIdCounter++,
            topicId: 1,
            content: '素晴らしいフォーラムですね！参加できて嬉しいです。',
            author: 'NewUser',
            createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: postIdCounter++,
            topicId: 1,
            content: '質問があるのですが、プライベートメッセージ機能はありますか？',
            author: 'Questioner',
            createdAt: new Date(Date.now() - 1800000).toISOString()
        },
        {
            id: postIdCounter++,
            topicId: 2,
            content: 'React 18の新機能について詳しく知りたいです。',
            author: 'ReactFan',
            createdAt: new Date(Date.now() - 7200000).toISOString()
        }
    ];
    
    topics = sampleTopics;
    posts = samplePosts;
    
    saveToStorage();
    updateStats();
    renderTopics();
}

// ユーティリティ関数
function getCategoryText(category) {
    const categories = {
        'general': '一般',
        'tech': '技術',
        'news': 'ニュース',
        'help': 'ヘルプ'
    };
    return categories[category] || category;
}

// データの保存と読み込み
function saveToStorage() {
    localStorage.setItem('forumApp_topics', JSON.stringify(topics));
    localStorage.setItem('forumApp_posts', JSON.stringify(posts));
    localStorage.setItem('forumApp_currentUser', JSON.stringify(currentUser));
    localStorage.setItem('forumApp_counters', JSON.stringify({
        topicIdCounter,
        postIdCounter
    }));
}

function loadFromStorage() {
    const storedTopics = localStorage.getItem('forumApp_topics');
    const storedPosts = localStorage.getItem('forumApp_posts');
    const storedUser = localStorage.getItem('forumApp_currentUser');
    const storedCounters = localStorage.getItem('forumApp_counters');
    
    if (storedTopics) {
        topics = JSON.parse(storedTopics);
    }
    
    if (storedPosts) {
        posts = JSON.parse(storedPosts);
    }
    
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        if (currentUser) {
            document.getElementById('userLogin').style.display = 'none';
            document.getElementById('userInfo').style.display = 'block';
            document.getElementById('currentUser').textContent = currentUser.name;
        }
    }
    
    if (storedCounters) {
        const counters = JSON.parse(storedCounters);
        topicIdCounter = counters.topicIdCounter || 1;
        postIdCounter = counters.postIdCounter || 1;
    }
}