// カンバンボードアプリの機能

let tasks = [];
let taskIdCounter = 1;
let currentFilter = 'all';
let draggedTask = null;

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    initializeEventListeners();
    updateStats();
    renderTasks();
    
    // ドラッグ&ドロップの設定
    setupDragAndDrop();
});

// イベントリスナーの初期化
function initializeEventListeners() {
    // タスクフォーム
    document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
    
    // フィルターボタン
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderTasks();
        });
    });
    
    // エクスポートボタン
    document.getElementById('exportCSV').addEventListener('click', exportToCSV);
    document.getElementById('exportJSON').addEventListener('click', exportToJSON);
    
    // モーダル関連
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('saveTask').addEventListener('click', saveTaskFromModal);
    document.getElementById('deleteTask').addEventListener('click', deleteTaskFromModal);
    
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
    
    const task = {
        id: taskIdCounter++,
        title: document.getElementById('taskTitle').value,
        description: '',
        priority: document.getElementById('taskPriority').value,
        assignee: document.getElementById('taskAssignee').value,
        dueDate: document.getElementById('taskDueDate').value,
        status: 'todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveToStorage();
    updateStats();
    renderTasks();
    
    // フォームをリセット
    document.getElementById('taskForm').reset();
}

// ドラッグ&ドロップ設定
function setupDragAndDrop() {
    const taskLists = document.querySelectorAll('.task-list');
    
    taskLists.forEach(list => {
        list.addEventListener('dragover', handleDragOver);
        list.addEventListener('drop', handleDrop);
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    
    if (draggedTask) {
        const newStatus = e.currentTarget.id.replace('List', '').replace('inProgress', 'inprogress');
        
        // タスクのステータスを更新
        const task = tasks.find(t => t.id === draggedTask);
        if (task) {
            task.status = newStatus;
            task.updatedAt = new Date().toISOString();
            saveToStorage();
            updateStats();
            renderTasks();
        }
        
        draggedTask = null;
    }
}

// タスクドラッグ開始
function handleTaskDragStart(e, taskId) {
    draggedTask = taskId;
    e.target.classList.add('dragging');
}

// タスクドラッグ終了
function handleTaskDragEnd(e) {
    e.target.classList.remove('dragging');
}

// 統計情報更新
function updateStats() {
    const todoCount = tasks.filter(task => task.status === 'todo').length;
    const inProgressCount = tasks.filter(task => task.status === 'inprogress').length;
    const reviewCount = tasks.filter(task => task.status === 'review').length;
    const doneCount = tasks.filter(task => task.status === 'done').length;
    
    document.getElementById('todoCount').textContent = todoCount;
    document.getElementById('inProgressCount').textContent = inProgressCount;
    document.getElementById('reviewCount').textContent = reviewCount;
    document.getElementById('doneCount').textContent = doneCount;
    
    // カラムのカウントも更新
    document.getElementById('todoCountDisplay').textContent = todoCount;
    document.getElementById('inProgressCountDisplay').textContent = inProgressCount;
    document.getElementById('reviewCountDisplay').textContent = reviewCount;
    document.getElementById('doneCountDisplay').textContent = doneCount;
    
    // 進捗バーの更新
    const totalTasks = tasks.length;
    const completedTasks = doneCount;
    const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    document.getElementById('progressFill').style.width = progressPercent + '%';
    document.getElementById('progressText').textContent = Math.round(progressPercent) + '% 完了';
}

// タスク描画
function renderTasks() {
    const statuses = ['todo', 'inprogress', 'review', 'done'];
    
    statuses.forEach(status => {
        const container = document.getElementById(status + 'List');
        const filteredTasks = getFilteredTasks(status);
        
        if (filteredTasks.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = filteredTasks.map(task => `
            <div class="task-card" 
                 draggable="true" 
                 data-task-id="${task.id}"
                 ondragstart="handleTaskDragStart(event, ${task.id})"
                 ondragend="handleTaskDragEnd(event)"
                 onclick="openTaskModal(${task.id})">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span class="priority-badge priority-${task.priority}">${getPriorityText(task.priority)}</span>
                    <span class="task-assignee">${task.assignee || 'なし'}</span>
                </div>
                ${task.dueDate ? `<div class="task-due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}">
                    ${new Date(task.dueDate).toLocaleDateString()}
                </div>` : ''}
            </div>
        `).join('');
    });
}

// フィルター適用
function getFilteredTasks(status) {
    let filtered = tasks.filter(task => task.status === status);
    
    switch (currentFilter) {
        case 'high':
            filtered = filtered.filter(task => task.priority === 'high');
            break;
        case 'overdue':
            filtered = filtered.filter(task => isOverdue(task.dueDate));
            break;
        case 'my-tasks':
            // 簡単な例として、担当者がいるタスクのみを表示
            filtered = filtered.filter(task => task.assignee);
            break;
    }
    
    return filtered;
}

// タスクモーダル開閉
function openTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('modalTaskTitle').value = task.title;
    document.getElementById('modalTaskDescription').value = task.description || '';
    document.getElementById('modalTaskPriority').value = task.priority;
    document.getElementById('modalTaskAssignee').value = task.assignee || '';
    document.getElementById('modalTaskDueDate').value = task.dueDate || '';
    
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
        task.title = document.getElementById('modalTaskTitle').value;
        task.description = document.getElementById('modalTaskDescription').value;
        task.priority = document.getElementById('modalTaskPriority').value;
        task.assignee = document.getElementById('modalTaskAssignee').value;
        task.dueDate = document.getElementById('modalTaskDueDate').value;
        task.updatedAt = new Date().toISOString();
        
        saveToStorage();
        updateStats();
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
        renderTasks();
        closeModal();
    }
}

// エクスポート機能
function exportToCSV() {
    const csvData = [
        ['タスク名', '説明', '優先度', '担当者', 'ステータス', '期限', '作成日'],
        ...tasks.map(task => [
            task.title,
            task.description || '',
            getPriorityText(task.priority),
            task.assignee || 'なし',
            getStatusText(task.status),
            task.dueDate || 'なし',
            new Date(task.createdAt).toLocaleDateString()
        ])
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kanban-tasks.csv';
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
    a.download = 'kanban-tasks.json';
    a.click();
    URL.revokeObjectURL(url);
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

function getStatusText(status) {
    const statuses = {
        'todo': 'ToDo',
        'inprogress': '進行中',
        'review': 'レビュー',
        'done': '完了'
    };
    return statuses[status] || status;
}

function isOverdue(dueDate) {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
}

// データの保存と読み込み
function saveToStorage() {
    localStorage.setItem('kanbanBoard_tasks', JSON.stringify(tasks));
    localStorage.setItem('kanbanBoard_counter', JSON.stringify(taskIdCounter));
}

function loadFromStorage() {
    const storedTasks = localStorage.getItem('kanbanBoard_tasks');
    const storedCounter = localStorage.getItem('kanbanBoard_counter');
    
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
    
    if (storedCounter) {
        taskIdCounter = JSON.parse(storedCounter);
    }
}