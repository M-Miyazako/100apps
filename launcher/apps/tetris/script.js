class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.holdCanvas = document.getElementById('holdCanvas');
        this.holdCtx = this.holdCanvas.getContext('2d');
        
        this.ROWS = 20;
        this.COLS = 10;
        this.BLOCK_SIZE = 30;
        
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.holdPiece = null;
        this.canHold = true;
        
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropTime = 0;
        this.dropInterval = 1000; // Start at 1 second
        
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        
        this.pieces = {
            'I': {
                color: '#00ffff',
                shape: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ]
            },
            'O': {
                color: '#ffff00',
                shape: [
                    [1, 1],
                    [1, 1]
                ]
            },
            'T': {
                color: '#ff00ff',
                shape: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ]
            },
            'S': {
                color: '#00ff00',
                shape: [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ]
            },
            'Z': {
                color: '#ff0000',
                shape: [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ]
            },
            'J': {
                color: '#0000ff',
                shape: [
                    [1, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ]
            },
            'L': {
                color: '#ff7f00',
                shape: [
                    [0, 0, 1],
                    [1, 1, 1],
                    [0, 0, 0]
                ]
            }
        };
        
        this.init();
    }
    
    init() {
        this.initBoard();
        this.setupEventListeners();
        this.generateNextPiece();
        this.spawnPiece();
        this.render();
    }
    
    initBoard() {
        this.board = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(0));
    }
    
    setupEventListeners() {
        // Button controls
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Prevent default behavior for arrow keys
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused || this.gameOver) return;
        
        switch(e.code) {
            case 'ArrowLeft':
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
            case 'Space':
                this.hardDrop();
                break;
            case 'KeyC':
                this.holdCurrentPiece();
                break;
            case 'KeyP':
                this.pauseGame();
                break;
        }
    }
    
    generateNextPiece() {
        const pieceTypes = Object.keys(this.pieces);
        const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        this.nextPiece = {
            type: randomType,
            shape: this.pieces[randomType].shape,
            color: this.pieces[randomType].color,
            x: Math.floor(this.COLS / 2) - Math.floor(this.pieces[randomType].shape[0].length / 2),
            y: 0
        };
    }
    
    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.generateNextPiece();
        this.canHold = true;
        
        // Check for game over
        if (this.isCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
            this.endGame();
        }
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (!this.isCollision(newX, newY, this.currentPiece.shape)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            return true;
        }
        
        // If moving down failed, lock the piece
        if (dy > 0) {
            this.lockPiece();
        }
        
        return false;
    }
    
    rotatePiece() {
        if (!this.currentPiece) return;
        
        const rotatedShape = this.rotateMatrix(this.currentPiece.shape);
        
        // Try basic rotation
        if (!this.isCollision(this.currentPiece.x, this.currentPiece.y, rotatedShape)) {
            this.currentPiece.shape = rotatedShape;
            return;
        }
        
        // Try wall kicks
        const kicks = [
            [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1],
            [-2, 0], [2, 0], [0, -2]
        ];
        
        for (let [kickX, kickY] of kicks) {
            if (!this.isCollision(this.currentPiece.x + kickX, this.currentPiece.y + kickY, rotatedShape)) {
                this.currentPiece.x += kickX;
                this.currentPiece.y += kickY;
                this.currentPiece.shape = rotatedShape;
                return;
            }
        }
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = matrix[i][j];
            }
        }
        
        return rotated;
    }
    
    hardDrop() {
        if (!this.currentPiece) return;
        
        let dropDistance = 0;
        while (this.movePiece(0, 1)) {
            dropDistance++;
        }
        
        // Add bonus points for hard drop
        this.score += dropDistance * 2;
        this.updateScore();
    }
    
    holdCurrentPiece() {
        if (!this.currentPiece || !this.canHold) return;
        
        if (this.holdPiece) {
            // Swap current piece with held piece
            const temp = this.holdPiece;
            this.holdPiece = {
                type: this.currentPiece.type,
                shape: this.pieces[this.currentPiece.type].shape,
                color: this.currentPiece.color
            };
            this.currentPiece = {
                type: temp.type,
                shape: temp.shape,
                color: temp.color,
                x: Math.floor(this.COLS / 2) - Math.floor(temp.shape[0].length / 2),
                y: 0
            };
        } else {
            // Hold current piece and spawn next
            this.holdPiece = {
                type: this.currentPiece.type,
                shape: this.pieces[this.currentPiece.type].shape,
                color: this.currentPiece.color
            };
            this.spawnPiece();
        }
        
        this.canHold = false;
    }
    
    isCollision(x, y, shape) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    if (newX < 0 || newX >= this.COLS || newY >= this.ROWS) {
                        return true;
                    }
                    
                    if (newY >= 0 && this.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    lockPiece() {
        if (!this.currentPiece) return;
        
        // Place piece on board
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const boardY = this.currentPiece.y + row;
                    const boardX = this.currentPiece.x + col;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        // Check for completed lines
        this.clearLines();
        
        // Spawn next piece
        this.spawnPiece();
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.ROWS - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.COLS).fill(0));
                linesCleared++;
                row++; // Check the same row again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.updateLines();
            
            // Calculate score based on lines cleared
            const scoreMultiplier = [0, 40, 100, 300, 1200];
            this.score += scoreMultiplier[linesCleared] * this.level;
            this.updateScore();
            
            // Level up every 10 lines
            const newLevel = Math.floor(this.lines / 10) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                this.updateLevel();
                this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
            }
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameOver = false;
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('gameOver').style.display = 'none';
        
        this.gameLoop();
    }
    
    pauseGame() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? 'RESUME' : 'PAUSE';
        
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropTime = 0;
        this.dropInterval = 1000;
        
        this.canHold = true;
        this.holdPiece = null;
        
        this.initBoard();
        this.generateNextPiece();
        this.spawnPiece();
        
        this.updateScore();
        this.updateLines();
        this.updateLevel();
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = 'PAUSE';
        document.getElementById('gameOver').style.display = 'none';
        
        this.render();
    }
    
    restartGame() {
        this.resetGame();
        this.startGame();
    }
    
    endGame() {
        this.gameRunning = false;
        this.gameOver = true;
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused || this.gameOver) return;
        
        const now = Date.now();
        
        if (now - this.dropTime > this.dropInterval) {
            this.movePiece(0, 1);
            this.dropTime = now;
        }
        
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    render() {
        this.clearCanvas();
        this.drawBoard();
        this.drawCurrentPiece();
        this.drawNextPiece();
        this.drawHoldPiece();
        this.drawGhost();
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        this.holdCtx.clearRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
    }
    
    drawBoard() {
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                if (this.board[row][col]) {
                    this.ctx.fillStyle = this.board[row][col];
                    this.ctx.fillRect(col * this.BLOCK_SIZE, row * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
                    this.ctx.strokeStyle = '#333';
                    this.ctx.strokeRect(col * this.BLOCK_SIZE, row * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
                }
            }
        }
    }
    
    drawCurrentPiece() {
        if (!this.currentPiece) return;
        
        this.ctx.fillStyle = this.currentPiece.color;
        
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const x = (this.currentPiece.x + col) * this.BLOCK_SIZE;
                    const y = (this.currentPiece.y + row) * this.BLOCK_SIZE;
                    
                    this.ctx.fillRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);
                    this.ctx.strokeStyle = '#333';
                    this.ctx.strokeRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);
                }
            }
        }
    }
    
    drawGhost() {
        if (!this.currentPiece) return;
        
        let ghostY = this.currentPiece.y;
        while (!this.isCollision(this.currentPiece.x, ghostY + 1, this.currentPiece.shape)) {
            ghostY++;
        }
        
        this.ctx.fillStyle = this.currentPiece.color + '40'; // Semi-transparent
        
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const x = (this.currentPiece.x + col) * this.BLOCK_SIZE;
                    const y = (ghostY + row) * this.BLOCK_SIZE;
                    
                    this.ctx.fillRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);
                    this.ctx.strokeStyle = this.currentPiece.color + '80';
                    this.ctx.strokeRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);
                }
            }
        }
    }
    
    drawNextPiece() {
        if (!this.nextPiece) return;
        
        const blockSize = 20;
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;
        
        this.nextCtx.fillStyle = this.nextPiece.color;
        
        for (let row = 0; row < this.nextPiece.shape.length; row++) {
            for (let col = 0; col < this.nextPiece.shape[row].length; col++) {
                if (this.nextPiece.shape[row][col]) {
                    const x = offsetX + col * blockSize;
                    const y = offsetY + row * blockSize;
                    
                    this.nextCtx.fillRect(x, y, blockSize, blockSize);
                    this.nextCtx.strokeStyle = '#333';
                    this.nextCtx.strokeRect(x, y, blockSize, blockSize);
                }
            }
        }
    }
    
    drawHoldPiece() {
        if (!this.holdPiece) return;
        
        const blockSize = 20;
        const offsetX = (this.holdCanvas.width - this.holdPiece.shape[0].length * blockSize) / 2;
        const offsetY = (this.holdCanvas.height - this.holdPiece.shape.length * blockSize) / 2;
        
        this.holdCtx.fillStyle = this.canHold ? this.holdPiece.color : this.holdPiece.color + '60';
        
        for (let row = 0; row < this.holdPiece.shape.length; row++) {
            for (let col = 0; col < this.holdPiece.shape[row].length; col++) {
                if (this.holdPiece.shape[row][col]) {
                    const x = offsetX + col * blockSize;
                    const y = offsetY + row * blockSize;
                    
                    this.holdCtx.fillRect(x, y, blockSize, blockSize);
                    this.holdCtx.strokeStyle = '#333';
                    this.holdCtx.strokeRect(x, y, blockSize, blockSize);
                }
            }
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
    
    updateLines() {
        document.getElementById('lines').textContent = this.lines;
    }
    
    updateLevel() {
        document.getElementById('level').textContent = this.level;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});