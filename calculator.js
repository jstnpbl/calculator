// Initialize DOM elements
const display = document.getElementById('display');
const equationPreview = document.getElementById('equationPreview');
const memoryIndicator = document.getElementById('memoryIndicator');
const scientificButtons = document.getElementById('scientificButtons');
const memoryButtons = document.getElementById('memoryButtons');
const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');
const themeToggleBtn = document.getElementById('themeToggle');
const modeToggleBtn = document.getElementById('modeToggle');
const historyToggleBtn = document.getElementById('historyToggle');
const modeBtns = document.querySelectorAll('.mode-btn');

// Initialize operator buttons for highlighting
const operatorButtons = {
    '+': document.getElementById('op-add'),
    '-': document.getElementById('op-subtract'),
    '*': document.getElementById('op-multiply'),
    '/': document.getElementById('op-divide')
};

// Make calculator functions globally accessible
window.calculator = {
    currentInput: '0',
    operator: null,
    previousValue: null,
    calculationComplete: false,
    memoryValue: null,
    calculationHistory: [],
    scientificPanelVisible: false,
    memoryPanelVisible: false,
    historyPanelVisible: false,
    angleMode: 'deg',
    currentMode: 'standard',
    
    append: function(value) {
        if (this.calculationComplete && !this.operator) {
            this.clearDisplay();
            this.calculationComplete = false;
        }
        
        if (this.currentInput === '0' && value !== '.') {
            this.currentInput = value;
        } else if (this.currentInput === 'Error') {
            this.currentInput = value;
        } else {
            if (value === '.' && this.currentInput.includes('.')) return;
            this.currentInput += value;
        }
        this.updateDisplay();
    },
    
    setOperation: function(op) {
        if (this.currentInput === 'Error') return;
        
        if (this.operator && this.previousValue && !this.calculationComplete) {
            this.calculate();
        }
        
        this.previousValue = this.currentInput;
        this.operator = op;
        this.calculationComplete = false;
        this.currentInput = '0';
        
        this.highlightOperator(op);
        this.updateDisplay();
    },
    
    calculate: function() {
        if (this.operator === null || this.previousValue === null || this.currentInput === 'Error') return;
        
        let result;
        const a = parseFloat(this.previousValue);
        const b = parseFloat(this.currentInput);
        
        try {
            switch (this.operator) {
                case '+': result = a + b; break;
                case '-': result = a - b; break;
                case '*': result = a * b; break;
                case '/':
                    if (b === 0) throw new Error("Division by zero");
                    result = a / b;
                    break;
                case 'pow': result = Math.pow(a, b); break;
                default: return;
            }
            
            if (!Number.isInteger(result)) {
                result = parseFloat(result.toFixed(10));
                result = parseFloat(result);
            }
            
            this.currentInput = result.toString();
            this.previousValue = null;
            this.operator = null;
            this.calculationComplete = true;
            
            this.highlightOperator(null);
            this.updateDisplay();
        } catch (error) {
            this.currentInput = 'Error';
            this.updateDisplay();
            
            setTimeout(() => {
                this.currentInput = '0';
                this.updateDisplay();
            }, 1500);
        }
    },
    
    clearDisplay: function() {
        this.currentInput = '0';
        this.operator = null;
        this.previousValue = null;
        this.calculationComplete = false;
        this.updateDisplay();
        this.highlightOperator(null);
    },
    
    scientificOperation: function(operation) {
        if (this.currentInput === 'Error') return;
        
        const value = parseFloat(this.currentInput);
        let result;
        
        try {
            switch (operation) {
                case 'sin':
                    result = this.angleMode === 'deg' ? Math.sin(value * Math.PI / 180) : Math.sin(value);
                    break;
                case 'cos':
                    result = this.angleMode === 'deg' ? Math.cos(value * Math.PI / 180) : Math.cos(value);
                    break;
                case 'tan':
                    result = this.angleMode === 'deg' ? Math.tan(value * Math.PI / 180) : Math.tan(value);
                    break;
                case 'sqrt':
                    if (value < 0) throw new Error("Cannot take square root of negative number");
                    result = Math.sqrt(value);
                    break;
                case 'pow':
                    this.previousValue = this.currentInput;
                    this.operator = 'pow';
                    this.currentInput = '0';
                    this.updateDisplay();
                    return;
                case 'pi':
                    result = Math.PI;
                    break;
                case 'e':
                    result = Math.E;
                    break;
                case 'fact':
                    if (value < 0 || !Number.isInteger(value)) throw new Error("Factorial only valid for non-negative integers");
                    result = this.factorial(value);
                    break;
                default:
                    return;
            }
            
            if (!Number.isInteger(result)) {
                result = parseFloat(result.toFixed(10));
                result = parseFloat(result);
            }
            
            this.currentInput = result.toString();
            this.calculationComplete = true;
            this.updateDisplay();
        } catch (error) {
            this.currentInput = 'Error';
            this.updateDisplay();
            
            setTimeout(() => {
                this.currentInput = '0';
                this.updateDisplay();
            }, 1500);
        }
    },
    
    factorial: function(n) {
        if (n === 0 || n === 1) return 1;
        
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
            if (!isFinite(result)) break;
        }
        return result;
    },
    
    updateDisplay: function() {
        display.value = this.currentInput;
        this.updateEquationPreview();
    },
    
    updateEquationPreview: function() {
        if (this.operator && this.previousValue) {
            equationPreview.textContent = `${this.previousValue} ${this.getOperatorSymbol(this.operator)} ${this.currentInput !== '0' || this.calculationComplete ? this.currentInput : ''}`;
        } else if (this.calculationComplete) {
            equationPreview.textContent = `= ${this.currentInput}`;
        } else {
            equationPreview.textContent = '';
        }
    },
    
    getOperatorSymbol: function(op) {
        switch (op) {
            case '+': return '+';
            case '-': return '−';
            case '*': return '×';
            case '/': return '÷';
            default: return op;
        }
    },
    
    highlightOperator: function(op) {
        // Reset all operator highlighting
        Object.values(operatorButtons).forEach(btn => {
            if (btn) btn.classList.remove('active-operator');
        });
        
        // Highlight the current operator
        if (op && operatorButtons[op]) {
            operatorButtons[op].classList.add('active-operator');
        }
    },
    
    saveState: function() {
        const state = {
            currentInput: this.currentInput,
            operator: this.operator,
            previousValue: this.previousValue,
            calculationComplete: this.calculationComplete,
            memoryValue: this.memoryValue,
            calculationHistory: this.calculationHistory,
            scientificPanelVisible: this.scientificPanelVisible,
            memoryPanelVisible: this.memoryPanelVisible,
            historyPanelVisible: this.historyPanelVisible,
            angleMode: this.angleMode,
            currentMode: this.currentMode,
            darkMode: document.body.classList.contains('dark-mode')
        };
        
        localStorage.setItem('calculatorState', JSON.stringify(state));
    }
};

