class ExpenseTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('expense-transactions') || '[]');
        this.categories = {
            expense: [
                { name: '食費', icon: '🍕' },
                { name: '交通費', icon: '🚗' },
                { name: '光熱費', icon: '⚡' },
                { name: '家賃', icon: '🏠' },
                { name: '娯楽', icon: '🎮' },
                { name: '医療', icon: '🏥' },
                { name: '衣服', icon: '👕' },
                { name: '教育', icon: '📚' },
                { name: 'その他', icon: '📦' }
            ],
            income: [
                { name: '給料', icon: '💼' },
                { name: 'ボーナス', icon: '🎁' },
                { name: '副業', icon: '💻' },
                { name: '投資', icon: '📈' },
                { name: 'その他', icon: '💰' }
            ]
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadCategories();
        this.updateSummary();
        this.renderTransactions();
        this.renderCharts();
        this.setDefaultDate();
    }
    
    initializeElements() {
        this.form = document.getElementById('transaction-form');
        this.typeSelect = document.getElementById('transaction-type');
        this.amountInput = document.getElementById('transaction-amount');
        this.categorySelect = document.getElementById('transaction-category');
        this.dateInput = document.getElementById('transaction-date');
        this.descriptionInput = document.getElementById('transaction-description');
        
        this.totalIncomeEl = document.getElementById('total-income');
        this.totalExpenseEl = document.getElementById('total-expense');
        this.balanceEl = document.getElementById('balance');
        
        this.transactionsList = document.getElementById('transactions-list');
        this.emptyState = document.getElementById('empty-state');
        
        this.filterType = document.getElementById('filter-type');
        this.filterCategory = document.getElementById('filter-category');
        this.filterMonth = document.getElementById('filter-month');
        
        this.exportBtn = document.getElementById('export-btn');
        this.importBtn = document.getElementById('import-btn');
        
        this.categoryChart = document.getElementById('category-chart');
        this.monthlyChart = document.getElementById('monthly-chart');
    }
    
    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.typeSelect.addEventListener('change', () => this.loadCategories());
        
        this.filterType.addEventListener('change', () => this.renderTransactions());
        this.filterCategory.addEventListener('change', () => this.renderTransactions());
        this.filterMonth.addEventListener('change', () => this.renderTransactions());
        
        this.exportBtn.addEventListener('click', () => this.exportData());
        this.importBtn.addEventListener('click', () => this.importData());
    }
    
    setDefaultDate() {
        const today = new Date();
        this.dateInput.value = today.toISOString().split('T')[0];
    }
    
    loadCategories() {
        const type = this.typeSelect.value;
        const categories = this.categories[type];
        
        this.categorySelect.innerHTML = '<option value="">カテゴリを選択</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = `${category.icon} ${category.name}`;
            this.categorySelect.appendChild(option);
        });
        
        this.loadFilterCategories();
    }
    
    loadFilterCategories() {
        const allCategories = [...this.categories.expense, ...this.categories.income];
        this.filterCategory.innerHTML = '<option value="all">すべてのカテゴリ</option>';
        
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = `${category.icon} ${category.name}`;
            this.filterCategory.appendChild(option);
        });
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const transaction = {
            id: Date.now(),
            type: this.typeSelect.value,
            amount: parseFloat(this.amountInput.value),
            category: this.categorySelect.value,
            date: this.dateInput.value,
            description: this.descriptionInput.value.trim(),
            createdAt: new Date().toISOString()
        };
        
        this.transactions.push(transaction);
        this.saveTransactions();
        this.updateSummary();
        this.renderTransactions();
        this.renderCharts();
        this.form.reset();
        this.setDefaultDate();
        
        this.showSuccessMessage('取引が追加されました');
    }
    
    deleteTransaction(id) {
        if (confirm('この取引を削除しますか？')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions();
            this.updateSummary();
            this.renderTransactions();
            this.renderCharts();
            this.showSuccessMessage('取引が削除されました');
        }
    }
    
    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (transaction) {
            this.typeSelect.value = transaction.type;
            this.loadCategories();
            this.amountInput.value = transaction.amount;
            this.categorySelect.value = transaction.category;
            this.dateInput.value = transaction.date;
            this.descriptionInput.value = transaction.description;
            
            // 編集モードに切り替え
            this.deleteTransaction(id);
        }
    }
    
    saveTransactions() {
        localStorage.setItem('expense-transactions', JSON.stringify(this.transactions));
    }
    
    updateSummary() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpense = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = totalIncome - totalExpense;
        
        this.totalIncomeEl.textContent = this.formatCurrency(totalIncome);
        this.totalExpenseEl.textContent = this.formatCurrency(totalExpense);
        this.balanceEl.textContent = this.formatCurrency(balance);
        
        // 残高の色を変更
        if (balance >= 0) {
            this.balanceEl.style.color = '#4caf50';
        } else {
            this.balanceEl.style.color = '#f44336';
        }
    }
    
    renderTransactions() {
        const filteredTransactions = this.getFilteredTransactions();
        
        if (filteredTransactions.length === 0) {
            this.transactionsList.style.display = 'none';
            this.emptyState.style.display = 'block';
            return;
        }
        
        this.transactionsList.style.display = 'block';
        this.emptyState.style.display = 'none';
        
        this.transactionsList.innerHTML = '';
        
        filteredTransactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(transaction => {
                const item = this.createTransactionItem(transaction);
                this.transactionsList.appendChild(item);
            });
    }
    
    createTransactionItem(transaction) {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        const category = this.getCategoryInfo(transaction.category);
        const formattedDate = new Date(transaction.date).toLocaleDateString('ja-JP');
        
        item.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon">${category.icon}</div>
                <div class="transaction-details">
                    <h4>${transaction.description || transaction.category}</h4>
                    <p>${formattedDate} • ${transaction.category}</p>
                </div>
            </div>
            <div class="transaction-right">
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </div>
                <div class="transaction-actions">
                    <button class="action-btn edit-btn" onclick="expenseTracker.editTransaction(${transaction.id})" title="編集">✏️</button>
                    <button class="action-btn delete-btn" onclick="expenseTracker.deleteTransaction(${transaction.id})" title="削除">🗑️</button>
                </div>
            </div>
        `;
        
        return item;
    }
    
    getFilteredTransactions() {
        let filtered = [...this.transactions];
        
        if (this.filterType.value !== 'all') {
            filtered = filtered.filter(t => t.type === this.filterType.value);
        }
        
        if (this.filterCategory.value !== 'all') {
            filtered = filtered.filter(t => t.category === this.filterCategory.value);
        }
        
        if (this.filterMonth.value) {
            const selectedMonth = this.filterMonth.value;
            filtered = filtered.filter(t => t.date.startsWith(selectedMonth));
        }
        
        return filtered;
    }
    
    getCategoryInfo(categoryName) {
        const allCategories = [...this.categories.expense, ...this.categories.income];
        return allCategories.find(cat => cat.name === categoryName) || { icon: '📦' };
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY'
        }).format(amount);
    }
    
    renderCharts() {
        this.renderCategoryChart();
        this.renderMonthlyChart();
    }
    
    renderCategoryChart() {
        const ctx = this.categoryChart.getContext('2d');
        const expenseTransactions = this.transactions.filter(t => t.type === 'expense');
        
        const categoryData = {};
        expenseTransactions.forEach(transaction => {
            if (categoryData[transaction.category]) {
                categoryData[transaction.category] += transaction.amount;
            } else {
                categoryData[transaction.category] = transaction.amount;
            }
        });
        
        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);
        const colors = this.generateColors(labels.length);
        
        // 簡単な円グラフを描画
        this.drawPieChart(ctx, labels, data, colors);
    }
    
    renderMonthlyChart() {
        const ctx = this.monthlyChart.getContext('2d');
        const monthlyData = this.getMonthlyData();
        
        // 簡単な棒グラフを描画
        this.drawBarChart(ctx, monthlyData);
    }
    
    getMonthlyData() {
        const monthlyIncome = {};
        const monthlyExpense = {};
        
        this.transactions.forEach(transaction => {
            const month = transaction.date.substring(0, 7); // YYYY-MM
            
            if (transaction.type === 'income') {
                monthlyIncome[month] = (monthlyIncome[month] || 0) + transaction.amount;
            } else {
                monthlyExpense[month] = (monthlyExpense[month] || 0) + transaction.amount;
            }
        });
        
        // 過去6ヶ月のデータを生成
        const months = [];
        const income = [];
        const expense = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().substring(0, 7);
            
            months.push(date.toLocaleDateString('ja-JP', { month: 'short' }));
            income.push(monthlyIncome[monthKey] || 0);
            expense.push(monthlyExpense[monthKey] || 0);
        }
        
        return { months, income, expense };
    }
    
    drawPieChart(ctx, labels, data, colors) {
        const canvas = ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const total = data.reduce((sum, value) => sum + value, 0);
        let currentAngle = 0;
        
        data.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = colors[index];
            ctx.fill();
            
            // ラベルを描画
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(labels[index], labelX, labelY);
            
            currentAngle += sliceAngle;
        });
    }
    
    drawBarChart(ctx, data) {
        const canvas = ctx.canvas;
        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const maxValue = Math.max(...data.income, ...data.expense);
        const barWidth = chartWidth / data.months.length / 2 - 5;
        
        data.months.forEach((month, index) => {
            const x = padding + (index * chartWidth / data.months.length);
            
            // 収入バー
            const incomeHeight = (data.income[index] / maxValue) * chartHeight;
            ctx.fillStyle = '#4caf50';
            ctx.fillRect(x, padding + chartHeight - incomeHeight, barWidth, incomeHeight);
            
            // 支出バー
            const expenseHeight = (data.expense[index] / maxValue) * chartHeight;
            ctx.fillStyle = '#f44336';
            ctx.fillRect(x + barWidth + 5, padding + chartHeight - expenseHeight, barWidth, expenseHeight);
            
            // 月ラベル
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(month, x + barWidth, canvas.height - 10);
        });
    }
    
    generateColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = (i * 360 / count) % 360;
            colors.push(`hsl(${hue}, 70%, 60%)`);
        }
        return colors;
    }
    
    exportData() {
        const dataStr = JSON.stringify(this.transactions, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `expense-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showSuccessMessage('データをエクスポートしました');
    }
    
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (Array.isArray(data)) {
                            this.transactions = data;
                            this.saveTransactions();
                            this.updateSummary();
                            this.renderTransactions();
                            this.renderCharts();
                            this.showSuccessMessage('データをインポートしました');
                        } else {
                            this.showErrorMessage('無効なデータ形式です');
                        }
                    } catch (error) {
                        this.showErrorMessage('ファイルの読み込みに失敗しました');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }
    
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }
    
    showMessage(message, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `${type}-message`;
        messageEl.textContent = message;
        
        this.form.insertBefore(messageEl, this.form.firstChild);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}

// Initialize the expense tracker when the page loads
let expenseTracker;
document.addEventListener('DOMContentLoaded', () => {
    expenseTracker = new ExpenseTracker();
});