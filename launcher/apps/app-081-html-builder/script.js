class HTMLBuilder {
    constructor() {
        this.elements = [];
        this.selectedElement = null;
        this.clipboard = null;
        this.history = [];
        this.historyIndex = -1;
        this.zoom = 100;
        this.previewMode = false;
        this.elementCounter = 0;
        
        this.initializeEventListeners();
        this.initializeDragAndDrop();
        this.initializeComponents();
        this.saveState();
    }

    initializeEventListeners() {
        // ツールバーイベント
        document.getElementById('newProject').addEventListener('click', () => this.newProject());
        document.getElementById('saveProject').addEventListener('click', () => this.saveProject());
        document.getElementById('loadProject').addEventListener('click', () => this.loadProject());
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('previewMode').addEventListener('click', () => this.togglePreviewMode());
        document.getElementById('codeView').addEventListener('click', () => this.showCodeView());
        document.getElementById('exportHTML').addEventListener('click', () => this.exportHTML());

        // ズームコントロール
        document.getElementById('zoomIn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOut').addEventListener('click', () => this.zoomOut());

        // デバイスプレビュー
        document.getElementById('devicePreview').addEventListener('change', (e) => {
            this.setDevicePreview(e.target.value);
        });

        // ページタイトル
        document.getElementById('pageTitle').addEventListener('input', (e) => {
            this.pageTitle = e.target.value;
        });

        // コードモーダル
        document.getElementById('closeCodeModal').addEventListener('click', () => {
            this.hideCodeView();
        });

        document.getElementById('copyCode').addEventListener('click', () => {
            this.copyCurrentCode();
        });

        document.getElementById('downloadCode').addEventListener('click', () => {
            this.downloadCurrentCode();
        });

        // コードタブ
        document.querySelectorAll('.code-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchCodeTab(e.target.dataset.tab);
            });
        });

        // レイヤーパネル
        document.getElementById('toggleLayers').addEventListener('click', () => {
            this.toggleLayersPanel();
        });

        // コンテキストメニュー
        this.initializeContextMenu();

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // ファイル入力
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileLoad(e);
        });

        // カテゴリの展開/縮小
        document.querySelectorAll('.category-title').forEach(title => {
            title.addEventListener('click', () => {
                const category = title.parentElement;
                category.classList.toggle('collapsed');
            });
        });

        // コンポーネント検索
        document.getElementById('componentSearch').addEventListener('input', (e) => {
            this.filterComponents(e.target.value);
        });

        // キャンバスクリック
        document.getElementById('canvas').addEventListener('click', (e) => {
            if (e.target === document.getElementById('canvas') || e.target === document.getElementById('dropZone')) {
                this.selectElement(null);
            }
        });
    }

    initializeDragAndDrop() {
        // コンポーネントのドラッグ開始
        document.querySelectorAll('.component-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.type);
                this.showDragPreview(item.textContent.trim(), e);
            });

            item.addEventListener('dragend', () => {
                this.hideDragPreview();
            });

            item.draggable = true;
        });

        // ドロップゾーンの設定
        const dropZone = document.getElementById('dropZone');
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', (e) => {
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
            }
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const componentType = e.dataTransfer.getData('text/plain');
            this.addComponent(componentType, e.target);
        });

        // Sortableで要素の並び替えを可能にする
        Sortable.create(dropZone, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            onEnd: () => {
                this.updateLayersTree();
                this.saveState();
            }
        });
    }

    initializeComponents() {
        this.componentTemplates = {
            // レイアウト
            container: '<div class="container">コンテナ</div>',
            row: '<div class="row">行</div>',
            column: '<div class="col">列</div>',
            section: '<section>セクション</section>',
            header: '<header>ヘッダー</header>',
            footer: '<footer>フッター</footer>',
            nav: '<nav>ナビゲーション</nav>',

            // テキスト
            h1: '<h1>見出し1</h1>',
            h2: '<h2>見出し2</h2>',
            h3: '<h3>見出し3</h3>',
            p: '<p>段落テキストです。ここに内容を入力してください。</p>',
            span: '<span>スパンテキスト</span>',
            blockquote: '<blockquote>引用文がここに入ります。</blockquote>',
            ul: '<ul><li>リストアイテム1</li><li>リストアイテム2</li><li>リストアイテム3</li></ul>',

            // フォーム
            form: '<form><fieldset><legend>フォーム</legend><p>フォーム要素をここに追加してください。</p></fieldset></form>',
            input: '<input type="text" placeholder="テキスト入力">',
            textarea: '<textarea placeholder="テキストエリア"></textarea>',
            select: '<select><option>選択肢1</option><option>選択肢2</option><option>選択肢3</option></select>',
            button: '<button type="button">ボタン</button>',
            checkbox: '<label><input type="checkbox"> チェックボックス</label>',
            radio: '<label><input type="radio" name="radio"> ラジオボタン</label>',

            // メディア
            img: '<img src="https://via.placeholder.com/300x200" alt="画像">',
            video: '<video controls width="300"><source src="#" type="video/mp4">お使いのブラウザはビデオタグをサポートしていません。</video>',
            audio: '<audio controls><source src="#" type="audio/mpeg">お使いのブラウザはオーディオタグをサポートしていません。</audio>',
            iframe: '<iframe src="https://www.example.com" width="300" height="200"></iframe>',

            // リンク
            a: '<a href="#">リンク</a>',
            menu: '<ul class="menu"><li><a href="#">メニュー1</a></li><li><a href="#">メニュー2</a></li><li><a href="#">メニュー3</a></li></ul>',
            breadcrumb: '<nav class="breadcrumb"><a href="#">ホーム</a> > <a href="#">カテゴリ</a> > <span>現在のページ</span></nav>'
        };
    }

    addComponent(type, targetElement) {
        if (!this.componentTemplates[type]) return;

        const template = this.componentTemplates[type];
        const element = this.createEditorElement(template, type);
        
        // ドロップ位置を決定
        const dropZone = document.getElementById('dropZone');
        const canvas = document.getElementById('canvas');
        
        if (targetElement === dropZone || targetElement === canvas) {
            dropZone.appendChild(element);
        } else {
            // 既存要素の近くにドロップした場合
            const rect = targetElement.getBoundingClientRect();
            const dropY = event.clientY;
            const targetY = rect.top + rect.height / 2;
            
            if (dropY < targetY) {
                targetElement.parentNode.insertBefore(element, targetElement);
            } else {
                targetElement.parentNode.insertBefore(element, targetElement.nextSibling);
            }
        }

        // コンテンツがある場合はドロップメッセージを隠す
        dropZone.classList.add('has-content');
        
        // 新しい要素として登録
        this.registerElement(element);
        this.selectElement(element);
        this.updateLayersTree();
        this.saveState();
        
        // アニメーション効果
        element.classList.add('newly-added');
        setTimeout(() => element.classList.remove('newly-added'), 300);
        
        this.showFeedback(`${type}コンポーネントを追加しました`);
    }

    createEditorElement(html, type) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-element';
        wrapper.dataset.type = type;
        wrapper.dataset.id = `element-${++this.elementCounter}`;
        
        wrapper.innerHTML = `
            ${html}
            <div class="element-controls">
                <button class="control-btn copy" title="コピー">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="control-btn delete" title="削除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // イベントリスナーを追加
        this.addElementEventListeners(wrapper);
        
        return wrapper;
    }

    addElementEventListeners(element) {
        // 要素クリック
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });

        // コントロールボタン
        const copyBtn = element.querySelector('.control-btn.copy');
        const deleteBtn = element.querySelector('.control-btn.delete');

        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.copyElement(element);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteElement(element);
        });

        // コンテキストメニュー
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, element);
        });

        // ダブルクリックでテキスト編集
        element.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.enableTextEditing(element);
        });
    }

    registerElement(element) {
        this.elements.push(element);
    }

    selectElement(element) {
        // 前の選択を解除
        document.querySelectorAll('.editor-element.selected').forEach(el => {
            el.classList.remove('selected');
        });

        this.selectedElement = element;

        if (element) {
            element.classList.add('selected');
            this.showElementProperties(element);
            this.highlightLayerItem(element);
        } else {
            this.hideElementProperties();
        }
    }

    showElementProperties(element) {
        const propertiesContent = document.getElementById('propertiesContent');
        const type = element.dataset.type;
        const actualElement = element.firstElementChild;

        propertiesContent.innerHTML = `
            <div class="property-group">
                <h4>基本プロパティ</h4>
                <div class="property-field">
                    <label>要素タイプ</label>
                    <input type="text" value="${type}" readonly>
                </div>
                <div class="property-field">
                    <label>ID</label>
                    <input type="text" value="${actualElement.id || ''}" data-property="id">
                </div>
                <div class="property-field">
                    <label>クラス</label>
                    <input type="text" value="${actualElement.className || ''}" data-property="className">
                </div>
            </div>

            <div class="property-group">
                <h4>スタイル</h4>
                <div class="property-field">
                    <label>幅</label>
                    <input type="text" value="${actualElement.style.width || ''}" data-style="width" placeholder="例: 300px, 100%">
                </div>
                <div class="property-field">
                    <label>高さ</label>
                    <input type="text" value="${actualElement.style.height || ''}" data-style="height" placeholder="例: 200px, auto">
                </div>
                <div class="property-field">
                    <label>背景色</label>
                    <div class="color-input">
                        <input type="color" value="${this.rgbToHex(actualElement.style.backgroundColor) || '#ffffff'}" data-style="backgroundColor">
                        <input type="text" value="${actualElement.style.backgroundColor || ''}" data-style="backgroundColor" placeholder="例: #ffffff, red">
                    </div>
                </div>
                <div class="property-field">
                    <label>文字色</label>
                    <div class="color-input">
                        <input type="color" value="${this.rgbToHex(actualElement.style.color) || '#000000'}" data-style="color">
                        <input type="text" value="${actualElement.style.color || ''}" data-style="color" placeholder="例: #000000, blue">
                    </div>
                </div>
                <div class="property-field">
                    <label>余白 (margin)</label>
                    <input type="text" value="${actualElement.style.margin || ''}" data-style="margin" placeholder="例: 10px, 10px 20px">
                </div>
                <div class="property-field">
                    <label>内側余白 (padding)</label>
                    <input type="text" value="${actualElement.style.padding || ''}" data-style="padding" placeholder="例: 15px, 10px 20px">
                </div>
            </div>

            ${this.getTypeSpecificProperties(type, actualElement)}
        `;

        // プロパティ変更イベント
        propertiesContent.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', (e) => {
                this.updateElementProperty(element, e.target);
            });
        });
    }

    getTypeSpecificProperties(type, element) {
        switch (type) {
            case 'img':
                return `
                    <div class="property-group">
                        <h4>画像プロパティ</h4>
                        <div class="property-field">
                            <label>画像URL</label>
                            <input type="text" value="${element.src || ''}" data-property="src">
                        </div>
                        <div class="property-field">
                            <label>代替テキスト</label>
                            <input type="text" value="${element.alt || ''}" data-property="alt">
                        </div>
                    </div>
                `;
            case 'a':
                return `
                    <div class="property-group">
                        <h4>リンクプロパティ</h4>
                        <div class="property-field">
                            <label>リンク先URL</label>
                            <input type="text" value="${element.href || ''}" data-property="href">
                        </div>
                        <div class="property-field">
                            <label>ターゲット</label>
                            <select data-property="target">
                                <option value="">同じウィンドウ</option>
                                <option value="_blank" ${element.target === '_blank' ? 'selected' : ''}>新しいウィンドウ</option>
                            </select>
                        </div>
                    </div>
                `;
            case 'input':
                return `
                    <div class="property-group">
                        <h4>入力フィールドプロパティ</h4>
                        <div class="property-field">
                            <label>タイプ</label>
                            <select data-property="type">
                                <option value="text" ${element.type === 'text' ? 'selected' : ''}>テキスト</option>
                                <option value="email" ${element.type === 'email' ? 'selected' : ''}>メール</option>
                                <option value="password" ${element.type === 'password' ? 'selected' : ''}>パスワード</option>
                                <option value="number" ${element.type === 'number' ? 'selected' : ''}>数値</option>
                                <option value="tel" ${element.type === 'tel' ? 'selected' : ''}>電話番号</option>
                            </select>
                        </div>
                        <div class="property-field">
                            <label>プレースホルダー</label>
                            <input type="text" value="${element.placeholder || ''}" data-property="placeholder">
                        </div>
                        <div class="property-field">
                            <label>必須項目</label>
                            <input type="checkbox" ${element.required ? 'checked' : ''} data-property="required">
                        </div>
                    </div>
                `;
            default:
                if (element.textContent !== undefined) {
                    return `
                        <div class="property-group">
                            <h4>テキストプロパティ</h4>
                            <div class="property-field">
                                <label>テキスト内容</label>
                                <textarea data-property="textContent" rows="3">${element.textContent}</textarea>
                            </div>
                        </div>
                    `;
                }
                return '';
        }
    }

    updateElementProperty(wrapperElement, input) {
        const actualElement = wrapperElement.firstElementChild;
        const property = input.dataset.property;
        const style = input.dataset.style;
        const value = input.type === 'checkbox' ? input.checked : input.value;

        if (property) {
            if (input.type === 'checkbox') {
                if (value) {
                    actualElement.setAttribute(property, '');
                } else {
                    actualElement.removeAttribute(property);
                }
            } else {
                actualElement[property] = value;
            }
        } else if (style) {
            actualElement.style[style] = value;
        }

        this.saveState();
    }

    hideElementProperties() {
        const propertiesContent = document.getElementById('propertiesContent');
        propertiesContent.innerHTML = `
            <div class="no-selection">
                <i class="fas fa-mouse-pointer"></i>
                <p>要素を選択してプロパティを編集してください</p>
            </div>
        `;
    }

    copyElement(element) {
        this.clipboard = element.cloneNode(true);
        this.showFeedback('要素をコピーしました');
    }

    pasteElement() {
        if (!this.clipboard) {
            this.showFeedback('コピーされた要素がありません');
            return;
        }

        const clone = this.clipboard.cloneNode(true);
        clone.dataset.id = `element-${++this.elementCounter}`;
        
        // 新しいイベントリスナーを追加
        this.addElementEventListeners(clone);

        const dropZone = document.getElementById('dropZone');
        dropZone.appendChild(clone);
        dropZone.classList.add('has-content');

        this.registerElement(clone);
        this.selectElement(clone);
        this.updateLayersTree();
        this.saveState();
        
        this.showFeedback('要素を貼り付けました');
    }

    deleteElement(element) {
        if (element === this.selectedElement) {
            this.selectElement(null);
        }

        element.remove();
        
        const index = this.elements.indexOf(element);
        if (index > -1) {
            this.elements.splice(index, 1);
        }

        // ドロップゾーンが空になった場合
        const dropZone = document.getElementById('dropZone');
        if (dropZone.children.length === 0) {
            dropZone.classList.remove('has-content');
        }

        this.updateLayersTree();
        this.saveState();
        this.showFeedback('要素を削除しました');
    }

    duplicateElement(element) {
        const clone = element.cloneNode(true);
        clone.dataset.id = `element-${++this.elementCounter}`;
        
        // 新しいイベントリスナーを追加
        this.addElementEventListeners(clone);

        element.parentNode.insertBefore(clone, element.nextSibling);

        this.registerElement(clone);
        this.selectElement(clone);
        this.updateLayersTree();
        this.saveState();
        
        this.showFeedback('要素を複製しました');
    }

    enableTextEditing(element) {
        const actualElement = element.firstElementChild;
        const originalText = actualElement.textContent;

        // 編集可能にする
        actualElement.contentEditable = true;
        actualElement.focus();

        // テキスト選択
        if (window.getSelection && document.createRange) {
            const range = document.createRange();
            range.selectNodeContents(actualElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }

        // 編集終了イベント
        const finishEditing = () => {
            actualElement.contentEditable = false;
            if (actualElement.textContent !== originalText) {
                this.saveState();
                this.showFeedback('テキストを更新しました');
            }
        };

        actualElement.addEventListener('blur', finishEditing, { once: true });
        actualElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                finishEditing();
            }
        });
    }

    updateLayersTree() {
        const layersTree = document.getElementById('layersTree');
        const dropZone = document.getElementById('dropZone');
        
        layersTree.innerHTML = '';

        dropZone.querySelectorAll('.editor-element').forEach((element, index) => {
            const layerItem = document.createElement('div');
            layerItem.className = 'layer-item';
            layerItem.dataset.elementId = element.dataset.id;
            
            layerItem.innerHTML = `
                <i class="fas fa-${this.getElementIcon(element.dataset.type)}"></i>
                <span>${element.dataset.type} ${index + 1}</span>
            `;

            layerItem.addEventListener('click', () => {
                this.selectElement(element);
            });

            layersTree.appendChild(layerItem);
        });
    }

    getElementIcon(type) {
        const icons = {
            container: 'square',
            row: 'grip-horizontal',
            column: 'grip-vertical',
            section: 'layer-group',
            header: 'heading',
            footer: 'window-minimize',
            nav: 'bars',
            h1: 'heading',
            h2: 'heading',
            h3: 'heading',
            p: 'paragraph',
            span: 'text-width',
            blockquote: 'quote-right',
            ul: 'list-ul',
            form: 'wpforms',
            input: 'edit',
            textarea: 'align-left',
            select: 'caret-square-down',
            button: 'mouse-pointer',
            checkbox: 'check-square',
            radio: 'dot-circle',
            img: 'image',
            video: 'video',
            audio: 'volume-up',
            iframe: 'external-link-alt',
            a: 'link',
            menu: 'bars',
            breadcrumb: 'chevron-right'
        };
        return icons[type] || 'square';
    }

    highlightLayerItem(element) {
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.remove('selected');
        });

        const layerItem = document.querySelector(`[data-element-id="${element.dataset.id}"]`);
        if (layerItem) {
            layerItem.classList.add('selected');
        }
    }

    initializeContextMenu() {
        const contextMenu = document.getElementById('contextMenu');

        // コンテキストメニューアイテム
        document.getElementById('copyElement').addEventListener('click', () => {
            if (this.selectedElement) {
                this.copyElement(this.selectedElement);
            }
            this.hideContextMenu();
        });

        document.getElementById('pasteElement').addEventListener('click', () => {
            this.pasteElement();
            this.hideContextMenu();
        });

        document.getElementById('duplicateElement').addEventListener('click', () => {
            if (this.selectedElement) {
                this.duplicateElement(this.selectedElement);
            }
            this.hideContextMenu();
        });

        document.getElementById('deleteElement').addEventListener('click', () => {
            if (this.selectedElement) {
                this.deleteElement(this.selectedElement);
            }
            this.hideContextMenu();
        });

        document.getElementById('moveUp').addEventListener('click', () => {
            if (this.selectedElement) {
                this.moveElement(this.selectedElement, 'up');
            }
            this.hideContextMenu();
        });

        document.getElementById('moveDown').addEventListener('click', () => {
            if (this.selectedElement) {
                this.moveElement(this.selectedElement, 'down');
            }
            this.hideContextMenu();
        });

        // クリック外でメニューを隠す
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });
    }

    showContextMenu(e, element) {
        const contextMenu = document.getElementById('contextMenu');
        this.selectElement(element);
        
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        contextMenu.classList.add('show');
    }

    hideContextMenu() {
        document.getElementById('contextMenu').classList.remove('show');
    }

    moveElement(element, direction) {
        const parent = element.parentNode;
        const siblings = Array.from(parent.children);
        const currentIndex = siblings.indexOf(element);

        if (direction === 'up' && currentIndex > 0) {
            parent.insertBefore(element, siblings[currentIndex - 1]);
        } else if (direction === 'down' && currentIndex < siblings.length - 1) {
            parent.insertBefore(element, siblings[currentIndex + 2]);
        }

        this.updateLayersTree();
        this.saveState();
    }

    showDragPreview(text, e) {
        const preview = document.getElementById('dragPreview');
        preview.textContent = text;
        preview.classList.add('show');
        
        const updatePosition = (event) => {
            preview.style.left = `${event.clientX + 10}px`;
            preview.style.top = `${event.clientY + 10}px`;
        };

        updatePosition(e);
        document.addEventListener('dragover', updatePosition);
        
        // ドラッグ終了時にイベントリスナーを削除
        setTimeout(() => {
            document.removeEventListener('dragover', updatePosition);
        }, 100);
    }

    hideDragPreview() {
        document.getElementById('dragPreview').classList.remove('show');
    }

    togglePreviewMode() {
        this.previewMode = !this.previewMode;
        const previewBtn = document.getElementById('previewMode');
        const appContainer = document.querySelector('.app-container');

        if (this.previewMode) {
            appContainer.classList.add('preview-mode');
            previewBtn.classList.add('active');
            this.selectElement(null);
            this.showFeedback('プレビューモードを有効にしました');
        } else {
            appContainer.classList.remove('preview-mode');
            previewBtn.classList.remove('active');
            this.showFeedback('プレビューモードを無効にしました');
        }
    }

    zoomIn() {
        this.zoom = Math.min(this.zoom + 10, 200);
        this.updateZoom();
    }

    zoomOut() {
        this.zoom = Math.max(this.zoom - 10, 50);
        this.updateZoom();
    }

    updateZoom() {
        const canvas = document.getElementById('canvas');
        canvas.style.transform = `scale(${this.zoom / 100})`;
        document.getElementById('zoomLevel').textContent = `${this.zoom}%`;
    }

    setDevicePreview(device) {
        const canvas = document.getElementById('canvas');
        canvas.className = `canvas ${device}`;
    }

    showCodeView() {
        const modal = document.getElementById('codeModal');
        modal.classList.add('show');
        this.generateCode();
    }

    hideCodeView() {
        document.getElementById('codeModal').classList.remove('show');
    }

    switchCodeTab(tab) {
        document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        document.querySelectorAll('.code-content pre').forEach(pre => {
            pre.style.display = 'none';
        });
        document.getElementById(`${tab}Code`).style.display = 'block';
    }

    generateCode() {
        const dropZone = document.getElementById('dropZone');
        const pageTitle = document.getElementById('pageTitle').value;

        // HTML生成
        let htmlContent = '';
        dropZone.querySelectorAll('.editor-element').forEach(wrapper => {
            const element = wrapper.firstElementChild;
            htmlContent += this.serializeElement(element) + '\n';
        });

        const fullHTML = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
${htmlContent}
</body>
</html>`;

        // CSS生成
        const css = this.generateCSS();

        // JavaScript生成（基本的なイベントハンドラーなど）
        const js = this.generateJavaScript();

        // コードを表示
        document.getElementById('htmlCode').textContent = fullHTML;
        document.getElementById('cssCode').textContent = css;
        document.getElementById('jsCode').textContent = js;

        // シンタックスハイライト
        if (window.Prism) {
            Prism.highlightAll();
        }
    }

    serializeElement(element) {
        const clone = element.cloneNode(true);
        
        // data-*属性やcontenteditable属性を削除
        clone.removeAttribute('contenteditable');
        clone.querySelectorAll('*').forEach(el => {
            el.removeAttribute('contenteditable');
            Array.from(el.attributes).forEach(attr => {
                if (attr.name.startsWith('data-')) {
                    el.removeAttribute(attr.name);
                }
            });
        });

        return clone.outerHTML;
    }

    generateCSS() {
        return `/* Generated CSS */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 20px;
    line-height: 1.6;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.row {
    display: flex;
    flex-wrap: wrap;
    margin: -10px;
}

.col {
    flex: 1;
    padding: 10px;
}

/* フォームスタイル */
form {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
}

input, textarea, select {
    width: 100%;
    padding: 10px;
    margin: 5px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

button {
    background: #007bff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

button:hover {
    background: #0056b3;
}

/* メディアスタイル */
img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
}

video, audio {
    max-width: 100%;
}

/* ナビゲーションスタイル */
nav {
    background: #333;
    padding: 10px 0;
}

nav a {
    color: white;
    text-decoration: none;
    padding: 10px 15px;
    display: inline-block;
}

nav a:hover {
    background: #555;
}

.menu {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
}

.menu li {
    margin-right: 20px;
}

.breadcrumb {
    padding: 10px 0;
    color: #666;
}

.breadcrumb a {
    color: #007bff;
    text-decoration: none;
}

.breadcrumb a:hover {
    text-decoration: underline;
}

/* レスポンシブ */
@media (max-width: 768px) {
    .row {
        flex-direction: column;
    }
    
    .menu {
        flex-direction: column;
    }
    
    .menu li {
        margin-right: 0;
        margin-bottom: 10px;
    }
}`;
    }

    generateJavaScript() {
        return `// Generated JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // フォーム送信の処理
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('フォームが送信されました！');
        });
    });

    // ボタンクリックの処理
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (button.type !== 'submit') {
            button.addEventListener('click', function() {
                console.log('ボタンがクリックされました:', this.textContent);
            });
        }
    });

    // ナビゲーションメニューの処理
    const menuLinks = document.querySelectorAll('nav a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.href === '#') {
                e.preventDefault();
                console.log('メニューアイテムがクリックされました:', this.textContent);
            }
        });
    });
});`;
    }

    copyCurrentCode() {
        const activeTab = document.querySelector('.code-tab.active').dataset.tab;
        const code = document.getElementById(`${activeTab}Code`).textContent;
        
        navigator.clipboard.writeText(code).then(() => {
            this.showFeedback(`${activeTab.toUpperCase()}コードをコピーしました`);
        }).catch(() => {
            this.showFeedback('コピーに失敗しました');
        });
    }

    downloadCurrentCode() {
        const activeTab = document.querySelector('.code-tab.active').dataset.tab;
        const code = document.getElementById(`${activeTab}Code`).textContent;
        const pageTitle = document.getElementById('pageTitle').value || 'untitled';
        
        const extensions = { html: 'html', css: 'css', js: 'js' };
        const mimeTypes = { 
            html: 'text/html', 
            css: 'text/css', 
            js: 'application/javascript' 
        };
        
        const blob = new Blob([code], { type: mimeTypes[activeTab] });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pageTitle}.${extensions[activeTab]}`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showFeedback(`${activeTab.toUpperCase()}ファイルをダウンロードしました`);
    }

    exportHTML() {
        this.generateCode();
        const htmlCode = document.getElementById('htmlCode').textContent;
        const pageTitle = document.getElementById('pageTitle').value || 'untitled';
        
        const blob = new Blob([htmlCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pageTitle}.html`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showFeedback('HTMLファイルをエクスポートしました');
    }

    toggleLayersPanel() {
        const panel = document.getElementById('layersPanel');
        panel.classList.toggle('hidden');
    }

    filterComponents(searchTerm) {
        const components = document.querySelectorAll('.component-item');
        const categories = document.querySelectorAll('.category');
        
        if (!searchTerm) {
            components.forEach(comp => comp.style.display = 'flex');
            categories.forEach(cat => cat.style.display = 'block');
            return;
        }

        components.forEach(comp => {
            const text = comp.textContent.toLowerCase();
            const matches = text.includes(searchTerm.toLowerCase());
            comp.style.display = matches ? 'flex' : 'none';
        });

        // カテゴリの表示/非表示
        categories.forEach(cat => {
            const visibleComponents = cat.querySelectorAll('.component-item[style*="flex"]');
            cat.style.display = visibleComponents.length > 0 ? 'block' : 'none';
        });
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.saveProject();
                    break;
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'c':
                    if (this.selectedElement) {
                        e.preventDefault();
                        this.copyElement(this.selectedElement);
                    }
                    break;
                case 'v':
                    e.preventDefault();
                    this.pasteElement();
                    break;
                case 'd':
                    if (this.selectedElement) {
                        e.preventDefault();
                        this.duplicateElement(this.selectedElement);
                    }
                    break;
            }
        } else if (e.key === 'Delete' && this.selectedElement) {
            this.deleteElement(this.selectedElement);
        }
    }

    newProject() {
        if (confirm('新しいプロジェクトを作成しますか？現在の作業は失われます。')) {
            const dropZone = document.getElementById('dropZone');
            dropZone.innerHTML = `
                <div class="drop-message">
                    <i class="fas fa-plus-circle"></i>
                    <p>ここにコンポーネントをドラッグしてください</p>
                </div>
            `;
            dropZone.classList.remove('has-content');
            
            this.elements = [];
            this.selectedElement = null;
            this.history = [];
            this.historyIndex = -1;
            this.elementCounter = 0;
            
            document.getElementById('pageTitle').value = '新しいページ';
            this.hideElementProperties();
            this.updateLayersTree();
            this.saveState();
            
            this.showFeedback('新しいプロジェクトを作成しました');
        }
    }

    saveProject() {
        const dropZone = document.getElementById('dropZone');
        const pageTitle = document.getElementById('pageTitle').value;
        
        const projectData = {
            title: pageTitle,
            html: dropZone.innerHTML,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pageTitle || 'project'}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showFeedback('プロジェクトを保存しました');
    }

    loadProject() {
        document.getElementById('fileInput').click();
    }

    handleFileLoad(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const projectData = JSON.parse(event.target.result);
                this.restoreProject(projectData);
            } catch (error) {
                this.showFeedback('ファイルの読み込みに失敗しました');
            }
        };
        reader.readAsText(file);
    }

    restoreProject(projectData) {
        const dropZone = document.getElementById('dropZone');
        document.getElementById('pageTitle').value = projectData.title || '読み込まれたページ';
        
        dropZone.innerHTML = projectData.html;
        
        // 要素の再初期化
        this.elements = [];
        dropZone.querySelectorAll('.editor-element').forEach(element => {
            this.addElementEventListeners(element);
            this.registerElement(element);
        });

        if (this.elements.length > 0) {
            dropZone.classList.add('has-content');
        }

        this.selectElement(null);
        this.updateLayersTree();
        this.saveState();
        
        this.showFeedback('プロジェクトを読み込みました');
    }

    saveState() {
        const dropZone = document.getElementById('dropZone');
        const state = {
            html: dropZone.innerHTML,
            title: document.getElementById('pageTitle').value,
            selectedId: this.selectedElement ? this.selectedElement.dataset.id : null
        };

        // 履歴の管理
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(JSON.stringify(state));
        this.historyIndex = this.history.length - 1;

        // 履歴の上限（50回）
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
            this.showFeedback('操作を元に戻しました');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
            this.showFeedback('操作をやり直しました');
        }
    }

    restoreState(stateString) {
        const state = JSON.parse(stateString);
        const dropZone = document.getElementById('dropZone');
        
        dropZone.innerHTML = state.html;
        document.getElementById('pageTitle').value = state.title;

        // 要素の再初期化
        this.elements = [];
        dropZone.querySelectorAll('.editor-element').forEach(element => {
            this.addElementEventListeners(element);
            this.registerElement(element);
        });

        // 選択状態を復元
        if (state.selectedId) {
            const selectedElement = dropZone.querySelector(`[data-id="${state.selectedId}"]`);
            this.selectElement(selectedElement);
        } else {
            this.selectElement(null);
        }

        if (this.elements.length > 0) {
            dropZone.classList.add('has-content');
        } else {
            dropZone.classList.remove('has-content');
        }

        this.updateLayersTree();
    }

    rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent') return '';
        
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return rgb;
        
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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
    new HTMLBuilder();
});