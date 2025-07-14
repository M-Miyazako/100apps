class Calculator {
    constructor() {
        this.previousOperand = '';
        this.currentOperand = '0';
        this.operation = undefined;
        this.shouldResetDisplay = false;
        this.lastOperation = null;
        this.lastOperand = null;
        
        this.previousOperandTextElement = document.getElementById('previousOperand');
        this.currentOperandTextElement = document.getElementById('currentOperand');
        
        this.initializeEventListeners();
        this.updateDisplay();
    }
    
    initializeEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.dataset.number);
            });
        });
        
        // Operator buttons
        document.querySelectorAll('[data-operator]').forEach(button => {
            button.addEventListener('click', () => {
                this.chooseOperation(button.dataset.operator);
            });
        });
        
        // Equals button
        document.getElementById('equalsBtn').addEventListener('click', () => {
            this.compute();
        });
        
        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clear();
        });
        
        // Delete button
        document.getElementById('deleteBtn').addEventListener('click', () => {
            this.delete();
        });
        
        // Decimal button
        document.getElementById('decimalBtn').addEventListener('click', () => {
            this.appendNumber('.');
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }
    
    handleKeyboard(e) {
        // Numbers
        if (e.key >= '0' && e.key <= '9') {
            this.appendNumber(e.key);
        }
        
        // Operators
        if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            this.chooseOperation(e.key);
        }
        
        // Equals
        if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            this.compute();
        }
        
        // Clear
        if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
            this.clear();
        }
        
        // Delete
        if (e.key === 'Backspace') {
            this.delete();
        }
        
        // Decimal
        if (e.key === '.') {
            this.appendNumber('.');
        }
    }
    
    appendNumber(number) {
        // Remove error state if it exists
        this.currentOperandTextElement.classList.remove('error');
        
        // Handle decimal point
        if (number === '.' && this.currentOperand.includes('.')) {
            return;
        }
        
        // Reset display if needed
        if (this.shouldResetDisplay) {
            this.currentOperand = '';
            this.shouldResetDisplay = false;
        }
        
        // Replace initial zero with number (except for decimal)
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
        
        this.updateDisplay();
    }
    
    chooseOperation(operation) {
        // Remove error state
        this.currentOperandTextElement.classList.remove('error');
        
        // Handle consecutive operators
        if (this.currentOperand === '' && this.previousOperand !== '') {
            this.operation = operation;
            this.updateDisplay();
            return;
        }
        
        // Perform calculation if there's a pending operation
        if (this.operation !== undefined && !this.shouldResetDisplay) {
            this.compute();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.shouldResetDisplay = true;
        
        // Visual feedback for operator
        this.highlightOperator(operation);
        
        this.updateDisplay();
    }
    
    highlightOperator(operation) {
        // Remove previous highlights
        document.querySelectorAll('.operator').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add highlight to current operator
        const operatorBtn = document.querySelector(`[data-operator="${operation}"]`);
        if (operatorBtn) {
            operatorBtn.classList.add('active');
        }
    }
    
    compute() {
        // Remove operator highlights
        document.querySelectorAll('.operator').forEach(btn => {
            btn.classList.remove('active');
        });
        
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        // Handle repeat operations (pressing equals multiple times)
        if (this.shouldResetDisplay && this.lastOperation && this.lastOperand !== null) {
            const currentValue = parseFloat(this.currentOperand);
            computation = this.performOperation(currentValue, this.lastOperand, this.lastOperation);
        } else {
            if (isNaN(prev) || isNaN(current)) return;
            
            computation = this.performOperation(prev, current, this.operation);
            
            // Store for repeat operations
            this.lastOperation = this.operation;
            this.lastOperand = current;
        }
        
        // Handle computation result
        if (computation === null) {
            this.showError('Cannot divide by zero');
            return;
        }
        
        if (!isFinite(computation)) {
            this.showError('Invalid operation');
            return;
        }
        
        // Format the result
        this.currentOperand = this.formatNumber(computation);
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetDisplay = true;
        
        this.updateDisplay();
        this.animateDisplay();
    }
    
    performOperation(a, b, operation) {
        switch (operation) {
            case '+':
                return a + b;
            case '-':
                return a - b;
            case '*':
                return a * b;
            case '/':
                if (b === 0) return null; // Division by zero
                return a / b;
            default:
                return;
        }
    }
    
    formatNumber(number) {
        // Handle very large or very small numbers
        if (Math.abs(number) > 1e15 || (Math.abs(number) < 1e-10 && number !== 0)) {
            return number.toExponential(6);
        }
        
        // Remove trailing zeros and unnecessary decimal point
        const str = number.toString();
        if (str.includes('.')) {
            return parseFloat(str).toString();
        }
        
        return str;
    }
    
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetDisplay = false;
        this.lastOperation = null;
        this.lastOperand = null;
        
        // Remove operator highlights and error states
        document.querySelectorAll('.operator').forEach(btn => {
            btn.classList.remove('active');
        });
        this.currentOperandTextElement.classList.remove('error');
        
        this.updateDisplay();
    }
    
    delete() {
        if (this.shouldResetDisplay) {
            this.clear();
            return;
        }
        
        if (this.currentOperand.length <= 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        
        this.updateDisplay();
    }
    
    showError(message) {
        this.currentOperand = message;
        this.currentOperandTextElement.classList.add('error');
        this.shouldResetDisplay = true;
        this.updateDisplay();
        
        // Clear error after 3 seconds
        setTimeout(() => {
            if (this.currentOperand === message) {
                this.clear();
            }
        }, 3000);
    }
    
    updateDisplay() {
        this.currentOperandTextElement.textContent = this.currentOperand;
        
        if (this.operation != null) {
            const operatorSymbol = this.getOperatorSymbol(this.operation);
            this.previousOperandTextElement.textContent = 
                `${this.previousOperand} ${operatorSymbol}`;
        } else {
            this.previousOperandTextElement.textContent = '';
        }
    }
    
    getOperatorSymbol(operation) {
        switch (operation) {
            case '+': return '+';
            case '-': return '-';
            case '*': return '×';
            case '/': return '÷';
            default: return '';
        }
    }
    
    animateDisplay() {
        this.currentOperandTextElement.parentElement.classList.add('display-animation');
        setTimeout(() => {
            this.currentOperandTextElement.parentElement.classList.remove('display-animation');
        }, 300);
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

// Prevent context menu on right click for better mobile experience
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Add visual feedback for button presses
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
            button.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', () => {
            button.style.transform = '';
        });
    });
});