// Morse Code Converter App
class MorseCodeConverter {
    constructor() {
        // Morse code dictionary
        this.morseCode = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
            'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
            'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
            'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
            'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
            '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
            '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
            "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
            '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
            '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
            ' ': '/'
        };

        // Reverse morse code dictionary for decoding
        this.reverseCode = {};
        for (let key in this.morseCode) {
            this.reverseCode[this.morseCode[key]] = key;
        }

        // Audio context and settings
        this.audioContext = null;
        this.isPlaying = false;
        this.currentPlayTimeout = null;
        this.playbackQueue = [];
        this.currentSpeed = 15; // Words per minute

        // Initialize the app
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateMorseReference();
        this.setupAudioContext();
        this.updateSpeedDisplay();
    }

    setupEventListeners() {
        // Text to morse conversion
        document.getElementById('text-to-morse').addEventListener('click', () => {
            this.convertTextToMorse();
        });

        // Morse to text conversion
        document.getElementById('morse-to-text').addEventListener('click', () => {
            this.convertMorseToText();
        });

        // Copy buttons
        document.getElementById('copy-morse').addEventListener('click', () => {
            this.copyToClipboard('morse-output');
        });

        document.getElementById('copy-text').addEventListener('click', () => {
            this.copyToClipboard('text-output');
        });

        // Audio controls
        document.getElementById('play-morse').addEventListener('click', () => {
            this.playMorseAudio();
        });

        document.getElementById('stop-morse').addEventListener('click', () => {
            this.stopMorseAudio();
        });

        // Speed control
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.currentSpeed = parseInt(e.target.value);
            this.updateSpeedDisplay();
        });

        // Real-time conversion on input
        document.getElementById('text-input').addEventListener('input', () => {
            this.convertTextToMorse();
        });

        document.getElementById('morse-input').addEventListener('input', () => {
            this.convertMorseToText();
        });

        // Clear outputs when inputs are cleared
        document.getElementById('text-input').addEventListener('input', (e) => {
            if (!e.target.value.trim()) {
                this.clearOutput('morse-output');
                this.clearOutput('visual-morse');
            }
        });

        document.getElementById('morse-input').addEventListener('input', (e) => {
            if (!e.target.value.trim()) {
                this.clearOutput('text-output');
            }
        });
    }

    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Audio context not supported:', e);
        }
    }

    convertTextToMorse() {
        const textInput = document.getElementById('text-input').value.toUpperCase();
        const morseOutput = document.getElementById('morse-output');
        const visualMorse = document.getElementById('visual-morse');

        if (!textInput.trim()) {
            this.clearOutput('morse-output');
            this.clearOutput('visual-morse');
            return;
        }

        let morseText = '';
        let visualElements = [];

        for (let i = 0; i < textInput.length; i++) {
            const char = textInput[i];
            const morse = this.morseCode[char];

            if (morse) {
                if (char === ' ') {
                    morseText += ' / ';
                    visualElements.push(this.createSpaceElement());
                } else {
                    morseText += morse + ' ';
                    visualElements.push(this.createMorseCharElement(char, morse));
                }
            } else if (char === ' ') {
                morseText += ' / ';
                visualElements.push(this.createSpaceElement());
            } else {
                // Unknown character, skip or replace with ?
                morseText += '? ';
                visualElements.push(this.createMorseCharElement(char, '?'));
            }
        }

        morseOutput.textContent = morseText.trim();
        visualMorse.innerHTML = '';
        visualElements.forEach(element => visualMorse.appendChild(element));
    }

    convertMorseToText() {
        const morseInput = document.getElementById('morse-input').value.trim();
        const textOutput = document.getElementById('text-output');

        if (!morseInput) {
            this.clearOutput('text-output');
            return;
        }

        // Split by multiple spaces or slashes to separate words
        const words = morseInput.split(/\s*\/\s*|\s{2,}/);
        let decodedText = '';

        for (let word of words) {
            const morseChars = word.trim().split(/\s+/);
            let decodedWord = '';

            for (let morseChar of morseChars) {
                if (morseChar.trim()) {
                    const char = this.reverseCode[morseChar.trim()];
                    if (char && char !== ' ') {
                        decodedWord += char;
                    } else {
                        decodedWord += '?';
                    }
                }
            }

            if (decodedWord) {
                decodedText += decodedWord + ' ';
            }
        }

        textOutput.textContent = decodedText.trim();
    }

    createMorseCharElement(char, morse) {
        const element = document.createElement('div');
        element.className = 'morse-char';
        element.innerHTML = `
            <span class="char">${char}</span>
            <span class="morse-symbol">${morse}</span>
        `;
        return element;
    }

    createSpaceElement() {
        const element = document.createElement('div');
        element.className = 'morse-space';
        return element;
    }

    async playMorseAudio() {
        if (!this.audioContext) {
            this.showMessage('Audio not supported in this browser');
            return;
        }

        if (this.isPlaying) {
            this.stopMorseAudio();
            return;
        }

        const morseText = document.getElementById('morse-output').textContent.trim();
        if (!morseText) {
            this.showMessage('No morse code to play');
            return;
        }

        this.isPlaying = true;
        this.updatePlayButton(true);

        try {
            await this.audioContext.resume();
            await this.playMorseSequence(morseText);
        } catch (error) {
            console.error('Audio playback error:', error);
            this.showMessage('Error playing audio');
        } finally {
            this.isPlaying = false;
            this.updatePlayButton(false);
        }
    }

    async playMorseSequence(morseText) {
        const sequence = morseText.split(' ');
        const dotDuration = this.calculateDotDuration();
        const dashDuration = dotDuration * 3;
        const elementSpace = dotDuration;
        const letterSpace = dotDuration * 3;
        const wordSpace = dotDuration * 7;

        for (let i = 0; i < sequence.length; i++) {
            if (!this.isPlaying) break;

            const element = sequence[i];
            
            if (element === '/') {
                // Word space
                await this.sleep(wordSpace);
            } else if (element === '') {
                // Letter space
                await this.sleep(letterSpace);
            } else {
                // Play morse character
                for (let j = 0; j < element.length; j++) {
                    if (!this.isPlaying) break;

                    const symbol = element[j];
                    if (symbol === '.') {
                        await this.playBeep(600, dotDuration);
                    } else if (symbol === '-') {
                        await this.playBeep(600, dashDuration);
                    }

                    if (j < element.length - 1) {
                        await this.sleep(elementSpace);
                    }
                }
                await this.sleep(letterSpace);
            }
        }
    }

    calculateDotDuration() {
        // Calculate dot duration based on WPM
        // Standard: PARIS method (50 dot units per word)
        const wpm = this.currentSpeed;
        return (60 / (wpm * 50)) * 1000; // in milliseconds
    }

    playBeep(frequency, duration) {
        return new Promise((resolve) => {
            if (!this.audioContext || !this.isPlaying) {
                resolve();
                return;
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);

            oscillator.onended = () => resolve();
        });
    }

    sleep(ms) {
        return new Promise(resolve => {
            this.currentPlayTimeout = setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    stopMorseAudio() {
        this.isPlaying = false;
        if (this.currentPlayTimeout) {
            clearTimeout(this.currentPlayTimeout);
            this.currentPlayTimeout = null;
        }
        this.updatePlayButton(false);
    }

    updatePlayButton(playing) {
        const playButton = document.getElementById('play-morse');
        const stopButton = document.getElementById('stop-morse');
        
        if (playing) {
            playButton.innerHTML = '<span class="play-icon">⏸</span> Pause';
            stopButton.disabled = false;
        } else {
            playButton.innerHTML = '<span class="play-icon">▶</span> Play Morse Code';
            stopButton.disabled = true;
        }
    }

    updateSpeedDisplay() {
        document.getElementById('speed-value').textContent = this.currentSpeed;
    }

    async copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        const text = element.textContent;

        if (!text.trim()) {
            this.showMessage('Nothing to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showMessage('Copied to clipboard!');
        } catch (error) {
            // Fallback for older browsers
            this.fallbackCopyText(text);
            this.showMessage('Copied to clipboard!');
        }
    }

    fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    showMessage(message) {
        // Create or update success message
        let messageElement = document.querySelector('.success-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'success-message';
            document.querySelector('.audio-section').appendChild(messageElement);
        }

        messageElement.textContent = message;
        messageElement.classList.add('show');

        // Hide message after 3 seconds
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    }

    clearOutput(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '';
            element.innerHTML = '';
        }
    }

    populateMorseReference() {
        const referenceGrid = document.getElementById('morse-reference-grid');
        
        // Create reference items for letters, numbers, and common punctuation
        const references = [];
        
        // Letters A-Z
        for (let i = 65; i <= 90; i++) {
            const char = String.fromCharCode(i);
            references.push({ char, morse: this.morseCode[char] });
        }
        
        // Numbers 0-9
        for (let i = 48; i <= 57; i++) {
            const char = String.fromCharCode(i);
            references.push({ char, morse: this.morseCode[char] });
        }
        
        // Common punctuation
        const punctuation = ['.', ',', '?', "'", '!', '/', '(', ')', '&', ':', ';', '=', '+', '-', '_', '"', '$', '@'];
        punctuation.forEach(char => {
            if (this.morseCode[char]) {
                references.push({ char, morse: this.morseCode[char] });
            }
        });

        // Create reference items
        references.forEach(({ char, morse }) => {
            const item = document.createElement('div');
            item.className = 'reference-item';
            item.innerHTML = `
                <div class="reference-char">${char}</div>
                <div class="reference-morse">${morse}</div>
            `;
            
            // Add click to play functionality
            item.addEventListener('click', () => {
                this.playCharacterMorse(morse);
            });
            
            referenceGrid.appendChild(item);
        });
    }

    async playCharacterMorse(morse) {
        if (!this.audioContext) return;

        try {
            await this.audioContext.resume();
            const dotDuration = this.calculateDotDuration();
            const dashDuration = dotDuration * 3;
            const elementSpace = dotDuration;

            for (let i = 0; i < morse.length; i++) {
                const symbol = morse[i];
                if (symbol === '.') {
                    await this.playBeep(600, dotDuration);
                } else if (symbol === '-') {
                    await this.playBeep(600, dashDuration);
                }

                if (i < morse.length - 1) {
                    await this.sleep(elementSpace);
                }
            }
        } catch (error) {
            console.error('Error playing character morse:', error);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MorseCodeConverter();
});

// Handle page visibility changes to stop audio when page is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.morseConverter) {
        window.morseConverter.stopMorseAudio();
    }
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MorseCodeConverter;
}