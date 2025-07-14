class BlogPlatform {
    constructor() {
        this.posts = [
            {
                id: 1,
                title: 'ブログプラットフォームへようこそ',
                content: `# ブログプラットフォームへようこそ

このプラットフォームを使って、簡単にブログ投稿を作成・管理できます。

## 主な機能

- **Markdownエディター**: 見やすいテキスト形式でブログを執筆
- **リアルタイムプレビュー**: 書いた内容をすぐに確認
- **カテゴリ管理**: 投稿を整理・分類
- **タグ機能**: より詳細な分類が可能
- **下書き保存**: 完成前の記事も安全に保存

## 使い方

1. 「新規投稿」ボタンで記事を作成開始
2. タイトルとカテゴリを設定
3. Markdown形式で本文を執筆
4. プレビューで確認しながら編集
5. 完成したら「保存」で公開

ぜひお試しください！`,
                category: '使い方',
                tags: ['ガイド', 'はじめに'],
                isDraft: false,
                createdAt: new Date('2023-12-01'),
                updatedAt: new Date('2023-12-01')
            }
        ];
        this.categories = ['使い方', 'テクノロジー', '日記', 'レビュー'];
        this.currentPost = null;
        
        this.initializeEventListeners();
        this.renderPostsList();
        this.renderCategories();
        this.loadPost(this.posts[0]);
    }

    initializeEventListeners() {
        // 新規投稿
        document.getElementById('newPost').addEventListener('click', () => {
            this.createNewPost();
        });

        // 投稿保存
        document.getElementById('savePost').addEventListener('click', () => {
            this.saveCurrentPost();
        });

        // 投稿削除
        document.getElementById('deletePost').addEventListener('click', () => {
            this.deleteCurrentPost();
        });

        // プレビュー
        document.getElementById('previewPost').addEventListener('click', () => {
            this.togglePreview();
        });

        document.getElementById('closePreview').addEventListener('click', () => {
            this.closePreview();
        });

        // カテゴリ追加
        document.getElementById('addCategory').addEventListener('click', () => {
            this.addCategory();
        });

        // リアルタイム更新
        document.getElementById('postTitle').addEventListener('input', () => {
            this.updateCurrentPost();
        });

        document.getElementById('postContent').addEventListener('input', () => {
            this.updateCurrentPost();
        });

        document.getElementById('postCategory').addEventListener('change', () => {
            this.updateCurrentPost();
        });

        document.getElementById('postTags').addEventListener('input', () => {
            this.updateCurrentPost();
        });

        document.getElementById('postDraft').addEventListener('change', () => {
            this.updateCurrentPost();
        });

        // ツールバー
        this.initializeToolbar();

        // 公開
        document.getElementById('publishAll').addEventListener('click', () => {
            this.publishBlog();
        });
    }

    initializeToolbar() {
        const toolbar = {
            bold: { before: '**', after: '**' },
            italic: { before: '*', after: '*' },
            heading: { before: '## ', after: '' },
            link: { before: '[', after: '](https://example.com)' },
            image: { before: '![', after: '](https://example.com/image.jpg)' },
            list: { before: '- ', after: '' },
            quote: { before: '> ', after: '' }
        };

        Object.keys(toolbar).forEach(id => {
            document.getElementById(id).addEventListener('click', () => {
                this.insertText(toolbar[id].before, toolbar[id].after);
            });
        });
    }

    insertText(before, after) {
        const editor = document.getElementById('postContent');
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        const replacement = before + selectedText + after;
        
        editor.value = editor.value.substring(0, start) + replacement + editor.value.substring(end);
        
        const newCursorPos = start + before.length + selectedText.length;
        editor.setSelectionRange(newCursorPos, newCursorPos);
        editor.focus();
        
        this.updateCurrentPost();
    }

    createNewPost() {
        const newPost = {
            id: Date.now(),
            title: '新しい投稿',
            content: '# 新しい投稿\n\nここに内容を書いてください...',
            category: '',
            tags: [],
            isDraft: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        this.posts.unshift(newPost);
        this.renderPostsList();
        this.loadPost(newPost);
    }

    loadPost(post) {
        this.currentPost = post;
        
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postContent').value = post.content;
        document.getElementById('postCategory').value = post.category;
        document.getElementById('postTags').value = Array.isArray(post.tags) ? post.tags.join(', ') : '';
        document.getElementById('postDraft').checked = post.isDraft;
        document.getElementById('createdDate').textContent = post.createdAt.toLocaleDateString();
        
        this.highlightActivePost();
    }

    updateCurrentPost() {
        if (!this.currentPost) return;
        
        this.currentPost.title = document.getElementById('postTitle').value;
        this.currentPost.content = document.getElementById('postContent').value;
        this.currentPost.category = document.getElementById('postCategory').value;
        this.currentPost.tags = document.getElementById('postTags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);
        this.currentPost.isDraft = document.getElementById('postDraft').checked;
        this.currentPost.updatedAt = new Date();
        
        this.renderPostsList();
    }

    saveCurrentPost() {
        if (!this.currentPost) return;
        
        this.updateCurrentPost();
        this.renderPostsList();
        
        // 簡易的な保存フィードバック
        const saveBtn = document.getElementById('savePost');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> 保存済み';
        saveBtn.style.background = '#28a745';
        
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.style.background = '';
        }, 2000);
    }

    deleteCurrentPost() {
        if (!this.currentPost) return;
        
        if (confirm('この投稿を削除しますか？')) {
            this.posts = this.posts.filter(post => post.id !== this.currentPost.id);
            this.renderPostsList();
            
            if (this.posts.length > 0) {
                this.loadPost(this.posts[0]);
            } else {
                this.createNewPost();
            }
        }
    }

    togglePreview() {
        const previewSection = document.getElementById('previewSection');
        const isShowing = previewSection.classList.contains('show');
        
        if (isShowing) {
            this.closePreview();
        } else {
            this.showPreview();
        }
    }

    showPreview() {
        const previewSection = document.getElementById('previewSection');
        previewSection.classList.add('show');
        
        if (this.currentPost) {
            document.getElementById('previewTitle').textContent = this.currentPost.title;
            document.getElementById('previewDate').textContent = this.currentPost.createdAt.toLocaleDateString();
            document.getElementById('previewCategory').textContent = this.currentPost.category || 'カテゴリなし';
            
            const tagsContainer = document.getElementById('previewTags');
            tagsContainer.innerHTML = this.currentPost.tags.map(tag => 
                `<span class="tag">${tag}</span>`
            ).join('');
            
            const html = marked.parse(this.currentPost.content);
            document.getElementById('previewContent').innerHTML = html;
        }
    }

    closePreview() {
        document.getElementById('previewSection').classList.remove('show');
    }

    renderPostsList() {
        const list = document.getElementById('postsList');
        list.innerHTML = this.posts.map(post => `
            <div class="post-item ${post.isDraft ? 'draft' : ''}" 
                 data-post-id="${post.id}" 
                 onclick="blogPlatform.loadPost(${JSON.stringify(post).replace(/"/g, '&quot;')})">
                <div class="post-item-title">${post.title}</div>
                <div class="post-item-meta">
                    ${post.category || '未分類'} | ${post.updatedAt.toLocaleDateString()}
                    ${post.isDraft ? ' | 下書き' : ''}
                </div>
            </div>
        `).join('');
        
        this.updateCategorySelect();
    }

    highlightActivePost() {
        document.querySelectorAll('.post-item').forEach(item => {
            item.classList.remove('active');
        });
        
        if (this.currentPost) {
            const activeItem = document.querySelector(`[data-post-id="${this.currentPost.id}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }
        }
    }

    renderCategories() {
        const list = document.getElementById('categoriesList');
        list.innerHTML = this.categories.map(category => `
            <div class="category-item">
                <span>${category}</span>
                <button onclick="blogPlatform.deleteCategory('${category}')" style="background: none; border: none; color: #dc3545; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        this.updateCategorySelect();
    }

    updateCategorySelect() {
        const select = document.getElementById('postCategory');
        const currentValue = select.value;
        
        select.innerHTML = '<option value="">カテゴリを選択</option>' +
            this.categories.map(category => 
                `<option value="${category}">${category}</option>`
            ).join('');
        
        select.value = currentValue;
    }

    addCategory() {
        const categoryName = prompt('新しいカテゴリ名を入力してください:');
        if (categoryName && !this.categories.includes(categoryName)) {
            this.categories.push(categoryName);
            this.renderCategories();
        }
    }

    deleteCategory(categoryName) {
        if (confirm(`カテゴリ「${categoryName}」を削除しますか？`)) {
            this.categories = this.categories.filter(cat => cat !== categoryName);
            this.renderCategories();
            
            // 該当カテゴリの投稿を更新
            this.posts.forEach(post => {
                if (post.category === categoryName) {
                    post.category = '';
                }
            });
            this.renderPostsList();
        }
    }

    publishBlog() {
        const publishedPosts = this.posts.filter(post => !post.isDraft);
        
        if (publishedPosts.length === 0) {
            alert('公開可能な投稿がありません。');
            return;
        }
        
        const blogHTML = this.generateBlogHTML(publishedPosts);
        const blob = new Blob([blogHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blog.html';
        a.click();
        URL.revokeObjectURL(url);
        
        alert(`${publishedPosts.length}件の投稿をブログとして出力しました。`);
    }

    generateBlogHTML(posts) {
        const postsList = posts.map(post => `
            <article class="blog-post">
                <header class="post-header">
                    <h2><a href="#post-${post.id}">${post.title}</a></h2>
                    <div class="post-meta">
                        <span class="date">${post.createdAt.toLocaleDateString()}</span>
                        ${post.category ? `<span class="category">${post.category}</span>` : ''}
                        ${post.tags.length > 0 ? `<div class="tags">${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
                    </div>
                </header>
                <div class="post-content">
                    ${marked.parse(post.content)}
                </div>
            </article>
        `).join('');

        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Blog</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; background: #f8f9fa; }
        header { text-align: center; margin-bottom: 3rem; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; }
        .blog-post { background: white; margin-bottom: 2rem; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .post-header h2 { margin-bottom: 1rem; }
        .post-header a { text-decoration: none; color: #333; }
        .post-meta { margin-bottom: 1.5rem; font-size: 0.9rem; color: #666; }
        .category { background: #667eea; color: white; padding: 0.25rem 0.75rem; border-radius: 15px; margin-left: 1rem; }
        .tags { margin-top: 0.5rem; }
        .tag { background: #f1f3f4; color: #666; padding: 0.25rem 0.5rem; border-radius: 12px; margin-right: 0.5rem; font-size: 0.8rem; }
        .post-content h1, .post-content h2, .post-content h3 { margin-bottom: 1rem; color: #333; }
        .post-content p { margin-bottom: 1rem; }
        .post-content code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; }
        .post-content pre { background: #f5f5f5; padding: 1rem; border-radius: 6px; overflow-x: auto; }
        .post-content blockquote { border-left: 4px solid #667eea; padding-left: 1rem; color: #666; }
    </style>
</head>
<body>
    <header>
        <h1>My Blog</h1>
        <p>ブログプラットフォームで作成されました</p>
    </header>
    <main>
        ${postsList}
    </main>
</body>
</html>`;
    }
}

let blogPlatform;

document.addEventListener('DOMContentLoaded', () => {
    blogPlatform = new BlogPlatform();
});