class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.gameMessage = document.getElementById('gameMessage');
        this.gameInstructions = document.getElementById('gameInstructions');
        this.startButton = document.getElementById('startButton');
        
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.gamesPlayedElement = document.getElementById('gamesPlayed');
        this.bestScoreElement = document.getElementById('bestScore');
        this.avgScoreElement = document.getElementById('avgScore');
        
        this.difficultySelect = document.getElementById('difficulty');
        this.boardSizeSelect = document.getElementById('boardSize');
        
        this.gridSize = 20;
        this.tileCount = 20;
        this.gameRunning = false;
        this.gameStarted = false;
        this.direction = { x: 0, y: 0 };
        this.score = 0;
        this.gameLoop = null;
        
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        
        this.difficulties = {
            easy: 200,
            medium: 150,
            hard: 100
        };
        
        this.boardSizes = {
            small: 20,
            medium: 25,
            large: 30
        };
        
        this.loadGameData();
        this.setupEventListeners();
        this.updateCanvas();
        this.updateStats();
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Start button
        this.startButton.addEventListener('click', () => this.startGame());
        
        // Mobile controls
        document.getElementById('upBtn').addEventListener('click', () => this.changeDirection(0, -1));
        document.getElementById('downBtn').addEventListener('click', () => this.changeDirection(0, 1));
        document.getElementById('leftBtn').addEventListener('click', () => this.changeDirection(-1, 0));
        document.getElementById('rightBtn').addEventListener('click', () => this.changeDirection(1, 0));
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        
        // Settings
        this.difficultySelect.addEventListener('change', () => this.updateSettings());
        this.boardSizeSelect.addEventListener('change', () => this.updateSettings());
    }
    
    updateSettings() {
        if (this.gameRunning) {
            this.endGame();
        }
        
        this.tileCount = this.boardSizes[this.boardSizeSelect.value];
        this.gridSize = Math.floor(400 / this.tileCount);
        this.updateCanvas();
    }
    
    updateCanvas() {
        this.canvas.width = this.tileCount * this.gridSize;
        this.canvas.height = this.tileCount * this.gridSize;
    }
    
    handleKeyPress(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            if (!this.gameRunning) {
                this.startGame();
            } else {
                this.togglePause();
            }
            return;
        }
        
        if (!this.gameRunning) return;
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.changeDirection(0, -1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.changeDirection(0, 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.changeDirection(-1, 0);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.changeDirection(1, 0);
                break;
        }
    }
    
    changeDirection(dx, dy) {
        if (!this.gameRunning) return;
        
        // Prevent reverse direction
        if (this.direction.x === -dx && this.direction.y === -dy) return;
        
        this.direction = { x: dx, y: dy };
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameStarted = true;
        this.score = 0;
        this.direction = { x: 0, y: 0 };
        
        // Reset snake position
        this.snake = [{ x: Math.floor(this.tileCount / 2), y: Math.floor(this.tileCount / 2) }];
        
        // Place food
        this.placeFood();
        
        // Hide overlay
        this.gameOverlay.classList.add('hidden');
        
        // Start game loop
        const speed = this.difficulties[this.difficultySelect.value];
        this.gameLoop = setInterval(() => this.update(), speed);
        
        this.updateScore();
    }
    
    togglePause() {
        if (!this.gameStarted) return;
        
        if (this.gameRunning) {
            this.gameRunning = false;
            clearInterval(this.gameLoop);
            this.showOverlay('Game Paused', 'Press SPACE to resume');
        } else {
            this.gameRunning = true;
            this.gameOverlay.classList.add('hidden');
            const speed = this.difficulties[this.difficultySelect.value];
            this.gameLoop = setInterval(() => this.update(), speed);
        }
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Move snake
        const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.endGame();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.placeFood();
        } else {
            this.snake.pop();
        }
        
        this.draw();
    }
    
    placeFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head
                this.ctx.fillStyle = '#4CAF50';
            } else {
                // Body
                this.ctx.fillStyle = '#81C784';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 2,
                segment.y * this.gridSize + 2,
                this.gridSize - 4,
                this.gridSize - 4
            );
            
            // Add border
            this.ctx.strokeStyle = '#2E7D32';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                segment.x * this.gridSize + 2,
                segment.y * this.gridSize + 2,
                this.gridSize - 4,
                this.gridSize - 4
            );
        });
        
        // Draw food
        this.ctx.fillStyle = '#FF5722';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 2,
            this.food.y * this.gridSize + 2,
            this.gridSize - 4,
            this.gridSize - 4
        );
        
        // Add food border
        this.ctx.strokeStyle = '#D84315';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            this.food.x * this.gridSize + 2,
            this.food.y * this.gridSize + 2,
            this.gridSize - 4,
            this.gridSize - 4
        );
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameStarted = false;
        clearInterval(this.gameLoop);
        
        // Update statistics
        this.updateGameStats();
        
        // Show game over message
        this.showOverlay('Game Over!', `Final Score: ${this.score}\\nPress SPACE to play again`);
    }
    
    showOverlay(title, message) {
        this.gameMessage.textContent = title;
        this.gameInstructions.textContent = message;
        this.gameOverlay.classList.remove('hidden');
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    updateGameStats() {
        const gameData = this.getGameData();
        
        gameData.gamesPlayed++;
        gameData.totalScore += this.score;
        
        if (this.score > gameData.highScore) {
            gameData.highScore = this.score;
        }
        
        gameData.averageScore = Math.round(gameData.totalScore / gameData.gamesPlayed);
        
        this.saveGameData(gameData);
        this.updateStats();
    }
    
    updateStats() {
        const gameData = this.getGameData();
        
        this.highScoreElement.textContent = gameData.highScore;
        this.gamesPlayedElement.textContent = gameData.gamesPlayed;
        this.bestScoreElement.textContent = gameData.highScore;
        this.avgScoreElement.textContent = gameData.averageScore;
    }
    
    getGameData() {
        const defaultData = {
            gamesPlayed: 0,
            highScore: 0,
            totalScore: 0,
            averageScore: 0
        };
        
        try {
            const saved = localStorage.getItem('snakeGameData');
            return saved ? JSON.parse(saved) : defaultData;
        } catch (error) {
            console.error('Error loading game data:', error);
            return defaultData;
        }
    }
    
    saveGameData(data) {
        try {
            localStorage.setItem('snakeGameData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    }
    
    loadGameData() {
        try {
            const saved = localStorage.getItem('snakeGameSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.difficultySelect.value = settings.difficulty || 'medium';
                this.boardSizeSelect.value = settings.boardSize || 'medium';
            }
        } catch (error) {
            console.error('Error loading game settings:', error);
        }
    }
    
    saveGameSettings() {
        try {
            const settings = {
                difficulty: this.difficultySelect.value,
                boardSize: this.boardSizeSelect.value
            };
            localStorage.setItem('snakeGameSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving game settings:', error);
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});