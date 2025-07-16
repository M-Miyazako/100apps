// Remote Desktop App functionality

let connections = [];
let activeConnection = null;
let currentSession = null;
let sessionStartTime = null;
let connectionIdCounter = 1;
let simulationTimer = null;
let performanceData = {
    bytesTransferred: 0,
    framerate: 0,
    latency: 0,
    bandwidth: 0
};

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    initializeEventListeners();
    updateStats();
    renderConnections();
    
    // Add sample data for demo
    if (connections.length === 0) {
        addSampleConnections();
    }
    
    // Initialize canvas
    initializeCanvas();
});

// Initialize event listeners
function initializeEventListeners() {
    // Connection form
    document.getElementById('connectionForm').addEventListener('submit', handleConnect);
    
    // Screen controls
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
    document.getElementById('screenshotBtn').addEventListener('click', takeScreenshot);
    document.getElementById('refreshBtn').addEventListener('click', refreshConnection);
    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    document.getElementById('disconnectBtn').addEventListener('click', disconnect);
    
    // Settings changes
    document.getElementById('screenSize').addEventListener('change', updateConnectionSettings);
    document.getElementById('colorDepth').addEventListener('change', updateConnectionSettings);
    document.getElementById('enableAudio').addEventListener('change', updateConnectionSettings);
    document.getElementById('enableClipboard').addEventListener('change', updateConnectionSettings);
    document.getElementById('enableFileTransfer').addEventListener('change', updateConnectionSettings);
    
    // Modal related
    document.getElementById('closeSaveModal').addEventListener('click', closeSaveModal);
    document.getElementById('closeSettingsModal').addEventListener('click', closeSettingsModal);
    document.getElementById('cancelSaveBtn').addEventListener('click', closeSaveModal);
    document.getElementById('cancelSettingsBtn').addEventListener('click', closeSettingsModal);
    document.getElementById('saveConnectionForm').addEventListener('submit', saveConnection);
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    
    // Settings tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Compression level slider
    document.getElementById('compression').addEventListener('input', function() {
        document.getElementById('compressionValue').textContent = this.value;
    });
    
    // Close modal on outside click
    document.getElementById('saveConnectionModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSaveModal();
        }
    });
    
    document.getElementById('settingsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSettingsModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Connection handling
function handleConnect(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const connectionData = {
        id: connectionIdCounter++,
        serverAddress: formData.get('serverAddress') || document.getElementById('serverAddress').value,
        port: parseInt(formData.get('port')) || parseInt(document.getElementById('port').value),
        username: formData.get('username') || document.getElementById('username').value,
        password: formData.get('password') || document.getElementById('password').value,
        protocol: formData.get('protocol') || document.getElementById('protocol').value,
        createdAt: new Date().toISOString(),
        lastConnected: new Date().toISOString(),
        settings: getConnectionSettings()
    };
    
    // Simulate connection
    simulateConnection(connectionData);
}

// Get connection settings
function getConnectionSettings() {
    return {
        screenSize: document.getElementById('screenSize').value,
        colorDepth: document.getElementById('colorDepth').value,
        enableAudio: document.getElementById('enableAudio').checked,
        enableClipboard: document.getElementById('enableClipboard').checked,
        enableFileTransfer: document.getElementById('enableFileTransfer').checked,
        quality: document.getElementById('quality')?.value || 'medium',
        compression: parseInt(document.getElementById('compression')?.value) || 5,
        enableKeyboard: document.getElementById('enableKeyboard')?.checked !== false,
        enableMouse: document.getElementById('enableMouse')?.checked !== false,
        timeout: parseInt(document.getElementById('timeout')?.value) || 30,
        retryCount: parseInt(document.getElementById('retryCount')?.value) || 3
    };
}

// Connection simulation
function simulateConnection(connectionData) {
    // Update connection status
    const statusElement = document.getElementById('connectionStatus');
    statusElement.innerHTML = `
        <div class="status-icon">🔄</div>
        <h3>Connecting...</h3>
        <p>Connecting to ${connectionData.serverAddress}:${connectionData.port}</p>
    `;
    
    // Simulate connection
    setTimeout(() => {
        if (Math.random() > 0.2) { // 80% success rate
            establishConnection(connectionData);
        } else {
            showConnectionError('Connection failed. Please check server address and port.');
        }
    }, 2000 + Math.random() * 3000);
}

// Establish connection
function establishConnection(connectionData) {
    activeConnection = connectionData;
    currentSession = {
        id: Date.now(),
        startTime: new Date(),
        connectionData: connectionData
    };
    sessionStartTime = Date.now();
    
    // Update UI
    document.getElementById('connectionStatus').style.display = 'none';
    document.getElementById('desktopScreen').style.display = 'block';
    
    // Display connection info
    document.getElementById('serverName').textContent = 
        `${connectionData.serverAddress}:${connectionData.port}`;
    document.getElementById('connectionQuality').textContent = 'Excellent';
    document.getElementById('connectionQuality').className = 'connection-quality excellent';
    
    // Update session info
    updateSessionInfo();
    
    // Update statistics
    updateStats();
    
    // Simulate desktop screen
    startDesktopSimulation();
    
    // Start performance monitoring
    startPerformanceMonitoring();
    
    // Add connection to saved list
    if (!connections.find(c => c.serverAddress === connectionData.serverAddress && c.port === connectionData.port)) {
        connections.push(connectionData);
        saveToStorage();
        renderConnections();
    }
    
    console.log('Connection established:', connectionData);
}

// Show connection error
function showConnectionError(message) {
    const statusElement = document.getElementById('connectionStatus');
    statusElement.innerHTML = `
        <div class="status-icon">❌</div>
        <h3>Connection Error</h3>
        <p>${message}</p>
    `;
    
    // Reset to original state after 5 seconds
    setTimeout(() => {
        statusElement.innerHTML = `
            <div class="status-icon">🔌</div>
            <h3>Not Connected</h3>
            <p>Select a connection from the form on the left</p>
        `;
    }, 5000);
}

// Start desktop simulation
function startDesktopSimulation() {
    const canvas = document.getElementById('desktopCanvas');
    const ctx = canvas.getContext('2d');
    
    // Simulate desktop screen
    drawDesktopScreen(ctx);
    
    // Periodically update screen
    simulationTimer = setInterval(() => {
        drawDesktopScreen(ctx);
    }, 100);
}

// Draw desktop screen
function drawDesktopScreen(ctx) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Draw background
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, width, height);
    
    // Draw desktop icons
    const iconSize = 60;
    const iconSpacing = 80;
    const startX = 20;
    const startY = 20;
    
    const icons = [
        { name: 'My Computer', x: startX, y: startY, color: '#3498db' },
        { name: 'Documents', x: startX + iconSpacing, y: startY, color: '#f39c12' },
        { name: 'Browser', x: startX + iconSpacing * 2, y: startY, color: '#e74c3c' },
        { name: 'Mail', x: startX, y: startY + iconSpacing, color: '#2ecc71' },
        { name: 'Calendar', x: startX + iconSpacing, y: startY + iconSpacing, color: '#9b59b6' },
        { name: 'Files', x: startX + iconSpacing * 2, y: startY + iconSpacing, color: '#34495e' }
    ];
    
    icons.forEach(icon => {
        // Icon background
        ctx.fillStyle = icon.color;
        ctx.fillRect(icon.x, icon.y, iconSize, iconSize);
        
        // Icon shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(icon.x + 3, icon.y + 3, iconSize, iconSize);
        
        // Icon foreground
        ctx.fillStyle = icon.color;
        ctx.fillRect(icon.x, icon.y, iconSize, iconSize);
        
        // Icon text
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(icon.name, icon.x + iconSize / 2, icon.y + iconSize + 15);
    });
    
    // Draw taskbar
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, height - 40, width, 40);
    
    // Start button
    ctx.fillStyle = '#3498db';
    ctx.fillRect(5, height - 35, 80, 30);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Start', 45, height - 18);
    
    // Clock
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(timeStr, width - 10, height - 18);
    
    // Draw cursor
    const mouseX = Math.random() * width;
    const mouseY = Math.random() * height;
    drawCursor(ctx, mouseX, mouseY);
}

