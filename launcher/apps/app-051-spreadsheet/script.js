class Spreadsheet {
    constructor() {
        this.data = {};
        this.selectedCell = null;
        this.rows = 30;
        this.cols = 15;
        
        this.setupEventListeners();
        this.createSpreadsheet();
    }
    
    setupEventListeners() {
        document.getElementById('new-btn').addEventListener('click', () => this.newSpreadsheet());
        document.getElementById('save-btn').addEventListener('click', () => this.saveSpreadsheet());
        document.getElementById('load-btn').addEventListener('click', () => this.loadSpreadsheet());
        document.getElementById('formula-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.applyFormula();
        });
    }
    
    createSpreadsheet() {
        const table = document.getElementById('spreadsheet');
        table.innerHTML = '';
        
        // Header row
        const headerRow = document.createElement('tr');
        headerRow.appendChild(document.createElement('th')); // Corner cell
        
        for (let col = 0; col < this.cols; col++) {
            const th = document.createElement('th');
            th.textContent = String.fromCharCode(65 + col); // A, B, C, ...
            headerRow.appendChild(th);
        }
        
        table.appendChild(headerRow);
        
        // Data rows
        for (let row = 0; row < this.rows; row++) {
            const tr = document.createElement('tr');
            
            // Row header
            const rowHeader = document.createElement('td');
            rowHeader.textContent = row + 1;
            tr.appendChild(rowHeader);
            
            // Data cells
            for (let col = 0; col < this.cols; col++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'cell-input';
                input.dataset.row = row;
                input.dataset.col = col;
                
                const cellId = this.getCellId(row, col);
                input.value = this.data[cellId] || '';
                
                input.addEventListener('focus', () => this.selectCell(input));
                input.addEventListener('blur', () => this.updateCell(input));
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.updateCell(input);
                        this.moveToNextCell(input);
                    }
                });
                
                td.appendChild(input);
                tr.appendChild(td);
            }
            
            table.appendChild(tr);
        }
    }
    
    getCellId(row, col) {
        return `${String.fromCharCode(65 + col)}${row + 1}`;
    }
    
    selectCell(input) {
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected-cell');
        }
        
        this.selectedCell = input;
        input.classList.add('selected-cell');
        
        const cellId = this.getCellId(parseInt(input.dataset.row), parseInt(input.dataset.col));
        document.getElementById('formula-input').value = input.value;
    }
    
    updateCell(input) {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const cellId = this.getCellId(row, col);
        
        this.data[cellId] = input.value;
        
        // Simple formula evaluation
        if (input.value.startsWith('=')) {
            try {
                const formula = input.value.substring(1);
                const result = this.evaluateFormula(formula);
                input.value = result;
            } catch (e) {
                input.value = '#ERROR';
            }
        }
    }
    
    evaluateFormula(formula) {
        // Replace cell references with values
        const cellPattern = /[A-Z]+[0-9]+/g;
        const processedFormula = formula.replace(cellPattern, (match) => {
            const value = this.data[match] || '0';
            return isNaN(value) ? '0' : value;
        });
        
        // Simple math evaluation (in production, use a proper formula parser)
        return eval(processedFormula);
    }
    
    moveToNextCell(input) {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        
        let nextRow = row;
        let nextCol = col + 1;
        
        if (nextCol >= this.cols) {
            nextCol = 0;
            nextRow++;
        }
        
        if (nextRow < this.rows) {
            const nextCell = document.querySelector(`[data-row="${nextRow}"][data-col="${nextCol}"]`);
            if (nextCell) {
                nextCell.focus();
            }
        }
    }
    
    applyFormula() {
        const formula = document.getElementById('formula-input').value;
        if (this.selectedCell && formula) {
            this.selectedCell.value = formula;
            this.updateCell(this.selectedCell);
        }
    }
    
    newSpreadsheet() {
        if (confirm('Create new spreadsheet? All data will be lost.')) {
            this.data = {};
            this.createSpreadsheet();
        }
    }
    
    saveSpreadsheet() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'spreadsheet.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    loadSpreadsheet() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        this.data = JSON.parse(e.target.result);
                        this.createSpreadsheet();
                    } catch (error) {
                        alert('Invalid file format');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Spreadsheet();
});"