class CmsTool {
    constructor() {
        this.currentSection = 'dashboard';
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // セクション切り替え
        document.querySelectorAll('.menu-item').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });
        
        // 新しい投稿
        const newPostBtn = document.getElementById('newPostBtn');
        if (newPostBtn) {
            newPostBtn.addEventListener('click', () => {
                this.createNewPost();
            });
        }
        
        // 新しいページ
        const newPageBtn = document.getElementById('newPageBtn');
        if (newPageBtn) {
            newPageBtn.addEventListener('click', () => {
                this.createNewPage();
            });
        }
        
        // 新しいユーザー
        const newUserBtn = document.getElementById('newUserBtn');
        if (newUserBtn) {
            newUserBtn.addEventListener('click', () => {
                this.createNewUser();
            });
        }
        
        // ファイルアップロード
        const uploadBtn = document.getElementById('uploadBtn');
        const fileInput = document.getElementById('fileInput');
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => {
                fileInput.click();
            });
            
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files);
            });
        }
        
        // 投稿検索
        const postSearch = document.getElementById('postSearch');
        if (postSearch) {
            postSearch.addEventListener('input', (e) => {
                this.searchPosts(e.target.value);
            });
        }
        
        // 編集・削除ボタン
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-small')) {
                if (e.target.textContent === '編集') {
                    this.editItem(e.target);
                } else if (e.target.textContent === '削除') {
                    this.deleteItem(e.target);
                }
            }
        });
        
        // 設定保存
        const saveSettingsBtn = document.querySelector('.settings-form .btn-primary');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }
    }
    
    switchSection(sectionName) {
        // メニューアイテムのアクティブ状態を更新
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        // セクションの表示を更新
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');
        
        this.currentSection = sectionName;
    }
    
    createNewPost() {
        const title = prompt('新しい投稿のタイトルを入力してください:');
        if (title) {
            const postsList = document.querySelector('.posts-list');
            const newPost = document.createElement('div');
            newPost.className = 'post-item';
            newPost.innerHTML = `
                <h4>${title}</h4>
                <p>公開日: ${new Date().toLocaleDateString('ja-JP')}</p>
                <div class="post-actions">
                    <button class="btn btn-small">編集</button>
                    <button class="btn btn-small btn-danger">削除</button>
                </div>
            `;
            postsList.appendChild(newPost);
            
            // 統計を更新
            this.updateStats();
        }
    }
    
    createNewPage() {
        const title = prompt('新しいページのタイトルを入力してください:');
        if (title) {
            const pagesList = document.querySelector('.pages-list');
            const newPage = document.createElement('div');
            newPage.className = 'page-item';
            newPage.innerHTML = `
                <h4>${title}</h4>
                <p>最終更新: ${new Date().toLocaleDateString('ja-JP')}</p>
                <div class="page-actions">
                    <button class="btn btn-small">編集</button>
                    <button class="btn btn-small btn-danger">削除</button>
                </div>
            `;
            pagesList.appendChild(newPage);
            
            // 統計を更新
            this.updateStats();
        }
    }
    
    createNewUser() {
        const name = prompt('新しいユーザーの名前を入力してください:');
        if (name) {
            const email = prompt('メールアドレスを入力してください:');
            if (email) {
                const usersList = document.querySelector('.users-list');
                const newUser = document.createElement('div');
                newUser.className = 'user-item';
                newUser.innerHTML = `
                    <h4>${name}</h4>
                    <p>${email}</p>
                    <span class="role">寄稿者</span>
                    <div class="user-actions">
                        <button class="btn btn-small">編集</button>
                        <button class="btn btn-small btn-danger">削除</button>
                    </div>
                `;
                usersList.appendChild(newUser);
                
                // 統計を更新
                this.updateStats();
            }
        }
    }
    
    handleFileUpload(files) {
        const mediaGrid = document.querySelector('.media-grid');
        
        Array.from(files).forEach(file => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            
            let thumbnail = '📄';
            if (file.type.startsWith('image/')) {
                thumbnail = '📷';
            } else if (file.type.startsWith('audio/')) {
                thumbnail = '🎵';
            } else if (file.type.startsWith('video/')) {
                thumbnail = '🎬';
            }
            
            mediaItem.innerHTML = `
                <div class="media-thumbnail">${thumbnail}</div>
                <p>${file.name}</p>
            `;
            
            mediaGrid.appendChild(mediaItem);
        });
        
        alert(`${files.length}個のファイルをアップロードしました。`);
    }
    
    searchPosts(query) {
        const posts = document.querySelectorAll('.post-item');
        posts.forEach(post => {
            const title = post.querySelector('h4').textContent.toLowerCase();
            if (title.includes(query.toLowerCase())) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
    }
    
    editItem(button) {
        const item = button.closest('.post-item, .page-item, .user-item');
        const title = item.querySelector('h4').textContent;
        const newTitle = prompt(`"${title}"を編集:`, title);
        
        if (newTitle && newTitle !== title) {
            item.querySelector('h4').textContent = newTitle;
            alert('更新しました。');
        }
    }
    
    deleteItem(button) {
        const item = button.closest('.post-item, .page-item, .user-item');
        const title = item.querySelector('h4').textContent;
        
        if (confirm(`"${title}"を削除しますか？`)) {
            item.remove();
            this.updateStats();
            alert('削除しました。');
        }
    }
    
    saveSettings() {
        const siteName = document.querySelector('.settings-form input[type="text"]').value;
        const siteDescription = document.querySelector('.settings-form textarea').value;
        const language = document.querySelector('.settings-form select').value;
        
        // 設定を保存（この例では単純にアラートで表示）
        alert(`設定を保存しました:\nサイト名: ${siteName}\n説明: ${siteDescription}\n言語: ${language}`);
    }
    
    updateStats() {
        const postCount = document.querySelectorAll('.post-item').length;
        const pageCount = document.querySelectorAll('.page-item').length;
        const userCount = document.querySelectorAll('.user-item').length;
        
        document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = postCount;
        document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = pageCount;
        document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = userCount;
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new CmsTool();
    console.log('CMS Tool app initialized');
});