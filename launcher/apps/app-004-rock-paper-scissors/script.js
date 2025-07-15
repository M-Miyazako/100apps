// Rock Paper Scissors Game
class RockPaperScissors {
    constructor() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.gamesPlayed = 0;
        this.gameHistory = [];
        this.choices = ['rock', 'paper', 'scissors'];
        this.choiceEmojis = {
            rock: '🪨',
            paper: '📄',
            scissors: '✂️'
        };
        this.isGameActive = true;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadGameData();
        this.updateDisplay();
    }
    
    initializeElements() {
        // Score elements
        this.playerScoreElement = document.getElementById('player-score');
        this.computerScoreElement = document.getElementById('computer-score');
        
        // Choice display elements
        this.playerChoiceElement = document.getElementById('player-choice');
        this.computerChoiceElement = document.getElementById('computer-choice');
        
        // Result elements
        this.resultTextElement = document.getElementById('result-text');
        this.resultAnimationElement = document.getElementById('result-animation');
        
        // Button elements
        this.rockBtn = document.getElementById('rock-btn');
        this.paperBtn = document.getElementById('paper-btn');
        this.scissorsBtn = document.getElementById('scissors-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.historyBtn = document.getElementById('history-btn');
        this.closeHistoryBtn = document.getElementById('close-history');
        this.clearHistoryBtn = document.getElementById('clear-history');
        
        // History elements
        this.gameHistoryElement = document.getElementById('game-history');
        this.historyListElement = document.getElementById('history-list');
        
        // Stats elements
        this.gamesPlayedElement = document.getElementById('games-played');
        this.winRateElement = document.getElementById('win-rate');
        
        // All choice buttons
        this.choiceButtons = document.querySelectorAll('.choice-btn');
    }
    
    attachEventListeners() {
        // Choice buttons
        this.choiceButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (this.isGameActive) {
                    const choice = e.currentTarget.getAttribute('data-choice');
                    this.playGame(choice);
                }
            });
        });
        
        // Reset button
        this.resetBtn.addEventListener('click', () => {
            this.resetGame();
        });
        
        // History buttons
        this.historyBtn.addEventListener('click', () => {
            this.showHistory();
        });
        
        this.closeHistoryBtn.addEventListener('click', () => {
            this.hideHistory();
        });
        
        this.clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
        });
        
        // Close history on background click
        this.gameHistoryElement.addEventListener('click', (e) => {
            if (e.target === this.gameHistoryElement) {
                this.hideHistory();
            }
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (this.isGameActive) {
                switch(e.key.toLowerCase()) {
                    case 'r':
                        this.playGame('rock');
                        break;
                    case 'p':
                        this.playGame('paper');
                        break;
                    case 's':
                        this.playGame('scissors');
                        break;
                    case 'escape':
                        this.hideHistory();
                        break;
                }
            }
        });
    }
    
    playGame(playerChoice) {
        if (!this.isGameActive) return;
        
        this.isGameActive = false;
        
        // Add selection animation to player choice
        this.addSelectionAnimation(playerChoice);
        
        // Generate computer choice
        const computerChoice = this.getComputerChoice();
        
        // Show thinking animation
        this.showThinkingAnimation(() => {
            // Determine winner
            const result = this.determineWinner(playerChoice, computerChoice);
            
            // Update display
            this.updateChoiceDisplay(playerChoice, computerChoice, result);
            this.updateScore(result);
            this.showResult(result, playerChoice, computerChoice);
            
            // Save game to history
            this.saveGameToHistory(playerChoice, computerChoice, result);
            
            // Update stats
            this.updateStats();
            
            // Save game data
            this.saveGameData();
            
            // Re-enable game after animation
            setTimeout(() => {
                this.isGameActive = true;
                this.removeSelectionAnimation();
            }, 2000);
        });
    }
    
    getComputerChoice() {
        const randomIndex = Math.floor(Math.random() * this.choices.length);
        return this.choices[randomIndex];
    }
    
    determineWinner(playerChoice, computerChoice) {
        if (playerChoice === computerChoice) {
            return 'tie';
        }
        
        const winConditions = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };
        
        return winConditions[playerChoice] === computerChoice ? 'win' : 'lose';
    }
    
    addSelectionAnimation(choice) {
        const button = document.querySelector(`[data-choice="${choice}"]`);
        button.classList.add('selected');
    }
    
    removeSelectionAnimation() {
        this.choiceButtons.forEach(button => {
            button.classList.remove('selected');
        });
    }
    
    showThinkingAnimation(callback) {
        let thinkingInterval;
        let counter = 0;
        const thinkingChoices = ['🪨', '📄', '✂️'];
        
        // Show thinking animation for computer
        this.computerChoiceElement.textContent = '🤔';
        this.computerChoiceElement.classList.add('shake');
        
        thinkingInterval = setInterval(() => {
            this.computerChoiceElement.textContent = thinkingChoices[counter % 3];
            counter++;
        }, 200);
        
        // Stop thinking animation after 1 second
        setTimeout(() => {
            clearInterval(thinkingInterval);
            this.computerChoiceElement.classList.remove('shake');
            callback();
        }, 1000);
    }
    
    updateChoiceDisplay(playerChoice, computerChoice, result) {
        // Update player choice
        this.playerChoiceElement.textContent = this.choiceEmojis[playerChoice];
        this.playerChoiceElement.classList.add('pulse');
        
        // Update computer choice
        this.computerChoiceElement.textContent = this.choiceEmojis[computerChoice];
        this.computerChoiceElement.classList.add('pulse');
        
        // Add winner animation
        setTimeout(() => {
            if (result === 'win') {
                this.playerChoiceElement.classList.add('winner');
            } else if (result === 'lose') {
                this.computerChoiceElement.classList.add('winner');
            }
            
            // Remove pulse animation
            this.playerChoiceElement.classList.remove('pulse');
            this.computerChoiceElement.classList.remove('pulse');
        }, 300);
        
        // Clear animations after delay
        setTimeout(() => {
            this.playerChoiceElement.classList.remove('winner');
            this.computerChoiceElement.classList.remove('winner');
        }, 2000);
    }
    
    updateScore(result) {
        if (result === 'win') {
            this.playerScore++;
            this.playerScoreElement.textContent = this.playerScore;
            this.playerScoreElement.classList.add('pulse');
        } else if (result === 'lose') {
            this.computerScore++;
            this.computerScoreElement.textContent = this.computerScore;
            this.computerScoreElement.classList.add('pulse');
        }
        
        // Remove pulse animation
        setTimeout(() => {
            this.playerScoreElement.classList.remove('pulse');
            this.computerScoreElement.classList.remove('pulse');
        }, 600);
    }
    
    showResult(result, playerChoice, computerChoice) {
        const resultMessages = {
            win: `You Win! ${this.choiceEmojis[playerChoice]} beats ${this.choiceEmojis[computerChoice]}`,
            lose: `You Lose! ${this.choiceEmojis[computerChoice]} beats ${this.choiceEmojis[playerChoice]}`,
            tie: `It's a Tie! Both chose ${this.choiceEmojis[playerChoice]}`
        };
        
        const resultEmojis = {
            win: '🎉',
            lose: '😢',
            tie: '🤝'
        };
        
        this.resultTextElement.textContent = resultMessages[result];
        this.resultTextElement.className = `result-text ${result}`;
        
        this.resultAnimationElement.textContent = resultEmojis[result];
        this.resultAnimationElement.className = 'result-animation';
        
        // Add bounce animation
        setTimeout(() => {
            this.resultAnimationElement.classList.add('bounce');
        }, 100);
    }
    
    saveGameToHistory(playerChoice, computerChoice, result) {
        const gameRecord = {
            id: Date.now(),
            playerChoice,
            computerChoice,
            result,
            timestamp: new Date().toLocaleString()
        };
        
        this.gameHistory.unshift(gameRecord);
        this.gamesPlayed++;
        
        // Keep only last 50 games
        if (this.gameHistory.length > 50) {
            this.gameHistory = this.gameHistory.slice(0, 50);
        }
    }
    
    updateStats() {
        this.gamesPlayedElement.textContent = this.gamesPlayed;
        
        const winRate = this.gamesPlayed > 0 ? 
            Math.round((this.playerScore / this.gamesPlayed) * 100) : 0;
        this.winRateElement.textContent = `${winRate}%`;
    }
    
    showHistory() {
        this.updateHistoryDisplay();
        this.gameHistoryElement.classList.add('show');
    }
    
    hideHistory() {
        this.gameHistoryElement.classList.remove('show');
    }
    
    updateHistoryDisplay() {
        if (this.gameHistory.length === 0) {
            this.historyListElement.innerHTML = '<p class="no-history">No games played yet!</p>';
            return;
        }
        
        const historyHTML = this.gameHistory.map(game => `
            <div class="history-item ${game.result}">
                <div class="history-choices">
                    <span>${this.choiceEmojis[game.playerChoice]}</span>
                    <span>vs</span>
                    <span>${this.choiceEmojis[game.computerChoice]}</span>
                </div>
                <span class="history-result ${game.result}">
                    ${game.result === 'win' ? 'Won' : game.result === 'lose' ? 'Lost' : 'Tied'}
                </span>
            </div>
        `).join('');
        
        this.historyListElement.innerHTML = historyHTML;
    }
    
    clearHistory() {
        if (confirm('Are you sure you want to clear all game history?')) {
            this.gameHistory = [];
            this.updateHistoryDisplay();
            this.saveGameData();
        }
    }
    
    resetGame() {
        if (confirm('Are you sure you want to reset the game? This will clear all scores and history.')) {
            this.playerScore = 0;
            this.computerScore = 0;
            this.gamesPlayed = 0;
            this.gameHistory = [];
            
            this.updateDisplay();
            this.updateStats();
            this.saveGameData();
            
            // Reset choice displays
            this.playerChoiceElement.textContent = '?';
            this.computerChoiceElement.textContent = '?';
            this.resultTextElement.textContent = 'Choose your weapon!';
            this.resultTextElement.className = 'result-text';
            this.resultAnimationElement.textContent = '';
            
            // Show reset animation
            this.resultAnimationElement.textContent = '🔄';
            this.resultAnimationElement.classList.add('bounce');
            
            setTimeout(() => {
                this.resultAnimationElement.textContent = '';
                this.resultAnimationElement.classList.remove('bounce');
            }, 1000);
        }
    }
    
    updateDisplay() {
        this.playerScoreElement.textContent = this.playerScore;
        this.computerScoreElement.textContent = this.computerScore;
    }
    
    saveGameData() {
        const gameData = {
            playerScore: this.playerScore,
            computerScore: this.computerScore,
            gamesPlayed: this.gamesPlayed,
            gameHistory: this.gameHistory
        };
        
        localStorage.setItem('rockPaperScissorsData', JSON.stringify(gameData));
    }
    
    loadGameData() {
        const savedData = localStorage.getItem('rockPaperScissorsData');
        
        if (savedData) {
            const gameData = JSON.parse(savedData);
            this.playerScore = gameData.playerScore || 0;
            this.computerScore = gameData.computerScore || 0;
            this.gamesPlayed = gameData.gamesPlayed || 0;
            this.gameHistory = gameData.gameHistory || [];
        }
    }
    
    // Add sound effects (basic implementation using Web Audio API)
    playSound(type) {
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            
            const frequencies = {
                win: 523.25,  // C5
                lose: 261.63, // C4
                tie: 392.00,  // G4
                click: 440.00 // A4
            };
            
            const frequency = frequencies[type] || 440;
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        }
    }
    
    // Add touch support for mobile devices
    addTouchSupport() {
        this.choiceButtons.forEach(button => {
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                button.classList.add('touched');
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.classList.remove('touched');
            });
        });
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new RockPaperScissors();
    game.addTouchSupport();
    
    // Add keyboard shortcuts info
    console.log('Keyboard shortcuts: R = Rock, P = Paper, S = Scissors, ESC = Close History');
});

// Add some CSS for touch support
const style = document.createElement('style');
style.textContent = `
    .choice-btn.touched {
        transform: scale(0.95);
        transition: transform 0.1s ease;
    }
    
    .choice-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    @media (hover: none) {
        .choice-btn:hover {
            transform: none;
        }
    }
`;
document.head.appendChild(style);