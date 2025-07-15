class TranslationTool {
    constructor() {
        this.apiKey = 'demo-key'; // In production, use a real API key
        this.translationHistory = [];
        this.favorites = [];
        this.currentPhraseCategory = 'greetings';
        this.languages = this.getLanguageList();
        this.commonPhrases = this.getCommonPhrases();
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
        this.updateCharCount();
    }
    
    initializeElements() {
        // Main elements
        this.sourceText = document.getElementById('sourceText');
        this.translatedText = document.getElementById('translatedText');
        this.sourceLang = document.getElementById('sourceLang');
        this.targetLang = document.getElementById('targetLang');
        this.translateBtn = document.getElementById('translateBtn');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        
        // Controls
        this.swapLangs = document.getElementById('swapLangs');
        this.clearInput = document.getElementById('clearInput');
        this.pasteText = document.getElementById('pasteText');
        this.speakSource = document.getElementById('speakSource');
        this.copyTranslation = document.getElementById('copyTranslation');
        this.saveTranslation = document.getElementById('saveTranslation');
        this.speakTranslation = document.getElementById('speakTranslation');
        
        // UI elements
        this.charCount = document.getElementById('charCount');
        this.confidenceFill = document.getElementById('confidenceFill');
        this.confidenceText = document.getElementById('confidenceText');
        this.themeToggle = document.getElementById('themeToggle');
        this.historyToggle = document.getElementById('historyToggle');
        this.sidePanel = document.getElementById('sidePanel');
        
        // History
        this.historyList = document.getElementById('historyList');
        this.clearHistory = document.getElementById('clearHistory');
        this.exportHistory = document.getElementById('exportHistory');
        
        // Panels
        this.favoritesPanel = document.getElementById('favoritesPanel');
        this.commonPhrasesPanel = document.getElementById('commonPhrasesPanel');
        this.dictionaryPanel = document.getElementById('dictionaryPanel');
        this.favoritesList = document.getElementById('favoritesList');
        this.phrasesList = document.getElementById('phrasesList');
        
        // Dictionary
        this.dictionaryInput = document.getElementById('dictionaryInput');
        this.dictionarySearchBtn = document.getElementById('dictionarySearchBtn');
        this.dictionaryResults = document.getElementById('dictionaryResults');
        
        // Quick actions
        this.quickBtns = document.querySelectorAll('.quick-btn');
        this.categoryBtns = document.querySelectorAll('.category-btn');
    }
    
    setupEventListeners() {
        // Translation
        this.translateBtn.addEventListener('click', () => this.translateText());
        this.sourceText.addEventListener('input', () => this.updateCharCount());
        this.sourceText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.translateText();
            }
        });
        
        // Language controls
        this.swapLangs.addEventListener('click', () => this.swapLanguages());
        this.sourceLang.addEventListener('change', () => this.saveSettings());
        this.targetLang.addEventListener('change', () => this.saveSettings());
        
        // Text controls
        this.clearInput.addEventListener('click', () => this.clearInputText());
        this.pasteText.addEventListener('click', () => this.pasteFromClipboard());
        this.speakSource.addEventListener('click', () => this.speakText(this.sourceText.value, this.sourceLang.value));
        this.copyTranslation.addEventListener('click', () => this.copyToClipboard());
        this.saveTranslation.addEventListener('click', () => this.saveToFavorites());
        this.speakTranslation.addEventListener('click', () => this.speakText(this.translatedText.textContent, this.targetLang.value));
        
        // UI controls
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.historyToggle.addEventListener('click', () => this.toggleHistory());
        
        // History
        this.clearHistory.addEventListener('click', () => this.clearTranslationHistory());
        this.exportHistory.addEventListener('click', () => this.exportTranslationHistory());
        
        // Quick actions
        this.quickBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e.target.dataset.action));
        });
        
        // Phrase categories
        this.categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchPhraseCategory(e.target.dataset.category));
        });
        
        // Dictionary
        this.dictionarySearchBtn.addEventListener('click', () => this.searchDictionary());
        this.dictionaryInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.searchDictionary();
            }
        });
        
        // Auto-translate on input (debounced)
        this.sourceText.addEventListener('input', this.debounce(() => {
            if (this.sourceText.value.trim()) {
                this.translateText();
            }
        }, 1000));
    }
    
    async translateText() {
        const text = this.sourceText.value.trim();
        if (!text) return;
        
        this.setLoadingState(true);
        
        try {
            // Simulate API call with mock translation
            const translation = await this.mockTranslate(text, this.sourceLang.value, this.targetLang.value);
            
            this.translatedText.textContent = translation.text;
            this.updateConfidence(translation.confidence);
            this.addToHistory(text, translation.text, this.sourceLang.value, this.targetLang.value);
            
        } catch (error) {
            console.error('Translation error:', error);
            this.translatedText.textContent = 'Translation failed. Please try again.';
            this.updateConfidence(0);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    async mockTranslate(text, sourceLang, targetLang) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock translation responses
        const mockTranslations = {
            'hello': { 'es': 'hola', 'fr': 'bonjour', 'de': 'hallo', 'it': 'ciao', 'pt': 'olá' },
            'goodbye': { 'es': 'adiós', 'fr': 'au revoir', 'de': 'auf wiedersehen', 'it': 'arrivederci', 'pt': 'tchau' },
            'thank you': { 'es': 'gracias', 'fr': 'merci', 'de': 'danke', 'it': 'grazie', 'pt': 'obrigado' },
            'yes': { 'es': 'sí', 'fr': 'oui', 'de': 'ja', 'it': 'sì', 'pt': 'sim' },
            'no': { 'es': 'no', 'fr': 'non', 'de': 'nein', 'it': 'no', 'pt': 'não' },
            'please': { 'es': 'por favor', 'fr': "s'il vous plaît", 'de': 'bitte', 'it': 'per favore', 'pt': 'por favor' },
            'excuse me': { 'es': 'disculpe', 'fr': 'excusez-moi', 'de': 'entschuldigung', 'it': 'scusi', 'pt': 'com licença' },
            'how are you': { 'es': '¿cómo estás?', 'fr': 'comment allez-vous?', 'de': 'wie geht es dir?', 'it': 'come stai?', 'pt': 'como você está?' }
        };
        
        const lowerText = text.toLowerCase();
        const translation = mockTranslations[lowerText] && mockTranslations[lowerText][targetLang];
        
        if (translation) {
            return {
                text: translation,
                confidence: 0.95
            };
        }
        
        // Generate a mock translation for other text
        const mockText = `[${targetLang.toUpperCase()}] ${text}`;
        return {
            text: mockText,
            confidence: 0.75
        };
    }
    
    setLoadingState(loading) {
        this.translateBtn.disabled = loading;
        this.translateBtn.classList.toggle('loading', loading);
    }
    
    updateCharCount() {
        const count = this.sourceText.value.length;
        this.charCount.textContent = `${count}/5000`;
        this.charCount.style.color = count > 4500 ? 'var(--error-color)' : 'var(--text-secondary)';
    }
    
    updateConfidence(confidence) {
        const percentage = Math.round(confidence * 100);
        this.confidenceFill.style.width = `${percentage}%`;
        this.confidenceText.textContent = `${percentage}%`;
    }
    
    swapLanguages() {
        const sourceLang = this.sourceLang.value;
        const targetLang = this.targetLang.value;
        
        if (sourceLang === 'auto') return;
        
        this.sourceLang.value = targetLang;
        this.targetLang.value = sourceLang;
        
        const sourceText = this.sourceText.value;
        const translatedText = this.translatedText.textContent;
        
        if (translatedText && translatedText !== 'Translation will appear here...') {
            this.sourceText.value = translatedText;
            this.translatedText.textContent = sourceText;
        }
        
        this.saveSettings();
    }
    
    clearInputText() {
        this.sourceText.value = '';
        this.translatedText.textContent = 'Translation will appear here...';
        this.updateCharCount();
        this.updateConfidence(0);
    }
    
    async pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            this.sourceText.value = text;
            this.updateCharCount();
            if (text.trim()) {
                this.translateText();
            }
        } catch (error) {
            console.error('Clipboard access denied:', error);
        }
    }
    
    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.translatedText.textContent);
            this.showNotification('Copied to clipboard!');
        } catch (error) {
            console.error('Clipboard write failed:', error);
        }
    }
    
    speakText(text, language) {
        if (!text || text === 'Translation will appear here...') return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.getLanguageCode(language);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        speechSynthesis.speak(utterance);
    }
    
    addToHistory(sourceText, translatedText, sourceLang, targetLang) {
        const historyItem = {
            id: Date.now(),
            sourceText,
            translatedText,
            sourceLang,
            targetLang,
            timestamp: new Date().toISOString()
        };
        
        this.translationHistory.unshift(historyItem);
        
        // Keep only last 50 items
        if (this.translationHistory.length > 50) {
            this.translationHistory = this.translationHistory.slice(0, 50);
        }
        
        this.updateHistoryUI();
        this.saveToStorage();
    }
    
    updateHistoryUI() {
        if (this.translationHistory.length === 0) {
            this.historyList.innerHTML = `
                <div class="empty-history">
                    <p>No translation history</p>
                    <p>Start translating to see history</p>
                </div>
            `;
            return;
        }
        
        this.historyList.innerHTML = this.translationHistory.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="source-text">${item.sourceText}</div>
                <div class="translated-text">${item.translatedText}</div>
                <div class="language-info">${this.getLanguageName(item.sourceLang)} → ${this.getLanguageName(item.targetLang)}</div>
            </div>
        `).join('');
        
        // Add click listeners
        this.historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.loadFromHistory(id);
            });
        });
    }
    
    loadFromHistory(id) {
        const item = this.translationHistory.find(h => h.id === id);
        if (item) {
            this.sourceText.value = item.sourceText;
            this.translatedText.textContent = item.translatedText;
            this.sourceLang.value = item.sourceLang;
            this.targetLang.value = item.targetLang;
            this.updateCharCount();
        }
    }
    
    saveToFavorites() {
        const sourceText = this.sourceText.value.trim();
        const translatedText = this.translatedText.textContent;
        
        if (!sourceText || !translatedText || translatedText === 'Translation will appear here...') {
            return;
        }
        
        const favorite = {
            id: Date.now(),
            sourceText,
            translatedText,
            sourceLang: this.sourceLang.value,
            targetLang: this.targetLang.value,
            timestamp: new Date().toISOString()
        };
        
        this.favorites.unshift(favorite);
        this.updateFavoritesUI();
        this.saveToStorage();
        this.showNotification('Saved to favorites!');
    }
    
    updateFavoritesUI() {
        if (this.favorites.length === 0) {
            this.favoritesList.innerHTML = `
                <div class="empty-favorites">
                    <p>No favorite translations</p>
                    <p>Save translations to access them quickly</p>
                </div>
            `;
            return;
        }
        
        this.favoritesList.innerHTML = this.favorites.map(item => `
            <div class="favorite-item" data-id="${item.id}">
                <div class="source-text">${item.sourceText}</div>
                <div class="translated-text">${item.translatedText}</div>
                <div class="language-info">${this.getLanguageName(item.sourceLang)} → ${this.getLanguageName(item.targetLang)}</div>
            </div>
        `).join('');
        
        // Add click listeners
        this.favoritesList.querySelectorAll('.favorite-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.loadFromFavorites(id);
            });
        });
    }
    
    loadFromFavorites(id) {
        const item = this.favorites.find(f => f.id === id);
        if (item) {
            this.sourceText.value = item.sourceText;
            this.translatedText.textContent = item.translatedText;
            this.sourceLang.value = item.sourceLang;
            this.targetLang.value = item.targetLang;
            this.updateCharCount();
        }
    }
    
    clearTranslationHistory() {
        if (confirm('Are you sure you want to clear all translation history?')) {
            this.translationHistory = [];
            this.updateHistoryUI();
            this.saveToStorage();
        }
    }
    
    exportTranslationHistory() {
        const data = {
            history: this.translationHistory,
            favorites: this.favorites,
            exported: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `translation_history_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        this.themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('translatorTheme', newTheme);
    }
    
    toggleHistory() {
        this.sidePanel.classList.toggle('active');
    }
    
    handleQuickAction(action) {
        this.hideAllPanels();
        
        switch (action) {
            case 'common-phrases':
                this.commonPhrasesPanel.classList.add('active');
                this.loadCommonPhrases();
                break;
            case 'dictionary':
                this.dictionaryPanel.classList.add('active');
                break;
            case 'favorites':
                this.favoritesPanel.classList.add('active');
                this.updateFavoritesUI();
                break;
            case 'camera':
                this.showNotification('Camera translation not available in demo');
                break;
        }
    }
    
    hideAllPanels() {
        this.favoritesPanel.classList.remove('active');
        this.commonPhrasesPanel.classList.remove('active');
        this.dictionaryPanel.classList.remove('active');
    }
    
    switchPhraseCategory(category) {
        this.currentPhraseCategory = category;
        this.categoryBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        this.loadCommonPhrases();
    }
    
    loadCommonPhrases() {
        const phrases = this.commonPhrases[this.currentPhraseCategory] || [];
        
        this.phrasesList.innerHTML = phrases.map(phrase => `
            <div class="phrase-item" data-phrase="${phrase.en}">
                <div class="phrase-text">${phrase.en}</div>
                <div class="phrase-translation">${phrase[this.targetLang.value] || 'Translation not available'}</div>
            </div>
        `).join('');
        
        // Add click listeners
        this.phrasesList.querySelectorAll('.phrase-item').forEach(item => {
            item.addEventListener('click', () => {
                this.sourceText.value = item.dataset.phrase;
                this.updateCharCount();
                this.translateText();
                this.hideAllPanels();
            });
        });
    }
    
    async searchDictionary() {
        const word = this.dictionaryInput.value.trim();
        if (!word) return;
        
        // Mock dictionary results
        const mockResults = {
            word: word,
            pronunciation: `/${word}/`,
            definitions: [
                'Definition 1: Example definition for the word.',
                'Definition 2: Another example definition.'
            ],
            translations: {
                es: 'Spanish translation',
                fr: 'French translation',
                de: 'German translation'
            }
        };
        
        this.dictionaryResults.innerHTML = `
            <div class="dictionary-item">
                <div class="word">${mockResults.word}</div>
                <div class="pronunciation">${mockResults.pronunciation}</div>
                <div class="definitions">
                    ${mockResults.definitions.map(def => `<div class="definition">${def}</div>`).join('')}
                </div>
                <div class="translations">
                    <strong>Translations:</strong><br>
                    ${Object.entries(mockResults.translations).map(([lang, trans]) => 
                        `${this.getLanguageName(lang)}: ${trans}`
                    ).join('<br>')}
                </div>
            </div>
        `;
    }
    
    getLanguageList() {
        return {
            'auto': 'Auto-detect',
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese (Simplified)',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'th': 'Thai',
            'vi': 'Vietnamese',
            'nl': 'Dutch',
            'sv': 'Swedish',
            'da': 'Danish',
            'no': 'Norwegian',
            'fi': 'Finnish',
            'pl': 'Polish',
            'cs': 'Czech',
            'hu': 'Hungarian',
            'ro': 'Romanian',
            'bg': 'Bulgarian',
            'hr': 'Croatian',
            'sk': 'Slovak',
            'sl': 'Slovenian',
            'et': 'Estonian',
            'lv': 'Latvian',
            'lt': 'Lithuanian',
            'uk': 'Ukrainian',
            'tr': 'Turkish',
            'he': 'Hebrew',
            'fa': 'Persian',
            'ur': 'Urdu',
            'bn': 'Bengali',
            'ta': 'Tamil',
            'te': 'Telugu',
            'ml': 'Malayalam',
            'kn': 'Kannada',
            'gu': 'Gujarati',
            'pa': 'Punjabi',
            'mr': 'Marathi',
            'ne': 'Nepali',
            'si': 'Sinhala',
            'my': 'Myanmar',
            'km': 'Khmer',
            'lo': 'Lao',
            'ka': 'Georgian',
            'am': 'Amharic',
            'sw': 'Swahili',
            'zu': 'Zulu',
            'af': 'Afrikaans'
        };
    }
    
    getLanguageName(code) {
        return this.languages[code] || code;
    }
    
    getLanguageCode(code) {
        const languageCodes = {
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-PT',
            'ru': 'ru-RU',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'zh': 'zh-CN',
            'ar': 'ar-SA',
            'hi': 'hi-IN',
            'th': 'th-TH',
            'vi': 'vi-VN',
            'nl': 'nl-NL',
            'sv': 'sv-SE',
            'da': 'da-DK',
            'no': 'no-NO',
            'fi': 'fi-FI',
            'pl': 'pl-PL',
            'cs': 'cs-CZ',
            'hu': 'hu-HU',
            'ro': 'ro-RO',
            'bg': 'bg-BG',
            'hr': 'hr-HR',
            'sk': 'sk-SK',
            'sl': 'sl-SI',
            'et': 'et-EE',
            'lv': 'lv-LV',
            'lt': 'lt-LT',
            'uk': 'uk-UA',
            'tr': 'tr-TR',
            'he': 'he-IL',
            'fa': 'fa-IR',
            'ur': 'ur-PK',
            'bn': 'bn-BD',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'ml': 'ml-IN',
            'kn': 'kn-IN',
            'gu': 'gu-IN',
            'pa': 'pa-IN',
            'mr': 'mr-IN',
            'ne': 'ne-NP',
            'si': 'si-LK',
            'my': 'my-MM',
            'km': 'km-KH',
            'lo': 'lo-LA',
            'ka': 'ka-GE',
            'am': 'am-ET',
            'sw': 'sw-TZ',
            'zu': 'zu-ZA',
            'af': 'af-ZA'
        };
        
        return languageCodes[code] || 'en-US';
    }
    
    getCommonPhrases() {
        return {
            greetings: [
                { en: 'Hello', es: 'Hola', fr: 'Bonjour', de: 'Hallo', it: 'Ciao', pt: 'Olá' },
                { en: 'Good morning', es: 'Buenos días', fr: 'Bonjour', de: 'Guten Morgen', it: 'Buongiorno', pt: 'Bom dia' },
                { en: 'Good afternoon', es: 'Buenas tardes', fr: 'Bon après-midi', de: 'Guten Tag', it: 'Buon pomeriggio', pt: 'Boa tarde' },
                { en: 'Good evening', es: 'Buenas noches', fr: 'Bonsoir', de: 'Guten Abend', it: 'Buonasera', pt: 'Boa noite' },
                { en: 'Goodbye', es: 'Adiós', fr: 'Au revoir', de: 'Auf Wiedersehen', it: 'Arrivederci', pt: 'Tchau' },
                { en: 'See you later', es: 'Hasta luego', fr: 'À bientôt', de: 'Bis später', it: 'A dopo', pt: 'Até logo' }
            ],
            travel: [
                { en: 'Where is the airport?', es: '¿Dónde está el aeropuerto?', fr: 'Où est l\\'aéroport?', de: 'Wo ist der Flughafen?', it: 'Dove è l\\'aeroporto?', pt: 'Onde fica o aeroporto?' },
                { en: 'How much does it cost?', es: '¿Cuánto cuesta?', fr: 'Combien ça coûte?', de: 'Wie viel kostet es?', it: 'Quanto costa?', pt: 'Quanto custa?' },
                { en: 'I need a taxi', es: 'Necesito un taxi', fr: 'J\\'ai besoin d\\'un taxi', de: 'Ich brauche ein Taxi', it: 'Ho bisogno di un taxi', pt: 'Preciso de um táxi' },
                { en: 'Where is the hotel?', es: '¿Dónde está el hotel?', fr: 'Où est l\\'hôtel?', de: 'Wo ist das Hotel?', it: 'Dove è l\\'hotel?', pt: 'Onde fica o hotel?' },
                { en: 'Do you speak English?', es: '¿Habla inglés?', fr: 'Parlez-vous anglais?', de: 'Sprechen Sie Englisch?', it: 'Parla inglese?', pt: 'Você fala inglês?' }
            ],
            food: [
                { en: 'I would like to order', es: 'Me gustaría pedir', fr: 'Je voudrais commander', de: 'Ich möchte bestellen', it: 'Vorrei ordinare', pt: 'Gostaria de pedir' },
                { en: 'The bill, please', es: 'La cuenta, por favor', fr: 'L\\'addition, s\\'il vous plaît', de: 'Die Rechnung, bitte', it: 'Il conto, per favore', pt: 'A conta, por favor' },
                { en: 'I am vegetarian', es: 'Soy vegetariano', fr: 'Je suis végétarien', de: 'Ich bin Vegetarier', it: 'Sono vegetariano', pt: 'Sou vegetariano' },
                { en: 'This is delicious', es: 'Esto está delicioso', fr: 'C\\'est délicieux', de: 'Das ist lecker', it: 'È delizioso', pt: 'Está delicioso' },
                { en: 'Where is the restaurant?', es: '¿Dónde está el restaurante?', fr: 'Où est le restaurant?', de: 'Wo ist das Restaurant?', it: 'Dove è il ristorante?', pt: 'Onde fica o restaurante?' }
            ],
            business: [
                { en: 'Nice to meet you', es: 'Mucho gusto', fr: 'Enchanté de vous rencontrer', de: 'Freut mich, Sie kennenzulernen', it: 'Piacere di conoscerti', pt: 'Prazer em conhecê-lo' },
                { en: 'I have a meeting', es: 'Tengo una reunión', fr: 'J\\'ai une réunion', de: 'Ich habe ein Meeting', it: 'Ho una riunione', pt: 'Tenho uma reunião' },
                { en: 'Can I have your business card?', es: '¿Puedo tener su tarjeta de presentación?', fr: 'Puis-je avoir votre carte de visite?', de: 'Kann ich Ihre Visitenkarte haben?', it: 'Posso avere il suo biglietto da visita?', pt: 'Posso ter seu cartão de visita?' },
                { en: 'When is the deadline?', es: '¿Cuándo es la fecha límite?', fr: 'Quelle est la date limite?', de: 'Wann ist der Termin?', it: 'Quando è la scadenza?', pt: 'Quando é o prazo?' }
            ],
            emergency: [
                { en: 'Help!', es: '¡Ayuda!', fr: 'Au secours!', de: 'Hilfe!', it: 'Aiuto!', pt: 'Socorro!' },
                { en: 'Call the police', es: 'Llame a la policía', fr: 'Appelez la police', de: 'Rufen Sie die Polizei', it: 'Chiama la polizia', pt: 'Chame a polícia' },
                { en: 'I need a doctor', es: 'Necesito un médico', fr: 'J\\'ai besoin d\\'un médecin', de: 'Ich brauche einen Arzt', it: 'Ho bisogno di un medico', pt: 'Preciso de um médico' },
                { en: 'Where is the hospital?', es: '¿Dónde está el hospital?', fr: 'Où est l\\'hôpital?', de: 'Wo ist das Krankenhaus?', it: 'Dove è l\\'ospedale?', pt: 'Onde fica o hospital?' },
                { en: 'I am lost', es: 'Estoy perdido', fr: 'Je suis perdu', de: 'Ich bin verloren', it: 'Sono perso', pt: 'Estou perdido' }
            ]
        };
    }
    
    showNotification(message) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    saveSettings() {
        const settings = {
            sourceLang: this.sourceLang.value,
            targetLang: this.targetLang.value,
            theme: document.documentElement.getAttribute('data-theme')
        };
        localStorage.setItem('translatorSettings', JSON.stringify(settings));
    }
    
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('translatorSettings') || '{}');
            
            if (settings.sourceLang) this.sourceLang.value = settings.sourceLang;
            if (settings.targetLang) this.targetLang.value = settings.targetLang;
            
            const theme = settings.theme || localStorage.getItem('translatorTheme') || 'light';
            document.documentElement.setAttribute('data-theme', theme);
            this.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
            
            // Load saved data
            const savedHistory = localStorage.getItem('translatorHistory');
            if (savedHistory) {
                this.translationHistory = JSON.parse(savedHistory);
                this.updateHistoryUI();
            }
            
            const savedFavorites = localStorage.getItem('translatorFavorites');
            if (savedFavorites) {
                this.favorites = JSON.parse(savedFavorites);
                this.updateFavoritesUI();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('translatorHistory', JSON.stringify(this.translationHistory));
            localStorage.setItem('translatorFavorites', JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }
}

// Initialize translation tool when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TranslationTool();
});