class AdventureGame {
    constructor() {
        this.player = {
            x: 235,
            y: 235,
            health: 100,
            maxHealth: 100,
            level: 1,
            experience: 0,
            gold: 50,
            inventory: ["体力薬", "魔法の鍵"],
            position: "entrance"
        };
        
        this.gameState = {
            currentLocation: "entrance",
            obstacles: [],
            treasures: [],
            enemies: [],
            itemsFound: 0,
            enemiesDefeated: 0,
            exploredAreas: new Set(['entrance']),
            gameWon: false,
            turnCount: 0
        };
        
        this.locations = {
            entrance: {
                name: "洞窟の入口",
                description: "薄暗い洞窟の入口です。冒険の始まりの場所。",
                color: "#8B4513"
            },
            corridor: {
                name: "石の廊下",
                description: "古い石で作られた長い廊下。壁には古代の文字が刻まれています。",
                color: "#696969"
            },
            chamber: {
                name: "宝物の間",
                description: "きらめく宝物で満たされた豪華な部屋。",
                color: "#FFD700"
            },
            trap: {
                name: "罠の部屋",
                description: "危険な罠が仕掛けられた部屋。慎重に進む必要があります。",
                color: "#8B0000"
            },
            secret: {
                name: "秘密の部屋",
                description: "隠された秘密の部屋。古代の力が眠っています。",
                color: "#4B0082"
            },
            boss: {
                name: "魔王の間",
                description: "強大な魔王が待ち受ける最後の戦いの場。",
                color: "#2F4F4F"
            }
        };
        
        this.enemies = [
            { name: "スケルトン", hp: 40, attack: 15, defense: 5, exp: 20, gold: 15, icon: "💀" },
            { name: "ゴブリン", hp: 30, attack: 12, defense: 3, exp: 15, gold: 10, icon: "👺" },
            { name: "オーク", hp: 60, attack: 20, defense: 8, exp: 30, gold: 25, icon: "👹" },
            { name: "ドラゴン", hp: 150, attack: 40, defense: 15, exp: 100, gold: 100, icon: "🐉" }
        ];
        
        this.items = {
            "体力薬": { effect: "heal", power: 50, description: "HPを50回復" },
            "魔法の鍵": { effect: "unlock", power: 1, description: "扉を開ける" },
            "古代のコイン": { effect: "currency", power: 20, description: "価値のある古代のコイン" },
            "魔法の巻物": { effect: "magic", power: 30, description: "魔法攻撃ができる" },
            "鋼の剣": { effect: "weapon", power: 15, description: "攻撃力を上げる" },
            "守護の盾": { effect: "shield", power: 10, description: "防御力を上げる" }
        };
        
        this.currentEnemy = null;
        this.inBattle = false;
        
        this.initializeElements();
        this.bindEvents();
        this.generateMap();
        this.updateDisplay();
        this.loadGameData();
    }
    
    initializeElements() {
        this.elements = {
            player: document.getElementById('player'),
            gameMap: document.getElementById('gameMap'),
            locationInfo: document.getElementById('locationInfo'),
            inventory: document.getElementById('inventory'),
            messageLog: document.getElementById('messageLog'),
            healthFill: document.getElementById('healthFill'),
            healthText: document.getElementById('healthText'),
            itemCount: document.getElementById('itemCount'),
            exploration: document.getElementById('exploration'),
            level: document.getElementById('level'),
            experience: document.getElementById('experience'),
            gold: document.getElementById('gold'),
            
            // 移動ボタン
            moveUp: document.getElementById('moveUp'),
            moveDown: document.getElementById('moveDown'),
            moveLeft: document.getElementById('moveLeft'),
            moveRight: document.getElementById('moveRight'),
            
            // アクションボタン
            searchBtn: document.getElementById('searchBtn'),
            useItemBtn: document.getElementById('useItemBtn'),
            saveBtn: document.getElementById('saveBtn'),
            loadBtn: document.getElementById('loadBtn'),
            resetBtn: document.getElementById('resetBtn'),
            
            // バトル関連
            battleArea: document.getElementById('battleArea'),
            enemyInfo: document.getElementById('enemyInfo'),
            battleLog: document.getElementById('battleLog'),
            attackBtn: document.getElementById('attackBtn'),
            magicBtn: document.getElementById('magicBtn'),
            runBtn: document.getElementById('runBtn'),
            
            // 統計
            stats: document.getElementById('stats')
        };
    }
    
