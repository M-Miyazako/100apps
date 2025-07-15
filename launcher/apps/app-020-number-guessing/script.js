class NumberGuessingGame {
    constructor() {
        this.currentGame = null;
        this.bestScores = this.loadBestScores();
        this.initializeElements();
        this.initializeEventListeners();
        this.updateBestScoresDisplay();
        this.showSetupSection();
    }

    initializeElements() {
        // Setup elements
        this.setupSection = document.getElementById('setupSection');
        this.difficultySelect = document.getElementById('difficultySelect');
        this.customRange = document.getElementById('customRange');
        this.minNumberInput = document.getElementById('minNumber');
        this.maxNumberInput = document.getElementById('maxNumber');
        this.startBtn = document.getElementById('startBtn');

        // Game elements
        this.gameSection = document.getElementById('gameSection');
        this.rangeDisplay = document.getElementById('rangeDisplay');
        this.attemptsDisplay = document.getElementById('attemptsDisplay');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.guessInput = document.getElementById('guessInput');
        this.guessBtn = document.getElementById('guessBtn');
        this.feedbackMessage = document.getElementById('feedbackMessage');
        this.hintMessage = document.getElementById('hintMessage');
        this.attemptsList = document.getElementById('attemptsList');

        // Game over elements
        this.gameOverSection = document.getElementById('gameOverSection');
        this.celebrationMessage = document.getElementById('celebrationMessage');
        this.finalNumber = document.getElementById('finalNumber');
        this.finalAttempts = document.getElementById('finalAttempts');
        this.finalScore = document.getElementById('finalScore');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.newGameBtn = document.getElementById('newGameBtn');

        // Best scores elements
        this.bestEasy = document.getElementById('bestEasy');
        this.bestMedium = document.getElementById('bestMedium');
        this.bestHard = document.getElementById('bestHard');
        this.bestExpert = document.getElementById('bestExpert');
        this.clearScoresBtn = document.getElementById('clearScoresBtn');

        // Confetti element
        this.confettiContainer = document.getElementById('confetti');
    }

    initializeEventListeners() {
        // Setup listeners
        this.difficultySelect.addEventListener('change', () => this.handleDifficultyChange());
        this.startBtn.addEventListener('click', () => this.startGame());
        
        // Game listeners
        this.guessBtn.addEventListener('click', () => this.makeGuess());
        this.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.makeGuess();
            }
        });
        
        // Game over listeners
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.newGameBtn.addEventListener('click', () => this.newGame());
        
        // Best scores listener
        this.clearScoresBtn.addEventListener('click', () => this.clearAllScores());
    }

    handleDifficultyChange() {
        const difficulty = this.difficultySelect.value;
        if (difficulty === 'custom') {
            this.customRange.style.display = 'block';
        } else {
            this.customRange.style.display = 'none';
        }
    }

    startGame() {
        const difficulty = this.difficultySelect.value;
        let minNumber, maxNumber;

        if (difficulty === 'custom') {
            minNumber = parseInt(this.minNumberInput.value);
            maxNumber = parseInt(this.maxNumberInput.value);
            
            if (isNaN(minNumber) || isNaN(maxNumber) || minNumber >= maxNumber) {
                this.showFeedback('Please enter valid minimum and maximum numbers', 'error');
                return;
            }
        } else {
            const ranges = {
                easy: [1, 10],
                medium: [1, 50],
                hard: [1, 100],
                expert: [1, 500]
            };
            [minNumber, maxNumber] = ranges[difficulty];
        }

        this.currentGame = {
            difficulty: difficulty,
            minNumber: minNumber,
            maxNumber: maxNumber,
            targetNumber: this.generateRandomNumber(minNumber, maxNumber),
            attempts: 0,
            score: 0,
            guessHistory: [],
            maxScore: this.calculateMaxScore(maxNumber - minNumber + 1),
            startTime: Date.now()
        };

        this.showGameSection();
        this.updateGameDisplay();
        this.clearFeedback();
        this.guessInput.focus();
    }

    generateRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    calculateMaxScore(range) {
        // Base score depends on range difficulty
        const baseScore = Math.ceil(Math.log2(range)) * 100;
        return baseScore;
    }

    makeGuess() {
        const guess = parseInt(this.guessInput.value);
        
        if (isNaN(guess)) {
            this.showFeedback('Please enter a valid number', 'error');
            return;
        }

        if (guess < this.currentGame.minNumber || guess > this.currentGame.maxNumber) {
            this.showFeedback(`Please enter a number between ${this.currentGame.minNumber} and ${this.currentGame.maxNumber}`, 'error');
            return;
        }

        this.currentGame.attempts++;
        this.currentGame.guessHistory.push(guess);

        if (guess === this.currentGame.targetNumber) {
            this.handleCorrectGuess();
        } else {
            this.handleIncorrectGuess(guess);
        }

        this.updateGameDisplay();
        this.guessInput.value = '';
        this.guessInput.focus();
    }

    handleCorrectGuess() {
        this.currentGame.score = this.calculateScore();
        this.showFeedback('Congratulations! You got it!', 'success');
        this.updateHint('');
        
        // Check if it's a new best score
        const isNewBest = this.updateBestScore();
        
        setTimeout(() => {
            this.showGameOver(isNewBest);
            this.createConfetti();
        }, 1500);
    }

    handleIncorrectGuess(guess) {
        const target = this.currentGame.targetNumber;
        const difference = Math.abs(guess - target);
        const range = this.currentGame.maxNumber - this.currentGame.minNumber + 1;
        
        let feedbackText, hintText;
        
        if (guess < target) {
            feedbackText = 'Too low!';
            hintText = 'Try a higher number';
        } else {
            feedbackText = 'Too high!';
            hintText = 'Try a lower number';
        }
        
        // Add proximity hint
        if (difference <= range * 0.05) {
            hintText += ' - You\'re very close!';
        } else if (difference <= range * 0.1) {
            hintText += ' - You\'re getting warm!';
        } else if (difference <= range * 0.2) {
            hintText += ' - You\'re in the right area';
        }
        
        this.showFeedback(feedbackText, 'error');
        this.updateHint(hintText);
        
        // Add attempt to history
        this.addAttemptToHistory(guess, guess < target ? 'too-low' : 'too-high');
    }

    calculateScore() {
        const maxScore = this.currentGame.maxScore;
        const attempts = this.currentGame.attempts;
        const optimalAttempts = Math.ceil(Math.log2(this.currentGame.maxNumber - this.currentGame.minNumber + 1));
        
        // Calculate score based on attempts vs optimal attempts
        let score = Math.max(0, maxScore - ((attempts - optimalAttempts) * 50));
        
        // Bonus for very quick guesses
        if (attempts <= optimalAttempts) {
            score += (optimalAttempts - attempts) * 100;
        }
        
        // Time bonus (faster solving gets more points)
        const timeElapsed = (Date.now() - this.currentGame.startTime) / 1000;
        const timeBonus = Math.max(0, 500 - timeElapsed);
        score += Math.floor(timeBonus);
        
        return Math.max(100, score); // Minimum score of 100
    }

    updateBestScore() {
        const difficulty = this.currentGame.difficulty;
        const score = this.currentGame.score;
        
        if (difficulty === 'custom') {
            return false; // Don't track custom games
        }
        
        const currentBest = this.bestScores[difficulty];
        if (!currentBest || score > currentBest) {
            this.bestScores[difficulty] = score;
            this.saveBestScores();
            this.updateBestScoresDisplay();
            return true;
        }
        
        return false;
    }

    showFeedback(message, type) {
        this.feedbackMessage.textContent = message;
        this.feedbackMessage.className = `feedback-message ${type}`;
    }

    updateHint(hint) {
        this.hintMessage.textContent = hint;
    }

    clearFeedback() {
        this.feedbackMessage.textContent = '';
        this.feedbackMessage.className = 'feedback-message';
        this.hintMessage.textContent = '';
    }

    addAttemptToHistory(guess, type) {
        const attemptItem = document.createElement('div');
        attemptItem.className = `attempt-item ${type}`;
        attemptItem.textContent = guess;
        this.attemptsList.appendChild(attemptItem);
        
        // Scroll to latest attempt
        attemptItem.scrollIntoView({ behavior: 'smooth' });
    }

    updateGameDisplay() {
        this.rangeDisplay.textContent = `${this.currentGame.minNumber} - ${this.currentGame.maxNumber}`;
        this.attemptsDisplay.textContent = this.currentGame.attempts;
        this.scoreDisplay.textContent = this.currentGame.score;
    }

    showGameOver(isNewBest) {
        this.gameSection.style.display = 'none';
        this.gameOverSection.style.display = 'block';
        
        let message = `Amazing! You guessed the number in ${this.currentGame.attempts} attempts!`;
        if (isNewBest) {
            message += ' 🎉 NEW BEST SCORE! 🎉';
        }
        
        this.celebrationMessage.textContent = message;
        this.finalNumber.textContent = this.currentGame.targetNumber;
        this.finalAttempts.textContent = this.currentGame.attempts;
        this.finalScore.textContent = this.currentGame.score;
    }

    playAgain() {
        // Reset game with same settings
        this.currentGame.targetNumber = this.generateRandomNumber(
            this.currentGame.minNumber, 
            this.currentGame.maxNumber
        );
        this.currentGame.attempts = 0;
        this.currentGame.score = 0;
        this.currentGame.guessHistory = [];
        this.currentGame.startTime = Date.now();
        
        this.showGameSection();
        this.updateGameDisplay();
        this.clearFeedback();
        this.attemptsList.innerHTML = '';
        this.guessInput.focus();
    }

    newGame() {
        this.showSetupSection();
        this.currentGame = null;
        this.clearFeedback();
        this.attemptsList.innerHTML = '';
    }

    showSetupSection() {
        this.setupSection.style.display = 'block';
        this.gameSection.style.display = 'none';
        this.gameOverSection.style.display = 'none';
    }

    showGameSection() {
        this.setupSection.style.display = 'none';
        this.gameSection.style.display = 'block';
        this.gameOverSection.style.display = 'none';
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            
            this.confettiContainer.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 5000);
        }
    }

    loadBestScores() {
        const saved = localStorage.getItem('numberGuessingBestScores');
        return saved ? JSON.parse(saved) : {};
    }

    saveBestScores() {
        localStorage.setItem('numberGuessingBestScores', JSON.stringify(this.bestScores));
    }

    updateBestScoresDisplay() {
        this.bestEasy.textContent = this.bestScores.easy || '-';
        this.bestMedium.textContent = this.bestScores.medium || '-';
        this.bestHard.textContent = this.bestScores.hard || '-';
        this.bestExpert.textContent = this.bestScores.expert || '-';
    }

    clearAllScores() {
        if (confirm('Are you sure you want to clear all best scores?')) {
            this.bestScores = {};
            this.saveBestScores();
            this.updateBestScoresDisplay();
            this.showFeedback('All scores cleared!', 'info');
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new NumberGuessingGame();
});

