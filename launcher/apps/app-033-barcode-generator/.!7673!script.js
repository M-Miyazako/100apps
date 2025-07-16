class BarcodeGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.currentBarcode = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
        this.updateSliderValues();
    }
    
    initializeElements() {
        this.elements = {
            textInput: document.getElementById('textInput'),
            barcodeType: document.getElementById('barcodeType'),
            widthSlider: document.getElementById('width'),
            heightSlider: document.getElementById('height'),
            colorPicker: document.getElementById('color'),
            displayValueCheck: document.getElementById('displayValue'),
            generateBtn: document.getElementById('generateBtn'),
            clearBtn: document.getElementById('clearBtn'),
            downloadBtn: document.getElementById('downloadBtn'),
            copyBtn: document.getElementById('copyBtn'),
            canvas: document.getElementById('barcodeCanvas'),
            placeholder: document.getElementById('barcodePlaceholder'),
            widthValue: document.getElementById('widthValue'),
            heightValue: document.getElementById('heightValue'),
            historyList: document.getElementById('historyList')
        };
        
        this.canvas = this.elements.canvas;
        this.ctx = this.canvas.getContext('2d');
    }
    
    bindEvents() {
        this.elements.generateBtn.addEventListener('click', () => this.generateBarcode());
        this.elements.clearBtn.addEventListener('click', () => this.clearBarcode());
        this.elements.downloadBtn.addEventListener('click', () => this.downloadBarcode());
        this.elements.copyBtn.addEventListener('click', () => this.copyBarcodeToClipboard());
        
        this.elements.textInput.addEventListener('input', () => this.validateInput());
        this.elements.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateBarcode();
        });
        
        this.elements.widthSlider.addEventListener('input', () => this.updateSliderValues());
        this.elements.heightSlider.addEventListener('input', () => this.updateSliderValues());
        
        this.elements.barcodeType.addEventListener('change', () => this.validateInput());
    }
    
    updateSliderValues() {
        this.elements.widthValue.textContent = this.elements.widthSlider.value;
        this.elements.heightValue.textContent = this.elements.heightSlider.value;
    }
    
    validateInput() {
        const text = this.elements.textInput.value.trim();
        const type = this.elements.barcodeType.value;
        
        let isValid = true;
        let errorMessage = '';
        
        if (!text) {
            isValid = false;