    bindEvents() {
        // 移動ボタン
        this.elements.moveUp.addEventListener('click', () => this.movePlayer(0, -50));
        this.elements.moveDown.addEventListener('click', () => this.movePlayer(0, 50));
        this.elements.moveLeft.addEventListener('click', () => this.movePlayer(-50, 0));
        this.elements.moveRight.addEventListener('click', () => this.movePlayer(50, 0));
        
        // アクションボタン
        this.elements.searchBtn.addEventListener('click', () => this.searchArea());
        this.elements.useItemBtn.addEventListener('click', () => this.useItem());
        this.elements.saveBtn.addEventListener('click', () => this.saveGame());
        this.elements.loadBtn.addEventListener('click', () => this.loadGame());
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());
        
        // バトルボタン
        this.elements.attackBtn.addEventListener('click', () => this.attack());
        this.elements.magicBtn.addEventListener('click', () => this.useMagic());
        this.elements.runBtn.addEventListener('click', () => this.runFromBattle());
        
        // キーボード操作
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleKeyPress(e) {
        if (this.inBattle) {
            switch(e.key) {
                case '1': this.attack(); break;
                case '2': this.useMagic(); break;
                case '3': this.runFromBattle(); break;
            }
            return;
        }
        
        switch(e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.movePlayer(0, -50);
                break;
            case 's':
            case 'arrowdown':
                this.movePlayer(0, 50);
                break;
            case 'a':
            case 'arrowleft':
                this.movePlayer(-50, 0);
                break;
            case 'd':
            case 'arrowright':
                this.movePlayer(50, 0);
                break;
            case ' ':
                e.preventDefault();
                this.searchArea();
                break;
            case 'e':
                this.useItem();
                break;
        }
    }
    
    generateMap() {
        // 障害物を生成
        this.createObstacle(100, 100);
        this.createObstacle(300, 150);
        this.createObstacle(150, 350);
        this.createObstacle(400, 300);
        this.createObstacle(250, 250);
        
        // 宝物を配置
        this.createTreasure(50, 50, "古代のコイン");
        this.createTreasure(450, 100, "魔法の巻物");
        this.createTreasure(100, 450, "体力薬");
        this.createTreasure(400, 450, "鋼の剣");
        this.createTreasure(250, 200, "守護の盾");
        
        // 敵を配置
        this.createEnemy(200, 150, 0); // スケルトン
        this.createEnemy(350, 250, 1); // ゴブリン
        this.createEnemy(150, 300, 2); // オーク
    }
    
    createObstacle(x, y) {
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        obstacle.style.left = x + 'px';
        obstacle.style.top = y + 'px';
        obstacle.textContent = '🗿';
        this.elements.gameMap.appendChild(obstacle);
        
        this.gameState.obstacles.push({ x, y, width: 40, height: 40 });
    }
    
    createTreasure(x, y, type) {
        const treasure = document.createElement('div');
        treasure.className = 'treasure';
        treasure.style.left = x + 'px';
        treasure.style.top = y + 'px';
        treasure.textContent = '💎';
        treasure.dataset.type = type;
        treasure.addEventListener('click', () => this.collectTreasure(treasure, type));
        this.elements.gameMap.appendChild(treasure);
        
        this.gameState.treasures.push({ x, y, type, collected: false, element: treasure });
    }
    
    createEnemy(x, y, enemyIndex) {
        const enemy = document.createElement('div');
        enemy.className = 'enemy';
        enemy.style.left = x + 'px';
        enemy.style.top = y + 'px';
        enemy.textContent = this.enemies[enemyIndex].icon;
        enemy.dataset.index = enemyIndex;
        enemy.addEventListener('click', () => this.startBattle(enemyIndex));
        this.elements.gameMap.appendChild(enemy);
        
        this.gameState.enemies.push({ 
            x, y, 
            enemyIndex, 
            defeated: false, 
            element: enemy,
            data: { ...this.enemies[enemyIndex] }
        });
    }
    
