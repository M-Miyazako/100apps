class NumberGuessingGame {
    constructor() {
        this.gameState = {
            secretNumber: null,
            minRange: 1,
            maxRange: 100,
            maxAttempts: 10,
            currentAttempts: 0,
            remainingAttempts: 10,
            isGameActive: false,
            guessHistory: [],
            totalGames: 0,
            totalWins: 0,
            leaderboard: [],
            difficulty: 'normal',
            hints: []
        };
        
        this.difficulties = {
            easy: { max: 50, attempts: 15 },
            normal: { max: 100, attempts: 10 },
            hard: { max: 200, attempts: 8 },
            expert: { max: 500, attempts: 12 }
        };
        
        this.initializeElements();
        this.bindEvents();
        this.loadGameData();
        this.updateDisplay();
        this.updateSettings();
    }
    
    initializeElements() {
        this.elements = {
            // 設定要素
            minRange: document.getElementById('minRange'),
            maxRange: document.getElementById('maxRange'),
            maxAttempts: document.getElementById('maxAttempts'),
            difficulty: document.getElementById('difficulty'),
            startBtn: document.getElementById('startBtn'),
            
            // ゲーム状態表示
            currentAttempts: document.getElementById('currentAttempts'),
            remainingAttempts: document.getElementById('remainingAttempts'),
            totalWins: document.getElementById('totalWins'),
            totalGames: document.getElementById('totalGames'),
            winRate: document.getElementById('winRate'),
            rangeDisplay: document.getElementById('rangeDisplay'),
            
            // ゲーム入力
            guessInput: document.getElementById('guessInput'),
            guessBtn: document.getElementById('guessBtn'),
            
            // フィードバック
            feedback: document.getElementById('feedback'),
            hintArea: document.getElementById('hintArea'),
            
            // 履歴とリーダーボード
            historyList: document.getElementById('historyList'),
            leaderboardList: document.getElementById('leaderboardList'),
            clearHistoryBtn: document.getElementById('clearHistory'),
            
            // モーダル
            gameOverModal: document.getElementById('gameOverModal'),
            gameOverTitle: document.getElementById('gameOverTitle'),
            gameResult: document.getElementById('gameResult'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            closeModalBtn: document.getElementById('closeModalBtn'),
            
            // ゲーム画面
            gamePanel: document.getElementById('gamePanel'),
            gameStatus: document.getElementById('gameStatus')
        };
    }
    
    bindEvents() {
        // ゲーム制御
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.guessBtn.addEventListener('click', () => this.makeGuess());
        this.elements.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.elements.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        // 入力イベント
        this.elements.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.makeGuess();
        });
        
        // 設定変更
        this.elements.minRange.addEventListener('change', () => this.updateRangeSettings());
        this.elements.maxRange.addEventListener('change', () => this.updateRangeSettings());
        this.elements.maxAttempts.addEventListener('change', () => this.updateAttemptSettings());
        this.elements.difficulty.addEventListener('change', () => this.changeDifficulty());
        
        // 入力検証
        this.elements.guessInput.addEventListener('input', () => this.validateInput());
        
        // 履歴クリア
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // モーダル外クリック
        this.elements.gameOverModal.addEventListener('click', (e) => {
            if (e.target === this.elements.gameOverModal) {
                this.closeModal();
            }
        });
    }
    
    changeDifficulty() {
        const difficulty = this.elements.difficulty.value;
        this.gameState.difficulty = difficulty;
        
        const config = this.difficulties[difficulty];
        this.gameState.maxRange = config.max;
        this.gameState.maxAttempts = config.attempts;
        
        this.elements.maxRange.value = config.max;
        this.elements.maxAttempts.value = config.attempts;
        
        this.updateRangeSettings();
        this.updateAttemptSettings();
    }
    
    updateRangeSettings() {
        const min = parseInt(this.elements.minRange.value);
        const max = parseInt(this.elements.maxRange.value);
        
        if (min >= max) {
            this.elements.maxRange.value = min + 1;
        }
        
        this.gameState.minRange = parseInt(this.elements.minRange.value);
        this.gameState.maxRange = parseInt(this.elements.maxRange.value);
        
        this.updateSettings();
    }
    
    updateAttemptSettings() {
        this.gameState.maxAttempts = parseInt(this.elements.maxAttempts.value);
        this.updateSettings();
    }
    
    updateSettings() {
        this.elements.rangeDisplay.textContent = `${this.gameState.minRange}〜${this.gameState.maxRange}`;
    }
    
    startGame() {
        this.gameState.secretNumber = Math.floor(Math.random() * (this.gameState.maxRange - this.gameState.minRange + 1)) + this.gameState.minRange;
        this.gameState.currentAttempts = 0;
        this.gameState.remainingAttempts = this.gameState.maxAttempts;
        this.gameState.isGameActive = true;
        this.gameState.guessHistory = [];
        this.gameState.hints = [];
        
        this.elements.gamePanel.style.display = 'block';
        this.elements.startBtn.textContent = 'ゲーム中...';
        this.elements.startBtn.disabled = true;
        this.elements.guessInput.disabled = false;
        this.elements.guessBtn.disabled = false;
        this.elements.guessInput.value = '';
        this.elements.feedback.textContent = '';
        this.elements.hintArea.innerHTML = '';
        
        this.updateDisplay();
        this.updateHistory();
        
        this.elements.guessInput.focus();
        this.showFeedback(`ゲーム開始！${this.gameState.minRange}〜${this.gameState.maxRange}の数字を当ててください`, 'info');
    }
    
    makeGuess() {
        if (!this.gameState.isGameActive) return;
        
        const input = this.elements.guessInput.value.trim();
        const guess = parseInt(input);
        
        if (!this.validateGuess(guess)) return;
        
        this.gameState.currentAttempts++;
        this.gameState.remainingAttempts--;
        
        const result = this.evaluateGuess(guess);
        
        // 履歴に追加
        this.gameState.guessHistory.push({
            guess: guess,
            result: result,
            attempt: this.gameState.currentAttempts
        });
        
        this.updateDisplay();
        this.updateHistory();
        this.generateHints(guess);
        
        if (result === 'correct') {
            this.endGame(true);
        } else if (this.gameState.remainingAttempts <= 0) {
            this.endGame(false);
        } else {
            this.elements.guessInput.value = '';
            this.elements.guessInput.focus();
        }
        
        this.saveGameData();
    }
    
    validateGuess(guess) {
        if (isNaN(guess)) {
            this.showFeedback('有効な数字を入力してください', 'error');
            return false;
        }
        
        if (guess < this.gameState.minRange || guess > this.gameState.maxRange) {
            this.showFeedback(`${this.gameState.minRange}〜${this.gameState.maxRange}の範囲で入力してください`, 'error');
            return false;
        }
        
        // 重複チェック
        if (this.gameState.guessHistory.some(item => item.guess === guess)) {
            this.showFeedback('この数字は既に推測済みです', 'warning');
            return false;
        }
        
        return true;
    }
    
    evaluateGuess(guess) {
        const secret = this.gameState.secretNumber;
        
        if (guess === secret) {
            this.showFeedback('🎉 正解です！', 'correct');
            return 'correct';
        } else if (guess > secret) {
            const diff = guess - secret;
            if (diff <= 5) {
                this.showFeedback('🔥 とても近い！もう少し小さい数字です', 'close-high');
            } else if (diff <= 10) {
                this.showFeedback('📉 近い！小さい数字です', 'near-high');
            } else {
                this.showFeedback('⬇️ もっと小さい数字です', 'too-high');
            }
            return 'too-high';
        } else {
            const diff = secret - guess;
            if (diff <= 5) {
                this.showFeedback('🔥 とても近い！もう少し大きい数字です', 'close-low');
            } else if (diff <= 10) {
                this.showFeedback('📈 近い！大きい数字です', 'near-low');
            } else {
                this.showFeedback('⬆️ もっと大きい数字です', 'too-low');
            }
            return 'too-low';
        }
    }
    
    generateHints(guess) {
        const secret = this.gameState.secretNumber;
        const hints = [];
        
        // 桁数ヒント
        if (this.gameState.currentAttempts >= 3) {
            const secretDigits = secret.toString().length;
            const guessDigits = guess.toString().length;
            
            if (secretDigits !== guessDigits) {
                hints.push(`<div class="hint"><span class="hint-icon">🔢</span>答えは${secretDigits}桁の数字です</div>`);
            }
        }
        
        // 範囲絞り込みヒント
        if (this.gameState.currentAttempts >= 5) {
            const history = this.gameState.guessHistory;
            const highs = history.filter(h => h.result === 'too-high').map(h => h.guess);
            const lows = history.filter(h => h.result === 'too-low').map(h => h.guess);
            
            if (highs.length > 0 && lows.length > 0) {
                const minHigh = Math.min(...highs);
                const maxLow = Math.max(...lows);
                hints.push(`<div class="hint"><span class="hint-icon">🎯</span>答えは${maxLow}〜${minHigh}の間にあります</div>`);
            }
        }
        
        // 奇数偶数ヒント
        if (this.gameState.currentAttempts >= 7) {
            const isEven = secret % 2 === 0;
            hints.push(`<div class="hint"><span class="hint-icon">⚡</span>答えは${isEven ? '偶数' : '奇数'}です</div>`);
        }
        
        if (hints.length === 0 && this.gameState.remainingAttempts <= 3) {
            hints.push(`<div class="hint"><span class="hint-icon">💡</span>残り${this.gameState.remainingAttempts}回！頑張って！</div>`);
        }
        
        this.elements.hintArea.innerHTML = hints.join('');
    }
    
    showFeedback(message, type) {
        this.elements.feedback.textContent = message;
        this.elements.feedback.className = `feedback ${type}`;
        
        // アニメーション
        this.elements.feedback.style.animation = 'none';
        setTimeout(() => {
            this.elements.feedback.style.animation = 'feedbackPulse 0.5s ease';
        }, 10);
    }
    
    updateDisplay() {
        this.elements.currentAttempts.textContent = this.gameState.currentAttempts;
        this.elements.remainingAttempts.textContent = this.gameState.remainingAttempts;
        this.elements.totalWins.textContent = this.gameState.totalWins;
        this.elements.totalGames.textContent = this.gameState.totalGames;
        
        const winRate = this.gameState.totalGames > 0 ? 
            Math.round((this.gameState.totalWins / this.gameState.totalGames) * 100) : 0;
        this.elements.winRate.textContent = `${winRate}%`;
        
        if (this.gameState.isGameActive) {
            this.elements.gameStatus.textContent = `試行回数: ${this.gameState.currentAttempts}/${this.gameState.maxAttempts}`;
        }
    }
    
    updateHistory() {
        if (this.gameState.guessHistory.length === 0) {
            this.elements.historyList.innerHTML = '<p style="text-align: center; color: #999;">推測履歴がありません</p>';
            return;
        }
        
        this.elements.historyList.innerHTML = this.gameState.guessHistory
            .slice(-10) // 最新10件
            .reverse()
            .map(item => `
                <div class="history-item ${item.result}">
                    <div class="history-attempt">${item.attempt}</div>
                    <div class="history-guess">${item.guess}</div>
                    <div class="history-result">
                        ${item.result === 'correct' ? '🎯 正解!' : 
                          item.result === 'too-high' ? '📉 大きい' : '📈 小さい'}
                    </div>
                </div>
            `)
            .join('');
    }
    
    endGame(isWin) {
        this.gameState.isGameActive = false;
        this.gameState.totalGames++;
        
        if (isWin) {
            this.gameState.totalWins++;
            this.addToLeaderboard();
        }
        
        this.elements.startBtn.textContent = '新しいゲーム';
        this.elements.startBtn.disabled = false;
        this.elements.guessInput.disabled = true;
        this.elements.guessBtn.disabled = true;
        this.elements.gamePanel.style.display = 'none';
        
        this.updateDisplay();
        this.updateLeaderboard();
        this.showGameOverModal(isWin);
        this.saveGameData();
    }
    
    addToLeaderboard() {
        const score = {
            attempts: this.gameState.currentAttempts,
            range: `${this.gameState.minRange}-${this.gameState.maxRange}`,
            maxAttempts: this.gameState.maxAttempts,
            difficulty: this.gameState.difficulty,
            date: new Date().toLocaleDateString('ja-JP')
        };
        
        this.gameState.leaderboard.push(score);
        
        // 試行回数でソート（少ない方が良い）
        this.gameState.leaderboard.sort((a, b) => a.attempts - b.attempts);
        
        // 上位10件に制限
        this.gameState.leaderboard = this.gameState.leaderboard.slice(0, 10);
    }
    
    updateLeaderboard() {
        if (this.gameState.leaderboard.length === 0) {
            this.elements.leaderboardList.innerHTML = '<p style="text-align: center; color: #999;">リーダーボードが空です</p>';
            return;
        }
        
        this.elements.leaderboardList.innerHTML = this.gameState.leaderboard
            .map((score, index) => `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank">${index + 1}</div>
                    <div class="leaderboard-details">
                        <div class="leaderboard-attempts">${score.attempts}回</div>
                        <div class="leaderboard-info">範囲: ${score.range} (${score.difficulty})</div>
                        <div class="leaderboard-date">${score.date}</div>
                    </div>
                </div>
            `)
            .join('');
    }
    
    showGameOverModal(isWin) {
        this.elements.gameOverTitle.textContent = isWin ? '🎉 ゲームクリア！' : '😞 ゲームオーバー';
        
        const winRate = this.gameState.totalGames > 0 ? 
            Math.round((this.gameState.totalWins / this.gameState.totalGames) * 100) : 0;
        
        this.elements.gameResult.innerHTML = `
            <div class="result-emoji">${isWin ? '🎉' : '😞'}</div>
            <h3>${isWin ? 'おめでとうございます！' : '残念でした...'}</h3>
            <p><strong>答え:</strong> ${this.gameState.secretNumber}</p>
            <p><strong>試行回数:</strong> ${this.gameState.currentAttempts}回</p>
            <p><strong>勝率:</strong> ${winRate}% (${this.gameState.totalWins}勝/${this.gameState.totalGames}戦)</p>
            ${isWin ? `<p class="achievement">🏆 ${this.gameState.currentAttempts}回で正解！</p>` : ''}
        `;
        
        this.elements.gameOverModal.classList.add('show');
    }
    
    playAgain() {
        this.closeModal();
        this.startGame();
    }
    
    closeModal() {
        this.elements.gameOverModal.classList.remove('show');
    }
    
    clearHistory() {
        if (confirm('推測履歴とリーダーボードをクリアしますか？')) {
            this.gameState.guessHistory = [];
            this.gameState.leaderboard = [];
            this.gameState.totalGames = 0;
            this.gameState.totalWins = 0;
            
            this.updateDisplay();
            this.updateHistory();
            this.updateLeaderboard();
            this.saveGameData();
            
            this.showFeedback('履歴をクリアしました', 'info');
        }
    }
    
    validateInput() {
        const input = this.elements.guessInput.value;
        const guess = parseInt(input);
        
        if (input && (!isNaN(guess) && guess >= this.gameState.minRange && guess <= this.gameState.maxRange)) {
            this.elements.guessBtn.disabled = false;
        } else {
            this.elements.guessBtn.disabled = true;
        }
    }
    
    saveGameData() {
        const dataToSave = {
            totalGames: this.gameState.totalGames,
            totalWins: this.gameState.totalWins,
            leaderboard: this.gameState.leaderboard,
            difficulty: this.gameState.difficulty
        };
        
        try {
            localStorage.setItem('numberGuessingGameData', JSON.stringify(dataToSave));
        } catch (error) {
            console.error('データ保存エラー:', error);
        }
    }
    
    loadGameData() {
        try {
            const savedData = localStorage.getItem('numberGuessingGameData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.gameState.totalGames = parsedData.totalGames || 0;
                this.gameState.totalWins = parsedData.totalWins || 0;
                this.gameState.leaderboard = parsedData.leaderboard || [];
                this.gameState.difficulty = parsedData.difficulty || 'normal';
                
                // 難易度設定を復元
                this.elements.difficulty.value = this.gameState.difficulty;
                this.changeDifficulty();
            }
        } catch (error) {
            console.error('データ読み込みエラー:', error);
        }
        
        this.updateLeaderboard();
    }
}

// アプリ初期化
document.addEventListener('DOMContentLoaded', () => {
    new NumberGuessingGame();
});