class MemoryGame {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.movesElement = document.getElementById('moves');
        this.timeElement = document.getElementById('time');
        this.bestScoreElement = document.getElementById('best-score');
        this.difficultySelect = document.getElementById('difficulty');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.winModal = document.getElementById('win-modal');
        this.pauseModal = document.getElementById('pause-modal');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.resumeBtn = document.getElementById('resume-btn');
        this.closeModal = document.querySelector('.close');
        
        // Game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.startTime = null;
        this.gameTime = 0;
        this.timer = null;
        this.isPaused = false;
        this.isGameActive = false;
        this.totalPairs = 0;
        
        // Card symbols for different difficulties
        this.easySymbols = ['🎮', '🎯', '🎲', '🎪', '🎭', '🎨', '🎸', '🎹'];
        this.hardSymbols = ['🎮', '🎯', '🎲', '🎪', '🎭', '🎨', '🎸', '🎹', 
                           '🎺', '🎻', '🎪', '🎳', '🎰', '🎱', '🎯', '🎲', 
                           '🎭', '🎨'];
        
        this.init();
    }
    
    init() {
        this.loadBestScore();
        this.bindEvents();
        this.startNewGame();
    }
    
    bindEvents() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.resumeBtn.addEventListener('click', () => this.togglePause());
        this.closeModal.addEventListener('click', () => this.closeWinModal());
        this.difficultySelect.addEventListener('change', () => this.startNewGame());
        
        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target === this.winModal) {
                this.closeWinModal();
            }
        });
    }
    
    startNewGame() {
        this.resetGameState();
        this.createBoard();
        this.shuffleCards();
        this.renderCards();
        this.startTimer();
        this.isGameActive = true;
        this.updatePauseButton();
    }
    
    resetGameState() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameTime = 0;
        this.startTime = null;
        this.isPaused = false;
        this.isGameActive = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.updateDisplay();
        this.closePauseModal();
    }
    
    createBoard() {
        const difficulty = this.difficultySelect.value;
        const symbols = difficulty === 'easy' ? this.easySymbols : this.hardSymbols;
        const gridSize = difficulty === 'easy' ? 4 : 6;
        const totalCards = gridSize * gridSize;
        this.totalPairs = totalCards / 2;
        
        // Create pairs of cards
        this.cards = [];
        for (let i = 0; i < this.totalPairs; i++) {
            const symbol = symbols[i];
            this.cards.push({ id: i * 2, symbol, isFlipped: false, isMatched: false });
            this.cards.push({ id: i * 2 + 1, symbol, isFlipped: false, isMatched: false });
        }
        
        // Set board class for styling
        this.gameBoard.className = `game-board ${difficulty}`;
    }
    
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    renderCards() {
        this.gameBoard.innerHTML = '';
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.cardId = card.id;
            cardElement.dataset.index = index;
            
            cardElement.innerHTML = `
                <div class="card-face card-back"></div>
                <div class="card-face card-front">${card.symbol}</div>
            `;
            
            cardElement.addEventListener('click', () => this.flipCard(index));
            this.gameBoard.appendChild(cardElement);
        });
    }
    
    flipCard(index) {
        if (!this.isGameActive || this.isPaused) return;
        
        const card = this.cards[index];
        const cardElement = this.gameBoard.children[index];
        
        // Can't flip if already flipped or matched
        if (card.isFlipped || card.isMatched) return;
        
        // Can't flip more than 2 cards
        if (this.flippedCards.length >= 2) return;
        
        // Flip the card
        card.isFlipped = true;
        cardElement.classList.add('flipped');
        this.flippedCards.push({ card, element: cardElement, index });
        
        // Check for match when 2 cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            
            setTimeout(() => {
                this.checkForMatch();
            }, 1000);
        }
    }
    
    checkForMatch() {
        const [first, second] = this.flippedCards;
        
        if (first.card.symbol === second.card.symbol) {
            // Match found
            this.handleMatch(first, second);
        } else {
            // No match
            this.handleNoMatch(first, second);
        }
        
        this.flippedCards = [];
        
        // Check for game completion
        if (this.matchedPairs === this.totalPairs) {
            this.gameWon();
        }
    }
    
    handleMatch(first, second) {
        first.card.isMatched = true;
        second.card.isMatched = true;
        first.element.classList.add('matched', 'match-animation');
        second.element.classList.add('matched', 'match-animation');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            first.element.classList.remove('match-animation');
            second.element.classList.remove('match-animation');
        }, 600);
        
        this.matchedPairs++;
    }
    
    handleNoMatch(first, second) {
        // Add shake animation
        first.element.classList.add('shake');
        second.element.classList.add('shake');
        
        // Remove shake animation
        setTimeout(() => {
            first.element.classList.remove('shake');
            second.element.classList.remove('shake');
        }, 500);
        
        // Flip cards back
        setTimeout(() => {
            first.card.isFlipped = false;
            second.card.isFlipped = false;
            first.element.classList.remove('flipped');
            second.element.classList.remove('flipped');
        }, 500);
    }
    
    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.gameTime = Math.floor((Date.now() - this.startTime) / 1000);
                this.updateDisplay();
            }
        }, 1000);
    }
    
    updateDisplay() {
        this.movesElement.textContent = this.moves;
        this.timeElement.textContent = this.formatTime(this.gameTime);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    togglePause() {
        if (!this.isGameActive) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.showPauseModal();
            this.gameBoard.classList.add('game-disabled');
        } else {
            this.closePauseModal();
            this.gameBoard.classList.remove('game-disabled');
            // Adjust start time to account for pause duration
            this.startTime = Date.now() - (this.gameTime * 1000);
        }
        
        this.updatePauseButton();
    }
    
    updatePauseButton() {
        this.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        this.pauseBtn.disabled = !this.isGameActive;
    }
    
    resetGame() {
        if (confirm('Are you sure you want to reset the game?')) {
            this.startNewGame();
        }
    }
    
    gameWon() {
        this.isGameActive = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        const score = this.calculateScore();
        const isNewBest = this.checkAndUpdateBestScore(score);
        
        this.showWinModal(score, isNewBest);
    }
    
    calculateScore() {
        // Lower score is better (fewer moves and less time)
        const difficulty = this.difficultySelect.value;
        const baseScore = difficulty === 'easy' ? 1000 : 1500;
        const movePenalty = this.moves * 10;
        const timePenalty = this.gameTime * 2;
        
        return Math.max(0, baseScore - movePenalty - timePenalty);
    }
    
    checkAndUpdateBestScore(score) {
        const difficulty = this.difficultySelect.value;
        const bestScoreKey = `memoryGame_bestScore_${difficulty}`;
        const currentBest = localStorage.getItem(bestScoreKey);
        
        if (!currentBest || score > parseInt(currentBest)) {
            localStorage.setItem(bestScoreKey, score.toString());
            this.loadBestScore();
            return true;
        }
        
        return false;
    }
    
    loadBestScore() {
        const difficulty = this.difficultySelect.value;
        const bestScoreKey = `memoryGame_bestScore_${difficulty}`;
        const bestScore = localStorage.getItem(bestScoreKey);
        
        this.bestScoreElement.textContent = bestScore ? bestScore : '--';
    }
    
    showWinModal(score, isNewBest) {
        document.getElementById('final-moves').textContent = this.moves;
        document.getElementById('final-time').textContent = this.formatTime(this.gameTime);
        document.getElementById('final-score').textContent = score;
        
        const newBestElement = document.getElementById('new-best-score');
        newBestElement.style.display = isNewBest ? 'block' : 'none';
        
        this.winModal.style.display = 'block';
        
        // Add celebration animation
        const celebration = document.querySelector('.celebration-icon');
        celebration.style.animation = 'none';
        setTimeout(() => {
            celebration.style.animation = 'bounce 1s infinite';
        }, 10);
    }
    
    showPauseModal() {
        this.pauseModal.style.display = 'block';
    }
    
    closePauseModal() {
        this.pauseModal.style.display = 'none';
    }
    
    closeWinModal() {
        this.winModal.style.display = 'none';
    }
    
    playAgain() {
        this.closeWinModal();
        this.startNewGame();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const winModal = document.getElementById('win-modal');
        const pauseModal = document.getElementById('pause-modal');
        
        if (winModal.style.display === 'block') {
            winModal.style.display = 'none';
        } else if (pauseModal.style.display === 'block') {
            pauseModal.style.display = 'none';
        }
    }
});

// Add visibility change handler to pause game when tab is not active
document.addEventListener('visibilitychange', () => {
    const game = window.memoryGame;
    if (game && game.isGameActive && !game.isPaused) {
        if (document.hidden) {
            game.togglePause();
        }
    }
});

// Expose game instance globally for debugging
window.memoryGame = null;
document.addEventListener('DOMContentLoaded', () => {
    window.memoryGame = new MemoryGame();
});