    movePlayer(dx, dy) {
        if (this.inBattle) return;
        
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        // マップ境界チェック
        if (newX < 0 || newX > 470 || newY < 0 || newY > 470) {
            this.addMessage("🚫 マップの境界です。これ以上進めません。");
            return;
        }
        
        // 障害物との衝突チェック
        const playerRect = { x: newX, y: newY, width: 30, height: 30 };
        for (const obstacle of this.gameState.obstacles) {
            if (this.checkCollision(playerRect, obstacle)) {
                this.addMessage("🗿 障害物があります。別の道を探してください。");
                return;
            }
        }
        
        // プレイヤー位置更新
        this.player.x = newX;
        this.player.y = newY;
        this.elements.player.style.left = newX + 'px';
        this.elements.player.style.top = newY + 'px';
        
        this.gameState.turnCount++;
        
        // 場所の更新
        this.updateLocation();
        
        // 宝物との衝突チェック
        this.checkTreasureCollision();
        
        // 敵との衝突チェック
        this.checkEnemyCollision();
        
        // ランダムイベント
        if (Math.random() < 0.1) {
            this.randomEvent();
        }
        
        this.updateDisplay();
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    checkTreasureCollision() {
        const playerRect = { x: this.player.x, y: this.player.y, width: 30, height: 30 };
        
        for (const treasure of this.gameState.treasures) {
            if (!treasure.collected) {
                const treasureRect = { x: treasure.x, y: treasure.y, width: 20, height: 20 };
                if (this.checkCollision(playerRect, treasureRect)) {
                    this.collectTreasure(treasure.element, treasure.type);
                    break;
                }
            }
        }
    }
    
    checkEnemyCollision() {
        const playerRect = { x: this.player.x, y: this.player.y, width: 30, height: 30 };
        
        for (const enemy of this.gameState.enemies) {
            if (!enemy.defeated) {
                const enemyRect = { x: enemy.x, y: enemy.y, width: 30, height: 30 };
                if (this.checkCollision(playerRect, enemyRect)) {
                    this.startBattle(enemy.enemyIndex);
                    break;
                }
            }
        }
    }
    
    collectTreasure(element, type) {
        const treasure = this.gameState.treasures.find(t => t.type === type);
        if (treasure && !treasure.collected) {
            treasure.collected = true;
            element.style.display = 'none';
            
            this.player.inventory.push(type);
            this.gameState.itemsFound++;
            
            this.addMessage(`💎 ${type}を発見しました！`);
            this.updateDisplay();
        }
    }
    
    updateLocation() {
        let newLocation = "entrance";
        
        // 位置に基づいて現在の場所を決定
        if (this.player.x < 100 && this.player.y < 100) {
            newLocation = "entrance";
        } else if (this.player.x > 400 && this.player.y < 100) {
            newLocation = "corridor";
        } else if (this.player.x < 100 && this.player.y > 400) {
            newLocation = "chamber";
        } else if (this.player.x > 400 && this.player.y > 400) {
            newLocation = "trap";
        } else if (this.player.x > 200 && this.player.x < 300 && this.player.y > 200 && this.player.y < 300) {
            newLocation = "secret";
        } else if (this.player.x > 350 && this.player.y > 300) {
            newLocation = "boss";
        }
        
        if (newLocation !== this.gameState.currentLocation) {
            this.gameState.currentLocation = newLocation;
            this.gameState.exploredAreas.add(newLocation);
            
            const location = this.locations[newLocation];
            this.elements.locationInfo.innerHTML = `
                <h3>📍 ${location.name}</h3>
                <p>${location.description}</p>
            `;
            
            // 背景色を変更
            this.elements.gameMap.style.backgroundColor = location.color + '20';
            
            this.addMessage(`📍 ${location.name}に到着しました`);
            
            // 特別な場所での特殊イベント
            this.handleLocationEvent(newLocation);
        }
    }
    
    handleLocationEvent(location) {
        switch(location) {
            case 'trap':
                if (Math.random() < 0.5) {
                    const damage = Math.floor(Math.random() * 20) + 10;
                    this.player.health -= damage;
                    this.addMessage(`⚡ 罠が発動！${damage}ダメージを受けました！`);
                    if (this.player.health <= 0) {
                        this.gameOver();
                    }
                }
                break;
            case 'secret':
                this.addMessage("✨ 秘密の部屋で古代の知識を得ました！経験値+50");
                this.player.experience += 50;
                this.checkLevelUp();
                break;
            case 'boss':
                if (this.gameState.enemiesDefeated >= 3) {
                    this.addMessage("👑 魔王の間です。最終ボスとの戦いが待っています！");
                    this.startBattle(3); // ドラゴン（ボス）
                } else {
                    this.addMessage("🚪 まだ魔王と戦う準備ができていません。もっと敵を倒してから来てください。");
                }
                break;
        }
    }
    
    searchArea() {
        if (this.inBattle) return;
        
        const searchResults = [
            "🔍 何も見つかりませんでした...",
            "🪙 小さなコインを発見しました！",
            "🧪 体力薬を発見しました！",
            "📜 古い巻物の破片を発見しました。",
            "💎 小さな宝石を発見しました！",
            "⚡ 罠があります！注意してください。",
            "🗝️ 古い鍵を発見しました！"
        ];
        
        const result = searchResults[Math.floor(Math.random() * searchResults.length)];
        this.addMessage(result);
        
        // アイテム発見の確率
        if (Math.random() < 0.3) {
            const items = Object.keys(this.items);
            const foundItem = items[Math.floor(Math.random() * items.length)];
            this.player.inventory.push(foundItem);
            this.addMessage(`🎉 ${foundItem}を発見しました！`);
        }
        
        // 体力回復の確率
        if (Math.random() < 0.2) {
            this.player.health = Math.min(this.player.maxHealth, this.player.health + 10);
            this.addMessage("💚 少し体力が回復しました。");
        }
        
        this.updateDisplay();
    }
    
    useItem() {
        if (this.player.inventory.length === 0) {
            this.addMessage("🎒 使用できるアイテムがありません。");
            return;
        }
        
        const item = this.player.inventory[0];
        const itemData = this.items[item];
        
        if (!itemData) {
            this.addMessage(`❓ ${item}は使用できません。`);
            return;
        }
        
        switch(itemData.effect) {
            case 'heal':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + itemData.power);
                this.player.inventory.shift();
                this.addMessage(`💚 ${item}を使用しました。HP+${itemData.power}`);
                break;
            case 'magic':
                if (this.inBattle && this.currentEnemy) {
                    const damage = itemData.power;
                    this.currentEnemy.hp -= damage;
                    this.player.inventory.shift();
                    this.addBattleLog(`✨ ${item}を使用！${damage}ダメージ！`);
                    this.checkBattleEnd();
                } else {
                    this.addMessage("⚔️ 戦闘中でないと使用できません。");
                }
                break;
            default:
                this.addMessage(`🔍 ${item}: ${itemData.description}`);
        }
        
        this.updateDisplay();
    }
    
