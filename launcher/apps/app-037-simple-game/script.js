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
            leaderboard: []
        };
        
        this.initializeElements();
        this.bindEvents();
        this.loadGameData();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.elements = {
            minRange: document.getElementById('minRange'),
            maxRange: document.getElementById('maxRange'),
            maxAttempts: document.getElementById('maxAttempts'),
            startBtn: document.getElementById('startBtn'),
            currentAttempts: document.getElementById('currentAttempts'),
            remainingAttempts: document.getElementById('remainingAttempts'),
            totalWins: document.getElementById('totalWins'),
            totalGames: document.getElementById('totalGames'),
            rangeDisplay: document.getElementById('rangeDisplay'),
            guessInput: document.getElementById('guessInput'),
            guessBtn: document.getElementById('guessBtn'),
            feedback: document.getElementById('feedback'),
            hintArea: document.getElementById('hintArea'),
            historyList: document.getElementById('historyList'),
            leaderboardList: document.getElementById('leaderboardList'),
            gameOverModal: document.getElementById('gameOverModal'),
            gameOverTitle: document.getElementById('gameOverTitle'),
            gameResult: document.getElementById('gameResult'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            closeModalBtn: document.getElementById('closeModalBtn')
        };
    }
    
    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.guessBtn.addEventListener('click', () => this.makeGuess());
        this.elements.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.elements.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        this.elements.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.makeGuess();
        });
        
        this.elements.minRange.addEventListener('change', () => this.updateRangeSettings());
        this.elements.maxRange.addEventListener('change', () => this.updateRangeSettings());
        this.elements.maxAttempts.addEventListener('change', () => this.updateAttemptSettings());
        
        // e�$n<
        this.elements.guessInput.addEventListener('input', () => this.validateInput());
    }
    
    updateRangeSettings() {
        const min = parseInt(this.elements.minRange.value);
        const max = parseInt(this.elements.maxRange.value);
        
        if (min >= max) {
            this.elements.maxRange.value = min + 1;
        }
        
        this.gameState.minRange = parseInt(this.elements.minRange.value);
        this.gameState.maxRange = parseInt(this.elements.maxRange.value);
        
        this.elements.rangeDisplay.textContent = `${this.gameState.minRange} ^ ${this.gameState.maxRange} n��gpW�SffO`UD`;
        this.elements.guessInput.min = this.gameState.minRange;
        this.elements.guessInput.max = this.gameState.maxRange;
    }
    
    updateAttemptSettings() {
        this.gameState.maxAttempts = parseInt(this.elements.maxAttempts.value);
        this.gameState.remainingAttempts = this.gameState.maxAttempts;
        this.updateDisplay();
    }
    
    validateInput() {
        const input = this.elements.guessInput.value;
        const num = parseInt(input);
        
        if (input === '' || isNaN(num) || num < this.gameState.minRange || num > this.gameState.maxRange) {
            this.elements.guessBtn.disabled = true;
        } else {
            this.elements.guessBtn.disabled = false;
        }
    }
    
    startGame() {
        this.gameState.secretNumber = Math.floor(Math.random() * (this.gameState.maxRange - this.gameState.minRange + 1)) + this.gameState.minRange;
        this.gameState.currentAttempts = 0;
        this.gameState.remainingAttempts = this.gameState.maxAttempts;
        this.gameState.isGameActive = true;
        this.gameState.guessHistory = [];
        
        this.elements.startBtn.disabled = true;
        this.elements.guessInput.disabled = false;
        this.elements.guessBtn.disabled = false;
        this.elements.guessInput.focus();
        
        this.elements.feedback.textContent = 'pW�e�Wf�,WfO`UD';
        this.elements.feedback.className = 'feedback neutral';
        
        this.updateDisplay();
        this.updateHistoryDisplay();
        this.updateHints();
        this.saveGameData();
    }
    
    makeGuess() {
        if (!this.gameState.isGameActive) return;
        
        const guess = parseInt(this.elements.guessInput.value);
        
        if (isNaN(guess) || guess < this.gameState.minRange || guess > this.gameState.maxRange) {
            this.showFeedback('!�je�gY', 'neutral');
            return;
        }
        
        this.gameState.currentAttempts++;
        this.gameState.remainingAttempts--;
        
        const result = this.evaluateGuess(guess);
        this.gameState.guessHistory.push({ guess, result, attempt: this.gameState.currentAttempts });
        
        this.updateDisplay();
        this.updateHistoryDisplay();
        this.updateHints();
        
        if (result === 'correct') {
            this.endGame(true);
        } else if (this.gameState.remainingAttempts <= 0) {
            this.endGame(false);
        }
        
        this.elements.guessInput.value = '';
        this.elements.guessInput.focus();
        this.saveGameData();
    }
    
    evaluateGuess(guess) {
        const secret = this.gameState.secretNumber;
        
        if (guess === secret) {
            this.showFeedback('<� c�gY', 'correct');
            return 'correct';
        } else if (guess > secret) {
            const diff = guess - secret;
            if (diff <= 5) {
                this.showFeedback('�FWUDpWgYhf��D	', 'too-high');
            } else if (diff <= 10) {
                this.showFeedback('�FWUDpWgY�D	', 'too-high');
            } else {
                this.showFeedback('�chUDpWgY', 'too-high');
            }
            return 'too-high';
        } else {
            const diff = secret - guess;
            if (diff <= 5) {
                this.showFeedback('�FW'MDpWgYhf��D	', 'too-low');
            } else if (diff <= 10) {
                this.showFeedback('�FW'MDpWgY�D	', 'too-low');
            } else {
                this.showFeedback('�ch'MDpWgY', 'too-low');
            }
            return 'too-low';
        }
    }
    
    showFeedback(message, type) {
        this.elements.feedback.textContent = message;
        this.elements.feedback.className = `feedback ${type}`;
    }
    
    updateHints() {
        const hints = [];
        
        if (this.gameState.currentAttempts > 0) {
            const lastGuess = this.gameState.guessHistory[this.gameState.guessHistory.length - 1];
            const secret = this.gameState.secretNumber;
            
            // Gpvpn���
            if (this.gameState.currentAttempts >= 3) {
                hints.push(`<div class="hint"><span class="hint-icon">=�</span>THo${secret % 2 === 0 ? 'vp' : 'Gp'}gY</div>`);
            }
            
            // ��큋���
            if (this.gameState.currentAttempts >= 5) {
                const range = this.gameState.maxRange - this.gameState.minRange;
                const quarter = Math.floor(range / 4);
                
                if (secret <= this.gameState.minRange + quarter) {
                    hints.push(`<div class="hint"><span class="hint-icon"><�</span>THo��nMJ�kB�~Y</div>`);
                } else if (secret >= this.gameState.maxRange - quarter) {
                    hints.push(`<div class="hint"><span class="hint-icon"><�</span>THo��n�J�kB�~Y</div>`);
                } else {
                    hints.push(`<div class="hint"><span class="hint-icon"><�</span>THo��n-.�kB�~Y</div>`);
                }
            }
            
            //  �n������
            if (this.gameState.remainingAttempts === 1) {
                const digits = secret.toString().split('');
                if (digits.length === 1) {
                    hints.push(`<div class="hint"><span class="hint-icon"><�</span>THo1AnpWgY</div>`);
                } else {
                    hints.push(`<div class="hint"><span class="hint-icon"><�</span>THo${digits.length}AnpWgY</div>`);
                }
            }
        }
        
        this.elements.hintArea.innerHTML = hints.join('');
    }
    
    updateHistoryDisplay() {
        if (this.gameState.guessHistory.length === 0) {
            this.elements.historyList.innerHTML = '<p style="text-align: center; color: #999;">~`�,WfD~[�</p>';
            return;
        }
        
        this.elements.historyList.innerHTML = this.gameState.guessHistory
            .map(item => `
                <div class="history-item ${item.result}">
                    <div class="history-guess">${item.guess}</div>
                    <div class="history-result">
                        ${item.result === 'correct' ? 'c�' : 
                          item.result === 'too-high' ? ''MYN' : 'UYN'}
                    </div>
                </div>
            `)
            .join('');
    }
    
    updateDisplay() {
        this.elements.currentAttempts.textContent = this.gameState.currentAttempts;
        this.elements.remainingAttempts.textContent = this.gameState.remainingAttempts;
        this.elements.totalWins.textContent = this.gameState.totalWins;
        this.elements.totalGames.textContent = this.gameState.totalGames;
        
        this.updateRangeSettings();
        this.updateLeaderboard();
    }
    
    endGame(isWin) {
        this.gameState.isGameActive = false;
        this.gameState.totalGames++;
        
        if (isWin) {
            this.gameState.totalWins++;
            this.addToLeaderboard();
        }
        
        this.elements.startBtn.disabled = false;
        this.elements.guessInput.disabled = true;
        this.elements.guessBtn.disabled = true;
        
        this.showGameOverModal(isWin);
        this.updateDisplay();
        this.saveGameData();
    }
    
    addToLeaderboard() {
        const score = {
            attempts: this.gameState.currentAttempts,
            range: `${this.gameState.minRange}-${this.gameState.maxRange}`,
            maxAttempts: this.gameState.maxAttempts,
            date: new Date().toLocaleDateString('ja-JP')
        };
        
        this.gameState.leaderboard.push(score);
        
        // fL�pnjDk���
        this.gameState.leaderboard.sort((a, b) => a.attempts - b.attempts);
        
        // 
M10�n�
        this.gameState.leaderboard = this.gameState.leaderboard.slice(0, 10);
    }
    
    updateLeaderboard() {
        if (this.gameState.leaderboard.length === 0) {
            this.elements.leaderboardList.innerHTML = '<p style="text-align: center; color: #999;">~`2LB�~[�</p>';
            return;
        }
        
        this.elements.leaderboardList.innerHTML = this.gameState.leaderboard
            .map((score, index) => `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank">${index + 1}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-attempts">${score.attempts}�gc�</div>
                        <div class="leaderboard-range">��: ${score.range} ( '${score.maxAttempts}�)</div>
                    </div>
                    <div class="leaderboard-date">${score.date}</div>
                </div>
            `)
            .join('');
    }
    
    showGameOverModal(isWin) {
        this.elements.gameOverTitle.textContent = isWin ? '<� �)' : '= W...';
        
        const winRate = this.gameState.totalGames > 0 ? Math.round((this.gameState.totalWins / this.gameState.totalGames) * 100) : 0;
        
        this.elements.gameResult.innerHTML = `
            <div class="result-icon">${isWin ? '<�' : '='}</div>
            <h3>${isWin ? 'J�ghFTVD~Y' : '��...'}</h3>
            <p>c�: ${this.gameState.secretNumber}</p>
            <p>fL�p: ${this.gameState.currentAttempts}�</p>
            <p>݇: ${winRate}% (${this.gameState.totalWins}/${this.gameState.totalGames})</p>
            ${isWin ? `<p> t�WD${this.gameState.currentAttempts}�gc�W~W_</p>` : '<p>!�o5�~W�F</p>'}
        `;
        
        this.elements.gameOverModal.classList.add('active');
    }
    
    playAgain() {
        this.closeModal();
        this.startGame();
    }
    
    closeModal() {
        this.elements.gameOverModal.classList.remove('active');
    }
    
    saveGameData() {
        const dataToSave = {
            totalGames: this.gameState.totalGames,
            totalWins: this.gameState.totalWins,
            leaderboard: this.gameState.leaderboard
        };
        
        localStorage.setItem('numberGuessingGame', JSON.stringify(dataToSave));
    }
    
    loadGameData() {
        const savedData = localStorage.getItem('numberGuessingGame');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            this.gameState.totalGames = parsedData.totalGames || 0;
            this.gameState.totalWins = parsedData.totalWins || 0;
            this.gameState.leaderboard = parsedData.leaderboard || [];
        }
    }
}

// ���
document.addEventListener('DOMContentLoaded', () => {
    new NumberGuessingGame();
});