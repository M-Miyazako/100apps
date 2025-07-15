class ChatApp {
    constructor() {
        this.currentChatId = null;
        this.contacts = [];
        this.messages = {};
        this.typingTimeouts = {};
        this.autoResponseEnabled = true;
        this.autoResponseDelay = 1000;
        
        this.initializeEmojis();
        this.initializeDefaultContacts();
        this.initializeEventListeners();
        this.loadData();
        this.renderContacts();
        this.setupAutoResponses();
    }

    initializeEmojis() {
        this.emojis = [
            '😊', '😂', '😍', '😘', '😎', '🤔', '😢', '😡',
            '👍', '👎', '👌', '✌️', '🤝', '👏', '🙌', '❤️',
            '💕', '💖', '💯', '🔥', '⭐', '🎉', '🎊', '🎈',
            '🌟', '💫', '✨', '🎯', '🚀', '💎', '🏆', '🎁'
        ];
    }

    initializeDefaultContacts() {
        const defaultContacts = [
            {
                id: 'alex',
                name: 'Alex Johnson',
                avatar: 'AJ',
                status: 'online',
                lastSeen: new Date().toISOString(),
                personality: 'friendly'
            },
            {
                id: 'sarah',
                name: 'Sarah Wilson',
                avatar: 'SW',
                status: 'online',
                lastSeen: new Date().toISOString(),
                personality: 'enthusiastic'
            },
            {
                id: 'mike',
                name: 'Mike Chen',
                avatar: 'MC',
                status: 'offline',
                lastSeen: new Date(Date.now() - 3600000).toISOString(),
                personality: 'casual'
            },
            {
                id: 'emma',
                name: 'Emma Davis',
                avatar: 'ED',
                status: 'online',
                lastSeen: new Date().toISOString(),
                personality: 'professional'
            }
        ];

        const savedContacts = JSON.parse(localStorage.getItem('chatApp_contacts') || '[]');
        this.contacts = savedContacts.length > 0 ? savedContacts : defaultContacts;
    }

    initializeEventListeners() {
        // Message input
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            } else {
                this.showTypingIndicator();
            }
        });

        messageInput.addEventListener('input', () => {
            this.updateSendButton();
        });

        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchContacts(e.target.value);
        });

        // New chat modal
        document.getElementById('newChatBtn').addEventListener('click', () => {
            this.openNewChatModal();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeNewChatModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeNewChatModal();
        });

        document.getElementById('createChatBtn').addEventListener('click', () => {
            this.createNewChat();
        });

        // Emoji picker
        document.getElementById('emojiBtn').addEventListener('click', () => {
            this.toggleEmojiPicker();
        });

        document.getElementById('closeEmoji').addEventListener('click', () => {
            this.closeEmojiPicker();
        });

        // Close modals on outside click
        document.getElementById('newChatModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeNewChatModal();
            }
        });

        // Action buttons
        document.getElementById('callBtn').addEventListener('click', () => {
            this.showNotification('Voice call feature coming soon!');
        });

        document.getElementById('videoBtn').addEventListener('click', () => {
            this.showNotification('Video call feature coming soon!');
        });

        document.getElementById('moreBtn').addEventListener('click', () => {
            this.showNotification('More options coming soon!');
        });

        document.getElementById('attachmentBtn').addEventListener('click', () => {
            this.showNotification('File attachment feature coming soon!');
        });
    }

    loadData() {
        const savedMessages = JSON.parse(localStorage.getItem('chatApp_messages') || '{}');
        this.messages = savedMessages;
    }

    saveData() {
        localStorage.setItem('chatApp_contacts', JSON.stringify(this.contacts));
        localStorage.setItem('chatApp_messages', JSON.stringify(this.messages));
    }

    renderContacts() {
        const contactsList = document.getElementById('contactsList');
        contactsList.innerHTML = '';

        this.contacts.forEach(contact => {
            const contactElement = this.createContactElement(contact);
            contactsList.appendChild(contactElement);
        });
    }

    createContactElement(contact) {
        const contactDiv = document.createElement('div');
        contactDiv.className = 'contact-item';
        contactDiv.dataset.contactId = contact.id;

        const lastMessage = this.getLastMessage(contact.id);
        const unreadCount = this.getUnreadCount(contact.id);

        contactDiv.innerHTML = `
            <div class="avatar ${contact.status === 'online' ? 'online' : ''}">${contact.avatar}</div>
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="last-message">${lastMessage || 'No messages yet'}</div>
            </div>
            <div class="message-meta">
                <div class="message-time">${this.formatTime(contact.lastSeen)}</div>
                ${unreadCount > 0 ? `<div class="unread-count">${unreadCount}</div>` : ''}
            </div>
        `;

        contactDiv.addEventListener('click', () => {
            this.selectContact(contact.id);
        });

        return contactDiv;
    }

    selectContact(contactId) {
        this.currentChatId = contactId;
        
        // Update active contact
        document.querySelectorAll('.contact-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedContact = document.querySelector(`[data-contact-id="${contactId}"]`);
        if (selectedContact) {
            selectedContact.classList.add('active');
        }

        // Update chat header
        const contact = this.contacts.find(c => c.id === contactId);
        if (contact) {
            document.getElementById('chatName').textContent = contact.name;
            document.getElementById('chatAvatar').textContent = contact.avatar;
            document.getElementById('chatStatus').textContent = contact.status === 'online' ? 'Online' : `Last seen ${this.formatTime(contact.lastSeen)}`;
            document.getElementById('chatStatus').className = `status ${contact.status}`;
        }

        // Load messages
        this.loadMessages(contactId);
        
        // Mark messages as read
        this.markMessagesAsRead(contactId);
        
        // Show input container
        document.getElementById('messageInputContainer').style.display = 'flex';
        
        // Focus on message input
        document.getElementById('messageInput').focus();
    }

    loadMessages(contactId) {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = '';

        const chatMessages = this.messages[contactId] || [];
        
        chatMessages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender === 'user' ? 'sent' : 'received'}`;
        messageDiv.dataset.messageId = message.id;

        const statusIndicator = message.sender === 'user' ? 
            `<div class="message-status ${message.read ? 'read' : ''}">
                ${message.read ? '✓✓' : '✓'}
            </div>` : '';

        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div class="message-content">${this.formatMessageContent(message.content)}</div>
                <div class="message-timestamp">${this.formatTime(message.timestamp)}</div>
                ${statusIndicator}
            </div>
        `;

        return messageDiv;
    }

    formatMessageContent(content) {
        // Simple emoji support and text formatting
        return content
            .replace(/:\)/g, '😊')
            .replace(/:\(/g, '😢')
            .replace(/:D/g, '😃')
            .replace(/:P/g, '😛')
            .replace(/<3/g, '❤️')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const content = messageInput.value.trim();
        
        if (!content || !this.currentChatId) return;

        const message = {
            id: Date.now().toString(),
            content: content,
            sender: 'user',
            timestamp: new Date().toISOString(),
            read: false
        };

        // Add message to storage
        if (!this.messages[this.currentChatId]) {
            this.messages[this.currentChatId] = [];
        }
        this.messages[this.currentChatId].push(message);

        // Create and display message
        const messageElement = this.createMessageElement(message);
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.appendChild(messageElement);

        // Clear input
        messageInput.value = '';
        this.updateSendButton();

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Save data
        this.saveData();

        // Update contact list
        this.updateContactLastMessage(this.currentChatId, content);

        // Trigger auto response
        if (this.autoResponseEnabled) {
            this.scheduleAutoResponse();
        }
    }

    scheduleAutoResponse() {
        const contact = this.contacts.find(c => c.id === this.currentChatId);
        if (!contact || contact.status !== 'online') return;

        // Show typing indicator
        this.showTypingIndicator();

        setTimeout(() => {
            this.hideTypingIndicator();
            this.sendAutoResponse();
        }, this.autoResponseDelay + Math.random() * 2000);
    }

    sendAutoResponse() {
        const responses = this.getAutoResponses();
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const message = {
            id: Date.now().toString(),
            content: randomResponse,
            sender: 'contact',
            timestamp: new Date().toISOString(),
            read: false
        };

        this.messages[this.currentChatId].push(message);

        const messageElement = this.createMessageElement(message);
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.appendChild(messageElement);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Save data
        this.saveData();

        // Update contact list
        this.updateContactLastMessage(this.currentChatId, randomResponse);

        // Mark as read after a delay
        setTimeout(() => {
            message.read = true;
            this.saveData();
            this.updateMessageStatus(message.id);
        }, 1000);
    }

    getAutoResponses() {
        const contact = this.contacts.find(c => c.id === this.currentChatId);
        const personality = contact?.personality || 'friendly';

        const responses = {
            friendly: [
                "That's really interesting! Tell me more 😊",
                "I totally agree with you!",
                "Thanks for sharing that with me!",
                "How was your day?",
                "That sounds amazing!",
                "I'm so glad you told me about this!",
                "What do you think about it?",
                "That's so cool! 🌟"
            ],
            enthusiastic: [
                "OMG that's AMAZING!! 🎉",
                "I LOVE that idea!!! ✨",
                "This is so exciting! 🚀",
                "WOW! Tell me everything!",
                "I'm literally so happy for you! 💕",
                "This made my day! 😍",
                "You're the best! 🌟",
                "I can't even! This is perfect! 💯"
            ],
            casual: [
                "Cool, dude 👍",
                "Yeah, that's pretty neat",
                "Nice one!",
                "Sounds good to me",
                "Yeah I feel you",
                "That's fair",
                "Makes sense",
                "For sure!"
            ],
            professional: [
                "Thank you for the information.",
                "I appreciate you sharing that.",
                "That's very insightful.",
                "I'll take that into consideration.",
                "Thank you for your time.",
                "I understand your perspective.",
                "That's a valid point.",
                "I'll follow up on that."
            ]
        };

        return responses[personality] || responses.friendly;
    }

    showTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        const contact = this.contacts.find(c => c.id === this.currentChatId);
        
        if (contact) {
            document.querySelector('.typing-text').textContent = `${contact.name} is typing...`;
            typingIndicator.classList.add('active');
        }
    }

    hideTypingIndicator() {
        document.getElementById('typingIndicator').classList.remove('active');
    }

    updateSendButton() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (messageInput.value.trim()) {
            sendBtn.disabled = false;
            sendBtn.style.opacity = '1';
        } else {
            sendBtn.disabled = true;
            sendBtn.style.opacity = '0.5';
        }
    }

    updateContactLastMessage(contactId, message) {
        const contact = this.contacts.find(c => c.id === contactId);
        if (contact) {
            contact.lastMessage = message;
            contact.lastSeen = new Date().toISOString();
        }
        this.renderContacts();
    }

    getLastMessage(contactId) {
        const chatMessages = this.messages[contactId] || [];
        if (chatMessages.length === 0) return null;
        
        const lastMessage = chatMessages[chatMessages.length - 1];
        return lastMessage.content.length > 30 ? 
            lastMessage.content.substring(0, 30) + '...' : 
            lastMessage.content;
    }

    getUnreadCount(contactId) {
        const chatMessages = this.messages[contactId] || [];
        return chatMessages.filter(msg => msg.sender === 'contact' && !msg.read).length;
    }

    markMessagesAsRead(contactId) {
        const chatMessages = this.messages[contactId] || [];
        chatMessages.forEach(message => {
            if (message.sender === 'contact') {
                message.read = true;
            }
        });
        this.saveData();
        this.renderContacts();
    }

    updateMessageStatus(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const statusElement = messageElement.querySelector('.message-status');
            if (statusElement) {
                statusElement.classList.add('read');
                statusElement.textContent = '✓✓';
            }
        }
    }

    searchContacts(query) {
        const contactItems = document.querySelectorAll('.contact-item');
        const lowercaseQuery = query.toLowerCase();

        contactItems.forEach(item => {
            const name = item.querySelector('.contact-name').textContent.toLowerCase();
            const lastMessage = item.querySelector('.last-message').textContent.toLowerCase();
            
            if (name.includes(lowercaseQuery) || lastMessage.includes(lowercaseQuery)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    openNewChatModal() {
        document.getElementById('newChatModal').classList.add('active');
        this.renderAvatarOptions();
        document.getElementById('newContactName').focus();
    }

    closeNewChatModal() {
        document.getElementById('newChatModal').classList.remove('active');
        document.getElementById('newContactName').value = '';
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('selected');
        });
    }

    renderAvatarOptions() {
        const avatarOptions = document.getElementById('avatarOptions');
        const avatars = ['👨', '👩', '🧑', '👱', '🙋', '🧔', '👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🎨'];
        
        avatarOptions.innerHTML = '';
        
        avatars.forEach(avatar => {
            const option = document.createElement('div');
            option.className = 'avatar-option';
            option.textContent = avatar;
            option.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
            });
            avatarOptions.appendChild(option);
        });
    }

    createNewChat() {
        const name = document.getElementById('newContactName').value.trim();
        const selectedAvatar = document.querySelector('.avatar-option.selected');
        
        if (!name) {
            this.showNotification('Please enter a contact name');
            return;
        }
        
        if (!selectedAvatar) {
            this.showNotification('Please select an avatar');
            return;
        }

        const newContact = {
            id: Date.now().toString(),
            name: name,
            avatar: selectedAvatar.textContent,
            status: 'online',
            lastSeen: new Date().toISOString(),
            personality: 'friendly'
        };

        this.contacts.push(newContact);
        this.saveData();
        this.renderContacts();
        this.closeNewChatModal();
        this.selectContact(newContact.id);
        
        this.showNotification(`New chat with ${name} created!`);
    }

    toggleEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPicker');
        
        if (emojiPicker.classList.contains('active')) {
            this.closeEmojiPicker();
        } else {
            this.openEmojiPicker();
        }
    }

    openEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPicker');
        const emojiGrid = document.getElementById('emojiGrid');
        
        emojiGrid.innerHTML = '';
        
        this.emojis.forEach(emoji => {
            const emojiButton = document.createElement('button');
            emojiButton.className = 'emoji-item';
            emojiButton.textContent = emoji;
            emojiButton.addEventListener('click', () => {
                this.insertEmoji(emoji);
            });
            emojiGrid.appendChild(emojiButton);
        });
        
        emojiPicker.classList.add('active');
    }

    closeEmojiPicker() {
        document.getElementById('emojiPicker').classList.remove('active');
    }

    insertEmoji(emoji) {
        const messageInput = document.getElementById('messageInput');
        const cursorPosition = messageInput.selectionStart;
        const textBefore = messageInput.value.substring(0, cursorPosition);
        const textAfter = messageInput.value.substring(cursorPosition);
        
        messageInput.value = textBefore + emoji + textAfter;
        messageInput.focus();
        messageInput.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length);
        
        this.updateSendButton();
        this.closeEmojiPicker();
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 3000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        } else if (diff < 86400000) { // Less than 24 hours
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    setupAutoResponses() {
        // Simulate random status changes
        setInterval(() => {
            this.updateRandomStatus();
        }, 30000); // Every 30 seconds
    }

    updateRandomStatus() {
        const onlineContacts = this.contacts.filter(c => c.status === 'online');
        
        if (onlineContacts.length > 0 && Math.random() < 0.3) {
            const randomContact = onlineContacts[Math.floor(Math.random() * onlineContacts.length)];
            
            // Randomly make someone go offline
            if (Math.random() < 0.2) {
                randomContact.status = 'offline';
                randomContact.lastSeen = new Date().toISOString();
            }
        }
        
        // Randomly bring someone back online
        const offlineContacts = this.contacts.filter(c => c.status === 'offline');
        if (offlineContacts.length > 0 && Math.random() < 0.4) {
            const randomContact = offlineContacts[Math.floor(Math.random() * offlineContacts.length)];
            randomContact.status = 'online';
            randomContact.lastSeen = new Date().toISOString();
        }
        
        this.renderContacts();
        
        // Update current chat header if needed
        if (this.currentChatId) {
            const contact = this.contacts.find(c => c.id === this.currentChatId);
            if (contact) {
                document.getElementById('chatStatus').textContent = contact.status === 'online' ? 'Online' : `Last seen ${this.formatTime(contact.lastSeen)}`;
                document.getElementById('chatStatus').className = `status ${contact.status}`;
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});