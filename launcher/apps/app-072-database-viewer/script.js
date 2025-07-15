class DatabaseViewer {
    constructor() {
        this.isConnected = false;
        this.currentDatabase = null;
        this.sampleData = this.generateSampleData();
        this.queryHistory = JSON.parse(localStorage.getItem('db_query_history')) || [];
        this.currentResults = null;
        this.stats = {
            totalTables: 0,
            totalRows: 0,
            queriesExecuted: this.queryHistory.length,
            queryTimes: []
        };

        this.initializeEventListeners();
        this.updateConnectionFields();
        this.renderQueryHistory();
        this.updateStats();
    }

    initializeEventListeners() {
        // Connection form
        document.getElementById('connectionForm').addEventListener('submit', (e) => this.handleConnection(e));
        document.getElementById('dbType').addEventListener('change', () => this.updateConnectionFields());

        // Query execution
        document.getElementById('executeBtn').addEventListener('click', () => this.executeQuery());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearQuery());
        document.getElementById('queryInput').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.executeQuery();
            }
        });

        // Export buttons
        document.getElementById('exportCSV').addEventListener('click', () => this.exportResults('csv'));
        document.getElementById('exportJSON').addEventListener('click', () => this.exportResults('json'));

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    }

    generateSampleData() {
        return {
            users: {
                schema: [
                    { name: 'id', type: 'INT PRIMARY KEY' },
                    { name: 'name', type: 'VARCHAR(100)' },
                    { name: 'email', type: 'VARCHAR(255)' },
                    { name: 'age', type: 'INT' },
                    { name: 'created_at', type: 'DATETIME' }
                ],
                data: [
                    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, created_at: '2024-01-15 10:30:00' },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, created_at: '2024-01-16 14:20:00' },
                    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, created_at: '2024-01-17 09:15:00' },
                    { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 28, created_at: '2024-01-18 16:45:00' },
                    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', age: 42, created_at: '2024-01-19 11:30:00' }
                ]
            },
            products: {
                schema: [
                    { name: 'id', type: 'INT PRIMARY KEY' },
                    { name: 'name', type: 'VARCHAR(200)' },
                    { name: 'price', type: 'DECIMAL(10,2)' },
                    { name: 'category', type: 'VARCHAR(100)' },
                    { name: 'stock', type: 'INT' }
                ],
                data: [
                    { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics', stock: 50 },
                    { id: 2, name: 'Mouse', price: 29.99, category: 'Electronics', stock: 200 },
                    { id: 3, name: 'Keyboard', price: 79.99, category: 'Electronics', stock: 150 },
                    { id: 4, name: 'Monitor', price: 299.99, category: 'Electronics', stock: 75 },
                    { id: 5, name: 'Desk Chair', price: 199.99, category: 'Furniture', stock: 30 }
                ]
            },
            orders: {
                schema: [
                    { name: 'id', type: 'INT PRIMARY KEY' },
                    { name: 'user_id', type: 'INT' },
                    { name: 'product_id', type: 'INT' },
                    { name: 'quantity', type: 'INT' },
                    { name: 'total', type: 'DECIMAL(10,2)' },
                    { name: 'order_date', type: 'DATETIME' }
                ],
                data: [
                    { id: 1, user_id: 1, product_id: 1, quantity: 1, total: 999.99, order_date: '2024-01-20 14:30:00' },
                    { id: 2, user_id: 2, product_id: 2, quantity: 2, total: 59.98, order_date: '2024-01-21 10:15:00' },
                    { id: 3, user_id: 3, product_id: 4, quantity: 1, total: 299.99, order_date: '2024-01-22 16:45:00' },
                    { id: 4, user_id: 1, product_id: 3, quantity: 1, total: 79.99, order_date: '2024-01-23 09:20:00' },
                    { id: 5, user_id: 4, product_id: 5, quantity: 1, total: 199.99, order_date: '2024-01-24 13:10:00' }
                ]
            }
        };
    }

    updateConnectionFields() {
        const dbType = document.getElementById('dbType').value;
        const fields = document.querySelectorAll('.connection-fields');
        
        if (dbType === 'sample') {
            fields.forEach(field => field.style.display = 'none');
        } else {
            fields.forEach(field => field.style.display = 'flex');
            
            // Update default ports
            const portField = document.getElementById('port');
            switch (dbType) {
                case 'mysql':
                    portField.value = '3306';
                    break;
                case 'postgresql':
                    portField.value = '5432';
                    break;
                case 'mongodb':
                    portField.value = '27017';
                    break;
                default:
                    portField.value = '';
            }
        }
    }

    handleConnection(e) {
        e.preventDefault();
        const dbType = document.getElementById('dbType').value;
        
        if (dbType === 'sample') {
            this.connectToSampleData();
        } else {
            this.connectToRealDatabase();
        }
    }

    connectToSampleData() {
        this.isConnected = true;
        this.currentDatabase = 'sample';
        this.updateConnectionStatus(true, 'サンプルデータに接続しました');
        this.loadTables(Object.keys(this.sampleData));
        this.updateStats();
        this.showMessage('サンプルデータベースに正常に接続しました！', 'success');
    }

    connectToRealDatabase() {
        // Simulate connection (in real app, this would make actual API calls)
        const host = document.getElementById('host').value;
        const database = document.getElementById('database').value;
        
        if (!host || !database) {
            this.showMessage('すべての必須フィールドを入力してください', 'error');
            return;
        }

        // Simulate connection delay
        document.getElementById('connectBtn').textContent = '接続中...';
        document.getElementById('connectBtn').disabled = true;

        setTimeout(() => {
            // Simulate connection failure for demo
            this.showMessage('接続に失敗しました：これはデモ版です。機能を探索するには「サンプルデータ」を使用してください。', 'error');
            document.getElementById('connectBtn').textContent = '接続';
            document.getElementById('connectBtn').disabled = false;
        }, 2000);
    }

    updateConnectionStatus(connected, message) {
        const indicator = document.getElementById('statusIndicator');
        const status = document.getElementById('connectionStatus');
        
        indicator.classList.toggle('connected', connected);
        status.textContent = message;
        this.isConnected = connected;
    }

    loadTables(tables) {
        const tablesList = document.getElementById('tablesList');
        tablesList.innerHTML = tables.map(table => `
            <div class="table-item" onclick="dbViewer.selectTable('${table}')">
                📄 ${table}
            </div>
        `).join('');

        this.stats.totalTables = tables.length;
        this.stats.totalRows = Object.values(this.sampleData).reduce((sum, table) => sum + table.data.length, 0);
        this.updateStats();
    }

    selectTable(tableName) {
        // Update active table
        document.querySelectorAll('.table-item').forEach(item => {
            item.classList.remove('active');
        });
        event.target.classList.add('active');

        // Auto-fill query
        document.getElementById('queryInput').value = `SELECT * FROM ${tableName}`;
        
        // Auto-execute for demo
        this.executeQuery();
    }

    loadSampleData(tableName) {
        if (!this.isConnected) {
            this.connectToSampleData();
        }
        
        setTimeout(() => {
            this.selectTable(tableName);
        }, 500);
    }

    executeQuery() {
        if (!this.isConnected) {
            this.showMessage('最初にデータベースに接続してください', 'error');
            return;
        }

        const query = document.getElementById('queryInput').value.trim();
        if (!query) {
            this.showMessage('クエリを入力してください', 'error');
            return;
        }

        const startTime = Date.now();
        
        try {
            const results = this.processQuery(query);
            const queryTime = Date.now() - startTime;
            
            this.currentResults = results;
            this.renderResults(results);
            this.addToHistory(query, queryTime);
            this.updateStats();
            
            this.showMessage(`クエリが正常に実行されました (${queryTime}ms)`, 'success');
        } catch (error) {
            this.showMessage(`クエリエラー: ${error.message}`, 'error');
        }
    }

    processQuery(query) {
        // Simple query parser for demo purposes
        const normalizedQuery = query.toLowerCase().trim();
        
        if (normalizedQuery.startsWith('select')) {
            return this.processSelectQuery(query);
        } else {
            throw new Error('デモモードではSELECTクエリのみサポートされています');
        }
    }

    processSelectQuery(query) {
        const normalizedQuery = query.toLowerCase();
        
        // Extract table name (very basic parsing)
        const fromMatch = normalizedQuery.match(/from\s+(\w+)/);
        if (!fromMatch) {
            throw new Error('無効なSELECTクエリ: FROM句がありません');
        }

        const tableName = fromMatch[1];
        if (!this.sampleData[tableName]) {
            throw new Error(`テーブル '${tableName}' が見つかりません`);
        }

        const table = this.sampleData[tableName];
        
        // For demo, just return all data
        return {
            columns: table.schema.map(col => col.name),
            rows: table.data,
            rowCount: table.data.length
        };
    }

    renderResults(results) {
        const container = document.getElementById('resultsContainer');
        
        if (!results || !results.rows || results.rows.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: #666; padding: 40px;">
                    <h3>結果なし</h3>
                    <p>クエリは結果を返しませんでした</p>
                </div>
            `;
            return;
        }

        const table = document.createElement('div');
        table.className = 'table-container';
        
        table.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        ${results.columns.map(col => `<th>${col}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${results.rows.map(row => `
                        <tr>
                            ${results.columns.map(col => {
                                const value = row[col];
                                const cellClass = this.getCellClass(value);
                                return `<td class="${cellClass}">${this.formatCellValue(value)}</td>`;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = `
            <div style="margin-bottom: 15px; color: #666; font-size: 14px;">
                クエリが${results.rowCount}行を返しました
            </div>
        `;
        container.appendChild(table);
    }

    getCellClass(value) {
        if (value === null || value === undefined) {
            return 'null';
        } else if (typeof value === 'number') {
            return 'number';
        }
        return '';
    }

    formatCellValue(value) {
        if (value === null || value === undefined) {
            return 'NULL';
        }
        return String(value);
    }

    clearQuery() {
        document.getElementById('queryInput').value = '';
    }

    addToHistory(query, queryTime) {
        const historyItem = {
            query: query,
            timestamp: new Date().toISOString(),
            executionTime: queryTime
        };

        this.queryHistory.unshift(historyItem);
        
        // Keep only last 50 queries
        if (this.queryHistory.length > 50) {
            this.queryHistory = this.queryHistory.slice(0, 50);
        }

        localStorage.setItem('db_query_history', JSON.stringify(this.queryHistory));
        this.renderQueryHistory();
        
        this.stats.queriesExecuted++;
        this.stats.queryTimes.push(queryTime);
        this.updateStats();
    }

    renderQueryHistory() {
        const container = document.getElementById('queryHistory');
        
        if (this.queryHistory.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: #666; padding: 40px;">
                    <h3>クエリ履歴</h3>
                    <p>実行されたクエリがここに表示されます</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.queryHistory.map(item => `
            <div class="history-item" onclick="dbViewer.loadHistoryQuery('${item.query.replace(/'/g, "\\'")}')">
                <div class="history-query">${item.query}</div>
                <div class="history-time">
                    ${new Date(item.timestamp).toLocaleString()} • ${item.executionTime}ms
                </div>
            </div>
        `).join('');
    }

    loadHistoryQuery(query) {
        document.getElementById('queryInput').value = query;
        this.switchTab('data');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(tabName + 'Tab').classList.remove('hidden');

        // Load content based on tab
        if (tabName === 'schema') {
            this.renderSchema();
        } else if (tabName === 'stats') {
            this.updateStats();
        }
    }

    renderSchema() {
        const container = document.getElementById('schemaView');
        
        if (!this.isConnected) {
            container.innerHTML = `
                <div style="text-align: center; color: #666; padding: 40px;">
                    <h3>データベーススキーマ</h3>
                    <p>データベースに接続してテーブルスキーマを表示します</p>
                </div>
            `;
            return;
        }

        container.innerHTML = Object.entries(this.sampleData).map(([tableName, table]) => `
            <div class="table-schema">
                <h4>📄 ${tableName}</h4>
                <div class="column-list">
                    ${table.schema.map(column => `
                        <div class="column-item">
                            <span class="column-name">${column.name}</span>
                            <span class="column-type">${column.type}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        document.getElementById('totalTables').textContent = this.stats.totalTables;
        document.getElementById('totalRows').textContent = this.stats.totalRows;
        document.getElementById('queriesExecuted').textContent = this.stats.queriesExecuted;
        
        const avgTime = this.stats.queryTimes.length > 0 
            ? Math.round(this.stats.queryTimes.reduce((a, b) => a + b, 0) / this.stats.queryTimes.length)
            : 0;
        document.getElementById('avgQueryTime').textContent = avgTime + 'ms';
    }

    exportResults(format) {
        if (!this.currentResults) {
            this.showMessage('エクスポートするデータがありません', 'error');
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        if (format === 'csv') {
            const csv = [
                this.currentResults.columns.join(','),
                ...this.currentResults.rows.map(row => 
                    this.currentResults.columns.map(col => 
                        JSON.stringify(row[col] || '')
                    ).join(',')
                )
            ].join('\n');
            
            this.downloadFile(csv, `query_results_${timestamp}.csv`, 'text/csv');
        } else if (format === 'json') {
            const json = JSON.stringify({
                columns: this.currentResults.columns,
                rows: this.currentResults.rows,
                exportDate: new Date().toISOString()
            }, null, 2);
            
            this.downloadFile(json, `query_results_${timestamp}.json`, 'application/json');
        }
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
        messageDiv.textContent = message;
        
        const container = document.getElementById('resultsContainer');
        container.insertBefore(messageDiv, container.firstChild);
        
        setTimeout(() => messageDiv.remove(), 5000);
    }
}

// Initialize the database viewer
const dbViewer = new DatabaseViewer();