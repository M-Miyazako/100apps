// ガントチャートアプリの機能

let tasks = [];
let taskIdCounter = 1;
let currentView = 'month';
let currentFilter = 'all';
let currentDate = new Date();

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    initializeEventListeners();
    updateStats();
    renderGanttChart();
    renderTasks();
    updatePeriodDisplay();
});

// イベントリスナーの初期化
function initializeEventListeners() {
    // タスクフォーム
    document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
    
    // ビューボタン
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            renderGanttChart();
        });
    });
    
    // フィルターボタン
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderGanttChart();
            renderTasks();
        });
    });
    
    // ナビゲーションボタン
    document.getElementById('prevPeriod').addEventListener('click', function() {
        navigatePeriod(-1);
    });
    
    document.getElementById('nextPeriod').addEventListener('click', function() {
        navigatePeriod(1);
    });
    
    // ソート機能
    document.getElementById('sortBy').addEventListener('change', function() {
        renderTasks();
    });
    
    // エクスポートボタン
    document.getElementById('exportCSV').addEventListener('click', exportToCSV);
    document.getElementById('exportJSON').addEventListener('click', exportToJSON);
    document.getElementById('exportPDF').addEventListener('click', exportToPDF);
    
    // モーダル関連
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('saveTask').addEventListener('click', saveTaskFromModal);
    document.getElementById('deleteTask').addEventListener('click', deleteTaskFromModal);
    
    // 進捗スライダー
    document.getElementById('modalTaskProgress').addEventListener('input', function() {
        document.getElementById('progressValue').textContent = this.value + '%';
    });
    
    // モーダル外クリックで閉じる
    document.getElementById('taskModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// タスク作成フォーム処理
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const startDate = new Date(document.getElementById('taskStartDate').value);
    const endDate = new Date(document.getElementById('taskEndDate').value);
    
    if (startDate > endDate) {
        alert('開始日は終了日より前である必要があります。');
        return;
    }
    
    const task = {
        id: taskIdCounter++,
        name: document.getElementById('taskName').value,
        description: '',
        startDate: document.getElementById('taskStartDate').value,
        endDate: document.getElementById('taskEndDate').value,
        priority: document.getElementById('taskPriority').value,
        assignee: document.getElementById('taskAssignee').value,
        progress: 0,
        status: 'todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveToStorage();
    updateStats();
    renderGanttChart();
    renderTasks();
    
    // フォームをリセット
    document.getElementById('taskForm').reset();
}

// 期間ナビゲーション
function navigatePeriod(direction) {
    switch (currentView) {
        case 'month':
            currentDate.setMonth(currentDate.getMonth() + direction);
            break;
        case 'week':
            currentDate.setDate(currentDate.getDate() + (direction * 7));
            break;
        case 'day':
            currentDate.setDate(currentDate.getDate() + direction);
            break;
    }
    
    updatePeriodDisplay();
    renderGanttChart();
}

// 期間表示更新
function updatePeriodDisplay() {
    const periodText = document.getElementById('currentPeriod');
    
    switch (currentView) {
        case 'month':
            periodText.textContent = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;
            break;
        case 'week':
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - currentDate.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            periodText.textContent = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
            break;
        case 'day':
            periodText.textContent = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;
            break;
    }
}

// 統計情報更新
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.progress === 100).length;
    const overdueTasks = tasks.filter(task => 
        new Date(task.endDate) < new Date() && task.progress < 100
    ).length;
    
    // プロジェクト日数計算
    let projectDays = 0;
    if (tasks.length > 0) {
        const startDates = tasks.map(task => new Date(task.startDate));
        const endDates = tasks.map(task => new Date(task.endDate));
        const projectStart = new Date(Math.min(...startDates));
        const projectEnd = new Date(Math.max(...endDates));
        projectDays = Math.ceil((projectEnd - projectStart) / (1000 * 60 * 60 * 24));
    }
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('overdueTasks').textContent = overdueTasks;
    document.getElementById('projectDays').textContent = projectDays;
    
    // 進捗バーの更新
    const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    document.getElementById('progressFill').style.width = progressPercent + '%';
    document.getElementById('progressText').textContent = Math.round(progressPercent) + '% 完了';
}

// ガントチャート描画
function renderGanttChart() {
    const timelineContainer = document.getElementById('ganttTimeline');
    const tasksContainer = document.getElementById('ganttTasks');
    
    // タイムラインヘッダー生成
    const timelineHeaders = generateTimelineHeaders();
    timelineContainer.innerHTML = timelineHeaders.map(header => `
        <div class="timeline-header">${header}</div>
    `).join('');
    
    // フィルターされたタスク取得
    const filteredTasks = getFilteredTasks();
    
    // タスクバー生成
    tasksContainer.innerHTML = filteredTasks.map(task => {
        const taskBar = generateTaskBar(task);
        return `
            <div class="gantt-task-row">
                <div class="task-label">${task.name}</div>
                ${taskBar}
            </div>
        `;
    }).join('');
}

// タイムラインヘッダー生成
function generateTimelineHeaders() {
    const headers = [];
    
    switch (currentView) {
        case 'month':
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            for (let day = 1; day <= daysInMonth; day++) {
                headers.push(`${day}`);
            }
            break;
        case 'week':
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - currentDate.getDay());
            
            for (let i = 0; i < 7; i++) {
                const day = new Date(weekStart);
                day.setDate(weekStart.getDate() + i);
                headers.push(`${day.getMonth() + 1}/${day.getDate()}`);
            }
            break;
        case 'day':
            for (let hour = 0; hour < 24; hour++) {
                headers.push(`${hour}:00`);
            }
            break;
    }
    
    return headers;
}