// Add some additional interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const gameSection = document.getElementById('gameSection');
            const gameOverSection = document.getElementById('gameOverSection');
            
            if (gameSection.style.display !== 'none') {
                // Go back to setup
                document.getElementById('newGameBtn').click();
            } else if (gameOverSection.style.display !== 'none') {
                // Play again
                document.getElementById('playAgainBtn').click();
            }
        }
    });
    
    // Add visual feedback for buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = '';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });
    
    // Add number input validation
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value && (parseInt(value) < 1 || parseInt(value) > 10000)) {
                e.target.style.borderColor = '#e53e3e';
            } else {
                e.target.style.borderColor = '#e2e8f0';
            }
        });
    });
    
    // Add range validation for custom range
    const minInput = document.getElementById('minNumber');
    const maxInput = document.getElementById('maxNumber');
    
    function validateRange() {
        const min = parseInt(minInput.value);
        const max = parseInt(maxInput.value);
        
        if (min >= max) {
            minInput.style.borderColor = '#e53e3e';
            maxInput.style.borderColor = '#e53e3e';
        } else {
            minInput.style.borderColor = '#e2e8f0';
            maxInput.style.borderColor = '#e2e8f0';
        }
    }
    
    minInput.addEventListener('input', validateRange);
    maxInput.addEventListener('input', validateRange);
});