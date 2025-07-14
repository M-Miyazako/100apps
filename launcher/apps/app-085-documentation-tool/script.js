class DocumentationTool {
    constructor() {
        this.pages = [
            {
                id: 1,
                title: '概要',
                content: `# プロジェクト概要

このドキュメントはプロジェクトの概要を説明します。

## 目的

このプロジェクトの主な目的は...

## 特徴

- 機能1
- 機能2
- 機能3`
            }
        ];
        this.currentPage = this.pages[0];
        
        this.initializeEventListeners();
        this.renderPageTree();
        this.loadPage(this.currentPage);
    }

    initializeEventListeners() {
        document.getElementById('addPage').addEventListener('click', () => {
            this.addPage();
        });

        document.getElementById('pageTitle').addEventListener('input', (e) => {
            if (this.currentPage) {
                this.currentPage.title = e.target.value;
                this.renderPageTree();
            }
        });

        document.getElementById('contentEditor').addEventListener('input', (e) => {
            if (this.currentPage) {
                this.currentPage.content = e.target.value;
                this.updatePreview();
            }
        });

        document.getElementById('pageTemplate').addEventListener('change', (e) => {
            this.applyTemplate(e.target.value);
        });

        document.getElementById('exportDocs').addEventListener('click', () => {
            this.exportDocs();
        });

        document.getElementById('saveDocs').addEventListener('click', () => {
            this.saveDocs();
        });

        document.getElementById('togglePreview').addEventListener('click', () => {
            this.togglePreview();
        });
    }

    addPage() {
        const newPage = {
            id: Date.now(),
            title: '新しいページ',
            content: '# 新しいページ\n\nここにコンテンツを書いてください。'
        };
        
        this.pages.push(newPage);
        this.renderPageTree();
        this.loadPage(newPage);
    }

    loadPage(page) {
        this.currentPage = page;
        document.getElementById('pageTitle').value = page.title;
        document.getElementById('contentEditor').value = page.content;
        this.updatePreview();
        this.highlightActivePage();
    }

    highlightActivePage() {
        document.querySelectorAll('.page-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-page-id="${this.currentPage.id}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    renderPageTree() {
        const tree = document.getElementById('pageTree');
        tree.innerHTML = this.pages.map(page => `
            <div class="page-item" data-page-id="${page.id}" onclick="docTool.loadPage(${JSON.stringify(page).replace(/"/g, '&quot;')})">
                <i class="fas fa-file-alt"></i>
                <span>${page.title}</span>
            </div>
        `).join('');
    }

    updatePreview() {
        const content = document.getElementById('contentEditor').value;
        const html = marked.parse(content);
        document.getElementById('docPreview').innerHTML = html;
    }

    applyTemplate(templateType) {
        const templates = {
            blank: '# タイトル\n\nコンテンツをここに書いてください。',
            api: `# API リファレンス

## エンドポイント

### GET /api/users

ユーザー一覧を取得します。

**パラメータ:**
- \`limit\` (number): 取得件数
- \`offset\` (number): オフセット

**レスポンス:**
\`\`\`json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
\`\`\``,
            guide: `# ユーザーガイド

## はじめに

このガイドでは、アプリケーションの使用方法について説明します。

## ステップ1: セットアップ

1. アプリケーションをダウンロード
2. インストール
3. 初期設定

## ステップ2: 基本的な使い方

...`,
            reference: `# リファレンス

## 関数一覧

### function1()

説明: この関数は...

**パラメータ:**
- \`param1\` (string): パラメータの説明
- \`param2\` (number): パラメータの説明

**戻り値:**
- \`return\` (boolean): 戻り値の説明

**例:**
\`\`\`javascript
const result = function1("test", 123);
\`\`\``
        };

        if (templates[templateType]) {
            document.getElementById('contentEditor').value = templates[templateType];
            if (this.currentPage) {
                this.currentPage.content = templates[templateType];
                this.updatePreview();
            }
        }
    }

    togglePreview() {
        const previewSection = document.querySelector('.preview-section');
        const isHidden = previewSection.style.display === 'none';
        previewSection.style.display = isHidden ? 'flex' : 'none';
        
        const mainContent = document.querySelector('.main-content');
        mainContent.style.gridTemplateColumns = isHidden ? 
            '300px 1fr 1fr' : '300px 1fr';
    }

    exportDocs() {
        const docHTML = this.generateDocumentationHTML();
        const blob = new Blob([docHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'documentation.html';
        a.click();
        URL.revokeObjectURL(url);
    }

    generateDocumentationHTML() {
        const navigation = this.pages.map(page => 
            `<li><a href="#page-${page.id}">${page.title}</a></li>`
        ).join('');

        const content = this.pages.map(page => `
            <section id="page-${page.id}">
                ${marked.parse(page.content)}
            </section>
        `).join('');

        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ドキュメント</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
        nav { background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
        nav ul { list-style: none; padding: 0; }
        nav li { margin-bottom: 0.5rem; }
        nav a { text-decoration: none; color: #007bff; }
        h1, h2, h3 { margin-bottom: 1rem; color: #333; }
        p { margin-bottom: 1rem; }
        code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; }
        pre { background: #f5f5f5; padding: 1rem; border-radius: 6px; overflow-x: auto; }
        section { margin-bottom: 3rem; }
    </style>
</head>
<body>
    <nav>
        <h2>目次</h2>
        <ul>${navigation}</ul>
    </nav>
    <main>${content}</main>
</body>
</html>`;
    }

    saveDocs() {
        const docsData = JSON.stringify(this.pages, null, 2);
        const blob = new Blob([docsData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'documentation.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}

let docTool;

document.addEventListener('DOMContentLoaded', () => {
    docTool = new DocumentationTool();
});