// Draw cursor
function drawCursor(ctx, x, y) {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    
    // Cursor shape
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 12, y + 12);
    ctx.lineTo(x + 8, y + 16);
    ctx.lineTo(x, y + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// Start performance monitoring
function startPerformanceMonitoring() {
    setInterval(() => {
        if (activeConnection) {
            // Update performance data
            performanceData.bytesTransferred += Math.random() * 1000;
            performanceData.framerate = 30 + Math.random() * 30;
            performanceData.latency = 20 + Math.random() * 80;
            performanceData.bandwidth = 1000 + Math.random() * 9000;
            
            updateSessionInfo();
            updateStats();
        }
    }, 1000);
}

// Update session info
function updateSessionInfo() {
    if (!activeConnection || !sessionStartTime) return;
    
    const elapsedTime = Math.floor((Date.now() - sessionStartTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    
    document.getElementById('connectionTime').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const settings = activeConnection.settings;
    document.getElementById('resolution').textContent = 
        settings.screenSize === 'auto' ? '1024x768' : settings.screenSize;
    
    document.getElementById('frameRate').textContent = 
        `${performanceData.framerate.toFixed(1)} fps`;
    
    document.getElementById('latency').textContent = 
        `${performanceData.latency.toFixed(0)} ms`;
    
    document.getElementById('bandwidth').textContent = 
        `${(performanceData.bandwidth / 1000).toFixed(1)} Mbps`;
    
    document.getElementById('transferred').textContent = 
        `${(performanceData.bytesTransferred / 1024 / 1024).toFixed(1)} MB`;
}

// Update statistics
function updateStats() {
    const totalConnections = connections.length;
    const activeConnections = activeConnection ? 1 : 0;
    const totalSessions = parseInt(localStorage.getItem('remoteDesktop_sessionCount') || '0');
    const dataTransferred = (performanceData.bytesTransferred / 1024 / 1024).toFixed(1);
    
    document.getElementById('totalConnections').textContent = totalConnections;
    document.getElementById('activeConnections').textContent = activeConnections;
    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('dataTransferred').textContent = dataTransferred;
}

// Render saved connections
function renderConnections() {
    const container = document.getElementById('connectionsList');
    
    if (connections.length === 0) {
        container.innerHTML = `
            <div class="no-connections">
                <p>No saved connections</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = connections.map(conn => `
        <div class="connection-item" onclick="connectToSaved(${conn.id})">
            <div class="connection-name">${conn.name || `${conn.serverAddress}:${conn.port}`}</div>
            <div class="connection-details">
                ${conn.serverAddress}:${conn.port} (${conn.protocol.toUpperCase()})
            </div>
        </div>
    `).join('');
}

// Connect to saved connection
function connectToSaved(connectionId) {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;
    
    // Set form values
    document.getElementById('serverAddress').value = connection.serverAddress;
    document.getElementById('port').value = connection.port;
    document.getElementById('username').value = connection.username;
    document.getElementById('password').value = connection.password;
    document.getElementById('protocol').value = connection.protocol;
    
    // Start connection
    simulateConnection(connection);
}

// Update connection settings
function updateConnectionSettings() {
    if (activeConnection) {
        activeConnection.settings = getConnectionSettings();
        saveToStorage();
        console.log('Connection settings updated:', activeConnection.settings);
    }
}

// Toggle fullscreen
function toggleFullscreen() {
    const desktopContainer = document.getElementById('desktopContainer');
    const btn = document.getElementById('fullscreenBtn');
    
    if (!document.fullscreenElement) {
        desktopContainer.requestFullscreen();
        btn.classList.add('active');
    } else {
        document.exitFullscreen();
        btn.classList.remove('active');
    }
}

// Take screenshot
function takeScreenshot() {
    const canvas = document.getElementById('desktopCanvas');
    const link = document.createElement('a');
    link.download = `screenshot_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '_')}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    // Visual feedback
    const btn = document.getElementById('screenshotBtn');
    btn.style.background = '#2ecc71';
    setTimeout(() => {
        btn.style.background = '';
    }, 200);
}

// Refresh connection
function refreshConnection() {
    if (activeConnection) {
        const btn = document.getElementById('refreshBtn');
        btn.classList.add('active');
        
        // Refresh screen
        const canvas = document.getElementById('desktopCanvas');
        const ctx = canvas.getContext('2d');
        drawDesktopScreen(ctx);
        
        setTimeout(() => {
            btn.classList.remove('active');
        }, 500);
    }
}

// Disconnect
function disconnect() {
    if (activeConnection) {
        // Stop timers
        if (simulationTimer) {
            clearInterval(simulationTimer);
            simulationTimer = null;
        }
        
        // Update session count
        const sessionCount = parseInt(localStorage.getItem('remoteDesktop_sessionCount') || '0');
        localStorage.setItem('remoteDesktop_sessionCount', (sessionCount + 1).toString());
        
        // Reset connection
        activeConnection = null;
        currentSession = null;
        sessionStartTime = null;
        
        // Update UI
        document.getElementById('connectionStatus').style.display = 'block';
        document.getElementById('desktopScreen').style.display = 'none';
        
        // Update statistics
        updateStats();
        
        console.log('Connection disconnected');
    }
}

// Initialize canvas
function initializeCanvas() {
    const canvas = document.getElementById('desktopCanvas');
    const container = canvas.parentElement;
    
    // Adjust canvas size
    function resizeCanvas() {
        const rect = container.getBoundingClientRect();
        canvas.width = Math.min(1024, rect.width - 20);
        canvas.height = Math.min(768, rect.height - 20);
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Add mouse events
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);
    canvas.addEventListener('keydown', handleKeyDown);
    
    // Make canvas focusable
    canvas.tabIndex = 1;
}

// Handle mouse move
function handleMouseMove(e) {
    if (activeConnection) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Send mouse position to remote (simulation)
        console.log(`Mouse move: ${x}, ${y}`);
    }
}

// Handle mouse click
function handleMouseClick(e) {
    if (activeConnection) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Send mouse click to remote (simulation)
        console.log(`Mouse click: ${x}, ${y}`);
        
        // Visual feedback
        const canvas = e.target;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        setTimeout(() => {
            drawDesktopScreen(ctx);
        }, 100);
    }
}

