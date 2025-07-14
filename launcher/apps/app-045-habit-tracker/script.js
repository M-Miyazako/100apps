class HabitTracker {
    constructor() {
        this.habits = JSON.parse(localStorage.getItem('habits') || '[]');
        this.currentDate = new Date();
        this.selectedDate = new Date();
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateStats();
        this.renderHabits();
        this.renderCalendar();
    }
    
    initializeElements() {
        this.habitForm = document.getElementById('habit-form');
        this.habitNameInput = document.getElementById('habit-name');
        this.habitIconSelect = document.getElementById('habit-icon');
        this.habitTargetInput = document.getElementById('habit-target');
        this.habitFrequencySelect = document.getElementById('habit-frequency');
        
        this.totalHabitsEl = document.getElementById('total-habits');
        this.completedTodayEl = document.getElementById('completed-today');
        this.streakCountEl = document.getElementById('streak-count');
        
        this.habitsListEl = document.getElementById('habits-list');
        this.emptyHabitsEl = document.getElementById('empty-habits');
        
        this.calendarGrid = document.getElementById('calendar-grid');
        this.currentMonthEl = document.getElementById('current-month');
        this.prevMonthBtn = document.getElementById('prev-month');
        this.nextMonthBtn = document.getElementById('next-month');
        
        this.progressCharts = document.getElementById('progress-charts');
    }
    
    setupEventListeners() {
        this.habitForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const habit = {
            id: Date.now(),
            name: this.habitNameInput.value.trim(),
            icon: this.habitIconSelect.value,
            target: parseInt(this.habitTargetInput.value),
            frequency: this.habitFrequencySelect.value,
            createdAt: new Date().toISOString(),
            completions: {}
        };
        
        this.habits.push(habit);
        this.saveHabits();
        this.updateStats();
        this.renderHabits();
        this.renderCalendar();
        this.habitForm.reset();
        this.habitTargetInput.value = 1;
    }
    
    deleteHabit(id) {
        if (confirm('この習慣を削除しますか？')) {
            this.habits = this.habits.filter(h => h.id !== id);
            this.saveHabits();
            this.updateStats();
            this.renderHabits();
            this.renderCalendar();
        }
    }
    
    updateHabitCount(id, change) {
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return;
        
        const today = this.formatDate(new Date());
        const currentCount = habit.completions[today] || 0;
        const newCount = Math.max(0, Math.min(habit.target, currentCount + change));
        
        if (newCount === 0) {
            delete habit.completions[today];
        } else {
            habit.completions[today] = newCount;
        }
        
        this.saveHabits();
        this.updateStats();
        this.renderHabits();
        this.renderCalendar();
    }
    
    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }
    
    updateStats() {
        const totalHabits = this.habits.length;
        const today = this.formatDate(new Date());
        const completedToday = this.habits.filter(habit => 
            (habit.completions[today] || 0) >= habit.target
        ).length;
        
        const longestStreak = this.calculateLongestStreak();
        
        this.totalHabitsEl.textContent = totalHabits;
        this.completedTodayEl.textContent = completedToday;
        this.streakCountEl.textContent = longestStreak;
    }
    
    calculateLongestStreak() {
        if (this.habits.length === 0) return 0;
        
        let maxStreak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = this.formatDate(date);
            
            const completedHabits = this.habits.filter(habit => 
                (habit.completions[dateStr] || 0) >= habit.target
            ).length;
            
            if (completedHabits === this.habits.length && this.habits.length > 0) {
                maxStreak = i + 1;
            } else {
                break;
            }
        }
        
        return maxStreak;
    }
    
    renderHabits() {
        if (this.habits.length === 0) {
            this.habitsListEl.style.display = 'none';
            this.emptyHabitsEl.style.display = 'block';
            return;
        }
        
        this.habitsListEl.style.display = 'block';
        this.emptyHabitsEl.style.display = 'none';
        
        this.habitsListEl.innerHTML = '';
        
        this.habits.forEach(habit => {
            const habitItem = this.createHabitItem(habit);
            this.habitsListEl.appendChild(habitItem);
        });
    }
    
    createHabitItem(habit) {
        const today = this.formatDate(new Date());
        const currentCount = habit.completions[today] || 0;
        const progress = (currentCount / habit.target) * 100;
        
        const item = document.createElement('div');
        item.className = 'habit-item';
        
        item.innerHTML = `
            <div class="habit-info">
                <div class="habit-icon">${habit.icon}</div>
                <div class="habit-details">
                    <h3>${habit.name}</h3>
                    <p>${habit.frequency === 'daily' ? '毎日' : '週単位'} • 目標: ${habit.target}回</p>
                </div>
            </div>
            <div class="habit-actions">
                <div class="habit-counter">
                    <button class="counter-btn" onclick="habitTracker.updateHabitCount(${habit.id}, -1)" ${currentCount <= 0 ? 'disabled' : ''}>-</button>
                    <span class="counter-value">${currentCount}</span>
                    <button class="counter-btn" onclick="habitTracker.updateHabitCount(${habit.id}, 1)" ${currentCount >= habit.target ? 'disabled' : ''}>+</button>
                </div>
                <div class="habit-progress">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <button class="delete-btn" onclick="habitTracker.deleteHabit(${habit.id})" title="削除">×</button>
            </div>
        `;
        
        return item;
    }
    
    renderCalendar() {
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth();
        
        this.currentMonthEl.textContent = `${year}年${month + 1}月`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        this.calendarGrid.innerHTML = '';
        
        // 曜日ヘッダー
        const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
        weekDays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            dayHeader.style.cssText = 'font-weight: bold; color: #666; padding: 10px; text-align: center;';
            this.calendarGrid.appendChild(dayHeader);
        });
        
        // カレンダー日付
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = date.getDate();
            
            if (date.getMonth() !== month) {
                dayEl.style.opacity = '0.3';
            }
            
            if (this.isSameDate(date, new Date())) {
                dayEl.classList.add('today');
            }
            
            const completionStatus = this.getDayCompletionStatus(date);
            if (completionStatus === 'completed') {
                dayEl.classList.add('completed');
            } else if (completionStatus === 'partial') {
                dayEl.classList.add('partial');
            }
            
            this.calendarGrid.appendChild(dayEl);
        }
    }
    
    getDayCompletionStatus(date) {
        const dateStr = this.formatDate(date);
        const totalHabits = this.habits.length;
        
        if (totalHabits === 0) return 'none';
        
        const completedHabits = this.habits.filter(habit => 
            (habit.completions[dateStr] || 0) >= habit.target
        ).length;
        
        if (completedHabits === totalHabits) return 'completed';
        if (completedHabits > 0) return 'partial';
        return 'none';
    }
    
    changeMonth(direction) {
        this.selectedDate.setMonth(this.selectedDate.getMonth() + direction);
        this.renderCalendar();
    }
    
    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
}

// Initialize the habit tracker when the page loads
let habitTracker;
document.addEventListener('DOMContentLoaded', () => {
    habitTracker = new HabitTracker();
});