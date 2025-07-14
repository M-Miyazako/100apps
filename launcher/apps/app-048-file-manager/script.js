class FileManager {
    constructor() {
        this.files = JSON.parse(localStorage.getItem('files') || '[]');
        this.currentFolder = '/';
        
        this.initializeElements();
        this.setupEventListeners();
        this.renderFiles();
        this.loadSampleFiles();
    }
    
    initializeElements() {
        this.fileGrid = document.getElementById('file-grid');
        this.searchInput = document.getElementById('search-input');
        this.uploadBtn = document.querySelector('.upload-btn');
        this.newFolderBtn = document.querySelector('.new-folder-btn');
    }
    
    setupEventListeners() {
        this.uploadBtn.addEventListener('click', () => this.uploadFile());
        this.newFolderBtn.addEventListener('click', () => this.createFolder());
        this.searchInput.addEventListener('input', () => this.searchFiles());
    }
    
    loadSampleFiles() {
        if (this.files.length === 0) {
            this.files = [
                { name: 'Documents', type: 'folder', icon: '📁', size: '', path: '/' },
                { name: 'Pictures', type: 'folder', icon: '📷', size: '', path: '/' },
                { name: 'Music', type: 'folder', icon: '🎵', size: '', path: '/' },
                { name: 'Videos', type: 'folder', icon: '🎬', size: '', path: '/' },
                { name: 'readme.txt', type: 'file', icon: '📄', size: '1.2 KB', path: '/' },
                { name: 'image.jpg', type: 'file', icon: '🖼️', size: '2.5 MB', path: '/' },
                { name: 'song.mp3', type: 'file', icon: '🎵', size: '4.1 MB', path: '/' },
                { name: 'video.mp4', type: 'file', icon: '🎬', size: '125 MB', path: '/' }
            ];
            this.saveFiles();
        }
    }
    
    uploadFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e) => {
            Array.from(e.target.files).forEach(file => {
                const newFile = {
                    name: file.name,
                    type: 'file',
                    icon: this.getFileIcon(file.name),
                    size: this.formatFileSize(file.size),
                    path: this.currentFolder
                };
                this.files.push(newFile);
            });
            this.saveFiles();
            this.renderFiles();
        };
        input.click();
    }
    
    createFolder() {
        const name = prompt('Folder name:');
        if (name) {
            const newFolder = {
                name: name,
                type: 'folder',
                icon: '📁',
                size: '',
                path: this.currentFolder
            };
            this.files.push(newFolder);
            this.saveFiles();
            this.renderFiles();
        }
    }
    
    getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const icons = {
            'txt': '📄',
            'pdf': '📕',
            'doc': '📘',
            'docx': '📘',
            'jpg': '🖼️',
            'jpeg': '🖼️',
            'png': '🖼️',
            'gif': '🖼️',
            'mp3': '🎵',
            'wav': '🎵',
            'mp4': '🎬',
            'avi': '🎬',
            'zip': '📦',
            'rar': '📦'
        };
        return icons[ext] || '📄';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    renderFiles() {
        const filteredFiles = this.files.filter(file => 
            file.path === this.currentFolder
        );
        
        this.fileGrid.innerHTML = '';
        
        filteredFiles.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            fileItem.innerHTML = `
                <div class="file-icon">${file.icon}</div>
                <div class="file-name">${file.name}</div>
                <div class="file-size">${file.size}</div>
            `;
            
            fileItem.addEventListener('click', () => {
                if (file.type === 'folder') {
                    this.openFolder(file.name);
                } else {
                    this.openFile(file);
                }
            });
            
            this.fileGrid.appendChild(fileItem);
        });
    }
    
    openFolder(folderName) {
        this.currentFolder = this.currentFolder + folderName + '/';
        this.renderFiles();
    }
    
    openFile(file) {
        alert(`Opening ${file.name}`);
    }
    
    searchFiles() {
        const query = this.searchInput.value.toLowerCase();
        const filteredFiles = this.files.filter(file => 
            file.name.toLowerCase().includes(query) && 
            file.path === this.currentFolder
        );
        
        this.fileGrid.innerHTML = '';
        
        filteredFiles.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            fileItem.innerHTML = `
                <div class="file-icon">${file.icon}</div>
                <div class="file-name">${file.name}</div>
                <div class="file-size">${file.size}</div>
            `;
            
            this.fileGrid.appendChild(fileItem);
        });
    }
    
    saveFiles() {
        localStorage.setItem('files', JSON.stringify(this.files));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FileManager();
});