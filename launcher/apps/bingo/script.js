// Bingo Game Logic
class BingoGame {
    constructor() {
        this.bingoCard = [];
        this.calledNumbers = [];
        this.gameStats = {
            gamesPlayed: 0,
            gamesWon: 0,
            numbersCalledInCurrentGame: 0
        };
        this.isGameActive = false;
        this.currentNumber = null;
        this.winPatterns = {
            line: 'line',
            diagonal: 'diagonal',
            fullhouse: 'fullhouse',
            any: 'any'
        };
        this.currentWinPattern = 'line';
        
        this.initializeGame();
        this.bindEvents();
        this.loadStats();
    }

    initializeGame() {
        this.generateBingoCard();
        this.updateDisplay();
        this.updateStats();
        this.setGameMessage('Click "New Game" to start playing!');
    }

    bindEvents() {
        document.getElementById('newGame').addEventListener('click', () => this.startNewGame());
        document.getElementById('newCard').addEventListener('click', () => this.generateNewCard());
        document.getElementById('callNumber').addEventListener('click', () => this.callNextNumber());
        document.getElementById('playAgain').addEventListener('click', () => this.playAgain());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        
        // Win pattern selection
        document.querySelectorAll('input[name="winPattern"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentWinPattern = e.target.value;
                this.checkForWin();
            });
        });

        // Close modal on outside click
        document.getElementById('winModal').addEventListener('click', (e) => {
            if (e.target.id === 'winModal') {
                this.closeModal();
            }
        });
    }

    generateBingoCard() {
        this.bingoCard = [];
        
        // Generate numbers for each column
        // B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
        const ranges = [
            [1, 15],   // B
            [16, 30],  // I
            [31, 45],  // N
            [46, 60],  // G
            [61, 75]   // O
        ];

        for (let col = 0; col < 5; col++) {
            const column = [];
            const usedNumbers = new Set();
            
            for (let row = 0; row < 5; row++) {
                if (col === 2 && row === 2) {
                    // Free space in center
                    column.push({
                        number: 'FREE',
                        marked: true,
                        isFree: true
                    });
                } else {
                    let number;
                    do {
                        number = Math.floor(Math.random() * 15) + ranges[col][0];
                    } while (usedNumbers.has(number));
                    
                    usedNumbers.add(number);
                    column.push({
                        number: number,
                        marked: false,
                        isFree: false
                    });
                }
            }
            this.bingoCard.push(column);
        }
        
        this.renderBingoCard();
    }

    renderBingoCard() {
        const grid = document.getElementById('bingoGrid');
        grid.innerHTML = '';
        
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const cell = document.createElement('div');
                const cellData = this.bingoCard[col][row];
                
                cell.className = 'bingo-cell';
                cell.textContent = cellData.number;
                
                if (cellData.isFree) {
                    cell.classList.add('free');
                } else if (cellData.marked) {
                    cell.classList.add('marked');
                }
                
                cell.addEventListener('click', () => this.toggleCell(col, row));
                grid.appendChild(cell);
            }
        }
    }

    toggleCell(col, row) {
        if (!this.isGameActive) return;
        
        const cell = this.bingoCard[col][row];
        if (cell.isFree) return;
        
        // Check if this number has been called
        const letter = this.getLetterFromColumn(col);
        const calledNumber = `${letter}${cell.number}`;
        
        if (this.calledNumbers.includes(calledNumber)) {
            cell.marked = !cell.marked;
            this.renderBingoCard();
            this.checkForWin();
        } else {
            this.setGameMessage(`${calledNumber} has not been called yet!`);
        }
    }

    getLetterFromColumn(col) {
        const letters = ['B', 'I', 'N', 'G', 'O'];
        return letters[col];
    }

    startNewGame() {
        this.isGameActive = true;
        this.calledNumbers = [];
        this.gameStats.numbersCalledInCurrentGame = 0;
        this.currentNumber = null;
        
        // Reset all marked cells except free space
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 5; row++) {
                if (!this.bingoCard[col][row].isFree) {
                    this.bingoCard[col][row].marked = false;
                }
            }
        }
        
        this.renderBingoCard();
        this.clearCalledNumbers();
        this.updateDisplay();
        this.updateStats();
        this.setGameMessage('Game started! Click "Call Number" to begin.');
        
        // Enable call number button
        document.getElementById('callNumber').disabled = false;
    }

    generateNewCard() {
        this.generateBingoCard();
        this.setGameMessage('New card generated! Click "New Game" to start playing.');
        this.isGameActive = false;
        document.getElementById('callNumber').disabled = true;
    }

    callNextNumber() {
        if (!this.isGameActive) return;
        
        const availableNumbers = this.getAvailableNumbers();
        if (availableNumbers.length === 0) {
            this.setGameMessage('All numbers have been called!');
            this.isGameActive = false;
            document.getElementById('callNumber').disabled = true;
            return;
        }
        
        // Select random number
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        this.currentNumber = availableNumbers[randomIndex];
        this.calledNumbers.push(this.currentNumber);
        this.gameStats.numbersCalledInCurrentGame++;
        
        this.updateDisplay();
        this.updateCalledNumbers();
        this.updateStats();
        this.setGameMessage(`Number called: ${this.currentNumber}`);
        
        // Animate current number
        const currentNumberElement = document.getElementById('currentNumber');
        currentNumberElement.classList.add('animate');
        setTimeout(() => {
            currentNumberElement.classList.remove('animate');
        }, 800);
        
        // Auto-mark if enabled and number is on card
        this.autoMarkNumber();
    }

    getAvailableNumbers() {
        const allNumbers = [];
        const ranges = [
            [1, 15, 'B'],   // B
            [16, 30, 'I'],  // I
            [31, 45, 'N'],  // N
            [46, 60, 'G'],  // G
            [61, 75, 'O']   // O
        ];
        
        ranges.forEach(([start, end, letter]) => {
            for (let i = start; i <= end; i++) {
                const numberString = `${letter}${i}`;
                if (!this.calledNumbers.includes(numberString)) {
                    allNumbers.push(numberString);
                }
            }
        });
        
        return allNumbers;
    }

    autoMarkNumber() {
        if (!this.currentNumber) return;
        
        const letter = this.currentNumber.charAt(0);
        const number = parseInt(this.currentNumber.substring(1));
        const col = ['B', 'I', 'N', 'G', 'O'].indexOf(letter);
        
        // Find and mark the number if it's on the card
        for (let row = 0; row < 5; row++) {
            const cell = this.bingoCard[col][row];
            if (cell.number === number && !cell.isFree) {
                cell.marked = true;
                this.renderBingoCard();
                this.checkForWin();
                break;
            }
        }
    }

    updateDisplay() {
        const currentNumberElement = document.getElementById('currentNumber');
        if (this.currentNumber) {
            const letter = this.currentNumber.charAt(0);
            const number = this.currentNumber.substring(1);
            currentNumberElement.innerHTML = `<span class="letter">${letter}</span><span class="number">${number}</span>`;
        } else {
            currentNumberElement.innerHTML = '<span class="letter">B</span><span class="number">-</span>';
        }
    }

    updateCalledNumbers() {
        const columns = ['B', 'I', 'N', 'G', 'O'];
        
        columns.forEach((letter, index) => {
            const container = document.getElementById(`called${letter}`);
            const numbersForColumn = this.calledNumbers
                .filter(num => num.startsWith(letter))
                .map(num => num.substring(1))
                .sort((a, b) => parseInt(a) - parseInt(b));
            
            container.innerHTML = numbersForColumn
                .map(num => `<div class="called-number">${num}</div>`)
                .join('');
        });
    }

    clearCalledNumbers() {
        ['B', 'I', 'N', 'G', 'O'].forEach(letter => {
            document.getElementById(`called${letter}`).innerHTML = '';
        });
    }

    checkForWin() {
        if (!this.isGameActive) return false;
        
        let hasWon = false;
        let winType = '';
        
        switch (this.currentWinPattern) {
            case 'line':
                hasWon = this.checkLineWin();
                winType = 'line';
                break;
            case 'diagonal':
                hasWon = this.checkDiagonalWin();
                winType = 'diagonal';
                break;
            case 'fullhouse':
                hasWon = this.checkFullHouseWin();
                winType = 'full house';
                break;
            case 'any':
                hasWon = this.checkLineWin() || this.checkDiagonalWin();
                winType = this.checkLineWin() ? 'line' : 'diagonal';
                break;
        }
        
        if (hasWon) {
            this.handleWin(winType);
            return true;
        }
        
        return false;
    }

    checkLineWin() {
        // Check rows
        for (let row = 0; row < 5; row++) {
            let rowComplete = true;
            for (let col = 0; col < 5; col++) {
                if (!this.bingoCard[col][row].marked) {
                    rowComplete = false;
                    break;
                }
            }
            if (rowComplete) {
                this.highlightWinningCells('row', row);
                return true;
            }
        }
        
        // Check columns
        for (let col = 0; col < 5; col++) {
            let colComplete = true;
            for (let row = 0; row < 5; row++) {
                if (!this.bingoCard[col][row].marked) {
                    colComplete = false;
                    break;
                }
            }
            if (colComplete) {
                this.highlightWinningCells('col', col);
                return true;
            }
        }
        
        return false;
    }

    checkDiagonalWin() {
        // Check main diagonal (top-left to bottom-right)
        let mainDiagComplete = true;
        for (let i = 0; i < 5; i++) {
            if (!this.bingoCard[i][i].marked) {
                mainDiagComplete = false;
                break;
            }
        }
        if (mainDiagComplete) {
            this.highlightWinningCells('mainDiag');
            return true;
        }
        
        // Check anti-diagonal (top-right to bottom-left)
        let antiDiagComplete = true;
        for (let i = 0; i < 5; i++) {
            if (!this.bingoCard[i][4 - i].marked) {
                antiDiagComplete = false;
                break;
            }
        }
        if (antiDiagComplete) {
            this.highlightWinningCells('antiDiag');
            return true;
        }
        
        return false;
    }

    checkFullHouseWin() {
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 5; row++) {
                if (!this.bingoCard[col][row].marked) {
                    return false;
                }
            }
        }
        this.highlightWinningCells('fullhouse');
        return true;
    }

    highlightWinningCells(winType, index = null) {
        const cells = document.querySelectorAll('.bingo-cell');
        
        switch (winType) {
            case 'row':
                for (let col = 0; col < 5; col++) {
                    const cellIndex = index * 5 + col;
                    cells[cellIndex].classList.add('winning');
                }
                break;
            case 'col':
                for (let row = 0; row < 5; row++) {
                    const cellIndex = row * 5 + index;
                    cells[cellIndex].classList.add('winning');
                }
                break;
            case 'mainDiag':
                for (let i = 0; i < 5; i++) {
                    const cellIndex = i * 5 + i;
                    cells[cellIndex].classList.add('winning');
                }
                break;
            case 'antiDiag':
                for (let i = 0; i < 5; i++) {
                    const cellIndex = i * 5 + (4 - i);
                    cells[cellIndex].classList.add('winning');
                }
                break;
            case 'fullhouse':
                cells.forEach(cell => cell.classList.add('winning'));
                break;
        }
    }

    handleWin(winType) {
        this.isGameActive = false;
        this.gameStats.gamesWon++;
        this.gameStats.gamesPlayed++;
        
        document.getElementById('callNumber').disabled = true;
        
        this.updateStats();
        this.saveStats();
        this.setGameMessage(`🎉 BINGO! You won with a ${winType} pattern!`);
        
        // Show win modal
        const modal = document.getElementById('winModal');
        const winMessage = document.getElementById('winMessage');
        winMessage.textContent = `Congratulations! You won with a ${winType} pattern in ${this.gameStats.numbersCalledInCurrentGame} calls!`;
        modal.style.display = 'block';
    }

    playAgain() {
        this.closeModal();
        this.startNewGame();
    }

    closeModal() {
        document.getElementById('winModal').style.display = 'none';
        // Remove winning highlights
        document.querySelectorAll('.winning').forEach(cell => {
            cell.classList.remove('winning');
        });
    }

    updateStats() {
        document.getElementById('numbersCalledCount').textContent = this.gameStats.numbersCalledInCurrentGame;
        document.getElementById('gamesPlayedCount').textContent = this.gameStats.gamesPlayed;
        document.getElementById('gamesWonCount').textContent = this.gameStats.gamesWon;
        
        const winRate = this.gameStats.gamesPlayed > 0 ? 
            Math.round((this.gameStats.gamesWon / this.gameStats.gamesPlayed) * 100) : 0;
        document.getElementById('winRate').textContent = `${winRate}%`;
    }

    setGameMessage(message) {
        document.getElementById('gameMessage').textContent = message;
    }

    saveStats() {
        localStorage.setItem('bingoGameStats', JSON.stringify(this.gameStats));
    }

    loadStats() {
        const savedStats = localStorage.getItem('bingoGameStats');
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            this.gameStats.gamesPlayed = stats.gamesPlayed || 0;
            this.gameStats.gamesWon = stats.gamesWon || 0;
            // Don't load numbersCalledInCurrentGame as it's reset each game
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new BingoGame();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'n':
            case 'N':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    document.getElementById('newGame').click();
                }
                break;
            case 'c':
            case 'C':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    document.getElementById('newCard').click();
                }
                break;
            case ' ':
                e.preventDefault();
                document.getElementById('callNumber').click();
                break;
            case 'Escape':
                game.closeModal();
                break;
        }
    });
    
    // Add tooltip for keyboard shortcuts
    const shortcuts = document.createElement('div');
    shortcuts.style.position = 'fixed';
    shortcuts.style.bottom = '10px';
    shortcuts.style.right = '10px';
    shortcuts.style.background = 'rgba(0,0,0,0.8)';
    shortcuts.style.color = 'white';
    shortcuts.style.padding = '10px';
    shortcuts.style.borderRadius = '5px';
    shortcuts.style.fontSize = '12px';
    shortcuts.style.zIndex = '1000';
    shortcuts.innerHTML = `
        <strong>Keyboard Shortcuts:</strong><br>
        Ctrl+N: New Game<br>
        Ctrl+C: New Card<br>
        Space: Call Number<br>
        Esc: Close Modal
    `;
    document.body.appendChild(shortcuts);
    
    // Hide shortcuts after 5 seconds
    setTimeout(() => {
        shortcuts.style.display = 'none';
    }, 5000);
});