    startBattle(enemyIndex) {
        if (this.inBattle) return;
        
        const enemyData = this.enemies[enemyIndex];
        this.currentEnemy = { ...enemyData };
        this.inBattle = true;
        
        this.elements.battleArea.style.display = 'block';
        this.elements.enemyInfo.innerHTML = `
            <div class="enemy-display">
                <div class="enemy-icon">${this.currentEnemy.icon}</div>
                <div class="enemy-name">${this.currentEnemy.name}</div>
                <div class="enemy-hp">HP: ${this.currentEnemy.hp}/${enemyData.hp}</div>
            </div>
        `;
        
        this.addBattleLog(`⚔️ ${this.currentEnemy.name}との戦闘開始！`);
        this.addMessage(`⚔️ ${this.currentEnemy.name}が現れました！`);
    }
    
    attack() {
        if (!this.inBattle || !this.currentEnemy) return;
        
        const playerDamage = Math.max(1, (this.player.level * 10 + 10) - this.currentEnemy.defense + Math.floor(Math.random() * 10));
        this.currentEnemy.hp -= playerDamage;
        
        this.addBattleLog(`⚔️ あなたの攻撃！${playerDamage}ダメージ！`);
        
        if (this.currentEnemy.hp <= 0) {
            this.winBattle();
        } else {
            this.enemyAttack();
        }
        
        this.updateBattleDisplay();
    }
    
