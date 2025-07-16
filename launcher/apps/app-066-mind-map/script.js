// マインドマップアプリの機能

let canvas, ctx;
let nodes = [];
let connections = [];
let selectedNode = null;
let selectedTool = 'select';
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let zoom = 1;
let panX = 0;
let panY = 0;
let nodeIdCounter = 1;
let connectionIdCounter = 1;

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('mindMapCanvas');
    ctx = canvas.getContext('2d');
    
    // キャンバスサイズ設定
    resizeCanvas();
    
    loadFromStorage();
    initializeEventListeners();
    updateStats();
    renderCanvas();
    
    // ウィンドウリサイズ対応
    window.addEventListener('resize', resizeCanvas);
});

// キャンバスサイズ調整
function resizeCanvas() {
    const container = document.querySelector('.canvas-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    renderCanvas();
}

// イベントリスナーの初期化
function initializeEventListeners() {
    // ツールボタン
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedTool = this.dataset.tool;
            updateInstructions();
        });
    });
    
    // アクションボタン
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    
    // ビューボタン
    document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
    document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
    document.getElementById('fitViewBtn').addEventListener('click', fitView);
    
    // マップコントロール
    document.getElementById('saveMapBtn').addEventListener('click', saveMap);
    document.getElementById('loadMapBtn').addEventListener('click', loadMap);
    document.getElementById('newMapBtn').addEventListener('click', newMap);
    
    // エクスポートボタン
    document.getElementById('exportPNG').addEventListener('click', exportToPNG);
    document.getElementById('exportSVG').addEventListener('click', exportToSVG);
    document.getElementById('exportJSON').addEventListener('click', exportToJSON);
    document.getElementById('exportPDF').addEventListener('click', exportToPDF);
    
    // キャンバスマウスイベント
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    
    // スタイルコントロール
    document.getElementById('nodeBackgroundColor').addEventListener('change', updateNodeStyle);
    document.getElementById('nodeTextColor').addEventListener('change', updateNodeStyle);
    document.getElementById('nodeBorderColor').addEventListener('change', updateNodeStyle);
    document.getElementById('connectionColor').addEventListener('change', updateConnectionStyle);
    document.getElementById('connectionWidth').addEventListener('change', updateConnectionStyle);
    
    // モーダル関連
    document.getElementById('closeNodeModal').addEventListener('click', closeNodeModal);
    document.getElementById('saveNodeBtn').addEventListener('click', saveNodeFromModal);
    document.getElementById('deleteNodeBtn').addEventListener('click', deleteNodeFromModal);
    
    // モーダル外クリックで閉じる
    document.getElementById('nodeModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeNodeModal();
        }
    });
}

// マウスイベント処理
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;
    
    switch (selectedTool) {
        case 'select':
            selectNode(x, y);
            break;
        case 'add':
            addNode(x, y);
            break;
        case 'connect':
            startConnection(x, y);
            break;
        case 'text':
            editNodeText(x, y);
            break;
    }
    
    isDrawing = true;
    lastX = x;
    lastY = y;
}

function handleMouseMove(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;
    
    if (selectedTool === 'select' && selectedNode) {
        selectedNode.x = x;
        selectedNode.y = y;
        renderCanvas();
    }
    
    lastX = x;
    lastY = y;
}

function handleMouseUp(e) {
    isDrawing = false;
    if (selectedTool === 'select') {
        saveToStorage();
    }
}

function handleWheel(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));
    
    if (newZoom !== zoom) {
        panX = x - (x - panX) * (newZoom / zoom);
        panY = y - (y - panY) * (newZoom / zoom);
        zoom = newZoom;
        
        updateZoomDisplay();
        renderCanvas();
    }
}

// ノード関連機能
function addNode(x, y) {
    const nodeText = document.getElementById('nodeText').value || 'New Node';
    const nodeColor = document.getElementById('nodeColor').value;
    const nodeSize = document.getElementById('nodeSize').value;
    
    const node = {
        id: nodeIdCounter++,
        x: x,
        y: y,
        text: nodeText,
        description: '',
        color: nodeColor,
        size: nodeSize,
        shape: 'circle',
        created: new Date().toISOString()
    };
    
    nodes.push(node);
    updateStats();
    renderCanvas();
    updateNodeInfo(node);
    saveToStorage();
}

