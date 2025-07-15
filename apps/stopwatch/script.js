class Stopwatch {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.intervalId = null;
        this.lapTimes = [];
        this.lapCounter = 0;
        
        this.initializeElements();
        this.bindEvents();
    }
    
    initializeElements() {
        this.timeDisplay = document.getElementById('timeDisplay');
        this.milliseconds = document.getElementById('milliseconds');
        this.startStopBtn = document.getElementById('startStopBtn');
        this.lapBtn = document.getElementById('lapBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.lapList = document.getElementById('lapList');
    }
    
    bindEvents() {
        this.startStopBtn.addEventListener('click', () => this.toggleStopwatch());
        this.lapBtn.addEventListener('click', () => this.recordLap());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Prevent default behavior for our shortcuts
            if (e.code === 'Space' || e.key === 'r' || e.key === 'R' || e.key === 'l' || e.key === 'L') {
                e.preventDefault();
            }
            
            switch(e.code) {
                case 'Space':
                    this.toggleStopwatch();
                    break;
                case 'KeyR':
                    this.reset();
                    break;
                case 'KeyL':
                    if (this.isRunning) {
                        this.recordLap();
                    }
                    break;
            }
        });
    }
    
    toggleStopwatch() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    start() {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.isRunning = true;
            this.intervalId = setInterval(() => this.updateDisplay(), 10);
            
            this.startStopBtn.textContent = 'Stop';
            this.startStopBtn.classList.add('stop');
            this.lapBtn.disabled = false;
            this.resetBtn.disabled = false;
            this.timeDisplay.classList.add('running');
        }
    }
    
    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.intervalId);
            
            this.startStopBtn.textContent = 'Start';
            this.startStopBtn.classList.remove('stop');
            this.lapBtn.disabled = true;
            this.timeDisplay.classList.remove('running');
        }
    }
    
    reset() {
        this.isRunning = false;
        this.elapsedTime = 0;
        this.startTime = 0;
        this.lapTimes = [];
        this.lapCounter = 0;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        this.updateDisplay();
        this.startStopBtn.textContent = 'Start';
        this.startStopBtn.classList.remove('stop');
        this.lapBtn.disabled = true;
        this.resetBtn.disabled = true;
        this.timeDisplay.classList.remove('running');
        this.lapList.innerHTML = '';
    }
    
    recordLap() {
        if (this.isRunning) {
            const currentTime = this.elapsedTime;
            const lapTime = this.lapTimes.length > 0 ? 
                currentTime - this.lapTimes[this.lapTimes.length - 1].totalTime : 
                currentTime;
            
            this.lapCounter++;
            this.lapTimes.push({
                number: this.lapCounter,
                lapTime: lapTime,
                totalTime: currentTime
            });
            
            this.displayLaps();
        }
    }
    
    updateDisplay() {
        if (this.isRunning) {
            this.elapsedTime = Date.now() - this.startTime;
        }
        
        const time = this.formatTime(this.elapsedTime);
        this.timeDisplay.textContent = time.main;
        this.milliseconds.textContent = time.ms;
    }
    
    formatTime(totalMs) {
        const hours = Math.floor(totalMs / 3600000);
        const minutes = Math.floor((totalMs % 3600000) / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        const milliseconds = Math.floor((totalMs % 1000) / 10);
        
        // Format for display (MM:SS or HH:MM:SS if hours > 0)
        let mainDisplay;
        if (hours > 0) {
            mainDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            mainDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        return {
            main: mainDisplay,
            ms: milliseconds.toString().padStart(2, '0')
        };
    }
    
    displayLaps() {
        this.lapList.innerHTML = '';
        
        // Display laps in reverse order (most recent first)
        const reversedLaps = [...this.lapTimes].reverse();
        
        reversedLaps.forEach(lap => {
            const lapElement = document.createElement('div');
            lapElement.className = 'lap-item';
            
            const lapNumber = document.createElement('span');
            lapNumber.className = 'lap-number';
            lapNumber.textContent = `Lap ${lap.number}`;
            
            const lapTime = document.createElement('span');
            lapTime.className = 'lap-time';
            lapTime.textContent = this.formatTime(lap.lapTime).main + ':' + this.formatTime(lap.lapTime).ms;
            
            const totalTime = document.createElement('span');
            totalTime.className = 'lap-split';
            totalTime.textContent = this.formatTime(lap.totalTime).main + ':' + this.formatTime(lap.totalTime).ms;
            
            const timeContainer = document.createElement('div');
            timeContainer.appendChild(lapTime);
            timeContainer.appendChild(document.createElement('br'));
            timeContainer.appendChild(totalTime);
            
            lapElement.appendChild(lapNumber);
            lapElement.appendChild(timeContainer);
            
            this.lapList.appendChild(lapElement);
        });
    }
}

// Initialize the stopwatch when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Stopwatch();
});

// Prevent space bar from scrolling the page
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
    }
});