class ExerciseTracker {
    constructor() {
        this.workouts = [];
        this.currentWorkout = null;
        this.timer = null;
        this.timerStartTime = null;
        this.timerPaused = false;
        this.timerDuration = 0;
        this.goals = {
            weeklyWorkouts: 5,
            monthlyCalories: 10000
        };
        this.templates = this.getExerciseTemplates();
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadData();
        this.updateUI();
    }
    
    initializeElements() {
        // Stats elements
        this.todayWorkoutsEl = document.getElementById('todayWorkouts');
        this.totalWorkoutsEl = document.getElementById('totalWorkouts');
        this.currentStreakEl = document.getElementById('currentStreak');
        this.caloriesBurnedEl = document.getElementById('caloriesBurned');
        
        // Action buttons
        this.startWorkoutBtn = document.getElementById('startWorkoutBtn');
        this.addExerciseBtn = document.getElementById('addExerciseBtn');
        this.viewHistoryBtn = document.getElementById('viewHistoryBtn');
        this.completeWorkoutBtn = document.getElementById('completeWorkout');
        
        // Current workout
        this.currentWorkoutEl = document.getElementById('currentWorkout');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startTimerBtn = document.getElementById('startTimer');
        this.pauseTimerBtn = document.getElementById('pauseTimer');
        this.resetTimerBtn = document.getElementById('resetTimer');
        this.currentExercisesEl = document.getElementById('currentExercises');
        
        // Templates
        this.templateGridEl = document.getElementById('templateGrid');
        
        // Side panel
        this.recentWorkoutsEl = document.getElementById('recentWorkouts');
        this.progressChart = document.getElementById('progressChart');
        this.weeklyProgress = document.getElementById('weeklyProgress');
        this.weeklyGoalText = document.getElementById('weeklyGoalText');
        this.caloriesProgress = document.getElementById('caloriesProgress');
        this.caloriesGoalText = document.getElementById('caloriesGoalText');
        
        // Modals
        this.addExerciseModal = document.getElementById('addExerciseModal');
        this.historyModal = document.getElementById('historyModal');
        this.exerciseForm = document.getElementById('exerciseForm');
        
        // Form elements
        this.exerciseNameInput = document.getElementById('exerciseName');
        this.exerciseTypeSelect = document.getElementById('exerciseType');
        this.durationInput = document.getElementById('duration');
        this.setsInput = document.getElementById('sets');
        this.repsInput = document.getElementById('reps');
        this.weightInput = document.getElementById('weight');
        this.notesInput = document.getElementById('notes');
        
        // History
        this.historyList = document.getElementById('historyList');
        this.dateFilter = document.getElementById('dateFilter');
        this.typeFilter = document.getElementById('typeFilter');
        this.exportDataBtn = document.getElementById('exportData');
        
        // UI controls
        this.themeToggle = document.getElementById('themeToggle');
        this.profileBtn = document.getElementById('profileBtn');
    }
    
