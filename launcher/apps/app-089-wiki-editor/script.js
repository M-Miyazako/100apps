class WikiEditor {
    constructor() {
        this.pages = JSON.parse(localStorage.getItem('wikiPages')) || {};
        this.currentPage = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPageList();
        this.createWelcomePage();
    }

    bindEvents() {
        // ボタンイベント
        document.getElementById('newPageBtn').addEventListener('click', () => this.createNewPage());
        document.getElementById('saveBtn').addEventListener('click', () => this.savePage());
        document.getElementById('previewBtn').addEventListener('click', () => this.showPreview());
        
        // 検索
        document.getElementById('searchInput').addEventListener('input', (e) => this.searchPages(e.target.value));
        
        // タブ切り替え
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // エディタの自動保存
        document.getElementById('editor').addEventListener('input', () => this.autoSave());
        document.getElementById('pageTitle').addEventListener('input', () => this.autoSave());
    }

    createWelcomePage() {
        if (Object.keys(this.pages).length === 0) {
            const welcomeContent = `# Wikiエディターへようこそ

このアプリケーションは、Markdownを使用してWikiページを作成・編集できるエディターです。

## 機能

- **新規ページ作成**: 左上の「新規ページ」ボタンをクリック
- **ページ保存**: 編集後に「保存」ボタンをクリック
- **プレビュー**: 「プレビュー」タブでMarkdownの表示を確認
- **検索**: 右上の検索ボックスでページを検索
- **自動保存**: 編集中の内容は自動的に保存されます

## Markdownの基本記法

### 見出し
\`# 見出し1\`
\`## 見出し2\`
\`### 見出し3\`

### リスト
\`- 項目1\`
\`- 項目2\`

### 強調
\`**太字**\`
\`*斜体*\`

### リンク
\`[リンクテキスト](URL)\`

### コード
\`\`\`code\`\`\`

新しいページを作成して、このWikiを拡張してみましょう！`;

            this.pages['ウェルカムページ'] = {
                title: 'ウェルカムページ',
                content: welcomeContent,
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            };
            this.saveToStorage();
        }
        
        // 最初のページを読み込み
        const firstPage = Object.keys(this.pages)[0];
        if (firstPage) {
            this.loadPage(firstPage);
        }
    }

    loadPageList() {
        const pageList = document.getElementById('pageList');
        pageList.innerHTML = '';
        
        Object.keys(this.pages).forEach(pageId => {
            const page = this.pages[pageId];
            const li = document.createElement('li');
            li.textContent = page.title;
            li.dataset.pageId = pageId;
            li.addEventListener('click', () => this.loadPage(pageId));
            pageList.appendChild(li);
        });
    }

    loadPage(pageId) {
        if (!this.pages[pageId]) return;
        
        const page = this.pages[pageId];
        this.currentPage = pageId;
        
        // アクティブなページをハイライト
        document.querySelectorAll('#pageList li').forEach(li => {
            li.classList.remove('active');
            if (li.dataset.pageId === pageId) {
                li.classList.add('active');
            }
        });
        
        // エディタにページ内容を設定
        document.getElementById('pageTitle').value = page.title;
        document.getElementById('editor').value = page.content;
        
        // プレビューを更新
        this.updatePreview();
    }

    createNewPage() {
        const title = prompt('新しいページのタイトルを入力してください:');
        if (!title) return;
        
        const pageId = this.generatePageId(title);
        const newPage = {
            title: title,
            content: `# ${title}\n\n新しいページの内容をここに書いてください...`,
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };
        
        this.pages[pageId] = newPage;
        this.saveToStorage();
        this.loadPageList();
        this.loadPage(pageId);
    }

    savePage() {
        if (!this.currentPage) return;
        
        const title = document.getElementById('pageTitle').value;
        const content = document.getElementById('editor').value;
        
        if (title !== this.pages[this.currentPage].title) {
            // タイトルが変更された場合、新しいIDを生成
            const newPageId = this.generatePageId(title);
            delete this.pages[this.currentPage];
            this.currentPage = newPageId;
        }
        
        this.pages[this.currentPage] = {
            ...this.pages[this.currentPage],
            title: title,
            content: content,
            modified: new Date().toISOString()
        };
        
        this.saveToStorage();
        this.loadPageList();
        this.showMessage('ページが保存されました');
    }

    autoSave() {
        // 1秒後に自動保存
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            if (this.currentPage) {
                this.savePage();
            }
        }, 1000);
    }

    switchTab(tabName) {
        // タブボタンのアクティブ状態を更新
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // タブコンテンツを切り替え
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        if (tabName === 'edit') {
            document.getElementById('editTab').classList.add('active');
        } else if (tabName === 'preview') {
            document.getElementById('previewTab').classList.add('active');
            this.updatePreview();
        }
    }

    updatePreview() {
        const content = document.getElementById('editor').value;
        const preview = document.getElementById('preview');
        
        if (!content.trim()) {
            preview.innerHTML = '<div class="empty-state"><h3>プレビューするコンテンツがありません</h3><p>左側のエディタでMarkdownを入力してください。</p></div>';
            return;
        }
        
        // 簡単なMarkdownレンダリング
        preview.innerHTML = this.renderMarkdown(content);
    }

    renderMarkdown(text) {
        // 基本的なMarkdownのレンダリング
        let html = text;
        
        // ヘッダー
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        
        // 太字と斜体
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // リンク
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        
        // コード
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // リスト
        html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
        
        // 改行
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // 空の段落を削除
        html = html.replace(/<p><\/p>/g, '');
        
        return html;
    }

    searchPages(query) {
        const pageList = document.getElementById('pageList');
        const items = pageList.querySelectorAll('li');
        
        items.forEach(item => {
            const title = item.textContent.toLowerCase();
            const content = this.pages[item.dataset.pageId].content.toLowerCase();
            
            if (title.includes(query.toLowerCase()) || content.includes(query.toLowerCase())) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    showPreview() {
        this.switchTab('preview');
    }

    generatePageId(title) {
        return title.replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '_').toLowerCase();
    }

    saveToStorage() {
        localStorage.setItem('wikiPages', JSON.stringify(this.pages));
    }

    showMessage(message) {
        // 簡単な通知メッセージ
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            z-index: 1000;
        `;
        
        document.body.appendChild(messageEl);
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 3000);
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', function() {
    new WikiEditor();
});
