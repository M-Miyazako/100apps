class WordGame {
    constructor() {
        this.words = [
            { word: 'JAVASCRIPT', hint: 'プログラミング言語' },
            { word: 'COMPUTER', hint: 'コンピューター' },
            { word: 'INTERNET', hint: 'インターネット' },
            { word: 'KEYBOARD', hint: 'キーボード' },
            { word: 'MONITOR', hint: 'モニター' },
            { word: 'WEBSITE', hint: 'ウェブサイト' },
            { word: 'BROWSER', hint: 'ブラウザ' },
            { word: 'MOBILE', hint: 'モバイル' },
            { word: 'TABLET', hint: 'タブレット' },
            { word: 'NETWORK', hint: 'ネットワーク' },
            { word: 'PROGRAMMING', hint: 'プログラミング' },
            { word: 'ALGORITHM', hint: 'アルゴリズム' },
            { word: 'DATABASE', hint: 'データベース' },
            { word: 'SECURITY', hint: 'セキュリティ' },
            { word: 'TECHNOLOGY', hint: 'テクノロジー' },
            { word: 'ARTIFICIAL', hint: '人工的な' },
            { word: 'INTELLIGENCE', hint: '知能' },
            { word: 'MACHINE', hint: 'マシン' },
            { word: 'LEARNING', hint: '学習' },
            { word: 'QUANTUM', hint: '量子' },
            { word: 'SCIENCE', hint: '科学' },
            { word: 'PHYSICS', hint: '物理学' },
            { word: 'CHEMISTRY', hint: '化学' },
            { word: 'BIOLOGY', hint: '生物学' },
            { word: 'MATHEMATICS', hint: '数学' },
            { word: 'LANGUAGE', hint: '言語' },
            { word: 'ENGLISH', hint: '英語' },
            { word: 'JAPANESE', hint: '日本語' },
            { word: 'CULTURE', hint: '文化' },
            { word: 'HISTORY', hint: '歴史' },
            { word: 'GEOGRAPHY', hint: '地理' },
            { word: 'ECONOMY', hint: '経済' },
            { word: 'BUSINESS', hint: 'ビジネス' },
            { word: 'MARKETING', hint: 'マーケティング' },
            { word: 'FINANCE', hint: '金融' },
            { word: 'INVESTMENT', hint: '投資' },
            { word: 'MANAGEMENT', hint: '管理' },
            { word: 'LEADERSHIP', hint: 'リーダーシップ' },
            { word: 'STRATEGY', hint: '戦略' },
            { word: 'PLANNING', hint: '計画' },
            { word: 'CREATIVE', hint: '創造的' },
            { word: 'DESIGN', hint: 'デザイン' },
            { word: 'ARTISTIC', hint: '芸術的' },
            { word: 'BEAUTIFUL', hint: '美しい' },
            { word: 'NATURE', hint: '自然' },
            { word: 'ENVIRONMENT', hint: '環境' },
            { word: 'CLIMATE', hint: '気候' },
            { word: 'WEATHER', hint: '天気' },
            { word: 'SEASON', hint: '季節' },
            { word: 'TEMPERATURE', hint: '温度' }
        ];
        
        this.currentWord = null;
        this.scrambledWord = '';
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        this.wordsSolved = 0;
        this.isGameActive = false;
        this.timer = null;
        this.hintsUsed = 0;
        this.solvedWords = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.startNewGame();
    }
    
    initializeElements() {
        this.scrambledWordEl = document.getElementById('scrambled-word');
        this.hintEl = document.getElementById('hint');
        this.guessInput = document.getElementById('guess-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.scoreEl = document.getElementById('score');
        this.levelEl = document.getElementById('level');
        this.timerEl = document.getElementById('timer');
        this.feedbackEl = document.getElementById('feedback');
        this.gameOverEl = document.getElementById('game-over');
        this.finalScoreEl = document.getElementById('final-score');
        this.wordsSolvedEl = document.getElementById('words-solved');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.progressFill = document.getElementById('progress-fill');
        this.solvedWordsEl = document.getElementById('solved-words');
    }
    
    setupEventListeners() {
        this.submitBtn.addEventListener('click', () => this.submitGuess());
        this.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitGuess();
        });
        
        this.skipBtn.addEventListener('click', () => this.skipWord());
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.shuffleBtn.addEventListener('click', () => this.shuffleWord());
        this.playAgainBtn.addEventListener('click', () => this.startNewGame());
        
        this.guessInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }
    
    startNewGame() {
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        this.wordsSolved = 0;
        this.isGameActive = true;
        this.hintsUsed = 0;
        this.solvedWords = [];
        
        this.updateDisplay();
        this.gameOverEl.style.display = 'none';
        this.loadNextWord();
        this.startTimer();
    }
    
    loadNextWord() {
        if (!this.isGameActive) return;
        
        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        this.scrambledWord = this.scrambleWord(this.currentWord.word);
        this.scrambledWordEl.textContent = this.scrambledWord;
        this.hintEl.textContent = '';
        this.guessInput.value = '';
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'feedback';
        this.hintBtn.disabled = false;
        
        // Focus on input
        this.guessInput.focus();
    }
    
    scrambleWord(word) {
        const letters = word.split('');
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        return letters.join('');
    }
    
    submitGuess() {
        if (!this.isGameActive) return;
        
        const guess = this.guessInput.value.trim().toUpperCase();
        if (!guess) return;
        
        if (guess === this.currentWord.word) {
            this.correctGuess();
        } else {
            this.incorrectGuess();
        }
    }
    
    correctGuess() {
        this.wordsSolved++;
        this.score += this.calculateScore();
        this.solvedWords.push(this.currentWord.word);
        this.updateSolvedWords();
        
        this.showFeedback('Correct!', 'correct');
        
        // Level up every 5 words
        if (this.wordsSolved % 5 === 0) {
            this.level++;
            this.timeLeft += 20; // Bonus time for level up
        }
        
        this.updateDisplay();
        
        setTimeout(() => {
            this.loadNextWord();
        }, 1000);
    }
    
    incorrectGuess() {
        this.showFeedback('Try again!', 'incorrect');
        this.guessInput.value = '';
        this.guessInput.focus();
    }
    
    calculateScore() {
        let baseScore = this.currentWord.word.length * 10;
        let levelBonus = this.level * 5;
        let timeBonus = Math.floor(this.timeLeft / 10) * 2;
        let hintPenalty = this.hintsUsed * 5;
        
        return Math.max(baseScore + levelBonus + timeBonus - hintPenalty, 10);
    }
    
    skipWord() {
        if (!this.isGameActive) return;
        
        this.showFeedback(`Skipped: ${this.currentWord.word}`, 'incorrect');
        setTimeout(() => {
            this.loadNextWord();
        }, 1000);
    }
    
    showHint() {
        if (!this.isGameActive) return;
        
        this.hintEl.textContent = this.currentWord.hint;
        this.hintBtn.disabled = true;
        this.hintsUsed++;
    }
    
    shuffleWord() {
        if (!this.isGameActive) return;
        
        this.scrambledWord = this.scrambleWord(this.currentWord.word);
        this.scrambledWordEl.textContent = this.scrambledWord;
        this.scrambledWordEl.classList.add('shuffle');
        
        setTimeout(() => {
            this.scrambledWordEl.classList.remove('shuffle');
        }, 500);
    }
    
    showFeedback(message, type) {
        this.feedbackEl.textContent = message;
        this.feedbackEl.className = `feedback ${type} animate`;
        
        setTimeout(() => {
            this.feedbackEl.classList.remove('animate');
        }, 500);
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        this.timerEl.textContent = this.timeLeft;
        
        // Update progress bar
        const progress = (this.timeLeft / 60) * 100;
        this.progressFill.style.width = `${progress}%`;
        
        // Warning animation when time is low
        if (this.timeLeft <= 10) {
            this.timerEl.classList.add('timer-warning');
        } else {
            this.timerEl.classList.remove('timer-warning');
        }
    }
    
    updateDisplay() {
        this.scoreEl.textContent = this.score;
        this.levelEl.textContent = this.level;
        this.timerEl.textContent = this.timeLeft;
    }
    
    updateSolvedWords() {
        this.solvedWordsEl.innerHTML = '';
        this.solvedWords.slice(-10).forEach(word => {
            const wordEl = document.createElement('div');
            wordEl.className = 'solved-word';
            wordEl.textContent = word;
            this.solvedWordsEl.appendChild(wordEl);
        });
    }
    
    endGame() {
        this.isGameActive = false;
        clearInterval(this.timer);
        
        this.finalScoreEl.textContent = this.score;
        this.wordsSolvedEl.textContent = this.wordsSolved;
        this.gameOverEl.style.display = 'block';
        
        // Scroll to game over section
        this.gameOverEl.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WordGame();
});