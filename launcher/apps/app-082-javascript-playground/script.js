class JavaScriptPlayground {
    constructor() {
        this.editor = null;
        this.currentSnippet = null;
        this.snippets = this.loadSnippets();
        this.autoRunEnabled = false;
        this.autoRunTimeout = null;
        this.executionHistory = [];
        this.fontSize = 14;
        
        this.initializeEditor();
        this.initializeEventListeners();
        this.loadExamples();
        this.updateSnippetsList();
    }

    async initializeEditor() {
        // Monaco Editor の初期化
        require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.41.0/min/vs' } });
        
        require(['vs/editor/editor.main'], () => {
            this.editor = monaco.editor.create(document.getElementById('editor'), {
                value: `// JavaScript Playground へようこそ！
// ここにコードを書いて、Ctrl+Enter で実行してください

console.log('Hello, JavaScript Playground!');

// 例：変数の宣言と操作
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('元の配列:', numbers);
console.log('2倍した配列:', doubled);

// 例：非同期処理
async function fetchData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('データを取得しました！');
        }, 1000);
    });
}

// 実行してみてください
fetchData().then(data => console.log(data));`,
                language: 'javascript',
                theme: 'vs-dark',
                fontSize: this.fontSize,
                minimap: { enabled: true },
                wordWrap: 'off',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                renderLineHighlight: 'line',
                contextmenu: true,
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: 'on',
                tabCompletion: 'on',
                parameterHints: { enabled: true },
                formatOnPaste: true,
                formatOnType: true
            });

            // エディターイベント
            this.editor.onDidChangeModelContent(() => {
                this.updateEditorInfo();
                this.validateSyntax();
                
                if (this.autoRunEnabled) {
                    clearTimeout(this.autoRunTimeout);
                    this.autoRunTimeout = setTimeout(() => {
                        this.executeCode();
                    }, 1000);
                }
            });

            this.editor.onDidChangeCursorPosition(() => {
                this.updateEditorInfo();
            });

            this.editor.onDidChangeCursorSelection(() => {
                this.updateSelectionInfo();
            });

            // キーボードショートカット
            this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                this.executeCode();
            });

            this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                this.saveCurrentSnippet();
            });

            this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
                this.formatCode();
            });

            this.updateEditorInfo();
        });
    }

    initializeEventListeners() {
        // ツールバーイベント
        document.getElementById('runCode').addEventListener('click', () => this.executeCode());
        document.getElementById('clearOutput').addEventListener('click', () => this.clearOutput());
        document.getElementById('formatCode').addEventListener('click', () => this.formatCode());
        
        // 設定変更
        document.getElementById('themeSelector').addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });
        
        document.getElementById('strictMode').addEventListener('change', (e) => {
            this.strictMode = e.target.checked;
        });
        
        document.getElementById('autoRun').addEventListener('change', (e) => {
            this.autoRunEnabled = e.target.checked;
            this.showFeedback(this.autoRunEnabled ? '自動実行を有効にしました' : '自動実行を無効にしました');
        });

        // スニペット操作
        document.getElementById('saveSnippet').addEventListener('click', () => this.saveCurrentSnippet());
        document.getElementById('loadSnippet').addEventListener('click', () => this.showSnippetsList());
        document.getElementById('newSnippet').addEventListener('click', () => this.newSnippet());

        // エディター操作
        document.getElementById('toggleWordWrap').addEventListener('click', () => this.toggleWordWrap());
        document.getElementById('toggleMinimap').addEventListener('click', () => this.toggleMinimap());
        document.getElementById('increaseFontSize').addEventListener('click', () => this.changeFontSize(1));
        document.getElementById('decreaseFontSize').addEventListener('click', () => this.changeFontSize(-1));

        // タブ切り替え
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // サイドパネル
        document.getElementById('toggleSidePanel').addEventListener('click', () => {
            this.toggleSidePanel();
        });

        document.querySelectorAll('.side-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSideTab(e.target.dataset.tab);
            });
        });

        // コンソール入力
        document.getElementById('consoleInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeConsoleCommand();
            }
        });

        document.getElementById('executeCommand').addEventListener('click', () => {
            this.executeConsoleCommand();
        });

        // 共有機能
        document.getElementById('shareCode').addEventListener('click', () => this.showShareModal());
        document.getElementById('exportCode').addEventListener('click', () => this.exportCode());
        document.getElementById('closeShareModal').addEventListener('click', () => this.hideShareModal());

        // 共有オプション
        document.getElementById('copyToClipboard').addEventListener('click', () => this.copyToClipboard());
        document.getElementById('exportAsFile').addEventListener('click', () => this.exportAsFile());
        document.getElementById('copyUrl').addEventListener('click', () => this.copyShareUrl());

        // スニペット削除
        document.getElementById('deleteAllSnippets').addEventListener('click', () => this.deleteAllSnippets());

        // サンプルカテゴリ
        document.getElementById('exampleCategory').addEventListener('change', (e) => {
            this.loadExamples(e.target.value);
        });

        // グローバルショートカット
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.executeCode();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveCurrentSnippet();
                        break;
                }
            }
        });
    }

    executeCode() {
        const code = this.editor.getValue();
        if (!code.trim()) {
            this.showFeedback('実行するコードがありません', 'warning');
            return;
        }

        const startTime = performance.now();
        this.clearTab('console');
        this.clearTab('result');
        this.clearTab('errors');

        try {
            // Strict Mode対応
            const strictMode = document.getElementById('strictMode').checked;
            const wrappedCode = strictMode ? `'use strict';\n${code}` : code;

            // カスタムコンソール実装
            const consoleOutput = [];
            const customConsole = {
                log: (...args) => {
                    consoleOutput.push({ type: 'log', args: args });
                    this.addConsoleEntry('log', args);
                },
                error: (...args) => {
                    consoleOutput.push({ type: 'error', args: args });
                    this.addConsoleEntry('error', args);
                },
                warn: (...args) => {
                    consoleOutput.push({ type: 'warn', args: args });
                    this.addConsoleEntry('warn', args);
                },
                info: (...args) => {
                    consoleOutput.push({ type: 'info', args: args });
                    this.addConsoleEntry('info', args);
                }
            };

            // 安全な実行環境
            const safeGlobals = {
                console: customConsole,
                setTimeout,
                setInterval,
                clearTimeout,
                clearInterval,
                Promise,
                fetch: fetch.bind(window),
                Date,
                Math,
                JSON,
                Array,
                Object,
                String,
                Number,
                Boolean,
                RegExp,
                Error,
                parseInt,
                parseFloat,
                isNaN,
                isFinite,
                encodeURIComponent,
                decodeURIComponent,
                btoa,
                atob
            };

            // コード実行
            const func = new Function('console', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 
                'Promise', 'fetch', 'Date', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number', 
                'Boolean', 'RegExp', 'Error', 'parseInt', 'parseFloat', 'isNaN', 'isFinite',
                'encodeURIComponent', 'decodeURIComponent', 'btoa', 'atob', wrappedCode);

            const result = func(...Object.values(safeGlobals));

            // 結果の表示
            if (result !== undefined) {
                this.addResultEntry(result);
            }

            const endTime = performance.now();
            const executionTime = endTime - startTime;

            // パフォーマンス情報
            this.addPerformanceEntry({
                executionTime: executionTime.toFixed(2),
                codeLength: code.length,
                timestamp: new Date().toISOString()
            });

            // 実行履歴に追加
            this.executionHistory.push({
                code,
                timestamp: new Date(),
                executionTime,
                output: consoleOutput,
                result
            });

            this.showFeedback('コードを実行しました');

        } catch (error) {
            this.addErrorEntry(error);
            this.addConsoleEntry('error', [error.message]);
            this.showFeedback('実行エラーが発生しました', 'error');
        }
    }

    executeConsoleCommand() {
        const input = document.getElementById('consoleInput');
        const command = input.value.trim();
        
        if (!command) return;

        this.addConsoleEntry('command', [`> ${command}`]);
        
        try {
            const result = eval(command);
            if (result !== undefined) {
                this.addConsoleEntry('log', [result]);
            }
        } catch (error) {
            this.addConsoleEntry('error', [error.message]);
        }

        input.value = '';
    }

    addConsoleEntry(type, args) {
        const consoleOutput = document.getElementById('consoleOutput');
        const entry = document.createElement('div');
        entry.className = `console-entry console-${type}`;
        
        const formattedArgs = args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg, null, 2);
            }
            return String(arg);
        }).join(' ');

        entry.textContent = formattedArgs;
        consoleOutput.appendChild(entry);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;

        // welcome メッセージを削除
        const welcome = consoleOutput.querySelector('.console-welcome');
        if (welcome) {
            welcome.remove();
        }
    }

    addResultEntry(result) {
        const resultOutput = document.getElementById('resultOutput');
        const placeholder = resultOutput.querySelector('.result-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        const entry = document.createElement('div');
        entry.className = 'result-item';
        
        if (typeof result === 'object') {
            entry.innerHTML = `
                <strong>Result:</strong>
                <pre>${JSON.stringify(result, null, 2)}</pre>
            `;
        } else {
            entry.innerHTML = `
                <strong>Result:</strong>
                <pre>${String(result)}</pre>
            `;
        }

        resultOutput.appendChild(entry);
    }

    addErrorEntry(error) {
        const errorsOutput = document.getElementById('errorsOutput');
        const placeholder = errorsOutput.querySelector('.errors-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        const entry = document.createElement('div');
        entry.className = 'error-item';
        entry.innerHTML = `
            <strong>${error.name}:</strong> ${error.message}
            ${error.stack ? `<pre>${error.stack}</pre>` : ''}
        `;

        errorsOutput.appendChild(entry);
    }

    addPerformanceEntry(data) {
        const performanceOutput = document.getElementById('performanceOutput');
        const placeholder = performanceOutput.querySelector('.performance-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        const entry = document.createElement('div');
        entry.className = 'performance-item';
        entry.innerHTML = `
            <strong>実行時間:</strong> ${data.executionTime}ms<br>
            <strong>コード長:</strong> ${data.codeLength} 文字<br>
            <strong>実行時刻:</strong> ${new Date(data.timestamp).toLocaleString()}
        `;

        performanceOutput.appendChild(entry);
    }

    clearOutput() {
        this.clearTab('console');
        this.clearTab('result');
        this.clearTab('errors');
        this.clearTab('performance');
        this.showFeedback('出力をクリアしました');
    }

    clearTab(tabName) {
        const outputs = {
            console: { id: 'consoleOutput', placeholder: '<div class="console-welcome"><i class="fab fa-js"></i><p>JavaScript Playground へようこそ</p><p>コードを実行するとここに結果が表示されます</p></div>' },
            result: { id: 'resultOutput', placeholder: '<div class="result-placeholder"><i class="fas fa-play-circle"></i><p>コードを実行すると結果がここに表示されます</p></div>' },
            errors: { id: 'errorsOutput', placeholder: '<div class="errors-placeholder"><i class="fas fa-check-circle"></i><p>エラーはありません</p></div>' },
            performance: { id: 'performanceOutput', placeholder: '<div class="performance-placeholder"><i class="fas fa-stopwatch"></i><p>パフォーマンス情報がここに表示されます</p></div>' }
        };

        const output = outputs[tabName];
        if (output) {
            const element = document.getElementById(output.id);
            element.innerHTML = output.placeholder;
        }
    }

    formatCode() {
        if (!this.editor) return;

        try {
            this.editor.getAction('editor.action.formatDocument').run();
            this.showFeedback('コードをフォーマットしました');
        } catch (error) {
            this.showFeedback('フォーマットに失敗しました', 'error');
        }
    }

    validateSyntax() {
        if (!this.editor) return;

        const code = this.editor.getValue();
        const statusElement = document.getElementById('syntaxStatus');

        try {
            // 簡易的な構文チェック
            new Function(code);
            statusElement.textContent = '構文OK';
            statusElement.className = 'status-ok';
        } catch (error) {
            statusElement.textContent = '構文エラー';
            statusElement.className = 'status-error';
        }
    }

    updateEditorInfo() {
        if (!this.editor) return;

        const position = this.editor.getPosition();
        const model = this.editor.getModel();
        
        document.getElementById('cursorPosition').textContent = 
            `行 ${position.lineNumber}, 列 ${position.column}`;
        document.getElementById('characterCount').textContent = 
            `${model.getValueLength()} 文字`;
    }

    updateSelectionInfo() {
        if (!this.editor) return;

        const selection = this.editor.getSelection();
        const selectionInfo = document.getElementById('selectionInfo');
        
        if (selection.isEmpty()) {
            selectionInfo.textContent = '';
        } else {
            const selectedText = this.editor.getModel().getValueInRange(selection);
            selectionInfo.textContent = `選択: ${selectedText.length} 文字`;
        }
    }

    changeTheme(theme) {
        if (this.editor) {
            monaco.editor.setTheme(theme);
            this.showFeedback(`テーマを ${theme} に変更しました`);
        }
    }

    toggleWordWrap() {
        if (this.editor) {
            const currentWrap = this.editor.getOption(monaco.editor.EditorOption.wordWrap);
            const newWrap = currentWrap === 'off' ? 'on' : 'off';
            this.editor.updateOptions({ wordWrap: newWrap });
            this.showFeedback(`改行を${newWrap === 'on' ? '有効' : '無効'}にしました`);
        }
    }

    toggleMinimap() {
        if (this.editor) {
            const currentMinimap = this.editor.getOption(monaco.editor.EditorOption.minimap);
            const newMinimap = { enabled: !currentMinimap.enabled };
            this.editor.updateOptions({ minimap: newMinimap });
            this.showFeedback(`ミニマップを${newMinimap.enabled ? '表示' : '非表示'}にしました`);
        }
    }

    changeFontSize(delta) {
        this.fontSize = Math.max(8, Math.min(72, this.fontSize + delta));
        if (this.editor) {
            this.editor.updateOptions({ fontSize: this.fontSize });
            this.showFeedback(`フォントサイズ: ${this.fontSize}px`);
        }
    }

    switchTab(tabName) {
        // タブボタンの状態更新
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // タブコンテンツの表示切り替え
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    switchSideTab(tabName) {
        // タブボタンの状態更新
        document.querySelectorAll('.side-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // タブコンテンツの表示切り替え
        document.querySelectorAll('.side-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-content`).classList.add('active');
    }

    toggleSidePanel() {
        const sidePanel = document.getElementById('sidePanel');
        sidePanel.classList.toggle('open');
    }

    saveCurrentSnippet() {
        const code = this.editor.getValue();
        const name = document.getElementById('snippetName').value.trim() || 'untitled';
        
        const snippet = {
            id: Date.now().toString(),
            name,
            code,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // 既存のスニペットを更新するか新規作成するか
        const existingIndex = this.snippets.findIndex(s => s.name === name);
        if (existingIndex !== -1) {
            snippet.id = this.snippets[existingIndex].id;
            snippet.createdAt = this.snippets[existingIndex].createdAt;
            this.snippets[existingIndex] = snippet;
        } else {
            this.snippets.push(snippet);
        }

        this.saveSnippets();
        this.updateSnippetsList();
        this.showFeedback(`スニペット "${name}" を保存しました`);
    }

    loadSnippet(snippet) {
        this.editor.setValue(snippet.code);
        document.getElementById('snippetName').value = snippet.name;
        this.currentSnippet = snippet;
        this.showFeedback(`スニペット "${snippet.name}" を読み込みました`);
    }

    deleteSnippet(snippetId) {
        if (confirm('このスニペットを削除しますか？')) {
            this.snippets = this.snippets.filter(s => s.id !== snippetId);
            this.saveSnippets();
            this.updateSnippetsList();
            this.showFeedback('スニペットを削除しました');
        }
    }

    deleteAllSnippets() {
        if (confirm('すべてのスニペットを削除しますか？この操作は取り消せません。')) {
            this.snippets = [];
            this.saveSnippets();
            this.updateSnippetsList();
            this.showFeedback('すべてのスニペットを削除しました');
        }
    }

    newSnippet() {
        if (confirm('新しいスニペットを作成しますか？現在の内容は失われます。')) {
            this.editor.setValue('// 新しいスニペット\nconsole.log("Hello, World!");');
            document.getElementById('snippetName').value = 'untitled';
            this.currentSnippet = null;
            this.showFeedback('新しいスニペットを作成しました');
        }
    }

    updateSnippetsList() {
        const list = document.getElementById('snippetsList');
        
        if (this.snippets.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-code"></i>
                    <p>保存されたスニペットはありません</p>
                </div>
            `;
            return;
        }

        list.innerHTML = this.snippets.map(snippet => `
            <div class="snippet-item">
                <div class="snippet-header" onclick="playground.loadSnippet(${JSON.stringify(snippet).replace(/"/g, '&quot;')})">
                    <div>
                        <div class="snippet-name">${snippet.name}</div>
                        <div class="snippet-date">${new Date(snippet.updatedAt).toLocaleString()}</div>
                    </div>
                    <div class="snippet-actions" onclick="event.stopPropagation()">
                        <button class="snippet-btn" onclick="playground.loadSnippet(${JSON.stringify(snippet).replace(/"/g, '&quot;')})" title="読み込み">
                            <i class="fas fa-folder-open"></i>
                        </button>
                        <button class="snippet-btn delete" onclick="playground.deleteSnippet('${snippet.id}')" title="削除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadExamples(category = 'basic') {
        const examples = this.getExamplesByCategory(category);
        const list = document.getElementById('examplesList');
        
        list.innerHTML = examples.map(example => `
            <div class="example-item">
                <div class="example-header" onclick="playground.loadExample(${JSON.stringify(example).replace(/"/g, '&quot;')})">
                    <div class="example-name">${example.name}</div>
                </div>
            </div>
        `).join('');
    }

    loadExample(example) {
        this.editor.setValue(example.code);
        document.getElementById('snippetName').value = example.name;
        this.showFeedback(`サンプル "${example.name}" を読み込みました`);
    }

    getExamplesByCategory(category) {
        const examples = {
            basic: [
                {
                    name: 'Hello World',
                    code: `// Hello World
console.log('Hello, World!');

// 変数の宣言
const message = 'こんにちは、JavaScript！';
console.log(message);`
                },
                {
                    name: '変数と型',
                    code: `// 様々な型の変数
const str = 'Hello';
const num = 42;
const bool = true;
const arr = [1, 2, 3];
const obj = { name: 'John', age: 30 };

console.log('文字列:', str);
console.log('数値:', num);
console.log('真偽値:', bool);
console.log('配列:', arr);
console.log('オブジェクト:', obj);`
                },
                {
                    name: '関数の定義',
                    code: `// 関数の様々な定義方法

// 関数宣言
function greet(name) {
    return \`Hello, \${name}!\`;
}

// 関数式
const add = function(a, b) {
    return a + b;
};

// アロー関数
const multiply = (a, b) => a * b;

console.log(greet('Alice'));
console.log(add(3, 4));
console.log(multiply(5, 6));`
                }
            ],
            dom: [
                {
                    name: 'DOM要素の取得',
                    code: `// DOM要素の取得
const body = document.body;
const title = document.querySelector('h1');
const buttons = document.querySelectorAll('button');

console.log('body要素:', body);
console.log('h1要素:', title);
console.log('ボタン要素:', buttons);

// 要素の作成と追加
const newDiv = document.createElement('div');
newDiv.textContent = 'Hello from JavaScript!';
newDiv.style.color = 'blue';
newDiv.style.padding = '10px';
newDiv.style.margin = '10px';
newDiv.style.border = '1px solid blue';

console.log('新しい要素を作成しました:', newDiv);`
                },
                {
                    name: 'イベントハンドラー',
                    code: `// イベントハンドラーの設定例

// クリックイベント
function handleClick() {
    console.log('ボタンがクリックされました！');
}

// 複数のイベントハンドラー
const events = {
    click: () => console.log('クリック'),
    mouseover: () => console.log('マウスオーバー'),
    mouseout: () => console.log('マウスアウト')
};

console.log('イベントハンドラーを定義しました');
console.log('実際のDOMで使用するには:');
console.log('element.addEventListener("click", handleClick);');`
                }
            ],
            async: [
                {
                    name: 'Promise の基本',
                    code: `// Promise の基本的な使用方法

// Promiseを返す関数
function delay(ms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(\`\${ms}ms 待機しました\`);
        }, ms);
    });
}

// Promiseの使用
delay(1000)
    .then(result => {
        console.log(result);
        return delay(500);
    })
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error('エラー:', error);
    });

console.log('非同期処理を開始しました...');`
                },
                {
                    name: 'async/await',
                    code: `// async/await を使った非同期処理

async function fetchUserData() {
    try {
        console.log('ユーザーデータを取得中...');
        
        // 模擬的なAPI呼び出し
        const userData = await new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    id: 1,
                    name: 'John Doe',
                    email: 'john@example.com'
                });
            }, 1000);
        });
        
        console.log('ユーザーデータ:', userData);
        return userData;
        
    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
}

// 実行
fetchUserData();`
                }
            ],
            array: [
                {
                    name: '配列の基本操作',
                    code: `// 配列の基本操作

const numbers = [1, 2, 3, 4, 5];
console.log('元の配列:', numbers);

// map - 各要素を変換
const doubled = numbers.map(n => n * 2);
console.log('2倍:', doubled);

// filter - 条件に合う要素を抽出
const evens = numbers.filter(n => n % 2 === 0);
console.log('偶数:', evens);

// reduce - 配列を単一の値に集約
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log('合計:', sum);

// find - 条件に合う最初の要素
const found = numbers.find(n => n > 3);
console.log('3より大きい最初の数:', found);`
                },
                {
                    name: '高度な配列操作',
                    code: `// 高度な配列操作

const users = [
    { name: 'Alice', age: 25, city: 'Tokyo' },
    { name: 'Bob', age: 30, city: 'Osaka' },
    { name: 'Charlie', age: 35, city: 'Tokyo' },
    { name: 'David', age: 28, city: 'Kyoto' }
];

// 複数条件でのフィルタリング
const tokyoUsers = users.filter(user => user.city === 'Tokyo');
console.log('東京のユーザー:', tokyoUsers);

// ソート
const sortedByAge = users.sort((a, b) => a.age - b.age);
console.log('年齢順:', sortedByAge);

// グループ化
const groupedByCity = users.reduce((groups, user) => {
    const city = user.city;
    if (!groups[city]) {
        groups[city] = [];
    }
    groups[city].push(user);
    return groups;
}, {});
console.log('都市別グループ:', groupedByCity);`
                }
            ],
            object: [
                {
                    name: 'オブジェクトの操作',
                    code: `// オブジェクトの基本操作

const person = {
    name: 'John',
    age: 30,
    city: 'Tokyo'
};

console.log('元のオブジェクト:', person);

// プロパティの追加
person.email = 'john@example.com';
console.log('emailを追加:', person);

// プロパティの削除
delete person.city;
console.log('cityを削除:', person);

// Object.keys, Object.values, Object.entries
console.log('キー:', Object.keys(person));
console.log('値:', Object.values(person));
console.log('エントリー:', Object.entries(person));

// 分割代入
const { name, age } = person;
console.log(\`名前: \${name}, 年齢: \${age}\`);`
                },
                {
                    name: 'クラスとコンストラクター',
                    code: `// ES6 クラスの定義

class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    greet() {
        return \`こんにちは、\${this.name}です。\${this.age}歳です。\`;
    }
    
    birthday() {
        this.age++;
        return \`誕生日おめでとう！現在\${this.age}歳です。\`;
    }
}

// インスタンスの作成
const john = new Person('John', 25);
console.log(john.greet());
console.log(john.birthday());

// 継承
class Student extends Person {
    constructor(name, age, school) {
        super(name, age);
        this.school = school;
    }
    
    study() {
        return \`\${this.name}は\${this.school}で勉強しています。\`;
    }
}

const alice = new Student('Alice', 20, '東京大学');
console.log(alice.greet());
console.log(alice.study());`
                }
            ],
            algorithm: [
                {
                    name: 'フィボナッチ数列',
                    code: `// フィボナッチ数列の実装

// 再帰版（効率は良くない）
function fibonacciRecursive(n) {
    if (n <= 1) return n;
    return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}

// 反復版（効率的）
function fibonacciIterative(n) {
    if (n <= 1) return n;
    
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
    }
    return b;
}

// 実行と比較
console.log('再帰版:');
for (let i = 0; i < 10; i++) {
    console.log(\`fibonacci(\${i}) = \${fibonacciRecursive(i)}\`);
}

console.log('\\n反復版:');
for (let i = 0; i < 20; i++) {
    console.log(\`fibonacci(\${i}) = \${fibonacciIterative(i)}\`);
}`
                },
                {
                    name: 'バブルソート',
                    code: `// バブルソートの実装

function bubbleSort(arr) {
    const result = [...arr]; // 元の配列をコピー
    const n = result.length;
    
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (result[j] > result[j + 1]) {
                // 要素を交換
                [result[j], result[j + 1]] = [result[j + 1], result[j]];
            }
        }
    }
    
    return result;
}

// テスト用のデータ
const numbers = [64, 34, 25, 12, 22, 11, 90];
console.log('元の配列:', numbers);

const sorted = bubbleSort(numbers);
console.log('ソート後:', sorted);

// パフォーマンステスト
const largeArray = Array.from({length: 1000}, () => Math.floor(Math.random() * 1000));
const startTime = performance.now();
bubbleSort(largeArray);
const endTime = performance.now();
console.log(\`1000要素のソート時間: \${(endTime - startTime).toFixed(2)}ms\`);`
                }
            ]
        };

        return examples[category] || examples.basic;
    }

    showShareModal() {
        const modal = document.getElementById('shareModal');
        const code = this.editor.getValue();
        const encoded = btoa(encodeURIComponent(code));
        const shareUrl = `${window.location.origin}${window.location.pathname}?code=${encoded}`;
        
        document.getElementById('shareUrl').value = shareUrl;
        modal.classList.add('show');
    }

    hideShareModal() {
        document.getElementById('shareModal').classList.remove('show');
    }

    copyToClipboard() {
        const code = this.editor.getValue();
        navigator.clipboard.writeText(code).then(() => {
            this.showFeedback('コードをクリップボードにコピーしました');
        }).catch(() => {
            this.showFeedback('コピーに失敗しました', 'error');
        });
    }

    exportAsFile() {
        const code = this.editor.getValue();
        const name = document.getElementById('snippetName').value || 'script';
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}.js`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showFeedback('ファイルをダウンロードしました');
    }

    copyShareUrl() {
        const shareUrl = document.getElementById('shareUrl').value;
        navigator.clipboard.writeText(shareUrl).then(() => {
            this.showFeedback('共有URLをコピーしました');
        }).catch(() => {
            this.showFeedback('コピーに失敗しました', 'error');
        });
    }

    exportCode() {
        this.exportAsFile();
    }

    loadSnippets() {
        try {
            return JSON.parse(localStorage.getItem('jsPlaygroundSnippets') || '[]');
        } catch {
            return [];
        }
    }

    saveSnippets() {
        localStorage.setItem('jsPlaygroundSnippets', JSON.stringify(this.snippets));
    }

    showFeedback(message, type = 'success') {
        const feedback = document.getElementById('feedback');
        feedback.querySelector('span').textContent = message;
        feedback.className = `feedback ${type}`;
        feedback.classList.add('show');

        setTimeout(() => {
            feedback.classList.remove('show');
        }, 3000);
    }

    // URL からコードを読み込み
    loadFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedCode = urlParams.get('code');
        
        if (encodedCode) {
            try {
                const code = decodeURIComponent(atob(encodedCode));
                this.editor.setValue(code);
                this.showFeedback('URLからコードを読み込みました');
            } catch (error) {
                this.showFeedback('URLからの読み込みに失敗しました', 'error');
            }
        }
    }
}

// グローバルインスタンス（HTML内で使用するため）
let playground;

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    playground = new JavaScriptPlayground();
    
    // URL からコードを読み込み
    setTimeout(() => {
        playground.loadFromUrl();
    }, 1000);
});