// Handle key input
function handleKeyDown(e) {
    if (activeConnection) {
        // Send keyboard input to remote (simulation)
        console.log(`Key input: ${e.key}`);
        
        // Prevent default behavior for some keys
        if (e.key === 'Tab' || e.key === 'F11') {
            e.preventDefault();
        }
    }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (activeConnection) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            takeScreenshot();
        } else if (e.key === 'F11') {
            e.preventDefault();
            toggleFullscreen();
        } else if (e.key === 'F5') {
            e.preventDefault();
            refreshConnection();
        }
    }
}

// Open settings modal
function openSettingsModal() {
    document.getElementById('settingsModal').style.display = 'block';
}

// Close settings modal
function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

// Open save modal
function openSaveModal() {
    document.getElementById('saveConnectionModal').style.display = 'block';
}

// Close save modal
function closeSaveModal() {
    document.getElementById('saveConnectionModal').style.display = 'none';
}

// Save connection
function saveConnection(e) {
    e.preventDefault();
    
    const name = document.getElementById('connectionName').value;
    const description = document.getElementById('connectionDescription').value;
    
    if (activeConnection) {
        activeConnection.name = name;
        activeConnection.description = description;
        
        if (!connections.find(c => c.id === activeConnection.id)) {
            connections.push(activeConnection);
        }
        
        saveToStorage();
        renderConnections();
        closeSaveModal();
        
        alert('Connection saved!');
    }
}

