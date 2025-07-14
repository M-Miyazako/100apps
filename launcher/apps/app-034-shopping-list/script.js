class ShoppingList {
    constructor() {
        this.items = [];
        this.currentEditId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadData();
        this.renderList();
        this.updateStats();
        this.updateCategorySummary();
    }
    
    initializeElements() {
        this.elements = {
            itemInput: document.getElementById('itemInput'),
            categorySelect: document.getElementById('categorySelect'),
            quantityInput: document.getElementById('quantityInput'),
            addBtn: document.getElementById('addBtn'),
            categoryFilter: document.getElementById('categoryFilter'),
            sortBy: document.getElementById('sortBy'),
            showCompleted: document.getElementById('showCompleted'),
            clearCompletedBtn: document.getElementById('clearCompletedBtn'),
            clearAllBtn: document.getElementById('clearAllBtn'),
            shoppingList: document.getElementById('shoppingList'),
            emptyState: document.getElementById('emptyState'),
            totalItems: document.getElementById('totalItems'),
            completedItems: document.getElementById('completedItems'),
            categorySummary: document.getElementById('categorySummary')
        };
    }
    
    bindEvents() {
        // ¢¤Æàý 
        this.elements.addBtn.addEventListener('click', () => this.addItem());
        this.elements.itemInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addItem();
        });
        
        // ¯¤Ã¯ý Ü¿ó
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.dataset.item;
                const category = e.target.dataset.category;
                this.elements.itemInput.value = item;
                this.elements.categorySelect.value = category;
                this.addItem();
            });
        });
        
        // Õ£ë¿üû½üÈ
        this.elements.categoryFilter.addEventListener('change', () => this.renderList());
        this.elements.sortBy.addEventListener('change', () => this.renderList());
        this.elements.showCompleted.addEventListener('change', () => this.renderList());
        
        // ê¹È¢¯·çó
        this.elements.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.elements.clearAllBtn.addEventListener('click', () => this.clearAll());
        
        // e›ÐêÇü·çó
        this.elements.itemInput.addEventListener('input', () => this.validateInput());
    }
    
    validateInput() {
        const itemName = this.elements.itemInput.value.trim();
        this.elements.addBtn.disabled = !itemName;
    }
    
    addItem() {
        const itemName = this.elements.itemInput.value.trim();
        const category = this.elements.categorySelect.value;
        const quantity = parseInt(this.elements.quantityInput.value) || 1;
        
        if (!itemName) {
            alert('¢¤Æà’e›WfO`UD');
            return;
        }
        
        // ÍÁ§Ã¯
        const existingItem = this.items.find(item => 
            item.name.toLowerCase() === itemName.toLowerCase() && 
            item.category === category &&
            !item.completed
        );
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            const newItem = {
                id: Date.now(),
                name: itemName,
                category: category,
                quantity: quantity,
                completed: false,
                addedAt: new Date().toISOString()
            };
            this.items.push(newItem);
        }
        
        this.clearInputs();
        this.saveData();
        this.renderList();
        this.updateStats();
        this.updateCategorySummary();
    }
    
    clearInputs() {
        this.elements.itemInput.value = '';
        this.elements.quantityInput.value = '1';
        this.elements.itemInput.focus();
        this.validateInput();
    }
    
    renderList() {
        let filteredItems = this.getFilteredItems();
        filteredItems = this.getSortedItems(filteredItems);
        
        if (filteredItems.length === 0) {
            this.elements.shoppingList.style.display = 'none';
            this.elements.emptyState.style.display = 'block';
            return;
        }
        
        this.elements.shoppingList.style.display = 'block';
        this.elements.emptyState.style.display = 'none';
        
        this.elements.shoppingList.innerHTML = filteredItems
            .map(item => this.createItemHTML(item))
            .join('');
        
        // ¤ÙóÈê¹Êü’Ð¤óÉ
        this.bindItemEvents();
    }
    
    getFilteredItems() {
        let filtered = this.items;
        
        // «Æ´êüÕ£ë¿ü
        const categoryFilter = this.elements.categoryFilter.value;
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(item => item.category === categoryFilter);
        }
        
        // Œ†¢¤ÆàÕ£ë¿ü
        const showCompleted = this.elements.showCompleted.checked;
        if (!showCompleted) {
            filtered = filtered.filter(item => !item.completed);
        }
        
        return filtered;
    }
    
    getSortedItems(items) {
        const sortBy = this.elements.sortBy.value;
        
        return [...items].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'category':
                    return a.category.localeCompare(b.category);
                case 'quantity':
                    return b.quantity - a.quantity;
                case 'added':
                default:
                    return new Date(b.addedAt) - new Date(a.addedAt);
            }
        });
    }
    
    createItemHTML(item) {
        return `
            <div class="shopping-item ${item.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="item-checkbox" 
                    ${item.completed ? 'checked' : ''}
                    data-id="${item.id}"
                >
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-info">
                        <span class="item-category">${item.category}</span>
                        <span class="item-quantity">×${item.quantity}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="item-btn edit-btn" data-id="${item.id}">èÆ</button>
                    <button class="item-btn delete-btn" data-id="${item.id}">Jd</button>
                </div>
            </div>
        `;
    }
    
    bindItemEvents() {
        // Á§Ã¯ÜÃ¯¹
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.toggleComplete(id);
            });
        });
        
        // èÆÜ¿ó
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.editItem(id);
            });
        });
        
        // JdÜ¿ó
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.deleteItem(id);
            });
        });
    }
    
    toggleComplete(id) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.completed = !item.completed;
            this.saveData();
            this.renderList();
            this.updateStats();
            this.updateCategorySummary();
        }
    }
    
    editItem(id) {
        const item = this.items.find(item => item.id === id);
        if (!item) return;
        
        const newName = prompt('¢¤Æà’èÆ:', item.name);
        if (newName && newName.trim()) {
            item.name = newName.trim();
            
            const newQuantity = prompt('pÏ’èÆ:', item.quantity);
            if (newQuantity && !isNaN(newQuantity) && parseInt(newQuantity) > 0) {
                item.quantity = parseInt(newQuantity);
            }
            
            this.saveData();
            this.renderList();
            this.updateStats();
            this.updateCategorySummary();
        }
    }
    
    deleteItem(id) {
        if (confirm('Sn¢¤Æà’JdW~YK')) {
            this.items = this.items.filter(item => item.id !== id);
            this.saveData();
            this.renderList();
            this.updateStats();
            this.updateCategorySummary();
        }
    }
    
    clearCompleted() {
        const completedCount = this.items.filter(item => item.completed).length;
        if (completedCount === 0) {
            alert('üen¢¤ÆàLBŠ~[“');
            return;
        }
        
        if (confirm(`${completedCount}önüe¢¤Æà’JdW~YK`)) {
            this.items = this.items.filter(item => !item.completed);
            this.saveData();
            this.renderList();
            this.updateStats();
            this.updateCategorySummary();
        }
    }
    
    clearAll() {
        if (this.items.length === 0) {
            alert('ê¹ÈLzgY');
            return;
        }
        
        if (confirm('Yyfn¢¤Æà’JdW~YK')) {
            this.items = [];
            this.saveData();
            this.renderList();
            this.updateStats();
            this.updateCategorySummary();
        }
    }
    
    updateStats() {
        const totalItems = this.items.length;
        const completedItems = this.items.filter(item => item.completed).length;
        
        this.elements.totalItems.textContent = totalItems;
        this.elements.completedItems.textContent = completedItems;
    }
    
    updateCategorySummary() {
        const categoryCounts = {};
        
        this.items.forEach(item => {
            if (!item.completed) {
                categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
            }
        });
        
        const categories = Object.keys(categoryCounts);
        
        if (categories.length === 0) {
            this.elements.categorySummary.innerHTML = '<p style="text-align: center; color: #999;">¢¤ÆàLBŠ~[“</p>';
            return;
        }
        
        this.elements.categorySummary.innerHTML = categories
            .map(category => `
                <div class="category-item">
                    <div class="category-name">${category}</div>
                    <div class="category-count">${categoryCounts[category]}ö</div>
                </div>
            `)
            .join('');
    }
    
    saveData() {
        localStorage.setItem('shoppingListData', JSON.stringify(this.items));
    }
    
    loadData() {
        const savedData = localStorage.getItem('shoppingListData');
        if (savedData) {
            this.items = JSON.parse(savedData);
        }
    }
    
    exportData() {
        const dataStr = JSON.stringify(this.items, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `shopping-list-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedItems = JSON.parse(e.target.result);
                if (Array.isArray(importedItems)) {
                    this.items = importedItems;
                    this.saveData();
                    this.renderList();
                    this.updateStats();
                    this.updateCategorySummary();
                    alert('Çü¿n¤óÝüÈLŒ†W~W_');
                } else {
                    alert('!¹jÕ¡¤ëbgY');
                }
            } catch (error) {
                alert('Õ¡¤ën­¼k1WW~W_');
            }
        };
        reader.readAsText(file);
    }
}

// ¢×ê±ü·çó
document.addEventListener('DOMContentLoaded', () => {
    new ShoppingList();
});