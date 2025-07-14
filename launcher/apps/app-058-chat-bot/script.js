// Chat Bot App JavaScript
class ChatBot {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.responses = {
            greetings: [
                'こんにちは！何かお手伝いできることはありますか？',
                'お疲れ様です！今日はどんなことについて話しましょうか？',
                'こんにちは！お元気ですか？',
            ],
            weather: [
                '申し訳ございませんが、リアルタイムの天気情報は提供できません。天気予報アプリやウェブサイトをご確認ください。',
                '天気について知りたい場合は、お住まいの地域の気象庁のウェブサイトをチェックしてみてください。',
            ],
            programming: [
                'プログラミングについて質問があるんですね！どの言語や技術について知りたいですか？',
                'プログラミングは素晴らしい分野です。JavaScript、Python、Java、C++など、どれについて話しましょうか？',
                'コーディングに関する質問でしたら、具体的な問題や学習したい分野を教えてください。',
            ],
            cooking: [
                '料理のレシピについてですね！どんな料理を作りたいですか？',
                '料理は楽しいものです。和食、洋食、中華、どれがお好みですか？',
                'お料理のヒントでしたら、具体的な材料や料理名を教えてください。',
            ],
            travel: [
                '旅行の計画を立てているんですね！どちらへ行かれる予定ですか？',
                '旅行は素晴らしい体験です。国内旅行と海外旅行、どちらでしょうか？',
                '旅行先の情報が必要でしたら、具体的な場所を教えてください。',
            ],
            default: [
                'なるほど、興味深いですね。もう少し詳しく教えていただけますか？',
                'それについてもっと知りたいです。詳細を教えてください。',
                'いい質問ですね！どのような観点から考えてみましょうか？',
                '申し訳ございませんが、その件についてはあまり詳しくありません。別の質問はいかがですか？',
            ]
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupSuggestionChips();
        this.showWelcomeMessage();
    }
    
    setupEventListeners() {
        const sendBtn = document.querySelector('.send-btn');
        const messageInput = document.querySelector('.message-input');
        const newChatBtn = document.querySelector('.new-chat-btn');
        
        sendBtn.addEventListener('click', () => this.sendMessage());
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        messageInput.addEventListener('input', () => {
            this.autoResize(messageInput);
        });
        
        newChatBtn.addEventListener('click', () => this.startNewChat());
        
        // Action buttons
        document.querySelector('.action-btn[title="履歴をクリア"]').addEventListener('click', () => {
            this.clearHistory();
        });
    }
    
