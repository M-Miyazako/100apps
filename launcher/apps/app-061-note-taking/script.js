class NotesApp {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.currentNote = null;
        this.currentFolder = 'all';
        this.isPreviewMode = false;
        this.searchTerm = '';
        this.autoSaveTimer = null;
        
        this.initializeEventListeners();
        this.renderNotesList();
        this.updateWelcomeScreen();
    }

    initializeEventListeners() {
        // Sidebar events
        document.getElementById('newNoteBtn').addEventListener('click', () => this.createNewNote());
        document.getElementById('searchBox').addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Folder navigation
        document.querySelectorAll('.folder-item').forEach(item => {
            item.addEventListener('click', (e) => this.selectFolder(e.target.dataset.folder));
        });

        // Editor events
        document.getElementById('noteTitleInput').addEventListener('input', () => this.scheduleAutoSave());
        document.getElementById('noteEditor').addEventListener('input', () => {
            this.updateStats();
            this.scheduleAutoSave();
        });
        
        document.getElementById('saveBtn').addEventListener('click', () => this.saveCurrentNote());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportCurrentNote());
        document.getElementById('previewBtn').addEventListener('click', () => this.togglePreview());

        // Toolbar events
        document.querySelectorAll('.toolbar-btn[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleToolbarAction(e.target.dataset.action));
        });

        // Tag input
        document.getElementById('tagInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTag(e.target.value.trim());
                e.target.value = '';
            }
        });

        // Auto-save on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveCurrentNote();
            }
        });
    }

    createNewNote() {
        const note = {
            id: Date.now(),
            title: '無題のノート',
            content: '',
            folder: 'personal',
            tags: [],
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };

        this.notes.unshift(note);
        this.currentNote = note;
        this.showEditor();
        this.renderNotesList();
        this.loadNoteInEditor();
        
        // Focus title input
        setTimeout(() => {
            document.getElementById('noteTitleInput').select();
        }, 100);
    }

    selectNote(id) {
        this.saveCurrentNote(); // Save current note before switching
        this.currentNote = this.notes.find(note => note.id === id);
        if (this.currentNote) {
            this.showEditor();
            this.loadNoteInEditor();
            this.updateActiveNote();
        }
    }

    deleteNote(id, event) {
        event.stopPropagation();
        if (confirm('このノートを削除してもよろしいですか？')) {
            this.notes = this.notes.filter(note => note.id !== id);
            if (this.currentNote && this.currentNote.id === id) {
                this.currentNote = null;
                this.showWelcomeScreen();
            }
            this.saveNotes();
            this.renderNotesList();
        }
    }

    selectFolder(folder) {
        this.currentFolder = folder;
        document.querySelectorAll('.folder-item').forEach(item => {
            item.classList.toggle('active', item.dataset.folder === folder);
        });
        this.renderNotesList();
    }

    handleSearch(term) {
        this.searchTerm = term.toLowerCase();
        this.renderNotesList();
    }

    showEditor() {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('editorScreen').classList.remove('hidden');
    }

    showWelcomeScreen() {
        document.getElementById('welcomeScreen').classList.remove('hidden');
        document.getElementById('editorScreen').classList.add('hidden');
    }

    updateWelcomeScreen() {
        if (this.notes.length === 0) {
            this.showWelcomeScreen();
        }
    }

    loadNoteInEditor() {
        if (!this.currentNote) return;

        document.getElementById('noteTitleInput').value = this.currentNote.title;
        document.getElementById('noteEditor').value = this.currentNote.content;
        document.getElementById('folderSelect').value = this.currentNote.folder;
        
        this.renderTags();
        this.updateStats();
        this.updateLastSaved();
    }

    saveCurrentNote() {
        if (!this.currentNote) return;

        this.currentNote.title = document.getElementById('noteTitleInput').value || '無題のノート';
        this.currentNote.content = document.getElementById('noteEditor').value;
        this.currentNote.folder = document.getElementById('folderSelect').value;
        this.currentNote.modified = new Date().toISOString();

        this.saveNotes();
        this.renderNotesList();
        this.updateLastSaved();
        this.updateActiveNote();
    }

    scheduleAutoSave() {
        clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            this.saveCurrentNote();
        }, 2000); // Auto-save after 2 seconds of inactivity
    }

    exportCurrentNote() {
        if (!this.currentNote) return;

        const content = `# ${this.currentNote.title}\n\n${this.currentNote.content}`;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        a.click();
        URL.revokeObjectURL(url);
    }

    togglePreview() {
        this.isPreviewMode = !this.isPreviewMode;
        const editor = document.getElementById('noteEditor');
        const preview = document.getElementById('markdownPreview');
        const previewBtn = document.getElementById('previewBtn');

        if (this.isPreviewMode) {
            editor.classList.add('hidden');
            preview.classList.remove('hidden');
            preview.innerHTML = this.parseMarkdown(editor.value);
            previewBtn.textContent = '✏ 編集';
        } else {
            editor.classList.remove('hidden');
            preview.classList.add('hidden');
            previewBtn.textContent = '👁 プレビュー';
        }
    }

    parseMarkdown(text) {
        // Simple markdown parsing
        return text
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/`(.*)`/gim, '<code>$1</code>')
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
            .replace(/\n/gim, '<br>');
    }

    handleToolbarAction(action) {
        const editor = document.getElementById('noteEditor');
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        let newText = '';

        switch (action) {
            case 'bold':
                newText = `**${selectedText}**`;
                break;
            case 'italic':
                newText = `*${selectedText}*`;
                break;
            case 'underline':
                newText = `<u>${selectedText}</u>`;
                break;
            case 'heading1':
                newText = `# ${selectedText}`;
                break;
            case 'heading2':
                newText = `## ${selectedText}`;
                break;
            case 'list':
                newText = `* ${selectedText}`;
                break;
            case 'numberList':
                newText = `1. ${selectedText}`;
                break;
            case 'link':
                const url = prompt('URLを入力してください:');
                if (url) newText = `[${selectedText || 'リンクテキスト'}](${url})`;
                break;
            case 'code':
                newText = `\`${selectedText}\``;
                break;
        }

        if (newText) {
            editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
            editor.focus();
            editor.setSelectionRange(start + newText.length, start + newText.length);
            this.scheduleAutoSave();
        }
    }

    addTag(tagText) {
        if (!tagText || !this.currentNote) return;
        
        if (!this.currentNote.tags.includes(tagText)) {
            this.currentNote.tags.push(tagText);
            this.renderTags();
            this.saveCurrentNote();
        }
    }

    removeTag(tagText) {
        if (!this.currentNote) return;
        
        this.currentNote.tags = this.currentNote.tags.filter(tag => tag !== tagText);
        this.renderTags();
        this.saveCurrentNote();
    }

    renderTags() {
        if (!this.currentNote) return;
        
        const container = document.getElementById('tagsContainer');
        container.innerHTML = this.currentNote.tags.map(tag => `
            <span class="tag">
                ${tag}
                <button class="tag-remove" onclick="notesApp.removeTag('${tag}')">×</button>
            </span>
        `).join('');
    }

    updateStats() {
        const content = document.getElementById('noteEditor').value;
        const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
        const chars = content.length;

        document.getElementById('wordCount').textContent = `${words} 語`;
        document.getElementById('charCount').textContent = `${chars} 文字`;
    }

    updateLastSaved() {
        const now = new Date();
        document.getElementById('lastSaved').textContent = `${now.toLocaleTimeString()} に保存`;
    }

    getFilteredNotes() {
        return this.notes.filter(note => {
            const matchesFolder = this.currentFolder === 'all' || note.folder === this.currentFolder;
            const matchesSearch = this.searchTerm === '' || 
                note.title.toLowerCase().includes(this.searchTerm) ||
                note.content.toLowerCase().includes(this.searchTerm) ||
                note.tags.some(tag => tag.toLowerCase().includes(this.searchTerm));
            
            return matchesFolder && matchesSearch;
        });
    }

    renderNotesList() {
        const notesList = document.getElementById('notesList');
        const filteredNotes = this.getFilteredNotes();

        if (filteredNotes.length === 0) {
            notesList.innerHTML = '<div style="padding: 20px; text-align: center; opacity: 0.6;">ノートが見つかりません</div>';
            return;
        }

        notesList.innerHTML = filteredNotes.map(note => `
            <div class="note-item ${this.currentNote && this.currentNote.id === note.id ? 'active' : ''}" 
                 onclick="notesApp.selectNote(${note.id})">
                <div class="note-title">${note.title}</div>
                <div class="note-preview">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</div>
                <div class="note-date">${new Date(note.modified).toLocaleDateString()}</div>
                <button class="delete-note" onclick="notesApp.deleteNote(${note.id}, event)">×</button>
            </div>
        `).join('');
    }

    updateActiveNote() {
        const noteItems = document.querySelectorAll('.note-item');
        noteItems.forEach(item => {
            item.classList.remove('active');
        });
        
        if (this.currentNote) {
            const activeItem = document.querySelector(`.note-item[onclick="notesApp.selectNote(${this.currentNote.id})"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }
        }
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }
}

// Initialize the app
const notesApp = new NotesApp();