class ColorGame {
    constructor() {
        this.colors = {
            easy: [
                { name: '赤', color: '#FF0000' },
                { name: '青', color: '#0000FF' },
                { name: '緑', color: '#00FF00' },
                { name: '黄', color: '#FFFF00' }
            ],
            medium: [
                { name: '赤', color: '#FF0000' },
                { name: '青', color: '#0000FF' },
                { name: '緑', color: '#00FF00' },
                { name: '黄', color: '#FFFF00' },
                { name: '紫', color: '#800080' },
                { name: 'オレンジ', color: '#FFA500' }
            ],
            hard: [
                { name: '赤', color: '#FF0000' },
                { name: '青', color: '#0000FF' },
                { name: '緑', color: '#00FF00' },
                { name: '黄', color: '#FFFF00' },
                { name: '紫', color: '#800080' },
                { name: 'オレンジ', color: '#FFA500' },
                { name: 'ピンク', color: '#FF69B4' },
                { name: 'シアン', color: '#00FFFF' }
            ]
        };
        
        this.currentColor = null;
        this.options = [];
        this.score = 0;
        this.level = 1;
        this.timeLeft = 30;
        this.gameActive = false;
        this.timer = null;
        this.difficulty = 'easy';
        
        this.initializeElements();
        this.bindEvents();
        this.loadHighscores();
        this.displayHighscores();
    }
    