// Save settings
function saveSettings() {
    if (activeConnection) {
        activeConnection.settings = getConnectionSettings();
        saveToStorage();
        closeSettingsModal();
        alert('Settings saved!');
    }
}

// Switch tab
function switchTab(tabName) {
    // Update tab button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Add sample connections
function addSampleConnections() {
    const sampleConnections = [
        {
            id: connectionIdCounter++,
            name: 'Main PC',
            description: 'Living room desktop PC',
            serverAddress: '192.168.1.100',
            port: 3389,
            username: 'admin',
            password: '',
            protocol: 'rdp',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            lastConnected: new Date(Date.now() - 3600000).toISOString(),
            settings: {
                screenSize: '1920x1080',
                colorDepth: '32',
                enableAudio: true,
                enableClipboard: true,
                enableFileTransfer: true,
                quality: 'high',
                compression: 3
            }
        },
        {
            id: connectionIdCounter++,
            name: 'Dev Server',
            description: 'Ubuntu development server',
            serverAddress: '192.168.1.200',
            port: 5900,
            username: 'developer',
            password: '',
            protocol: 'vnc',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            lastConnected: new Date(Date.now() - 7200000).toISOString(),
            settings: {
                screenSize: '1366x768',
                colorDepth: '24',
                enableAudio: false,
                enableClipboard: true,
                enableFileTransfer: true,
                quality: 'medium',
                compression: 5
            }
        },
        {
            id: connectionIdCounter++,
            name: 'Laptop',
            description: 'Bedroom laptop',
            serverAddress: '192.168.1.150',
            port: 22,
            username: 'user',
            password: '',
            protocol: 'ssh',
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            lastConnected: new Date(Date.now() - 10800000).toISOString(),
            settings: {
                screenSize: '1024x768',
                colorDepth: '16',
                enableAudio: false,
                enableClipboard: false,
                enableFileTransfer: true,
                quality: 'low',
                compression: 8
            }
        }
    ];
    
    connections = sampleConnections;
    saveToStorage();
    renderConnections();
}

// Data storage and loading
function saveToStorage() {
    localStorage.setItem('remoteDesktop_connections', JSON.stringify(connections));
    localStorage.setItem('remoteDesktop_counter', JSON.stringify(connectionIdCounter));
}

function loadFromStorage() {
    const storedConnections = localStorage.getItem('remoteDesktop_connections');
    const storedCounter = localStorage.getItem('remoteDesktop_counter');
    
    if (storedConnections) {
        connections = JSON.parse(storedConnections);
    }
    
    if (storedCounter) {
        connectionIdCounter = JSON.parse(storedCounter);
    }
}