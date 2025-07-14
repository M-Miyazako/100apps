class FlowChartDesigner {
    constructor() {
        this.canvas = document.getElementById('flowchart-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.elements = [];
        this.connections = [];
        this.selectedElement = null;
        this.selectedTool = 'select';
        this.isDragging = false;
        this.isConnecting = false;
        this.dragStart = { x: 0, y: 0 };
        this.currentConnection = null;
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        this.clipboard = null;
        this.layerCounter = 1;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupPropertyControls();
        this.render();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.render();
    }

    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedTool = btn.dataset.tool;
                this.canvas.style.cursor = this.getCursor();
            });
        });

        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));

        // Action buttons
        document.getElementById('clear-canvas').addEventListener('click', () => this.clearCanvas());
        document.getElementById('export-png').addEventListener('click', () => this.exportPNG());
        document.getElementById('export-svg').addEventListener('click', () => this.exportSVG());
        document.getElementById('export-json').addEventListener('click', () => this.exportJSON());

        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoom-fit').addEventListener('click', () => this.zoomFit());

        // Grid toggle
        document.getElementById('show-grid').addEventListener('change', (e) => {
            document.getElementById('grid-overlay').classList.toggle('hidden', !e.target.checked);
        });

        // Context menu
        document.getElementById('context-menu').addEventListener('click', (e) => {
            if (e.target.classList.contains('context-item')) {
                this.handleContextAction(e.target.dataset.action);
                this.hideContextMenu();
            }
        });

        // Hide context menu on click outside
        document.addEventListener('click', () => this.hideContextMenu());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Text modal
        this.setupTextModal();

        // Templates
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.loadTemplate(btn.dataset.template);
            });
        });
    }

    setupPropertyControls() {
        const controls = {
            'fill-color': (value) => this.updateSelectedProperty('fillColor', value),
            'border-color': (value) => this.updateSelectedProperty('borderColor', value),
            'border-width': (value) => {
                this.updateSelectedProperty('borderWidth', parseInt(value));
                document.getElementById('border-width-value').textContent = value + 'px';
            },
            'font-size': (value) => {
                this.updateSelectedProperty('fontSize', parseInt(value));
                document.getElementById('font-size-value').textContent = value + 'px';
            },
            'text-color': (value) => this.updateSelectedProperty('textColor', value)
        };

        Object.keys(controls).forEach(id => {
            const element = document.getElementById(id);
            element.addEventListener('input', (e) => controls[id](e.target.value));
        });
    }

    setupTextModal() {
        const modal = document.getElementById('text-modal');
        const textInput = document.getElementById('text-input');
        const saveBtn = document.getElementById('save-text');
        const cancelBtn = document.getElementById('cancel-text');
        const closeBtn = document.getElementById('close-text-modal');

        const closeModal = () => {
            modal.style.display = 'none';
            textInput.value = '';
            this.currentTextElement = null;
        };

        saveBtn.addEventListener('click', () => {
            if (this.currentTextElement) {
                this.currentTextElement.text = textInput.value;
                this.render();
                this.updateLayers();
            }
            closeModal();
        });

        [cancelBtn, closeBtn].forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    getCursor() {
        switch (this.selectedTool) {
            case 'select': return 'default';
            case 'text': return 'text';
            case 'connector': return 'crosshair';
            default: return 'crosshair';
        }
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - this.pan.x) / this.zoom,
            y: (e.clientY - rect.top - this.pan.y) / this.zoom
        };
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        
        if (this.selectedTool === 'select') {
            this.selectedElement = this.getElementAt(pos.x, pos.y);
            if (this.selectedElement) {
                this.isDragging = true;
                this.dragStart = { x: pos.x - this.selectedElement.x, y: pos.y - this.selectedElement.y };
            }
        } else if (this.selectedTool === 'connector') {
            const element = this.getElementAt(pos.x, pos.y);
            if (element) {
                this.isConnecting = true;
                this.currentConnection = {
                    from: element,
                    to: null,
                    startX: element.x + element.width / 2,
                    startY: element.y + element.height / 2,
                    endX: pos.x,
                    endY: pos.y
                };
            }
        } else {
            this.createElement(pos.x, pos.y);
        }
        
        this.render();
    }

    handleMouseMove(e) {
        const pos = this.getMousePos(e);
        
        if (this.isDragging && this.selectedElement) {
            this.selectedElement.x = pos.x - this.dragStart.x;
            this.selectedElement.y = pos.y - this.dragStart.y;
            this.render();
        } else if (this.isConnecting && this.currentConnection) {
            this.currentConnection.endX = pos.x;
            this.currentConnection.endY = pos.y;
            this.render();
        }
    }

    handleMouseUp(e) {
        const pos = this.getMousePos(e);
        
        if (this.isConnecting && this.currentConnection) {
            const targetElement = this.getElementAt(pos.x, pos.y);
            if (targetElement && targetElement !== this.currentConnection.from) {
                this.currentConnection.to = targetElement;
                this.connections.push({
                    from: this.currentConnection.from,
                    to: this.currentConnection.to,
                    id: this.generateId()
                });
                this.updateLayers();
            }
            this.currentConnection = null;
            this.isConnecting = false;
        }
        
        this.isDragging = false;
        this.render();
    }

    handleContextMenu(e) {
        e.preventDefault();
        const pos = this.getMousePos(e);
        this.selectedElement = this.getElementAt(pos.x, pos.y);
        
        if (this.selectedElement) {
            this.showContextMenu(e.clientX, e.clientY);
        }
    }

    handleDoubleClick(e) {
        const pos = this.getMousePos(e);
        const element = this.getElementAt(pos.x, pos.y);
        
        if (element && element.type !== 'connector') {
            this.editText(element);
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Delete' && this.selectedElement) {
            this.deleteElement(this.selectedElement);
        } else if (e.ctrlKey || e.metaKey) {
            if (e.key === 'c' && this.selectedElement) {
                this.copyElement();
            } else if (e.key === 'v' && this.clipboard) {
                this.pasteElement();
            } else if (e.key === 'z') {
                // Undo functionality can be added here
            }
        }
    }

    createElement(x, y) {
        const element = {
            id: this.generateId(),
            type: this.selectedTool,
            x: x - 50,
            y: y - 25,
            width: 100,
            height: 50,
            fillColor: document.getElementById('fill-color').value,
            borderColor: document.getElementById('border-color').value,
            borderWidth: parseInt(document.getElementById('border-width').value),
            fontSize: parseInt(document.getElementById('font-size').value),
            textColor: document.getElementById('text-color').value,
            text: 'New ' + this.selectedTool,
            layer: this.layerCounter++
        };
        
        if (this.selectedTool === 'text') {
            element.width = 200;
            element.height = 30;
            this.editText(element);
        }
        
        this.elements.push(element);
        this.selectedElement = element;
        this.updateLayers();
    }

    getElementAt(x, y) {
        for (let i = this.elements.length - 1; i >= 0; i--) {
            const element = this.elements[i];
            if (x >= element.x && x <= element.x + element.width &&
                y >= element.y && y <= element.y + element.height) {
                return element;
            }
        }
        return null;
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.translate(this.pan.x, this.pan.y);
        this.ctx.scale(this.zoom, this.zoom);
        
        // Draw connections
        this.connections.forEach(connection => this.drawConnection(connection));
        
        // Draw current connection being created
        if (this.currentConnection) {
            this.drawTemporaryConnection(this.currentConnection);
        }
        
        // Draw elements
        this.elements.forEach(element => this.drawElement(element));
        
        this.ctx.restore();
        
        this.updateZoomDisplay();
    }

    drawElement(element) {
        this.ctx.save();
        
        // Set styles
        this.ctx.fillStyle = element.fillColor;
        this.ctx.strokeStyle = element.borderColor;
        this.ctx.lineWidth = element.borderWidth;
        this.ctx.font = `${element.fontSize}px Arial`;
        this.ctx.fillStyle = element.fillColor;
        
        // Draw shape
        switch (element.type) {
            case 'rectangle':
                this.ctx.fillRect(element.x, element.y, element.width, element.height);
                this.ctx.strokeRect(element.x, element.y, element.width, element.height);
                break;
            case 'circle':
                const centerX = element.x + element.width / 2;
                const centerY = element.y + element.height / 2;
                const radius = Math.min(element.width, element.height) / 2;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.stroke();
                break;
            case 'diamond':
                const midX = element.x + element.width / 2;
                const midY = element.y + element.height / 2;
                this.ctx.beginPath();
                this.ctx.moveTo(midX, element.y);
                this.ctx.lineTo(element.x + element.width, midY);
                this.ctx.lineTo(midX, element.y + element.height);
                this.ctx.lineTo(element.x, midY);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                break;
            case 'text':
                break; // No background for text elements
        }
        
        // Draw text
        if (element.text) {
            this.ctx.fillStyle = element.textColor;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                element.text,
                element.x + element.width / 2,
                element.y + element.height / 2
            );
        }
        
        // Draw selection highlight
        if (element === this.selectedElement) {
            this.ctx.strokeStyle = '#3498db';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(element.x - 2, element.y - 2, element.width + 4, element.height + 4);
            this.ctx.setLineDash([]);
        }
        
        this.ctx.restore();
    }

    drawConnection(connection) {
        this.ctx.save();
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 2;
        
        const fromX = connection.from.x + connection.from.width / 2;
        const fromY = connection.from.y + connection.from.height / 2;
        const toX = connection.to.x + connection.to.width / 2;
        const toY = connection.to.y + connection.to.height / 2;
        
        // Draw line
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        
        // Draw arrow
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;
        
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(
            toX - arrowLength * Math.cos(angle - arrowAngle),
            toY - arrowLength * Math.sin(angle - arrowAngle)
        );
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(
            toX - arrowLength * Math.cos(angle + arrowAngle),
            toY - arrowLength * Math.sin(angle + arrowAngle)
        );
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawTemporaryConnection(connection) {
        this.ctx.save();
        this.ctx.strokeStyle = '#95a5a6';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(connection.startX, connection.startY);
        this.ctx.lineTo(connection.endX, connection.endY);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    updateSelectedProperty(property, value) {
        if (this.selectedElement) {
            this.selectedElement[property] = value;
            this.render();
        }
    }

    showContextMenu(x, y) {
        const menu = document.getElementById('context-menu');
        menu.style.display = 'block';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
    }

    hideContextMenu() {
        document.getElementById('context-menu').style.display = 'none';
    }

    handleContextAction(action) {
        if (!this.selectedElement) return;
        
        switch (action) {
            case 'copy':
                this.copyElement();
                break;
            case 'paste':
                this.pasteElement();
                break;
            case 'delete':
                this.deleteElement(this.selectedElement);
                break;
            case 'bring-front':
                this.bringToFront(this.selectedElement);
                break;
            case 'send-back':
                this.sendToBack(this.selectedElement);
                break;
        }
    }

    copyElement() {
        if (this.selectedElement) {
            this.clipboard = JSON.parse(JSON.stringify(this.selectedElement));
        }
    }

    pasteElement() {
        if (this.clipboard) {
            const newElement = JSON.parse(JSON.stringify(this.clipboard));
            newElement.id = this.generateId();
            newElement.x += 20;
            newElement.y += 20;
            newElement.layer = this.layerCounter++;
            this.elements.push(newElement);
            this.selectedElement = newElement;
            this.updateLayers();
            this.render();
        }
    }

    deleteElement(element) {
        const index = this.elements.indexOf(element);
        if (index > -1) {
            this.elements.splice(index, 1);
            // Remove connections involving this element
            this.connections = this.connections.filter(
                conn => conn.from !== element && conn.to !== element
            );
            this.selectedElement = null;
            this.updateLayers();
            this.render();
        }
    }

    bringToFront(element) {
        element.layer = Math.max(...this.elements.map(e => e.layer)) + 1;
        this.elements.sort((a, b) => a.layer - b.layer);
        this.updateLayers();
        this.render();
    }

    sendToBack(element) {
        element.layer = Math.min(...this.elements.map(e => e.layer)) - 1;
        this.elements.sort((a, b) => a.layer - b.layer);
        this.updateLayers();
        this.render();
    }

    editText(element) {
        this.currentTextElement = element;
        const modal = document.getElementById('text-modal');
        const textInput = document.getElementById('text-input');
        textInput.value = element.text || '';
        modal.style.display = 'flex';
        textInput.focus();
    }

    updateLayers() {
        const layersList = document.getElementById('layers-list');
        layersList.innerHTML = '';
        
        // Sort elements by layer
        const sortedElements = [...this.elements].sort((a, b) => b.layer - a.layer);
        
        sortedElements.forEach(element => {
            const layerItem = document.createElement('div');
            layerItem.className = 'layer-item';
            if (element === this.selectedElement) {
                layerItem.classList.add('selected');
            }
            
            layerItem.innerHTML = `
                <div class="layer-icon">
                    <i class="fas fa-${this.getLayerIcon(element.type)}"></i>
                </div>
                <div class="layer-name">${element.text || element.type}</div>
                <div class="layer-visible">
                    <i class="fas fa-eye"></i>
                </div>
            `;
            
            layerItem.addEventListener('click', () => {
                this.selectedElement = element;
                this.render();
                this.updateLayers();
            });
            
            layersList.appendChild(layerItem);
        });
    }

    getLayerIcon(type) {
        const icons = {
            rectangle: 'square',
            circle: 'circle',
            diamond: 'gem',
            text: 'font'
        };
        return icons[type] || 'square';
    }

    clearCanvas() {
        if (confirm('Are you sure you want to clear the canvas?')) {
            this.elements = [];
            this.connections = [];
            this.selectedElement = null;
            this.layerCounter = 1;
            this.updateLayers();
            this.render();
        }
    }

    zoomIn() {
        this.zoom = Math.min(this.zoom * 1.2, 3);
        this.render();
    }

    zoomOut() {
        this.zoom = Math.max(this.zoom / 1.2, 0.1);
        this.render();
    }

    zoomFit() {
        if (this.elements.length === 0) return;
        
        const bounds = this.getBounds();
        const padding = 50;
        
        const scaleX = (this.canvas.width - padding * 2) / bounds.width;
        const scaleY = (this.canvas.height - padding * 2) / bounds.height;
        
        this.zoom = Math.min(scaleX, scaleY, 1);
        this.pan.x = padding - bounds.x * this.zoom;
        this.pan.y = padding - bounds.y * this.zoom;
        
        this.render();
    }

    getBounds() {
        if (this.elements.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        this.elements.forEach(element => {
            minX = Math.min(minX, element.x);
            minY = Math.min(minY, element.y);
            maxX = Math.max(maxX, element.x + element.width);
            maxY = Math.max(maxY, element.y + element.height);
        });
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    updateZoomDisplay() {
        document.getElementById('zoom-level').textContent = Math.round(this.zoom * 100) + '%';
    }

    exportPNG() {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        const bounds = this.getBounds();
        const padding = 20;
        
        tempCanvas.width = bounds.width + padding * 2;
        tempCanvas.height = bounds.height + padding * 2;
        
        // Fill white background
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        tempCtx.translate(-bounds.x + padding, -bounds.y + padding);
        
        // Draw connections
        this.connections.forEach(connection => {
            this.drawConnectionOnContext(tempCtx, connection);
        });
        
        // Draw elements
        this.elements.forEach(element => {
            this.drawElementOnContext(tempCtx, element);
        });
        
        // Download
        const link = document.createElement('a');
        link.download = 'flowchart.png';
        link.href = tempCanvas.toDataURL();
        link.click();
    }

    exportSVG() {
        const bounds = this.getBounds();
        const padding = 20;
        
        let svg = `<svg width="${bounds.width + padding * 2}" height="${bounds.height + padding * 2}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Background
        svg += `<rect width="100%" height="100%" fill="white"/>`;
        
        // Transform group
        svg += `<g transform="translate(${-bounds.x + padding}, ${-bounds.y + padding})">`;
        
        // Draw connections
        this.connections.forEach(connection => {
            svg += this.connectionToSVG(connection);
        });
        
        // Draw elements
        this.elements.forEach(element => {
            svg += this.elementToSVG(element);
        });
        
        svg += '</g></svg>';
        
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'flowchart.svg';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    exportJSON() {
        const data = {
            elements: this.elements,
            connections: this.connections,
            zoom: this.zoom,
            pan: this.pan
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'flowchart.json';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    drawElementOnContext(ctx, element) {
        ctx.save();
        
        ctx.fillStyle = element.fillColor;
        ctx.strokeStyle = element.borderColor;
        ctx.lineWidth = element.borderWidth;
        ctx.font = `${element.fontSize}px Arial`;
        
        switch (element.type) {
            case 'rectangle':
                ctx.fillRect(element.x, element.y, element.width, element.height);
                ctx.strokeRect(element.x, element.y, element.width, element.height);
                break;
            case 'circle':
                const centerX = element.x + element.width / 2;
                const centerY = element.y + element.height / 2;
                const radius = Math.min(element.width, element.height) / 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                break;
            case 'diamond':
                const midX = element.x + element.width / 2;
                const midY = element.y + element.height / 2;
                ctx.beginPath();
                ctx.moveTo(midX, element.y);
                ctx.lineTo(element.x + element.width, midY);
                ctx.lineTo(midX, element.y + element.height);
                ctx.lineTo(element.x, midY);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
        }
        
        if (element.text) {
            ctx.fillStyle = element.textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                element.text,
                element.x + element.width / 2,
                element.y + element.height / 2
            );
        }
        
        ctx.restore();
    }

    drawConnectionOnContext(ctx, connection) {
        ctx.save();
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        
        const fromX = connection.from.x + connection.from.width / 2;
        const fromY = connection.from.y + connection.from.height / 2;
        const toX = connection.to.x + connection.to.width / 2;
        const toY = connection.to.y + connection.to.height / 2;
        
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;
        
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - arrowLength * Math.cos(angle - arrowAngle),
            toY - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - arrowLength * Math.cos(angle + arrowAngle),
            toY - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.stroke();
        
        ctx.restore();
    }

    elementToSVG(element) {
        let svg = '';
        const x = element.x;
        const y = element.y;
        const width = element.width;
        const height = element.height;
        
        const style = `fill="${element.fillColor}" stroke="${element.borderColor}" stroke-width="${element.borderWidth}"`;
        
        switch (element.type) {
            case 'rectangle':
                svg += `<rect x="${x}" y="${y}" width="${width}" height="${height}" ${style}/>`;
                break;
            case 'circle':
                const cx = x + width / 2;
                const cy = y + height / 2;
                const r = Math.min(width, height) / 2;
                svg += `<circle cx="${cx}" cy="${cy}" r="${r}" ${style}/>`;
                break;
            case 'diamond':
                const midX = x + width / 2;
                const midY = y + height / 2;
                const points = `${midX},${y} ${x + width},${midY} ${midX},${y + height} ${x},${midY}`;
                svg += `<polygon points="${points}" ${style}/>`;
                break;
        }
        
        if (element.text) {
            svg += `<text x="${x + width / 2}" y="${y + height / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="${element.fontSize}" fill="${element.textColor}">${element.text}</text>`;
        }
        
        return svg;
    }

    connectionToSVG(connection) {
        const fromX = connection.from.x + connection.from.width / 2;
        const fromY = connection.from.y + connection.from.height / 2;
        const toX = connection.to.x + connection.to.width / 2;
        const toY = connection.to.y + connection.to.height / 2;
        
        let svg = `<line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" stroke="#2c3e50" stroke-width="2"/>`;
        
        // Arrow
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;
        
        const arrowX1 = toX - arrowLength * Math.cos(angle - arrowAngle);
        const arrowY1 = toY - arrowLength * Math.sin(angle - arrowAngle);
        const arrowX2 = toX - arrowLength * Math.cos(angle + arrowAngle);
        const arrowY2 = toY - arrowLength * Math.sin(angle + arrowAngle);
        
        svg += `<line x1="${toX}" y1="${toY}" x2="${arrowX1}" y2="${arrowY1}" stroke="#2c3e50" stroke-width="2"/>`;
        svg += `<line x1="${toX}" y1="${toY}" x2="${arrowX2}" y2="${arrowY2}" stroke="#2c3e50" stroke-width="2"/>`;
        
        return svg;
    }

    loadTemplate(template) {
        this.clearCanvas();
        
        switch (template) {
            case 'basic-flow':
                this.loadBasicFlowTemplate();
                break;
            case 'decision-tree':
                this.loadDecisionTreeTemplate();
                break;
            case 'process-flow':
                this.loadProcessFlowTemplate();
                break;
        }
    }

    loadBasicFlowTemplate() {
        const start = this.createTemplateElement('circle', 100, 50, 'Start');
        const process = this.createTemplateElement('rectangle', 100, 150, 'Process');
        const end = this.createTemplateElement('circle', 100, 250, 'End');
        
        this.connections.push(
            { from: start, to: process, id: this.generateId() },
            { from: process, to: end, id: this.generateId() }
        );
        
        this.updateLayers();
        this.render();
    }

    loadDecisionTreeTemplate() {
        const start = this.createTemplateElement('circle', 200, 50, 'Start');
        const decision = this.createTemplateElement('diamond', 200, 150, 'Decision');
        const yes = this.createTemplateElement('rectangle', 100, 250, 'Yes');
        const no = this.createTemplateElement('rectangle', 300, 250, 'No');
        
        this.connections.push(
            { from: start, to: decision, id: this.generateId() },
            { from: decision, to: yes, id: this.generateId() },
            { from: decision, to: no, id: this.generateId() }
        );
        
        this.updateLayers();
        this.render();
    }

    loadProcessFlowTemplate() {
        const input = this.createTemplateElement('rectangle', 100, 50, 'Input');
        const process1 = this.createTemplateElement('rectangle', 100, 150, 'Process 1');
        const process2 = this.createTemplateElement('rectangle', 100, 250, 'Process 2');
        const output = this.createTemplateElement('rectangle', 100, 350, 'Output');
        
        this.connections.push(
            { from: input, to: process1, id: this.generateId() },
            { from: process1, to: process2, id: this.generateId() },
            { from: process2, to: output, id: this.generateId() }
        );
        
        this.updateLayers();
        this.render();
    }

    createTemplateElement(type, x, y, text) {
        const element = {
            id: this.generateId(),
            type: type,
            x: x,
            y: y,
            width: 100,
            height: 50,
            fillColor: '#ffffff',
            borderColor: '#000000',
            borderWidth: 2,
            fontSize: 14,
            textColor: '#000000',
            text: text,
            layer: this.layerCounter++
        };
        
        this.elements.push(element);
        return element;
    }

    generateId() {
        return 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new FlowChartDesigner();
});