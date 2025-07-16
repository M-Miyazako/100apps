class VNCViewer {
    constructor() {
        this.isConnected = false;
        this.connection = null;
        this.canvas = null;
        this.ctx = null;
        this.connectionHistory = [];
        this.currentSession = null;
        this.viewOnly = false;
        this.quality = 'medium';
        
        this.initializeEventListeners();
        this.loadConnectionHistory();
        this.setupCanvas();
        this.simulateDesktop();
    }
    
    initializeEventListeners() {
        // Connection controls
        document.getElementById('connectBtn').addEventListener('click', () => this.connect());
        document.getElementById('disconnectBtn').addEventListener('click', () => this.disconnect());
        
        // Viewer controls
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('screenshotBtn').addEventListener('click', () => this.takeScreenshot());
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshScreen());
        
        // View only checkbox
        document.getElementById('viewOnly').addEventListener('change', (e) => {
            this.viewOnly = e.target.checked;
            this.updateViewMode();
        });
        
        // Quality selection
        document.getElementById('quality').addEventListener('change', (e) => {
            this.quality = e.target.value;
            this.updateQuality();
        });
        
        // Keyboard shortcuts
        document.querySelectorAll('.shortcut-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const keys = e.target.dataset.keys;
                this.sendKeyboardShortcut(keys);
            });
        });
        
        // File transfer
        document.getElementById('uploadBtn').addEventListener('click', () => this.uploadFiles());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadFiles());
        
        // Connection history
        document.getElementById('historySelect').addEventListener('change', (e) => {
            this.loadHistoryConnection(e.target.value);
        });
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());
        
        // Canvas events
        this.setupCanvasEvents();
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('vncCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
    }
    
    setupCanvasEvents() {
        const canvas = this.canvas;
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('wheel', (e) => this.handleMouseWheel(e));
        
        // Keyboard events
        canvas.addEventListener('keydown', (e) => this.handleKeyDown(e));
        canvas.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Make canvas focusable
        canvas.tabIndex = 0;
    }
    
    connect() {
        const serverAddress = document.getElementById('serverAddress').value;
        const serverPort = document.getElementById('serverPort').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!serverAddress) {
            alert('サーバーアドレスを入力してください');
            return;
        }
        
        this.updateStatus('connecting', '接続中...');
        document.getElementById('connectBtn').disabled = true;
        
        // Simulate connection process
        setTimeout(() => {
            this.isConnected = true;
            this.currentSession = {
                server: serverAddress,
                port: serverPort,
                username: username,
                connectedAt: new Date()
            };
            
            this.updateStatus('connected', `${serverAddress}:${serverPort} に接続しました`);
            document.getElementById('connectBtn').disabled = false;
            document.getElementById('disconnectBtn').disabled = false;
            
            // Show canvas and hide no-connection message
            document.querySelector('.no-connection').style.display = 'none';
            this.canvas.style.display = 'block';
            
            // Update connection info
            this.updateConnectionInfo();
            
            // Save to history
            this.saveToHistory();
            
            // Start simulated desktop
            this.startDesktopSimulation();
            
        }, 2000);
    }
    
    disconnect() {
        if (!this.isConnected) return;
        
        this.isConnected = false;
        this.currentSession = null;
        
        this.updateStatus('disconnected', 'サーバーに接続していません');
        document.getElementById('connectBtn').disabled = false;
        document.getElementById('disconnectBtn').disabled = true;
        
        // Hide canvas and show no-connection message
        this.canvas.style.display = 'none';
        document.querySelector('.no-connection').style.display = 'block';
        
        // Clear connection info
        document.getElementById('resolution').textContent = '-';
        document.getElementById('colorDepth').textContent = '-';
        document.getElementById('latency').textContent = '-';
        
        // Stop desktop simulation
        this.stopDesktopSimulation();
    }
    
    updateStatus(status, message) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        statusIndicator.className = `status-indicator ${status}`;
        statusIndicator.textContent = this.getStatusText(status);
        statusText.textContent = message;
    }
    
    getStatusText(status) {
        switch (status) {
            case 'connected': return '接続中';
            case 'connecting': return '接続中';
            case 'disconnected': return '切断中';
            default: return '不明';
        }
    }
    
    updateConnectionInfo() {
        document.getElementById('resolution').textContent = '1920x1080';
        document.getElementById('colorDepth').textContent = '24bit';
        document.getElementById('latency').textContent = '45ms';
    }
    
    simulateDesktop() {
        // Create a simple desktop simulation
        this.desktopElements = [
            { type: 'window', x: 100, y: 100, width: 300, height: 200, title: 'ファイルマネージャー' },
            { type: 'window', x: 450, y: 150, width: 250, height: 180, title: 'メモ帳' },
            { type: 'icon', x: 50, y: 50, label: 'マイコンピュータ' },
            { type: 'icon', x: 50, y: 120, label: 'ゴミ箱' },
            { type: 'icon', x: 50, y: 190, label: 'ネットワーク' }
        ];
    }
    
    startDesktopSimulation() {
        this.drawDesktop();
        this.desktopAnimation = setInterval(() => {
            this.animateDesktop();
        }, 1000);
    }
    
    stopDesktopSimulation() {
        if (this.desktopAnimation) {
            clearInterval(this.desktopAnimation);
        }
    }
    
    drawDesktop() {
        // Clear canvas
        this.ctx.fillStyle = '#4a90e2';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw desktop elements
        this.desktopElements.forEach(element => {
            if (element.type === 'window') {
                this.drawWindow(element);
            } else if (element.type === 'icon') {
                this.drawIcon(element);
            }
        });
        
        // Draw taskbar
        this.drawTaskbar();
    }
    
    drawWindow(window) {
        // Window frame
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(window.x, window.y, window.width, window.height);
        
        // Window border
        this.ctx.strokeStyle = '#888';
        this.ctx.strokeRect(window.x, window.y, window.width, window.height);
        
        // Title bar
        this.ctx.fillStyle = '#0078d4';
        this.ctx.fillRect(window.x, window.y, window.width, 30);
        
        // Title text
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(window.title, window.x + 10, window.y + 20);
        
        // Close button
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(window.x + window.width - 25, window.y + 5, 20, 20);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('×', window.x + window.width - 18, window.y + 18);
    }
    
    drawIcon(icon) {
        // Icon background
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(icon.x, icon.y, 40, 40);
        this.ctx.strokeStyle = '#ccc';
        this.ctx.strokeRect(icon.x, icon.y, 40, 40);
        
        // Icon symbol
        this.ctx.fillStyle = '#0078d4';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('📁', icon.x + 10, icon.y + 28);
        
        // Icon label
        this.ctx.fillStyle = '#000';
        this.ctx.font = '10px Arial';
        this.ctx.fillText(icon.label, icon.x, icon.y + 55);
    }
    
    drawTaskbar() {
        // Taskbar background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, this.canvas.height - 40, this.canvas.width, 40);
        
        // Start button
        this.ctx.fillStyle = '#0078d4';
        this.ctx.fillRect(5, this.canvas.height - 35, 60, 30);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('スタート', 15, this.canvas.height - 17);
        
        // Time
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(timeString, this.canvas.width - 80, this.canvas.height - 17);
    }
    
    animateDesktop() {
        // Simple animation - move windows slightly
        this.desktopElements.forEach(element => {
            if (element.type === 'window') {
                element.x += Math.random() * 2 - 1;
                element.y += Math.random() * 2 - 1;
                
                // Keep windows in bounds
                element.x = Math.max(0, Math.min(element.x, this.canvas.width - element.width));
                element.y = Math.max(0, Math.min(element.y, this.canvas.height - element.height - 40));
            }
        });
        
        this.drawDesktop();
    }
    
    handleMouseDown(e) {
        if (!this.isConnected || this.viewOnly) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        console.log(`Mouse down at (${x}, ${y})`);
        
        // Simulate click effect
        this.showClickEffect(x, y);
    }
    
    handleMouseUp(e) {
        if (!this.isConnected || this.viewOnly) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        console.log(`Mouse up at (${x}, ${y})`);
    }
    
    handleMouseMove(e) {
        if (!this.isConnected || this.viewOnly) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update cursor position (simulated)
        this.updateCursor(x, y);
    }
    
    handleMouseWheel(e) {
        if (!this.isConnected || this.viewOnly) return;
        
        e.preventDefault();
        console.log(`Mouse wheel: ${e.deltaY}`);
    }
    
    handleKeyDown(e) {
        if (!this.isConnected || this.viewOnly) return;
        
        console.log(`Key down: ${e.key}`);
        e.preventDefault();
    }
    
    handleKeyUp(e) {
        if (!this.isConnected || this.viewOnly) return;
        
        console.log(`Key up: ${e.key}`);
        e.preventDefault();
    }
    
    showClickEffect(x, y) {
        // Draw a temporary click effect
        this.ctx.save();
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.restore();
        
        // Remove effect after 200ms
        setTimeout(() => {
            this.drawDesktop();
        }, 200);
    }
    
    updateCursor(x, y) {
        // Update cursor position indicator
        this.canvas.style.cursor = 'crosshair';
    }
    
    updateViewMode() {
        if (this.viewOnly) {
            this.canvas.style.cursor = 'default';
        } else {
            this.canvas.style.cursor = 'crosshair';
        }
        
        console.log(`View only mode: ${this.viewOnly}`);
    }
    
    updateQuality() {
        console.log(`Quality changed to: ${this.quality}`);
        // In a real implementation, this would affect the encoding quality
    }
    
    sendKeyboardShortcut(keys) {
        if (!this.isConnected || this.viewOnly) {
            alert('接続されていないか、表示のみモードです');
            return;
        }
        
        console.log(`Sending keyboard shortcut: ${keys}`);
        alert(`キーボードショートカット送信: ${keys}`);
    }
    
    toggleFullscreen() {
        const viewer = document.getElementById('vncViewer');
        
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            viewer.requestFullscreen();
        }
    }
    
    takeScreenshot() {
        if (!this.isConnected) {
            alert('接続されていません');
            return;
        }
        
        const link = document.createElement('a');
        link.download = `vnc-screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }
    
    refreshScreen() {
        if (!this.isConnected) {
            alert('接続されていません');
            return;
        }
        
        console.log('Refreshing screen...');
        this.drawDesktop();
    }
    
    uploadFiles() {
        const fileInput = document.getElementById('fileInput');
        const files = fileInput.files;
        
        if (files.length === 0) {
            alert('ファイルを選択してください');
            return;
        }
        
        if (!this.isConnected) {
            alert('接続されていません');
            return;
        }
        
        console.log(`Uploading ${files.length} files`);
        alert(`${files.length}個のファイルをアップロードしました`);
    }
    
    downloadFiles() {
        if (!this.isConnected) {
            alert('接続されていません');
            return;
        }
        
        console.log('Downloading files...');
        alert('ファイルダウンロード機能は実装中です');
    }
    
    saveToHistory() {
        const connection = {
            server: this.currentSession.server,
            port: this.currentSession.port,
            username: this.currentSession.username,
            timestamp: new Date().toISOString()
        };
        
        this.connectionHistory.push(connection);
        this.updateHistorySelect();
        
        // Save to localStorage
        localStorage.setItem('vncHistory', JSON.stringify(this.connectionHistory));
    }
    
    loadConnectionHistory() {
        const saved = localStorage.getItem('vncHistory');
        if (saved) {
            this.connectionHistory = JSON.parse(saved);
            this.updateHistorySelect();
        }
    }
    
    updateHistorySelect() {
        const select = document.getElementById('historySelect');
        select.innerHTML = '<option value="">接続履歴を選択</option>';
        
        this.connectionHistory.forEach((conn, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${conn.server}:${conn.port} (${conn.username})`;
            select.appendChild(option);
        });
    }
    
    loadHistoryConnection(index) {
        if (index === '') return;
        
        const connection = this.connectionHistory[index];
        if (connection) {
            document.getElementById('serverAddress').value = connection.server;
            document.getElementById('serverPort').value = connection.port;
            document.getElementById('username').value = connection.username;
        }
    }
    
    clearHistory() {
        this.connectionHistory = [];
        this.updateHistorySelect();
        localStorage.removeItem('vncHistory');
        alert('接続履歴を削除しました');
    }
}

let vncViewer;

document.addEventListener('DOMContentLoaded', () => {
    vncViewer = new VNCViewer();
});
