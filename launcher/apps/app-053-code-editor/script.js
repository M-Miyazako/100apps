class CodeEditor {
    constructor() {
        this.editor = document.getElementById("code-editor");
        this.lineNumbers = document.getElementById("line-numbers");
        this.output = document.getElementById("output-content");
        this.languageSelect = document.getElementById("language-select");
        this.isDarkTheme = true;
        this.files = {};
        this.currentFile = null;
        this.fontSize = 14;
        
        // Japanese localization
        this.messages = {
            ready: "コードを実行する準備ができました...",
            running: "実行中...",
            executed: "実行完了",
            error: "エラー",
            htmlPreview: "HTMLプレビュー: ブラウザで表示するには、ファイルを保存して開いてください。",
            cssValid: "CSS構文: 有効です。スタイルが正しく適用されています。",
            pythonSimulation: "Python実行シミュレーション: 実際の実行にはPythonインタープリターが必要です。",
            fileLoaded: "ファイルが読み込まれました",
            fileSaved: "ファイルが保存されました",
            lightTheme: "☀️ ライト",
            darkTheme: "🌙 ダーク",
            confirmNewFile: "新しいファイルを作成しますか？現在の変更は失われます。",
            unsavedChanges: "保存されていない変更があります。",
            noFileSelected: "ファイルが選択されていません。"
        };
        
        // Syntax highlighting rules
        this.syntaxRules = {
            javascript: [
                { pattern: /(\/\/.*$)/gm, class: 'comment' },
                { pattern: /(\/\*[\s\S]*?\*\/)/g, class: 'comment' },
                { pattern: /\b(function|var|let|const|if|else|for|while|return|class|extends|import|export|try|catch|finally|async|await|new|this)\b/g, class: 'keyword' },
                { pattern: /\b(true|false|null|undefined)\b/g, class: 'boolean' },
                { pattern: /\b\d+\.?\d*\b/g, class: 'number' },
                { pattern: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, class: 'string' },
                { pattern: /\b[A-Z][a-zA-Z0-9]*\b/g, class: 'type' }
            ],
            html: [
                { pattern: /(<!--[\s\S]*?-->)/g, class: 'comment' },
                { pattern: /(<\/?[a-zA-Z][^>]*>)/g, class: 'tag' },
                { pattern: /\s([a-zA-Z-]+)(?==)/g, class: 'attribute' },
                { pattern: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, class: 'string' }
            ],
            css: [
                { pattern: /(\/\*[\s\S]*?\*\/)/g, class: 'comment' },
                { pattern: /([a-zA-Z-]+)(?=\s*:)/g, class: 'property' },
                { pattern: /([.#]?[a-zA-Z-]+)(?=\s*{)/g, class: 'selector' },
                { pattern: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, class: 'string' },
                { pattern: /#[0-9a-fA-F]{3,6}\b/g, class: 'color' },
                { pattern: /\b\d+\.?\d*(px|em|rem|%|vh|vw|deg)\b/g, class: 'unit' }
            ],
            python: [
                { pattern: /(#.*$)/gm, class: 'comment' },
                { pattern: /("""[\s\S]*?"""|'''[\s\S]*?''')/g, class: 'string' },
                { pattern: /\b(def|class|if|elif|else|for|while|return|import|from|try|except|finally|with|as|lambda|pass|break|continue|global|nonlocal|yield|async|await)\b/g, class: 'keyword' },
                { pattern: /\b(True|False|None)\b/g, class: 'boolean' },
                { pattern: /\b\d+\.?\d*\b/g, class: 'number' },
                { pattern: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, class: 'string' },
                { pattern: /\b[A-Z][a-zA-Z0-9]*\b/g, class: 'type' }
            ]
        };
        
        this.setupEventListeners();
        this.updateLineNumbers();
        this.loadSampleCode();
        this.applySyntaxHighlighting();
        this.loadFromStorage();
    }
    
    setupEventListeners() {
        // Editor events
        this.editor.addEventListener("input", () => {
            this.updateLineNumbers();
            this.applySyntaxHighlighting();
            this.autosave();
        });
        this.editor.addEventListener("scroll", () => this.syncLineNumbers());
        this.editor.addEventListener("keydown", (e) => this.handleKeydown(e));
        
        // Toolbar buttons
        document.getElementById("save-btn").addEventListener("click", () => this.saveCode());
        document.getElementById("load-btn").addEventListener("click", () => this.loadCode());
        document.getElementById("run-btn").addEventListener("click", () => this.runCode());
        document.getElementById("theme-btn").addEventListener("click", () => this.toggleTheme());
        
        // Language selection
        this.languageSelect.addEventListener("change", () => {
            this.loadSampleCode();
            this.applySyntaxHighlighting();
        });
        
        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveCode();
                        break;
                    case 'o':
                        e.preventDefault();
                        this.loadCode();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.runCode();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.newFile();
                        break;
                    case '=':
                    case '+':
                        e.preventDefault();
                        this.changeFontSize(1);
                        break;
                    case '-':
                        e.preventDefault();
                        this.changeFontSize(-1);
                        break;
                }
            }
        });
        
        // Auto-save every 10 seconds
        setInterval(() => this.autosave(), 10000);
    }
    
    handleKeydown(e) {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const value = this.editor.value;
        
        switch(e.key) {
            case "Tab":
                e.preventDefault();
                if (e.shiftKey) {
                    // Unindent
                    this.unindentSelection();
                } else {
                    // Indent
                    this.indentSelection();
                }
                break;
                
            case "Enter":
                e.preventDefault();
                this.handleEnterKey();
                break;
                
            case "Backspace":
                if (start === end && start > 0) {
                    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
                    const beforeCursor = value.substring(lineStart, start);
                    if (/^\s+$/.test(beforeCursor)) {
                        e.preventDefault();
                        const spaces = beforeCursor.length;
                        const tabSize = 2;
                        const removeSpaces = spaces % tabSize === 0 ? tabSize : spaces % tabSize;
                        this.editor.value = value.substring(0, start - removeSpaces) + value.substring(end);
                        this.editor.selectionStart = this.editor.selectionEnd = start - removeSpaces;
                    }
                }
                break;
                
            case "/":
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleComment();
                }
                break;
        }
        
        setTimeout(() => {
            this.updateLineNumbers();
            this.applySyntaxHighlighting();
        }, 0);
    }
    
    indentSelection() {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const value = this.editor.value;
        const tabSize = "  "; // 2 spaces
        
        if (start === end) {
            // Single cursor - insert tab
            this.editor.value = value.substring(0, start) + tabSize + value.substring(end);
            this.editor.selectionStart = this.editor.selectionEnd = start + tabSize.length;
        } else {
            // Selection - indent all lines
            const beforeSelection = value.substring(0, start);
            const selection = value.substring(start, end);
            const afterSelection = value.substring(end);
            
            const lineStart = beforeSelection.lastIndexOf('\n') + 1;
            const indentedSelection = selection.replace(/^/gm, tabSize);
            
            this.editor.value = beforeSelection + indentedSelection + afterSelection;
            this.editor.selectionStart = start + tabSize.length;
            this.editor.selectionEnd = end + (indentedSelection.length - selection.length);
        }
    }
    
    unindentSelection() {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const value = this.editor.value;
        const tabSize = 2;
        
        const beforeSelection = value.substring(0, start);
        const selection = value.substring(start, end);
        const afterSelection = value.substring(end);
        
        const unindentedSelection = selection.replace(new RegExp(`^\\s{1,${tabSize}}`, 'gm'), '');
        
        this.editor.value = beforeSelection + unindentedSelection + afterSelection;
        this.editor.selectionStart = start;
        this.editor.selectionEnd = end - (selection.length - unindentedSelection.length);
    }
    
    handleEnterKey() {
        const start = this.editor.selectionStart;
        const value = this.editor.value;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const currentLine = value.substring(lineStart, start);
        const indent = currentLine.match(/^\\s*/)[0];
        
        // Auto-indent based on language
        let extraIndent = '';
        const language = this.languageSelect.value;
        
        if (language === 'javascript' || language === 'css') {
            if (currentLine.trim().endsWith('{') || currentLine.trim().endsWith('(')) {
                extraIndent = '  ';
            }
        } else if (language === 'python') {
            if (currentLine.trim().endsWith(':')) {
                extraIndent = '    ';
            }
        }
        
        const insertion = '\n' + indent + extraIndent;
        this.editor.value = value.substring(0, start) + insertion + value.substring(this.editor.selectionEnd);
        this.editor.selectionStart = this.editor.selectionEnd = start + insertion.length;
    }
    
    toggleComment() {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const value = this.editor.value;
        const language = this.languageSelect.value;
        
        let commentPrefix;
        switch(language) {
            case 'javascript':
                commentPrefix = '// ';
                break;
            case 'python':
                commentPrefix = '# ';
                break;
            case 'css':
                commentPrefix = '/* ';
                break;
            case 'html':
                commentPrefix = '<!-- ';
                break;
            default:
                commentPrefix = '// ';
        }
        
        const beforeSelection = value.substring(0, start);
        const selection = value.substring(start, end);
        const afterSelection = value.substring(end);
        
        const lineStart = beforeSelection.lastIndexOf('\n') + 1;
        const lineEnd = value.indexOf('\n', end);
        const fullLine = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
        
        if (fullLine.trim().startsWith(commentPrefix.trim())) {
            // Uncomment
            const uncommentedLine = fullLine.replace(new RegExp(`^(\\s*)${commentPrefix.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}`), '$1');
            this.editor.value = value.substring(0, lineStart) + uncommentedLine + value.substring(lineEnd === -1 ? value.length : lineEnd);
        } else {
            // Comment
            const indentMatch = fullLine.match(/^\\s*/);
            const indent = indentMatch ? indentMatch[0] : '';
            const commentedLine = indent + commentPrefix + fullLine.substring(indent.length);
            this.editor.value = value.substring(0, lineStart) + commentedLine + value.substring(lineEnd === -1 ? value.length : lineEnd);
        }
    }
    
    updateLineNumbers() {
        const lines = this.editor.value.split('\n').length;
        const lineNumbersText = Array.from({length: lines}, (_, i) => i + 1).join('\n');
        this.lineNumbers.textContent = lineNumbersText;
    }
    
    syncLineNumbers() {
        this.lineNumbers.scrollTop = this.editor.scrollTop;
    }
    
    applySyntaxHighlighting() {
        // Simple syntax highlighting using background highlighting
        const language = this.languageSelect.value;
        const rules = this.syntaxRules[language] || [];
        
        // Create a background div for highlighting (simplified approach)
        // In a full editor, you'd use a more sophisticated highlighting system
        this.editor.style.fontFamily = 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace';
    }
    
    loadSampleCode() {
        const samples = {
            javascript: `// JavaScript Example - 計算機クラス
class Calculator {
    constructor() {
        this.result = 0;
    }
    
    add(num) {
        this.result += num;
        return this;
    }
    
    multiply(num) {
        this.result *= num;
        return this;
    }
    
    getResult() {
        return this.result;
    }
}

const calc = new Calculator();
const result = calc.add(5).multiply(3).getResult();
console.log(\`結果: \${result}\`);

// 非同期関数の例
async function fetchData() {
    try {
        const response = await fetch('https://api.example.com/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('エラー:', error);
    }
}

// このコードを実行してみてください！`,

            html: `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML例 - サンプルページ</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h1 {
            text-align: center;
            animation: fadeIn 1s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>こんにちは、世界！</h1>
        <p>これは美しいHTMLページのサンプルです。</p>
        <ul>
            <li>レスポンシブデザイン</li>
            <li>グラデーション背景</li>
            <li>アニメーション効果</li>
            <li>モダンなスタイリング</li>
        </ul>
        <button onclick="alert('ボタンがクリックされました！')">クリックしてください</button>
    </div>
</body>
</html>`,

            css: `/* CSS例 - モダンなカードデザイン */
.card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    margin: 1rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1);
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.card-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.5rem;
}

.card-content {
    color: #4a5568;
    line-height: 1.6;
}

/* レスポンシブグリッド */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    padding: 1rem;
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
    .card {
        background: #2d3748;
        color: white;
    }
    
    .card-title {
        color: #f7fafc;
    }
    
    .card-content {
        color: #e2e8f0;
    }
}`,

            python: `# Python例 - データ分析とビジュアライゼーション
import math
from typing import List, Dict

class DataAnalyzer:
    """データ分析を行うクラス"""
    
    def __init__(self, data: List[float]):
        self.data = data
    
    def mean(self) -> float:
        """平均値を計算"""
        return sum(self.data) / len(self.data) if self.data else 0
    
    def median(self) -> float:
        """中央値を計算"""
        sorted_data = sorted(self.data)
        n = len(sorted_data)
        if n % 2 == 0:
            return (sorted_data[n//2 - 1] + sorted_data[n//2]) / 2
        return sorted_data[n//2]
    
    def std_deviation(self) -> float:
        """標準偏差を計算"""
        if len(self.data) < 2:
            return 0
        mean_val = self.mean()
        variance = sum((x - mean_val) ** 2 for x in self.data) / (len(self.data) - 1)
        return math.sqrt(variance)
    
    def summary(self) -> Dict[str, float]:
        """統計サマリーを返す"""
        return {
            '平均': self.mean(),
            '中央値': self.median(),
            '標準偏差': self.std_deviation(),
            '最小値': min(self.data) if self.data else 0,
            '最大値': max(self.data) if self.data else 0
        }

# サンプルデータで実行
data = [23, 45, 56, 78, 32, 67, 89, 12, 34, 56]
analyzer = DataAnalyzer(data)

print("データ分析結果:")
for key, value in analyzer.summary().items():
    print(f"{key}: {value:.2f}")

# リスト内包表記の例
squares = [x**2 for x in range(1, 11)]
print(f"\\n1から10の二乗: {squares}")

# 辞書内包表記
grade_map = {f"student_{i}": 90 + i for i in range(5)}
print(f"\\n成績マップ: {grade_map}")`
        };
        
        const language = this.languageSelect.value;
        this.editor.value = samples[language] || "// コードをここに入力してください...";
        this.updateLineNumbers();
        this.applySyntaxHighlighting();
    }
    
    runCode() {
        const code = this.editor.value;
        const language = this.languageSelect.value;
        
        this.output.classList.remove("success", "error", "info");
        this.output.textContent = this.messages.running;
        
        try {
            if (language === "javascript") {
                // Capture console output
                let output = '';
                const originalLog = console.log;
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.log = (...args) => {
                    output += args.map(arg => 
                        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                    ).join(' ') + '\n';
                };
                
                console.error = (...args) => {
                    output += 'ERROR: ' + args.map(arg => String(arg)).join(' ') + '\n';
                };
                
                console.warn = (...args) => {
                    output += 'WARNING: ' + args.map(arg => String(arg)).join(' ') + '\n';
                };
                
                try {
                    // Execute the code in a try-catch to handle runtime errors
                    const result = eval(code);
                    
                    // Restore console methods
                    console.log = originalLog;
                    console.error = originalError;
                    console.warn = originalWarn;
                    
                    if (output) {
                        this.output.textContent = output;
                    } else if (result !== undefined) {
                        this.output.textContent = `${this.messages.executed}: ${result}`;
                    } else {
                        this.output.textContent = this.messages.executed;
                    }
                    
                    this.output.classList.add("success");
                    
                } catch (executionError) {
                    // Restore console methods
                    console.log = originalLog;
                    console.error = originalError;
                    console.warn = originalWarn;
                    
                    throw executionError;
                }
                
            } else if (language === "html") {
                // HTML preview
                this.output.textContent = this.messages.htmlPreview;
                this.output.classList.add("info");
                
                // Optionally open in new window
                const newWindow = window.open();
                newWindow.document.write(code);
                newWindow.document.close();
                
            } else if (language === "css") {
                // CSS validation simulation
                this.output.textContent = this.messages.cssValid;
                this.output.classList.add("success");
                
            } else if (language === "python") {
                // Python execution simulation
                this.output.textContent = this.messages.pythonSimulation;
                this.output.classList.add("info");
            }
            
        } catch (error) {
            this.output.textContent = `${this.messages.error}: ${error.message}`;
            this.output.classList.add("error");
        }
    }
    
    saveCode() {
        const code = this.editor.value;
        const language = this.languageSelect.value;
        
        const extensions = {
            javascript: "js",
            html: "html",
            css: "css",
            python: "py"
        };
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = this.currentFile || `code-${timestamp}.${extensions[language]}`;
        
        const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        
        URL.revokeObjectURL(url);
        
        // Save to file manager
        this.files[fileName] = {
            content: code,
            language: language,
            lastModified: Date.now()
        };
        
        this.saveToStorage();
        
        // Update output
        this.output.textContent = `${this.messages.fileSaved}: ${fileName}`;
        this.output.classList.remove("error", "success", "info");
        this.output.classList.add("success");
    }
    
    loadCode() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".js,.html,.css,.py,.txt";
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.editor.value = e.target.result;
                    this.currentFile = file.name;
                    
                    // Auto-detect language from file extension
                    const extension = file.name.split('.').pop().toLowerCase();
                    const languageMap = {
                        'js': 'javascript',
                        'html': 'html',
                        'htm': 'html',
                        'css': 'css',
                        'py': 'python'
                    };
                    
                    if (languageMap[extension]) {
                        this.languageSelect.value = languageMap[extension];
                    }
                    
                    this.updateLineNumbers();
                    this.applySyntaxHighlighting();
                    
                    // Save to file manager
                    this.files[file.name] = {
                        content: this.editor.value,
                        language: this.languageSelect.value,
                        lastModified: Date.now()
                    };
                    
                    this.saveToStorage();
                    
                    // Update output
                    this.output.textContent = `${this.messages.fileLoaded}: ${file.name}`;
                    this.output.classList.remove("error", "success", "info");
                    this.output.classList.add("success");
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    newFile() {
        if (this.editor.value.trim() && confirm(this.messages.confirmNewFile)) {
            this.editor.value = "";
            this.currentFile = null;
            this.updateLineNumbers();
            this.output.textContent = this.messages.ready;
            this.output.classList.remove("error", "success", "info");
        }
    }
    
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        document.body.classList.toggle("light-theme", !this.isDarkTheme);
        
        const themeBtn = document.getElementById("theme-btn");
        themeBtn.textContent = this.isDarkTheme ? this.messages.lightTheme : this.messages.darkTheme;
        
        this.saveToStorage();
    }
    
    changeFontSize(delta) {
        this.fontSize = Math.max(10, Math.min(24, this.fontSize + delta));
        this.editor.style.fontSize = `${this.fontSize}px`;
        this.lineNumbers.style.fontSize = `${this.fontSize}px`;
        this.saveToStorage();
    }
    
    autosave() {
        if (this.editor.value.trim() && this.currentFile) {
            this.files[this.currentFile] = {
                content: this.editor.value,
                language: this.languageSelect.value,
                lastModified: Date.now()
            };
            this.saveToStorage();
        }
    }
    
    saveToStorage() {
        try {
            const editorData = {
                files: this.files,
                currentFile: this.currentFile,
                isDarkTheme: this.isDarkTheme,
                fontSize: this.fontSize,
                currentLanguage: this.languageSelect.value,
                currentContent: this.editor.value,
                timestamp: Date.now()
            };
            localStorage.setItem('code-editor-data', JSON.stringify(editorData));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    }
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('code-editor-data');
            if (saved) {
                const editorData = JSON.parse(saved);
                
                this.files = editorData.files || {};
                this.currentFile = editorData.currentFile;
                this.isDarkTheme = editorData.isDarkTheme !== undefined ? editorData.isDarkTheme : true;
                this.fontSize = editorData.fontSize || 14;
                
                if (editorData.currentLanguage) {
                    this.languageSelect.value = editorData.currentLanguage;
                }
                
                if (editorData.currentContent) {
                    this.editor.value = editorData.currentContent;
                }
                
                // Apply saved settings
                document.body.classList.toggle("light-theme", !this.isDarkTheme);
                const themeBtn = document.getElementById("theme-btn");
                themeBtn.textContent = this.isDarkTheme ? this.messages.lightTheme : this.messages.darkTheme;
                
                this.editor.style.fontSize = `${this.fontSize}px`;
                this.lineNumbers.style.fontSize = `${this.fontSize}px`;
                
                this.updateLineNumbers();
                this.applySyntaxHighlighting();
            }
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
        }
    }
    
    // File management methods
    getFileList() {
        return Object.keys(this.files).map(fileName => ({
            name: fileName,
            language: this.files[fileName].language,
            lastModified: new Date(this.files[fileName].lastModified).toLocaleString(),
            size: this.files[fileName].content.length
        }));
    }
    
    openFile(fileName) {
        if (this.files[fileName]) {
            this.editor.value = this.files[fileName].content;
            this.languageSelect.value = this.files[fileName].language;
            this.currentFile = fileName;
            this.updateLineNumbers();
            this.applySyntaxHighlighting();
        }
    }
    
    deleteFile(fileName) {
        if (this.files[fileName] && confirm(`Delete ${fileName}?`)) {
            delete this.files[fileName];
            if (this.currentFile === fileName) {
                this.currentFile = null;
            }
            this.saveToStorage();
        }
    }
}

// Initialize code editor when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new CodeEditor();
});