function selectNode(x, y) {
    selectedNode = null;
    
    // ノードをクリックしたかチェック
    for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        const radius = getNodeRadius(node);
        const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
        
        if (distance <= radius) {
            selectedNode = node;
            updateNodeInfo(node);
            renderCanvas();
            break;
        }
    }
    
    if (!selectedNode) {
        clearNodeInfo();
    }
}

function editNodeText(x, y) {
    const node = getNodeAt(x, y);
    if (node) {
        openNodeModal(node);
    }
}

function getNodeAt(x, y) {
    for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        const radius = getNodeRadius(node);
        const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
        
        if (distance <= radius) {
            return node;
        }
    }
    return null;
}

function getNodeRadius(node) {
    const baseRadius = 30;
    const sizeMultiplier = {
        'small': 0.8,
        'medium': 1.0,
        'large': 1.3
    };
    return baseRadius * (sizeMultiplier[node.size] || 1);
}

// 接続関連機能
function startConnection(x, y) {
    const node = getNodeAt(x, y);
    if (node) {
        // 簡単な実装：選択されたノードから新しい接続を開始
        if (selectedNode && selectedNode !== node) {
            createConnection(selectedNode, node);
        }
        selectedNode = node;
    }
}

function createConnection(fromNode, toNode) {
    const connection = {
        id: connectionIdCounter++,
        from: fromNode.id,
        to: toNode.id,
        created: new Date().toISOString()
    };
    
    connections.push(connection);
    updateStats();
    renderCanvas();
    saveToStorage();
}

// 描画関連
function renderCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);
    
    // 接続線を描画
    renderConnections();
    
    // ノードを描画
    renderNodes();
    
    ctx.restore();
}

function renderConnections() {
    const connectionColor = document.getElementById('connectionColor').value;
    const connectionWidth = document.getElementById('connectionWidth').value;
    
    ctx.strokeStyle = connectionColor;
    ctx.lineWidth = connectionWidth;
    
    connections.forEach(connection => {
        const fromNode = nodes.find(n => n.id === connection.from);
        const toNode = nodes.find(n => n.id === connection.to);
        
        if (fromNode && toNode) {
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();
        }
    });
}

function renderNodes() {
    nodes.forEach(node => {
        const radius = getNodeRadius(node);
        const isSelected = selectedNode && selectedNode.id === node.id;
        
        // ノードの背景
        ctx.fillStyle = node.color;
        ctx.beginPath();
        
        switch (node.shape) {
            case 'circle':
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                break;
            case 'rectangle':
                ctx.rect(node.x - radius, node.y - radius, radius * 2, radius * 2);
                break;
            case 'diamond':
                ctx.moveTo(node.x, node.y - radius);
                ctx.lineTo(node.x + radius, node.y);
                ctx.lineTo(node.x, node.y + radius);
                ctx.lineTo(node.x - radius, node.y);
                ctx.closePath();
                break;
        }
        
        ctx.fill();
        
        // 選択状態の境界線
        if (isSelected) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // ノードの境界線
        ctx.strokeStyle = document.getElementById('nodeBorderColor').value;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // テキスト
        ctx.fillStyle = document.getElementById('nodeTextColor').value;
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.text, node.x, node.y);
    });
}

// ズーム・パン機能
function zoomIn() {
    zoom = Math.min(5, zoom * 1.2);
    updateZoomDisplay();
    renderCanvas();
}

function zoomOut() {
    zoom = Math.max(0.1, zoom / 1.2);
    updateZoomDisplay();
    renderCanvas();
}

function fitView() {
    if (nodes.length === 0) return;
    
    const padding = 50;
    const minX = Math.min(...nodes.map(n => n.x)) - padding;
    const maxX = Math.max(...nodes.map(n => n.x)) + padding;
    const minY = Math.min(...nodes.map(n => n.y)) - padding;
    const maxY = Math.max(...nodes.map(n => n.y)) + padding;
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    const zoomX = canvas.width / contentWidth;
    const zoomY = canvas.height / contentHeight;
    zoom = Math.min(zoomX, zoomY, 2);
    
    panX = (canvas.width - contentWidth * zoom) / 2 - minX * zoom;
    panY = (canvas.height - contentHeight * zoom) / 2 - minY * zoom;
    
    updateZoomDisplay();
    renderCanvas();
}

