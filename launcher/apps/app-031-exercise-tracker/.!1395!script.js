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
