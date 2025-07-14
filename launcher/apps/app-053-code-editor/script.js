class CodeEditor {
    constructor() {
        this.editor = document.getElementById('code-editor');
        this.lineNumbers = document.getElementById('line-numbers');
        this.output = document.getElementById('output-content');
        this.languageSelect = document.getElementById('language-select');
        this.isDarkTheme = true;
        
        this.setupEventListeners();
        this.updateLineNumbers();
        this.loadSampleCode();
    }
    
    setupEventListeners() {
        this.editor.addEventListener('input', () => this.updateLineNumbers());
        this.editor.addEventListener('scroll', () => this.syncLineNumbers());
        this.editor.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        document.getElementById('save-btn').addEventListener('click', () => this.saveCode());
        document.getElementById('load-btn').addEventListener('click', () => this.loadCode());
        document.getElementById('run-btn').addEventListener('click', () => this.runCode());
        document.getElementById('theme-btn').addEventListener('click', () => this.toggleTheme());
        
        this.languageSelect.addEventListener('change', () => this.loadSampleCode());
    }
    
    handleKeydown(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.editor.selectionStart;
            const end = this.editor.selectionEnd;
            
            this.editor.value = this.editor.value.substring(0, start) + '  ' + this.editor.value.substring(end);
            this.editor.selectionStart = this.editor.selectionEnd = start + 2;
        }
        
        if (e.key === 'Enter') {
            setTimeout(() => this.updateLineNumbers(), 0);
        }
    }
    
    updateLineNumbers() {
        const lines = this.editor.value.split('\\n').length;
        const lineNumbersText = Array.from({length: lines}, (_, i) => i + 1).join('\\n');
        this.lineNumbers.textContent = lineNumbersText;
    }
    
    syncLineNumbers() {
        this.lineNumbers.scrollTop = this.editor.scrollTop;
    }
    
    loadSampleCode() {
        const language = this.languageSelect.value;
        const samples = {
            javascript: `// JavaScript Example\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet('World'));\n\n// Try running this code!`,
            html: `<!DOCTYPE html>\n<html>\n<head>\n  <title>HTML Example</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <p>This is a simple HTML page.</p>\n</body>\n</html>`,
            css: `/* CSS Example */\nbody {\n  font-family: Arial, sans-serif;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n  margin: 0;\n  padding: 20px;\n}\n\nh1 {\n  text-align: center;\n  animation: fadeIn 1s ease-in;\n}\n\n@keyframes fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}`,
            python: `# Python Example\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(f\"Factorial of 5: {factorial(5)}\")\n\n# List comprehension example\nsquares = [x**2 for x in range(1, 6)]\nprint(f\"Squares: {squares}\")`
        };\n        \n        this.editor.value = samples[language] || '';\n        this.updateLineNumbers();\n    }\n    \n    runCode() {\n        const code = this.editor.value;\n        const language = this.languageSelect.value;\n        \n        this.output.className = 'output-content';\n        \n        try {\n            if (language === 'javascript') {\n                // Capture console.log output\n                const originalLog = console.log;\n                let output = '';\n                \n                console.log = (...args) => {\n                    output += args.join(' ') + '\\n';\n                };\n                \n                // Execute the code\n                const result = eval(code);\n                \n                // Restore console.log\n                console.log = originalLog;\n                \n                if (output) {\n                    this.output.textContent = output;\n                } else if (result !== undefined) {\n                    this.output.textContent = String(result);\n                } else {\n                    this.output.textContent = 'Code executed successfully!';\n                }\n                \n                this.output.classList.add('success');\n                \n            } else if (language === 'html') {\n                // For HTML, show a preview message\n                this.output.textContent = 'HTML code ready! In a real editor, this would open in a preview window.';\n                this.output.classList.add('success');\n                \n            } else if (language === 'css') {\n                // For CSS, show a validation message\n                this.output.textContent = 'CSS code looks good! In a real editor, this would be applied to a preview.';\n                this.output.classList.add('success');\n                \n            } else if (language === 'python') {\n                // For Python, show a simulation message\n                this.output.textContent = 'Python code ready! In a real editor, this would be executed in a Python interpreter.';\n                this.output.classList.add('success');\n            }\n            \n        } catch (error) {\n            this.output.textContent = `Error: ${error.message}`;\n            this.output.classList.add('error');\n        }\n    }\n    \n    saveCode() {\n        const code = this.editor.value;\n        const language = this.languageSelect.value;\n        const extensions = {\n            javascript: 'js',\n            html: 'html',\n            css: 'css',\n            python: 'py'\n        };\n        \n        const blob = new Blob([code], { type: 'text/plain' });\n        const url = URL.createObjectURL(blob);\n        \n        const link = document.createElement('a');\n        link.href = url;\n        link.download = `code.${extensions[language]}`;\n        link.click();\n        \n        URL.revokeObjectURL(url);\n    }\n    \n    loadCode() {\n        const input = document.createElement('input');\n        input.type = 'file';\n        input.accept = '.js,.html,.css,.py,.txt';\n        \n        input.onchange = (e) => {\n            const file = e.target.files[0];\n            if (file) {\n                const reader = new FileReader();\n                reader.onload = (e) => {\n                    this.editor.value = e.target.result;\n                    this.updateLineNumbers();\n                };\n                reader.readAsText(file);\n            }\n        };\n        \n        input.click();\n    }\n    \n    toggleTheme() {\n        this.isDarkTheme = !this.isDarkTheme;\n        document.body.classList.toggle('light-theme', !this.isDarkTheme);\n        \n        const themeBtn = document.getElementById('theme-btn');\n        themeBtn.textContent = this.isDarkTheme ? '🌙 Theme' : '☀️ Theme';\n    }\n}\n\ndocument.addEventListener('DOMContentLoaded', () => {\n    new CodeEditor();\n});"