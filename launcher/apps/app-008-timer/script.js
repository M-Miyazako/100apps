class Timer {
    constructor() {
        this.timeLeft = 0;
        this.totalTime = 0;
        this.intervalId = null;
        this.isRunning = false;
        this.isPaused = false;
        
        this.initializeElements();
        this.setupEventListeners();
    }
    
    initializeElements() {
        this.timeDisplay = document.getElementById('timeDisplay');
        this.hoursInput = document.getElementById('hours');
        this.minutesInput = document.getElementById('minutes');
        this.secondsInput = document.getElementById('seconds');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.progressFill = document.getElementById('progressFill');
        this.presetButtons = document.querySelectorAll('.preset-btn');
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        this.presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const time = parseInt(btn.dataset.time);
                this.setPresetTime(time);
            });
        });
        
        // 入力値の変更をリアルタイムで表示に反映
        [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('input', () => {
                if (!this.isRunning) {
                    this.updateDisplayFromInputs();
                }
            });
        });
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.isRunning) {
                    this.pause();
                } else {
                    this.start();
                }
            } else if (e.code === 'KeyR') {
                this.reset();
            }
        });
    }
    
    start() {
        if (!this.isRunning) {
            if (!this.isPaused) {
                // 新しいタイマーを開始
                this.timeLeft = this.getTimeFromInputs();
                this.totalTime = this.timeLeft;
            }
            
            if (this.timeLeft > 0) {
                this.isRunning = true;
                this.isPaused = false;
                
                this.intervalId = setInterval(() => {
                    this.timeLeft--;
                    this.updateDisplay();
                    this.updateProgress();
                    
                    if (this.timeLeft <= 0) {
                        this.finish();
                    }
                }, 1000);
                
                this.updateButtons();
            } else {
                alert('時間を設定してください');
            }
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            clearInterval(this.intervalId);
            this.updateButtons();
        }
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.timeLeft = 0;
        this.totalTime = 0;
        
        clearInterval(this.intervalId);
        this.updateDisplayFromInputs();
        this.updateProgress();
        this.updateButtons();
    }
    
    finish() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.intervalId);
        
        // 完了の通知
        this.showNotification();
        this.playSound();
        
        this.updateButtons();
    }
    
    getTimeFromInputs() {
        const hours = parseInt(this.hoursInput.value) || 0;
        const minutes = parseInt(this.minutesInput.value) || 0;
        const seconds = parseInt(this.secondsInput.value) || 0;
        
        return hours * 3600 + minutes * 60 + seconds;
    }
    
    updateDisplayFromInputs() {
        const totalSeconds = this.getTimeFromInputs();
        this.formatAndDisplayTime(totalSeconds);
    }
    
    updateDisplay() {
        this.formatAndDisplayTime(this.timeLeft);
    }
    
    formatAndDisplayTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        this.timeDisplay.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateProgress() {
        if (this.totalTime > 0) {
            const progress = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
            this.progressFill.style.width = `${progress}%`;
        } else {
            this.progressFill.style.width = '0%';
        }
    }
    
    updateButtons() {
        this.startBtn.disabled = this.isRunning;
        this.pauseBtn.disabled = !this.isRunning;
        
        if (this.isRunning) {
            this.startBtn.textContent = '実行中';
        } else if (this.isPaused) {
            this.startBtn.textContent = '再開';
        } else {
            this.startBtn.textContent = '開始';
        }
    }
    
    setPresetTime(seconds) {
        if (!this.isRunning) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;
            
            this.hoursInput.value = hours;
            this.minutesInput.value = minutes;
            this.secondsInput.value = remainingSeconds;
            
            this.updateDisplayFromInputs();
        }
    }
    
    showNotification() {
        // ブラウザ通知
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('タイマー完了', {
                    body: '設定した時間が経過しました！',
                    icon: '⏰'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('タイマー完了', {
                            body: '設定した時間が経過しました！',
                            icon: '⏰'
                        });
                    }
                });
            }
        }
        
        // 視覚的な通知
        this.timeDisplay.style.animation = 'blink 1s linear infinite';
        setTimeout(() => {
            this.timeDisplay.style.animation = '';
        }, 5000);
        
        // アラートも表示
        setTimeout(() => {
            alert('⏰ タイマー完了！\n設定した時間が経過しました。');
        }, 100);
    }
    
    playSound() {
        // Web Audio APIを使用して音を生成
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
            
            // 2回目のビープ音
            setTimeout(() => {
                const oscillator2 = audioContext.createOscillator();
                const gainNode2 = audioContext.createGain();
                
                oscillator2.connect(gainNode2);
                gainNode2.connect(audioContext.destination);
                
                oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
                gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
                
                oscillator2.start();
                oscillator2.stop(audioContext.currentTime + 0.5);
            }, 600);
        } catch (error) {
            console.log('音の再生に失敗しました:', error);
        }
    }
}

// CSSアニメーション
const style = document.createElement('style');
style.textContent = `
    @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
    }
`;
document.head.appendChild(style);

// アプリケーションの初期化
const timer = new Timer();

// 初期表示の更新
timer.updateDisplayFromInputs();

// ページが非表示になったときの処理
document.addEventListener('visibilitychange', () => {
    if (document.hidden && timer.isRunning) {
        console.log('ページが非表示になりました - タイマーは継続中');
    } else if (!document.hidden && timer.isRunning) {
        console.log('ページが表示されました - タイマー継続中');
    }
});

// 通知の許可をリクエスト
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}