    initializeElements() {
        this.elements = {
            colorCircle: document.getElementById('colorCircle'),
            colorName: document.getElementById('colorName'),
            optionsContainer: document.getElementById('optionsContainer'),
            startBtn: document.getElementById('startBtn'),
            resetBtn: document.getElementById('resetBtn'),
            score: document.getElementById('score'),
            level: document.getElementById('level'),
            time: document.getElementById('time'),
            resultMessage: document.getElementById('resultMessage'),
            highscoreList: document.getElementById('highscoreList'),
            difficultyRadios: document.querySelectorAll('input[name="difficulty"]')
        };
    }
    
    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());
        
        this.elements.difficultyRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.difficulty = e.target.value;
            });
        });
    }
    
    startGame() {
        this.gameActive = true;
        this.score = 0;
        this.level = 1;
        this.timeLeft = 30;
        this.elements.startBtn.disabled = true;
        this.elements.startBtn.textContent = 'ゲーム中...';
        
        this.updateDisplay();
        this.generateQuestion();
        this.startTimer();
    }
    
    resetGame() {
        this.gameActive = false;
        this.score = 0;
        this.level = 1;
        this.timeLeft = 30;
        
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.elements.startBtn.disabled = false;
        this.elements.startBtn.textContent = 'ゲーム開始';
        this.elements.resultMessage.textContent = '';
        this.elements.resultMessage.className = 'result-message';
        this.elements.optionsContainer.innerHTML = '';
        this.elements.colorCircle.style.backgroundColor = '#ccc';
        this.elements.colorName.textContent = '色を選択';
        
        this.updateDisplay();
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    generateQuestion() {
        if (!this.gameActive) return;
        
        const colorSet = this.colors[this.difficulty];
        const correctAnswer = colorSet[Math.floor(Math.random() * colorSet.length)];
        
        // 色を表示
        this.elements.colorCircle.style.backgroundColor = correctAnswer.color;
        this.currentColor = correctAnswer;
        
        // 選択肢を生成
        this.options = this.generateOptions(correctAnswer, colorSet);
        this.displayOptions();
        
        this.elements.resultMessage.textContent = '';
        this.elements.resultMessage.className = 'result-message';
    }
    
    generateOptions(correctAnswer, colorSet) {
        const options = [correctAnswer];
        const usedColors = new Set([correctAnswer.name]);
        
        // 選択肢の数を決定
        const optionCount = this.difficulty === 'easy' ? 4 : this.difficulty === 'medium' ? 6 : 8;
        
        while (options.length < Math.min(optionCount, colorSet.length)) {
            const randomColor = colorSet[Math.floor(Math.random() * colorSet.length)];
            if (!usedColors.has(randomColor.name)) {
                options.push(randomColor);
                usedColors.add(randomColor.name);
            }
        }
        
        // シャッフル
        return this.shuffleArray(options);
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    displayOptions() {
        this.elements.optionsContainer.innerHTML = '';
        
        this.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option.name;
            button.addEventListener('click', () => this.checkAnswer(option, button));
            this.elements.optionsContainer.appendChild(button);
        });
    }
    
    checkAnswer(selectedOption, button) {
        if (!this.gameActive) return;
        
        const isCorrect = selectedOption.name === this.currentColor.name;
        
        if (isCorrect) {
            this.score += 10 * this.level;
            this.elements.resultMessage.textContent = '正解！';
            this.elements.resultMessage.className = 'result-message correct';
            button.classList.add('correct');
            
            // レベルアップ
            if (this.score % 100 === 0) {
                this.level++;
                this.timeLeft += 5; // ボーナス時間
            }
            
            setTimeout(() => {
                this.generateQuestion();
            }, 1000);
        } else {
            this.elements.resultMessage.textContent = `不正解... 正解は「${this.currentColor.name}」でした`;
            this.elements.resultMessage.className = 'result-message incorrect';
            button.classList.add('incorrect');
            
            // 正解を表示
            const buttons = this.elements.optionsContainer.querySelectorAll('.option-btn');
            buttons.forEach(btn => {
                if (btn.textContent === this.currentColor.name) {
                    btn.classList.add('correct');
                }
            });
            
            setTimeout(() => {
                this.generateQuestion();
            }, 2000);
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.elements.score.textContent = this.score;
        this.elements.level.textContent = this.level;
        this.elements.time.textContent = this.timeLeft;
    }
    
    endGame() {
        this.gameActive = false;
        clearInterval(this.timer);
        
        this.elements.startBtn.disabled = false;
        this.elements.startBtn.textContent = 'ゲーム開始';
        this.elements.resultMessage.textContent = `ゲーム終了！ スコア: ${this.score}`;
        this.elements.resultMessage.className = 'result-message';
        
        // ハイスコア保存
        this.saveHighscore(this.score);
        this.displayHighscores();
    }
    
    saveHighscore(score) {
        let highscores = JSON.parse(localStorage.getItem('colorGameHighscores') || '[]');
        
        const newScore = {
            score: score,
            difficulty: this.difficulty,
            date: new Date().toLocaleDateString('ja-JP')
        };
        
        highscores.push(newScore);
        highscores.sort((a, b) => b.score - a.score);
        highscores = highscores.slice(0, 10); // 上位10位まで
        
        localStorage.setItem('colorGameHighscores', JSON.stringify(highscores));
    }
    
    loadHighscores() {
        this.highscores = JSON.parse(localStorage.getItem('colorGameHighscores') || '[]');
    }
    
    displayHighscores() {
        this.loadHighscores();
        
        if (this.highscores.length === 0) {
            this.elements.highscoreList.innerHTML = '<p>まだハイスコアがありません</p>';
            return;
        }
        
        this.elements.highscoreList.innerHTML = this.highscores
            .map((score, index) => `
                <div class="highscore-item">
                    <span class="highscore-rank">${index + 1}位</span>
                    <span class="highscore-score">${score.score}点</span>
                    <span class="highscore-difficulty">${this.getDifficultyText(score.difficulty)}</span>
                    <span class="highscore-date">${score.date}</span>
                </div>
            `)
            .join('');
    }
    
    getDifficultyText(difficulty) {
        const difficultyMap = {
            easy: '初級',
            medium: '中級',
            hard: '上級'
        };
        return difficultyMap[difficulty] || '不明';
    }
}

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    new ColorGame();
});