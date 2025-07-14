class AdventureGame {
    constructor() {
        this.player = {
            x: 235,
            y: 235,
            health: 100,
            maxHealth: 100,
            inventory: ['�-�o', '���']
        };
        
        this.gameState = {
            currentLocation: 'entrance',
            itemsFound: 0,
            exploredAreas: new Set(['entrance']),
            treasures: [],
            obstacles: []
        };
        
        this.locations = {
            entrance: {
                name: '�����',
                description: '��z�ne��gY'
            },
            corridor: {
                name: '�',
                description: '��D�n�L�DfD~Y'
            },
            chamber: {
                name: '�i�',
                description: '�rkI��iL cfD~Y'
            },
            trap: {
                name: '`n�K',
                description: 'qzj`L՛Q��fD~Y'
            },
            secret: {
                name: '��n�K',
                description: '�U�_��n��L...'
            }
        };
        
        this.initializeElements();
        this.bindEvents();
        this.generateMap();
        this.updateDisplay();
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
            moveUp: document.getElementById('moveUp'),
            moveDown: document.getElementById('moveDown'),
            moveLeft: document.getElementById('moveLeft'),
            moveRight: document.getElementById('moveRight'),
            searchBtn: document.getElementById('searchBtn'),
            useItemBtn: document.getElementById('useItemBtn'),
            saveBtn: document.getElementById('saveBtn'),
            loadBtn: document.getElementById('loadBtn')
        };
    }
    
    bindEvents() {
        this.elements.moveUp.addEventListener('click', () => this.movePlayer(0, -50));
        this.elements.moveDown.addEventListener('click', () => this.movePlayer(0, 50));
        this.elements.moveLeft.addEventListener('click', () => this.movePlayer(-50, 0));
        this.elements.moveRight.addEventListener('click', () => this.movePlayer(50, 0));
        
        this.elements.searchBtn.addEventListener('click', () => this.searchArea());
        this.elements.useItemBtn.addEventListener('click', () => this.useItem());
        this.elements.saveBtn.addEventListener('click', () => this.saveGame());
        this.elements.loadBtn.addEventListener('click', () => this.loadGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleKeyPress(e) {
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
                this.searchArea();
                break;
        }
    }
    
    generateMap() {
        // ��i�Mn
        this.createObstacle(100, 100);
        this.createObstacle(300, 150);
        this.createObstacle(150, 350);
        this.createObstacle(400, 300);
        
        // �i�Mn
        this.createTreasure(50, 50, 'ancient_coin');
        this.createTreasure(450, 100, 'magic_scroll');
        this.createTreasure(100, 450, 'health_potion');
        this.createTreasure(400, 450, 'ancient_key');
        this.createTreasure(250, 200, 'mysterious_orb');
    }
    
    createObstacle(x, y) {
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        obstacle.style.left = x + 'px';
        obstacle.style.top = y + 'px';
        this.elements.gameMap.appendChild(obstacle);
        
        this.gameState.obstacles.push({ x, y, width: 40, height: 40 });
    }
    
    createTreasure(x, y, type) {
        const treasure = document.createElement('div');
        treasure.className = 'treasure';
        treasure.style.left = x + 'px';
        treasure.style.top = y + 'px';
        treasure.dataset.type = type;
        treasure.addEventListener('click', () => this.collectTreasure(treasure, type));
        this.elements.gameMap.appendChild(treasure);
        
        this.gameState.treasures.push({ x, y, type, collected: false, element: treasure });
    }
    
    movePlayer(dx, dy) {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        // �L��ï
        if (newX < 0 || newX > 470 || newY < 0 || newY > 470) {
            this.addMessage('Sn�ko2�~[�');
            return;
        }
        
        // ��ihn]���ï
        const playerRect = { x: newX, y: newY, width: 30, height: 30 };
        for (const obstacle of this.gameState.obstacles) {
            if (this.checkCollision(playerRect, obstacle)) {
                this.addMessage('��iLBcf2�~[�');
                return;
            }
        }
        
        // �՟L
        this.player.x = newX;
        this.player.y = newY;
        this.elements.player.style.left = newX + 'px';
        this.elements.player.style.top = newY + 'px';
        
        // Mnk�Xf�������
        this.updateLocation();
        
        // �ihn����ï
        this.checkTreasureCollision();
        
        // �������
        if (Math.random() < 0.1) {
            this.randomEvent();
        }
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
    
    collectTreasure(element, type) {
        const treasure = this.gameState.treasures.find(t => t.type === type);
        if (treasure && !treasure.collected) {
            treasure.collected = true;
            element.style.display = 'none';
            
            const itemNames = {
                ancient_coin: '��n���',
                magic_scroll: 'T�n�i',
                health_potion: 'S�ީ�',
                ancient_key: '��nu',
                mysterious_orb: 'n��'
            };
            
            const itemName = itemNames[type] || 'j����';
            this.player.inventory.push(itemName);
            this.gameState.itemsFound++;
            
            this.addMessage(`${itemName}��dQ~W_`);
            this.updateDisplay();
        }
    }
    
    updateLocation() {
        let newLocation = 'entrance';
        
        if (this.player.x < 100 && this.player.y < 100) {
            newLocation = 'chamber';
        } else if (this.player.x > 400 && this.player.y < 100) {
            newLocation = 'secret';
        } else if (this.player.x < 100 && this.player.y > 400) {
            newLocation = 'trap';
        } else if (this.player.x > 400 && this.player.y > 400) {
            newLocation = 'corridor';
        }
        
        if (newLocation !== this.gameState.currentLocation) {
            this.gameState.currentLocation = newLocation;
            this.gameState.exploredAreas.add(newLocation);
            
            const location = this.locations[newLocation];
            this.elements.locationInfo.innerHTML = `
                <h3>�(0: ${location.name}</h3>
                <p>${location.description}</p>
            `;
            
            this.addMessage(`${location.name}k0@W~W_`);
            this.updateDisplay();
        }
    }
    
    searchArea() {
        const searchResults = [
            'U��dK�~[�gW_',
            '�D�n4G��dQ~W_',
            '�k��WL;~�fD~Y',
            '*WD�L^SH~Y...',
            '�U�_�z�W~W_'
        ];
        
        const result = searchResults[Math.floor(Math.random() * searchResults.length)];
        this.addMessage(result);
        
        //  kS�ީ
        if (Math.random() < 0.2) {
            this.player.health = Math.min(this.player.maxHealth, this.player.health + 10);
            this.addMessage('�"-kLoOj�~W_S�LީW~W_');
            this.updateDisplay();
        }
    }
    
    useItem() {
        if (this.player.inventory.length === 0) {
            this.addMessage('(gM�����LB�~[�');
            return;
        }
        
        const item = this.player.inventory[0];
        
        if (item === 'S�ީ�') {
            this.player.health = this.player.maxHealth;
            this.player.inventory.shift();
            this.addMessage('S�ީ��(W~W_S�LhީW~W_');
        } else if (item === '�-�o') {
            this.addMessage('�-�o�(W~W_h�L�Oj�~W_');
        } else if (item === '���') {
            this.addMessage('��ג(W~W_�D4@k{�]FgY');
        } else {
            this.addMessage(`${item}��y~W_��n��X~Y...`);
        }
        
        this.updateDisplay();
    }
    
    randomEvent() {
        const events = [
            { message: '`kcKK�~W_', healthChange: -10 },
            { message: 'T�nɒz�W~W_', healthChange: 15 },
            { message: '��njD��Q~W_...', healthChange: -5 },
            { message: '^؄jIk~�~W_', healthChange: 20 },
            { message: 'sj�L^SH~Y...', healthChange: 0 }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        this.addMessage(event.message);
        
        if (event.healthChange !== 0) {
            this.player.health = Math.max(0, Math.min(this.player.maxHealth, this.player.health + event.healthChange));
            this.updateDisplay();
            
            if (this.player.health <= 0) {
                this.gameOver();
            }
        }
    }
    
    gameOver() {
        this.addMessage('S�L=M~W_...');
        this.addMessage('������');
        
        setTimeout(() => {
            if (confirm('������gY K����W~YK')) {
                this.resetGame();
            }
        }, 2000);
    }
    
    resetGame() {
        this.player = {
            x: 235,
            y: 235,
            health: 100,
            maxHealth: 100,
            inventory: ['�-�o', '���']
        };
        
        this.gameState = {
            currentLocation: 'entrance',
            itemsFound: 0,
            exploredAreas: new Set(['entrance']),
            treasures: [],
            obstacles: []
        };
        
        this.elements.player.style.left = '235px';
        this.elements.player.style.top = '235px';
        
        // ��ג���
        this.elements.gameMap.innerHTML = '<div class="player" id="player"></div>';
        this.elements.player = document.getElementById('player');
        
        this.generateMap();
        this.updateDisplay();
        this.addMessage('�WD�zL�~�~W_');
    }
    
    saveGame() {
        const saveData = {
            player: this.player,
            gameState: {
                ...this.gameState,
                exploredAreas: Array.from(this.gameState.exploredAreas),
                treasures: this.gameState.treasures.map(t => ({
                    x: t.x,
                    y: t.y,
                    type: t.type,
                    collected: t.collected
                }))
            }
        };
        
        localStorage.setItem('adventureGameSave', JSON.stringify(saveData));
        this.addMessage('�������W~W_');
    }
    
    loadGame() {
        const saveData = localStorage.getItem('adventureGameSave');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.player = data.player;
            this.gameState = {
                ...data.gameState,
                exploredAreas: new Set(data.gameState.exploredAreas)
            };
            
            this.elements.player.style.left = this.player.x + 'px';
            this.elements.player.style.top = this.player.y + 'px';
            
            this.updateDisplay();
            this.addMessage('�������W~W_');
        } else {
            this.addMessage('������L�dK�~[�');
        }
    }
    
    addMessage(message) {
        const p = document.createElement('p');
        p.textContent = message;
        this.elements.messageLog.appendChild(p);
        this.elements.messageLog.scrollTop = this.elements.messageLog.scrollHeight;
    }
    
    updateDisplay() {
        // S�����
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        this.elements.healthFill.style.width = healthPercent + '%';
        this.elements.healthText.textContent = `${this.player.health}/${this.player.maxHealth}`;
        
        // ����p��
        this.elements.itemCount.textContent = this.gameState.itemsFound;
        
        // ����
        const explorationPercent = (this.gameState.exploredAreas.size / Object.keys(this.locations).length) * 100;
        this.elements.exploration.textContent = Math.round(explorationPercent) + '%';
        
        // ��������
        this.elements.inventory.innerHTML = '';
        this.player.inventory.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.textContent = item;
            this.elements.inventory.appendChild(itemDiv);
        });
    }
}

// ���
document.addEventListener('DOMContentLoaded', () => {
    new AdventureGame();
});