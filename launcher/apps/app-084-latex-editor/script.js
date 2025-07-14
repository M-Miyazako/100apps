class LaTeXEditor {
    constructor() {
        this.editor = document.getElementById('latexEditor');
        this.preview = document.getElementById('mathPreview');
        
        this.initializeEventListeners();
        this.setupMathJax();
        
        // 初期コンテンツ
        this.editor.value = `\\documentclass{article}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}

\\title{LaTeX Document}
\\author{作成者}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{はじめに}

これはLaTeX エディターのサンプルドキュメントです。

\\section{数式の例}

インライン数式: $E = mc^2$

ディスプレイ数式:
\\[
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\\]

行列:
\\[
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
\\]

\\section{リスト}

\\begin{itemize}
\\item 項目1
\\item 項目2
\\item 項目3
\\end{itemize}

\\end{document}`;
        
        this.updatePreview();
    }

    initializeEventListeners() {
        this.editor.addEventListener('input', () => {
            clearTimeout(this.updateTimeout);
            this.updateTimeout = setTimeout(() => {
                this.updatePreview();
            }, 500);
        });

        document.getElementById('compile').addEventListener('click', () => {
            this.updatePreview();
        });

        document.getElementById('download').addEventListener('click', () => {
            this.downloadPDF();
        });
    }

    setupMathJax() {
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                processEscapes: true,
                processEnvironments: true
            },
            options: {
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
            }
        };
    }

    updatePreview() {
        const latex = this.editor.value;
        
        // LaTeX から HTML への簡易変換
        let html = latex
            .replace(/\\documentclass\{[^}]*\}/g, '')
            .replace(/\\usepackage\{[^}]*\}/g, '')
            .replace(/\\title\{([^}]*)\}/g, '<h1>$1</h1>')
            .replace(/\\author\{([^}]*)\}/g, '<p><em>作成者: $1</em></p>')
            .replace(/\\date\{[^}]*\}/g, '')
            .replace(/\\maketitle/g, '')
            .replace(/\\begin\{document\}/g, '')
            .replace(/\\end\{document\}/g, '')
            .replace(/\\section\{([^}]*)\}/g, '<h2>$1</h2>')
            .replace(/\\subsection\{([^}]*)\}/g, '<h3>$1</h3>')
            .replace(/\\begin\{itemize\}/g, '<ul>')
            .replace(/\\end\{itemize\}/g, '</ul>')
            .replace(/\\item\s+/g, '<li>')
            .replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>')
            .replace(/\\textit\{([^}]*)\}/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(?!<[uh]|<li)(.+)$/gm, '<p>$1</p>')
            .replace(/<p><\/p>/g, '')
            .replace(/<p>(<[uh])/g, '$1')
            .replace(/(<\/[uh]>)<\/p>/g, '$1');

        this.preview.innerHTML = html;
        
        // MathJax で数式をレンダリング
        if (window.MathJax) {
            MathJax.typesetPromise([this.preview]).catch(err => {
                console.error('MathJax error:', err);
            });
        }
    }

    downloadPDF() {
        // 簡易的なPDF出力（印刷機能を使用）
        const content = this.preview.innerHTML;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>LaTeX PDF Export</title>
                <style>
                    body { font-family: serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
                    h1, h2, h3 { color: #333; margin-bottom: 1rem; }
                    p { margin-bottom: 1rem; text-align: justify; }
                    ul { margin-left: 2rem; margin-bottom: 1rem; }
                </style>
                <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
                <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
            </head>
            <body>${content}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LaTeXEditor();
});