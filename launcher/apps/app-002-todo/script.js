// Todo List App JavaScript
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.nextId = 1;
        
        // DOM elements
        this.todoForm = document.getElementById('todo-form');
        this.todoInput = document.getElementById('todo-input');
        this.todoList = document.getElementById('todo-list');
        this.taskCount = document.getElementById('task-count');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clear-completed');
        
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.render();
    }
    
    bindEvents() {
        // Form submission
        this.todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });
        
        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // Clear completed button
        this.clearCompletedBtn.addEventListener('click', () => {
            this.clearCompleted();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'a':
                        e.preventDefault();
                        this.setFilter('all');
                        break;
                    case 'f':
                        e.preventDefault();
                        this.todoInput.focus();
                        break;
                }
            }
        });
    }
    
    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;
        
        const todo = {
            id: this.nextId++,
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.push(todo);
        this.todoInput.value = '';
        this.saveToStorage();
        this.render();
        
        // Focus back to input for continuous adding
        this.todoInput.focus();
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToStorage();
        this.render();
    }
    
    editTodo(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
            this.saveToStorage();
            this.render();
        }
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.render();
    }
    
    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveToStorage();
        this.render();
    }
    
    getFilteredTodos() {
        switch(this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }
    
    updateTaskCount() {
        const activeTasks = this.todos.filter(t => !t.completed).length;
        const completedTasks = this.todos.filter(t => t.completed).length;
        
        let countText = '';
        if (activeTasks === 0 && completedTasks === 0) {
            countText = 'No tasks';
        } else if (activeTasks === 0) {
            countText = 'All tasks completed!';
        } else if (activeTasks === 1) {
            countText = '1 task remaining';
        } else {
            countText = `${activeTasks} tasks remaining`;
        }
        
        this.taskCount.textContent = countText;
        
        // Update clear completed button state
        this.clearCompletedBtn.disabled = completedTasks === 0;
    }
    
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;
        
        li.innerHTML = `
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                 onclick="app.toggleTodo(${todo.id})">
            </div>
            <span class="todo-text" ondblclick="app.startEdit(${todo.id})">${this.escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="edit-btn" onclick="app.startEdit(${todo.id})" title="Edit task">
                    Edit
                </button>
                <button class="delete-btn" onclick="app.deleteTodo(${todo.id})" title="Delete task">
                    Delete
                </button>
            </div>
        `;
        
        return li;
    }
    
    startEdit(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;
        
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        const textElement = todoElement.querySelector('.todo-text');
        
        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.value = todo.text;
        input.className = 'edit-input';
        input.style.cssText = `
            flex: 1;
            padding: 0.5rem;
            border: 2px solid #667eea;
            border-radius: 4px;
            font-size: 1rem;
            outline: none;
        `;
        
        // Replace text with input
        textElement.replaceWith(input);
        input.focus();
        input.select();
        
        // Save on Enter or blur
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== todo.text) {
                this.editTodo(id, newText);
            } else {
                this.render(); // Revert if no change or empty
            }
        };
        
        // Cancel on Escape
        const cancelEdit = () => {
            this.render();
        };
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
    }
    
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Clear existing todos
        this.todoList.innerHTML = '';
        
        if (filteredTodos.length === 0) {
            this.renderEmptyState();
        } else {
            filteredTodos.forEach(todo => {
                const todoElement = this.createTodoElement(todo);
                this.todoList.appendChild(todoElement);
            });
        }
        
        this.updateTaskCount();
    }
    
    renderEmptyState() {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        
        let message = '';
        switch(this.currentFilter) {
            case 'active':
                message = this.todos.length === 0 
                    ? '<h3>No tasks yet</h3><p>Add your first task above!</p>'
                    : '<h3>No active tasks</h3><p>Great job! All tasks are completed.</p>';
                break;
            case 'completed':
                message = '<h3>No completed tasks</h3><p>Complete some tasks to see them here.</p>';
                break;
            default:
                message = '<h3>No tasks yet</h3><p>Add your first task above to get started!</p>';
        }
        
        emptyState.innerHTML = message;
        this.todoList.appendChild(emptyState);
    }
    
    saveToStorage() {
        try {
            const data = {
                todos: this.todos,
                nextId: this.nextId
            };
            localStorage.setItem('todoApp', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }
    
    loadFromStorage() {
        try {
            const data = localStorage.getItem('todoApp');
            if (data) {
                const parsed = JSON.parse(data);
                this.todos = parsed.todos || [];
                this.nextId = parsed.nextId || 1;
                
                // Ensure all todos have required properties
                this.todos = this.todos.map(todo => ({
                    id: todo.id || Date.now(),
                    text: todo.text || '',
                    completed: Boolean(todo.completed),
                    createdAt: todo.createdAt || new Date().toISOString()
                }));
                
                // Update nextId to avoid conflicts
                if (this.todos.length > 0) {
                    this.nextId = Math.max(...this.todos.map(t => t.id)) + 1;
                }
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            this.todos = [];
            this.nextId = 1;
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Export data for backup
    exportData() {
        const data = {
            todos: this.todos,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    // Import data from backup
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.todos && Array.isArray(data.todos)) {
                    this.todos = data.todos;
                    this.nextId = Math.max(...this.todos.map(t => t.id)) + 1;
                    this.saveToStorage();
                    this.render();
                    alert('Data imported successfully!');
                } else {
                    alert('Invalid backup file format.');
                }
            } catch (error) {
                alert('Failed to import data: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});

// Add some helpful keyboard shortcuts info
document.addEventListener('keydown', (e) => {
    if (e.key === 'F1') {
        e.preventDefault();
        alert(`Todo List Keyboard Shortcuts:
        
• Enter: Add new task
• Double-click: Edit task
• Ctrl/Cmd + A: Show all tasks
• Ctrl/Cmd + F: Focus input
• Escape: Cancel edit
• F1: Show this help

Tips:
• Double-click any task to edit it
• Use filters to organize your view
• Your data is automatically saved locally`);
    }
});

// Handle browser back/forward for filters
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.filter) {
        app.setFilter(e.state.filter);
    }
});

// Add visual feedback for actions
document.addEventListener('click', (e) => {
    // Add ripple effect for buttons
    if (e.target.matches('button')) {
        const button = e.target;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});

// Add CSS animation for ripple effect
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);