    useMagic() {
        if (!this.inBattle || !this.currentEnemy) return;
        
        const magicItems = this.player.inventory.filter(item => this.items[item] && this.items[item].effect === 'magic');
        if (magicItems.length === 0) {
            this.addBattleLog("✨ 魔法アイテムがありません！");
            return;
        }
        
        this.useItem();
    }
    
    runFromBattle() {
        if (!this.inBattle) return;
        
        const escapeChance = Math.random();
        if (escapeChance > 0.3) {
            this.addBattleLog("💨 戦闘から逃走しました！");
            this.endBattle();
        } else {
            this.addBattleLog("😰 逃げられませんでした！");
            this.enemyAttack();
        }
    }
    
    enemyAttack() {
        if (!this.currentEnemy) return;
        
        const enemyDamage = Math.max(1, this.currentEnemy.attack - Math.floor(this.player.level / 2) + Math.floor(Math.random() * 8));
        this.player.health -= enemyDamage;
        
        this.addBattleLog(`💥 ${this.currentEnemy.name}の攻撃！${enemyDamage}ダメージ！`);
        
        if (this.player.health <= 0) {
            this.gameOver();
        }
        
        this.updateBattleDisplay();
    }
    
    winBattle() {
        const exp = this.currentEnemy.exp;
        const gold = this.currentEnemy.gold;
        
        this.player.experience += exp;
        this.player.gold += gold;
        this.gameState.enemiesDefeated++;
        
        this.addBattleLog(`🎉 ${this.currentEnemy.name}を倒しました！`);
        this.addBattleLog(`📈 経験値+${exp}、💰 ゴールド+${gold}`);
        
        // 敵をマップから削除
        const enemy = this.gameState.enemies.find(e => e.data.name === this.currentEnemy.name);
        if (enemy) {
            enemy.defeated = true;
            enemy.element.style.display = 'none';
        }
        
        this.checkLevelUp();
        this.endBattle();
        
        // ボス戦勝利チェック
        if (this.currentEnemy.name === "ドラゴン") {
            this.gameWin();
        }
    }
    
    checkLevelUp() {
        const expNeeded = this.player.level * 100;
        if (this.player.experience >= expNeeded) {
            this.player.level++;
            this.player.experience -= expNeeded;
            this.player.maxHealth += 20;
            this.player.health = this.player.maxHealth; // レベルアップで全回復
            
            this.addMessage(`🆙 レベルアップ！Lv.${this.player.level}になりました！`);
            this.addMessage(`💪 最大HP+20、全回復しました！`);
        }
    }
    
    endBattle() {
        this.inBattle = false;
        this.currentEnemy = null;
        this.elements.battleArea.style.display = 'none';
        this.elements.battleLog.innerHTML = '';
    }
    
    checkBattleEnd() {
        if (this.currentEnemy.hp <= 0) {
            this.winBattle();
        }
        this.updateBattleDisplay();
    }
    
    updateBattleDisplay() {
        if (!this.currentEnemy) return;
        
        this.elements.enemyInfo.innerHTML = `
            <div class="enemy-display">
                <div class="enemy-icon">${this.currentEnemy.icon}</div>
                <div class="enemy-name">${this.currentEnemy.name}</div>
                <div class="enemy-hp">HP: ${Math.max(0, this.currentEnemy.hp)}/${this.enemies.find(e => e.name === this.currentEnemy.name).hp}</div>
            </div>
        `;
        
        this.updateDisplay();
    }
    
    gameOver() {
        this.addMessage("💀 ゲームオーバー...");
        this.endBattle();
        
        setTimeout(() => {
            if (confirm("ゲームオーバーです。新しいゲームを始めますか？")) {
                this.resetGame();
            }
        }, 2000);
    }
    
    gameWin() {
        this.gameState.gameWon = true;
        this.addMessage("🏆 おめでとうございます！魔王を倒して冒険を完了しました！");
        
        setTimeout(() => {
            alert(`🏆 ゲームクリア！\n\nレベル: ${this.player.level}\nターン数: ${this.gameState.turnCount}\n倒した敵: ${this.gameState.enemiesDefeated}\n発見したアイテム: ${this.gameState.itemsFound}`);
        }, 1000);
    }
    
