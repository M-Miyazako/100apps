class FantasyGame {
    constructor() {
        this.player = {
            name: "勇者",
            level: 1,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            exp: 0,
            expToNext: 100,
            gold: 100,
            attack: 20,
            defense: 10,
            items: {
                "回復ポーション": 3,
                "魔法の薬": 1,
                "聖なる剣": 1
            }
        };
        
        this.enemies = [
            { 
                name: "スライム", 
                hp: 30, 
                maxHp: 30, 
                attack: 8, 
                defense: 2, 
                exp: 15, 
                gold: 10,
                image: "🟢"
            },
            { 
                name: "ゴブリン", 
                hp: 50, 
                maxHp: 50, 
                attack: 15, 
                defense: 5, 
                exp: 25, 
                gold: 20,
                image: "👺"
            },
            { 
                name: "オーク", 
                hp: 80, 
                maxHp: 80, 
                attack: 25, 
                defense: 8, 
                exp: 40, 
                gold: 35,
                image: "👹"
            },
            { 
                name: "ドラゴン", 
                hp: 200, 
                maxHp: 200, 
                attack: 50, 
                defense: 15, 
                exp: 100, 
                gold: 100,
                image: "🐉"
            }
        ];
        
        this.scenarios = {
            start: {
                title: "冒険の始まり",
                description: "あなたは小さな村の近くの森にいます。どこへ向かいますか？",
                choices: [
                    { text: "森の奥へ進む", action: "exploreForest" },
                    { text: "村へ戻る", action: "visitVillage" },
                    { text: "宝箱を探す", action: "findTreasure" }
                ]
            },
            exploreForest: {
                title: "深い森",
                description: "森の奥で怪しい気配を感じます...",
                choices: [
                    { text: "戦闘に備える", action: "randomEncounter" },
                    { text: "慎重に進む", action: "sneakAround" },
                    { text: "村に戻る", action: "visitVillage" }
                ]
            },
            visitVillage: {
                title: "平和な村",
                description: "村人たちが忙しく働いています。",
                choices: [
                    { text: "村人と話す", action: "talkVillager" },
                    { text: "宿屋で休む", action: "visitInn" },
                    { text: "商店で買い物", action: "visitShop" },
                    { text: "森へ戻る", action: "start" }
                ]
            },
            visitShop: {
                title: "雑貨屋",
                description: "店主が様々なアイテムを販売しています。",
                choices: [
                    { text: "回復ポーション (50G)", action: "buyPotion" },
                    { text: "魔法の薬 (80G)", action: "buyMagic" },
                    { text: "鉄の剣 (150G)", action: "buySword" },
                    { text: "村に戻る", action: "visitVillage" }
                ]
            }
        };
        
        this.currentEnemy = null;
        this.inBattle = false;
        this.gameState = 'playing';
        
        this.initializeElements();
        this.bindEvents();
        this.loadScenario('start');
        this.updateDisplay();
        this.loadGameData();
    }
    
    initializeElements() {
        this.elements = {
            // キャラクター情報
            characterName: document.getElementById('characterName'),
            hpBar: document.getElementById('hpBar'),
            hpText: document.getElementById('hpText'),
            mpBar: document.getElementById('mpBar'),
            mpText: document.getElementById('mpText'),
            level: document.getElementById('level'),
            exp: document.getElementById('exp'),
            gold: document.getElementById('gold'),
            itemList: document.getElementById('itemList'),
            
            // ストーリー表示
            storyDisplay: document.getElementById('storyDisplay'),
            choiceArea: document.getElementById('choiceArea'),
            
            // バトル画面
            battleArea: document.getElementById('battleArea'),
            enemyName: document.getElementById('enemyName'),
            enemyImage: document.getElementById('enemyImage'),
            enemyHpBar: document.getElementById('enemyHpBar'),
            enemyHpText: document.getElementById('enemyHpText'),
            battleLog: document.getElementById('battleLog'),
            
            // バトルボタン
            attackBtn: document.getElementById('attackBtn'),
            magicBtn: document.getElementById('magicBtn'),
            healBtn: document.getElementById('healBtn'),
            runBtn: document.getElementById('runBtn'),
            
            // ゲーム制御
            resetBtn: document.getElementById('resetBtn'),
            saveBtn: document.getElementById('saveBtn'),
            loadBtn: document.getElementById('loadBtn'),
            
            // ログ
            gameLog: document.getElementById('gameLog')
        };
    }
    
    bindEvents() {
        // バトルボタン
        this.elements.attackBtn.addEventListener('click', () => this.playerAttack());
        this.elements.magicBtn.addEventListener('click', () => this.playerMagic());
        this.elements.healBtn.addEventListener('click', () => this.playerHeal());
        this.elements.runBtn.addEventListener('click', () => this.runFromBattle());
        
        // ゲーム制御
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());
        this.elements.saveBtn.addEventListener('click', () => this.saveGame());
        this.elements.loadBtn.addEventListener('click', () => this.loadGame());
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (this.inBattle) {
                switch(e.key) {
                    case '1': this.playerAttack(); break;
                    case '2': this.playerMagic(); break;
                    case '3': this.playerHeal(); break;
                    case '4': this.runFromBattle(); break;
                }
            }
        });
    }
    
    loadScenario(scenarioKey) {
        const scenario = this.scenarios[scenarioKey];
        if (!scenario) return;
        
        this.elements.storyDisplay.innerHTML = `
            <h2>${scenario.title}</h2>
            <p>${scenario.description}</p>
        `;
        
        this.elements.choiceArea.innerHTML = '';
        
        if (scenario.choices) {
            scenario.choices.forEach(choice => {
                const choiceBtn = document.createElement('button');
                choiceBtn.className = 'choice-btn';
                choiceBtn.textContent = choice.text;
                choiceBtn.addEventListener('click', () => this.handleChoice(choice.action));
                this.elements.choiceArea.appendChild(choiceBtn);
            });
        }
        
        this.addToLog(`📖 ${scenario.title}: ${scenario.description}`);
    }
    
    handleChoice(action) {
        this.addToLog(`➡️ 選択: ${action}`);
        
        switch(action) {
            case 'randomEncounter':
                this.randomEncounter();
                break;
            case 'sneakAround':
                this.sneakAround();
                break;
            case 'findTreasure':
                this.findTreasure();
                break;
            case 'talkVillager':
                this.talkToVillager();
                break;
            case 'visitInn':
                this.visitInn();
                break;
            case 'buyPotion':
                this.buyItem('回復ポーション', 50);
                break;
            case 'buyMagic':
                this.buyItem('魔法の薬', 80);
                break;
            case 'buySword':
                this.buyWeapon('鉄の剣', 150, 10);
                break;
            default:
                this.loadScenario(action);
        }
    }
    
    randomEncounter() {
        const enemy = this.enemies[Math.floor(Math.random() * 3)]; // 最初の3体からランダム
        this.startBattle(enemy);
    }
    
    sneakAround() {
        const success = Math.random() > 0.3;
        if (success) {
            this.elements.storyDisplay.innerHTML = '<p>🤫 静かに森を通り抜けました。小さな宝箱を発見！</p>';
            this.player.gold += 20;
            this.addToLog('💰 20ゴールドを獲得');
        } else {
            this.elements.storyDisplay.innerHTML = '<p>😱 枝を踏んで音を立ててしまいました！モンスターに見つかった！</p>';
            this.randomEncounter();
        }
        
        if (success) {
            setTimeout(() => this.loadScenario('start'), 2000);
        }
    }
    
    findTreasure() {
        const treasures = ['金貨', '回復ポーション', '魔法の薬', '強敵出現'];
        const treasure = treasures[Math.floor(Math.random() * treasures.length)];
        
        if (treasure === '金貨') {
            const amount = Math.floor(Math.random() * 50) + 20;
            this.player.gold += amount;
            this.elements.storyDisplay.innerHTML = `<p>💰 宝箱から${amount}ゴールドを発見しました！</p>`;
            this.addToLog(`💰 ${amount}ゴールドを獲得`);
        } else if (treasure === '回復ポーション') {
            this.player.items['回復ポーション'] = (this.player.items['回復ポーション'] || 0) + 2;
            this.elements.storyDisplay.innerHTML = '<p>🧪 回復ポーションを2個見つけました！</p>';
            this.addToLog('🧪 回復ポーション×2を獲得');
        } else if (treasure === '魔法の薬') {
            this.player.items['魔法の薬'] = (this.player.items['魔法の薬'] || 0) + 1;
            this.elements.storyDisplay.innerHTML = '<p>✨ 魔法の薬を発見しました！</p>';
            this.addToLog('✨ 魔法の薬×1を獲得');
        } else {
            this.elements.storyDisplay.innerHTML = '<p>⚠️ 宝箱は罠でした！強力なモンスターが現れた！</p>';
            const enemy = this.enemies[3]; // ドラゴン
            this.startBattle(enemy);
            return;
        }
        
        this.updateDisplay();
        setTimeout(() => this.loadScenario('start'), 2000);
    }
    
    talkToVillager() {
        const messages = [
            '「森には危険なモンスターがいるから気をつけて！」',
            '「最近ドラゴンの目撃情報があるらしいよ...」',
            '「宿屋で休めば体力が回復するよ」',
            '「商店では便利なアイテムが買えるよ」',
            '「頑張って村を守ってくれ！」'
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.elements.storyDisplay.innerHTML = `<p>👨 村人: ${message}</p>`;
        this.addToLog(`👨 村人との会話: ${message}`);
        
        setTimeout(() => this.loadScenario('visitVillage'), 2000);
    }
    
    visitInn() {
        this.player.hp = this.player.maxHp;
        this.player.mp = this.player.maxMp;
        this.elements.storyDisplay.innerHTML = '<p>🏨 宿屋で休息を取りました。HP・MPが全回復しました！</p>';
        this.addToLog('🏨 宿屋で休息 - HP・MP全回復');
        this.updateDisplay();
        setTimeout(() => this.loadScenario('visitVillage'), 2000);
    }
    
    buyItem(item, price) {
        if (this.player.gold >= price) {
            this.player.gold -= price;
            this.player.items[item] = (this.player.items[item] || 0) + 1;
            this.elements.storyDisplay.innerHTML = `<p>💰 ${item}を購入しました！</p>`;
            this.addToLog(`💰 ${item}を${price}ゴールドで購入`);
        } else {
            this.elements.storyDisplay.innerHTML = '<p>😞 ゴールドが足りません...</p>';
            this.addToLog('😞 購入失敗: ゴールド不足');
        }
        this.updateDisplay();
        setTimeout(() => this.loadScenario('visitShop'), 2000);
    }
    
    buyWeapon(weapon, price, attackBonus) {
        if (this.player.gold >= price) {
            this.player.gold -= price;
            this.player.attack += attackBonus;
            this.player.items[weapon] = (this.player.items[weapon] || 0) + 1;
            this.elements.storyDisplay.innerHTML = `<p>⚔️ ${weapon}を購入しました！攻撃力が${attackBonus}上昇！</p>`;
            this.addToLog(`⚔️ ${weapon}を購入 - 攻撃力+${attackBonus}`);
        } else {
            this.elements.storyDisplay.innerHTML = '<p>😞 ゴールドが足りません...</p>';
            this.addToLog('😞 購入失敗: ゴールド不足');
        }
        this.updateDisplay();
        setTimeout(() => this.loadScenario('visitShop'), 2000);
    }
    
    startBattle(enemy) {
        this.currentEnemy = { ...enemy };
        this.inBattle = true;
        
        this.elements.battleArea.classList.add('active');
        this.elements.enemyName.textContent = enemy.name;
        this.elements.enemyImage.textContent = enemy.image;
        
        this.updateBattleDisplay();
        this.addBattleLog(`⚔️ ${enemy.name}が現れた！`);
        
        this.elements.storyDisplay.innerHTML = `<p>⚔️ ${enemy.name}との戦闘が始まりました！</p>`;
    }
    
    playerAttack() {
        if (!this.inBattle) return;
        
        const damage = Math.max(1, this.player.attack - this.currentEnemy.defense + Math.floor(Math.random() * 10) - 5);
        this.currentEnemy.hp -= damage;
        
        this.addBattleLog(`⚔️ ${this.player.name}の攻撃！ ${this.currentEnemy.name}に${damage}ダメージ！`);
        
        if (this.currentEnemy.hp <= 0) {
            this.winBattle();
        } else {
            this.enemyAttack();
        }
        
        this.updateBattleDisplay();
    }
    
    playerMagic() {
        if (!this.inBattle || this.player.mp < 20) {
            this.addBattleLog('💙 MPが足りません！');
            return;
        }
        
        this.player.mp -= 20;
        const damage = Math.floor(this.player.attack * 1.5) + Math.floor(Math.random() * 15);
        this.currentEnemy.hp -= damage;
        
        this.addBattleLog(`✨ ${this.player.name}の魔法攻撃！ ${this.currentEnemy.name}に${damage}ダメージ！`);
        
        if (this.currentEnemy.hp <= 0) {
            this.winBattle();
        } else {
            this.enemyAttack();
        }
        
        this.updateBattleDisplay();
    }
    
    playerHeal() {
        if (!this.inBattle || !this.player.items['回復ポーション'] || this.player.items['回復ポーション'] <= 0) {
            this.addBattleLog('🧪 回復ポーションがありません！');
            return;
        }
        
        this.player.items['回復ポーション']--;
        const healAmount = 50;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
        
        this.addBattleLog(`🧪 回復ポーションを使用！ ${healAmount}HP回復しました！`);
        
        this.enemyAttack();
        this.updateBattleDisplay();
    }
    
    runFromBattle() {
        if (!this.inBattle) return;
        
        const escapeChance = Math.random();
        if (escapeChance > 0.3) {
            this.addBattleLog('💨 戦闘から逃走しました！');
            this.endBattle();
            this.loadScenario('start');
        } else {
            this.addBattleLog('😰 逃げられませんでした！');
            this.enemyAttack();
        }
    }
    
    enemyAttack() {
        if (!this.inBattle) return;
        
        const damage = Math.max(1, this.currentEnemy.attack - this.player.defense + Math.floor(Math.random() * 8) - 4);
        this.player.hp -= damage;
        
        this.addBattleLog(`💥 ${this.currentEnemy.name}の攻撃！ ${damage}ダメージを受けた！`);
        
        if (this.player.hp <= 0) {
            this.gameOver();
        }
        
        this.updateBattleDisplay();
    }
    
    winBattle() {
        const exp = this.currentEnemy.exp;
        const gold = this.currentEnemy.gold;
        
        this.player.exp += exp;
        this.player.gold += gold;
        
        this.addBattleLog(`🎉 ${this.currentEnemy.name}を倒しました！`);
        this.addBattleLog(`📈 ${exp}EXP、💰 ${gold}ゴールドを獲得！`);
        
        this.checkLevelUp();
        this.endBattle();
        
        setTimeout(() => this.loadScenario('start'), 3000);
    }
    
    checkLevelUp() {
        if (this.player.exp >= this.player.expToNext) {
            this.player.level++;
            this.player.exp -= this.player.expToNext;
            this.player.expToNext = Math.floor(this.player.expToNext * 1.5);
            
            const hpIncrease = 20;
            const mpIncrease = 10;
            const attackIncrease = 5;
            
            this.player.maxHp += hpIncrease;
            this.player.maxMp += mpIncrease;
            this.player.attack += attackIncrease;
            this.player.hp = this.player.maxHp; // レベルアップで全回復
            this.player.mp = this.player.maxMp;
            
            this.addBattleLog(`🆙 レベルアップ！ Lv.${this.player.level}になりました！`);
            this.addBattleLog(`💪 HP+${hpIncrease}, MP+${mpIncrease}, 攻撃力+${attackIncrease}`);
        }
    }
    
    endBattle() {
        this.inBattle = false;
        this.currentEnemy = null;
        this.elements.battleArea.classList.remove('active');
        this.elements.battleLog.innerHTML = '';
    }
    
    gameOver() {
        this.addBattleLog('💀 ゲームオーバー...');
        this.endBattle();
        
        this.elements.storyDisplay.innerHTML = `
            <div class="game-over">
                <h2>💀 GAME OVER</h2>
                <p>あなたの冒険はここで終わりました...</p>
                <p>最終レベル: ${this.player.level}</p>
                <p>獲得ゴールド: ${this.player.gold}</p>
            </div>
        `;
        
        setTimeout(() => {
            if (confirm('ゲームをリセットしますか？')) {
                this.resetGame();
            }
        }, 2000);
    }
    
    updateDisplay() {
        // キャラクター情報更新
        this.elements.characterName.textContent = this.player.name;
        this.elements.level.textContent = this.player.level;
        this.elements.gold.textContent = this.player.gold;
        
        // HP/MPバー更新
        const hpPercent = (this.player.hp / this.player.maxHp) * 100;
        const mpPercent = (this.player.mp / this.player.maxMp) * 100;
        
        this.elements.hpBar.style.width = `${hpPercent}%`;
        this.elements.hpText.textContent = `${this.player.hp}/${this.player.maxHp}`;
        
        this.elements.mpBar.style.width = `${mpPercent}%`;
        this.elements.mpText.textContent = `${this.player.mp}/${this.player.maxMp}`;
        
        // 経験値バー更新
        const expPercent = (this.player.exp / this.player.expToNext) * 100;
        this.elements.exp.textContent = `${this.player.exp}/${this.player.expToNext} (${Math.floor(expPercent)}%)`;
        
        // アイテムリスト更新
        this.elements.itemList.innerHTML = '';
        for (const [item, count] of Object.entries(this.player.items)) {
            if (count > 0) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                itemDiv.textContent = `${item}: ${count}`;
                this.elements.itemList.appendChild(itemDiv);
            }
        }
    }
    
    updateBattleDisplay() {
        if (!this.currentEnemy) return;
        
        const enemyHpPercent = (this.currentEnemy.hp / this.currentEnemy.maxHp) * 100;
        this.elements.enemyHpBar.style.width = `${enemyHpPercent}%`;
        this.elements.enemyHpText.textContent = `${Math.max(0, this.currentEnemy.hp)}/${this.currentEnemy.maxHp}`;
        
        this.updateDisplay();
    }
    
    addBattleLog(message) {
        const logDiv = document.createElement('div');
        logDiv.textContent = message;
        this.elements.battleLog.appendChild(logDiv);
        this.elements.battleLog.scrollTop = this.elements.battleLog.scrollHeight;
        
        this.addToLog(message);
    }
    
    addToLog(message) {
        const logDiv = document.createElement('div');
        logDiv.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        this.elements.gameLog.appendChild(logDiv);
        this.elements.gameLog.scrollTop = this.elements.gameLog.scrollHeight;
        
        // ログを最新50件に制限
        while (this.elements.gameLog.children.length > 50) {
            this.elements.gameLog.removeChild(this.elements.gameLog.firstChild);
        }
    }
    
    saveGame() {
        const saveData = {
            player: this.player,
            gameState: this.gameState,
            timestamp: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('fantasyGameSave', JSON.stringify(saveData));
            this.addToLog('💾 ゲームを保存しました');
            alert('ゲームを保存しました！');
        } catch (error) {
            this.addToLog('❌ 保存に失敗しました');
            alert('保存に失敗しました');
        }
    }
    
    loadGame() {
        try {
            const saveData = localStorage.getItem('fantasyGameSave');
            if (saveData) {
                const data = JSON.parse(saveData);
                this.player = data.player;
                this.gameState = data.gameState;
                this.updateDisplay();
                this.loadScenario('start');
                this.addToLog('📁 ゲームをロードしました');
                alert('ゲームをロードしました！');
            } else {
                alert('セーブデータが見つかりません');
            }
        } catch (error) {
            this.addToLog('❌ ロードに失敗しました');
            alert('ロードに失敗しました');
        }
    }
    
    loadGameData() {
        // オートセーブからロード
        try {
            const autoSave = localStorage.getItem('fantasyGameAutoSave');
            if (autoSave) {
                const data = JSON.parse(autoSave);
                this.player = { ...this.player, ...data.player };
                this.updateDisplay();
            }
        } catch (error) {
            console.error('オートセーブのロードに失敗:', error);
        }
    }
    
    autoSave() {
        try {
            const saveData = {
                player: this.player,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('fantasyGameAutoSave', JSON.stringify(saveData));
        } catch (error) {
            console.error('オートセーブに失敗:', error);
        }
    }
    
    resetGame() {
        if (confirm('ゲームをリセットしますか？すべての進行状況が失われます。')) {
            this.player = {
                name: "勇者",
                level: 1,
                hp: 100,
                maxHp: 100,
                mp: 50,
                maxMp: 50,
                exp: 0,
                expToNext: 100,
                gold: 100,
                attack: 20,
                defense: 10,
                items: {
                    "回復ポーション": 3,
                    "魔法の薬": 1,
                    "聖なる剣": 1
                }
            };
            
            this.endBattle();
            this.loadScenario('start');
            this.updateDisplay();
            this.elements.gameLog.innerHTML = '';
            this.addToLog('🔄 ゲームをリセットしました');
            
            // オートセーブクリア
            localStorage.removeItem('fantasyGameAutoSave');
        }
    }
}

// アプリ初期化
document.addEventListener('DOMContentLoaded', () => {
    const game = new FantasyGame();
    
    // オートセーブ（5分ごと）
    setInterval(() => {
        game.autoSave();
    }, 300000);
});