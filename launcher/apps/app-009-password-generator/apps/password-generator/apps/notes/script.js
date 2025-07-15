class NotesApp {
    constructor() {
        this.notes = [];
        this.currentNote = null;
        this.currentNoteId = null;
        this.searchQuery = '';
        this.selectedCategory = '';
        this.autosaveTimer = null;
        this.isModified = false;
        
        this.init();
    }
    
    init() {
        this.loadNotes();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.renderNotesList();
        this.updateWordCount();
        this.setupAutosave();
        
        // Load first note if exists
        if (this.notes.length > 0) {
            this.loadNote(this.notes[0].id);
        }
    }
    
    setupEventListeners() {
        // New note button
        document.querySelector('.new-note-btn').addEventListener('click', () => this.createNewNote());
        
        // Search functionality
        document.querySelector('.search-input').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterNotes();
        });
        
        // Category filter
        document.querySelector('.category-select').addEventListener('change', (e) => {
            this.selectedCategory = e.target.value;
            this.filterNotes();
        });
        
        // Note title input
        document.querySelector('.note-title-input').addEventListener('input', (e) => {
            if (this.currentNote) {
                this.currentNote.title = e.target.value;
                this.markAsModified();
            }
        });
        
        // Note category select
        document.querySelector('.note-category-select').addEventListener('change', (e) => {
            if (this.currentNote) {
                this.currentNote.category = e.target.value;
                this.markAsModified();
                this.renderNotesList();
            }
        });
        
        // Rich text editor
        const editor = document.querySelector('.rich-text-editor');
        editor.addEventListener('input', () => {
            if (this.currentNote) {
                this.currentNote.content = editor.innerHTML;
                this.markAsModified();
                this.updateWordCount();
            }
        });
        
        // Formatting toolbar
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                if (command) {
                    this.executeCommand(command);
                }
            });
        });
        
        // Editor actions
        document.querySelector('.save-btn').addEventListener('click', () => this.saveCurrentNote());
        document.querySelector('.delete-btn').addEventListener('click', () => this.deleteCurrentNote());
        document.querySelector('.export-btn').addEventListener('click', () => this.showExportModal());
        
        // Export modal
        document.querySelector('.modal-close').addEventListener('click', () => this.hideExportModal());
        document.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideExportModal();
            }
        });
        
        // Export options
        document.querySelectorAll('.export-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const format = e.currentTarget.dataset.format;
                this.exportNote(format);
            });
        });
        
        // Update formatting toolbar state
        editor.addEventListener('selectionchange', () => this.updateToolbarState());
        document.addEventListener('selectionchange', () => this.updateToolbarState());
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N: New note
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.createNewNote();
            }
            
            // Ctrl/Cmd + S: Save note
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveCurrentNote();
            }
            
            // Ctrl/Cmd + F: Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.querySelector('.search-input').focus();
            }
            
            // Ctrl/Cmd + B: Bold
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.executeCommand('bold');
            }
            
            // Ctrl/Cmd + I: Italic
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                this.executeCommand('italic');
            }
            
            // Ctrl/Cmd + U: Underline
            if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                e.preventDefault();
                this.executeCommand('underline');
            }
            
            // Delete key: Delete note (when not in editor)
            if (e.key === 'Delete' && !e.target.closest('.rich-text-editor') && !e.target.closest('input')) {
                e.preventDefault();
                this.deleteCurrentNote();
            }
        });
    }
    
    setupAutosave() {
        setInterval(() => {
            if (this.isModified && this.currentNote) {
                this.saveCurrentNote();
            }
        }, 5000); // Auto-save every 5 seconds
    }
    
    createNewNote() {
        const newNote = {
            id: Date.now().toString(),
            title: 'Untitled Note',
            content: '',
            category: '',
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString()
        };
        
        this.notes.unshift(newNote);
        this.loadNote(newNote.id);
        this.renderNotesList();
        this.saveNotes();
        
        // Focus on title input
        setTimeout(() => {
            document.querySelector('.note-title-input').focus();
            document.querySelector('.note-title-input').select();
        }, 100);
    }
    
    loadNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        
        this.currentNote = note;
        this.currentNoteId = noteId;
        this.isModified = false;
        
        // Update UI
        document.querySelector('.note-title-input').value = note.title;
        document.querySelector('.note-category-select').value = note.category;
        document.querySelector('.rich-text-editor').innerHTML = note.content;
        document.querySelector('.created-date').textContent = this.formatDate(note.createdAt);
        document.querySelector('.modified-date').textContent = this.formatDate(note.modifiedAt);
        
        // Update active note in sidebar
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.toggle('active', item.dataset.noteId === noteId);
        });
        
        this.updateWordCount();
        this.updateAutosaveStatus('saved');
    }
    
    saveCurrentNote() {
        if (!this.currentNote) return;
        
        this.updateAutosaveStatus('saving');
        
        // Update modified date
        this.currentNote.modifiedAt = new Date().toISOString();
        document.querySelector('.modified-date').textContent = this.formatDate(this.currentNote.modifiedAt);
        
        // Save to localStorage
        this.saveNotes();
        this.renderNotesList();
        this.isModified = false;
        
        setTimeout(() => {
            this.updateAutosaveStatus('saved');
        }, 500);
    }
    
    deleteCurrentNote() {
        if (!this.currentNote) return;
        
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(n => n.id !== this.currentNoteId);
            this.saveNotes();
            this.renderNotesList();
            
            // Load next note or clear editor
            if (this.notes.length > 0) {
                this.loadNote(this.notes[0].id);
            } else {
                this.clearEditor();
            }
        }
    }
    
    clearEditor() {
        this.currentNote = null;
        this.currentNoteId = null;
        this.isModified = false;
        
        document.querySelector('.note-title-input').value = '';
        document.querySelector('.note-category-select').value = '';
        document.querySelector('.rich-text-editor').innerHTML = '';
        document.querySelector('.created-date').textContent = 'Never';
        document.querySelector('.modified-date').textContent = 'Never';
        
        this.updateWordCount();
        this.updateAutosaveStatus('saved');
    }
    
    executeCommand(command) {
        document.execCommand(command, false, null);
        this.markAsModified();
        this.updateToolbarState();
        document.querySelector('.rich-text-editor').focus();
    }
    
    updateToolbarState() {
        const commands = ['bold', 'italic', 'underline'];
        commands.forEach(command => {
            const btn = document.querySelector(`[data-command="${command}"]`);
            if (btn) {
                btn.classList.toggle('active', document.queryCommandState(command));
            }
        });
    }
    
    markAsModified() {
        this.isModified = true;
        this.updateAutosaveStatus('modified');
    }
    
    updateAutosaveStatus(status) {
        const statusElement = document.querySelector('.autosave-text');
        statusElement.className = `autosave-text ${status}`;
        
        switch (status) {
            case 'saving':
                statusElement.textContent = 'Saving...';
                break;
            case 'saved':
                statusElement.textContent = 'All changes saved';
                break;
            case 'modified':
                statusElement.textContent = 'Unsaved changes';
                break;
        }
    }
    
    updateWordCount() {
        const content = document.querySelector('.rich-text-editor').textContent || '';
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        const characters = content.length;
        
        document.querySelector('.word-count-text').textContent = `Words: ${words} | Characters: ${characters}`;
    }
    
    filterNotes() {
        const filteredNotes = this.notes.filter(note => {
            const matchesSearch = !this.searchQuery || 
                note.title.toLowerCase().includes(this.searchQuery) ||
                note.content.toLowerCase().includes(this.searchQuery);
            
            const matchesCategory = !this.selectedCategory || note.category === this.selectedCategory;
            
            return matchesSearch && matchesCategory;
        });
        
        this.renderNotesList(filteredNotes);
    }
    
    renderNotesList(notesToRender = this.notes) {
        const notesList = document.querySelector('.notes-list');
        
        if (notesToRender.length === 0) {
            notesList.innerHTML = `
                <div class="note-item placeholder">
                    <div class="note-preview">
                        <div class="note-title">No notes found</div>
                        <div class="note-content">Create a new note to get started...</div>
                        <div class="note-meta">
                            <span class="note-date">Now</span>
                            <span class="note-category personal">personal</span>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        notesList.innerHTML = notesToRender.map(note => `
            <div class="note-item ${note.id === this.currentNoteId ? 'active' : ''}" 
                 data-note-id="${note.id}">
                <div class="note-preview">
                    <div class="note-title">${note.title || 'Untitled Note'}</div>
                    <div class="note-content">${this.stripHtml(note.content) || 'No content'}</div>
                    <div class="note-meta">
                        <span class="note-date">${this.formatDate(note.modifiedAt)}</span>
                        ${note.category ? `<span class="note-category ${note.category}">${note.category}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click event listeners to note items
        document.querySelectorAll('.note-item').forEach(item => {
            if (!item.classList.contains('placeholder')) {
                item.addEventListener('click', () => {
                    this.loadNote(item.dataset.noteId);
                });
            }
        });
    }
    
    stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
    
    showExportModal() {
        if (!this.currentNote) {
            alert('Please select a note to export');
            return;
        }
        
        document.getElementById('exportModal').classList.add('active');
    }
    
    hideExportModal() {
        document.getElementById('exportModal').classList.remove('active');
    }
    
    exportNote(format) {
        if (!this.currentNote) return;
        
        const fileName = `${this.currentNote.title || 'Untitled Note'}`;
        let content = '';
        let mimeType = '';
        let fileExtension = '';
        
        switch (format) {
            case 'txt':
                content = this.stripHtml(this.currentNote.content);
                mimeType = 'text/plain';
                fileExtension = 'txt';
                break;
                
            case 'html':
                content = `
<!DOCTYPE html>
<html>
<head>
    <title>${this.currentNote.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #333; }
        .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>${this.currentNote.title}</h1>
    <div class="meta">
        Created: ${new Date(this.currentNote.createdAt).toLocaleDateString()}
        | Modified: ${new Date(this.currentNote.modifiedAt).toLocaleDateString()}
        ${this.currentNote.category ? ` | Category: ${this.currentNote.category}` : ''}
    </div>
    <div class="content">
        ${this.currentNote.content}
    </div>
</body>
</html>
                `;
                mimeType = 'text/html';
                fileExtension = 'html';
                break;
                
            case 'json':
                content = JSON.stringify(this.currentNote, null, 2);
                mimeType = 'application/json';
                fileExtension = 'json';
                break;
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.hideExportModal();
    }
    
    saveNotes() {
        try {
            localStorage.setItem('notes-app-data', JSON.stringify(this.notes));
        } catch (error) {
            console.error('Failed to save notes:', error);
            alert('Failed to save notes. Please check your browser storage settings.');
        }
    }
    
    loadNotes() {
        try {
            const savedNotes = localStorage.getItem('notes-app-data');
            if (savedNotes) {
                this.notes = JSON.parse(savedNotes);
            } else {
                // Create a welcome note for new users
                this.notes = [{
                    id: Date.now().toString(),
                    title: 'Welcome to Notes!',
                    content: `
                        <p>Welcome to your personal notes app! Here's what you can do:</p>
                        <ul>
                            <li><strong>Create notes:</strong> Click the + button or press Ctrl+N</li>
                            <li><strong>Format text:</strong> Use the toolbar or keyboard shortcuts</li>
                            <li><strong>Search:</strong> Use the search box or press Ctrl+F</li>
                            <li><strong>Organize:</strong> Add categories to your notes</li>
                            <li><strong>Export:</strong> Save notes as TXT, HTML, or JSON</li>
                        </ul>
                        <p>Your notes are automatically saved and will persist between sessions.</p>
                        <p><em>Happy note-taking!</em></p>
                    `,
                    category: 'personal',
                    createdAt: new Date().toISOString(),
                    modifiedAt: new Date().toISOString()
                }];
                this.saveNotes();
            }
        } catch (error) {
            console.error('Failed to load notes:', error);
            this.notes = [];
        }
    }
    
    // Import functionality for future use
    importNotes(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedNotes = JSON.parse(e.target.result);
                if (Array.isArray(importedNotes)) {
                    this.notes = [...this.notes, ...importedNotes];
                    this.saveNotes();
                    this.renderNotesList();
                    alert(`Successfully imported ${importedNotes.length} notes!`);
                } else {
                    alert('Invalid notes file format.');
                }
            } catch (error) {
                alert('Failed to import notes. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
    
    // Export all notes
    exportAllNotes() {
        const content = JSON.stringify(this.notes, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notes-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Clear all notes (for testing)
    clearAllNotes() {
        if (confirm('Are you sure you want to delete all notes? This action cannot be undone.')) {
            this.notes = [];
            this.saveNotes();
            this.renderNotesList();
            this.clearEditor();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.notesApp = new NotesApp();
});

// Handle mobile sidebar toggle (for future enhancement)
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// Handle beforeunload to warn about unsaved changes
window.addEventListener('beforeunload', (e) => {
    if (window.notesApp && window.notesApp.isModified) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
});

// Service Worker registration (for offline functionality - future enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}