function updateZoomDisplay() {
    document.getElementById('zoomLevel').textContent = Math.round(zoom * 100) + '%';
}

// 統計情報更新
function updateStats() {
    const totalNodes = nodes.length;
    const totalConnections = connections.length;
    const mapDepth = calculateMapDepth();
    const savedMaps = getSavedMapsCount();
    
    document.getElementById('totalNodes').textContent = totalNodes;
    document.getElementById('totalConnections').textContent = totalConnections;
    document.getElementById('mapDepth').textContent = mapDepth;
    document.getElementById('savedMaps').textContent = savedMaps;
}

function calculateMapDepth() {
    // 簡単な実装：最大の接続レベルを計算
    if (nodes.length === 0) return 0;
    
    // より詳細な実装が必要
    return Math.max(1, Math.ceil(Math.sqrt(connections.length)));
}

function getSavedMapsCount() {
    const savedMaps = localStorage.getItem('mindMap_savedMaps');
    return savedMaps ? JSON.parse(savedMaps).length : 0;
}

// ノード情報更新
function updateNodeInfo(node) {
    const nodeInfo = document.getElementById('nodeInfo');
    nodeInfo.innerHTML = `
        <div class="node-detail">
            <label>テキスト:</label>
            <span>${node.text}</span>
        </div>
        <div class="node-detail">
            <label>説明:</label>
            <span>${node.description || 'なし'}</span>
        </div>
        <div class="node-detail">
            <label>色:</label>
            <span style="display: inline-block; width: 20px; height: 20px; background: ${node.color}; border-radius: 50%;"></span>
        </div>
        <div class="node-detail">
            <label>形状:</label>
            <span>${getShapeText(node.shape)}</span>
        </div>
        <div class="node-detail">
            <label>作成日:</label>
            <span>${new Date(node.created).toLocaleString()}</span>
        </div>
    `;
}

function clearNodeInfo() {
    document.getElementById('nodeInfo').innerHTML = `
        <div class="no-selection">ノードが選択されていません</div>
    `;
}

function getShapeText(shape) {
    const shapes = {
        'circle': '円',
        'rectangle': '長方形',
        'diamond': '菱形',
        'triangle': '三角形'
    };
    return shapes[shape] || shape;
}

// 指示テキスト更新
function updateInstructions() {
    const instructions = {
        'select': '選択モード: ノードをクリックして選択、ドラッグして移動',
        'add': '追加モード: クリックして新しいノードを追加',
        'connect': '接続モード: ノードを選択してから別のノードをクリックして接続',
        'text': 'テキストモード: ノードをクリックして編集'
    };
    
    document.getElementById('instructions').textContent = instructions[selectedTool] || '';
}

// マップ管理
function saveMap() {
    const mapName = document.getElementById('mapName').value || 'Untitled Map';
    const mapData = {
        name: mapName,
        nodes: nodes,
        connections: connections,
        created: new Date().toISOString()
    };
    
    const savedMaps = JSON.parse(localStorage.getItem('mindMap_savedMaps') || '[]');
    savedMaps.push(mapData);
    localStorage.setItem('mindMap_savedMaps', JSON.stringify(savedMaps));
    
    renderSavedMaps();
    updateStats();
    alert('マップが保存されました');
}

function loadMap() {
    renderSavedMaps();
}

function newMap() {
    if (confirm('現在のマップをクリアしますか？')) {
        clearCanvas();
    }
}

function renderSavedMaps() {
    const savedMaps = JSON.parse(localStorage.getItem('mindMap_savedMaps') || '[]');
    const container = document.getElementById('savedMaps');
    
    if (savedMaps.length === 0) {
        container.innerHTML = '<div class="no-maps">保存されたマップがありません</div>';
        return;
    }
    
    container.innerHTML = savedMaps.map((map, index) => `
        <div class="map-item" onclick="loadSavedMap(${index})">
            <strong>${map.name}</strong><br>
            <small>${new Date(map.created).toLocaleString()}</small>
        </div>
    `).join('');
}