// Expose calculator functions globally
window.append = function(value) { window.calculator.append(value); };
window.setOperation = function(op) { window.calculator.setOperation(op); };
window.calculate = function() { window.calculator.calculate(); };
window.clearDisplay = function() { window.calculator.clearDisplay(); };
window.backspace = function() {
    if (window.calculator.currentInput !== '0' && window.calculator.currentInput !== 'Error') {
        if (window.calculator.currentInput.length === 1) {
            window.calculator.currentInput = '0';
        } else {
            window.calculator.currentInput = window.calculator.currentInput.slice(0, -1);
        }
        window.calculator.updateDisplay();
    }
};
window.toggleScientificPanel = function() {
    window.calculator.scientificPanelVisible = !window.calculator.scientificPanelVisible;
    scientificButtons.style.display = window.calculator.scientificPanelVisible ? 'grid' : 'none';
    window.calculator.saveState();
};
window.toggleMemoryPanel = function() {
    window.calculator.memoryPanelVisible = !window.calculator.memoryPanelVisible;
    memoryButtons.style.display = window.calculator.memoryPanelVisible ? 'grid' : 'none';
    window.calculator.saveState();
};
window.toggleHistoryPanel = function() {
    window.calculator.historyPanelVisible = !window.calculator.historyPanelVisible;
    historyPanel.style.display = window.calculator.historyPanelVisible ? 'flex' : 'none';
    window.calculator.saveState();
};
window.memoryOperation = function(operation) {
    if (window.calculator.currentInput === 'Error') return;
    
    const value = parseFloat(window.calculator.currentInput);
    
    switch (operation) {
        case 'MC': // Memory Clear
            window.calculator.memoryValue = null;
            memoryIndicator.classList.remove('active');
            break;
        case 'MR': // Memory Recall
            if (window.calculator.memoryValue !== null) {
                window.calculator.currentInput = window.calculator.memoryValue.toString();
                window.calculator.updateDisplay();
            }
            break;
        case 'M+': // Memory Add
            if (window.calculator.memoryValue === null) {
                window.calculator.memoryValue = value;
            } else {
                window.calculator.memoryValue += value;
            }
            memoryIndicator.classList.add('active');
            break;
        case 'M-': // Memory Subtract
            if (window.calculator.memoryValue === null) {
                window.calculator.memoryValue = -value;
            } else {
                window.calculator.memoryValue -= value;
            }
            memoryIndicator.classList.add('active');
            break;
        case 'MS': // Memory Store
            window.calculator.memoryValue = value;
            memoryIndicator.classList.add('active');
            break;
    }
    
    window.calculator.saveState();
};
window.scientificOperation = function(op) { window.calculator.scientificOperation(op); };
window.clearHistory = function() {
    historyList.innerHTML = '<div class="empty-history">No calculations yet</div>';
    window.calculator.calculationHistory = [];
    window.calculator.saveState();
};