    randomEvent() {
        const events = [
            () => {
                this.addMessage("🌟 幸運な出来事！体力が少し回復しました。");
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 5);
            },
            () => {
                this.addMessage("💰 地面にコインが落ちています！");
                this.player.gold += Math.floor(Math.random() * 10) + 5;
            },
            () => {
                this.addMessage("👻 不気味な気配を感じます...");
            },
            () => {
                this.addMessage("🎶 遠くから美しい音楽が聞こえてきます。");
            }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        event();
    }
    
    updateDisplay() {
        // プレイヤー情報更新
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        this.elements.healthFill.style.width = healthPercent + '%';
        this.elements.healthText.textContent = `${this.player.health}/${this.player.maxHealth}`;
        
        this.elements.level.textContent = this.player.level;
        this.elements.experience.textContent = this.player.experience;
        this.elements.gold.textContent = this.player.gold;
        this.elements.itemCount.textContent = this.player.inventory.length;
        this.elements.exploration.textContent = `${this.gameState.exploredAreas.size}/6`;
        
        // インベントリ更新
        this.elements.inventory.innerHTML = '';
        this.player.inventory.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.textContent = item;
            itemDiv.title = this.items[item] ? this.items[item].description : '';
            this.elements.inventory.appendChild(itemDiv);
        });
        
        // 統計更新
        this.elements.stats.innerHTML = `
            <div>ターン数: ${this.gameState.turnCount}</div>
            <div>倒した敵: ${this.gameState.enemiesDefeated}</div>
            <div>発見アイテム: ${this.gameState.itemsFound}</div>
        `;
    }
    
    addMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        this.elements.messageLog.appendChild(messageDiv);
        this.elements.messageLog.scrollTop = this.elements.messageLog.scrollHeight;
        
        // ログを最新50件に制限
        while (this.elements.messageLog.children.length > 50) {
            this.elements.messageLog.removeChild(this.elements.messageLog.firstChild);
        }
    }
    
    addBattleLog(message) {
        const logDiv = document.createElement('div');
        logDiv.textContent = message;
        this.elements.battleLog.appendChild(logDiv);
        this.elements.battleLog.scrollTop = this.elements.battleLog.scrollHeight;
    }
    
    saveGame() {
        const saveData = {
            player: this.player,
            gameState: {
                ...this.gameState,
                exploredAreas: Array.from(this.gameState.exploredAreas)
            },
            timestamp: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('adventureGameSave', JSON.stringify(saveData));
            this.addMessage('💾 ゲームを保存しました！');
        } catch (error) {
            this.addMessage('❌ 保存に失敗しました。');
        }
    }
    
    loadGame() {
        try {
            const saveData = localStorage.getItem('adventureGameSave');
            if (saveData) {
                const data = JSON.parse(saveData);
                this.player = data.player;
                this.gameState = {
                    ...data.gameState,
                    exploredAreas: new Set(data.gameState.exploredAreas)
                };
                
                // プレイヤー位置を復元
                this.elements.player.style.left = this.player.x + 'px';
                this.elements.player.style.top = this.player.y + 'px';
                
                this.updateDisplay();
                this.updateLocation();
                this.addMessage('📁 ゲームをロードしました！');
            } else {
                this.addMessage('💾 セーブデータが見つかりません。');
            }
        } catch (error) {
            this.addMessage('❌ ロードに失敗しました。');
        }
    }
    
    loadGameData() {
        // オートセーブからロード
        try {
            const autoSave = localStorage.getItem('adventureGameAutoSave');
            if (autoSave) {
                const data = JSON.parse(autoSave);
                this.player = { ...this.player, ...data.player };
                this.updateDisplay();
            }
        } catch (error) {
            console.error('オートセーブのロードに失敗:', error);
        }
    }
    
    resetGame() {
        if (confirm('ゲームをリセットしますか？すべての進行状況が失われます。')) {
            // ページをリロードして完全にリセット
            location.reload();
        }
    }
}

// アプリ初期化
document.addEventListener('DOMContentLoaded', () => {
    const game = new AdventureGame();
    
    // オートセーブ（2分ごと）
    setInterval(() => {
        try {
            const autoSaveData = {
                player: game.player,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('adventureGameAutoSave', JSON.stringify(autoSaveData));
        } catch (error) {
            console.error('オートセーブに失敗:', error);
        }
    }, 120000);
});