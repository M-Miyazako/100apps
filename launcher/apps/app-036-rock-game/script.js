class RockPaperScissorsGame {
    constructor() {
        this.choices = {
            rock: { emoji: '✊', name: 'グー', beats: 'scissors' },
            paper: { emoji: '✋', name: 'パー', beats: 'rock' },
            scissors: { emoji: '✌️', name: 'チョキ', beats: 'paper' }
        };
        
        this.gameState = {
            playerScore: 0,
            computerScore: 0,
            rounds: 0,
            gameHistory: [],
            playerWins: 0,
            winStreak: 0,
            maxWinStreak: 0,
            totalGames: 0,
            isPaused: false,
            gameMode: 'normal', // normal, best-of, endless
            targetScore: 5
        };
        
        this.achievements = [];
        this.initializeElements();
        this.bindEvents();
        this.initializeAchievements();
        this.loadGameData();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.elements = {
            playerChoice: document.getElementById('playerChoice'),
            computerChoice: document.getElementById('computerChoice'),
            playerScore: document.getElementById('playerScore'),
            computerScore: document.getElementById('computerScore'),
            countdown: document.getElementById('countdown'),
            resultDisplay: document.getElementById('resultDisplay'),
            resultText: document.getElementById('resultText'),
            choiceBtns: document.querySelectorAll('.choice-btn'),
            difficulty: document.getElementById('difficulty'),
            gameMode: document.getElementById('gameMode'),
            resetBtn: document.getElementById('resetBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            historyList: document.getElementById('historyList'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn'),
            exportStatsBtn: document.getElementById('exportStatsBtn'),
            achievementsGrid: document.getElementById('achievementsGrid'),
            gameOverModal: document.getElementById('gameOverModal'),
            gameOverTitle: document.getElementById('gameOverTitle'),
            gameOverStats: document.getElementById('gameOverStats'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            closeModalBtn: document.getElementById('closeModalBtn')
        };
    }
    
    bindEvents() {
        this.elements.choiceBtns.forEach(btn => {
            btn.addEventListener('click', () => this.makeChoice(btn.dataset.choice));
        });
        
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.elements.exportStatsBtn.addEventListener('click', () => this.exportStats());
        this.elements.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.elements.closeModalBtn.addEventListener('click', () => this.closeGameOverModal());
        
        this.elements.difficulty.addEventListener('change', () => this.updateDifficulty());
        this.elements.gameMode.addEventListener('change', () => this.updateGameMode());
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (this.gameState.isPaused) return;
            
            switch (e.key.toLowerCase()) {
                case '1':
                case 'r':
                    this.makeChoice('rock');
                    break;
                case '2':
                case 'p':
                    this.makeChoice('paper');
                    break;
                case '3':
                case 's':
                    this.makeChoice('scissors');
                    break;
            }
        });
    }
    
    makeChoice(playerChoice) {
        if (this.gameState.isPaused) return;
        
        // プレイヤーの選択を表示
        this.updateChoiceDisplay('player', playerChoice);
        
        // カウントダウン開始
        this.startCountdown(() => {
            const computerChoice = this.getComputerChoice();
            this.updateChoiceDisplay('computer', computerChoice);
            
            const result = this.determineWinner(playerChoice, computerChoice);
            this.updateScore(result);
            this.showResult(result, playerChoice, computerChoice);
            this.addToHistory(playerChoice, computerChoice, result);
            
            // ゲーム終了チェック
            if (this.checkGameEnd()) {
                this.endGame();
            }
        });
    }
    
    updateChoiceDisplay(player, choice) {
        const element = this.elements[`${player}Choice`];
        const choiceData = this.choices[choice];
        
        element.innerHTML = `
            <div class="choice-icon">${choiceData.emoji}</div>
            <div class="choice-text">${choiceData.name}</div>
        `;
        element.classList.add('selected');
        
        setTimeout(() => {
            element.classList.remove('selected');
        }, 1000);
    }
    
    startCountdown(callback) {
        let count = 3;
        this.elements.countdown.textContent = count;
        this.elements.countdown.style.display = 'block';
        
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                this.elements.countdown.textContent = count;
            } else {
                this.elements.countdown.style.display = 'none';
                clearInterval(countdownInterval);
                callback();
            }
        }, 1000);
    }
    
    getComputerChoice() {
        const choices = Object.keys(this.choices);
        const difficulty = this.elements.difficulty.value;
        
        switch (difficulty) {
            case 'easy':
                // ランダム選択
                return choices[Math.floor(Math.random() * choices.length)];
            case 'normal':
                // 少し戦略的
                if (this.gameState.gameHistory.length > 0) {
                    const lastPlayerChoice = this.gameState.gameHistory[0].playerChoice;
                    const counter = Object.keys(this.choices).find(choice => 
                        this.choices[choice].beats === lastPlayerChoice
                    );
                    return Math.random() < 0.6 ? counter : choices[Math.floor(Math.random() * choices.length)];
                }
                return choices[Math.floor(Math.random() * choices.length)];
            case 'hard':
                // より戦略的
                if (this.gameState.gameHistory.length >= 2) {
                    const recentChoices = this.gameState.gameHistory.slice(0, 2).map(h => h.playerChoice);
                    const mostCommon = this.getMostCommonChoice(recentChoices);
                    const counter = Object.keys(this.choices).find(choice => 
                        this.choices[choice].beats === mostCommon
                    );
                    return Math.random() < 0.8 ? counter : choices[Math.floor(Math.random() * choices.length)];
                }
                return choices[Math.floor(Math.random() * choices.length)];
            default:
                return choices[Math.floor(Math.random() * choices.length)];
        }
    }
    
    getMostCommonChoice(choices) {
        const counts = {};
        choices.forEach(choice => {
            counts[choice] = (counts[choice] || 0) + 1;
        });
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }
    
    determineWinner(playerChoice, computerChoice) {
        if (playerChoice === computerChoice) {
            return 'draw';
        }
        
        return this.choices[playerChoice].beats === computerChoice ? 'player' : 'computer';
    }
    
    updateScore(result) {
        if (result === 'player') {
            this.gameState.playerScore++;
            this.gameState.playerWins++;
            this.gameState.winStreak++;
            this.gameState.maxWinStreak = Math.max(this.gameState.maxWinStreak, this.gameState.winStreak);
        } else if (result === 'computer') {
            this.gameState.computerScore++;
            this.gameState.winStreak = 0;
        }
        
        this.gameState.rounds++;
        this.gameState.totalGames++;
        this.updateDisplay();
    }
    
    showResult(result, playerChoice, computerChoice) {
        let message = '';
        let className = '';
        
        switch (result) {
            case 'draw':
                message = '引き分け！';
                className = 'result-text draw';
                break;
            case 'player':
                message = 'あなたの勝ち！';
                className = 'result-text win';
                this.animateChoice('player', 'winner');
                this.animateChoice('computer', 'loser');
                break;
            case 'computer':
                message = 'コンピューターの勝ち！';
                className = 'result-text lose';
                this.animateChoice('computer', 'winner');
                this.animateChoice('player', 'loser');
                break;
        }
        
        this.elements.resultText.textContent = message;
        this.elements.resultText.className = className;
        this.elements.resultDisplay.style.display = 'block';
        
        setTimeout(() => {
            this.elements.resultDisplay.style.display = 'none';
        }, 2000);
    }
    
    animateChoice(player, type) {
        const element = this.elements[`${player}Choice`];
        element.classList.add(type);
        setTimeout(() => {
            element.classList.remove(type);
        }, 2000);
    }
    
    addToHistory(playerChoice, computerChoice, result) {
        const historyItem = {
            playerChoice,
            computerChoice,
            result,
            timestamp: new Date().toISOString()
        };
        
        this.gameState.gameHistory.unshift(historyItem);
        
        // 履歴を100件に制限
        if (this.gameState.gameHistory.length > 100) {
            this.gameState.gameHistory.pop();
        }
        
        this.updateHistoryDisplay();
        this.saveGameData();
    }
    
    updateHistoryDisplay() {
        if (this.gameState.gameHistory.length === 0) {
            this.elements.historyList.innerHTML = '<p style="text-align: center; color: #999;">履歴がありません</p>';
            return;
        }
        
        this.elements.historyList.innerHTML = this.gameState.gameHistory
            .slice(0, 10) // 最新10件を表示
            .map(item => {
                const date = new Date(item.timestamp).toLocaleString('ja-JP');
                return `
                    <div class="history-item">
                        <div>
                            <span>${this.choices[item.playerChoice].emoji} vs ${this.choices[item.computerChoice].emoji}</span>
                            <small style="display: block; color: #666;">${date}</small>
                        </div>
                        <div class="result-badge">
                            ${item.result === 'player' ? '勝利' : item.result === 'computer' ? '敗北' : '引分'}
                        </div>
                    </div>
                `;
            })
            .join('');
    }
    
    checkGameEnd() {
        const mode = this.elements.gameMode.value;
        const targetScore = this.gameState.targetScore;
        
        switch (mode) {
            case 'best-of-5':
                return Math.max(this.gameState.playerScore, this.gameState.computerScore) >= 3;
            case 'best-of-10':
                return Math.max(this.gameState.playerScore, this.gameState.computerScore) >= 6;
            case 'first-to-5':
                return this.gameState.playerScore >= 5 || this.gameState.computerScore >= 5;
            case 'first-to-10':
                return this.gameState.playerScore >= 10 || this.gameState.computerScore >= 10;
            default:
                return false; // endless mode
        }
    }
    
    endGame() {
        const playerWon = this.gameState.playerScore > this.gameState.computerScore;
        
        this.elements.gameOverTitle.textContent = playerWon ? 'ゲームに勝利しました！' : 'ゲームに敗北しました...';
        this.elements.gameOverStats.innerHTML = `
            <div class="final-score">
                <div>あなた: ${this.gameState.playerScore}</div>
                <div>コンピューター: ${this.gameState.computerScore}</div>
            </div>
            <div class="game-stats">
                <div>総ラウンド数: ${this.gameState.rounds}</div>
                <div>連勝記録: ${this.gameState.winStreak}</div>
                <div>勝率: ${this.gameState.rounds > 0 ? ((this.gameState.playerWins / this.gameState.rounds) * 100).toFixed(1) : 0}%</div>
            </div>
        `;
        
        this.elements.gameOverModal.style.display = 'block';
        this.checkAchievements();
    }
    
    playAgain() {
        this.closeGameOverModal();
        this.resetGame();
    }
    
    closeGameOverModal() {
        this.elements.gameOverModal.style.display = 'none';
    }
    
    resetGame() {
        this.gameState.playerScore = 0;
        this.gameState.computerScore = 0;
        this.gameState.rounds = 0;
        this.gameState.isPaused = false;
        
        this.elements.playerChoice.innerHTML = '<div class="choice-icon">❓</div><div class="choice-text">選択してください</div>';
        this.elements.computerChoice.innerHTML = '<div class="choice-icon">❓</div><div class="choice-text">待機中</div>';
        this.elements.resultDisplay.style.display = 'none';
        
        this.updateDisplay();
    }
    
    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        this.elements.pauseBtn.textContent = this.gameState.isPaused ? '再開' : '一時停止';
        this.elements.pauseBtn.classList.toggle('active', this.gameState.isPaused);
    }
    
    updateDisplay() {
        this.elements.playerScore.textContent = this.gameState.playerScore;
        this.elements.computerScore.textContent = this.gameState.computerScore;
    }
    
    clearHistory() {
        if (confirm('履歴をクリアしますか？')) {
            this.gameState.gameHistory = [];
            this.updateHistoryDisplay();
            this.saveGameData();
        }
    }
    
    exportStats() {
        const stats = {
            playerWins: this.gameState.playerWins,
            totalGames: this.gameState.totalGames,
            winStreak: this.gameState.winStreak,
            maxWinStreak: this.gameState.maxWinStreak,
            winRate: this.gameState.totalGames > 0 ? (this.gameState.playerWins / this.gameState.totalGames) * 100 : 0,
            gameHistory: this.gameState.gameHistory,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `rock-paper-scissors-stats-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    initializeAchievements() {
        this.achievements = [
            { id: 'first_win', name: '初勝利', description: '初めて勝利する', icon: '🏆', unlocked: false },
            { id: 'win_streak_5', name: '連勝王', description: '5連勝する', icon: '🔥', unlocked: false },
            { id: 'win_streak_10', name: '無敗神話', description: '10連勝する', icon: '👑', unlocked: false },
            { id: 'play_10', name: '経験者', description: '10ゲームプレイ', icon: '⭐', unlocked: false },
            { id: 'play_100', name: 'ベテラン', description: '100ゲームプレイ', icon: '🎖️', unlocked: false },
            { id: 'win_rate_80', name: '勝率マスター', description: '勝率80%以上（10ゲーム以上）', icon: '💎', unlocked: false }
        ];
        
        this.loadAchievements();
        this.updateAchievementsDisplay();
    }
    
    checkAchievements() {
        const newUnlocks = [];
        
        this.achievements.forEach(achievement => {
            if (achievement.unlocked) return;
            
            let shouldUnlock = false;
            
            switch (achievement.id) {
                case 'first_win':
                    shouldUnlock = this.gameState.playerWins >= 1;
                    break;
                case 'win_streak_5':
                    shouldUnlock = this.gameState.winStreak >= 5;
                    break;
                case 'win_streak_10':
                    shouldUnlock = this.gameState.winStreak >= 10;
                    break;
                case 'play_10':
                    shouldUnlock = this.gameState.totalGames >= 10;
                    break;
                case 'play_100':
                    shouldUnlock = this.gameState.totalGames >= 100;
                    break;
                case 'win_rate_80':
                    const winRate = this.gameState.totalGames > 0 ? (this.gameState.playerWins / this.gameState.totalGames) * 100 : 0;
                    shouldUnlock = winRate >= 80 && this.gameState.totalGames >= 10;
                    break;
            }
            
            if (shouldUnlock) {
                achievement.unlocked = true;
                newUnlocks.push(achievement);
            }
        });
        
        if (newUnlocks.length > 0) {
            this.showAchievementNotifications(newUnlocks);
            this.updateAchievementsDisplay();
            this.saveAchievements();
        }
    }
    
    showAchievementNotifications(achievements) {
        achievements.forEach(achievement => {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                z-index: 9999;
                animation: slideIn 0.3s ease;
            `;
            
            notification.innerHTML = `
                <strong>🏆 実績解除！</strong><br>
                ${achievement.icon} ${achievement.name}
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        });
    }
    
    updateAchievementsDisplay() {
        this.elements.achievementsGrid.innerHTML = this.achievements
            .map(achievement => `
                <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                </div>
            `)
            .join('');
    }
    
    saveGameData() {
        try {
            localStorage.setItem('rockPaperScissorsGame', JSON.stringify(this.gameState));
        } catch (error) {
            console.error('ゲームデータの保存に失敗しました:', error);
        }
    }
    
    loadGameData() {
        try {
            const saved = localStorage.getItem('rockPaperScissorsGame');
            if (saved) {
                const data = JSON.parse(saved);
                this.gameState = { ...this.gameState, ...data };
            }
        } catch (error) {
            console.error('ゲームデータの読み込みに失敗しました:', error);
        }
    }
    
    saveAchievements() {
        try {
            localStorage.setItem('rockPaperScissorsAchievements', JSON.stringify(this.achievements));
        } catch (error) {
            console.error('実績データの保存に失敗しました:', error);
        }
    }
    
    loadAchievements() {
        try {
            const saved = localStorage.getItem('rockPaperScissorsAchievements');
            if (saved) {
                const data = JSON.parse(saved);
                this.achievements = data;
            }
        } catch (error) {
            console.error('実績データの読み込みに失敗しました:', error);
        }
    }
    
    updateDifficulty() {
        // 難易度変更時の処理
    }
    
    updateGameMode() {
        // ゲームモード変更時の処理
    }
}

// アプリ初期化
document.addEventListener('DOMContentLoaded', () => {
    new RockPaperScissorsGame();
});