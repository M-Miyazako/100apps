class CSSGenerator {
    constructor() {
        this.currentTab = 'box-shadow';
        this.currentStyles = {
            'box-shadow': {},
            'border-radius': {},
            'text-shadow': {},
            'transform': {},
            'animation': {},
            'flexbox': {},
            'grid': {},
            'filter': {}
        };
        
        this.initializeEventListeners();
        this.initializeControls();
        this.updatePreview();
        this.updateCSSOutput();
    }

    initializeEventListeners() {
        // タブ切り替え
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // プレビューコントロール
        this.initializePreviewControls();

        // 各ジェネレーターのコントロール
        this.initializeBoxShadowControls();
        this.initializeBorderRadiusControls();
        this.initializeTextShadowControls();
        this.initializeTransformControls();
        this.initializeAnimationControls();
        this.initializeFlexboxControls();
        this.initializeGridControls();
        this.initializeFilterControls();

        // 出力アクション
        document.getElementById('copyCSS').addEventListener('click', () => {
            this.copyCSS();
        });

        document.getElementById('downloadCSS').addEventListener('click', () => {
            this.downloadCSS();
        });

        document.getElementById('resetAll').addEventListener('click', () => {
            this.resetAll();
        });
    }

    initializeControls() {
        // 初期値設定
        this.currentStyles['box-shadow'] = {
            x: 0, y: 5, blur: 15, spread: 0,
            color: '#000000', opacity: 30, inset: false
        };
        
        this.currentStyles['border-radius'] = {
            tl: 0, tr: 0, bl: 0, br: 0, unified: true
        };
        
        this.currentStyles['text-shadow'] = {
            x: 1, y: 1, blur: 0, color: '#000000'
        };
        
        this.currentStyles['transform'] = {
            rotate: 0, scaleX: 1, scaleY: 1,
            translateX: 0, translateY: 0,
            skewX: 0, skewY: 0, origin: 'center'
        };
        
        this.currentStyles['animation'] = {
            name: 'myAnimation', duration: 1, easing: 'ease',
            delay: 0, iterations: 1, direction: 'normal'
        };
        
        this.currentStyles['flexbox'] = {
            direction: 'row', justify: 'flex-start',
            align: 'stretch', wrap: 'nowrap', itemCount: 3
        };
        
        this.currentStyles['grid'] = {
            columns: 3, rows: 2, columnGap: 10, rowGap: 10
        };
        
        this.currentStyles['filter'] = {
            blur: 0, brightness: 100, contrast: 100,
            saturate: 100, hueRotate: 0, sepia: 0,
            grayscale: 0, invert: 0
        };
    }

    initializePreviewControls() {
        const bgColor = document.getElementById('backgroundColor');
        const elementColor = document.getElementById('elementColor');
        const textColor = document.getElementById('textColor');
        const width = document.getElementById('elementWidth');
        const height = document.getElementById('elementHeight');

        bgColor.addEventListener('input', (e) => {
            document.querySelector('.preview-container').style.backgroundColor = e.target.value;
        });

        elementColor.addEventListener('input', (e) => {
            document.getElementById('previewElement').style.backgroundColor = e.target.value;
        });

        textColor.addEventListener('input', (e) => {
            document.querySelector('.preview-text').style.color = e.target.value;
        });

        width.addEventListener('input', (e) => {
            document.getElementById('previewElement').style.width = `${e.target.value}px`;
            document.getElementById('widthValue').textContent = `${e.target.value}px`;
        });

        height.addEventListener('input', (e) => {
            document.getElementById('previewElement').style.height = `${e.target.value}px`;
            document.getElementById('heightValue').textContent = `${e.target.value}px`;
        });
    }

    initializeBoxShadowControls() {
        const controls = [
            'shadowX', 'shadowY', 'shadowBlur', 'shadowSpread', 'shadowOpacity'
        ];

        controls.forEach(id => {
            const input = document.getElementById(id);
            const valueSpan = document.getElementById(id + 'Value');
            
            input.addEventListener('input', (e) => {
                const property = id.replace('shadow', '').toLowerCase();
                let value = parseInt(e.target.value);
                
                if (property === 'opacity') {
                    this.currentStyles['box-shadow'][property] = value;
                    valueSpan.textContent = `${value}%`;
                } else {
                    this.currentStyles['box-shadow'][property === 'x' ? 'x' : 
                                                     property === 'y' ? 'y' :
                                                     property === 'blur' ? 'blur' : 'spread'] = value;
                    valueSpan.textContent = `${value}px`;
                }
                
                this.updatePreview();
                this.updateCSSOutput();
            });
        });

        document.getElementById('shadowColor').addEventListener('input', (e) => {
            this.currentStyles['box-shadow'].color = e.target.value;
            this.updatePreview();
            this.updateCSSOutput();
        });

        document.getElementById('shadowInset').addEventListener('change', (e) => {
            this.currentStyles['box-shadow'].inset = e.target.checked;
            this.updatePreview();
            this.updateCSSOutput();
        });

        // プリセット
        document.querySelectorAll('[data-preset]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyBoxShadowPreset(e.target.dataset.preset);
            });
        });
    }

    initializeBorderRadiusControls() {
        const corners = ['TL', 'TR', 'BL', 'BR'];
        
        corners.forEach(corner => {
            const input = document.getElementById(`radius${corner}`);
            const valueSpan = document.getElementById(`radius${corner}Value`);
            
            input.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.currentStyles['border-radius'][corner.toLowerCase()] = value;
                valueSpan.textContent = `${value}px`;
                
                // 統一設定時は他も更新
                if (this.currentStyles['border-radius'].unified) {
                    corners.forEach(c => {
                        if (c !== corner) {
                            document.getElementById(`radius${c}`).value = value;
                            document.getElementById(`radius${c}Value`).textContent = `${value}px`;
                            this.currentStyles['border-radius'][c.toLowerCase()] = value;
                        }
                    });
                }
                
                this.updatePreview();
                this.updateCSSOutput();
            });
        });

        document.getElementById('unifiedRadius').addEventListener('change', (e) => {
            this.currentStyles['border-radius'].unified = e.target.checked;
        });

        document.getElementById('allRadius').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('allRadiusValue').textContent = `${value}px`;
            
            corners.forEach(corner => {
                document.getElementById(`radius${corner}`).value = value;
                document.getElementById(`radius${corner}Value`).textContent = `${value}px`;
                this.currentStyles['border-radius'][corner.toLowerCase()] = value;
            });
            
            this.updatePreview();
            this.updateCSSOutput();
        });

        // 形状プリセット
        document.querySelectorAll('[data-shape]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyShapePreset(e.target.dataset.shape);
            });
        });
    }

    initializeTextShadowControls() {
        const controls = ['textShadowX', 'textShadowY', 'textShadowBlur'];
        
        controls.forEach(id => {
            const input = document.getElementById(id);
            const valueSpan = document.getElementById(id + 'Value');
            
            input.addEventListener('input', (e) => {
                const property = id.replace('textShadow', '').toLowerCase();
                const value = parseInt(e.target.value);
                this.currentStyles['text-shadow'][property] = value;
                valueSpan.textContent = `${value}px`;
                this.updatePreview();
                this.updateCSSOutput();
            });
        });

        document.getElementById('textShadowColor').addEventListener('input', (e) => {
            this.currentStyles['text-shadow'].color = e.target.value;
            this.updatePreview();
            this.updateCSSOutput();
        });

        document.getElementById('fontSize').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('fontSizeValue').textContent = `${value}px`;
            document.querySelector('.preview-text').style.fontSize = `${value}px`;
        });

        document.getElementById('fontWeight').addEventListener('change', (e) => {
            document.querySelector('.preview-text').style.fontWeight = e.target.value;
        });
    }

    initializeTransformControls() {
        const controls = [
            'rotate', 'scaleX', 'scaleY', 'translateX', 'translateY', 'skewX', 'skewY'
        ];

        controls.forEach(id => {
            const input = document.getElementById(id);
            const valueSpan = document.getElementById(id + 'Value');
            
            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.currentStyles['transform'][id] = value;
                
                if (id === 'rotate' || id.includes('skew')) {
                    valueSpan.textContent = `${value}deg`;
                } else if (id.includes('scale')) {
                    valueSpan.textContent = value;
                } else {
                    valueSpan.textContent = `${value}px`;
                }
                
                this.updatePreview();
                this.updateCSSOutput();
            });
        });

        // 変形の基点
        document.querySelectorAll('.origin-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.origin-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentStyles['transform'].origin = btn.dataset.origin;
                this.updatePreview();
                this.updateCSSOutput();
            });
        });
    }

    initializeAnimationControls() {
        document.getElementById('animationName').addEventListener('input', (e) => {
            this.currentStyles['animation'].name = e.target.value;
            this.updateCSSOutput();
        });

        document.getElementById('animationDuration').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.currentStyles['animation'].duration = value;
            document.getElementById('animationDurationValue').textContent = `${value}s`;
            this.updateCSSOutput();
        });

        document.getElementById('animationEasing').addEventListener('change', (e) => {
            this.currentStyles['animation'].easing = e.target.value;
            this.updateCSSOutput();
        });

        document.getElementById('animationDelay').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.currentStyles['animation'].delay = value;
            document.getElementById('animationDelayValue').textContent = `${value}s`;
            this.updateCSSOutput();
        });

        document.getElementById('animationIterations').addEventListener('change', (e) => {
            this.currentStyles['animation'].iterations = e.target.value;
            this.updateCSSOutput();
        });

        document.getElementById('animationDirection').addEventListener('change', (e) => {
            this.currentStyles['animation'].direction = e.target.value;
            this.updateCSSOutput();
        });

        // アニメーションプリセット
        document.querySelectorAll('[data-animation]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyAnimationPreset(e.target.dataset.animation);
            });
        });

        // アニメーション制御
        document.getElementById('playAnimation').addEventListener('click', () => {
            this.playAnimation();
        });

        document.getElementById('pauseAnimation').addEventListener('click', () => {
            this.pauseAnimation();
        });

        document.getElementById('resetAnimation').addEventListener('click', () => {
            this.resetAnimation();
        });
    }

    initializeFlexboxControls() {
        document.getElementById('flexDirection').addEventListener('change', (e) => {
            this.currentStyles['flexbox'].direction = e.target.value;
            this.updateFlexPreview();
            this.updateCSSOutput();
        });

        document.getElementById('justifyContent').addEventListener('change', (e) => {
            this.currentStyles['flexbox'].justify = e.target.value;
            this.updateFlexPreview();
            this.updateCSSOutput();
        });

        document.getElementById('alignItems').addEventListener('change', (e) => {
            this.currentStyles['flexbox'].align = e.target.value;
            this.updateFlexPreview();
            this.updateCSSOutput();
        });

        document.getElementById('flexWrap').addEventListener('change', (e) => {
            this.currentStyles['flexbox'].wrap = e.target.value;
            this.updateFlexPreview();
            this.updateCSSOutput();
        });

        document.getElementById('flexItemCount').addEventListener('input', (e) => {
            const count = parseInt(e.target.value);
            this.currentStyles['flexbox'].itemCount = count;
            document.getElementById('flexItemCountValue').textContent = count;
            this.updateFlexPreview();
        });
    }

    initializeGridControls() {
        document.getElementById('gridColumns').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.currentStyles['grid'].columns = value;
            document.getElementById('gridColumnsValue').textContent = value;
            this.updateGridPreview();
            this.updateCSSOutput();
        });

        document.getElementById('gridRows').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.currentStyles['grid'].rows = value;
            document.getElementById('gridRowsValue').textContent = value;
            this.updateGridPreview();
            this.updateCSSOutput();
        });

        document.getElementById('gridColumnGap').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.currentStyles['grid'].columnGap = value;
            document.getElementById('gridColumnGapValue').textContent = `${value}px`;
            this.updateGridPreview();
            this.updateCSSOutput();
        });

        document.getElementById('gridRowGap').addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.currentStyles['grid'].rowGap = value;
            document.getElementById('gridRowGapValue').textContent = `${value}px`;
            this.updateGridPreview();
            this.updateCSSOutput();
        });
    }

    initializeFilterControls() {
        const filters = [
            'filterBlur', 'filterBrightness', 'filterContrast', 
            'filterSaturate', 'filterHueRotate', 'filterSepia',
            'filterGrayscale', 'filterInvert'
        ];

        filters.forEach(id => {
            const input = document.getElementById(id);
            const valueSpan = document.getElementById(id + 'Value');
            
            input.addEventListener('input', (e) => {
                const property = id.replace('filter', '').toLowerCase();
                const value = parseInt(e.target.value);
                this.currentStyles['filter'][property] = value;
                
                if (property === 'blur') {
                    valueSpan.textContent = `${value}px`;
                } else if (property === 'huerotate') {
                    valueSpan.textContent = `${value}deg`;
                } else {
                    valueSpan.textContent = `${value}%`;
                }
                
                this.updatePreview();
                this.updateCSSOutput();
            });
        });

        // フィルタープリセット
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.applyFilterPreset(e.target.dataset.filter);
            });
        });
    }

    switchTab(tabName) {
        // タブボタンの状態更新
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // タブコンテンツの表示切り替え
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-content`).classList.add('active');

        this.currentTab = tabName;
        this.updatePreview();
        this.updateCSSOutput();
    }

    updatePreview() {
        const element = document.getElementById('previewElement');
        const styles = this.currentStyles[this.currentTab];

        switch (this.currentTab) {
            case 'box-shadow':
                this.applyBoxShadow(element, styles);
                break;
            case 'border-radius':
                this.applyBorderRadius(element, styles);
                break;
            case 'text-shadow':
                this.applyTextShadow(element, styles);
                break;
            case 'transform':
                this.applyTransform(element, styles);
                break;
            case 'filter':
                this.applyFilter(element, styles);
                break;
        }
    }

    applyBoxShadow(element, styles) {
        const { x, y, blur, spread, color, opacity, inset } = styles;
        const alpha = opacity / 100;
        const colorWithAlpha = this.hexToRgba(color, alpha);
        const insetValue = inset ? 'inset ' : '';
        
        element.style.boxShadow = `${insetValue}${x}px ${y}px ${blur}px ${spread}px ${colorWithAlpha}`;
    }

    applyBorderRadius(element, styles) {
        const { tl, tr, bl, br } = styles;
        element.style.borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
    }

    applyTextShadow(element, styles) {
        const { x, y, blur, color } = styles;
        const textElement = element.querySelector('.preview-text');
        textElement.style.textShadow = `${x}px ${y}px ${blur}px ${color}`;
    }

    applyTransform(element, styles) {
        const { rotate, scaleX, scaleY, translateX, translateY, skewX, skewY, origin } = styles;
        
        element.style.transformOrigin = origin;
        element.style.transform = `
            rotate(${rotate}deg) 
            scale(${scaleX}, ${scaleY}) 
            translate(${translateX}px, ${translateY}px) 
            skew(${skewX}deg, ${skewY}deg)
        `.replace(/\s+/g, ' ').trim();
    }

    applyFilter(element, styles) {
        const { blur, brightness, contrast, saturate, hueRotate, sepia, grayscale, invert } = styles;
        
        element.style.filter = `
            blur(${blur}px) 
            brightness(${brightness}%) 
            contrast(${contrast}%) 
            saturate(${saturate}%) 
            hue-rotate(${hueRotate}deg) 
            sepia(${sepia}%) 
            grayscale(${grayscale}%) 
            invert(${invert}%)
        `.replace(/\s+/g, ' ').trim();
    }

    updateFlexPreview() {
        const container = document.getElementById('flexContainer');
        const { direction, justify, align, wrap, itemCount } = this.currentStyles['flexbox'];
        
        container.style.flexDirection = direction;
        container.style.justifyContent = justify;
        container.style.alignItems = align;
        container.style.flexWrap = wrap;
        
        // アイテム数を更新
        container.innerHTML = '';
        for (let i = 1; i <= itemCount; i++) {
            const item = document.createElement('div');
            item.className = 'flex-item';
            item.textContent = i;
            container.appendChild(item);
        }
    }

    updateGridPreview() {
        const container = document.getElementById('gridContainer');
        const { columns, rows, columnGap, rowGap } = this.currentStyles['grid'];
        
        container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        container.style.columnGap = `${columnGap}px`;
        container.style.rowGap = `${rowGap}px`;
        
        // アイテムを更新
        container.innerHTML = '';
        const totalItems = columns * rows;
        for (let i = 1; i <= totalItems; i++) {
            const item = document.createElement('div');
            item.className = 'grid-item';
            item.textContent = i;
            container.appendChild(item);
        }
    }

    applyBoxShadowPreset(preset) {
        const presets = {
            subtle: { x: 0, y: 2, blur: 4, spread: 0, opacity: 20 },
            medium: { x: 0, y: 4, blur: 12, spread: 0, opacity: 25 },
            large: { x: 0, y: 10, blur: 30, spread: 0, opacity: 30 },
            inset: { x: 0, y: 2, blur: 4, spread: 0, opacity: 20, inset: true },
            colored: { x: 0, y: 4, blur: 12, spread: 0, opacity: 50, color: '#667eea' },
            multiple: { x: 0, y: 1, blur: 3, spread: 0, opacity: 20 } // 簡略化
        };
        
        const presetStyle = presets[preset];
        if (presetStyle) {
            Object.assign(this.currentStyles['box-shadow'], presetStyle);
            this.updateControlValues('box-shadow');
            this.updatePreview();
            this.updateCSSOutput();
        }
    }

    applyShapePreset(shape) {
        const shapes = {
            square: { tl: 0, tr: 0, bl: 0, br: 0 },
            rounded: { tl: 10, tr: 10, bl: 10, br: 10 },
            circle: { tl: 50, tr: 50, bl: 50, br: 50 },
            pill: { tl: 25, tr: 25, bl: 25, br: 25 },
            leaf: { tl: 50, tr: 0, bl: 50, br: 0 },
            blob: { tl: 30, tr: 70, bl: 70, br: 30 }
        };
        
        const shapeStyle = shapes[shape];
        if (shapeStyle) {
            Object.assign(this.currentStyles['border-radius'], shapeStyle);
            this.updateControlValues('border-radius');
            this.updatePreview();
            this.updateCSSOutput();
        }
    }

    applyAnimationPreset(animation) {
        const presets = {
            bounce: { name: 'bounce', duration: 1, easing: 'ease' },
            pulse: { name: 'pulse', duration: 1, easing: 'ease-in-out', iterations: 'infinite' },
            shake: { name: 'shake', duration: 0.5, easing: 'ease-in-out' },
            fadeIn: { name: 'fadeIn', duration: 1, easing: 'ease-in' },
            slideIn: { name: 'slideIn', duration: 0.5, easing: 'ease-out' },
            rotate: { name: 'rotate', duration: 2, easing: 'linear', iterations: 'infinite' }
        };
        
        const presetStyle = presets[animation];
        if (presetStyle) {
            Object.assign(this.currentStyles['animation'], presetStyle);
            this.updateControlValues('animation');
            this.updateCSSOutput();
        }
    }

    applyFilterPreset(filter) {
        const presets = {
            normal: { blur: 0, brightness: 100, contrast: 100, saturate: 100, hueRotate: 0, sepia: 0, grayscale: 0, invert: 0 },
            vintage: { brightness: 110, contrast: 120, saturate: 80, sepia: 30 },
            dramatic: { contrast: 150, brightness: 90, saturate: 120 },
            cool: { hueRotate: 180, saturate: 120, brightness: 110 },
            warm: { hueRotate: 30, saturate: 110, brightness: 105 },
            bw: { grayscale: 100 }
        };
        
        const presetStyle = presets[filter];
        if (presetStyle) {
            Object.assign(this.currentStyles['filter'], presetStyle);
            this.updateControlValues('filter');
            this.updatePreview();
            this.updateCSSOutput();
        }
    }

    updateControlValues(tab) {
        // コントロールの値を現在の設定に合わせて更新
        const styles = this.currentStyles[tab];
        
        switch (tab) {
            case 'box-shadow':
                this.setControlValue('shadowX', styles.x, 'px');
                this.setControlValue('shadowY', styles.y, 'px');
                this.setControlValue('shadowBlur', styles.blur, 'px');
                this.setControlValue('shadowSpread', styles.spread, 'px');
                this.setControlValue('shadowOpacity', styles.opacity, '%');
                document.getElementById('shadowColor').value = styles.color || '#000000';
                document.getElementById('shadowInset').checked = styles.inset || false;
                break;
            case 'border-radius':
                this.setControlValue('radiusTL', styles.tl, 'px');
                this.setControlValue('radiusTR', styles.tr, 'px');
                this.setControlValue('radiusBL', styles.bl, 'px');
                this.setControlValue('radiusBR', styles.br, 'px');
                break;
        }
    }

    setControlValue(id, value, unit) {
        const input = document.getElementById(id);
        const valueSpan = document.getElementById(id + 'Value');
        if (input && valueSpan) {
            input.value = value;
            valueSpan.textContent = `${value}${unit}`;
        }
    }

    playAnimation() {
        const element = document.getElementById('previewElement');
        const { name, duration, easing, delay, iterations, direction } = this.currentStyles['animation'];
        
        element.style.animation = `${name} ${duration}s ${easing} ${delay}s ${iterations} ${direction}`;
        this.showFeedback('アニメーションを再生しました');
    }

    pauseAnimation() {
        const element = document.getElementById('previewElement');
        element.style.animationPlayState = 'paused';
        this.showFeedback('アニメーションを一時停止しました');
    }

    resetAnimation() {
        const element = document.getElementById('previewElement');
        element.style.animation = '';
        element.style.animationPlayState = '';
        this.showFeedback('アニメーションをリセットしました');
    }

    updateCSSOutput() {
        const css = this.generateCSS();
        const codeElement = document.getElementById('cssOutput');
        codeElement.textContent = css;
        
        // Prismjsでシンタックスハイライトを適用
        if (window.Prism) {
            Prism.highlightElement(codeElement);
        }
    }

    generateCSS() {
        let css = '.element {\n';
        
        Object.keys(this.currentStyles).forEach(property => {
            const styles = this.currentStyles[property];
            
            switch (property) {
                case 'box-shadow':
                    if (styles.x !== undefined) {
                        const { x, y, blur, spread, color, opacity, inset } = styles;
                        const alpha = opacity / 100;
                        const colorWithAlpha = this.hexToRgba(color, alpha);
                        const insetValue = inset ? 'inset ' : '';
                        css += `  box-shadow: ${insetValue}${x}px ${y}px ${blur}px ${spread}px ${colorWithAlpha};\n`;
                    }
                    break;
                    
                case 'border-radius':
                    if (styles.tl !== undefined) {
                        const { tl, tr, bl, br } = styles;
                        if (tl === tr && tr === bl && bl === br && br === tl) {
                            css += `  border-radius: ${tl}px;\n`;
                        } else {
                            css += `  border-radius: ${tl}px ${tr}px ${br}px ${bl}px;\n`;
                        }
                    }
                    break;
                    
                case 'text-shadow':
                    if (styles.x !== undefined) {
                        const { x, y, blur, color } = styles;
                        css += `  text-shadow: ${x}px ${y}px ${blur}px ${color};\n`;
                    }
                    break;
                    
                case 'transform':
                    if (styles.rotate !== undefined) {
                        const { rotate, scaleX, scaleY, translateX, translateY, skewX, skewY, origin } = styles;
                        css += `  transform-origin: ${origin};\n`;
                        css += `  transform: rotate(${rotate}deg) scale(${scaleX}, ${scaleY}) translate(${translateX}px, ${translateY}px) skew(${skewX}deg, ${skewY}deg);\n`;
                    }
                    break;
                    
                case 'animation':
                    if (styles.name) {
                        const { name, duration, easing, delay, iterations, direction } = styles;
                        css += `  animation: ${name} ${duration}s ${easing} ${delay}s ${iterations} ${direction};\n`;
                    }
                    break;
                    
                case 'flexbox':
                    if (styles.direction) {
                        const { direction, justify, align, wrap } = styles;
                        css += `  display: flex;\n`;
                        css += `  flex-direction: ${direction};\n`;
                        css += `  justify-content: ${justify};\n`;
                        css += `  align-items: ${align};\n`;
                        css += `  flex-wrap: ${wrap};\n`;
                    }
                    break;
                    
                case 'grid':
                    if (styles.columns) {
                        const { columns, rows, columnGap, rowGap } = styles;
                        css += `  display: grid;\n`;
                        css += `  grid-template-columns: repeat(${columns}, 1fr);\n`;
                        css += `  grid-template-rows: repeat(${rows}, 1fr);\n`;
                        css += `  column-gap: ${columnGap}px;\n`;
                        css += `  row-gap: ${rowGap}px;\n`;
                    }
                    break;
                    
                case 'filter':
                    if (styles.blur !== undefined) {
                        const { blur, brightness, contrast, saturate, hueRotate, sepia, grayscale, invert } = styles;
                        const filters = [];
                        if (blur > 0) filters.push(`blur(${blur}px)`);
                        if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
                        if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
                        if (saturate !== 100) filters.push(`saturate(${saturate}%)`);
                        if (hueRotate > 0) filters.push(`hue-rotate(${hueRotate}deg)`);
                        if (sepia > 0) filters.push(`sepia(${sepia}%)`);
                        if (grayscale > 0) filters.push(`grayscale(${grayscale}%)`);
                        if (invert > 0) filters.push(`invert(${invert}%)`);
                        
                        if (filters.length > 0) {
                            css += `  filter: ${filters.join(' ')};\n`;
                        }
                    }
                    break;
            }
        });
        
        css += '}';
        return css;
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    copyCSS() {
        const css = this.generateCSS();
        navigator.clipboard.writeText(css).then(() => {
            this.showFeedback('CSSをコピーしました');
        }).catch(() => {
            this.showFeedback('コピーに失敗しました');
        });
    }

    downloadCSS() {
        const css = this.generateCSS();
        const blob = new Blob([css], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-styles.css';
        a.click();
        URL.revokeObjectURL(url);
        this.showFeedback('CSSファイルをダウンロードしました');
    }

    resetAll() {
        this.initializeControls();
        
        // コントロールをリセット
        document.querySelectorAll('input[type="range"]').forEach(input => {
            input.value = input.defaultValue || 0;
            const valueSpan = document.getElementById(input.id + 'Value');
            if (valueSpan) {
                valueSpan.textContent = input.value + (input.id.includes('opacity') ? '%' : 
                                                       input.id.includes('angle') || input.id.includes('rotate') || input.id.includes('skew') ? 'deg' : 'px');
            }
        });
        
        document.querySelectorAll('input[type="color"]').forEach(input => {
            input.value = input.defaultValue || '#000000';
        });
        
        document.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.checked = false;
        });
        
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        // プレビューをリセット
        const element = document.getElementById('previewElement');
        element.style.cssText = 'width: 200px; height: 100px; background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);';
        
        this.updateCSSOutput();
        this.showFeedback('すべての設定をリセットしました');
    }

    showFeedback(message) {
        const feedback = document.getElementById('feedback');
        feedback.querySelector('span').textContent = message;
        feedback.classList.add('show');
        
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 3000);
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new CSSGenerator();
});