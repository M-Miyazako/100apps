class ShoppingList {
    constructor() {
        this.items = [];
        this.categories = ['食品', '日用品', '衣類', '電子機器', 'その他'];
        this.quickAddItems = {
            '食品': ['牛乳', 'パン', '卵', 'お米', '野菜', '肉', '魚'],
            '日用品': ['洗剤', 'シャンプー', 'トイレットペーパー', '歯ブラシ', '石鹸'],
            '衣類': ['シャツ', 'ズボン', '靴下', '下着', '靴'],
            '電子機器': ['充電器', 'イヤホン', '電池', 'USBケーブル'],
            'その他': ['薬', '本', '文房具', 'プレゼント']
        };
        
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
        // 追加ボタン
        this.elements.addBtn.addEventListener('click', () => this.addItem());
        this.elements.itemInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addItem();
        });
        
        // クイック追加ボタン
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.dataset.item;
                const category = e.target.dataset.category;
                this.elements.itemInput.value = item;
                this.elements.categorySelect.value = category;
                this.addItem();
            });
        });
        
        // フィルターとソート
        this.elements.categoryFilter.addEventListener('change', () => this.renderList());
        this.elements.sortBy.addEventListener('change', () => this.renderList());
        this.elements.showCompleted.addEventListener('change', () => this.renderList());
        
        // クリアボタン
        this.elements.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.elements.clearAllBtn.addEventListener('click', () => this.clearAll());
        
        // 入力検証
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
            alert('商品名を入力してください');
            return;
        }
        
        // 重複チェック
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
                addedAt: new Date().toISOString(),
                completedAt: null
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
    }
    
    renderList() {
        const filteredItems = this.getFilteredItems();
        const sortedItems = this.getSortedItems(filteredItems);
        
        if (sortedItems.length === 0) {
            this.elements.shoppingList.style.display = 'none';
            this.elements.emptyState.style.display = 'block';
        } else {
            this.elements.shoppingList.style.display = 'block';
            this.elements.emptyState.style.display = 'none';
        }
        
        this.elements.shoppingList.innerHTML = sortedItems
            .map(item => this.createItemHTML(item))
            .join('');
        
        // イベントバインド
        this.bindItemEvents();
    }
    
    getFilteredItems() {
        let filtered = this.items;
        
        // カテゴリフィルター
        const categoryFilter = this.elements.categoryFilter.value;
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(item => item.category === categoryFilter);
        }
        
        // 完了済みアイテムの表示/非表示
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
                <input type="checkbox" class="item-checkbox" 
                    ${item.completed ? 'checked' : ''}
                    data-id="${item.id}"
                >
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-meta">
                        <span class="item-category">${item.category}</span>
                        <span class="item-quantity">×${item.quantity}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" data-id="${item.id}">編集</button>
                    <button class="delete-btn" data-id="${item.id}">削除</button>
                </div>
            </div>
        `;
    }
    
    bindItemEvents() {
        // チェックボックス
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.toggleComplete(id);
            });
        });
        
        // 編集ボタン
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.editItem(id);
            });
        });
        
        // 削除ボタン
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
            item.completedAt = item.completed ? new Date().toISOString() : null;
            
            this.saveData();
            this.renderList();
            this.updateStats();
            this.updateCategorySummary();
        }
    }
    
    editItem(id) {
        const item = this.items.find(item => item.id === id);
        if (!item) return;
        
        const newName = prompt('商品名を編集:', item.name);
        if (newName && newName.trim()) {
            item.name = newName.trim();
            
            const newQuantity = prompt('数量を編集:', item.quantity);
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
        if (confirm('このアイテムを削除しますか？')) {
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
            alert('完了済みのアイテムがありません');
            return;
        }
        
        if (confirm(`${completedCount}個の完了済みアイテムを削除しますか？`)) {
            this.items = this.items.filter(item => !item.completed);
            this.saveData();
            this.renderList();
            this.updateStats();
            this.updateCategorySummary();
        }
    }
    
    clearAll() {
        if (this.items.length === 0) {
            alert('削除するアイテムがありません');
            return;
        }
        
        if (confirm('すべてのアイテムを削除しますか？')) {
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
        
        const categories = Object.keys(categoryCounts).sort();
        
        if (categories.length === 0) {
            this.elements.categorySummary.innerHTML = '<p style="text-align: center; color: #999;">カテゴリ別の統計がありません</p>';
            return;
        }
        
        this.elements.categorySummary.innerHTML = categories
            .map(category => `
                <div class="category-stat">
                    <div class="category-name">${category}</div>
                    <div class="category-count">${categoryCounts[category]}個</div>
                </div>
            `)
            .join('');
    }
    
    saveData() {
        try {
            localStorage.setItem('shoppingListData', JSON.stringify(this.items));
        } catch (error) {
            console.error('データの保存に失敗しました:', error);
            alert('データの保存に失敗しました');
        }
    }
    
    loadData() {
        try {
            const saved = localStorage.getItem('shoppingListData');
            if (saved) {
                this.items = JSON.parse(saved);
            }
        } catch (error) {
            console.error('データの読み込みに失敗しました:', error);
            alert('データの読み込みに失敗しました');
        }
    }
    
    exportData() {
        const data = {
            items: this.items,
            exported: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shopping-list-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// アプリ初期化
document.addEventListener('DOMContentLoaded', () => {
    new ShoppingList();
});