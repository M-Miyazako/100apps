class Stopwatch {
    constructor() {
        this.time = 0;
        this.interval = null;
        this.isRunning = false;
        this.lapCount = 0;
        
        this.initializeElements();
        this.setupEventListeners();
    }
    
    initializeElements() {
        this.timeDisplay = document.getElementById('timeDisplay');
        this.milliseconds = document.getElementById('milliseconds');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.lapBtn = document.getElementById('lapBtn');
        this.lapList = document.getElementById('lapList');
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.lapBtn.addEventListener('click', () => this.lap());
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.interval = setInterval(() => {
                this.time += 10;
                this.updateDisplay();
            }, 10);
            
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.lapBtn.disabled = false;
            this.startBtn.textContent = '実行中';
        }
    }
    
    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.interval);
            
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
            this.lapBtn.disabled = true;
            this.startBtn.textContent = '開始';
        }
    }
    
    reset() {
        this.stop();
        this.time = 0;
        this.lapCount = 0;
        this.updateDisplay();
        this.clearLaps();
        
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.lapBtn.disabled = true;
        this.startBtn.textContent = '開始';
    }
    
    lap() {
        if (this.isRunning) {
            this.lapCount++;
            const lapTime = this.formatTime(this.time);
            this.addLapToList(this.lapCount, lapTime);
        }
    }
    
    updateDisplay() {
        const formattedTime = this.formatTime(this.time);
        const timeparts = formattedTime.split('.');
        this.timeDisplay.textContent = timeparts[0];
        this.milliseconds.textContent = timeparts[1] || '000';
    }
    
    formatTime(time) {
        const totalSeconds = Math.floor(time / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((time % 1000) / 10);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}.${(time % 10).toString()}`;
    }
    
    addLapToList(lapNumber, lapTime) {
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        lapItem.innerHTML = `
            <span class="lap-number">ラップ ${lapNumber}</span>
            <span class="lap-time">${lapTime}</span>
        `;
        this.lapList.insertBefore(lapItem, this.lapList.firstChild);
    }
    
    clearLaps() {
        this.lapList.innerHTML = '';
    }
}

// キーボードショートカット
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (stopwatch.isRunning) {
            stopwatch.stop();
        } else {
            stopwatch.start();
        }
    } else if (e.code === 'KeyR') {
        stopwatch.reset();
    } else if (e.code === 'KeyL') {
        stopwatch.lap();
    }
});

// アプリケーションの初期化
const stopwatch = new Stopwatch();

// ページの可視性が変わったときの処理
document.addEventListener('visibilitychange', () => {
    if (document.hidden && stopwatch.isRunning) {
        // ページが非表示になったときの処理
        console.log('ページが非表示になりました');
    } else if (!document.hidden && stopwatch.isRunning) {
        // ページが表示されたときの処理
        console.log('ページが表示されました');
    }
});