// タスクバー生成
function generateTaskBar(task) {
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // 簡単な位置計算（実際の実装では、より精密な計算が必要）
    const left = calculateTaskPosition(startDate);
    const width = duration * 30; // 1日 = 30px
    
    const priorityClass = `priority-${task.priority}`;
    const completedClass = task.progress === 100 ? 'completed' : '';
    
    return `
        <div class="task-bar ${priorityClass} ${completedClass}"
             style="left: ${left}px; width: ${width}px;"
             onclick="openTaskModal(${task.id})">
            ${task.name} (${task.progress}%)
        </div>
    `;
}

// タスク位置計算
function calculateTaskPosition(taskDate) {
    // 簡単な実装例
    const baseDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const dayDiff = Math.floor((taskDate - baseDate) / (1000 * 60 * 60 * 24));
    return 200 + (dayDiff * 30); // 200px = ラベル幅 + 30px per day
}

// タスク一覧描画
function renderTasks() {
    const container = document.getElementById('tasksList');
    const filteredTasks = getFilteredTasks();
    const sortBy = document.getElementById('sortBy').value;
    
    // ソート処理
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        switch (sortBy) {
            case 'startDate':
                return new Date(a.startDate) - new Date(b.startDate);
            case 'endDate':
                return new Date(a.endDate) - new Date(b.endDate);
            case 'priority':
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });
    
    if (sortedTasks.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h4>該当するタスクがありません</h4>
            </div>
        `;
        return;
    }
    
    container.innerHTML = sortedTasks.map(task => `
        <div class="task-item" onclick="openTaskModal(${task.id})">
            <div class="task-title">${task.name}</div>
            <div class="task-dates">
                ${new Date(task.startDate).toLocaleDateString()} - ${new Date(task.endDate).toLocaleDateString()}
            </div>
            <div class="task-meta">
                <span class="priority-badge priority-${task.priority}">${getPriorityText(task.priority)}</span>
                <span>担当者: ${task.assignee || 'なし'}</span>
                <span>進捗: ${task.progress}%</span>
            </div>
        </div>
    `).join('');
}

// フィルター適用
function getFilteredTasks() {
    let filtered = [...tasks];
    
    switch (currentFilter) {
        case 'high':
            filtered = filtered.filter(task => task.priority === 'high');
            break;
        case 'overdue':
            filtered = filtered.filter(task => 
                new Date(task.endDate) < new Date() && task.progress < 100
            );
            break;
        case 'completed':
            filtered = filtered.filter(task => task.progress === 100);
            break;
    }
    
    return filtered;
}

// タスクモーダル開閉
function openTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('modalTaskName').value = task.name;
    document.getElementById('modalTaskDescription').value = task.description || '';
    document.getElementById('modalTaskStartDate').value = task.startDate;
    document.getElementById('modalTaskEndDate').value = task.endDate;
    document.getElementById('modalTaskPriority').value = task.priority;
    document.getElementById('modalTaskAssignee').value = task.assignee || '';
    document.getElementById('modalTaskProgress').value = task.progress || 0;
    document.getElementById('progressValue').textContent = (task.progress || 0) + '%';
    
    document.getElementById('taskModal').style.display = 'block';
    document.getElementById('taskModal').dataset.taskId = taskId;
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
}

// モーダルからタスク保存
function saveTaskFromModal() {
    const taskId = parseInt(document.getElementById('taskModal').dataset.taskId);
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        task.name = document.getElementById('modalTaskName').value;
        task.description = document.getElementById('modalTaskDescription').value;
        task.startDate = document.getElementById('modalTaskStartDate').value;
        task.endDate = document.getElementById('modalTaskEndDate').value;
        task.priority = document.getElementById('modalTaskPriority').value;
        task.assignee = document.getElementById('modalTaskAssignee').value;
        task.progress = parseInt(document.getElementById('modalTaskProgress').value);
        task.updatedAt = new Date().toISOString();
        
        saveToStorage();
        updateStats();
        renderGanttChart();
        renderTasks();
        closeModal();
    }
}

// モーダルからタスク削除
function deleteTaskFromModal() {
    const taskId = parseInt(document.getElementById('taskModal').dataset.taskId);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1);
        saveToStorage();
        updateStats();
        renderGanttChart();
        renderTasks();
        closeModal();
    }
}

// エクスポート機能
function exportToCSV() {
    const csvData = [
        ['タスク名', '説明', '開始日', '終了日', '優先度', '担当者', '進捗', '作成日'],
        ...tasks.map(task => [
            task.name,
            task.description || '',
            task.startDate,
            task.endDate,
            getPriorityText(task.priority),
            task.assignee || 'なし',
            task.progress + '%',
            new Date(task.createdAt).toLocaleDateString()
        ])
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gantt-tasks.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function exportToJSON() {
    const data = {
        tasks: tasks,
        exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gantt-tasks.json';
    a.click();
    URL.revokeObjectURL(url);
}

function exportToPDF() {
    // PDF生成は複雑なので、ここでは簡単な実装を示す
    alert('PDF エクスポート機能は開発中です。');
}

// ユーティリティ関数
function getPriorityText(priority) {
    const priorities = {
        'low': '低',
        'medium': '中',
        'high': '高'
    };
    return priorities[priority] || priority;
}

// データの保存と読み込み
function saveToStorage() {
    localStorage.setItem('ganttChart_tasks', JSON.stringify(tasks));
    localStorage.setItem('ganttChart_counter', JSON.stringify(taskIdCounter));
}

function loadFromStorage() {
    const storedTasks = localStorage.getItem('ganttChart_tasks');
    const storedCounter = localStorage.getItem('ganttChart_counter');
    
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
    
    if (storedCounter) {
        taskIdCounter = JSON.parse(storedCounter);
    }
}