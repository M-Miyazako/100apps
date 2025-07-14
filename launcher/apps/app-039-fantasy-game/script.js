class FantasyGame {
    constructor() {
        this.player = {
            name: '�',
            level: 1,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            exp: 0,
            expToNext: 100,
            gold: 100,
            items: {
                'ީ�': 3,
                'Tլ': 2
            }
        };
        
        this.enemies = [
            { name: '���', hp: 30, maxHp: 30, attack: 8, exp: 15, gold: 10 },
            { name: '����', hp: 50, maxHp: 50, attack: 12, exp: 25, gold: 20 },
            { name: '���', hp: 80, maxHp: 80, attack: 18, exp: 40, gold: 35 },
            { name: '���', hp: 200, maxHp: 200, attack: 30, exp: 100, gold: 100 }
        ];
        
        this.currentEnemy = null;
        this.inBattle = false;
        
        this.scenarios = {
            start: {
                text: 'Bj_oT��Y_�k��c_�gY�ne��g�zL�~�~Y...',
                choices: [
                    { text: '"Y�', action: 'forest' },
                    { text: 'Q�*��', action: 'village' },
                    { text: 'F�kLO', action: 'shop' }
                ]
            },
            forest: {
                text: '�D�ke�~W_(n�K�sj�L^SH~Y',
                choices: [
                    { text: 'ek2�', action: 'deepForest' },
                    { text: '����Y', action: 'treasure' },
                    { text: ';�', action: 'start' }
                ]
            },
            village: {
                text: 's�jQk@M~W_Q�_aL�cfD��FgY',
                choices: [
                    { text: 'Q�hqY', action: 'talkVillager' },
                    { text: '�Kg�', action: 'inn' },
                    { text: ';�', action: 'start' }
                ]
            },
            shop: {
                text: 'F�g�DiLgM~Y',
                choices: [
                    { text: 'ީ���F (50G)', action: 'buyPotion' },
                    { text: 'Tլ��F (30G)', action: 'buyMagic' },
                    { text: ';�', action: 'start' }
                ]
            }
        };
        
        this.currentScenario = 'start';
        
        this.initializeElements();
        this.bindEvents();
        this.loadScenario('start');
        this.updateDisplay();
    }
    
    initializeElements() {
        this.elements = {
            characterName: document.getElementById('characterName'),
            hpBar: document.getElementById('hpBar'),
            hpText: document.getElementById('hpText'),
            mpBar: document.getElementById('mpBar'),
            mpText: document.getElementById('mpText'),
            level: document.getElementById('level'),
            exp: document.getElementById('exp'),
            gold: document.getElementById('gold'),
            itemList: document.getElementById('itemList'),
            storyDisplay: document.getElementById('storyDisplay'),
            choiceArea: document.getElementById('choiceArea'),
            battleArea: document.getElementById('battleArea'),
            enemyName: document.getElementById('enemyName'),
            enemyHpBar: document.getElementById('enemyHpBar'),
            enemyHpText: document.getElementById('enemyHpText'),
            battleLog: document.getElementById('battleLog'),
            attackBtn: document.getElementById('attackBtn'),
            magicBtn: document.getElementById('magicBtn'),
            healBtn: document.getElementById('healBtn'),
            runBtn: document.getElementById('runBtn')
        };
    }
    
    bindEvents() {
        this.elements.attackBtn.addEventListener('click', () => this.playerAttack());
        this.elements.magicBtn.addEventListener('click', () => this.playerMagic());
        this.elements.healBtn.addEventListener('click', () => this.playerHeal());
        this.elements.runBtn.addEventListener('click', () => this.playerRun());
    }
    
    loadScenario(scenarioKey) {
        this.currentScenario = scenarioKey;
        const scenario = this.scenarios[scenarioKey];
        
        if (scenario) {
            this.elements.storyDisplay.innerHTML = `<p>${scenario.text}</p>`;
            this.elements.choiceArea.innerHTML = '';
            
            scenario.choices.forEach(choice => {
                const choiceBtn = document.createElement('div');
                choiceBtn.className = 'choice-btn';
                choiceBtn.textContent = choice.text;
                choiceBtn.addEventListener('click', () => this.handleChoice(choice.action));
                this.elements.choiceArea.appendChild(choiceBtn);
            });
        }
    }
    
    handleChoice(action) {
        switch(action) {
            case 'deepForest':
                this.randomEncounter();
                break;
            case 'treasure':
                this.findTreasure();
                break;
            case 'talkVillager':
                this.talkToVillager();
                break;
            case 'inn':
                this.visitInn();
                break;
            case 'buyPotion':
                this.buyItem('ީ�', 50);
                break;
            case 'buyMagic':
                this.buyItem('Tլ', 30);
                break;
            default:
                this.loadScenario(action);
        }
    }
    
    randomEncounter() {
        if (Math.random() < 0.7) {
            const enemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
            this.startBattle(enemy);
        } else {
            this.elements.storyDisplay.innerHTML = '<p>�ne��"W~W_LU��dK�~[�gW_</p>';
            setTimeout(() => this.loadScenario('forest'), 2000);
        }
    }
    
    findTreasure() {
        const treasures = ['ީ�', 'Tլ', '����'];
        const treasure = treasures[Math.floor(Math.random() * treasures.length)];
        
        if (treasure === '����') {
            const gold = Math.floor(Math.random() * 50) + 20;
            this.player.gold += gold;
            this.elements.storyDisplay.innerHTML = `<p>����dQ~W_${gold}���ɒKke�~W_</p>`;
        } else {
            this.player.items[treasure] = (this.player.items[treasure] || 0) + 1;
            this.elements.storyDisplay.innerHTML = `<p>����dQ~W_${treasure}�Kke�~W_</p>`;
        }
        
        this.updateDisplay();
        setTimeout(() => this.loadScenario('forest'), 2000);
    }
    
    talkToVillager() {
        this.elements.storyDisplay.innerHTML = '<p>Q�T�nKLQ�rcfD~YiFK�QfO`UD</p>';
        this.elements.choiceArea.innerHTML = '';
        
        const helpBtn = document.createElement('div');
        helpBtn.className = 'choice-btn';
        helpBtn.textContent = 'Q��Q�';
        helpBtn.addEventListener('click', () => {
            const enemy = this.enemies[2]; // ���
            this.startBattle(enemy);
        });
        
        const leaveBtn = document.createElement('div');
        leaveBtn.className = 'choice-btn';
        leaveBtn.textContent = '�a��';
        leaveBtn.addEventListener('click', () => this.loadScenario('village'));
        
        this.elements.choiceArea.appendChild(helpBtn);
        this.elements.choiceArea.appendChild(leaveBtn);
    }
    
    visitInn() {
        this.player.hp = this.player.maxHp;
        this.player.mp = this.player.maxMp;
        this.elements.storyDisplay.innerHTML = '<p>�KgoW~W_HPhMPLhީW~W_</p>';
        this.updateDisplay();
        setTimeout(() => this.loadScenario('village'), 2000);
    }
    
    buyItem(item, price) {
        if (this.player.gold >= price) {
            this.player.gold -= price;
            this.player.items[item] = (this.player.items[item] || 0) + 1;
            this.elements.storyDisplay.innerHTML = `<p>${item}��eW~W_</p>`;
        } else {
            this.elements.storyDisplay.innerHTML = '<p>����L��~[�</p>';
        }
        this.updateDisplay();
        setTimeout(() => this.loadScenario('shop'), 2000);
    }
    
    startBattle(enemy) {
        this.currentEnemy = { ...enemy };
        this.inBattle = true;
        
        this.elements.battleArea.classList.add('active');
        this.elements.enemyName.textContent = enemy.name;
        this.elements.battleLog.innerHTML = `<p>${enemy.name}L��_</p>`;
        
        this.updateBattleDisplay();
    }
    
    playerAttack() {
        if (!this.inBattle) return;
        
        const damage = Math.floor(Math.random() * 20) + 10;
        this.currentEnemy.hp -= damage;
        
        this.addBattleLog(`${this.player.name}n;�${this.currentEnemy.name}k${damage}n����`);
        
        if (this.currentEnemy.hp <= 0) {
            this.winBattle();
        } else {
            this.updateBattleDisplay();
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }
    
    playerMagic() {
        if (!this.inBattle || this.player.mp < 10) return;
        
        this.player.mp -= 10;
        const damage = Math.floor(Math.random() * 30) + 20;
        this.currentEnemy.hp -= damage;
        
        this.addBattleLog(`${this.player.name}nT�;�${this.currentEnemy.name}k${damage}n����`);
        
        if (this.currentEnemy.hp <= 0) {
            this.winBattle();
        } else {
            this.updateBattleDisplay();
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }
    
    playerHeal() {
        if (!this.inBattle || !this.player.items['ީ�'] || this.player.items['ީ�'] <= 0) return;
        
        this.player.items['ީ�']--;
        const heal = Math.floor(Math.random() * 30) + 40;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
        
        this.addBattleLog(`${this.player.name}oީ��c_HPL${heal}ީW_`);
        
        this.updateBattleDisplay();
        setTimeout(() => this.enemyTurn(), 1000);
    }
    
    playerRun() {
        if (!this.inBattle) return;
        
        if (Math.random() < 0.7) {
            this.addBattleLog(`${this.player.name}oR�W_`);
            this.endBattle();
            this.loadScenario('start');
        } else {
            this.addBattleLog(`${this.player.name}oR��jKc_`);
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }
    
    enemyTurn() {
        if (!this.inBattle) return;
        
        const damage = Math.floor(Math.random() * 10) + this.currentEnemy.attack;
        this.player.hp -= damage;
        
        this.addBattleLog(`${this.currentEnemy.name}n;�${this.player.name}k${damage}n����`);
        
        if (this.player.hp <= 0) {
            this.gameOver();
        } else {
            this.updateBattleDisplay();
        }
    }
    
    winBattle() {
        this.player.exp += this.currentEnemy.exp;
        this.player.gold += this.currentEnemy.gold;
        
        this.addBattleLog(`${this.currentEnemy.name}�W_`);\n        this.addBattleLog(`${this.currentEnemy.exp}EXP${this.currentEnemy.gold}G�Kke�_`);
        
        this.checkLevelUp();
        this.updateDisplay();
        
        setTimeout(() => {
            this.endBattle();
            this.loadScenario('start');
        }, 3000);
    }
    
    checkLevelUp() {
        if (this.player.exp >= this.player.expToNext) {
            this.player.level++;
            this.player.exp -= this.player.expToNext;
            this.player.expToNext = Math.floor(this.player.expToNext * 1.5);
            this.player.maxHp += 20;
            this.player.maxMp += 10;
            this.player.hp = this.player.maxHp;
            this.player.mp = this.player.maxMp;
            
            this.addBattleLog(`��������${this.player.level}kjc_`);
        }
    }
    
    gameOver() {
        this.addBattleLog(`${this.player.name}o�_...`);
        this.addBattleLog('������');
        
        setTimeout(() => {
            if (confirm('������gY K����W~YK')) {
                this.resetGame();
            }
        }, 2000);
    }
    
    resetGame() {
        this.player = {
            name: '�',
            level: 1,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            exp: 0,
            expToNext: 100,
            gold: 100,
            items: {
                'ީ�': 3,
                'Tլ': 2
            }
        };
        
        this.endBattle();
        this.loadScenario('start');
        this.updateDisplay();
    }
    
    endBattle() {
        this.inBattle = false;
        this.currentEnemy = null;
        this.elements.battleArea.classList.remove('active');
    }
    
    addBattleLog(message) {
        const p = document.createElement('p');
        p.textContent = message;
        this.elements.battleLog.appendChild(p);
        this.elements.battleLog.scrollTop = this.elements.battleLog.scrollHeight;
    }
    
    updateDisplay() {
        this.elements.characterName.textContent = this.player.name;
        this.elements.level.textContent = this.player.level;
        this.elements.exp.textContent = `${this.player.exp}/${this.player.expToNext}`;
        this.elements.gold.textContent = this.player.gold;
        
        this.updateBar(this.elements.hpBar, this.elements.hpText, this.player.hp, this.player.maxHp);
        this.updateBar(this.elements.mpBar, this.elements.mpText, this.player.mp, this.player.maxMp);
        
        this.updateItemList();
    }
    
    updateBattleDisplay() {
        if (this.currentEnemy) {
            this.updateBar(this.elements.enemyHpBar, this.elements.enemyHpText, this.currentEnemy.hp, this.currentEnemy.maxHp);
        }
        this.updateDisplay();
    }
    
    updateBar(barElement, textElement, current, max) {
        const percentage = (current / max) * 100;
        barElement.style.width = `${percentage}%`;
        textElement.textContent = `${current}/${max}`;
    }
    
    updateItemList() {
        this.elements.itemList.innerHTML = '';
        
        for (const [item, count] of Object.entries(this.player.items)) {
            if (count > 0) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                itemDiv.textContent = `${item} x${count}`;
                this.elements.itemList.appendChild(itemDiv);
            }
        }
    }
}

// ���
document.addEventListener('DOMContentLoaded', () => {
    new FantasyGame();
});