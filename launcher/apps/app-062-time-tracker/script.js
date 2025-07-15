class TimeTracker {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('timeTracker_tasks')) || [];
        this.timeEntries = JSON.parse(localStorage.getItem('timeTracker_entries')) || [];
        this.currentTask = null;
        this.isRunning = false;
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.selectedColor = '#667eea';
        this.currentFilter = 'all';

        this.initializeEventListeners();
        this.renderTasks();
        this.updateStats();
        this.updateTimerDisplay();
    }

    initializeEventListeners() {
        // Timer controls
        document.getElementById('startBtn').addEventListener('click', () => this.startTimer());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseTimer());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopTimer());

        // Task form
        document.getElementById('taskForm').addEventListener('submit', (e) => this.addTask(e));

        // Color selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectColor(e.target.dataset.color));
        });

        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Export buttons
        document.getElementById('exportCSV').addEventListener('click', () => this.exportCSV());
        document.getElementById('exportJSON').addEventListener('click', () => this.exportJSON());

        // Auto-save before page unload
        window.addEventListener('beforeunload', () => this.saveData());
    }

    addTask(e) {
        e.preventDefault();

        const task = {
            id: Date.now(),
            name: document.getElementById('taskName').value,
            project: document.getElementById('projectName').value || '個人',
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            color: this.selectedColor,
            created: new Date().toISOString(),
            totalTime: 0
        };

        this.tasks.unshift(task);
        this.saveData();
        this.renderTasks();
        this.updateStats();
        
        // Reset form
        document.getElementById('taskForm').reset();
        this.selectColor('#667eea');

        this.showNotification('タスクが正常に追加されました！');
    }

    selectTask(taskId) {
        this.currentTask = this.tasks.find(task => task.id === taskId);
        document.getElementById('currentTaskName').textContent = this.currentTask ? this.currentTask.name : 'タスクが選択されていません';
        this.renderTasks();
    }

    startTimer() {
        if (!this.currentTask) {
            alert('最初にタスクを選択してください');
            return;
        }

        this.isRunning = true;
        this.startTime = Date.now() - this.elapsedTime;
        
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.updateTimerDisplay();
        }, 1000);

        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('timerStatus').textContent = '実行中...';
    }

    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.timerInterval);

        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('timerStatus').textContent = '一時停止中';
    }

    stopTimer() {
        if (this.currentTask && this.elapsedTime > 0) {
            // Save time entry
            const entry = {
                id: Date.now(),
                taskId: this.currentTask.id,
                taskName: this.currentTask.name,
                project: this.currentTask.project,
                startTime: new Date(this.startTime).toISOString(),
                endTime: new Date().toISOString(),
                duration: this.elapsedTime,
                date: new Date().toISOString().split('T')[0]
            };

            this.timeEntries.push(entry);
            this.currentTask.totalTime += this.elapsedTime;
        }

        this.isRunning = false;
        this.elapsedTime = 0;
        clearInterval(this.timerInterval);

        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('timerStatus').textContent = '開始する準備ができています';

        this.updateTimerDisplay();
        this.saveData();
        this.renderTasks();
        this.updateStats();

        if (this.currentTask) {
            this.showNotification(`「${this.currentTask.name}」の時間を記録しました`);
        }
    }

    deleteTask(taskId) {
        if (confirm('このタスクを削除してもよろしいですか？')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.timeEntries = this.timeEntries.filter(entry => entry.taskId !== taskId);
            
            if (this.currentTask && this.currentTask.id === taskId) {
                this.stopTimer();
                this.currentTask = null;
                document.getElementById('currentTaskName').textContent = 'タスクが選択されていません';
            }

            this.saveData();
            this.renderTasks();
            this.updateStats();
            this.showNotification('タスクが削除されました');
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const newName = prompt('タスク名を編集:', task.name);
        if (newName && newName !== task.name) {
            task.name = newName;
            this.saveData();
            this.renderTasks();
            
            if (this.currentTask && this.currentTask.id === taskId) {
                document.getElementById('currentTaskName').textContent = newName;
            }
        }
    }

    selectColor(color) {
        this.selectedColor = color;
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.color === color);
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.renderTasks();
    }

    getFilteredTasks() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        weekStart.setHours(0, 0, 0, 0);

        return this.tasks.filter(task => {
            switch (this.currentFilter) {
                case 'today':
                    return this.timeEntries.some(entry => 
                        entry.taskId === task.id && entry.date === today
                    );
                case 'week':
                    return this.timeEntries.some(entry => 
                        entry.taskId === task.id && new Date(entry.startTime) >= weekStart
                    );
                case 'high':
                    return task.priority === 'high';
                default:
                    return true;
            }
        });
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h4>タスクが見つかりません</h4>
                    <p>現在のフィルターに一致するタスクがありません</p>
                </div>
            `;
            return;
        }

        tasksList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${this.currentTask && this.currentTask.id === task.id ? 'active' : ''}">
                <div class="task-header">
                    <div class="task-name">${task.name}</div>
                    <div class="task-time">${this.formatTime(task.totalTime)}</div>
                </div>
                <div class="task-details">
                    <div>
                        <span class="task-project" style="background: ${task.color}">${task.project}</span>
                        <span style="margin-left: 10px; font-size: 12px;">優先度: ${task.priority}</span>
                    </div>
                    <div class="task-actions">
                        <button class="action-btn start-btn" onclick="timeTracker.selectTask(${task.id})">選択</button>
                        <button class="action-btn edit-btn" onclick="timeTracker.editTask(${task.id})">編集</button>
                        <button class="action-btn delete-btn" onclick="timeTracker.deleteTask(${task.id})">削除</button>
                    </div>
                </div>
                ${task.description ? `<div style="margin-top: 10px; font-size: 14px; color: #666;">${task.description}</div>` : ''}
            </div>
        `).join('');
    }

    updateTimerDisplay() {
        const display = document.getElementById('timerDisplay');
        display.textContent = this.formatTime(this.elapsedTime);
    }

    updateStats() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        weekStart.setHours(0, 0, 0, 0);

        // Today's total
        const todayEntries = this.timeEntries.filter(entry => entry.date === today);
        const todayTime = todayEntries.reduce((sum, entry) => sum + entry.duration, 0);

        // Week's total
        const weekEntries = this.timeEntries.filter(entry => new Date(entry.startTime) >= weekStart);
        const weekTime = weekEntries.reduce((sum, entry) => sum + entry.duration, 0);

        // Active tasks (tasks with time logged in the last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activeTasks = new Set(this.timeEntries
            .filter(entry => new Date(entry.startTime) >= sevenDaysAgo)
            .map(entry => entry.taskId)
        ).size;

        // Total projects
        const totalProjects = new Set(this.tasks.map(task => task.project)).size;

        document.getElementById('todayTime').textContent = this.formatTime(todayTime);
        document.getElementById('weekTime').textContent = this.formatTime(weekTime);
        document.getElementById('activeTasks').textContent = activeTasks;
        document.getElementById('totalProjects').textContent = totalProjects;
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }

    exportCSV() {
        const csvContent = [
            ['タスク名', 'プロジェクト', '開始時間', '終了時間', '継続時間（分）', '日付'],
            ...this.timeEntries.map(entry => [
                entry.taskName,
                entry.project,
                new Date(entry.startTime).toLocaleString(),
                new Date(entry.endTime).toLocaleString(),
                Math.round(entry.duration / 60000),
                entry.date
            ])
        ].map(row => row.join(',')).join('\n');

        this.downloadFile(csvContent, 'time_tracker_export.csv', 'text/csv');
    }

    exportJSON() {
        const data = {
            tasks: this.tasks,
            timeEntries: this.timeEntries,
            exportDate: new Date().toISOString()
        };

        this.downloadFile(JSON.stringify(data, null, 2), 'time_tracker_export.json', 'application/json');
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('エクスポートが完了しました！');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    saveData() {
        localStorage.setItem('timeTracker_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('timeTracker_entries', JSON.stringify(this.timeEntries));
    }
}

// Initialize the time tracker
const timeTracker = new TimeTracker();