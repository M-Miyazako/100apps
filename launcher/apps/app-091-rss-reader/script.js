class RSSReader {
    constructor() {
        this.feeds = JSON.parse(localStorage.getItem('rss-feeds') || '[]');
        this.currentFeedIndex = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderFeeds();
        if (this.feeds.length > 0) {
            this.loadFeed(0);
        } else {
            this.showNoFeeds();
        }
    }

    bindEvents() {
        document.getElementById('add-feed').addEventListener('click', () => this.addFeed());
        document.getElementById('rss-url').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addFeed();
            }
        });
    }

    async addFeed() {
        const urlInput = document.getElementById('rss-url');
        const url = urlInput.value.trim();
        
        if (!url) return;
        
        if (this.feeds.some(feed => feed.url === url)) {
            this.showError('This feed is already added.');
            return;
        }

        this.showLoading('Adding feed...');
        
        try {
            const feedData = await this.fetchFeed(url);
            const newFeed = {
                url: url,
                title: feedData.title || 'RSS Feed',
                articles: feedData.articles || []
            };
            
            this.feeds.push(newFeed);
            this.saveFeeds();
            this.renderFeeds();
            this.loadFeed(this.feeds.length - 1);
            
            urlInput.value = '';
            this.hideLoading();
        } catch (error) {
            this.showError('Failed to load RSS feed. Please check the URL and try again.');
            this.hideLoading();
        }
    }

    async fetchFeed(url) {
        // Since we can't directly fetch RSS feeds due to CORS, we'll use a proxy service
        // In a real application, you would use a backend service or RSS proxy
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        
        try {
            const response = await fetch(proxyUrl);
            const data = await response.json();
            return this.parseRSS(data.contents);
        } catch (error) {
            // Fallback: create a demo feed with sample data
            return this.createDemoFeed(url);
        }
    }

    parseRSS(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
        
        const channel = xmlDoc.querySelector('channel') || xmlDoc.querySelector('feed');
        if (!channel) {
            throw new Error('Invalid RSS feed');
        }
        
        const title = channel.querySelector('title')?.textContent || 'RSS Feed';
        const items = Array.from(xmlDoc.querySelectorAll('item, entry'));
        
        const articles = items.slice(0, 20).map(item => {
            const titleEl = item.querySelector('title');
            const linkEl = item.querySelector('link');
            const descEl = item.querySelector('description, summary, content');
            const dateEl = item.querySelector('pubDate, published, updated');
            
            return {
                title: titleEl?.textContent || 'No Title',
                link: linkEl?.textContent || linkEl?.getAttribute('href') || '#',
                description: this.stripHTML(descEl?.textContent || 'No description available'),
                date: dateEl?.textContent || new Date().toISOString()
            };
        });
        
        return { title, articles };
    }

    createDemoFeed(url) {
        // Create a demo feed with sample articles
        const demoArticles = [
            {
                title: 'Welcome to RSS Reader',
                link: '#',
                description: 'This is a demo article. The RSS feed could not be loaded, but you can see how articles would appear here.',
                date: new Date().toISOString()
            },
            {
                title: 'How to Use RSS Reader',
                link: '#',
                description: 'Add RSS feed URLs to stay updated with your favorite websites and blogs.',
                date: new Date(Date.now() - 86400000).toISOString()
            },
            {
                title: 'RSS Feed Features',
                link: '#',
                description: 'View articles from multiple feeds in one place, with clean formatting and easy navigation.',
                date: new Date(Date.now() - 172800000).toISOString()
            }
        ];
        
        return {
            title: 'Demo Feed - ' + new URL(url).hostname,
            articles: demoArticles
        };
    }

    stripHTML(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    renderFeeds() {
        const feedsContainer = document.getElementById('feeds');
        
        if (this.feeds.length === 0) {
            feedsContainer.innerHTML = '<div class="no-feeds">No feeds added yet. Add your first RSS feed above!</div>';
            return;
        }
        
        feedsContainer.innerHTML = this.feeds.map((feed, index) => `
            <div class="feed-item ${index === this.currentFeedIndex ? 'active' : ''}" 
                 onclick="rssReader.loadFeed(${index})">
                <div class="feed-title">${feed.title}</div>
                <div class="feed-url">${feed.url}</div>
            </div>
        `).join('');
    }

    loadFeed(index) {
        this.currentFeedIndex = index;
        this.renderFeeds();
        this.renderArticles(this.feeds[index].articles);
    }

    renderArticles(articles) {
        const articlesContainer = document.getElementById('articles');
        
        if (!articles || articles.length === 0) {
            articlesContainer.innerHTML = '<div class="no-feeds">No articles available in this feed.</div>';
            return;
        }
        
        articlesContainer.innerHTML = articles.map(article => `
            <div class="article">
                <div class="article-title">
                    <a href="${article.link}" target="_blank" class="article-link">${article.title}</a>
                </div>
                <div class="article-date">${this.formatDate(article.date)}</div>
                <div class="article-description">${article.description}</div>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Unknown date';
        }
    }

    showNoFeeds() {
        document.getElementById('articles').innerHTML = '<div class="no-feeds">Add an RSS feed to get started!</div>';
    }

    showLoading(message = 'Loading...') {
        document.getElementById('articles').innerHTML = `<div class="loading">${message}</div>`;
    }

    hideLoading() {
        // Loading will be hidden when content is rendered
    }

    showError(message) {
        document.getElementById('articles').innerHTML = `<div class="error">${message}</div>`;
    }

    saveFeeds() {
        localStorage.setItem('rss-feeds', JSON.stringify(this.feeds));
    }
}

// Initialize the RSS Reader when the page loads
document.addEventListener('DOMContentLoaded', function() {
    window.rssReader = new RSSReader();
});
