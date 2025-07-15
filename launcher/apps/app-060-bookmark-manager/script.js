class BookmarkManager {
    constructor() {
        this.bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        this.currentSort = 'newest';
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.initializeEventListeners();
        this.renderBookmarks();
        this.updateStats();
    }

    initializeEventListeners() {
        document.getElementById('addBookmarkForm').addEventListener('submit', this.addBookmark.bind(this));
        document.getElementById('searchBox').addEventListener('input', this.handleSearch.bind(this));
        document.getElementById('categoryFilter').addEventListener('change', this.handleFilter.bind(this));
        document.getElementById('exportBtn').addEventListener('click', this.exportBookmarks.bind(this));
        document.getElementById('importBtn').addEventListener('click', this.importBookmarks.bind(this));
        document.getElementById('importFile').addEventListener('change', this.handleImportFile.bind(this));

        // Sort buttons
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', this.handleSort.bind(this));
        });
    }

    addBookmark(e) {
        e.preventDefault();
        
        const title = document.getElementById('bookmarkTitle').value.trim();
        const url = document.getElementById('bookmarkUrl').value.trim();
        const description = document.getElementById('bookmarkDescription').value.trim();
        const category = document.getElementById('bookmarkCategory').value;

        if (!title || !url) {
            alert('Please fill in all required fields.');
            return;
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            alert('Please enter a valid URL.');
            return;
        }

        const bookmark = {
            id: Date.now(),
            title,
            url,
            description,
            category,
            dateAdded: new Date().toISOString(),
            favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`
        };

        this.bookmarks.unshift(bookmark);
        this.saveBookmarks();
        this.renderBookmarks();
        this.updateStats();
        
        // Reset form
        document.getElementById('addBookmarkForm').reset();
        document.getElementById('bookmarkDescription').value = '';
        document.getElementById('bookmarkCategory').value = 'General';

        // Show success message
        this.showMessage('Bookmark added successfully!', 'success');
    }

    deleteBookmark(id) {
        if (confirm('Are you sure you want to delete this bookmark?')) {
            this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
            this.saveBookmarks();
            this.renderBookmarks();
            this.updateStats();
            this.showMessage('Bookmark deleted successfully!', 'success');
        }
    }

    editBookmark(id) {
        const bookmark = this.bookmarks.find(b => b.id === id);
        if (!bookmark) return;

        const newTitle = prompt('Edit title:', bookmark.title);
        if (newTitle === null) return;

        const newUrl = prompt('Edit URL:', bookmark.url);
        if (newUrl === null) return;

        const newDescription = prompt('Edit description:', bookmark.description || '');
        if (newDescription === null) return;

        // Validate URL
        try {
            new URL(newUrl);
        } catch {
            alert('Please enter a valid URL.');
            return;
        }

        bookmark.title = newTitle.trim();
        bookmark.url = newUrl.trim();
        bookmark.description = newDescription.trim();
        bookmark.favicon = `https://www.google.com/s2/favicons?domain=${new URL(newUrl).hostname}&sz=32`;

        this.saveBookmarks();
        this.renderBookmarks();
        this.showMessage('Bookmark updated successfully!', 'success');
    }

    handleSearch(e) {
        this.searchTerm = e.target.value.toLowerCase();
        this.renderBookmarks();
    }

    handleFilter(e) {
        this.currentFilter = e.target.value;
        this.renderBookmarks();
    }

    handleSort(e) {
        document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentSort = e.target.dataset.sort;
        this.renderBookmarks();
    }

    getFilteredAndSortedBookmarks() {
        let filtered = this.bookmarks.filter(bookmark => {
            const matchesSearch = bookmark.title.toLowerCase().includes(this.searchTerm) ||
                                bookmark.url.toLowerCase().includes(this.searchTerm) ||
                                (bookmark.description && bookmark.description.toLowerCase().includes(this.searchTerm));
            
            const matchesCategory = this.currentFilter === 'all' || bookmark.category === this.currentFilter;
            
            return matchesSearch && matchesCategory;
        });

        // Sort bookmarks
        switch (this.currentSort) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
                break;
            case 'title':
                filtered.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
                break;
        }

        return filtered;
    }

    renderBookmarks() {
        const grid = document.getElementById('bookmarksGrid');
        const bookmarks = this.getFilteredAndSortedBookmarks();

        if (bookmarks.length === 0) {
            const message = this.searchTerm || this.currentFilter !== 'all' 
                ? 'No bookmarks match your search criteria.'
                : 'No bookmarks yet! Add your first bookmark using the form above.';
            
            grid.innerHTML = `
                <div class="no-bookmarks">
                    <h3>${this.searchTerm || this.currentFilter !== 'all' ? 'No matches found' : 'No bookmarks yet!'}</h3>
                    <p>${message}</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = bookmarks.map(bookmark => `
            <div class="bookmark-card">
                <div class="bookmark-header">
                    <img class="bookmark-favicon" src="${bookmark.favicon}" alt="Favicon" onerror="this.style.display='none'">
                    <a href="${bookmark.url}" target="_blank" class="bookmark-title">${bookmark.title}</a>
                </div>
                <div class="bookmark-url">${bookmark.url}</div>
                ${bookmark.description ? `<div class="bookmark-description">${bookmark.description}</div>` : ''}
                <div class="bookmark-meta">
                    <span class="bookmark-category">${bookmark.category}</span>
                    <span class="bookmark-date">${new Date(bookmark.dateAdded).toLocaleDateString()}</span>
                </div>
                <div class="bookmark-actions">
                    <button class="action-btn edit-btn" onclick="bookmarkManager.editBookmark(${bookmark.id})">Edit</button>
                    <button class="action-btn delete-btn" onclick="bookmarkManager.deleteBookmark(${bookmark.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const total = this.bookmarks.length;
        const categories = new Set(this.bookmarks.map(b => b.category)).size;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentlyAdded = this.bookmarks.filter(b => new Date(b.dateAdded) > weekAgo).length;

        document.getElementById('totalBookmarks').textContent = total;
        document.getElementById('totalCategories').textContent = categories;
        document.getElementById('recentlyAdded').textContent = recentlyAdded;
    }

    exportBookmarks() {
        const dataStr = JSON.stringify(this.bookmarks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bookmarks-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showMessage('Bookmarks exported successfully!', 'success');
    }

    importBookmarks() {
        document.getElementById('importFile').click();
    }

    handleImportFile(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedBookmarks = JSON.parse(e.target.result);
                if (Array.isArray(importedBookmarks)) {
                    // Add unique IDs and merge with existing bookmarks
                    const newBookmarks = importedBookmarks.map(bookmark => ({
                        ...bookmark,
                        id: Date.now() + Math.random()
                    }));
                    
                    this.bookmarks = [...this.bookmarks, ...newBookmarks];
                    this.saveBookmarks();
                    this.renderBookmarks();
                    this.updateStats();
                    this.showMessage(`Successfully imported ${newBookmarks.length} bookmarks!`, 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                alert('Error importing bookmarks. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }

    saveBookmarks() {
        localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    }

    showMessage(message, type) {
        // Simple message display (you can enhance this with a proper notification system)
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }
}

// Initialize the bookmark manager
const bookmarkManager = new BookmarkManager();