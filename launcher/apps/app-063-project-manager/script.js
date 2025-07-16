// プロジェクト管理アプリの機能

let projects = [];
let tasks = [];
let selectedColor = '#667eea';
let projectIdCounter = 1;
let taskIdCounter = 1;

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    initializeEventListeners();
    updateStats();
    renderProjects();
    renderTasks();
});

// イベントリスナーの初期化
function initializeEventListeners() {
    // プロジェクトフォーム
    document.getElementById('projectForm').addEventListener('submit', handleProjectSubmit);
    
    // タスクフォーム
    document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
    
    // プロジェクト色選択
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedColor = this.dataset.color;
        });
    });
    
    // フィルターボタン
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filterType = this.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (this.closest('.projects-section')) {
                filterProjects(filterType);
            } else if (this.closest('.tasks-section')) {
                filterTasks(filterType);
            }
        });
    });
    
    // エクスポートボタン
    document.getElementById('exportCSV').addEventListener('click', exportToCSV);
    document.getElementById('exportJSON').addEventListener('click', exportToJSON);
}

// プロジェクト作成フォーム処理
function handleProjectSubmit(e) {
    e.preventDefault();
    
    const project = {
        id: projectIdCounter++,
        name: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        deadline: document.getElementById('projectDeadline').value,
        priority: document.getElementById('projectPriority').value,
        color: selectedColor,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    projects.push(project);
    saveToStorage();
    updateProjectDropdown();
    updateStats();
    renderProjects();
    
    // フォームをリセット
    document.getElementById('projectForm').reset();
}

// タスク作成フォーム処理
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const task = {
        id: taskIdCounter++,
        name: document.getElementById('taskName').value,
        projectId: document.getElementById('taskProject').value,
        assignee: document.getElementById('taskAssignee').value,
        dueDate: document.getElementById('taskDueDate').value,
        status: document.getElementById('taskStatus').value,
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

// プロジェクトドロップダウン更新
function updateProjectDropdown() {
    const select = document.getElementById('taskProject');
    select.innerHTML = '<option value="">プロジェクトを選択</option>';
    
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        select.appendChild(option);
    });
}

// 統計情報更新
function updateStats() {
    const totalProjects = projects.length;
    const activeTasksCount = tasks.filter(task => task.status !== 'completed').length;
    const completedTasksCount = tasks.filter(task => task.status === 'completed').length;
    const teamMembers = [...new Set(tasks.map(task => task.assignee).filter(Boolean))].length;
    
    document.getElementById('totalProjects').textContent = totalProjects;
    document.getElementById('activeTasks').textContent = activeTasksCount;
    document.getElementById('completedTasks').textContent = completedTasksCount;
    document.getElementById('teamMembers').textContent = teamMembers;
}

