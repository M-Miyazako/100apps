class ApiTester {
    constructor() {
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        console.log('API Tester initialized');
        
        // 基本的なAPI テスト機能をシミュレート
        const testBtn = document.createElement('button');
        testBtn.textContent = 'API テスト実行';
        testBtn.onclick = () => {
            console.log('API テストを実行中...');
            alert('API テスト機能は実装中です');
        };
        document.body.appendChild(testBtn);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ApiTester();
});