function loadSavedMap(index) {
    const savedMaps = JSON.parse(localStorage.getItem('mindMap_savedMaps') || '[]');
    const map = savedMaps[index];
    
    if (map) {
        nodes = map.nodes;
        connections = map.connections;
        updateStats();
        renderCanvas();
        saveToStorage();
        alert('マップが読み込まれました');
    }
}

// アクション
function undo() {
    // 簡単な実装：最後のノードを削除
    if (nodes.length > 0) {
        nodes.pop();
        updateStats();
        renderCanvas();
        saveToStorage();
    }
}

function redo() {
    // 実装は複雑なので省略
    alert('Redo機能は開発中です');
}

function clearCanvas() {
    if (confirm('すべてのノードと接続をクリアしますか？')) {
        nodes = [];
        connections = [];
        selectedNode = null;
        updateStats();
        renderCanvas();
        clearNodeInfo();
        saveToStorage();
    }
}

// スタイル更新
function updateNodeStyle() {
    renderCanvas();
}

function updateConnectionStyle() {
    renderCanvas();
}

// ノードモーダル
function openNodeModal(node) {
    document.getElementById('modalNodeText').value = node.text;
    document.getElementById('modalNodeDescription').value = node.description || '';
    document.getElementById('modalNodeColor').value = node.color;
    document.getElementById('modalNodeShape').value = node.shape;
    
    document.getElementById('nodeModal').style.display = 'block';
    document.getElementById('nodeModal').dataset.nodeId = node.id;
}

function closeNodeModal() {
    document.getElementById('nodeModal').style.display = 'none';
}

function saveNodeFromModal() {
    const nodeId = parseInt(document.getElementById('nodeModal').dataset.nodeId);
    const node = nodes.find(n => n.id === nodeId);
    
    if (node) {
        node.text = document.getElementById('modalNodeText').value;
        node.description = document.getElementById('modalNodeDescription').value;
        node.color = document.getElementById('modalNodeColor').value;
        node.shape = document.getElementById('modalNodeShape').value;
        
        renderCanvas();
        updateNodeInfo(node);
        saveToStorage();
        closeNodeModal();
    }
}

function deleteNodeFromModal() {
    const nodeId = parseInt(document.getElementById('nodeModal').dataset.nodeId);
    const nodeIndex = nodes.findIndex(n => n.id === nodeId);
    
    if (nodeIndex !== -1) {
        nodes.splice(nodeIndex, 1);
        connections = connections.filter(c => c.from !== nodeId && c.to !== nodeId);
        
        selectedNode = null;
        updateStats();
        renderCanvas();
        clearNodeInfo();
        saveToStorage();
        closeNodeModal();
    }
}

// エクスポート機能
function exportToPNG() {
    const link = document.createElement('a');
    link.download = 'mindmap.png';
    link.href = canvas.toDataURL();
    link.click();
}

function exportToSVG() {
    alert('SVG エクスポート機能は開発中です');
}

function exportToJSON() {
    const data = {
        nodes: nodes,
        connections: connections,
        exportDate: new Date().toISOString()
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
}

function exportToPDF() {
    alert('PDF エクスポート機能は開発中です');
}

// データの保存と読み込み
function saveToStorage() {
    localStorage.setItem('mindMap_nodes', JSON.stringify(nodes));
    localStorage.setItem('mindMap_connections', JSON.stringify(connections));
    localStorage.setItem('mindMap_counters', JSON.stringify({
        nodeIdCounter,
        connectionIdCounter
    }));
}

function loadFromStorage() {
    const storedNodes = localStorage.getItem('mindMap_nodes');
    const storedConnections = localStorage.getItem('mindMap_connections');
    const storedCounters = localStorage.getItem('mindMap_counters');
    
    if (storedNodes) {
        nodes = JSON.parse(storedNodes);
    }
    
    if (storedConnections) {
        connections = JSON.parse(storedConnections);
    }
    
    if (storedCounters) {
        const counters = JSON.parse(storedCounters);
        nodeIdCounter = counters.nodeIdCounter || 1;
        connectionIdCounter = counters.connectionIdCounter || 1;
    }
    
    renderSavedMaps();
}