class DiceGame {
    constructor() {
        this.dice = [];
        this.selectedDice = new Set();
        this.currentScore = 0;
        this.bestScore = parseInt(localStorage.getItem('diceGameBestScore') || '0');
        this.rollCount = 0;
        this.gameMode = 'simple';
        this.diceCount = 5;
        this.rollHistory = [];
        this.achievements = this.loadAchievements();
        this.usedScoreOptions = new Set();
        this.gameRound = 1;
        this.maxRounds = 13; // For Yahtzee mode
        this.soundEnabled = true;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.generateDice();
        this.setupScoreOptions();
        this.loadAchievements();
        this.displayAchievements();
    }

    setupEventListeners() {
        // Game controls
        document.getElementById('rollBtn').addEventListener('click', () => this.rollDice());
        document.getElementById('holdBtn').addEventListener('click', () => this.holdSelected());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        
        // Settings
        document.getElementById('gameMode').addEventListener('change', (e) => {
            this.gameMode = e.target.value;
            this.resetGame();
        });
        
        document.getElementById('diceCount').addEventListener('input', (e) => {
            this.diceCount = parseInt(e.target.value);
            document.getElementById('diceCountLabel').textContent = this.diceCount;
            this.generateDice();
        });
        
        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });
    }

    generateDice() {
        const container = document.getElementById('diceContainer');
        container.innerHTML = '';
        this.dice = [];
        this.selectedDice.clear();

        for (let i = 0; i < this.diceCount; i++) {
            const dice = this.createDice(i);
            container.appendChild(dice);
            this.dice.push({
                element: dice,
                value: Math.floor(Math.random() * 6) + 1,
                held: false
            });
        }
        
        this.updateDiceDisplay();
    }

    createDice(index) {
        const dice = document.createElement('div');
        dice.className = 'dice';
        dice.dataset.index = index;
        
        dice.addEventListener('click', () => this.toggleDiceSelection(index));
        
        return dice;
    }

    updateDiceDisplay() {
        this.dice.forEach((die, index) => {
            const diceElement = die.element;
            const value = die.value;
            
            diceElement.innerHTML = this.createDiceFace(value);
            
            if (die.held) {
                diceElement.classList.add('selected');
            } else {
                diceElement.classList.remove('selected');
            }
        });
    }

    createDiceFace(value) {
        const face = document.createElement('div');
        face.className = `dice-face face-${value}`;
        
        for (let i = 0; i < value; i++) {
            const dot = document.createElement('div');
            dot.className = 'dice-dot';
            face.appendChild(dot);
        }
        
        return face.outerHTML;
    }

    toggleDiceSelection(index) {
        if (this.dice[index].held) {
            this.dice[index].held = false;
            this.selectedDice.delete(index);
        } else {
            this.dice[index].held = true;
            this.selectedDice.add(index);
        }
        
        this.updateDiceDisplay();
        this.updateHoldButton();
    }

    updateHoldButton() {
        const holdBtn = document.getElementById('holdBtn');
        holdBtn.disabled = this.selectedDice.size === 0;
    }

    rollDice() {
        if (this.soundEnabled) {
            this.playRollSound();
        }

        // Animate dice rolling
        this.dice.forEach((die, index) => {
            if (!die.held) {
                die.element.classList.add('rolling');
                die.value = Math.floor(Math.random() * 6) + 1;
            }
        });

        // Remove animation after completion
        setTimeout(() => {
            this.dice.forEach(die => {
                die.element.classList.remove('rolling');
            });
            this.updateDiceDisplay();
            this.processTurn();
        }, 600);

        this.rollCount++;
        this.updateDisplay();
        this.checkAchievements();
    }

    holdSelected() {
        // This functionality is mainly for Yahtzee mode
        this.selectedDice.clear();
        this.updateDiceDisplay();
        this.updateHoldButton();
    }

    processTurn() {
        const combination = this.analyzeCombination();
        this.displayCurrentCombination(combination);
        this.updateScoreOptions(combination);
        this.addToHistory(combination);
        
        if (this.gameMode === 'simple') {
            this.currentScore += combination.score;
            this.updateDisplay();
        }
    }

    analyzeCombination() {
        const values = this.dice.map(die => die.value);
        const counts = this.getCounts(values);
        const sortedCounts = Object.values(counts).sort((a, b) => b - a);
        const sum = values.reduce((acc, val) => acc + val, 0);

        let type = 'High Card';
        let score = sum;
        let multiplier = 1;

        // Check for combinations
        if (sortedCounts[0] === 5) {
            type = 'Yahtzee';
            score = 50;
            multiplier = 2;
        } else if (sortedCounts[0] === 4) {
            type = 'Four of a Kind';
            score = sum + 10;
            multiplier = 1.5;
        } else if (sortedCounts[0] === 3 && sortedCounts[1] === 2) {
            type = 'Full House';
            score = 25;
            multiplier = 1.3;
        } else if (sortedCounts[0] === 3) {
            type = 'Three of a Kind';
            score = sum + 5;
            multiplier = 1.2;
        } else if (sortedCounts[0] === 2 && sortedCounts[1] === 2) {
            type = 'Two Pairs';
            score = sum + 3;
            multiplier = 1.1;
        } else if (sortedCounts[0] === 2) {
            type = 'One Pair';
            score = sum + 1;
        } else if (this.isStraight(values)) {
            if (values.length === 5) {
                type = 'Large Straight';
                score = 40;
                multiplier = 1.4;
            } else {
                type = 'Small Straight';
                score = 30;
                multiplier = 1.2;
            }
        }

        return {
            type,
            score: Math.floor(score * multiplier),
            values: values.slice(),
            counts
        };
    }

    getCounts(values) {
        const counts = {};
        values.forEach(value => {
            counts[value] = (counts[value] || 0) + 1;
        });
        return counts;
    }

    isStraight(values) {
        const unique = [...new Set(values)].sort((a, b) => a - b);
        if (unique.length < 4) return false;
        
        // Check for consecutive numbers
        for (let i = 0; i < unique.length - 3; i++) {
            if (unique[i + 1] === unique[i] + 1 && 
                unique[i + 2] === unique[i] + 2 && 
                unique[i + 3] === unique[i] + 3) {
                return true;
            }
        }
        return false;
    }

    displayCurrentCombination(combination) {
        const element = document.getElementById('currentCombination');
        element.innerHTML = `
            <strong>${combination.type}</strong><br>
            Dice: ${combination.values.join(', ')}<br>
            Score: ${combination.score} points
        `;
        element.classList.add('score-popup');
        setTimeout(() => element.classList.remove('score-popup'), 500);
    }

    setupScoreOptions() {
        const scoreOptions = document.getElementById('scoreOptions');
        
        if (this.gameMode === 'yahtzee') {
            this.createYahtzeeScoreOptions(scoreOptions);
        } else {
            scoreOptions.innerHTML = '<p style="color: white; text-align: center;">Roll dice to see scoring options</p>';
        }
    }

    createYahtzeeScoreOptions(container) {
        const options = [
            { name: 'Ones', key: 'ones' },
            { name: 'Twos', key: 'twos' },
            { name: 'Threes', key: 'threes' },
            { name: 'Fours', key: 'fours' },
            { name: 'Fives', key: 'fives' },
            { name: 'Sixes', key: 'sixes' },
            { name: 'Three of a Kind', key: 'threeOfKind' },
            { name: 'Four of a Kind', key: 'fourOfKind' },
            { name: 'Full House', key: 'fullHouse' },
            { name: 'Small Straight', key: 'smallStraight' },
            { name: 'Large Straight', key: 'largeStraight' },
            { name: 'Yahtzee', key: 'yahtzee' },
            { name: 'Chance', key: 'chance' }
        ];

        container.innerHTML = '';
        options.forEach(option => {
            const div = document.createElement('div');
            div.className = 'score-option';
            div.dataset.key = option.key;
            
            if (this.usedScoreOptions.has(option.key)) {
                div.classList.add('used');
            } else {
                div.addEventListener('click', () => this.selectScoreOption(option.key));
            }
            
            div.innerHTML = `
                <div class="score-option-name">${option.name}</div>
                <div class="score-option-value">-</div>
            `;
            
            container.appendChild(div);
        });
    }

    updateScoreOptions(combination) {
        if (this.gameMode !== 'yahtzee') return;
        
        const options = document.querySelectorAll('.score-option');
        options.forEach(option => {
            const key = option.dataset.key;
            if (!this.usedScoreOptions.has(key)) {
                const score = this.calculateScoreForOption(key, combination);
                option.querySelector('.score-option-value').textContent = score;
            }
        });
    }

    calculateScoreForOption(key, combination) {
        const values = combination.values;
        const counts = combination.counts;
        
        switch (key) {
            case 'ones': return (counts[1] || 0) * 1;
            case 'twos': return (counts[2] || 0) * 2;
            case 'threes': return (counts[3] || 0) * 3;
            case 'fours': return (counts[4] || 0) * 4;
            case 'fives': return (counts[5] || 0) * 5;
            case 'sixes': return (counts[6] || 0) * 6;
            case 'threeOfKind': return Object.values(counts).some(c => c >= 3) ? values.reduce((a, b) => a + b, 0) : 0;
            case 'fourOfKind': return Object.values(counts).some(c => c >= 4) ? values.reduce((a, b) => a + b, 0) : 0;
            case 'fullHouse': return (Object.values(counts).includes(3) && Object.values(counts).includes(2)) ? 25 : 0;
            case 'smallStraight': return this.isStraight(values) ? 30 : 0;
            case 'largeStraight': return this.isStraight(values) && values.length === 5 ? 40 : 0;
            case 'yahtzee': return Object.values(counts).some(c => c === 5) ? 50 : 0;
            case 'chance': return values.reduce((a, b) => a + b, 0);
            default: return 0;
        }
    }

    selectScoreOption(key) {
        const option = document.querySelector(`[data-key="${key}"]`);
        const score = parseInt(option.querySelector('.score-option-value').textContent);
        
        this.currentScore += score;
        this.usedScoreOptions.add(key);
        option.classList.add('used');
        option.removeEventListener('click', () => this.selectScoreOption(key));
        
        this.updateDisplay();
        this.gameRound++;
        
        if (this.gameRound > this.maxRounds) {
            this.endGame();
        } else {
            this.clearDiceHolds();
        }
    }

    clearDiceHolds() {
        this.dice.forEach(die => {
            die.held = false;
        });
        this.selectedDice.clear();
        this.updateDiceDisplay();
        this.updateHoldButton();
    }

    addToHistory(combination) {
        this.rollHistory.unshift({
            roll: this.rollCount,
            dice: combination.values.join(', '),
            combination: combination.type,
            score: combination.score,
            timestamp: new Date().toLocaleTimeString()
        });
        
        // Keep only last 10 rolls
        if (this.rollHistory.length > 10) {
            this.rollHistory.pop();
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyElement = document.getElementById('rollHistory');
        
        if (this.rollHistory.length === 0) {
            historyElement.innerHTML = '<p>No rolls yet</p>';
            return;
        }
        
        historyElement.innerHTML = this.rollHistory.map(entry => `
            <div class="history-item">
                <span class="history-dice">${entry.dice}</span>
                <span class="history-combination">${entry.combination}</span>
                <span class="history-score">${entry.score}</span>
            </div>
        `).join('');
    }

    checkAchievements() {
        const newAchievements = [];
        
        // First Roll
        if (this.rollCount === 1 && !this.achievements.firstRoll) {
            this.achievements.firstRoll = true;
            newAchievements.push('firstRoll');
        }
        
        // Yahtzee
        if (this.rollHistory.length > 0 && this.rollHistory[0].combination === 'Yahtzee' && !this.achievements.yahtzee) {
            this.achievements.yahtzee = true;
            newAchievements.push('yahtzee');
        }
        
        // Hot Streak (5 rolls in a row with score > 20)
        if (this.rollHistory.length >= 5 && !this.achievements.hotStreak) {
            const lastFive = this.rollHistory.slice(0, 5);
            if (lastFive.every(roll => roll.score > 20)) {
                this.achievements.hotStreak = true;
                newAchievements.push('hotStreak');
            }
        }
        
        // Century Club (score > 100)
        if (this.currentScore >= 100 && !this.achievements.centuryClub) {
            this.achievements.centuryClub = true;
            newAchievements.push('centuryClub');
        }
        
        // Save achievements
        localStorage.setItem('diceGameAchievements', JSON.stringify(this.achievements));
        
        // Display new achievements
        newAchievements.forEach(achievement => {
            this.displayAchievementUnlock(achievement);
        });
        
        this.displayAchievements();
    }

    displayAchievementUnlock(achievement) {
        const element = document.getElementById(achievement);
        element.textContent = '🏆';
        element.classList.add('achievement-unlock');
        
        // Show notification
        if (this.soundEnabled) {
            this.playAchievementSound();
        }
    }

    loadAchievements() {
        const saved = localStorage.getItem('diceGameAchievements');
        return saved ? JSON.parse(saved) : {
            firstRoll: false,
            yahtzee: false,
            hotStreak: false,
            centuryClub: false
        };
    }

    displayAchievements() {
        Object.keys(this.achievements).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = this.achievements[key] ? '🏆' : '🔒';
            }
        });
    }

    playRollSound() {
        // Create audio context for dice roll sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    playAchievementSound() {
        // Create audio context for achievement sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G
        oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.3); // C
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    updateDisplay() {
        document.getElementById('currentScore').textContent = this.currentScore;
        document.getElementById('rollCount').textContent = this.rollCount;
        document.getElementById('bestScore').textContent = this.bestScore;
        
        if (this.currentScore > this.bestScore) {
            this.bestScore = this.currentScore;
            localStorage.setItem('diceGameBestScore', this.bestScore.toString());
            document.getElementById('bestScore').textContent = this.bestScore;
        }
    }

    resetGame() {
        this.currentScore = 0;
        this.rollCount = 0;
        this.rollHistory = [];
        this.usedScoreOptions.clear();
        this.gameRound = 1;
        this.selectedDice.clear();
        
        this.generateDice();
        this.updateDisplay();
        this.updateHistoryDisplay();
        this.setupScoreOptions();
        this.updateHoldButton();
        
        // Clear current combination
        document.getElementById('currentCombination').textContent = 'Roll the dice to see combinations';
    }

    endGame() {
        alert(`Game Over!\nFinal Score: ${this.currentScore}\nBest Score: ${this.bestScore}`);
        this.resetGame();
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DiceGame();
});

// Add some utility functions for enhanced gameplay
function getRandomTip() {
    const tips = [
        "Try to go for Yahtzee (all 5 dice the same) for maximum points!",
        "In Yahtzee mode, use the Hold feature to keep dice you want to keep.",
        "Full House and straights are worth good points too!",
        "Don't forget about the upper section bonus in Yahtzee mode!",
        "Sometimes it's better to take a low score than risk getting zero."
    ];
    return tips[Math.floor(Math.random() * tips.length)];
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case ' ':
        case 'Enter':
            e.preventDefault();
            document.getElementById('rollBtn').click();
            break;
        case 'r':
        case 'R':
            document.getElementById('resetBtn').click();
            break;
        case 'h':
        case 'H':
            if (!document.getElementById('holdBtn').disabled) {
                document.getElementById('holdBtn').click();
            }
            break;
    }
});

// Add some visual feedback for better UX
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        if (!btn.disabled) {
            btn.style.transform = 'translateY(-2px)';
        }
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0)';
    });
});