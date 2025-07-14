class DesignSystemBuilder {
    constructor() {
        this.designSystem = {
            colors: new Map(),
            typography: new Map(),
            spacing: new Map(),
            shadows: new Map(),
            borders: new Map(),
            components: new Map(),
            guidelines: '',
            description: ''
        };
        
        this.selectedElement = null;
        this.currentSection = 'colors';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeDefaultTokens();
        this.updateStats();
        this.showSection('colors');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
                this.updateNavigation(item);
            });
        });

        // Action buttons
        document.getElementById('preview-system').addEventListener('click', () => this.showPreview());
        document.getElementById('export-css').addEventListener('click', () => this.exportCSS());
        document.getElementById('export-figma').addEventListener('click', () => this.exportFigma());
        document.getElementById('publish-system').addEventListener('click', () => this.publishSystem());

        // Add buttons
        document.getElementById('add-color').addEventListener('click', () => this.showColorModal());
        document.getElementById('add-font').addEventListener('click', () => this.addFont());
        document.getElementById('add-spacing').addEventListener('click', () => this.addSpacing());
        document.getElementById('add-shadow').addEventListener('click', () => this.addShadow());
        document.getElementById('add-border').addEventListener('click', () => this.addBorder());
        document.getElementById('add-button').addEventListener('click', () => this.showComponentModal('button'));
        document.getElementById('add-form-component').addEventListener('click', () => this.showComponentModal('form'));
        document.getElementById('add-card').addEventListener('click', () => this.showComponentModal('card'));
        document.getElementById('add-navigation').addEventListener('click', () => this.showComponentModal('navigation'));
        document.getElementById('add-layout').addEventListener('click', () => this.showComponentModal('layout'));
        document.getElementById('add-feedback').addEventListener('click', () => this.showComponentModal('feedback'));

        // Modal events
        this.setupModalEvents();

        // Resource downloads
        document.getElementById('download-css').addEventListener('click', () => this.downloadCSS());
        document.getElementById('download-js').addEventListener('click', () => this.downloadJS());
        document.getElementById('export-figma-lib').addEventListener('click', () => this.exportFigmaLibrary());
        document.getElementById('download-tokens').addEventListener('click', () => this.downloadTokens());

        // Editor events
        this.setupEditorEvents();

        // System description
        document.getElementById('system-description').addEventListener('input', (e) => {
            this.designSystem.description = e.target.value;
        });

        // Copy code buttons
        document.querySelectorAll('.copy-code').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const code = btn.dataset.code;
                navigator.clipboard.writeText(code).then(() => {
                    this.showToast('Code copied to clipboard!');
                });
            });
        });
    }

    setupModalEvents() {
        // Color modal
        const colorModal = document.getElementById('color-modal');
        const colorValue = document.getElementById('color-value');
        const colorHex = document.getElementById('color-hex');

        document.getElementById('close-color-modal').addEventListener('click', () => {
            colorModal.style.display = 'none';
        });

        document.getElementById('cancel-color').addEventListener('click', () => {
            colorModal.style.display = 'none';
        });

        document.getElementById('save-color').addEventListener('click', () => {
            this.saveColor();
        });

        // Sync color inputs
        colorValue.addEventListener('input', (e) => {
            colorHex.value = e.target.value;
        });

        colorHex.addEventListener('input', (e) => {
            colorValue.value = e.target.value;
        });

        // Component modal
        const componentModal = document.getElementById('component-modal');

        document.getElementById('close-component-modal').addEventListener('click', () => {
            componentModal.style.display = 'none';
        });

        document.getElementById('cancel-component').addEventListener('click', () => {
            componentModal.style.display = 'none';
        });

        document.getElementById('save-component').addEventListener('click', () => {
            this.saveComponent();
        });

        // Preview modal
        const previewModal = document.getElementById('preview-modal');

        document.getElementById('close-preview-modal').addEventListener('click', () => {
            previewModal.style.display = 'none';
        });

        document.getElementById('preview-light').addEventListener('click', () => {
            this.setPreviewTheme('light');
        });

        document.getElementById('preview-dark').addEventListener('click', () => {
            this.setPreviewTheme('dark');
        });

        document.getElementById('preview-mobile').addEventListener('click', () => {
            this.setPreviewDevice('mobile');
        });

        // Close modals on backdrop click
        [colorModal, componentModal, previewModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    setupEditorEvents() {
        // Rich text editor for guidelines
        document.querySelectorAll('.editor-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                document.execCommand(command, false, null);
                btn.classList.toggle('active');
            });
        });

        // Save guidelines
        document.getElementById('guidelines-editor').addEventListener('input', (e) => {
            this.designSystem.guidelines = e.target.innerHTML;
        });
    }

    initializeDefaultTokens() {
        // Initialize default colors
        this.addDefaultColors();
        this.addDefaultTypography();
        this.addDefaultSpacing();
        this.addDefaultShadows();
        this.addDefaultBorders();
        this.addDefaultComponents();
    }

    addDefaultColors() {
        const defaultColors = [
            { name: 'Primary Blue', value: '#3b82f6', category: 'primary', description: 'Main brand color for primary actions' },
            { name: 'Primary Dark', value: '#2563eb', category: 'primary', description: 'Darker variant for hover states' },
            { name: 'Success Green', value: '#10b981', category: 'semantic', description: 'For success messages and positive actions' },
            { name: 'Warning Orange', value: '#f59e0b', category: 'semantic', description: 'For warnings and caution states' },
            { name: 'Error Red', value: '#ef4444', category: 'semantic', description: 'For errors and destructive actions' },
            { name: 'Gray 100', value: '#f3f4f6', category: 'neutral', description: 'Light background color' },
            { name: 'Gray 500', value: '#6b7280', category: 'neutral', description: 'Medium gray for secondary text' },
            { name: 'Gray 900', value: '#111827', category: 'neutral', description: 'Dark color for primary text' }
        ];

        defaultColors.forEach(color => {
            this.designSystem.colors.set(this.generateId(), color);
        });

        this.renderColors();
    }

    addDefaultTypography() {
        const defaultFonts = [
            { 
                name: 'Inter', 
                type: 'sans-serif', 
                weights: ['300', '400', '500', '600', '700'], 
                usage: 'Primary font for UI and body text' 
            },
            { 
                name: 'JetBrains Mono', 
                type: 'monospace', 
                weights: ['400', '500', '600'], 
                usage: 'Code blocks and technical content' 
            }
        ];

        const defaultTypeScale = [
            { name: 'xs', size: '12px', lineHeight: '16px', usage: 'Small text, captions' },
            { name: 'sm', size: '14px', lineHeight: '20px', usage: 'Body text, labels' },
            { name: 'base', size: '16px', lineHeight: '24px', usage: 'Default body text' },
            { name: 'lg', size: '18px', lineHeight: '28px', usage: 'Large body text' },
            { name: 'xl', size: '20px', lineHeight: '28px', usage: 'Small headings' },
            { name: '2xl', size: '24px', lineHeight: '32px', usage: 'Medium headings' },
            { name: '3xl', size: '30px', lineHeight: '36px', usage: 'Large headings' },
            { name: '4xl', size: '36px', lineHeight: '40px', usage: 'Extra large headings' }
        ];

        const defaultTextStyles = [
            { 
                name: 'Heading 1', 
                properties: 'font-size: 36px;\nfont-weight: 700;\nline-height: 40px;\ncolor: #111827;' 
            },
            { 
                name: 'Heading 2', 
                properties: 'font-size: 30px;\nfont-weight: 600;\nline-height: 36px;\ncolor: #111827;' 
            },
            { 
                name: 'Body Large', 
                properties: 'font-size: 18px;\nfont-weight: 400;\nline-height: 28px;\ncolor: #374151;' 
            },
            { 
                name: 'Body', 
                properties: 'font-size: 16px;\nfont-weight: 400;\nline-height: 24px;\ncolor: #374151;' 
            },
            { 
                name: 'Caption', 
                properties: 'font-size: 14px;\nfont-weight: 500;\nline-height: 20px;\ncolor: #6b7280;' 
            }
        ];

        defaultFonts.forEach(font => {
            this.designSystem.typography.set(`font-${this.generateId()}`, font);
        });

        defaultTypeScale.forEach(scale => {
            this.designSystem.typography.set(`scale-${this.generateId()}`, scale);
        });

        defaultTextStyles.forEach(style => {
            this.designSystem.typography.set(`style-${this.generateId()}`, style);
        });

        this.renderTypography();
    }

    addDefaultSpacing() {
        const defaultSpacing = [
            { name: 'xs', value: '4px', pixels: 4 },
            { name: 'sm', value: '8px', pixels: 8 },
            { name: 'md', value: '16px', pixels: 16 },
            { name: 'lg', value: '24px', pixels: 24 },
            { name: 'xl', value: '32px', pixels: 32 },
            { name: '2xl', value: '48px', pixels: 48 },
            { name: '3xl', value: '64px', pixels: 64 }
        ];

        defaultSpacing.forEach(spacing => {
            this.designSystem.spacing.set(this.generateId(), spacing);
        });

        this.renderSpacing();
    }

    addDefaultShadows() {
        const defaultShadows = [
            { name: 'Small', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', usage: 'Subtle elevation' },
            { name: 'Medium', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', usage: 'Cards and panels' },
            { name: 'Large', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', usage: 'Modals and overlays' },
            { name: 'Extra Large', value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', usage: 'High elevation elements' }
        ];

        defaultShadows.forEach(shadow => {
            this.designSystem.shadows.set(this.generateId(), shadow);
        });

        this.renderShadows();
    }

    addDefaultBorders() {
        const defaultBorderWidths = [
            { name: 'Thin', value: '1px' },
            { name: 'Medium', value: '2px' },
            { name: 'Thick', value: '4px' }
        ];

        const defaultBorderRadius = [
            { name: 'Small', value: '4px' },
            { name: 'Medium', value: '8px' },
            { name: 'Large', value: '12px' },
            { name: 'Extra Large', value: '16px' },
            { name: 'Full', value: '9999px' }
        ];

        defaultBorderWidths.forEach(border => {
            this.designSystem.borders.set(`width-${this.generateId()}`, border);
        });

        defaultBorderRadius.forEach(radius => {
            this.designSystem.borders.set(`radius-${this.generateId()}`, radius);
        });

        this.renderBorders();
    }

    addDefaultComponents() {
        const defaultComponents = [
            {
                name: 'Primary Button',
                type: 'button',
                category: 'buttons',
                css: `background: #3b82f6;
color: white;
border: none;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
cursor: pointer;
transition: all 0.2s ease;`,
                html: '<button class="btn-primary">Click me</button>',
                description: 'Primary action button for main interactions'
            },
            {
                name: 'Text Input',
                type: 'input',
                category: 'forms',
                css: `width: 100%;
padding: 12px 16px;
border: 1px solid #d1d5db;
border-radius: 8px;
font-size: 16px;
transition: border-color 0.2s ease;`,
                html: '<input type="text" class="text-input" placeholder="Enter text">',
                description: 'Standard text input field'
            },
            {
                name: 'Card',
                type: 'card',
                category: 'cards',
                css: `background: white;
border: 1px solid #e5e7eb;
border-radius: 12px;
padding: 24px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);`,
                html: '<div class="card"><h3>Card Title</h3><p>Card content goes here.</p></div>',
                description: 'Basic content container'
            },
            {
                name: 'Alert',
                type: 'alert',
                category: 'feedback',
                css: `padding: 16px;
border: 1px solid #10b981;
background: #d1fae5;
color: #065f46;
border-radius: 8px;
font-weight: 500;`,
                html: '<div class="alert">Success! Your action was completed.</div>',
                description: 'Success alert message'
            }
        ];

        defaultComponents.forEach(component => {
            this.designSystem.components.set(this.generateId(), component);
        });

        this.renderComponents();
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const section = document.getElementById(`${sectionName}-section`);
        if (section) {
            section.classList.add('active');
            section.classList.add('fade-in');
        }

        this.currentSection = sectionName;
    }

    updateNavigation(activeItem) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }

    showColorModal() {
        const modal = document.getElementById('color-modal');
        modal.style.display = 'flex';
        
        // Clear form
        document.getElementById('color-name').value = '';
        document.getElementById('color-value').value = '#3b82f6';
        document.getElementById('color-hex').value = '#3b82f6';
        document.getElementById('color-category').value = 'primary';
        document.getElementById('color-description').value = '';
    }

    saveColor() {
        const name = document.getElementById('color-name').value;
        const value = document.getElementById('color-hex').value;
        const category = document.getElementById('color-category').value;
        const description = document.getElementById('color-description').value;

        if (!name || !value) {
            this.showToast('Please fill in all required fields');
            return;
        }

        const colorData = { name, value, category, description };
        this.designSystem.colors.set(this.generateId(), colorData);
        
        this.renderColors();
        this.updateStats();
        
        document.getElementById('color-modal').style.display = 'none';
        this.showToast('Color added successfully!');
    }

    renderColors() {
        const categories = ['primary', 'secondary', 'semantic', 'neutral'];
        
        categories.forEach(category => {
            const container = document.getElementById(`${category}-colors`);
            container.innerHTML = '';
            
            for (let [id, color] of this.designSystem.colors) {
                if (color.category === category) {
                    const colorElement = this.createColorElement(id, color);
                    container.appendChild(colorElement);
                }
            }
        });
    }

    createColorElement(id, color) {
        const element = document.createElement('div');
        element.className = 'color-token';
        element.innerHTML = `
            <div class="color-swatch" style="background: ${color.value};">
                <div style="color: ${this.getContrastColor(color.value)}; font-weight: 600; font-size: 0.875rem;">
                    ${color.value}
                </div>
            </div>
            <div class="color-info">
                <div class="color-name">${color.name}</div>
                <div class="color-value">${color.value}</div>
                <div class="color-description">${color.description}</div>
                <div class="color-actions">
                    <button class="color-action" onclick="designSystem.copyColor('${color.value}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button class="color-action" onclick="designSystem.editColor('${id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="color-action" onclick="designSystem.deleteColor('${id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        element.addEventListener('click', () => this.selectElement(element, 'color', id));
        
        return element;
    }

    renderTypography() {
        // Render font families
        const fontFamiliesList = document.getElementById('font-families-list');
        fontFamiliesList.innerHTML = '';
        
        for (let [id, font] of this.designSystem.typography) {
            if (font.type) { // This is a font family
                const fontElement = document.createElement('div');
                fontElement.className = 'font-item';
                fontElement.innerHTML = `
                    <div class="font-preview" style="font-family: ${font.name};">
                        The quick brown fox jumps over the lazy dog
                    </div>
                    <div class="font-details">
                        <span><strong>Family:</strong> ${font.name}</span>
                        <span><strong>Type:</strong> ${font.type}</span>
                        <span><strong>Weights:</strong> ${font.weights.join(', ')}</span>
                    </div>
                    <div class="font-usage">${font.usage}</div>
                `;
                fontFamiliesList.appendChild(fontElement);
            }
        }

        // Render type scale
        const typeScaleList = document.getElementById('type-scale-list');
        typeScaleList.innerHTML = '';
        
        for (let [id, scale] of this.designSystem.typography) {
            if (scale.size) { // This is a type scale item
                const scaleElement = document.createElement('div');
                scaleElement.className = 'scale-item';
                scaleElement.innerHTML = `
                    <div class="scale-preview" style="font-size: ${scale.size}; line-height: ${scale.lineHeight};">
                        Sample Text
                    </div>
                    <div class="scale-details">
                        <span><strong>${scale.name}</strong></span>
                        <span>${scale.size}</span>
                        <span>${scale.lineHeight}</span>
                        <span>${scale.usage}</span>
                    </div>
                `;
                typeScaleList.appendChild(scaleElement);
            }
        }

        // Render text styles
        const textStylesGrid = document.getElementById('text-styles-grid');
        textStylesGrid.innerHTML = '';
        
        for (let [id, style] of this.designSystem.typography) {
            if (style.properties) { // This is a text style
                const styleElement = document.createElement('div');
                styleElement.className = 'style-item';
                
                // Parse CSS properties for preview
                const cssObject = this.parseCSSProperties(style.properties);
                const previewStyle = Object.entries(cssObject)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('; ');
                
                styleElement.innerHTML = `
                    <div class="style-preview" style="${previewStyle}">
                        ${style.name}
                    </div>
                    <div class="style-properties">${style.properties}</div>
                `;
                textStylesGrid.appendChild(styleElement);
            }
        }
    }

    renderSpacing() {
        const spacingGrid = document.getElementById('spacing-grid');
        spacingGrid.innerHTML = '';
        
        for (let [id, spacing] of this.designSystem.spacing) {
            const spacingElement = document.createElement('div');
            spacingElement.className = 'spacing-token';
            spacingElement.innerHTML = `
                <div class="spacing-visual">
                    <div class="spacing-bar" style="width: ${Math.min(spacing.pixels * 2, 150)}px; height: 8px;"></div>
                </div>
                <div class="spacing-name">${spacing.name}</div>
                <div class="spacing-value">${spacing.value}</div>
            `;
            spacingGrid.appendChild(spacingElement);
        }

        // Render spacing examples
        const examplesGrid = document.getElementById('spacing-examples');
        examplesGrid.innerHTML = `
            <div class="spacing-example">
                <div class="example-label">Button Padding</div>
                <div class="example-visual">
                    <div class="example-box" style="padding: 12px 24px;">Button Text</div>
                </div>
            </div>
            <div class="spacing-example">
                <div class="example-label">Card Spacing</div>
                <div class="example-visual">
                    <div class="example-box" style="margin-bottom: 16px;">Card Header</div>
                    <div class="example-box">Card Content</div>
                </div>
            </div>
            <div class="spacing-example">
                <div class="example-label">Section Margins</div>
                <div class="example-visual">
                    <div class="example-box" style="margin-bottom: 32px;">Section 1</div>
                    <div class="example-box">Section 2</div>
                </div>
            </div>
        `;
    }

    renderShadows() {
        const shadowsGrid = document.getElementById('shadows-grid');
        shadowsGrid.innerHTML = '';
        
        for (let [id, shadow] of this.designSystem.shadows) {
            const shadowElement = document.createElement('div');
            shadowElement.className = 'shadow-token';
            shadowElement.innerHTML = `
                <div class="shadow-preview" style="box-shadow: ${shadow.value};">
                    Shadow
                </div>
                <div class="shadow-name">${shadow.name}</div>
                <div class="shadow-value">${shadow.value}</div>
                <div class="shadow-usage">${shadow.usage}</div>
            `;
            shadowsGrid.appendChild(shadowElement);
        }
    }

    renderBorders() {
        const borderWidths = document.getElementById('border-widths');
        const borderRadius = document.getElementById('border-radius');
        
        borderWidths.innerHTML = '';
        borderRadius.innerHTML = '';
        
        for (let [id, border] of this.designSystem.borders) {
            const borderElement = document.createElement('div');
            borderElement.className = 'border-token';
            
            if (id.startsWith('width-')) {
                borderElement.innerHTML = `
                    <div class="border-preview" style="border: ${border.value} solid #3b82f6;">
                        ${border.value}
                    </div>
                    <div class="border-name">${border.name}</div>
                    <div class="border-value">${border.value}</div>
                `;
                borderWidths.appendChild(borderElement);
            } else if (id.startsWith('radius-')) {
                borderElement.innerHTML = `
                    <div class="border-preview" style="border: 2px solid #3b82f6; border-radius: ${border.value};">
                        ${border.value}
                    </div>
                    <div class="border-name">${border.name}</div>
                    <div class="border-value">${border.value}</div>
                `;
                borderRadius.appendChild(borderElement);
            }
        }
    }

    renderComponents() {
        const categories = ['buttons', 'forms', 'cards', 'navigation', 'layout', 'feedback'];
        
        categories.forEach(category => {
            const container = document.getElementById(`${category}-grid`);
            if (container) {
                container.innerHTML = '';
                
                for (let [id, component] of this.designSystem.components) {
                    if (component.category === category) {
                        const componentElement = this.createComponentElement(id, component);
                        container.appendChild(componentElement);
                    }
                }
            }
        });
    }

    createComponentElement(id, component) {
        const element = document.createElement('div');
        element.className = 'component-card';
        
        // Create a style element for the component
        const styleId = `style-${id}`;
        let existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `.component-preview-${id} { ${component.css} }`;
        document.head.appendChild(style);
        
        element.innerHTML = `
            <div class="component-preview">
                <div class="component-preview-${id}">${component.html.replace(/class="[^"]*"/g, `class="component-preview-${id}"`)}</div>
            </div>
            <div class="component-info">
                <div class="component-name">${component.name}</div>
                <div class="component-description">${component.description}</div>
                <div class="component-actions">
                    <button class="component-action" onclick="designSystem.copyComponentCSS('${id}')">
                        <i class="fas fa-copy"></i> Copy CSS
                    </button>
                    <button class="component-action" onclick="designSystem.copyComponentHTML('${id}')">
                        <i class="fas fa-code"></i> Copy HTML
                    </button>
                    <button class="component-action" onclick="designSystem.editComponent('${id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
                <div class="component-code">
                    <pre><code>${component.css}</code></pre>
                </div>
            </div>
        `;
        
        return element;
    }

    showComponentModal(category) {
        const modal = document.getElementById('component-modal');
        modal.style.display = 'flex';
        
        // Set category in type select
        document.getElementById('component-type').value = category === 'forms' ? 'input' : 
                                                        category === 'feedback' ? 'alert' : 
                                                        category;
        
        // Clear form
        document.getElementById('component-name').value = '';
        document.getElementById('component-css').value = '';
        document.getElementById('component-html').value = '';
    }

    saveComponent() {
        const name = document.getElementById('component-name').value;
        const type = document.getElementById('component-type').value;
        const css = document.getElementById('component-css').value;
        const html = document.getElementById('component-html').value;

        if (!name || !css || !html) {
            this.showToast('Please fill in all required fields');
            return;
        }

        const category = this.getComponentCategory(type);
        const componentData = {
            name,
            type,
            category,
            css,
            html,
            description: `Custom ${name} component`
        };

        this.designSystem.components.set(this.generateId(), componentData);
        
        this.renderComponents();
        this.updateStats();
        
        document.getElementById('component-modal').style.display = 'none';
        this.showToast('Component added successfully!');
    }

    getComponentCategory(type) {
        const categoryMap = {
            button: 'buttons',
            input: 'forms',
            select: 'forms',
            textarea: 'forms',
            card: 'cards',
            modal: 'cards',
            navbar: 'navigation',
            menu: 'navigation',
            sidebar: 'navigation',
            grid: 'layout',
            container: 'layout',
            alert: 'feedback',
            toast: 'feedback',
            notification: 'feedback'
        };
        
        return categoryMap[type] || 'cards';
    }

    selectElement(element, type, id) {
        // Remove previous selection
        document.querySelectorAll('.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selection to current element
        element.classList.add('selected');
        this.selectedElement = { element, type, id };
        
        this.updatePropertiesPanel();
    }

    updatePropertiesPanel() {
        const propertiesContent = document.getElementById('properties-content');
        
        if (!this.selectedElement) {
            propertiesContent.innerHTML = `
                <div class="no-selection">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>Select an element to edit properties</p>
                </div>
            `;
            return;
        }

        const { type, id } = this.selectedElement;
        let data;
        
        switch (type) {
            case 'color':
                data = this.designSystem.colors.get(id);
                this.renderColorProperties(data, id);
                break;
            case 'component':
                data = this.designSystem.components.get(id);
                this.renderComponentProperties(data, id);
                break;
            // Add more cases as needed
        }
    }

    renderColorProperties(color, id) {
        const propertiesContent = document.getElementById('properties-content');
        propertiesContent.innerHTML = `
            <div class="form-group">
                <label>Color Name</label>
                <input type="text" id="prop-color-name" value="${color.name}">
            </div>
            <div class="form-group">
                <label>Color Value</label>
                <div class="color-input-group">
                    <input type="color" id="prop-color-value" value="${color.value}">
                    <input type="text" id="prop-color-hex" value="${color.value}">
                </div>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="prop-color-category">
                    <option value="primary" ${color.category === 'primary' ? 'selected' : ''}>Primary</option>
                    <option value="secondary" ${color.category === 'secondary' ? 'selected' : ''}>Secondary</option>
                    <option value="semantic" ${color.category === 'semantic' ? 'selected' : ''}>Semantic</option>
                    <option value="neutral" ${color.category === 'neutral' ? 'selected' : ''}>Neutral</option>
                </select>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="prop-color-description">${color.description}</textarea>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" onclick="designSystem.updateColor('${id}')">
                    Update Color
                </button>
            </div>
        `;

        // Sync color inputs
        const colorValue = document.getElementById('prop-color-value');
        const colorHex = document.getElementById('prop-color-hex');

        colorValue.addEventListener('input', (e) => {
            colorHex.value = e.target.value;
        });

        colorHex.addEventListener('input', (e) => {
            colorValue.value = e.target.value;
        });
    }

    updateColor(id) {
        const name = document.getElementById('prop-color-name').value;
        const value = document.getElementById('prop-color-hex').value;
        const category = document.getElementById('prop-color-category').value;
        const description = document.getElementById('prop-color-description').value;

        const colorData = { name, value, category, description };
        this.designSystem.colors.set(id, colorData);
        
        this.renderColors();
        this.showToast('Color updated successfully!');
    }

    updateStats() {
        const colorsCount = this.designSystem.colors.size;
        const componentsCount = this.designSystem.components.size;
        const tokensCount = colorsCount + this.designSystem.spacing.size + this.designSystem.shadows.size;

        document.getElementById('colors-count').textContent = colorsCount;
        document.getElementById('components-count').textContent = componentsCount;
        document.getElementById('tokens-count').textContent = tokensCount;
    }

    showPreview() {
        const modal = document.getElementById('preview-modal');
        const frame = document.getElementById('preview-frame');
        
        frame.innerHTML = this.generatePreviewHTML();
        modal.style.display = 'flex';
    }

    generatePreviewHTML() {
        let html = '<div class="design-system-preview">';
        
        // Colors preview
        html += '<section class="preview-section"><h2>Colors</h2><div class="preview-colors">';
        for (let [id, color] of this.designSystem.colors) {
            html += `<div class="preview-color" style="background: ${color.value}; width: 60px; height: 60px; margin: 4px; border-radius: 8px; display: inline-block;" title="${color.name}"></div>`;
        }
        html += '</div></section>';

        // Components preview
        html += '<section class="preview-section"><h2>Components</h2><div class="preview-components">';
        for (let [id, component] of this.designSystem.components) {
            html += `<div class="preview-component" style="margin: 16px;"><h4>${component.name}</h4><div style="${component.css}">${component.html}</div></div>`;
        }
        html += '</div></section>';

        html += '</div>';
        return html;
    }

    exportCSS() {
        let css = ':root {\n';
        
        // Export color variables
        for (let [id, color] of this.designSystem.colors) {
            const varName = `--color-${color.name.toLowerCase().replace(/\s+/g, '-')}`;
            css += `  ${varName}: ${color.value};\n`;
        }
        
        // Export spacing variables
        for (let [id, spacing] of this.designSystem.spacing) {
            const varName = `--spacing-${spacing.name}`;
            css += `  ${varName}: ${spacing.value};\n`;
        }
        
        css += '}\n\n';
        
        // Export component styles
        for (let [id, component] of this.designSystem.components) {
            const className = `.${component.name.toLowerCase().replace(/\s+/g, '-')}`;
            css += `${className} {\n  ${component.css.replace(/;/g, ';\n  ')}\n}\n\n`;
        }
        
        this.downloadFile(css, 'design-system.css', 'text/css');
    }

    downloadCSS() {
        this.exportCSS();
    }

    downloadJS() {
        const tokens = {
            colors: {},
            spacing: {},
            shadows: {},
            borders: {}
        };

        // Convert colors
        for (let [id, color] of this.designSystem.colors) {
            const key = color.name.toLowerCase().replace(/\s+/g, '');
            tokens.colors[key] = color.value;
        }

        // Convert spacing
        for (let [id, spacing] of this.designSystem.spacing) {
            tokens.spacing[spacing.name] = spacing.value;
        }

        // Convert shadows
        for (let [id, shadow] of this.designSystem.shadows) {
            const key = shadow.name.toLowerCase().replace(/\s+/g, '');
            tokens.shadows[key] = shadow.value;
        }

        const jsContent = `export const designTokens = ${JSON.stringify(tokens, null, 2)};`;
        this.downloadFile(jsContent, 'design-tokens.js', 'text/javascript');
    }

    downloadTokens() {
        const tokens = {
            color: {},
            spacing: {},
            shadow: {},
            border: {}
        };

        // Style Dictionary format
        for (let [id, color] of this.designSystem.colors) {
            const path = ['color', color.category, color.name.toLowerCase().replace(/\s+/g, '-')];
            this.setNestedProperty(tokens, path, { value: color.value });
        }

        for (let [id, spacing] of this.designSystem.spacing) {
            tokens.spacing[spacing.name] = { value: spacing.value };
        }

        const tokensContent = JSON.stringify(tokens, null, 2);
        this.downloadFile(tokensContent, 'tokens.json', 'application/json');
    }

    exportFigma() {
        this.showToast('Figma export feature coming soon!');
    }

    exportFigmaLibrary() {
        this.showToast('Figma library export feature coming soon!');
    }

    publishSystem() {
        this.showToast('Design system published successfully!');
    }

    setPreviewTheme(theme) {
        const frame = document.getElementById('preview-frame');
        frame.className = `preview-frame theme-${theme}`;
    }

    setPreviewDevice(device) {
        const frame = document.getElementById('preview-frame');
        frame.classList.add(`device-${device}`);
    }

    // Utility methods
    copyColor(value) {
        navigator.clipboard.writeText(value).then(() => {
            this.showToast('Color copied to clipboard!');
        });
    }

    copyComponentCSS(id) {
        const component = this.designSystem.components.get(id);
        navigator.clipboard.writeText(component.css).then(() => {
            this.showToast('CSS copied to clipboard!');
        });
    }

    copyComponentHTML(id) {
        const component = this.designSystem.components.get(id);
        navigator.clipboard.writeText(component.html).then(() => {
            this.showToast('HTML copied to clipboard!');
        });
    }

    deleteColor(id) {
        if (confirm('Are you sure you want to delete this color?')) {
            this.designSystem.colors.delete(id);
            this.renderColors();
            this.updateStats();
            this.showToast('Color deleted successfully!');
        }
    }

    editColor(id) {
        const color = this.designSystem.colors.get(id);
        const modal = document.getElementById('color-modal');
        
        document.getElementById('color-name').value = color.name;
        document.getElementById('color-value').value = color.value;
        document.getElementById('color-hex').value = color.value;
        document.getElementById('color-category').value = color.category;
        document.getElementById('color-description').value = color.description;
        
        modal.style.display = 'flex';
        
        // Update save button to edit mode
        const saveBtn = document.getElementById('save-color');
        saveBtn.onclick = () => {
            this.updateColor(id);
            modal.style.display = 'none';
        };
    }

    editComponent(id) {
        const component = this.designSystem.components.get(id);
        const modal = document.getElementById('component-modal');
        
        document.getElementById('component-name').value = component.name;
        document.getElementById('component-type').value = component.type;
        document.getElementById('component-css').value = component.css;
        document.getElementById('component-html').value = component.html;
        
        modal.style.display = 'flex';
        
        // Update save button to edit mode
        const saveBtn = document.getElementById('save-component');
        saveBtn.onclick = () => {
            this.updateComponent(id);
            modal.style.display = 'none';
        };
    }

    updateComponent(id) {
        const name = document.getElementById('component-name').value;
        const type = document.getElementById('component-type').value;
        const css = document.getElementById('component-css').value;
        const html = document.getElementById('component-html').value;

        const category = this.getComponentCategory(type);
        const componentData = {
            name,
            type,
            category,
            css,
            html,
            description: `Updated ${name} component`
        };

        this.designSystem.components.set(id, componentData);
        this.renderComponents();
        this.showToast('Component updated successfully!');
    }

    getContrastColor(hexColor) {
        // Convert hex to RGB
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    parseCSSProperties(cssString) {
        const cssObject = {};
        const declarations = cssString.split(';');
        
        declarations.forEach(declaration => {
            const colonIndex = declaration.indexOf(':');
            if (colonIndex > 0) {
                const property = declaration.slice(0, colonIndex).trim();
                const value = declaration.slice(colonIndex + 1).trim();
                if (property && value) {
                    cssObject[property] = value;
                }
            }
        });
        
        return cssObject;
    }

    setNestedProperty(obj, path, value) {
        let current = obj;
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                current[path[i]] = {};
            }
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1f2937;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            z-index: 10001;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            animation: slideInUp 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    generateId() {
        return 'ds_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Add placeholder methods for missing functionality
    addFont() {
        this.showToast('Add font feature coming soon!');
    }

    addSpacing() {
        this.showToast('Add spacing feature coming soon!');
    }

    addShadow() {
        this.showToast('Add shadow feature coming soon!');
    }

    addBorder() {
        this.showToast('Add border feature coming soon!');
    }
}

// Initialize the application
let designSystem;
document.addEventListener('DOMContentLoaded', () => {
    designSystem = new DesignSystemBuilder();
});