    setupSuggestionChips() {
        const chips = document.querySelectorAll('.chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const suggestion = chip.textContent;
                this.handleSuggestion(suggestion);
            });
        });
    }
    
    handleSuggestion(suggestion) {
        // Remove welcome message
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        // Send the suggestion as a user message
        this.addMessage(suggestion, 'user');
        
        // Generate appropriate response
        setTimeout(() => {
            this.generateResponse(suggestion);
        }, 1000);
    }
    
    sendMessage() {
        const messageInput = document.querySelector('.message-input');
        const content = messageInput.value.trim();
        
        if (!content) return;
        
        // Remove welcome message if it exists
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        this.addMessage(content, 'user');
        messageInput.value = '';
        this.autoResize(messageInput);
        
        // Show typing indicator and generate response
        this.showTypingIndicator();
        setTimeout(() => {
            this.generateResponse(content);
        }, 1000 + Math.random() * 2000);
    }
    
    addMessage(content, sender) {
        const messagesContainer = document.querySelector('.messages-container');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatarIcon = sender === 'user' ? '👤' : '🤖';
        const time = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatarIcon}</div>
            <div class="message-content">
                ${content}
                <div class="message-time">${time}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Store message
        this.messages.push({ content, sender, time });
        this.updateChatHistory();
    }
    
    generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        let responseCategory = 'default';
        
        // Simple keyword matching
        if (lowerMessage.includes('こんにちは') || lowerMessage.includes('はじめまして') || lowerMessage.includes('おはよう')) {
            responseCategory = 'greetings';
        } else if (lowerMessage.includes('天気') || lowerMessage.includes('気温') || lowerMessage.includes('雨')) {
            responseCategory = 'weather';
        } else if (lowerMessage.includes('プログラミング') || lowerMessage.includes('コード') || lowerMessage.includes('開発')) {
            responseCategory = 'programming';
        } else if (lowerMessage.includes('料理') || lowerMessage.includes('レシピ') || lowerMessage.includes('食事')) {
            responseCategory = 'cooking';
        } else if (lowerMessage.includes('旅行') || lowerMessage.includes('観光') || lowerMessage.includes('ホテル')) {
            responseCategory = 'travel';
        }\n        \n        const responses = this.responses[responseCategory];\n        const randomResponse = responses[Math.floor(Math.random() * responses.length)];\n        \n        this.hideTypingIndicator();\n        this.addMessage(randomResponse, 'bot');\n    }\n    \n    showTypingIndicator() {\n        const typingIndicator = document.querySelector('.typing-indicator');\n        typingIndicator.classList.add('active');\n        this.isTyping = true;\n    }\n    \n    hideTypingIndicator() {\n        const typingIndicator = document.querySelector('.typing-indicator');\n        typingIndicator.classList.remove('active');\n        this.isTyping = false;\n    }\n    \n    scrollToBottom() {\n        const messagesContainer = document.querySelector('.messages-container');\n        messagesContainer.scrollTop = messagesContainer.scrollHeight;\n    }\n    \n    autoResize(textarea) {\n        textarea.style.height = 'auto';\n        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';\n    }\n    \n    startNewChat() {\n        this.clearMessages();\n        this.showWelcomeMessage();\n        this.messages = [];\n        this.showNotification('新しいチャットを開始しました', 'success');\n    }\n    \n    clearHistory() {\n        if (confirm('チャット履歴をクリアしますか？')) {\n            this.clearMessages();\n            this.showWelcomeMessage();\n            this.messages = [];\n            this.showNotification('履歴をクリアしました', 'success');\n        }\n    }\n    \n    clearMessages() {\n        const messagesContainer = document.querySelector('.messages-container');\n        const messages = messagesContainer.querySelectorAll('.message');\n        messages.forEach(message => message.remove());\n    }\n    \n    showWelcomeMessage() {\n        const messagesContainer = document.querySelector('.messages-container');\n        const welcomeExists = document.querySelector('.welcome-message');\n        \n        if (!welcomeExists) {\n            const welcomeMessage = document.createElement('div');\n            welcomeMessage.className = 'welcome-message';\n            welcomeMessage.innerHTML = `\n                <div class="welcome-avatar">🤖</div>\n                <div class="welcome-content">\n                    <h3>ChatBot AI へようこそ！</h3>\n                    <p>何でもお気軽にお聞きください。以下のような質問にお答えできます：</p>\n                    <div class="suggestion-chips">\n                        <button class="chip">天気について</button>\n                        <button class="chip">プログラミング</button>\n                        <button class="chip">料理のレシピ</button>\n                        <button class="chip">旅行の計画</button>\n                    </div>\n                </div>\n            `;\n            messagesContainer.appendChild(welcomeMessage);\n            this.setupSuggestionChips();\n        }\n    }\n    \n    updateChatHistory() {\n        const chatHistory = document.querySelector('.chat-history');\n        const activeChat = chatHistory.querySelector('.chat-item.active');\n        \n        if (this.messages.length > 0) {\n            const lastMessage = this.messages[this.messages.length - 1];\n            const snippet = activeChat.querySelector('.chat-snippet');\n            const time = activeChat.querySelector('.chat-time');\n            \n            snippet.textContent = lastMessage.content.substring(0, 30) + (lastMessage.content.length > 30 ? '...' : '');\n            time.textContent = lastMessage.time;\n        }\n    }\n    \n    showNotification(message, type = 'info') {\n        const notification = document.createElement('div');\n        notification.className = `notification ${type}`;\n        notification.style.cssText = `\n            position: fixed;\n            top: 20px;\n            right: 20px;\n            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#f56565' : '#6366f1'};\n            color: white;\n            padding: 15px 20px;\n            border-radius: 10px;\n            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);\n            z-index: 10000;\n            transform: translateX(100%);\n            transition: transform 0.3s ease;\n        `;\n        notification.textContent = message;\n        \n        document.body.appendChild(notification);\n        \n        setTimeout(() => {\n            notification.style.transform = 'translateX(0)';\n        }, 100);\n        \n        setTimeout(() => {\n            notification.style.transform = 'translateX(100%)';\n            setTimeout(() => {\n                document.body.removeChild(notification);\n            }, 300);\n        }, 3000);\n    }\n}\n\n// Initialize the app\ndocument.addEventListener('DOMContentLoaded', () => {\n    new ChatBot();\n});\n\n// Add keyboard shortcuts\ndocument.addEventListener('keydown', (e) => {\n    if (e.ctrlKey || e.metaKey) {\n        switch (e.key) {\n            case 'n':\n                e.preventDefault();\n                document.querySelector('.new-chat-btn').click();\n                break;\n            case 'l':\n                e.preventDefault();\n                document.querySelector('.message-input').focus();\n                break;\n        }\n    }\n});