// プロジェクト描画
function renderProjects() {
    const container = document.getElementById('projectsList');
    
    if (projects.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h4>まだプロジェクトがありません</h4>
                <p>上のフォームから最初のプロジェクトを作成してください</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="project-item" data-project-id="${project.id}">
            <div class="project-title" style="color: ${project.color}">
                ${project.name}
            </div>
            <div class="project-description">${project.description || 'なし'}</div>
            <div class="project-meta">
                <span class="priority-badge priority-${project.priority}">${getPriorityText(project.priority)}</span>
                <span>期限: ${project.deadline ? new Date(project.deadline).toLocaleDateString() : 'なし'}</span>
                <span>作成: ${new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

// タスク描画
function renderTasks() {
    const container = document.getElementById('tasksList');
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h4>まだタスクがありません</h4>
                <p>上のフォームから最初のタスクを追加してください</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tasks.map(task => {
        const project = projects.find(p => p.id == task.projectId);
        const projectName = project ? project.name : 'プロジェクトなし';
        
        return `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-title">${task.name}</div>
                <div class="task-meta">
                    <span>プロジェクト: ${projectName}</span>
                    <span>担当者: ${task.assignee || 'なし'}</span>
                    <span>期限: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'なし'}</span>
                    <span class="status-badge status-${task.status}">${getStatusText(task.status)}</span>
                </div>
            </div>
        `;
    }).join('');
}

// フィルター機能
function filterProjects(filterType) {
    let filteredProjects = [...projects];
    
    switch (filterType) {
        case 'active':
            filteredProjects = projects.filter(p => p.status === 'active');
            break;
        case 'completed':
            filteredProjects = projects.filter(p => p.status === 'completed');
            break;
        case 'overdue':
            filteredProjects = projects.filter(p => 
                p.deadline && new Date(p.deadline) < new Date()
            );
            break;
    }
    
    renderFilteredProjects(filteredProjects);
}

function filterTasks(filterType) {
    let filteredTasks = [...tasks];
    
    switch (filterType) {
        case 'todo':
            filteredTasks = tasks.filter(t => t.status === 'todo');
            break;
        case 'inprogress':
            filteredTasks = tasks.filter(t => t.status === 'inprogress');
            break;
        case 'review':
            filteredTasks = tasks.filter(t => t.status === 'review');
            break;
        case 'completed':
            filteredTasks = tasks.filter(t => t.status === 'completed');
            break;
    }
    
    renderFilteredTasks(filteredTasks);
}

// フィルター済みプロジェクト描画
function renderFilteredProjects(filteredProjects) {
    const container = document.getElementById('projectsList');
    
    if (filteredProjects.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h4>該当するプロジェクトがありません</h4>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredProjects.map(project => `
        <div class="project-item" data-project-id="${project.id}">
            <div class="project-title" style="color: ${project.color}">
                ${project.name}
            </div>
            <div class="project-description">${project.description || 'なし'}</div>
            <div class="project-meta">
                <span class="priority-badge priority-${project.priority}">${getPriorityText(project.priority)}</span>
                <span>期限: ${project.deadline ? new Date(project.deadline).toLocaleDateString() : 'なし'}</span>
                <span>作成: ${new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

// フィルター済みタスク描画
function renderFilteredTasks(filteredTasks) {
    const container = document.getElementById('tasksList');
    
    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h4>該当するタスクがありません</h4>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTasks.map(task => {
        const project = projects.find(p => p.id == task.projectId);
        const projectName = project ? project.name : 'プロジェクトなし';
        
        return `
            <div class="task-item" data-task-id="${task.id}">
                <div class="task-title">${task.name}</div>
                <div class="task-meta">
                    <span>プロジェクト: ${projectName}</span>
                    <span>担当者: ${task.assignee || 'なし'}</span>
                    <span>期限: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'なし'}</span>
                    <span class="status-badge status-${task.status}">${getStatusText(task.status)}</span>
                </div>
            </div>
        `;
    }).join('');
}

// エクスポート機能
function exportToCSV() {
    const csvData = [
        ['プロジェクト名', 'タスク名', '担当者', 'ステータス', '期限', '作成日'],
        ...tasks.map(task => {
            const project = projects.find(p => p.id == task.projectId);
            return [
                project ? project.name : 'プロジェクトなし',
                task.name,
                task.assignee || 'なし',
                getStatusText(task.status),
                task.dueDate || 'なし',
                new Date(task.createdAt).toLocaleDateString()
            ];
        })
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function exportToJSON() {
    const data = {
        projects: projects,
        tasks: tasks,
        exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects.json';
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
        'completed': '完了'
    };
    return statuses[status] || status;
}

// データの保存と読み込み
function saveToStorage() {
    localStorage.setItem('projectManager_projects', JSON.stringify(projects));
    localStorage.setItem('projectManager_tasks', JSON.stringify(tasks));
    localStorage.setItem('projectManager_counters', JSON.stringify({
        projectIdCounter,
        taskIdCounter
    }));
}

function loadFromStorage() {
    const storedProjects = localStorage.getItem('projectManager_projects');
    const storedTasks = localStorage.getItem('projectManager_tasks');
    const storedCounters = localStorage.getItem('projectManager_counters');
    
    if (storedProjects) {
        projects = JSON.parse(storedProjects);
    }
    
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
    
    if (storedCounters) {
        const counters = JSON.parse(storedCounters);
        projectIdCounter = counters.projectIdCounter || 1;
        taskIdCounter = counters.taskIdCounter || 1;
    }
    
    updateProjectDropdown();
}