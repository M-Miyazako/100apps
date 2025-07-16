class RegexTester {
    constructor() {
        this.regexInput = document.getElementById('regexInput');
        this.testInput = document.getElementById('testInput');
        this.matchResults = document.getElementById('matchResults');
        this.patternDisplay = document.getElementById('patternDisplay');
        this.flagsDisplay = document.getElementById('flagsDisplay');
        this.matchCount = document.getElementById('matchCount');
        this.validationStatus = document.getElementById('validationStatus');
        this.replacementInput = document.getElementById('replacementInput');
        this.replacementResult = document.getElementById('replacementResult');
        
        this.initializeEventListeners();
        this.testRegex();
    }
    
    initializeEventListeners() {
        document.getElementById('testBtn').addEventListener('click', () => {
            this.testRegex();
        });
        
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAll();
        });
        
        document.getElementById('replaceBtn').addEventListener('click', () => {
            this.testReplacement();
        });
        
        // 例をクリック
        document.querySelectorAll('.example-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const pattern = e.currentTarget.dataset.pattern;
                this.regexInput.value = pattern;
                this.testRegex();
            });
        });
        
        // リアルタイム更新
        this.regexInput.addEventListener('input', () => {
            this.testRegex();
        });
        
        this.testInput.addEventListener('input', () => {
            this.testRegex();
        });
    }
    
    testRegex() {
        const pattern = this.regexInput.value;
        const testString = this.testInput.value;
        
        if (!pattern) {
            this.setStatus('パターンを入力してください', 'status-warning');
            return;
        }
        
        try {
            const flags = this.getFlags();
            const regex = new RegExp(pattern, flags);
            
            this.patternDisplay.textContent = pattern;
            this.flagsDisplay.textContent = flags || 'なし';
            
            const matches = testString.match(regex);
            if (matches) {
                this.matchCount.textContent = matches.length;
                this.displayMatches(matches, regex, testString);
                this.setStatus('マッチしました', 'status-success');
            } else {
                this.matchCount.textContent = '0';
                this.matchResults.innerHTML = '<p>マッチしませんでした</p>';
                this.setStatus('マッチしませんでした', 'status-warning');
            }
        } catch (error) {
            this.setStatus('無効な正規表現: ' + error.message, 'status-error');
            this.matchResults.innerHTML = '<p>エラー: ' + error.message + '</p>';
        }
    }
    
    displayMatches(matches, regex, testString) {
        let html = '';
        
        if (regex.global) {
            const allMatches = [...testString.matchAll(regex)];
            allMatches.forEach((match, index) => {
                html += `<div class="match-item">
                    <strong>マッチ ${index + 1}:</strong> "${match[0]}"
                    <span class="match-position">位置: ${match.index}-${match.index + match[0].length}</span>
                </div>`;
            });
        } else {
            matches.forEach((match, index) => {
                html += `<div class="match-item">
                    <strong>マッチ ${index + 1}:</strong> "${match}"
                </div>`;
            });
        }
        
        this.matchResults.innerHTML = html;
    }
    
    testReplacement() {
        const pattern = this.regexInput.value;
        const testString = this.testInput.value;
        const replacement = this.replacementInput.value;
        
        if (!pattern || !replacement) {
            this.setStatus('パターンと置換文字列を入力してください', 'status-warning');
            return;
        }
        
        try {
            const flags = this.getFlags();
            const regex = new RegExp(pattern, flags);
            const result = testString.replace(regex, replacement);
            
            this.replacementResult.innerHTML = `
                <h4>置換結果</h4>
                <div class="replacement-output">
                    <strong>元の文字列:</strong><br>
                    <pre>${testString}</pre>
                    <strong>置換後:</strong><br>
                    <pre>${result}</pre>
                </div>
            `;
        } catch (error) {
            this.setStatus('置換エラー: ' + error.message, 'status-error');
        }
    }
    
    getFlags() {
        let flags = '';
        if (document.getElementById('globalFlag').checked) flags += 'g';
        if (document.getElementById('ignoreFlag').checked) flags += 'i';
        if (document.getElementById('multilineFlag').checked) flags += 'm';
        return flags;
    }
    
    setStatus(message, className) {
        this.validationStatus.textContent = message;
        this.validationStatus.className = className;
    }
    
    clearAll() {
        this.regexInput.value = '';
        this.testInput.value = '';
        this.replacementInput.value = '';
        this.matchResults.innerHTML = '';
        this.replacementResult.innerHTML = '';
        this.patternDisplay.textContent = '未設定';
        this.flagsDisplay.textContent = 'なし';
        this.matchCount.textContent = '0';
        this.setStatus('準備完了', 'status-valid');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RegexTester();
    console.log('Regex Tester app initialized');
});