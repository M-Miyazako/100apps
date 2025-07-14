class WireframeTool {
    constructor() {
        this.canvas = document.getElementById('wireframe-canvas');
        this.elements = [];
        this.selectedElement = null;
        this.selectedTool = 'select';
        this.isDragging = false;
        this.isResizing = false;
        this.dragStart = { x: 0, y: 0 };
        this.resizeHandle = null;
        this.zoom = 1;
        this.snapToGrid = true;
        this.gridSize = 20;
        this.clipboard = null;
        this.history = [];
        this.historyIndex = -1;
        this.currentDevice = 'desktop';
        this.layerCounter = 1;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupDeviceSelector();
        this.updateCanvasSize();
        this.updateLayers();
        this.saveState();
    }

    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedTool = btn.dataset.tool;
            });
        });

        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));

        // Action buttons
        document.getElementById('preview-mode').addEventListener('click', () => this.showPreview());
        document.getElementById('export-html').addEventListener('click', () => this.exportHTML());
        document.getElementById('export-png').addEventListener('click', () => this.exportPNG());
        document.getElementById('export-json').addEventListener('click', () => this.exportJSON());

        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoom-fit').addEventListener('click', () => this.zoomFit());

        // Grid and snap toggles
        document.getElementById('show-grid').addEventListener('change', (e) => {
            document.getElementById('grid-overlay').classList.toggle('hidden', !e.target.checked);
        });

        document.getElementById('snap-to-grid').addEventListener('change', (e) => {
            this.snapToGrid = e.target.checked;
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

        // History buttons
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('redo-btn').addEventListener('click', () => this.redo());

        // Template buttons
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.loadTemplate(btn.dataset.template);
            });
        });

        // Modals
        this.setupModals();
    }

    setupDragAndDrop() {
        // Component drag start
        document.querySelectorAll('.component-item, .layout-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const type = item.dataset.component || item.dataset.layout;
                e.dataTransfer.setData('text/plain', type);
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
            });
        });

        // Canvas drop events
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            document.getElementById('drop-zone').classList.add('drag-over');
        });

        this.canvas.addEventListener('dragleave', (e) => {
            if (!this.canvas.contains(e.relatedTarget)) {
                document.getElementById('drop-zone').classList.remove('drag-over');
            }
        });

        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('text/plain');
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.createElement(type, x, y);
            document.getElementById('drop-zone').classList.remove('drag-over');
            this.hideDropZone();
        });
    }

    setupDeviceSelector() {
        const deviceSelect = document.getElementById('device-select');
        deviceSelect.addEventListener('change', (e) => {
            this.currentDevice = e.target.value;
            this.updateCanvasSize();
            this.updateDeviceInfo();
        });
    }

    setupModals() {
        // Preview modal
        const previewModal = document.getElementById('preview-modal');
        const closePreview = document.getElementById('close-preview');
        
        closePreview.addEventListener('click', () => {
            previewModal.style.display = 'none';
        });

        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                previewModal.style.display = 'none';
            }
        });

        // Text modal
        const textModal = document.getElementById('text-modal');
        const textInput = document.getElementById('text-input');
        const saveText = document.getElementById('save-text');
        const cancelText = document.getElementById('cancel-text');
        const closeTextModal = document.getElementById('close-text-modal');

        const closeTextModalFn = () => {
            textModal.style.display = 'none';
            textInput.value = '';
            this.currentTextElement = null;
        };

        saveText.addEventListener('click', () => {
            if (this.currentTextElement) {
                this.currentTextElement.textContent = textInput.value;
                this.currentTextElement.dataset.text = textInput.value;
                this.updateProperties();
                this.saveState();
            }
            closeTextModalFn();
        });

        [cancelText, closeTextModal].forEach(btn => {
            btn.addEventListener('click', closeTextModalFn);
        });

        textModal.addEventListener('click', (e) => {
            if (e.target === textModal) closeTextModalFn();
        });
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        
        if (this.snapToGrid) {
            x = Math.round(x / this.gridSize) * this.gridSize;
            y = Math.round(y / this.gridSize) * this.gridSize;
        }
        
        return { x, y };
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        const element = this.getElementAt(pos.x, pos.y);
        
        // Check if clicking on resize handle
        if (this.selectedElement) {
            const handle = this.getResizeHandle(pos.x, pos.y);
            if (handle) {
                this.isResizing = true;
                this.resizeHandle = handle;
                this.dragStart = pos;
                return;
            }
        }
        
        if (this.selectedTool === 'select') {
            if (element) {
                this.selectElement(element);
                this.isDragging = true;
                const elementRect = element.getBoundingClientRect();
                const canvasRect = this.canvas.getBoundingClientRect();
                this.dragStart = {
                    x: pos.x - (elementRect.left - canvasRect.left),
                    y: pos.y - (elementRect.top - canvasRect.top)
                };
            } else {
                this.selectElement(null);
            }
        } else {
            this.createShapeElement(this.selectedTool, pos.x, pos.y);
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging && !this.isResizing) return;
        
        const pos = this.getMousePos(e);
        
        if (this.isResizing && this.selectedElement && this.resizeHandle) {
            this.resizeElement(this.selectedElement, this.resizeHandle, pos);
        } else if (this.isDragging && this.selectedElement) {
            const newX = pos.x - this.dragStart.x;
            const newY = pos.y - this.dragStart.y;
            
            this.selectedElement.style.left = Math.max(0, newX) + 'px';
            this.selectedElement.style.top = Math.max(0, newY) + 'px';
            
            this.updateProperties();
        }
    }

    handleMouseUp(e) {
        if (this.isDragging || this.isResizing) {
            this.saveState();
        }
        
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }

    handleContextMenu(e) {
        e.preventDefault();
        const pos = this.getMousePos(e);
        const element = this.getElementAt(pos.x, pos.y);
        
        if (element) {
            this.selectElement(element);
            this.showContextMenu(e.clientX, e.clientY);
        }
    }

    handleDoubleClick(e) {
        const pos = this.getMousePos(e);
        const element = this.getElementAt(pos.x, pos.y);
        
        if (element && element.classList.contains('wireframe-text')) {
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
            } else if (e.key === 'z' && !e.shiftKey) {
                this.undo();
            } else if (e.key === 'z' && e.shiftKey) {
                this.redo();
            }
        }
    }

    createElement(type, x, y) {
        const element = document.createElement('div');
        element.className = `wireframe-element wireframe-${type}`;
        element.dataset.type = type;
        element.dataset.id = this.generateId();
        element.dataset.layer = this.layerCounter++;
        
        // Set default size and position
        const defaultSize = this.getDefaultSize(type);
        element.style.left = Math.max(0, x - defaultSize.width / 2) + 'px';
        element.style.top = Math.max(0, y - defaultSize.height / 2) + 'px';
        element.style.width = defaultSize.width + 'px';
        element.style.height = defaultSize.height + 'px';
        
        // Set content based on type
        this.setElementContent(element, type);
        
        // Add to canvas
        this.canvas.appendChild(element);
        this.elements.push(element);
        
        // Select the new element
        this.selectElement(element);
        this.hideDropZone();
        this.updateLayers();
        this.saveState();
        
        return element;
    }

    createShapeElement(type, x, y) {
        if (type === 'text') {
            const element = this.createElement('text', x, y);
            setTimeout(() => this.editText(element), 100);
        } else {
            const element = document.createElement('div');
            element.className = 'wireframe-element';
            element.dataset.type = type;
            element.dataset.id = this.generateId();
            element.dataset.layer = this.layerCounter++;
            
            const size = 100;
            element.style.left = Math.max(0, x - size / 2) + 'px';
            element.style.top = Math.max(0, y - size / 2) + 'px';
            element.style.width = size + 'px';
            element.style.height = size + 'px';
            element.style.border = '2px solid #adb5bd';
            element.style.background = 'transparent';
            
            if (type === 'circle') {
                element.style.borderRadius = '50%';
            } else if (type === 'line') {
                element.style.height = '2px';
                element.style.background = '#adb5bd';
                element.style.border = 'none';
            } else if (type === 'image') {
                element.style.border = '2px dashed #dee2e6';
                element.style.background = '#f8f9fa';
                element.innerHTML = '<i class="fas fa-image" style="font-size: 2rem; color: #adb5bd; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></i>';
            }
            
            this.canvas.appendChild(element);
            this.elements.push(element);
            this.selectElement(element);
            this.updateLayers();
            this.saveState();
        }
    }

    getDefaultSize(type) {
        const sizes = {
            button: { width: 120, height: 40 },
            input: { width: 200, height: 40 },
            checkbox: { width: 150, height: 30 },
            radio: { width: 150, height: 30 },
            dropdown: { width: 200, height: 40 },
            textarea: { width: 300, height: 120 },
            header: { width: 400, height: 60 },
            navigation: { width: 400, height: 50 },
            card: { width: 300, height: 200 },
            table: { width: 400, height: 200 },
            sidebar: { width: 200, height: 300 },
            footer: { width: 400, height: 80 },
            text: { width: 200, height: 30 },
            container: { width: 600, height: 400 },
            row: { width: 600, height: 100 },
            column: { width: 200, height: 400 },
            grid: { width: 600, height: 400 }
        };
        
        return sizes[type] || { width: 200, height: 100 };
    }

    setElementContent(element, type) {
        const contents = {
            button: 'Button',
            input: 'Input field',
            checkbox: '<input type="checkbox" style="margin-right: 8px;">Checkbox',
            radio: '<input type="radio" style="margin-right: 8px;">Radio button',
            dropdown: 'Select option ▼',
            textarea: 'Textarea content...',
            header: 'Header',
            navigation: '<span>Home</span><span>About</span><span>Contact</span>',
            card: 'Card Title<br><br>Card content goes here...',
            table: '<div style="border-bottom: 1px solid #dee2e6; padding: 10px; background: #f8f9fa; font-weight: bold;">Header 1 | Header 2</div><div style="padding: 10px;">Row 1 Data | Row 1 Data</div><div style="padding: 10px;">Row 2 Data | Row 2 Data</div>',
            sidebar: 'Sidebar<br><br>• Menu Item 1<br>• Menu Item 2<br>• Menu Item 3',
            footer: '© 2024 Company Name. All rights reserved.',
            text: 'Text Content',
            container: '<div style="padding: 20px; border: 1px dashed #adb5bd; height: 100%; box-sizing: border-box; color: #6c757d;">Container</div>',
            row: '<div style="display: flex; height: 100%;"><div style="flex: 1; border: 1px dashed #adb5bd; margin: 5px; padding: 10px; color: #6c757d;">Column 1</div><div style="flex: 1; border: 1px dashed #adb5bd; margin: 5px; padding: 10px; color: #6c757d;">Column 2</div></div>',
            column: '<div style="height: 100%; border: 1px dashed #adb5bd; padding: 10px; color: #6c757d;">Column</div>',
            grid: '<div style="display: grid; grid-template-columns: 1fr 1fr; grid-gap: 10px; height: 100%; padding: 10px;"><div style="border: 1px dashed #adb5bd; padding: 10px; color: #6c757d;">Grid Item 1</div><div style="border: 1px dashed #adb5bd; padding: 10px; color: #6c757d;">Grid Item 2</div><div style="border: 1px dashed #adb5bd; padding: 10px; color: #6c757d;">Grid Item 3</div><div style="border: 1px dashed #adb5bd; padding: 10px; color: #6c757d;">Grid Item 4</div></div>'
        };
        
        if (contents[type]) {
            element.innerHTML = contents[type];
            element.dataset.text = contents[type];
        }
    }

    getElementAt(x, y) {
        const elements = Array.from(this.canvas.querySelectorAll('.wireframe-element'));
        
        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i];
            const rect = element.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            const elementX = rect.left - canvasRect.left;
            const elementY = rect.top - canvasRect.top;
            const elementWidth = rect.width;
            const elementHeight = rect.height;
            
            if (x >= elementX && x <= elementX + elementWidth &&
                y >= elementY && y <= elementY + elementHeight) {
                return element;
            }
        }
        
        return null;
    }

    selectElement(element) {
        // Remove previous selection
        document.querySelectorAll('.wireframe-element.selected').forEach(el => {
            el.classList.remove('selected');
            this.removeResizeHandles(el);
        });
        
        this.selectedElement = element;
        
        if (element) {
            element.classList.add('selected');
            this.addResizeHandles(element);
            this.updateProperties();
        } else {
            this.showNoSelection();
        }
        
        this.updateLayers();
    }

    addResizeHandles(element) {
        this.removeResizeHandles(element);
        
        const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
        handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${position}`;
            handle.dataset.position = position;
            element.appendChild(handle);
        });
    }

    removeResizeHandles(element) {
        element.querySelectorAll('.resize-handle').forEach(handle => handle.remove());
    }

    getResizeHandle(x, y) {
        if (!this.selectedElement) return null;
        
        const handles = this.selectedElement.querySelectorAll('.resize-handle');
        for (let handle of handles) {
            const rect = handle.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            const handleX = rect.left - canvasRect.left;
            const handleY = rect.top - canvasRect.top;
            
            if (x >= handleX - 4 && x <= handleX + 12 &&
                y >= handleY - 4 && y <= handleY + 12) {
                return handle.dataset.position;
            }
        }
        
        return null;
    }

    resizeElement(element, handle, pos) {
        const rect = element.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        const currentX = rect.left - canvasRect.left;
        const currentY = rect.top - canvasRect.top;
        const currentWidth = rect.width;
        const currentHeight = rect.height;
        
        let newX = currentX;
        let newY = currentY;
        let newWidth = currentWidth;
        let newHeight = currentHeight;
        
        switch (handle) {
            case 'se':
                newWidth = Math.max(20, pos.x - currentX);
                newHeight = Math.max(20, pos.y - currentY);
                break;
            case 'sw':
                newWidth = Math.max(20, currentWidth + (currentX - pos.x));
                newHeight = Math.max(20, pos.y - currentY);
                newX = Math.min(currentX, pos.x);
                break;
            case 'ne':
                newWidth = Math.max(20, pos.x - currentX);
                newHeight = Math.max(20, currentHeight + (currentY - pos.y));
                newY = Math.min(currentY, pos.y);
                break;
            case 'nw':
                newWidth = Math.max(20, currentWidth + (currentX - pos.x));
                newHeight = Math.max(20, currentHeight + (currentY - pos.y));
                newX = Math.min(currentX, pos.x);
                newY = Math.min(currentY, pos.y);
                break;
            case 'n':
                newHeight = Math.max(20, currentHeight + (currentY - pos.y));
                newY = Math.min(currentY, pos.y);
                break;
            case 's':
                newHeight = Math.max(20, pos.y - currentY);
                break;
            case 'w':
                newWidth = Math.max(20, currentWidth + (currentX - pos.x));
                newX = Math.min(currentX, pos.x);
                break;
            case 'e':
                newWidth = Math.max(20, pos.x - currentX);
                break;
        }
        
        element.style.left = newX + 'px';
        element.style.top = newY + 'px';
        element.style.width = newWidth + 'px';
        element.style.height = newHeight + 'px';
        
        this.updateProperties();
    }

    updateProperties() {
        const propertiesContent = document.getElementById('properties-content');
        
        if (!this.selectedElement) {
            this.showNoSelection();
            return;
        }
        
        const type = this.selectedElement.dataset.type;
        const rect = this.selectedElement.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        const x = Math.round(rect.left - canvasRect.left);
        const y = Math.round(rect.top - canvasRect.top);
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);
        
        propertiesContent.innerHTML = `
            <div class="property-group">
                <label>Type:</label>
                <input type="text" value="${type}" readonly>
            </div>
            <div class="property-row">
                <div class="property-group">
                    <label>X:</label>
                    <input type="number" id="element-x" value="${x}">
                </div>
                <div class="property-group">
                    <label>Y:</label>
                    <input type="number" id="element-y" value="${y}">
                </div>
            </div>
            <div class="property-row">
                <div class="property-group">
                    <label>Width:</label>
                    <input type="number" id="element-width" value="${width}" min="20">
                </div>
                <div class="property-group">
                    <label>Height:</label>
                    <input type="number" id="element-height" value="${height}" min="20">
                </div>
            </div>
            <div class="property-group">
                <label>Background:</label>
                <input type="color" id="element-bg" value="${this.getElementStyle(this.selectedElement, 'backgroundColor') || '#f8f9fa'}">
            </div>
            <div class="property-group">
                <label>Border Color:</label>
                <input type="color" id="element-border" value="${this.getElementStyle(this.selectedElement, 'borderColor') || '#adb5bd'}">
            </div>
            <div class="property-group">
                <label>Border Width:</label>
                <input type="range" id="element-border-width" min="0" max="10" value="${parseInt(this.getElementStyle(this.selectedElement, 'borderWidth')) || 1}">
            </div>
            ${type === 'text' || this.selectedElement.dataset.text ? `
            <div class="property-group">
                <label>Text:</label>
                <textarea id="element-text" rows="3">${this.selectedElement.dataset.text || this.selectedElement.textContent}</textarea>
            </div>
            ` : ''}
            <div class="property-group">
                <label>Layer:</label>
                <input type="number" id="element-layer" value="${this.selectedElement.dataset.layer}" min="1">
            </div>
        `;
        
        // Add event listeners for property changes
        this.setupPropertyListeners();
    }

    setupPropertyListeners() {
        const inputs = {
            'element-x': (value) => this.selectedElement.style.left = Math.max(0, parseInt(value)) + 'px',
            'element-y': (value) => this.selectedElement.style.top = Math.max(0, parseInt(value)) + 'px',
            'element-width': (value) => this.selectedElement.style.width = Math.max(20, parseInt(value)) + 'px',
            'element-height': (value) => this.selectedElement.style.height = Math.max(20, parseInt(value)) + 'px',
            'element-bg': (value) => this.selectedElement.style.backgroundColor = value,
            'element-border': (value) => this.selectedElement.style.borderColor = value,
            'element-border-width': (value) => this.selectedElement.style.borderWidth = value + 'px',
            'element-text': (value) => {
                this.selectedElement.innerHTML = value;
                this.selectedElement.dataset.text = value;
            },
            'element-layer': (value) => {
                this.selectedElement.dataset.layer = parseInt(value);
                this.updateLayers();
            }
        };
        
        Object.keys(inputs).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', (e) => {
                    inputs[id](e.target.value);
                    if (id !== 'element-layer') this.saveState();
                });
            }
        });
    }

    getElementStyle(element, property) {
        return getComputedStyle(element)[property] || element.style[property];
    }

    showNoSelection() {
        const propertiesContent = document.getElementById('properties-content');
        propertiesContent.innerHTML = `
            <div class="no-selection">
                <i class="fas fa-mouse-pointer"></i>
                <p>Select an element to edit properties</p>
            </div>
        `;
    }

    updateLayers() {
        const layersList = document.getElementById('layers-list');
        layersList.innerHTML = '';
        
        // Sort elements by layer (highest first)
        const sortedElements = [...this.elements].sort((a, b) => {
            return parseInt(b.dataset.layer) - parseInt(a.dataset.layer);
        });
        
        sortedElements.forEach(element => {
            const layerItem = document.createElement('div');
            layerItem.className = 'layer-item';
            if (element === this.selectedElement) {
                layerItem.classList.add('selected');
            }
            
            const type = element.dataset.type;
            const text = element.dataset.text || type;
            const displayText = text.length > 20 ? text.substring(0, 20) + '...' : text;
            
            layerItem.innerHTML = `
                <div class="layer-icon">
                    <i class="fas fa-${this.getLayerIcon(type)}"></i>
                </div>
                <div class="layer-name">${displayText}</div>
                <div class="layer-visible">
                    <i class="fas fa-eye"></i>
                </div>
            `;
            
            layerItem.addEventListener('click', () => {
                this.selectElement(element);
            });
            
            const visibleIcon = layerItem.querySelector('.layer-visible');
            visibleIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                element.style.display = element.style.display === 'none' ? 'block' : 'none';
                visibleIcon.innerHTML = element.style.display === 'none' ? 
                    '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
            });
            
            layersList.appendChild(layerItem);
        });
    }

    getLayerIcon(type) {
        const icons = {
            button: 'hand-pointer',
            input: 'edit',
            checkbox: 'check-square',
            radio: 'dot-circle',
            dropdown: 'caret-down',
            textarea: 'align-left',
            header: 'heading',
            navigation: 'bars',
            card: 'id-card',
            table: 'table',
            sidebar: 'columns',
            footer: 'window-minimize',
            text: 'font',
            rectangle: 'square',
            circle: 'circle',
            line: 'minus',
            image: 'image',
            container: 'square-full',
            row: 'arrows-alt-h',
            column: 'arrows-alt-v',
            grid: 'th'
        };
        
        return icons[type] || 'square';
    }

    hideDropZone() {
        if (this.elements.length > 0) {
            document.getElementById('drop-zone').classList.add('hidden');
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
            case 'group':
                this.groupElements();
                break;
            case 'ungroup':
                this.ungroupElements();
                break;
        }
    }

    copyElement() {
        if (this.selectedElement) {
            this.clipboard = {
                type: this.selectedElement.dataset.type,
                innerHTML: this.selectedElement.innerHTML,
                style: this.selectedElement.style.cssText,
                dataset: { ...this.selectedElement.dataset }
            };
        }
    }

    pasteElement() {
        if (this.clipboard) {
            const element = document.createElement('div');
            element.className = 'wireframe-element wireframe-' + this.clipboard.type;
            element.innerHTML = this.clipboard.innerHTML;
            element.style.cssText = this.clipboard.style;
            
            // Update position
            const currentLeft = parseInt(element.style.left) || 0;
            const currentTop = parseInt(element.style.top) || 0;
            element.style.left = (currentLeft + 20) + 'px';
            element.style.top = (currentTop + 20) + 'px';
            
            // Update dataset
            Object.keys(this.clipboard.dataset).forEach(key => {
                if (key !== 'id') {
                    element.dataset[key] = this.clipboard.dataset[key];
                }
            });
            element.dataset.id = this.generateId();
            element.dataset.layer = this.layerCounter++;
            
            this.canvas.appendChild(element);
            this.elements.push(element);
            this.selectElement(element);
            this.hideDropZone();
            this.updateLayers();
            this.saveState();
        }
    }

    deleteElement(element) {
        const index = this.elements.indexOf(element);
        if (index > -1) {
            this.elements.splice(index, 1);
            element.remove();
            this.selectedElement = null;
            this.showNoSelection();
            this.updateLayers();
            this.saveState();
            
            if (this.elements.length === 0) {
                document.getElementById('drop-zone').classList.remove('hidden');
            }
        }
    }

    bringToFront(element) {
        const maxLayer = Math.max(...this.elements.map(el => parseInt(el.dataset.layer))) + 1;
        element.dataset.layer = maxLayer;
        this.updateLayers();
        this.updateProperties();
        this.saveState();
    }

    sendToBack(element) {
        const minLayer = Math.min(...this.elements.map(el => parseInt(el.dataset.layer))) - 1;
        element.dataset.layer = Math.max(1, minLayer);
        this.updateLayers();
        this.updateProperties();
        this.saveState();
    }

    groupElements() {
        // TODO: Implement grouping functionality
        console.log('Group functionality not yet implemented');
    }

    ungroupElements() {
        // TODO: Implement ungrouping functionality
        console.log('Ungroup functionality not yet implemented');
    }

    editText(element) {
        this.currentTextElement = element;
        const modal = document.getElementById('text-modal');
        const textInput = document.getElementById('text-input');
        textInput.value = element.dataset.text || element.textContent;
        modal.style.display = 'flex';
        textInput.focus();
    }

    updateCanvasSize() {
        const wrapper = document.getElementById('canvas-wrapper');
        const dimensions = {
            desktop: { width: 1200, height: 800 },
            tablet: { width: 768, height: 1024 },
            mobile: { width: 375, height: 667 },
            custom: { width: 1200, height: 800 } // TODO: Add custom size input
        };
        
        const size = dimensions[this.currentDevice];
        wrapper.className = `canvas-wrapper ${this.currentDevice}`;
        this.canvas.style.width = size.width + 'px';
        this.canvas.style.height = size.height + 'px';
        
        this.updateDeviceInfo();
    }

    updateDeviceInfo() {
        const deviceName = document.querySelector('.device-name');
        const dimensions = document.querySelector('.canvas-dimensions');
        
        const names = {
            desktop: 'Desktop',
            tablet: 'Tablet',
            mobile: 'Mobile',
            custom: 'Custom'
        };
        
        deviceName.textContent = names[this.currentDevice];
        dimensions.textContent = this.canvas.style.width.replace('px', '') + ' x ' + this.canvas.style.height.replace('px', '');
    }

    zoomIn() {
        this.zoom = Math.min(this.zoom * 1.2, 3);
        this.applyZoom();
    }

    zoomOut() {
        this.zoom = Math.max(this.zoom / 1.2, 0.1);
        this.applyZoom();
    }

    zoomFit() {
        const container = document.querySelector('.canvas-container');
        const wrapper = document.getElementById('canvas-wrapper');
        
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        const wrapperWidth = parseInt(this.canvas.style.width);
        const wrapperHeight = parseInt(this.canvas.style.height);
        
        const scaleX = containerWidth / wrapperWidth;
        const scaleY = containerHeight / wrapperHeight;
        
        this.zoom = Math.min(scaleX, scaleY, 1);
        this.applyZoom();
    }

    applyZoom() {
        const wrapper = document.getElementById('canvas-wrapper');
        wrapper.style.transform = `scale(${this.zoom})`;
        wrapper.style.transformOrigin = 'top left';
        
        document.getElementById('zoom-level').textContent = Math.round(this.zoom * 100) + '%';
    }

    saveState() {
        const state = {
            elements: this.elements.map(el => ({
                id: el.dataset.id,
                type: el.dataset.type,
                innerHTML: el.innerHTML,
                style: el.style.cssText,
                dataset: { ...el.dataset }
            })),
            selectedElementId: this.selectedElement ? this.selectedElement.dataset.id : null,
            layerCounter: this.layerCounter
        };
        
        // Remove future history
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(JSON.stringify(state));
        this.historyIndex++;
        
        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
        
        this.updateHistoryButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState();
        }
    }

    restoreState() {
        if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
            const state = JSON.parse(this.history[this.historyIndex]);
            
            // Clear current elements
            this.elements.forEach(el => el.remove());
            this.elements = [];
            
            // Restore elements
            state.elements.forEach(elementData => {
                const element = document.createElement('div');
                element.className = 'wireframe-element wireframe-' + elementData.type;
                element.innerHTML = elementData.innerHTML;
                element.style.cssText = elementData.style;
                
                Object.keys(elementData.dataset).forEach(key => {
                    element.dataset[key] = elementData.dataset[key];
                });
                
                this.canvas.appendChild(element);
                this.elements.push(element);
            });
            
            // Restore selection
            if (state.selectedElementId) {
                const selectedElement = this.elements.find(el => el.dataset.id === state.selectedElementId);
                this.selectElement(selectedElement);
            } else {
                this.selectElement(null);
            }
            
            this.layerCounter = state.layerCounter;
            this.updateLayers();
            this.hideDropZone();
        }
        
        this.updateHistoryButtons();
    }

    updateHistoryButtons() {
        document.getElementById('undo-btn').disabled = this.historyIndex <= 0;
        document.getElementById('redo-btn').disabled = this.historyIndex >= this.history.length - 1;
    }

    loadTemplate(template) {
        // Clear canvas
        this.elements.forEach(el => el.remove());
        this.elements = [];
        this.selectedElement = null;
        this.layerCounter = 1;
        
        switch (template) {
            case 'landing-page':
                this.loadLandingPageTemplate();
                break;
            case 'dashboard':
                this.loadDashboardTemplate();
                break;
            case 'form':
                this.loadFormTemplate();
                break;
            case 'blog':
                this.loadBlogTemplate();
                break;
        }
        
        this.hideDropZone();
        this.updateLayers();
        this.saveState();
    }

    loadLandingPageTemplate() {
        // Header
        this.createElement('header', 600, 30);
        
        // Hero section
        const hero = this.createElement('container', 600, 200);
        hero.innerHTML = '<div style="text-align: center; padding: 60px 20px;"><h1 style="font-size: 2.5rem; margin-bottom: 20px;">Hero Title</h1><p style="font-size: 1.2rem; margin-bottom: 30px;">Hero subtitle description</p><button style="background: #17a2b8; color: white; padding: 12px 30px; border: none; border-radius: 6px;">Call to Action</button></div>';
        
        // Features section
        const features = this.createElement('row', 600, 450);
        features.innerHTML = '<div style="display: flex; height: 100%; gap: 20px; padding: 20px;"><div style="flex: 1; border: 1px solid #dee2e6; padding: 20px; text-align: center; border-radius: 8px;"><h3>Feature 1</h3><p>Feature description</p></div><div style="flex: 1; border: 1px solid #dee2e6; padding: 20px; text-align: center; border-radius: 8px;"><h3>Feature 2</h3><p>Feature description</p></div><div style="flex: 1; border: 1px solid #dee2e6; padding: 20px; text-align: center; border-radius: 8px;"><h3>Feature 3</h3><p>Feature description</p></div></div>';
        
        // Footer
        this.createElement('footer', 600, 750);
    }

    loadDashboardTemplate() {
        // Header
        this.createElement('header', 600, 30);
        
        // Sidebar
        this.createElement('sidebar', 100, 400);
        
        // Main content area
        const main = this.createElement('container', 700, 400);
        main.style.left = '220px';
        main.style.width = '950px';
        
        // Cards for metrics
        const card1 = this.createElement('card', 400, 200);
        card1.style.left = '250px';
        card1.style.top = '150px';
        card1.style.width = '200px';
        card1.style.height = '120px';
        
        const card2 = this.createElement('card', 650, 200);
        card2.style.left = '470px';
        card2.style.top = '150px';
        card2.style.width = '200px';
        card2.style.height = '120px';
        
        const card3 = this.createElement('card', 900, 200);
        card3.style.left = '690px';
        card3.style.top = '150px';
        card3.style.width = '200px';
        card3.style.height = '120px';
        
        // Chart area
        const chart = this.createElement('card', 600, 500);
        chart.style.left = '250px';
        chart.style.top = '300px';
        chart.style.width = '640px';
        chart.style.height = '300px';
        chart.innerHTML = '<div style="text-align: center; padding: 20px;"><h3>Chart Title</h3><div style="height: 200px; background: #f8f9fa; border: 1px dashed #dee2e6; display: flex; align-items: center; justify-content: center; color: #6c757d;">Chart Area</div></div>';
    }

    loadFormTemplate() {
        // Header
        this.createElement('header', 600, 30);
        
        // Form container
        const form = this.createElement('container', 600, 400);
        form.style.width = '500px';
        form.innerHTML = '<div style="padding: 40px;"><h2 style="margin-bottom: 30px; text-align: center;">Contact Form</h2></div>';
        
        // Form fields
        const nameField = this.createElement('input', 600, 200);
        nameField.style.left = '350px';
        nameField.style.top = '150px';
        nameField.style.width = '500px';
        nameField.innerHTML = 'Full Name';
        
        const emailField = this.createElement('input', 600, 250);
        emailField.style.left = '350px';
        emailField.style.top = '200px';
        emailField.style.width = '500px';
        emailField.innerHTML = 'Email Address';
        
        const messageField = this.createElement('textarea', 600, 350);
        messageField.style.left = '350px';
        messageField.style.top = '250px';
        messageField.style.width = '500px';
        messageField.style.height = '120px';
        
        const submitBtn = this.createElement('button', 600, 450);
        submitBtn.style.left = '350px';
        submitBtn.style.top = '390px';
        submitBtn.style.width = '500px';
        submitBtn.innerHTML = 'Submit Form';
    }

    loadBlogTemplate() {
        // Header
        this.createElement('header', 600, 30);
        
        // Navigation
        this.createElement('navigation', 600, 80);
        
        // Main content
        const main = this.createElement('container', 450, 400);
        main.style.left = '50px';
        main.style.top = '130px';
        main.style.width = '700px';
        main.style.height = '500px';
        main.innerHTML = '<div style="padding: 30px;"><h1 style="margin-bottom: 20px;">Blog Post Title</h1><p style="margin-bottom: 15px; color: #6c757d;">Published on Date by Author</p><div style="height: 200px; background: #f8f9fa; border: 1px dashed #dee2e6; margin: 20px 0; display: flex; align-items: center; justify-content: center; color: #6c757d;">Featured Image</div><p>Blog post content goes here...</p></div>';
        
        // Sidebar
        const sidebar = this.createElement('sidebar', 950, 400);
        sidebar.style.left = '770px';
        sidebar.style.top = '130px';
        sidebar.style.height = '500px';
        sidebar.innerHTML = '<div style="padding: 20px;"><h3 style="margin-bottom: 20px;">Recent Posts</h3><div style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">Post 1</div><div style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">Post 2</div><div style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">Post 3</div></div>';
    }

    showPreview() {
        const modal = document.getElementById('preview-modal');
        const frame = document.getElementById('preview-frame');
        
        const html = this.generateHTML();
        frame.innerHTML = html;
        
        modal.style.display = 'flex';
    }

    exportHTML() {
        const html = this.generateFullHTML();
        
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'wireframe.html';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    exportPNG() {
        // Create a canvas for rendering
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const canvasWidth = parseInt(this.canvas.style.width) || 1200;
        const canvasHeight = parseInt(this.canvas.style.height) || 800;
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // Fill white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Use html2canvas to capture the wireframe
        import('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js').then(() => {
            html2canvas(this.canvas, {
                backgroundColor: 'white',
                scale: 2
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'wireframe.png';
                link.href = canvas.toDataURL();
                link.click();
            });
        }).catch(() => {
            // Fallback: simple canvas rendering
            this.renderToCanvas(ctx);
            const link = document.createElement('a');
            link.download = 'wireframe.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    }

    renderToCanvas(ctx) {
        this.elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            const x = rect.left - canvasRect.left;
            const y = rect.top - canvasRect.top;
            const width = rect.width;
            const height = rect.height;
            
            // Draw element background
            const bgColor = element.style.backgroundColor || '#f8f9fa';
            ctx.fillStyle = bgColor;
            ctx.fillRect(x, y, width, height);
            
            // Draw border
            const borderColor = element.style.borderColor || '#adb5bd';
            const borderWidth = parseInt(element.style.borderWidth) || 1;
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            ctx.strokeRect(x, y, width, height);
            
            // Draw text
            const text = element.dataset.text || element.textContent;
            if (text && text.trim()) {
                ctx.fillStyle = '#333';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, x + width / 2, y + height / 2);
            }
        });
    }

    exportJSON() {
        const data = {
            device: this.currentDevice,
            canvas: {
                width: parseInt(this.canvas.style.width) || 1200,
                height: parseInt(this.canvas.style.height) || 800
            },
            elements: this.elements.map(el => ({
                id: el.dataset.id,
                type: el.dataset.type,
                text: el.dataset.text || el.textContent,
                style: el.style.cssText,
                position: {
                    x: parseInt(el.style.left) || 0,
                    y: parseInt(el.style.top) || 0,
                    width: parseInt(el.style.width) || 100,
                    height: parseInt(el.style.height) || 50
                },
                layer: parseInt(el.dataset.layer) || 1
            }))
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'wireframe.json';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }

    generateHTML() {
        let html = `<div style="position: relative; width: ${this.canvas.style.width}; height: ${this.canvas.style.height}; background: white; border: 1px solid #dee2e6;">`;
        
        this.elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            const x = rect.left - canvasRect.left;
            const y = rect.top - canvasRect.top;
            const width = rect.width;
            const height = rect.height;
            const text = element.dataset.text || element.textContent;
            
            html += `<div style="position: absolute; left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px; ${element.style.cssText}">${element.innerHTML}</div>`;
        });
        
        html += '</div>';
        return html;
    }

    generateFullHTML() {
        const html = this.generateHTML();
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wireframe Export</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: #f8f9fa;
        }
        .wireframe-container {
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }
    </style>
</head>
<body>
    <div class="wireframe-container">
        ${html}
    </div>
</body>
</html>`;
    }

    generateId() {
        return 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new WireframeTool();
});