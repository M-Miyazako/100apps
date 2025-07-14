class MockupTool {
    constructor() {
        this.canvas = document.getElementById('mockup-canvas');
        this.elements = [];
        this.selectedElement = null;
        this.selectedTool = 'select';
        this.currentView = 'design';
        this.isDragging = false;
        this.isResizing = false;
        this.dragStart = { x: 0, y: 0 };
        this.resizeHandle = null;
        this.zoom = 1;
        this.currentDevice = 'desktop';
        this.clipboard = null;
        this.history = [];
        this.historyIndex = -1;
        this.layerCounter = 1;
        this.assets = {
            images: [],
            icons: []
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupTabs();
        this.setupDeviceSelector();
        this.setupModals();
        this.updateCanvasSize();
        this.updateLayers();
        this.saveState();
        this.populateIcons();
    }

    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedTool = btn.dataset.tool;
                this.updateCursor();
            });
        });

        // View mode
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
                this.toggleViewMode();
            });
        });

        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));

        // Action buttons
        document.getElementById('export-png').addEventListener('click', () => this.exportPNG());
        document.getElementById('export-pdf').addEventListener('click', () => this.exportPDF());
        document.getElementById('share-mockup').addEventListener('click', () => this.showShareModal());

        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoom-fit').addEventListener('click', () => this.zoomFit());

        // Grid and rulers toggles
        document.getElementById('show-grid').addEventListener('change', (e) => {
            document.getElementById('grid-overlay').classList.toggle('visible', e.target.checked);
        });

        document.getElementById('show-rulers').addEventListener('change', (e) => {
            document.getElementById('rulers').classList.toggle('hidden', !e.target.checked);
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

        // Layer actions
        document.getElementById('add-layer').addEventListener('click', () => this.addLayer());
        document.getElementById('delete-layer').addEventListener('click', () => this.deleteLayer());
        document.getElementById('duplicate-layer').addEventListener('click', () => this.duplicateLayer());

        // Assets
        document.getElementById('image-upload').addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('icon-search').addEventListener('input', (e) => this.searchIcons(e.target.value));

        // Style application
        document.querySelectorAll('.color-item').forEach(item => {
            item.addEventListener('click', () => this.applyColor(item.dataset.color));
        });

        document.querySelectorAll('.font-item').forEach(item => {
            item.addEventListener('click', () => this.applyFont(item.dataset.font));
        });

        document.querySelectorAll('.shadow-item').forEach(item => {
            item.addEventListener('click', () => this.applyShadow(item.dataset.shadow));
        });
    }

    setupDragAndDrop() {
        // Component drag start
        document.querySelectorAll('.component-item, .layout-item, .icon-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const type = item.dataset.component || item.dataset.layout || item.dataset.icon;
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: item.dataset.component ? 'component' : item.dataset.layout ? 'layout' : 'icon',
                    value: type
                }));
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
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.createElement(data, x, y);
            document.getElementById('drop-zone').classList.remove('drag-over');
            this.hideDropZone();
        });
    }

    setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all tabs and contents
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                btn.classList.add('active');
                
                // Show corresponding content
                const tabId = btn.dataset.tab + '-tab';
                document.getElementById(tabId).classList.add('active');
            });
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
        // Text modal
        const textModal = document.getElementById('text-modal');
        const textEditor = document.getElementById('text-editor');
        const saveText = document.getElementById('save-text');
        const cancelText = document.getElementById('cancel-text');
        const closeTextModal = document.getElementById('close-text-modal');

        // Editor buttons
        document.querySelectorAll('.editor-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                document.execCommand(command, false, null);
                btn.classList.toggle('active');
            });
        });

        document.getElementById('font-size-select').addEventListener('change', (e) => {
            textEditor.style.fontSize = e.target.value + 'px';
        });

        document.getElementById('text-color-picker').addEventListener('change', (e) => {
            textEditor.style.color = e.target.value;
        });

        const closeTextModalFn = () => {
            textModal.style.display = 'none';
            this.currentTextElement = null;
        };

        saveText.addEventListener('click', () => {
            if (this.currentTextElement) {
                this.currentTextElement.innerHTML = textEditor.innerHTML;
                this.currentTextElement.dataset.text = textEditor.textContent;
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

        // Share modal
        const shareModal = document.getElementById('share-modal');
        const closeShareModal = document.getElementById('close-share-modal');

        closeShareModal.addEventListener('click', () => {
            shareModal.style.display = 'none';
        });

        document.getElementById('copy-link').addEventListener('click', () => {
            const linkInput = document.getElementById('share-link');
            linkInput.select();
            document.execCommand('copy');
            // Show success message
            this.showToast('Link copied to clipboard!');
        });

        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.style.display = 'none';
            }
        });
    }

    populateIcons() {
        const iconsList = [
            'home', 'user', 'heart', 'star', 'cog', 'envelope', 'phone', 'search',
            'calendar', 'shopping-cart', 'camera', 'music', 'video', 'file',
            'folder', 'trash', 'edit', 'save', 'download', 'upload', 'print',
            'share', 'lock', 'unlock', 'bell', 'bookmark', 'tag', 'clock',
            'map-marker', 'globe', 'wifi', 'battery-full', 'signal', 'volume-up',
            'play', 'pause', 'stop', 'forward', 'backward', 'refresh'
        ];

        const iconsGrid = document.getElementById('icons-grid');
        iconsList.forEach(icon => {
            const iconItem = document.createElement('div');
            iconItem.className = 'icon-item';
            iconItem.dataset.icon = `fas fa-${icon}`;
            iconItem.draggable = true;
            iconItem.innerHTML = `<i class="fas fa-${icon}"></i>`;
            
            iconItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'icon',
                    value: `fas fa-${icon}`
                }));
                iconItem.classList.add('dragging');
            });

            iconItem.addEventListener('dragend', () => {
                iconItem.classList.remove('dragging');
            });

            iconsGrid.appendChild(iconItem);
        });
    }

    updateCursor() {
        const cursors = {
            select: 'default',
            text: 'text',
            image: 'crosshair',
            shape: 'crosshair',
            icon: 'crosshair'
        };
        this.canvas.style.cursor = cursors[this.selectedTool] || 'default';
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / this.zoom,
            y: (e.clientY - rect.top) / this.zoom
        };
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
                    x: (pos.x * this.zoom) - (elementRect.left - canvasRect.left),
                    y: (pos.y * this.zoom) - (elementRect.top - canvasRect.top)
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
            const newX = pos.x - this.dragStart.x / this.zoom;
            const newY = pos.y - this.dragStart.y / this.zoom;
            
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
        
        if (element && (element.classList.contains('mockup-text') || element.dataset.type === 'text')) {
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
            } else if (e.key === 'd' && this.selectedElement) {
                e.preventDefault();
                this.duplicateElement();
            }
        }
    }

    createElement(data, x, y) {
        const element = document.createElement('div');
        element.className = `mockup-element mockup-${data.value}`;
        element.dataset.type = data.value;
        element.dataset.id = this.generateId();
        element.dataset.layer = this.layerCounter++;
        
        // Set default size and position
        const defaultSize = this.getDefaultSize(data);
        element.style.left = Math.max(0, x - defaultSize.width / 2) + 'px';
        element.style.top = Math.max(0, y - defaultSize.height / 2) + 'px';
        element.style.width = defaultSize.width + 'px';
        element.style.height = defaultSize.height + 'px';
        
        // Set content based on type
        this.setElementContent(element, data);
        
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
            const data = { type: 'component', value: 'text' };
            const element = this.createElement(data, x, y);
            setTimeout(() => this.editText(element), 100);
        } else if (type === 'image') {
            this.createImageElement(x, y);
        } else if (type === 'shape') {
            this.createShapeDialog(x, y);
        } else if (type === 'icon') {
            this.createIconElement(x, y);
        }
    }

    createImageElement(x, y) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = { type: 'component', value: 'image' };
                    const element = this.createElement(data, x, y);
                    element.style.backgroundImage = `url(${e.target.result})`;
                    element.style.backgroundSize = 'cover';
                    element.style.backgroundPosition = 'center';
                    element.innerHTML = '';
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    createIconElement(x, y) {
        const data = { type: 'icon', value: 'fas fa-star' };
        this.createElement(data, x, y);
    }

    getDefaultSize(data) {
        const sizes = {
            button: { width: 140, height: 44 },
            input: { width: 250, height: 44 },
            card: { width: 300, height: 200 },
            modal: { width: 400, height: 300 },
            navbar: { width: 600, height: 60 },
            sidebar: { width: 250, height: 400 },
            table: { width: 500, height: 300 },
            chart: { width: 400, height: 250 },
            text: { width: 200, height: 40 },
            image: { width: 200, height: 150 },
            icon: { width: 40, height: 40 },
            container: { width: 600, height: 400 },
            grid: { width: 600, height: 300 },
            flexbox: { width: 600, height: 200 },
            section: { width: 600, height: 300 }
        };
        
        return sizes[data.value] || { width: 200, height: 100 };
    }

    setElementContent(element, data) {
        const contents = {
            button: 'Click Me',
            input: '<input type="text" placeholder="Enter text..." style="width: 100%; height: 100%; border: none; outline: none; padding: 0 12px; font-size: 1rem;">',
            card: '<div style="padding: 20px;"><h3 style="margin-bottom: 12px; color: #1e293b;">Card Title</h3><p style="color: #64748b; line-height: 1.5;">This is a sample card content. You can customize this text and styling.</p></div>',
            modal: '<div style="padding: 24px; text-align: center;"><h3 style="margin-bottom: 16px; color: #1e293b;">Modal Title</h3><p style="color: #64748b; margin-bottom: 20px;">Modal content goes here</p><button style="background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px;">Action</button></div>',
            navbar: '<div style="display: flex; align-items: center; justify-content: space-between; height: 100%; padding: 0 24px;"><div style="font-weight: 700; font-size: 1.2rem;">Brand</div><div style="display: flex; gap: 24px;"><span>Home</span><span>About</span><span>Contact</span></div></div>',
            sidebar: '<div style="padding: 24px;"><h4 style="margin-bottom: 20px; color: #1e293b;">Navigation</h4><div style="display: flex; flex-direction: column; gap: 12px;"><div style="padding: 8px 12px; background: rgba(79, 70, 229, 0.1); border-radius: 6px; color: #4f46e5;">Dashboard</div><div style="padding: 8px 12px;">Analytics</div><div style="padding: 8px 12px;">Settings</div></div></div>',
            table: '<div style="width: 100%; height: 100%; overflow: hidden;"><div style="background: #f8fafc; padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; display: flex;"><div style="flex: 1;">Name</div><div style="flex: 1;">Email</div><div style="flex: 1;">Status</div></div><div style="padding: 12px; border-bottom: 1px solid #f1f5f9; display: flex;"><div style="flex: 1;">John Doe</div><div style="flex: 1;">john@example.com</div><div style="flex: 1; color: #059669;">Active</div></div><div style="padding: 12px; display: flex;"><div style="flex: 1;">Jane Smith</div><div style="flex: 1;">jane@example.com</div><div style="flex: 1; color: #dc2626;">Inactive</div></div></div>',
            chart: '<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 1.2rem; font-weight: 600;">📊 Chart Visualization</div>',
            text: 'Sample Text',
            image: '',
            icon: '<i class="fas fa-star"></i>',
            container: '<div style="border: 2px dashed #cbd5e1; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-weight: 500;">Container</div>',
            grid: '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; height: 100%; padding: 16px;"><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #64748b;">Grid Item 1</div><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #64748b;">Grid Item 2</div><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #64748b;">Grid Item 3</div><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #64748b;">Grid Item 4</div></div>',
            flexbox: '<div style="display: flex; gap: 16px; height: 100%; align-items: center; padding: 16px;"><div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; height: 80px; color: #64748b;">Flex Item 1</div><div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; height: 80px; color: #64748b;">Flex Item 2</div><div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; height: 80px; color: #64748b;">Flex Item 3</div></div>',
            section: '<div style="padding: 24px; height: 100%; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc;"><h3 style="margin-bottom: 16px; color: #1e293b;">Section Title</h3><p style="color: #64748b; line-height: 1.6;">This is a section container. You can add content, images, and other elements here.</p></div>'
        };
        
        if (data.type === 'icon') {
            element.innerHTML = `<i class="${data.value}"></i>`;
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.style.justifyContent = 'center';
            element.style.fontSize = '1.5rem';
            element.style.color = '#4f46e5';
        } else if (contents[data.value]) {
            element.innerHTML = contents[data.value];
            element.dataset.text = element.textContent;
        }
    }

    getElementAt(x, y) {
        const elements = Array.from(this.canvas.querySelectorAll('.mockup-element'));
        
        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i];
            const rect = element.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            const elementX = (rect.left - canvasRect.left) / this.zoom;
            const elementY = (rect.top - canvasRect.top) / this.zoom;
            const elementWidth = rect.width / this.zoom;
            const elementHeight = rect.height / this.zoom;
            
            if (x >= elementX && x <= elementX + elementWidth &&
                y >= elementY && y <= elementY + elementHeight) {
                return element;
            }
        }
        
        return null;
    }

    selectElement(element) {
        // Remove previous selection
        document.querySelectorAll('.mockup-element.selected').forEach(el => {
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
            
            const handleX = (rect.left - canvasRect.left) / this.zoom;
            const handleY = (rect.top - canvasRect.top) / this.zoom;
            const handleSize = 20 / this.zoom; // Increase hit area
            
            if (x >= handleX - handleSize/2 && x <= handleX + handleSize/2 &&
                y >= handleY - handleSize/2 && y <= handleY + handleSize/2) {
                return handle.dataset.position;
            }
        }
        
        return null;
    }

    resizeElement(element, handle, pos) {
        const rect = element.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        const currentX = (rect.left - canvasRect.left) / this.zoom;
        const currentY = (rect.top - canvasRect.top) / this.zoom;
        const currentWidth = rect.width / this.zoom;
        const currentHeight = rect.height / this.zoom;
        
        let newX = currentX;
        let newY = currentY;
        let newWidth = currentWidth;
        let newHeight = currentHeight;
        
        const minSize = 20;
        
        switch (handle) {
            case 'se':
                newWidth = Math.max(minSize, pos.x - currentX);
                newHeight = Math.max(minSize, pos.y - currentY);
                break;
            case 'sw':
                newWidth = Math.max(minSize, currentWidth + (currentX - pos.x));
                newHeight = Math.max(minSize, pos.y - currentY);
                newX = Math.min(currentX, pos.x);
                break;
            case 'ne':
                newWidth = Math.max(minSize, pos.x - currentX);
                newHeight = Math.max(minSize, currentHeight + (currentY - pos.y));
                newY = Math.min(currentY, pos.y);
                break;
            case 'nw':
                newWidth = Math.max(minSize, currentWidth + (currentX - pos.x));
                newHeight = Math.max(minSize, currentHeight + (currentY - pos.y));
                newX = Math.min(currentX, pos.x);
                newY = Math.min(currentY, pos.y);
                break;
            case 'n':
                newHeight = Math.max(minSize, currentHeight + (currentY - pos.y));
                newY = Math.min(currentY, pos.y);
                break;
            case 's':
                newHeight = Math.max(minSize, pos.y - currentY);
                break;
            case 'w':
                newWidth = Math.max(minSize, currentWidth + (currentX - pos.x));
                newX = Math.min(currentX, pos.x);
                break;
            case 'e':
                newWidth = Math.max(minSize, pos.x - currentX);
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
        
        const x = Math.round((rect.left - canvasRect.left) / this.zoom);
        const y = Math.round((rect.top - canvasRect.top) / this.zoom);
        const width = Math.round(rect.width / this.zoom);
        const height = Math.round(rect.height / this.zoom);
        
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
                <input type="color" id="element-bg" value="${this.getElementStyle(this.selectedElement, 'backgroundColor') || '#ffffff'}">
            </div>
            <div class="property-group">
                <label>Border:</label>
                <input type="color" id="element-border" value="${this.getElementStyle(this.selectedElement, 'borderColor') || '#e2e8f0'}">
            </div>
            <div class="property-group">
                <label>Border Width:</label>
                <input type="range" id="element-border-width" min="0" max="10" value="${parseInt(this.getElementStyle(this.selectedElement, 'borderWidth')) || 0}">
            </div>
            <div class="property-group">
                <label>Border Radius:</label>
                <input type="range" id="element-border-radius" min="0" max="50" value="${parseInt(this.getElementStyle(this.selectedElement, 'borderRadius')) || 0}">
            </div>
            <div class="property-group">
                <label>Opacity:</label>
                <input type="range" id="element-opacity" min="0" max="1" step="0.1" value="${this.getElementStyle(this.selectedElement, 'opacity') || 1}">
            </div>
            <div class="property-group">
                <label>Box Shadow:</label>
                <select id="element-shadow">
                    <option value="">None</option>
                    <option value="0 2px 4px rgba(0,0,0,0.1)">Light</option>
                    <option value="0 4px 8px rgba(0,0,0,0.15)">Medium</option>
                    <option value="0 8px 16px rgba(0,0,0,0.2)">Heavy</option>
                </select>
            </div>
            ${type === 'text' || this.selectedElement.dataset.text ? `
            <div class="property-group">
                <label>Text:</label>
                <textarea id="element-text" rows="3">${this.selectedElement.dataset.text || this.selectedElement.textContent}</textarea>
            </div>
            <div class="property-group">
                <label>Font Family:</label>
                <select id="element-font">
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                </select>
            </div>
            <div class="property-group">
                <label>Font Size:</label>
                <input type="range" id="element-font-size" min="10" max="48" value="${parseInt(this.getElementStyle(this.selectedElement, 'fontSize')) || 16}">
            </div>
            <div class="property-group">
                <label>Text Color:</label>
                <input type="color" id="element-text-color" value="${this.getElementStyle(this.selectedElement, 'color') || '#374151'}">
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
            'element-border-radius': (value) => this.selectedElement.style.borderRadius = value + 'px',
            'element-opacity': (value) => this.selectedElement.style.opacity = value,
            'element-shadow': (value) => this.selectedElement.style.boxShadow = value,
            'element-text': (value) => {
                this.selectedElement.innerHTML = value;
                this.selectedElement.dataset.text = value;
            },
            'element-font': (value) => this.selectedElement.style.fontFamily = value,
            'element-font-size': (value) => this.selectedElement.style.fontSize = value + 'px',
            'element-text-color': (value) => this.selectedElement.style.color = value,
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
            const displayText = text.length > 25 ? text.substring(0, 25) + '...' : text;
            
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
            card: 'id-card',
            modal: 'window-restore',
            navbar: 'bars',
            sidebar: 'columns',
            table: 'table',
            chart: 'chart-bar',
            text: 'font',
            image: 'image',
            icon: 'star',
            container: 'square-full',
            grid: 'th',
            flexbox: 'arrows-alt-h',
            section: 'square'
        };
        
        return icons[type] || 'square';
    }

    hideDropZone() {
        if (this.elements.length > 0) {
            document.getElementById('drop-zone').classList.add('hidden');
        }
    }

    toggleViewMode() {
        if (this.currentView === 'preview') {
            // Hide design elements
            document.querySelectorAll('.resize-handle').forEach(handle => {
                handle.style.display = 'none';
            });
            document.querySelectorAll('.mockup-element.selected').forEach(el => {
                el.classList.remove('selected');
            });
            this.selectedElement = null;
            this.showNoSelection();
        } else {
            // Show design elements
            document.querySelectorAll('.resize-handle').forEach(handle => {
                handle.style.display = 'block';
            });
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
            case 'duplicate':
                this.duplicateElement();
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
            this.showToast('Element copied to clipboard');
        }
    }

    pasteElement() {
        if (this.clipboard) {
            const element = document.createElement('div');
            element.className = 'mockup-element mockup-' + this.clipboard.type;
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
            this.showToast('Element pasted');
        }
    }

    duplicateElement() {
        if (this.selectedElement) {
            this.copyElement();
            this.pasteElement();
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
            
            this.showToast('Element deleted');
        }
    }

    bringToFront(element) {
        const maxLayer = Math.max(...this.elements.map(el => parseInt(el.dataset.layer))) + 1;
        element.dataset.layer = maxLayer;
        element.style.zIndex = maxLayer;
        this.updateLayers();
        this.updateProperties();
        this.saveState();
    }

    sendToBack(element) {
        const minLayer = Math.min(...this.elements.map(el => parseInt(el.dataset.layer))) - 1;
        element.dataset.layer = Math.max(1, minLayer);
        element.style.zIndex = Math.max(1, minLayer);
        this.updateLayers();
        this.updateProperties();
        this.saveState();
    }

    groupElements() {
        // TODO: Implement grouping functionality
        this.showToast('Group functionality coming soon');
    }

    ungroupElements() {
        // TODO: Implement ungrouping functionality
        this.showToast('Ungroup functionality coming soon');
    }

    editText(element) {
        this.currentTextElement = element;
        const modal = document.getElementById('text-modal');
        const textEditor = document.getElementById('text-editor');
        textEditor.innerHTML = element.innerHTML;
        modal.style.display = 'flex';
        textEditor.focus();
    }

    updateCanvasSize() {
        const wrapper = document.getElementById('canvas-wrapper');
        const dimensions = {
            desktop: { width: 1440, height: 900 },
            tablet: { width: 768, height: 1024 },
            mobile: { width: 375, height: 812 },
            watch: { width: 200, height: 200 }
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
            watch: 'Smart Watch'
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

    handleImageUpload(e) {
        const files = e.target.files;
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.assets.images.push({
                        id: this.generateId(),
                        name: file.name,
                        url: e.target.result
                    });
                    this.updateAssetsGrid();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    updateAssetsGrid() {
        const grid = document.getElementById('images-grid');
        grid.innerHTML = '';
        
        this.assets.images.forEach(image => {
            const item = document.createElement('div');
            item.className = 'asset-item';
            item.draggable = true;
            item.innerHTML = `<img src="${image.url}" alt="${image.name}">`;
            
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'asset',
                    value: image.url
                }));
            });
            
            grid.appendChild(item);
        });
    }

    searchIcons(query) {
        const icons = document.querySelectorAll('.icon-item');
        icons.forEach(icon => {
            const iconClass = icon.dataset.icon;
            const visible = iconClass.includes(query.toLowerCase()) || query === '';
            icon.style.display = visible ? 'flex' : 'none';
        });
    }

    applyColor(color) {
        if (this.selectedElement) {
            this.selectedElement.style.backgroundColor = color;
            this.updateProperties();
            this.saveState();
        }
    }

    applyFont(font) {
        if (this.selectedElement) {
            this.selectedElement.style.fontFamily = font;
            this.updateProperties();
            this.saveState();
        }
    }

    applyShadow(shadow) {
        if (this.selectedElement) {
            this.selectedElement.style.boxShadow = shadow;
            this.updateProperties();
            this.saveState();
        }
    }

    addLayer() {
        const data = { type: 'component', value: 'container' };
        this.createElement(data, 300, 200);
    }

    deleteLayer() {
        if (this.selectedElement) {
            this.deleteElement(this.selectedElement);
        }
    }

    duplicateLayer() {
        if (this.selectedElement) {
            this.duplicateElement();
        }
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
            layerCounter: this.layerCounter,
            zoom: this.zoom,
            device: this.currentDevice
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
        this.updateHistoryList();
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
                element.className = 'mockup-element mockup-' + elementData.type;
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
            this.zoom = state.zoom || 1;
            this.currentDevice = state.device || 'desktop';
            
            this.updateLayers();
            this.updateCanvasSize();
            this.applyZoom();
            this.hideDropZone();
        }
        
        this.updateHistoryButtons();
        this.updateHistoryList();
    }

    updateHistoryButtons() {
        document.getElementById('undo-btn').disabled = this.historyIndex <= 0;
        document.getElementById('redo-btn').disabled = this.historyIndex >= this.history.length - 1;
    }

    updateHistoryList() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        const recentActions = this.history.slice(-5).reverse();
        recentActions.forEach((state, index) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.textContent = `Action ${this.history.length - index}`;
            historyList.appendChild(item);
        });
    }

    showShareModal() {
        const modal = document.getElementById('share-modal');
        modal.style.display = 'flex';
        
        // Generate unique share link
        const shareId = this.generateId();
        document.getElementById('share-link').value = `https://mockup.tool/share/${shareId}`;
    }

    exportPNG() {
        this.exportAsImage('png');
    }

    exportPDF() {
        // Create a simple PDF export using canvas
        this.exportAsImage('png', true);
    }

    exportAsImage(format, isPDF = false) {
        // Temporarily hide UI elements
        const uiElements = this.canvas.querySelectorAll('.resize-handle');
        uiElements.forEach(el => el.style.display = 'none');
        
        // Use html2canvas library (would need to be included)
        if (typeof html2canvas !== 'undefined') {
            html2canvas(this.canvas, {
                backgroundColor: 'white',
                scale: 2,
                useCORS: true
            }).then(canvas => {
                if (isPDF) {
                    // For PDF, you'd typically use jsPDF
                    this.showToast('PDF export requires additional library');
                } else {
                    const link = document.createElement('a');
                    link.download = `mockup.${format}`;
                    link.href = canvas.toDataURL(`image/${format}`);
                    link.click();
                }
                
                // Restore UI elements
                uiElements.forEach(el => el.style.display = 'block');
            });
        } else {
            // Fallback: simple canvas rendering
            this.renderToCanvas();
        }
    }

    renderToCanvas() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const canvasWidth = parseInt(this.canvas.style.width) || 1440;
        const canvasHeight = parseInt(this.canvas.style.height) || 900;
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // Fill white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Simple text rendering for elements
        this.elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();
            
            const x = (rect.left - canvasRect.left) / this.zoom;
            const y = (rect.top - canvasRect.top) / this.zoom;
            const width = rect.width / this.zoom;
            const height = rect.height / this.zoom;
            
            // Draw element background
            const bgColor = element.style.backgroundColor || '#f8fafc';
            ctx.fillStyle = bgColor;
            ctx.fillRect(x, y, width, height);
            
            // Draw border
            if (element.style.borderWidth && parseInt(element.style.borderWidth) > 0) {
                const borderColor = element.style.borderColor || '#e2e8f0';
                const borderWidth = parseInt(element.style.borderWidth);
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = borderWidth;
                ctx.strokeRect(x, y, width, height);
            }
            
            // Draw text
            const text = element.dataset.text || element.textContent;
            if (text && text.trim()) {
                ctx.fillStyle = element.style.color || '#374151';
                ctx.font = `${element.style.fontSize || '16px'} ${element.style.fontFamily || 'Inter'}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, x + width / 2, y + height / 2);
            }
        });
        
        // Download
        const link = document.createElement('a');
        link.download = 'mockup.png';
        link.href = canvas.toDataURL();
        link.click();
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1e293b;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 10001;
            animation: slideInUp 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    generateId() {
        return 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new MockupTool();
});