// Initialize calculator
window.calculator.updateDisplay();

// Add event listeners for application startup
window.addEventListener('beforeunload', () => window.calculator.saveState());

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load saved state
    try {
        const savedState = localStorage.getItem('calculatorState');
        if (savedState) {
            const state = JSON.parse(savedState);
            Object.assign(window.calculator, state);
            
            // Restore theme
            if (state.darkMode) {
                document.body.classList.add('dark-mode');
                themeToggleBtn.textContent = '🌙';
            }
            
            // Restore panels
            scientificButtons.style.display = state.scientificPanelVisible ? 'grid' : 'none';
            memoryButtons.style.display = state.memoryPanelVisible ? 'grid' : 'none';
            historyPanel.style.display = state.historyPanelVisible ? 'flex' : 'none';
            
            // Restore mode
            const activeModeBtn = document.querySelector(`[data-mode="${state.currentMode}"]`);
            if (activeModeBtn) {
                modeBtns.forEach(btn => btn.classList.remove('active'));
                activeModeBtn.classList.add('active');
            }
            
            // Restore memory indicator
            if (state.memoryValue !== null) {
                memoryIndicator.classList.add('active');
            }
        }
    } catch (error) {
        console.error('Error loading calculator state:', error);
    }
    
    // Set up keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Prevent default actions for calculator keys
        if (['+', '-', '*', '/', '=', 'Enter', 'Escape', 'Backspace'].includes(e.key)) {
            e.preventDefault();
        }
        
        // Number keys
        if (e.key >= '0' && e.key <= '9') {
            window.append(e.key);
        }
        
        // Operation keys
        switch (e.key) {
            case '+': window.setOperation('+'); break;
            case '-': window.setOperation('-'); break;
            case '*': window.setOperation('*'); break;
            case '/': window.setOperation('/'); break;
            case '=': 
            case 'Enter': window.calculate(); break;
            case '.': window.append('.'); break;
            case 'Escape': window.clearDisplay(); break;
            case 'Backspace': window.backspace(); break;
            
            // Scientific operations
            case 's': window.scientificOperation('sin'); break;
            case 'c': window.scientificOperation('cos'); break;
            case 't': window.scientificOperation('tan'); break;
            case '^': window.scientificOperation('pow'); break;
            case 'r': window.scientificOperation('sqrt'); break;
            case 'p': window.scientificOperation('pi'); break;
            case 'e': window.scientificOperation('e'); break;
            case '!': window.scientificOperation('fact'); break;
        }
        
        // Memory operations
        if (e.ctrlKey) {
            switch (e.key) {
                case 'm': case 'M': 
                    e.preventDefault();
                    window.memoryOperation('MS'); 
                    break;
                case 'r': case 'R': 
                    e.preventDefault();
                    window.memoryOperation('MR'); 
                    break;
                case 'p': case 'P': 
                    e.preventDefault();
                    window.memoryOperation('M+'); 
                    break;
                case 'q': case 'Q': 
                    e.preventDefault();
                    window.memoryOperation('M-'); 
                    break;
                case 'l': case 'L': 
                    e.preventDefault();
                    window.memoryOperation('MC'); 
                    break;
            }
        }
    });
    
    // Theme toggle
    themeToggleBtn.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        themeToggleBtn.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
        window.calculator.saveState();
    });
    
    // Mode buttons
    modeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            modeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            window.calculator.currentMode = this.getAttribute('data-mode');
            
            if (window.calculator.currentMode === 'scientific') {
                window.toggleScientificPanel();
            } else {
                scientificButtons.style.display = 'none';
                window.calculator.scientificPanelVisible = false;
            }
            
            window.calculator.saveState();
        });
    });
    
    // Initialize display
    window.calculator.updateDisplay();
});

// Add event listeners for toggle buttons
historyToggleBtn.addEventListener('click', function() {
    calculator.historyPanelVisible = !calculator.historyPanelVisible;
    historyPanel.style.display = calculator.historyPanelVisible ? 'flex' : 'none';
    calculator.saveState();
});

modeToggleBtn.addEventListener('click', function() {
    calculator.currentMode = calculator.currentMode === 'standard' ? 'scientific' : 'standard';
    modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === calculator.currentMode);
    });
    
    // Toggle scientific panel visibility based on mode
    if (calculator.currentMode === 'scientific') {
        scientificButtons.style.display = 'grid';
        calculator.scientificPanelVisible = true;
    } else {
        scientificButtons.style.display = 'none';
        calculator.scientificPanelVisible = false;
    }
    
    calculator.saveState();
});

// Add event listeners for mode buttons
modeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        calculator.currentMode = this.dataset.mode;
        modeBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        calculator.saveState();
    });
}); 