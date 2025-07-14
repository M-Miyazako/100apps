class TerminalEmulator {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.currentDirectory = '/home/user';
        this.commandHistory = [];
        this.historyIndex = -1;
        this.fileSystem = {
            '/home/user': {
                'documents': {},
                'downloads': {},
                'readme.txt': 'Welcome to the terminal emulator!'
            }
        };
        
        this.setupEventListeners();
        this.focusInput();
    }
    
    setupEventListeners() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.processCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            }
        });
        
        document.addEventListener('click', () => {
            this.focusInput();
        });
    }
    
    focusInput() {
        this.input.focus();
    }
    
    processCommand() {
        const command = this.input.value.trim();
        if (command) {
            this.commandHistory.push(command);
            this.historyIndex = this.commandHistory.length;
            this.addToOutput(`user@terminal:~$ ${command}`, 'command');
            this.executeCommand(command);
        }
        this.input.value = '';
    }
    
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        this.historyIndex += direction;
        this.historyIndex = Math.max(0, Math.min(this.historyIndex, this.commandHistory.length));
        
        if (this.historyIndex < this.commandHistory.length) {
            this.input.value = this.commandHistory[this.historyIndex];
        } else {
            this.input.value = '';
        }
    }
    
    executeCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        switch (cmd) {
            case 'help':
                this.showHelp();
                break;
            case 'ls':
                this.listFiles();
                break;
            case 'pwd':
                this.printWorkingDirectory();
                break;
            case 'cd':
                this.changeDirectory(args[0]);
                break;
            case 'mkdir':
                this.makeDirectory(args[0]);
                break;
            case 'touch':
                this.createFile(args[0]);
                break;
            case 'cat':
                this.showFileContent(args[0]);
                break;
            case 'echo':
                this.echo(args.join(' '));
                break;
            case 'clear':
                this.clearTerminal();
                break;
            case 'date':
                this.showDate();
                break;
            case 'whoami':
                this.showUser();
                break;
            case 'uname':
                this.showSystem();
                break;
            default:
                this.addToOutput(`Command not found: ${cmd}`, 'error');
        }
    }
    
    showHelp() {
        const helpText = `Available commands:
help     - Show this help message
ls       - List files and directories
pwd      - Print working directory
cd       - Change directory
mkdir    - Create directory
touch    - Create file
cat      - Show file content
echo     - Print text
clear    - Clear terminal
date     - Show current date
whoami   - Show current user
uname    - Show system information`;
        this.addToOutput(helpText, 'output');
    }
    
    listFiles() {
        const currentDir = this.fileSystem[this.currentDirectory];
        if (currentDir) {
            const items = Object.keys(currentDir);
            if (items.length === 0) {
                this.addToOutput('(empty directory)', 'output');
            } else {
                this.addToOutput(items.join('\\n'), 'output');
            }
        } else {
            this.addToOutput('Directory not found', 'error');
        }
    }
    
    printWorkingDirectory() {
        this.addToOutput(this.currentDirectory, 'output');
    }
    
    changeDirectory(dir) {
        if (!dir || dir === '~') {
            this.currentDirectory = '/home/user';
        } else if (dir === '..') {
            const parts = this.currentDirectory.split('/');
            if (parts.length > 2) {
                parts.pop();
                this.currentDirectory = parts.join('/');
            }
        } else {
            const newPath = this.currentDirectory + '/' + dir;
            if (this.fileSystem[newPath] || this.fileSystem[this.currentDirectory][dir]) {
                this.currentDirectory = newPath;
            } else {
                this.addToOutput(`cd: ${dir}: No such file or directory`, 'error');
            }
        }
    }
    
    makeDirectory(name) {
        if (!name) {
            this.addToOutput('mkdir: missing operand', 'error');
            return;
        }
        
        const currentDir = this.fileSystem[this.currentDirectory];
        if (currentDir) {
            currentDir[name] = {};
            this.addToOutput(`Directory '${name}' created`, 'output');
        }
    }
    
    createFile(name) {
        if (!name) {
            this.addToOutput('touch: missing operand', 'error');
            return;
        }
        
        const currentDir = this.fileSystem[this.currentDirectory];
        if (currentDir) {
            currentDir[name] = '';
            this.addToOutput(`File '${name}' created`, 'output');
        }
    }
    
    showFileContent(name) {
        if (!name) {
            this.addToOutput('cat: missing operand', 'error');
            return;
        }
        
        const currentDir = this.fileSystem[this.currentDirectory];
        if (currentDir && currentDir[name] !== undefined) {
            if (typeof currentDir[name] === 'string') {
                this.addToOutput(currentDir[name] || '(empty file)', 'output');
            } else {
                this.addToOutput(`cat: ${name}: Is a directory`, 'error');
            }
        } else {
            this.addToOutput(`cat: ${name}: No such file or directory`, 'error');
        }
    }
    
    echo(text) {
        this.addToOutput(text, 'output');
    }
    
    clearTerminal() {
        this.output.innerHTML = '';
    }
    
    showDate() {
        this.addToOutput(new Date().toString(), 'output');
    }
    
    showUser() {
        this.addToOutput('user', 'output');
    }
    
    showSystem() {
        this.addToOutput('Terminal Emulator v1.0', 'output');
    }
    
    addToOutput(text, className) {
        const div = document.createElement('div');
        div.className = `command-line ${className}`;
        div.textContent = text;
        this.output.appendChild(div);
        
        // Auto-scroll to bottom
        this.output.scrollTop = this.output.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TerminalEmulator();
});