    setupEventListeners() {
        // Action buttons
        this.startWorkoutBtn.addEventListener('click', () => this.startWorkout());
        this.addExerciseBtn.addEventListener('click', () => this.showAddExerciseModal());
        this.viewHistoryBtn.addEventListener('click', () => this.showHistoryModal());
        this.completeWorkoutBtn.addEventListener('click', () => this.completeWorkout());
        
        // Timer controls
        this.startTimerBtn.addEventListener('click', () => this.startTimer());
        this.pauseTimerBtn.addEventListener('click', () => this.pauseTimer());
        this.resetTimerBtn.addEventListener('click', () => this.resetTimer());
        
        // Form submission
        this.exerciseForm.addEventListener('submit', (e) => this.handleExerciseSubmit(e));
        
        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('closeHistoryModal').addEventListener('click', () => this.closeHistoryModal());
        document.getElementById('cancelAdd').addEventListener('click', () => this.closeModal());
        
        // History filters
        this.dateFilter.addEventListener('change', () => this.filterHistory());
        this.typeFilter.addEventListener('change', () => this.filterHistory());
        this.exportDataBtn.addEventListener('click', () => this.exportData());
        
        // UI controls
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.profileBtn.addEventListener('click', () => this.showProfile());
        
        // Close modals on background click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
                this.closeHistoryModal();
            }
        });
    }
    
    startWorkout() {
        if (this.currentWorkout) {
            this.showNotification('ワークアウトが既に進行中です！', 'warning');
            return;
        }
        
        this.currentWorkout = {
            id: Date.now(),
            date: new Date().toISOString(),
            exercises: [],
            duration: 0,
            status: 'active'
        };
        
        this.currentWorkoutEl.style.display = 'block';
        this.startWorkoutBtn.textContent = '🏃 ワークアウト中';
        this.startWorkoutBtn.disabled = true;
        
        this.updateCurrentWorkoutUI();
        this.showNotification('ワークアウトを開始しました！', 'success');
    }
    
    completeWorkout() {
        if (!this.currentWorkout) return;
        
        if (this.currentWorkout.exercises.length === 0) {
            this.showNotification('エクササイズを追加してからワークアウトを完了してください！', 'warning');
            return;
        }
        
        // Stop timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Calculate total duration and calories
        const totalDuration = this.currentWorkout.exercises.reduce((sum, ex) => sum + ex.duration, 0);
        const totalCalories = this.calculateCalories(this.currentWorkout.exercises);
        
        this.currentWorkout.duration = totalDuration;
        this.currentWorkout.calories = totalCalories;
        this.currentWorkout.status = 'completed';
        this.currentWorkout.endTime = new Date().toISOString();
        
        // Save workout
        this.workouts.unshift(this.currentWorkout);
        this.saveData();
        
        // Reset current workout
        this.currentWorkout = null;
        this.timerDuration = 0;
        this.updateTimerDisplay();
        this.currentWorkoutEl.style.display = 'none';
        
        // Reset UI
        this.startWorkoutBtn.textContent = '🏃 ワークアウト開始';
        this.startWorkoutBtn.disabled = false;
        
        this.updateUI();
        this.showNotification(`ワークアウト完了！ ${totalDuration}分、${totalCalories}カロリー消費`, 'success');
    }
    
    calculateCalories(exercises) {
        const calorieRates = {
            cardio: 8,
            strength: 6,
            flexibility: 3,
            sports: 10
        };
        
        return exercises.reduce((total, exercise) => {
            const rate = calorieRates[exercise.type] || 5;
            return total + (exercise.duration * rate);
        }, 0);
    }
    
    getExerciseTemplates() {
        return [
            { id: 'push_ups', name: 'プッシュアップ', type: 'strength', icon: '💪', duration: 10, sets: 3, reps: 15 },
            { id: 'running', name: 'ランニング', type: 'cardio', icon: '🏃', duration: 30 },
            { id: 'squats', name: 'スクワット', type: 'strength', icon: '🏋️', duration: 15, sets: 3, reps: 20 },
            { id: 'yoga', name: 'ヨガ', type: 'flexibility', icon: '🧘', duration: 45 },
            { id: 'cycling', name: 'サイクリング', type: 'cardio', icon: '🚴', duration: 60 },
            { id: 'planks', name: 'プランク', type: 'strength', icon: '🤸', duration: 5, sets: 3 },
            { id: 'swimming', name: '水泳', type: 'cardio', icon: '🏊', duration: 45 },
            { id: 'burpees', name: 'バーピー', type: 'strength', icon: '🏃', duration: 10, sets: 3, reps: 10 }
        ];
    }
    
    updateUI() {
        this.updateStats();
        this.updateRecentWorkouts();
        this.updateGoalsProgress();
        this.loadTemplates();
    }
    
    updateStats() {
        const today = new Date().toDateString();
        const todayWorkouts = this.workouts.filter(w => new Date(w.date).toDateString() === today);
        const totalCalories = this.workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
        
        this.todayWorkoutsEl.textContent = todayWorkouts.length;
        this.totalWorkoutsEl.textContent = this.workouts.length;
        this.caloriesBurnedEl.textContent = totalCalories;
        this.currentStreakEl.textContent = this.calculateStreak();
    }
    
    calculateStreak() {
        if (this.workouts.length === 0) return 0;
        
        const today = new Date();
        let streak = 0;
        let checkDate = new Date(today);
        
        while (checkDate >= new Date(this.workouts[this.workouts.length - 1].date)) {
            const dateStr = checkDate.toDateString();
            const hasWorkout = this.workouts.some(w => new Date(w.date).toDateString() === dateStr);
            
            if (hasWorkout) {
                streak++;
            } else if (streak > 0) {
                break;
            }
            
            checkDate.setDate(checkDate.getDate() - 1);
        }
        
        return streak;
    }
    
    updateRecentWorkouts() {
        const recentWorkouts = this.workouts.slice(0, 5);
        
        if (recentWorkouts.length === 0) {
            this.recentWorkoutsEl.innerHTML = '<p class="no-data">最近のワークアウトがありません</p>';
            return;
        }
        
        this.recentWorkoutsEl.innerHTML = recentWorkouts.map(workout => `
            <div class="workout-item">
                <div class="workout-date">${new Date(workout.date).toLocaleDateString()}</div>
                <div class="workout-summary">${workout.exercises.length}個のエクササイズ • ${workout.duration}分</div>
            </div>
        `).join('');
    }
    
    loadTemplates() {
        this.templateGridEl.innerHTML = this.templates.map(template => `
            <div class="template-card" onclick="tracker.useTemplate('${template.id}')">
                <div class="template-icon">${template.icon}</div>
                <div class="template-name">${template.name}</div>
                <div class="template-type">${template.type}</div>
            </div>
        `).join('');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-size: 0.9rem;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            animation: slideInRight 0.3s ease-out;
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = '#10b981';
                notification.style.color = 'white';
                break;
            case 'warning':
                notification.style.background = '#f59e0b';
                notification.style.color = 'white';
                break;
            case 'error':
                notification.style.background = '#ef4444';
                notification.style.color = 'white';
                break;
            default:
                notification.style.background = '#4f46e5';
                notification.style.color = 'white';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    saveData() {
        try {
            localStorage.setItem('exerciseTrackerData', JSON.stringify({
                workouts: this.workouts,
                goals: this.goals,
                version: '1.0'
            }));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }
    
    loadData() {
        try {
            const saved = localStorage.getItem('exerciseTrackerData');
            if (saved) {
                const data = JSON.parse(saved);
                this.workouts = data.workouts || [];
                this.goals = { ...this.goals, ...data.goals };
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
}

// Initialize tracker when DOM is loaded
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new ExerciseTracker();
});