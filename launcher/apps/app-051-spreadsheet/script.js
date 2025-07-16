class Spreadsheet {
    constructor() {
        this.data = {};
        this.formulas = {};
        this.selectedCell = null;
        this.rows = 30;
        this.cols = 15;
        this.history = [];
        this.historyIndex = -1;
        
        // Japanese localization
        this.messages = {
            confirmNew: "新しいスプレッドシートを作成しますか？現在の作業は失われます。",
            errorFormula: "#エラー",
            errorFile: "ファイルの読み込みエラーが発生しました。",
            cellReference: "セル参照",
            formulaResult: "計算結果",
            exportSuccess: "スプレッドシートが正常にエクスポートされました。",
            noData: "データがありません。",
            saving: "保存中...",
            loading: "読み込み中...",
            ready: "準備完了"
        };
        
        this.setupEventListeners();
        this.createSpreadsheet();
        this.loadFromStorage();
    }
    
    setupEventListeners() {
        // Toolbar buttons
        document.getElementById("new-btn").addEventListener("click", () => this.newSpreadsheet());
        document.getElementById("save-btn").addEventListener("click", () => this.saveSpreadsheet());
        document.getElementById("load-btn").addEventListener("click", () => this.loadSpreadsheet());
        
        // Formula input
        const formulaInput = document.getElementById("formula-input");
        formulaInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.applyFormula();
        });
        
        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveSpreadsheet();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.newSpreadsheet();
                        break;
                    case 'o':
                        e.preventDefault();
                        this.loadSpreadsheet();
                        break;
                    case 'z':
                        e.preventDefault();
                        this.undo();
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo();
                        break;
                }
            }
        });
        
        // Auto-save every 30 seconds
        setInterval(() => this.saveToStorage(), 30000);
    }
    
    createSpreadsheet() {
        const table = document.getElementById("spreadsheet");
        table.innerHTML = "";
        
        // Create header row
        const headerRow = document.createElement("tr");
        headerRow.appendChild(document.createElement("th")); // Empty corner cell
        
        for (let col = 0; col < this.cols; col++) {
            const th = document.createElement("th");
            th.textContent = String.fromCharCode(65 + col);
            th.className = "column-header";
            headerRow.appendChild(th);
        }
        table.appendChild(headerRow);
        
        // Create data rows
        for (let row = 0; row < this.rows; row++) {
            const tr = document.createElement("tr");
            
            // Row header
            const rowHeader = document.createElement("th");
            rowHeader.textContent = row + 1;
            rowHeader.className = "row-header";
            tr.appendChild(rowHeader);
            
            // Data cells
            for (let col = 0; col < this.cols; col++) {
                const td = document.createElement("td");
                const input = document.createElement("input");
                input.type = "text";
                input.className = "cell-input";
                input.dataset.row = row;
                input.dataset.col = col;
                
                const cellId = this.getCellId(row, col);
                input.value = this.data[cellId] || "";
                
                // Cell event listeners
                input.addEventListener("focus", () => this.selectCell(input));
                input.addEventListener("blur", () => this.updateCell(input));
                input.addEventListener("keydown", (e) => this.handleCellKeydown(e, input));
                input.addEventListener("input", () => this.handleCellInput(input));
                
                td.appendChild(input);
                tr.appendChild(td);
            }
            
            table.appendChild(tr);
        }
        
        this.evaluateAllFormulas();
    }
    
    getCellId(row, col) {
        return `${String.fromCharCode(65 + col)}${row + 1}`;
    }
    
    selectCell(input) {
        if (this.selectedCell) {
            this.selectedCell.classList.remove("selected");
        }
        
        this.selectedCell = input;
        input.classList.add("selected");
        
        const cellId = this.getCellId(parseInt(input.dataset.row), parseInt(input.dataset.col));
        const formula = this.formulas[cellId] || input.value;
        document.getElementById("formula-input").value = formula;
    }
    
    handleCellInput(input) {
        // Real-time formula preview
        const cellId = this.getCellId(parseInt(input.dataset.row), parseInt(input.dataset.col));
        if (input.value.startsWith("=")) {
            this.formulas[cellId] = input.value;
        } else {
            delete this.formulas[cellId];
        }
    }
    
    handleCellKeydown(e, input) {
        switch(e.key) {
            case "Enter":
                this.updateCell(input);
                this.moveToNextCell(input, "down");
                e.preventDefault();
                break;
            case "Tab":
                this.updateCell(input);
                this.moveToNextCell(input, e.shiftKey ? "left" : "right");
                e.preventDefault();
                break;
            case "ArrowUp":
                if (!e.shiftKey) {
                    this.moveToNextCell(input, "up");
                    e.preventDefault();
                }
                break;
            case "ArrowDown":
                if (!e.shiftKey) {
                    this.moveToNextCell(input, "down");
                    e.preventDefault();
                }
                break;
            case "ArrowLeft":
                if (input.selectionStart === 0 && input.selectionEnd === 0) {
                    this.moveToNextCell(input, "left");
                    e.preventDefault();
                }
                break;
            case "ArrowRight":
                if (input.selectionStart === input.value.length && input.selectionEnd === input.value.length) {
                    this.moveToNextCell(input, "right");
                    e.preventDefault();
                }
                break;
            case "Delete":
                if (e.ctrlKey || e.metaKey) {
                    this.clearCell(input);
                    e.preventDefault();
                }
                break;
        }
    }
    
    updateCell(input) {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const cellId = this.getCellId(row, col);
        
        // Save to history
        this.saveToHistory();
        
        const oldValue = this.data[cellId];
        this.data[cellId] = input.value;
        
        // Handle formulas
        if (input.value.startsWith("=")) {
            this.formulas[cellId] = input.value;
            try {
                const result = this.evaluateFormula(input.value.substring(1));
                input.value = result;
                input.title = `Formula: ${this.formulas[cellId]}\nResult: ${result}`;
            } catch (e) {
                input.value = this.messages.errorFormula;
                input.title = `Formula Error: ${e.message}`;
            }
        } else {
            delete this.formulas[cellId];
            input.title = "";
        }
        
        // Re-evaluate dependent formulas
        this.evaluateAllFormulas();
        
        // Auto-save
        this.saveToStorage();
    }
    
    evaluateFormula(formula) {
        // Advanced formula evaluation with support for functions
        
        // Replace cell references with values
        const cellPattern = /([A-Z]+)(\d+)/g;
        let processedFormula = formula.replace(cellPattern, (match, col, row) => {
            const value = this.data[match] || "0";
            return isNaN(parseFloat(value)) ? "0" : parseFloat(value);
        });
        
        // Support basic functions
        processedFormula = processedFormula.replace(/SUM\(([A-Z]+\d+):([A-Z]+\d+)\)/g, (match, start, end) => {
            return this.calculateRange(start, end, "sum");
        });
        
        processedFormula = processedFormula.replace(/AVERAGE\(([A-Z]+\d+):([A-Z]+\d+)\)/g, (match, start, end) => {
            return this.calculateRange(start, end, "average");
        });
        
        processedFormula = processedFormula.replace(/COUNT\(([A-Z]+\d+):([A-Z]+\d+)\)/g, (match, start, end) => {
            return this.calculateRange(start, end, "count");
        });
        
        processedFormula = processedFormula.replace(/MAX\(([A-Z]+\d+):([A-Z]+\d+)\)/g, (match, start, end) => {
            return this.calculateRange(start, end, "max");
        });
        
        processedFormula = processedFormula.replace(/MIN\(([A-Z]+\d+):([A-Z]+\d+)\)/g, (match, start, end) => {
            return this.calculateRange(start, end, "min");
        });
        
        // Safe evaluation (in production, use a proper formula parser)
        try {
            // Remove any potential dangerous code
            if (/[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(/.test(processedFormula) && 
                !/^[\d\s+\-*/.()]+$/.test(processedFormula)) {
                throw new Error("Unsafe formula detected");
            }
            return eval(processedFormula);
        } catch (e) {
            throw new Error(`Formula evaluation failed: ${e.message}`);
        }
    }
    
    calculateRange(startCell, endCell, operation) {
        const startCol = startCell.match(/[A-Z]+/)[0];
        const startRow = parseInt(startCell.match(/\d+/)[0]);
        const endCol = endCell.match(/[A-Z]+/)[0];
        const endRow = parseInt(endCell.match(/\d+/)[0]);
        
        const values = [];
        
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
                const cellId = String.fromCharCode(col) + row;
                const value = parseFloat(this.data[cellId] || "0");
                if (!isNaN(value)) {
                    values.push(value);
                }
            }
        }
        
        switch(operation) {
            case "sum":
                return values.reduce((a, b) => a + b, 0);
            case "average":
                return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            case "count":
                return values.length;
            case "max":
                return values.length > 0 ? Math.max(...values) : 0;
            case "min":
                return values.length > 0 ? Math.min(...values) : 0;
            default:
                return 0;
        }
    }
    
    evaluateAllFormulas() {
        // Re-evaluate all formulas to handle dependencies
        Object.keys(this.formulas).forEach(cellId => {
            const input = document.querySelector(`[data-row="${cellId.match(/\d+/)[0] - 1}"][data-col="${cellId.charCodeAt(0) - 65}"]`);
            if (input) {
                try {
                    const result = this.evaluateFormula(this.formulas[cellId].substring(1));
                    input.value = result;
                    input.title = `Formula: ${this.formulas[cellId]}\nResult: ${result}`;
                } catch (e) {
                    input.value = this.messages.errorFormula;
                    input.title = `Formula Error: ${e.message}`;
                }
            }
        });
    }
    
    moveToNextCell(input, direction) {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        
        let nextRow = row;
        let nextCol = col;
        
        switch(direction) {
            case "up":
                nextRow = Math.max(0, row - 1);
                break;
            case "down":
                nextRow = Math.min(this.rows - 1, row + 1);
                break;
            case "left":
                nextCol = Math.max(0, col - 1);
                break;
            case "right":
                nextCol = Math.min(this.cols - 1, col + 1);
                break;
        }
        
        const nextCell = document.querySelector(`[data-row="${nextRow}"][data-col="${nextCol}"]`);
        if (nextCell) {
            nextCell.focus();
            nextCell.select();
        }
    }
    
    clearCell(input) {
        input.value = "";
        this.updateCell(input);
    }
    
    applyFormula() {
        const formula = document.getElementById("formula-input").value;
        if (this.selectedCell && formula !== undefined) {
            this.selectedCell.value = formula;
            this.updateCell(this.selectedCell);
        }
    }
    
    newSpreadsheet() {
        if (Object.keys(this.data).length > 0 && confirm(this.messages.confirmNew)) {
            this.data = {};
            this.formulas = {};
            this.history = [];
            this.historyIndex = -1;
            this.createSpreadsheet();
            this.clearStorage();
        } else if (Object.keys(this.data).length === 0) {
            this.data = {};
            this.formulas = {};
            this.history = [];
            this.historyIndex = -1;
            this.createSpreadsheet();
        }
    }
    
    saveSpreadsheet() {
        const exportData = {
            data: this.data,
            formulas: this.formulas,
            timestamp: new Date().toISOString(),
            version: "1.0"
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = `spreadsheet-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        // Also save as CSV
        this.exportCSV();
    }
    
    exportCSV() {
        let csv = "";
        
        // Header row
        csv += ",";
        for (let col = 0; col < this.cols; col++) {
            csv += String.fromCharCode(65 + col) + ",";
        }
        csv += "\n";
        
        // Data rows
        for (let row = 0; row < this.rows; row++) {
            csv += (row + 1) + ",";
            for (let col = 0; col < this.cols; col++) {
                const cellId = this.getCellId(row, col);
                const value = this.data[cellId] || "";
                csv += `"${value.toString().replace(/"/g, '""')}",`;
            }
            csv += "\n";
        }
        
        const csvBlob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(csvBlob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = `spreadsheet-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    loadSpreadsheet() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,.csv";
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        if (file.name.endsWith('.json')) {
                            const importData = JSON.parse(e.target.result);
                            this.data = importData.data || {};
                            this.formulas = importData.formulas || {};
                        } else if (file.name.endsWith('.csv')) {
                            this.parseCSV(e.target.result);
                        }
                        this.createSpreadsheet();
                        this.saveToStorage();
                    } catch (error) {
                        alert(this.messages.errorFile + " " + error.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        this.data = {};
        this.formulas = {};
        
        for (let row = 1; row < lines.length && row <= this.rows; row++) {
            const values = this.parseCSVLine(lines[row]);
            for (let col = 1; col < values.length && col <= this.cols; col++) {
                if (values[col] && values[col].trim()) {
                    const cellId = this.getCellId(row - 1, col - 1);
                    this.data[cellId] = values[col].trim();
                }
            }
        }
    }
    
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"' && (i === 0 || line[i-1] === ',')) {
                inQuotes = true;
            } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
                inQuotes = false;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }
    
    saveToHistory() {
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push({
            data: JSON.parse(JSON.stringify(this.data)),
            formulas: JSON.parse(JSON.stringify(this.formulas))
        });
        
        this.historyIndex++;
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = this.history[this.historyIndex];
            this.data = JSON.parse(JSON.stringify(state.data));
            this.formulas = JSON.parse(JSON.stringify(state.formulas));
            this.createSpreadsheet();
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.data = JSON.parse(JSON.stringify(state.data));
            this.formulas = JSON.parse(JSON.stringify(state.formulas));
            this.createSpreadsheet();
        }
    }
    
    saveToStorage() {
        try {
            const saveData = {
                data: this.data,
                formulas: this.formulas,
                timestamp: Date.now()
            };
            localStorage.setItem('spreadsheet-data', JSON.stringify(saveData));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    }
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('spreadsheet-data');
            if (saved) {
                const saveData = JSON.parse(saved);
                this.data = saveData.data || {};
                this.formulas = saveData.formulas || {};
                this.createSpreadsheet();
            }
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
        }
    }
    
    clearStorage() {
        try {
            localStorage.removeItem('spreadsheet-data');
        } catch (e) {
            console.warn('Failed to clear localStorage:', e);
        }
    }
}

// Initialize spreadsheet when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new Spreadsheet();
});