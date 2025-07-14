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
            this.showNotification('Workout already in progress!', 'warning');
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
        this.startWorkoutBtn.textContent = 'ø Workout in Progress';
        this.startWorkoutBtn.disabled = true;
        
        this.updateCurrentWorkoutUI();
        this.showNotification('Workout started!', 'success');
    }
    
    startTimer() {
        if (this.timer) return;
        
        this.timerStartTime = Date.now() - this.timerDuration;
        this.timerPaused = false;
        
        this.timer = setInterval(() => {
            if (!this.timerPaused) {
                this.timerDuration = Date.now() - this.timerStartTime;
                this.updateTimerDisplay();
            }
        }, 1000);
        
        this.startTimerBtn.disabled = true;
        this.pauseTimerBtn.disabled = false;
    }
    
    pauseTimer() {
        this.timerPaused = true;
        this.startTimerBtn.disabled = false;
        this.pauseTimerBtn.disabled = true;
    }
    
    resetTimer() {
        clearInterval(this.timer);
        this.timer = null;
        this.timerDuration = 0;
        this.timerPaused = false;
        this.updateTimerDisplay();
        this.startTimerBtn.disabled = false;
        this.pauseTimerBtn.disabled = true;
    }
    
    updateTimerDisplay() {
        const hours = Math.floor(this.timerDuration / 3600000);
        const minutes = Math.floor((this.timerDuration % 3600000) / 60000);
        const seconds = Math.floor((this.timerDuration % 60000) / 1000);
        
        this.timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    showAddExerciseModal() {
        if (!this.currentWorkout) {
            this.showNotification('Start a workout first!', 'warning');
            return;
        }
        
        this.addExerciseModal.classList.add('active');
        this.exerciseNameInput.focus();
    }
    
    handleExerciseSubmit(e) {
        e.preventDefault();
        
        const exercise = {
            id: Date.now(),
            name: this.exerciseNameInput.value,
            type: this.exerciseTypeSelect.value,
            duration: parseInt(this.durationInput.value),
            sets: parseInt(this.setsInput.value) || null,
            reps: parseInt(this.repsInput.value) || null,
            weight: parseFloat(this.weightInput.value) || null,
            notes: this.notesInput.value,
            timestamp: new Date().toISOString()
        };
        
        this.currentWorkout.exercises.push(exercise);
        this.updateCurrentWorkoutUI();
        this.closeModal();
        this.exerciseForm.reset();
        this.showNotification('Exercise added!', 'success');
    }
    
    updateCurrentWorkoutUI() {
        if (!this.currentWorkout || this.currentWorkout.exercises.length === 0) {
            this.currentExercisesEl.innerHTML = '<p class=\"no-exercises\">No exercises added yet</p>';
            return;
        }
        
        this.currentExercisesEl.innerHTML = this.currentWorkout.exercises.map(exercise => `
            <div class=\"exercise-item\" data-id=\"${exercise.id}\">
                <div class=\"exercise-info\">
                    <div class=\"exercise-name\">${exercise.name}</div>
                    <div class=\"exercise-details\">
                        ${exercise.type} " ${exercise.duration} min
                        ${exercise.sets ? ` " ${exercise.sets} sets` : ''}
                        ${exercise.reps ? ` × ${exercise.reps} reps` : ''}
                        ${exercise.weight ? ` @ ${exercise.weight} lbs` : ''}
                    </div>
                </div>
                <div class=\"exercise-actions\">
                    <button class=\"btn-small\" onclick=\"tracker.editExercise(${exercise.id})\">Edit</button>
                    <button class=\"btn-small\" onclick=\"tracker.deleteExercise(${exercise.id})\">Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    editExercise(exerciseId) {
        const exercise = this.currentWorkout.exercises.find(e => e.id === exerciseId);
        if (!exercise) return;
        
        // Populate form with exercise data
        this.exerciseNameInput.value = exercise.name;
        this.exerciseTypeSelect.value = exercise.type;
        this.durationInput.value = exercise.duration;
        this.setsInput.value = exercise.sets || '';
        this.repsInput.value = exercise.reps || '';
        this.weightInput.value = exercise.weight || '';
        this.notesInput.value = exercise.notes || '';
        
        // Remove exercise from current workout
        this.currentWorkout.exercises = this.currentWorkout.exercises.filter(e => e.id !== exerciseId);
        
        this.showAddExerciseModal();
    }
    
    deleteExercise(exerciseId) {
        if (confirm('Are you sure you want to delete this exercise?')) {
            this.currentWorkout.exercises = this.currentWorkout.exercises.filter(e => e.id !== exerciseId);
            this.updateCurrentWorkoutUI();
            this.showNotification('Exercise deleted!', 'success');
        }
    }
    
    completeWorkout() {
        if (!this.currentWorkout) return;
        
        if (this.currentWorkout.exercises.length === 0) {
            this.showNotification('Add at least one exercise to complete the workout!', 'warning');
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
        this.startWorkoutBtn.textContent = '<ÃB Start Workout';
        this.startWorkoutBtn.disabled = false;
        
        this.updateUI();
        this.showNotification(`Workout completed! ${totalDuration} minutes, ${totalCalories} calories burned.`, 'success');
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
    
    showHistoryModal() {
        this.historyModal.classList.add('active');
        this.displayHistory();
    }
    
    displayHistory() {
        let filteredWorkouts = [...this.workouts];
        
        // Apply date filter
        if (this.dateFilter.value) {
            const filterDate = new Date(this.dateFilter.value);
            filteredWorkouts = filteredWorkouts.filter(workout => {
                const workoutDate = new Date(workout.date);
                return workoutDate.toDateString() === filterDate.toDateString();
            });
        }
        
        // Apply type filter
        if (this.typeFilter.value) {
            filteredWorkouts = filteredWorkouts.filter(workout => 
                workout.exercises.some(exercise => exercise.type === this.typeFilter.value)
            );
        }
        
        if (filteredWorkouts.length === 0) {
            this.historyList.innerHTML = '<p class=\"no-data\">No workouts found</p>';
            return;
        }
        
        this.historyList.innerHTML = filteredWorkouts.map(workout => `
            <div class=\"history-item\">
                <div class=\"history-date\">${new Date(workout.date).toLocaleDateString()}</div>
                <div class=\"history-summary\">
                    ${workout.exercises.length} exercises " ${workout.duration} min " ${workout.calories} calories
                </div>
                <div class=\"history-exercises\">
                    ${workout.exercises.map(ex => `
                        <div class=\"history-exercise\">${ex.name} (${ex.duration} min)</div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
    
    filterHistory() {
        this.displayHistory();
    }
    
    exportData() {
        const data = {
            workouts: this.workouts,
            exported: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exercise_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'success');
    }
    
    loadTemplates() {
        this.templateGridEl.innerHTML = this.templates.map(template => `
            <div class=\"template-card\" onclick=\"tracker.useTemplate('${template.id}')\">
                <div class=\"template-icon\">${template.icon}</div>
                <div class=\"template-name\">${template.name}</div>
                <div class=\"template-type\">${template.type}</div>
            </div>
        `).join('');
    }
    
    useTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;
        
        if (!this.currentWorkout) {
            this.startWorkout();
        }
        
        // Populate form with template data
        this.exerciseNameInput.value = template.name;
        this.exerciseTypeSelect.value = template.type;
        this.durationInput.value = template.duration;
        this.setsInput.value = template.sets || '';
        this.repsInput.value = template.reps || '';
        this.weightInput.value = template.weight || '';
        this.notesInput.value = template.notes || '';
        
        this.showAddExerciseModal();
    }
    
    getExerciseTemplates() {
        return [
            { id: 'push_ups', name: 'Push-ups', type: 'strength', icon: '=ª', duration: 10, sets: 3, reps: 15 },
            { id: 'running', name: 'Running', type: 'cardio', icon: '<ÃB', duration: 30 },
            { id: 'squats', name: 'Squats', type: 'strength', icon: '>µ', duration: 15, sets: 3, reps: 20 },
            { id: 'yoga', name: 'Yoga', type: 'flexibility', icon: '>Ø@', duration: 45 },
            { id: 'cycling', name: 'Cycling', type: 'cardio', icon: '=´B', duration: 60 },
            { id: 'planks', name: 'Planks', type: 'strength', icon: '<ËB', duration: 5, sets: 3 },
            { id: 'swimming', name: 'Swimming', type: 'cardio', icon: '<ÊB', duration: 45 },
            { id: 'burpees', name: 'Burpees', type: 'strength', icon: '>8B', duration: 10, sets: 3, reps: 10 }
        ];
    }
    
    updateUI() {
        this.updateStats();
        this.updateRecentWorkouts();
        this.updateGoalsProgress();
        this.updateChart();
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
            this.recentWorkoutsEl.innerHTML = '<p class=\"no-data\">No recent workouts</p>';
            return;
        }
        
        this.recentWorkoutsEl.innerHTML = recentWorkouts.map(workout => `
            <div class=\"workout-item\">
                <div class=\"workout-date\">${new Date(workout.date).toLocaleDateString()}</div>
                <div class=\"workout-summary\">${workout.exercises.length} exercises " ${workout.duration} min</div>
            </div>
        `).join('');
    }
    
    updateGoalsProgress() {
        // Weekly workouts progress
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weeklyWorkouts = this.workouts.filter(w => {
            const workoutDate = new Date(w.date);
            return workoutDate >= weekStart && workoutDate <= weekEnd;
        }).length;
        
        const weeklyProgress = Math.min((weeklyWorkouts / this.goals.weeklyWorkouts) * 100, 100);
        this.weeklyProgress.style.width = `${weeklyProgress}%`;
        this.weeklyGoalText.textContent = `${weeklyWorkouts}/${this.goals.weeklyWorkouts}`;
        
        // Monthly calories progress
        const monthStart = new Date();
        monthStart.setDate(1);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        
        const monthlyCalories = this.workouts.filter(w => {
            const workoutDate = new Date(w.date);
            return workoutDate >= monthStart && workoutDate <= monthEnd;
        }).reduce((sum, w) => sum + (w.calories || 0), 0);
        
        const caloriesProgress = Math.min((monthlyCalories / this.goals.monthlyCalories) * 100, 100);
        this.caloriesProgress.style.width = `${caloriesProgress}%`;
        this.caloriesGoalText.textContent = `${monthlyCalories}/${this.goals.monthlyCalories}`;
    }
    
    updateChart() {
        const ctx = this.progressChart.getContext('2d');
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date;
        }).reverse();
        
        const workoutCounts = last7Days.map(date => {
            const dateStr = date.toDateString();
            return this.workouts.filter(w => new Date(w.date).toDateString() === dateStr).length;
        });
        
        // Simple bar chart
        ctx.clearRect(0, 0, this.progressChart.width, this.progressChart.height);
        ctx.fillStyle = '#4f46e5';
        
        const barWidth = this.progressChart.width / 7;
        const maxCount = Math.max(...workoutCounts, 1);
        
        workoutCounts.forEach((count, index) => {
            const barHeight = (count / maxCount) * (this.progressChart.height - 20);
            ctx.fillRect(index * barWidth + 5, this.progressChart.height - barHeight - 10, barWidth - 10, barHeight);
        });
    }
    
    closeModal() {
        this.addExerciseModal.classList.remove('active');
        this.exerciseForm.reset();
    }
    
    closeHistoryModal() {
        this.historyModal.classList.remove('active');
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        this.themeToggle.textContent = newTheme === 'dark' ? ' ' : '<';
        localStorage.setItem('exerciseTrackerTheme', newTheme);
    }
    
    showProfile() {
        this.showNotification('Profile feature coming soon!', 'info');
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
            
            // Load theme
            const theme = localStorage.getItem('exerciseTrackerTheme') || 'light';
            document.documentElement.setAttribute('data-theme', theme);
            this.themeToggle.textContent = theme === 'dark' ? ' ' : '<';
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