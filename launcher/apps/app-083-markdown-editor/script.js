class MarkdownEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.preview = document.getElementById('preview');
        
        this.initializeEventListeners();
        this.updatePreview();
        
        // 初期コンテンツ
        this.editor.value = `# Markdown Editor へようこそ

これは **リアルタイムプレビュー** 付きのMarkdownエディターです。

## 機能

- **太字**、*斜体*、~~取り消し線~~
- [リンク](https://example.com)
- コードブロック
- テーブル
- リスト

### コード例

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

### テーブル

| 項目 | 説明 |
|------|------|
| Markdown | 軽量マークアップ言語 |
| HTML | ハイパーテキストマークアップ言語 |

### リスト

- 項目1
- 項目2
  - サブ項目
  - サブ項目

1. 番号付きリスト
2. 項目2
3. 項目3

> これは引用文です。Markdownでは > を使って引用を表現できます。

---

左側でMarkdownを編集すると、右側にリアルタイムでプレビューが表示されます。`;
        
        this.updatePreview();
    }

    initializeEventListeners() {
        // エディターの入力イベント
        this.editor.addEventListener('input', () => {
            this.updatePreview();
        });

        // ツールバーボタン
        document.getElementById('bold').addEventListener('click', () => {
            this.insertText('**', '**');
        });

        document.getElementById('italic').addEventListener('click', () => {
            this.insertText('*', '*');
        });

        document.getElementById('heading').addEventListener('click', () => {
            this.insertText('## ', '');
        });

        document.getElementById('link').addEventListener('click', () => {
            this.insertText('[', '](https://example.com)');
        });

        document.getElementById('image').addEventListener('click', () => {
            this.insertText('![', '](https://example.com/image.jpg)');
        });

        document.getElementById('list').addEventListener('click', () => {
            this.insertText('- ', '');
        });

        document.getElementById('table').addEventListener('click', () => {
            this.insertText('\n| 列1 | 列2 |\n|------|------|\n| 値1 | 値2 |\n', '');
        });

        document.getElementById('code').addEventListener('click', () => {
            this.insertText('```\n', '\n```');
        });

        // エクスポート機能
        document.getElementById('exportHTML').addEventListener('click', () => {
            this.exportHTML();
        });

        document.getElementById('exportPDF').addEventListener('click', () => {
            this.exportPDF();
        });

        document.getElementById('saveFile').addEventListener('click', () => {
            this.saveFile();
        });

        // キーボードショートカット
        this.editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'b':
                        e.preventDefault();
                        this.insertText('**', '**');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.insertText('*', '*');
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveFile();
                        break;
                }
            }
        });
    }

    insertText(before, after) {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const selectedText = this.editor.value.substring(start, end);
        const replacement = before + selectedText + after;
        
        this.editor.value = this.editor.value.substring(0, start) + replacement + this.editor.value.substring(end);
        
        // カーソル位置を調整
        const newCursorPos = start + before.length + selectedText.length;
        this.editor.setSelectionRange(newCursorPos, newCursorPos);
        this.editor.focus();
        
        this.updatePreview();
    }

    updatePreview() {
        const markdown = this.editor.value;
        const html = marked.parse(markdown);
        this.preview.innerHTML = html;
        
        // コードハイライト
        if (window.Prism) {
            Prism.highlightAllUnder(this.preview);
        }
    }

    exportHTML() {
        const markdown = this.editor.value;
        const html = marked.parse(markdown);
        const fullHTML = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
        h1, h2, h3 { margin-bottom: 1rem; color: #333; }
        p { margin-bottom: 1rem; }
        code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; }
        pre { background: #f5f5f5; padding: 1rem; border-radius: 6px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
        th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
${html}
</body>
</html>`;

        this.downloadFile(fullHTML, 'document.html', 'text/html');
    }

    exportPDF() {
        // 簡易的なPDF出力（印刷機能を使用）
        const markdown = this.editor.value;
        const html = marked.parse(markdown);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>PDF Export</title>
                <style>
                    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
                    h1, h2, h3 { color: #333; }
                    pre { background: #f5f5f5; padding: 1rem; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 0.5rem; }
                </style>
            </head>
            <body>${html}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }

    saveFile() {
        const content = this.editor.value;
        this.downloadFile(content, 'document.md', 'text/markdown');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new MarkdownEditor();
});