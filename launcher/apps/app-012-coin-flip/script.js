class CoinFlipGame {
    constructor() {
        this.coin = document.getElementById('coin');
        this.flipBtn = document.getElementById('flipBtn');
        this.result = document.getElementById('result');
        this.streak = document.getElementById('streak');
        this.totalFlips = document.getElementById('totalFlips');
        this.headsCount = document.getElementById('headsCount');
        this.tailsCount = document.getElementById('tailsCount');
        this.headsPercentage = document.getElementById('headsPercentage');
        this.tailsPercentage = document.getElementById('tailsPercentage');
        this.bestStreak = document.getElementById('bestStreak');
        this.historyContainer = document.getElementById('historyContainer');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.coinType = document.getElementById('coinType');
        this.soundToggle = document.getElementById('soundToggle');

        this.stats = {
            totalFlips: 0,
            headsCount: 0,
            tailsCount: 0,
            currentStreak: 0,
            bestStreak: 0,
            lastResult: null,
            streakType: null
        };

        this.history = [];
        this.isFlipping = false;
        this.soundEnabled = true;

        this.initializeGame();
        this.loadGameData();
        this.setupEventListeners();
    }

    initializeGame() {
        this.updateDisplay();
        this.updateHistoryDisplay();
        this.coin.classList.add('classic');
    }

    setupEventListeners() {
        this.flipBtn.addEventListener('click', () => this.flipCoin());
        this.coin.addEventListener('click', () => this.flipCoin());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.coinType.addEventListener('change', () => this.changeCoinType());
        this.soundToggle.addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === 'Enter') {
                e.preventDefault();
                this.flipCoin();
            }
        });
    }

    async flipCoin() {
        if (this.isFlipping) return;

        this.isFlipping = true;
        this.flipBtn.disabled = true;
        this.flipBtn.textContent = 'Flipping...';

        // Play flip sound
        this.playSound('flip');

        // Add flipping animation
        this.coin.classList.add('flipping');
        
        // Simulate flip duration
        await this.sleep(2000);

        // Determine result
        const isHeads = Math.random() < 0.5;
        const result = isHeads ? 'heads' : 'tails';

        // Update coin display
        this.coin.classList.remove('flipping');
        this.coin.classList.remove('heads-result', 'tails-result');
        this.coin.classList.add(`${result}-result`);

        // Update statistics
        this.updateStats(result);

        // Add to history
        this.addToHistory(result);

        // Display result
        this.displayResult(result);

        // Play result sound
        this.playSound('result');

        // Reset button
        this.flipBtn.disabled = false;
        this.flipBtn.textContent = 'Flip Coin';
        this.isFlipping = false;

        // Save game data
        this.saveGameData();
    }

    updateStats(result) {
        this.stats.totalFlips++;
        
        if (result === 'heads') {
            this.stats.headsCount++;
        } else {
            this.stats.tailsCount++;
        }

        // Update streak
        if (this.stats.lastResult === result) {
            this.stats.currentStreak++;
        } else {
            this.stats.currentStreak = 1;
            this.stats.streakType = result;
        }

        // Update best streak
        if (this.stats.currentStreak > this.stats.bestStreak) {
            this.stats.bestStreak = this.stats.currentStreak;
        }

        this.stats.lastResult = result;
        this.updateDisplay();
    }

    updateDisplay() {
        this.totalFlips.textContent = this.stats.totalFlips;
        this.headsCount.textContent = this.stats.headsCount;
        this.tailsCount.textContent = this.stats.tailsCount;
        this.bestStreak.textContent = this.stats.bestStreak;

        // Calculate percentages
        if (this.stats.totalFlips > 0) {
            const headsPerc = Math.round((this.stats.headsCount / this.stats.totalFlips) * 100);
            const tailsPerc = Math.round((this.stats.tailsCount / this.stats.totalFlips) * 100);
            this.headsPercentage.textContent = `${headsPerc}%`;
            this.tailsPercentage.textContent = `${tailsPerc}%`;
        } else {
            this.headsPercentage.textContent = '0%';
            this.tailsPercentage.textContent = '0%';
        }

        // Update streak display
        const streakText = this.stats.currentStreak > 0 
            ? `Current Streak: ${this.stats.currentStreak} ${this.stats.streakType?.toUpperCase()}`
            : 'Current Streak: 0';
        this.streak.textContent = streakText;

        // Highlight streak if it's significant
        if (this.stats.currentStreak >= 3) {
            this.streak.classList.add('highlight');
            setTimeout(() => this.streak.classList.remove('highlight'), 1000);
        }
    }

    displayResult(result) {
        const resultText = result === 'heads' ? 'HEADS!' : 'TAILS!';
        this.result.textContent = resultText;
        this.result.classList.add('success');
        
        setTimeout(() => {
            this.result.classList.remove('success');
        }, 600);
    }

    addToHistory(result) {
        const timestamp = new Date().toLocaleTimeString();
        const historyItem = {
            result,
            timestamp,
            flipNumber: this.stats.totalFlips
        };

        this.history.unshift(historyItem);
        
        // Keep only last 50 flips
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        if (this.history.length === 0) {
            this.historyContainer.innerHTML = '<p class="no-history">No flips yet!</p>';
            return;
        }

        const historyHTML = this.history
            .slice(0, 10) // Show only last 10 flips
            .map(item => `
                <div class="history-item">
                    <span class="history-result">#${item.flipNumber}: ${item.result.toUpperCase()}</span>
                    <span class="history-time">${item.timestamp}</span>
                </div>
            `).join('');

        this.historyContainer.innerHTML = historyHTML;
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all history and statistics?')) {
            this.history = [];
            this.stats = {
                totalFlips: 0,
                headsCount: 0,
                tailsCount: 0,
                currentStreak: 0,
                bestStreak: 0,
                lastResult: null,
                streakType: null
            };
            
            this.updateDisplay();
            this.updateHistoryDisplay();
            this.result.textContent = 'Ready to flip!';
            this.coin.classList.remove('heads-result', 'tails-result');
            this.saveGameData();
        }
    }

    changeCoinType() {
        const selectedType = this.coinType.value;
        this.coin.className = `coin ${selectedType}`;
        
        // Maintain current result state
        if (this.stats.lastResult) {
            this.coin.classList.add(`${this.stats.lastResult}-result`);
        }
    }

    playSound(type) {
        if (!this.soundEnabled) return;

        // Create audio context for web audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        if (type === 'flip') {
            // Create a whoosh sound for flipping
            this.createFlipSound(audioContext);
        } else if (type === 'result') {
            // Create a ding sound for result
            this.createResultSound(audioContext);
        }
    }

    createFlipSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    createResultSound(audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    saveGameData() {
        const gameData = {
            stats: this.stats,
            history: this.history,
            coinType: this.coinType.value,
            soundEnabled: this.soundEnabled
        };
        
        localStorage.setItem('coinFlipGame', JSON.stringify(gameData));
    }

    loadGameData() {
        const saved = localStorage.getItem('coinFlipGame');
        if (saved) {
            try {
                const gameData = JSON.parse(saved);
                
                if (gameData.stats) {
                    this.stats = { ...this.stats, ...gameData.stats };
                }
                
                if (gameData.history) {
                    this.history = gameData.history;
                }
                
                if (gameData.coinType) {
                    this.coinType.value = gameData.coinType;
                    this.changeCoinType();
                }
                
                if (gameData.soundEnabled !== undefined) {
                    this.soundEnabled = gameData.soundEnabled;
                    this.soundToggle.checked = this.soundEnabled;
                }
                
                this.updateDisplay();
                this.updateHistoryDisplay();
                
                // Set initial result display
                if (this.stats.lastResult) {
                    this.coin.classList.add(`${this.stats.lastResult}-result`);
                    this.result.textContent = `Last result: ${this.stats.lastResult.toUpperCase()}`;
                }
                
            } catch (error) {
                console.error('Error loading game data:', error);
            }
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CoinFlipGame();
});

// Add some keyboard shortcuts info
document.addEventListener('keydown', (e) => {
    if (e.key === '?' || e.key === 'h') {
        alert('Keyboard shortcuts:\n• Space or Enter: Flip coin\n• ?: Show this help');
    }
});

// Add visual feedback for successful flips
document.addEventListener('animationend', (e) => {
    if (e.animationName === 'flip') {
        e.target.style.transform = '';
    }
});

// Prevent right-click context menu on coin for better UX
document.getElementById('coin').addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Add touch support for mobile devices
let touchStartTime = 0;
document.getElementById('coin').addEventListener('touchstart', (e) => {
    touchStartTime = Date.now();
});

document.getElementById('coin').addEventListener('touchend', (e) => {
    const touchDuration = Date.now() - touchStartTime;
    if (touchDuration < 500) { // Quick tap
        e.preventDefault();
        if (window.coinFlipGame && !window.coinFlipGame.isFlipping) {
            window.coinFlipGame.flipCoin();
        }
    }
});

// Make game instance globally available for debugging
window.coinFlipGame = null;
document.addEventListener('DOMContentLoaded', () => {
    window.coinFlipGame = new CoinFlipGame();
});