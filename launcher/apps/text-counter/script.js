class TextCounter {
    constructor() {
        this.textInput = document.getElementById('textInput');
        this.initializeElements();
        this.initializeEventListeners();
        this.updateStats();
    }

    initializeElements() {
        // Basic stats elements
        this.charCountEl = document.getElementById('charCount');
        this.charCountNoSpacesEl = document.getElementById('charCountNoSpaces');
        this.wordCountEl = document.getElementById('wordCount');
        this.paragraphCountEl = document.getElementById('paragraphCount');
        this.sentenceCountEl = document.getElementById('sentenceCount');
        this.readingTimeEl = document.getElementById('readingTime');

        // Additional stats elements
        this.avgWordsPerSentenceEl = document.getElementById('avgWordsPerSentence');
        this.avgCharsPerWordEl = document.getElementById('avgCharsPerWord');
        this.longestWordEl = document.getElementById('longestWord');
        this.mostFrequentWordEl = document.getElementById('mostFrequentWord');

        // Analysis elements
        this.charFrequencyEl = document.getElementById('charFrequency');
        this.wordFrequencyEl = document.getElementById('wordFrequency');
        this.wordLengthChartEl = document.getElementById('wordLengthChart');
        this.fleschScoreEl = document.getElementById('fleschScore');
        this.readingLevelEl = document.getElementById('readingLevel');
        this.complexityEl = document.getElementById('complexity');

        // Buttons
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.pasteBtn = document.getElementById('pasteBtn');

        // Tab elements
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabPanels = document.querySelectorAll('.tab-panel');
    }

    initializeEventListeners() {
        // Text input events
        this.textInput.addEventListener('input', () => this.updateStats());
        this.textInput.addEventListener('paste', () => {
            setTimeout(() => this.updateStats(), 10);
        });

        // Button events
        this.clearBtn.addEventListener('click', () => this.clearText());
        this.copyBtn.addEventListener('click', () => this.copyText());
        this.pasteBtn.addEventListener('click', () => this.pasteText());

        // Tab events
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });
    }

    updateStats() {
        const text = this.textInput.value;
        const stats = this.analyzeText(text);

        // Update basic stats
        this.charCountEl.textContent = stats.charCount;
        this.charCountNoSpacesEl.textContent = stats.charCountNoSpaces;
        this.wordCountEl.textContent = stats.wordCount;
        this.paragraphCountEl.textContent = stats.paragraphCount;
        this.sentenceCountEl.textContent = stats.sentenceCount;
        this.readingTimeEl.textContent = stats.readingTime;

        // Update additional stats
        this.avgWordsPerSentenceEl.textContent = stats.avgWordsPerSentence;
        this.avgCharsPerWordEl.textContent = stats.avgCharsPerWord;
        this.longestWordEl.textContent = stats.longestWord;
        this.mostFrequentWordEl.textContent = stats.mostFrequentWord;

        // Update analysis sections
        this.updateCharFrequency(stats.charFrequency);
        this.updateWordFrequency(stats.wordFrequency);
        this.updateWordLengthChart(stats.wordLengthDistribution);
        this.updateReadabilityStats(stats.readability);
    }

    analyzeText(text) {
        const stats = {
            charCount: text.length,
            charCountNoSpaces: text.replace(/\s/g, '').length,
            wordCount: 0,
            paragraphCount: 0,
            sentenceCount: 0,
            readingTime: 0,
            avgWordsPerSentence: 0,
            avgCharsPerWord: 0,
            longestWord: '-',
            mostFrequentWord: '-',
            charFrequency: {},
            wordFrequency: {},
            wordLengthDistribution: {},
            readability: {}
        };

        if (text.trim().length === 0) {
            return stats;
        }

        // Word analysis
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        stats.wordCount = words.length;

        // Paragraph analysis
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        stats.paragraphCount = paragraphs.length || (text.trim().length > 0 ? 1 : 0);

        // Sentence analysis
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        stats.sentenceCount = sentences.length;

        // Reading time (average 200 words per minute)
        stats.readingTime = Math.ceil(stats.wordCount / 200);

        // Average calculations
        stats.avgWordsPerSentence = stats.sentenceCount > 0 ? 
            Math.round((stats.wordCount / stats.sentenceCount) * 10) / 10 : 0;
        stats.avgCharsPerWord = stats.wordCount > 0 ? 
            Math.round((stats.charCountNoSpaces / stats.wordCount) * 10) / 10 : 0;

        // Longest word
        if (words.length > 0) {
            stats.longestWord = words.reduce((longest, word) => 
                word.length > longest.length ? word : longest);
        }

        // Character frequency
        for (const char of text) {
            if (char !== ' ' && char !== '\n' && char !== '\t') {
                stats.charFrequency[char] = (stats.charFrequency[char] || 0) + 1;
            }
        }

        // Word frequency
        for (const word of words) {
            if (word.length > 2) { // Only count words longer than 2 characters
                stats.wordFrequency[word] = (stats.wordFrequency[word] || 0) + 1;
            }
        }

        // Most frequent word
        if (Object.keys(stats.wordFrequency).length > 0) {
            stats.mostFrequentWord = Object.keys(stats.wordFrequency).reduce((a, b) =>
                stats.wordFrequency[a] > stats.wordFrequency[b] ? a : b);
        }

        // Word length distribution
        for (const word of words) {
            const length = word.length;
            stats.wordLengthDistribution[length] = (stats.wordLengthDistribution[length] || 0) + 1;
        }

        // Readability analysis
        stats.readability = this.calculateReadability(text, stats);

        return stats;
    }

    calculateReadability(text, stats) {
        const readability = {
            fleschScore: 0,
            readingLevel: 'Unknown',
            complexity: 'Unknown'
        };

        if (stats.wordCount === 0 || stats.sentenceCount === 0) {
            return readability;
        }

        // Calculate average sentence length and syllable count
        const avgSentenceLength = stats.wordCount / stats.sentenceCount;
        const syllableCount = this.countSyllables(text);
        const avgSyllablesPerWord = syllableCount / stats.wordCount;

        // Flesch Reading Ease Score
        readability.fleschScore = Math.round(
            206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
        );

        // Determine reading level based on Flesch score
        if (readability.fleschScore >= 90) {
            readability.readingLevel = 'Very Easy';
            readability.complexity = 'Elementary';
        } else if (readability.fleschScore >= 80) {
            readability.readingLevel = 'Easy';
            readability.complexity = 'Middle School';
        } else if (readability.fleschScore >= 70) {
            readability.readingLevel = 'Fairly Easy';
            readability.complexity = 'High School';
        } else if (readability.fleschScore >= 60) {
            readability.readingLevel = 'Standard';
            readability.complexity = 'College';
        } else if (readability.fleschScore >= 50) {
            readability.readingLevel = 'Fairly Difficult';
            readability.complexity = 'Graduate';
        } else if (readability.fleschScore >= 30) {
            readability.readingLevel = 'Difficult';
            readability.complexity = 'Graduate+';
        } else {
            readability.readingLevel = 'Very Difficult';
            readability.complexity = 'Professional';
        }

        return readability;
    }

    countSyllables(text) {
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        let syllableCount = 0;

        for (const word of words) {
            // Simple syllable counting algorithm
            const vowels = word.match(/[aeiouy]+/g);
            if (vowels) {
                syllableCount += vowels.length;
                // Adjust for silent 'e' at the end
                if (word.endsWith('e')) {
                    syllableCount--;
                }
            }
            // Every word has at least one syllable
            if (syllableCount === 0) {
                syllableCount = 1;
            }
        }

        return syllableCount;
    }

    updateCharFrequency(charFrequency) {
        const sorted = Object.entries(charFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20); // Show top 20 characters

        this.charFrequencyEl.innerHTML = '';

        if (sorted.length === 0) {
            this.charFrequencyEl.innerHTML = '<div class="empty-state">No characters to analyze</div>';
            return;
        }

        sorted.forEach(([char, count]) => {
            const item = document.createElement('div');
            item.className = 'char-freq-item';
            item.innerHTML = `
                <span class="char-freq-char">${char}</span>
                <span class="char-freq-count">${count}</span>
            `;
            this.charFrequencyEl.appendChild(item);
        });
    }

    updateWordFrequency(wordFrequency) {
        const sorted = Object.entries(wordFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Show top 10 words

        this.wordFrequencyEl.innerHTML = '';

        if (sorted.length === 0) {
            this.wordFrequencyEl.innerHTML = '<div class="empty-state">No words to analyze</div>';
            return;
        }

        sorted.forEach(([word, count]) => {
            const item = document.createElement('div');
            item.className = 'word-freq-item';
            item.innerHTML = `
                <span class="word-freq-word">${word}</span>
                <span class="word-freq-count">${count}</span>
            `;
            this.wordFrequencyEl.appendChild(item);
        });
    }

    updateWordLengthChart(wordLengthDistribution) {
        const sorted = Object.entries(wordLengthDistribution)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .slice(0, 15); // Show up to 15 different lengths

        this.wordLengthChartEl.innerHTML = '';

        if (sorted.length === 0) {
            this.wordLengthChartEl.innerHTML = '<div class="empty-state">No words to analyze</div>';
            return;
        }

        const maxCount = Math.max(...sorted.map(([_, count]) => count));

        sorted.forEach(([length, count]) => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${(count / maxCount) * 100}%`;
            bar.innerHTML = `
                <span class="chart-bar-value">${count}</span>
                <span class="chart-bar-label">${length}</span>
            `;
            this.wordLengthChartEl.appendChild(bar);
        });
    }

    updateReadabilityStats(readability) {
        this.fleschScoreEl.textContent = readability.fleschScore || '-';
        this.readingLevelEl.textContent = readability.readingLevel || '-';
        this.complexityEl.textContent = readability.complexity || '-';
    }

    clearText() {
        this.textInput.value = '';
        this.updateStats();
        this.textInput.focus();
    }

    async copyText() {
        try {
            await navigator.clipboard.writeText(this.textInput.value);
            this.showNotification('Text copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            this.showNotification('Failed to copy text');
        }
    }

    async pasteText() {
        try {
            const text = await navigator.clipboard.readText();
            this.textInput.value = text;
            this.updateStats();
            this.textInput.focus();
            this.showNotification('Text pasted from clipboard!');
        } catch (err) {
            console.error('Failed to paste text: ', err);
            this.showNotification('Failed to paste text');
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        this.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });

        // Update tab panels
        this.tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-tab`);
        });
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-size: 0.9rem;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 300);
        }, 3000);
    }
}

// Initialize the text counter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TextCounter();
});

// Add some sample text for demonstration
document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const sampleText = `Welcome to the Text Counter app! This tool provides comprehensive analysis of your text including character count, word count, paragraph count, sentence count, and reading time estimation.

The app also features advanced analysis capabilities such as character frequency analysis, word frequency analysis, word length distribution, and readability scoring using the Flesch Reading Ease formula.

Try typing or pasting your text to see real-time statistics and analysis. The interface is designed to be clean, responsive, and utility-focused for the best user experience.`;

    // Only add sample text if the input is empty
    if (textInput.value.trim() === '') {
        setTimeout(() => {
            textInput.value = sampleText;
            textInput.dispatchEvent(new Event('input'));
        }, 100);
    }
});