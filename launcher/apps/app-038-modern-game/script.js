class ModernTetris {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.BLOCK_SIZE = 30;
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        
        this.board = this.createBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.colors = [
            '#000000', '#FF0000', '#00FF00', '#0000FF',
            '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'
        ];
        
        this.pieces = [
            [
                [1, 1, 1, 1]
            ],
            [
                [2, 2],
                [2, 2]
            ],
            [
                [3, 3, 3],
                [0, 3, 0]
            ],
            [
                [4, 4, 4],
                [4, 0, 0]
            ],
            [
                [5, 5, 5],
                [0, 0, 5]
            ],
            [
                [6, 6, 0],
                [0, 6, 6]
            ],
            [
                [0, 7, 7],
                [7, 7, 0]
            ]
        ];
        
        this.currentPiece = null;
        this.nextPiece = null;
        this.piecePos = { x: 0, y: 0 };
        
        this.initializeElements();
        this.bindEvents();
        this.generateNextPiece();
        this.spawnPiece();
        this.draw();
    }
    
    initializeElements() {
        this.elements = {
            score: document.getElementById('score'),
            level: document.getElementById('level'),
            lines: document.getElementById('lines'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            gameOver: document.getElementById('gameOver'),
            finalScore: document.getElementById('finalScore'),
            restartBtn: document.getElementById('restartBtn')
        };
    }
    
    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    createBoard() {
        return Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
    }
    
    generateNextPiece() {
        this.nextPiece = this.pieces[Math.floor(Math.random() * this.pieces.length)];
        this.drawNext();
    }
    
    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.piecePos = { x: Math.floor(this.BOARD_WIDTH / 2) - 1, y: 0 };
        this.generateNextPiece();
        
        if (this.collision()) {
            this.gameOver();
        }
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                this.move(-1, 0);
                break;
            case 'ArrowRight':
                this.move(1, 0);
                break;
            case 'ArrowDown':
                this.move(0, 1);
                break;
            case 'ArrowUp':
                this.rotate();
                break;
            case ' ':
                this.hardDrop();
                break;
        }
    }
    
    move(dx, dy) {
        this.piecePos.x += dx;
        this.piecePos.y += dy;
        
        if (this.collision()) {
            this.piecePos.x -= dx;
            this.piecePos.y -= dy;
            
            if (dy > 0) {
                this.merge();
                this.clearLines();
                this.spawnPiece();
            }
        }
    }
    
    rotate() {
        const rotated = this.currentPiece[0].map((_, i) => 
            this.currentPiece.map(row => row[i]).reverse()
        );
        
        const originalPiece = this.currentPiece;
        this.currentPiece = rotated;
        
        if (this.collision()) {
            this.currentPiece = originalPiece;
        }
    }
    
    hardDrop() {
        while (!this.collision()) {
            this.piecePos.y++;
        }
        this.piecePos.y--;
        this.merge();
        this.clearLines();
        this.spawnPiece();
    }
    
    collision() {
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x] !== 0) {
                    const newX = this.piecePos.x + x;
                    const newY = this.piecePos.y + y;
                    
                    if (newX < 0 || newX >= this.BOARD_WIDTH || 
                        newY >= this.BOARD_HEIGHT || 
                        (newY >= 0 && this.board[newY][newX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    merge() {
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x] !== 0) {
                    const boardY = this.piecePos.y + y;
                    const boardX = this.piecePos.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece[y][x];
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
            this.updateDisplay();
        }
    }
    
    update(deltaTime) {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.dropTime += deltaTime;
        
        if (this.dropTime >= this.dropInterval) {
            this.move(0, 1);
            this.dropTime = 0;
        }
    }
    
    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBoard();
        this.drawCurrentPiece();
        this.drawGhost();
    }
    
    drawBoard() {
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x] !== 0) {
                    this.drawBlock(x, y, this.colors[this.board[y][x]]);
                }
            }
        }
    }
    
    drawCurrentPiece() {
        if (!this.currentPiece) return;
        
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x] !== 0) {
                    this.drawBlock(
                        this.piecePos.x + x,
                        this.piecePos.y + y,
                        this.colors[this.currentPiece[y][x]]
                    );
                }
            }
        }
    }
    
    drawGhost() {
        if (!this.currentPiece) return;
        
        const ghostY = this.piecePos.y;
        this.piecePos.y = this.getGhostY();
        
        for (let y = 0; y < this.currentPiece.length; y++) {
            for (let x = 0; x < this.currentPiece[y].length; x++) {
                if (this.currentPiece[y][x] !== 0) {
                    this.drawGhostBlock(this.piecePos.x + x, this.piecePos.y + y);
                }
            }
        }
        
        this.piecePos.y = ghostY;
    }
    
    getGhostY() {
        let ghostY = this.piecePos.y;
        this.piecePos.y = ghostY;
        
        while (!this.collision()) {
            ghostY++;
            this.piecePos.y = ghostY;
        }
        
        return ghostY - 1;
    }
    
    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
        this.ctx.strokeStyle = '#FFF';
        this.ctx.strokeRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
    }
    
    drawGhostBlock(x, y) {
        this.ctx.strokeStyle = '#FFF';
        this.ctx.strokeRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
    }
    
    drawNext() {
        if (!this.nextPiece) return;
        
        this.nextCtx.fillStyle = '#f9f9f9';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const blockSize = 20;
        const offsetX = (this.nextCanvas.width - this.nextPiece[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.length * blockSize) / 2;
        
        for (let y = 0; y < this.nextPiece.length; y++) {
            for (let x = 0; x < this.nextPiece[y].length; x++) {
                if (this.nextPiece[y][x] !== 0) {
                    this.nextCtx.fillStyle = this.colors[this.nextPiece[y][x]];
                    this.nextCtx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        blockSize
                    );
                    this.nextCtx.strokeStyle = '#FFF';
                    this.nextCtx.strokeRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        blockSize
                    );
                }
            }
        }
    }
    
    updateDisplay() {
        this.elements.score.textContent = this.score;
        this.elements.level.textContent = this.level;
        this.elements.lines.textContent = this.lines;
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        this.gameLoop();
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        this.elements.pauseBtn.textContent = this.gamePaused ? '‹' : ' B\b';
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.board = this.createBoard();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
        
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.pauseBtn.textContent = ' B\b';
        this.elements.gameOver.classList.remove('active');
        
        this.generateNextPiece();
        this.spawnPiece();
        this.updateDisplay();
        this.draw();
    }
    
    restartGame() {
        this.resetGame();
        this.startGame();
    }
    
    gameOver() {
        this.gameRunning = false;
        this.elements.finalScore.textContent = this.score;
        this.elements.gameOver.classList.add('active');
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update(16);
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// ²üà
document.addEventListener('DOMContentLoaded', () => {
    new ModernTetris();
});