class ShootingGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            score: 0,
            level: 1,
            lives: 3,
            difficulty: 'easy',
            powerUpType: 'none',
            powerUpTimer: 0,
            startTime: 0,
            playTime: 0
        };
        
        this.stats = {
            highScore: parseInt(localStorage.getItem('shootingHighScore')) || 0,
            enemiesDestroyed: 0,
            shotsFired: 0,
            shotsHit: 0
        };
        
        this.player = {
            x: 400,
            y: 550,
            width: 40,
            height: 40,
            speed: 5,
            color: '#00f5ff'
        };
        
        this.bullets = [];
        this.enemies = [];
        this.powerUps = [];
        this.explosions = [];
        this.particles = [];
        
        this.keys = {};
        this.lastShot = 0;
        this.shootDelay = 200;
        this.enemySpawnTimer = 0;
        this.powerUpSpawnTimer = 0;
        
        this.difficultySettings = {
            easy: {
                enemySpeed: 1,
                enemySpawnRate: 100,
                enemyHealth: 1,
                powerUpChance: 0.3
            },
            normal: {
                enemySpeed: 2,
                enemySpawnRate: 80,
                enemyHealth: 2,
                powerUpChance: 0.2
            },
            hard: {
                enemySpeed: 3,
                enemySpawnRate: 60,
                enemyHealth: 3,
                powerUpChance: 0.1
            }
        };
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        this.gameLoop();
    }
    
    initializeElements() {
        this.elements = {
            score: document.getElementById('score'),
            level: document.getElementById('level'),
            lives: document.getElementById('lives'),
            powerUpType: document.getElementById('powerUpType'),
            powerUpTimer: document.getElementById('powerUpTimer'),
            highScore: document.getElementById('highScore'),
            enemiesDestroyed: document.getElementById('enemiesDestroyed'),
            accuracy: document.getElementById('accuracy'),
            playTime: document.getElementById('playTime'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            gameMessage: document.getElementById('gameMessage'),
            messageTitle: document.getElementById('messageTitle'),
            messageText: document.getElementById('messageText'),
            restartBtn: document.getElementById('restartBtn')
        };
    }
    
    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.resetBtn.addEventListener('click', () => this.resetGame());
        this.elements.restartBtn.addEventListener('click', () => this.hideMessage());
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'p' || e.key === 'P') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.gameState.difficulty = e.target.value;
            });
        });
    }
    
    startGame() {
        this.gameState.isPlaying = true;
        this.gameState.isPaused = false;
        this.gameState.startTime = Date.now();
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        this.hideMessage();
        this.spawnStars();
    }
    
    togglePause() {
        if (!this.gameState.isPlaying) return;
        
        this.gameState.isPaused = !this.gameState.isPaused;
        if (this.gameState.isPaused) {
            this.showMessage('›¸∫-', 'P≠¸~_o›¸∫‹øÛgçã');
        } else {
            this.hideMessage();
        }
    }
    
    resetGame() {
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            score: 0,
            level: 1,
            lives: 3,
            difficulty: this.gameState.difficulty,
            powerUpType: 'none',
            powerUpTimer: 0,
            startTime: 0,
            playTime: 0
        };
        
        this.stats.enemiesDestroyed = 0;
        this.stats.shotsFired = 0;
        this.stats.shotsHit = 0;
        
        this.player.x = 400;
        this.player.y = 550;
        
        this.bullets = [];
        this.enemies = [];
        this.powerUps = [];
        this.explosions = [];
        this.particles = [];
        
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.hideMessage();
        this.updateDisplay();
    }
    
    spawnStars() {
        // Background stars
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speed: Math.random() * 2 + 1,
                size: Math.random() * 2 + 1,
                type: 'star'
            });
        }
    }
    
    updatePlayer() {
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }
        
        if (this.keys[' '] || this.keys['Space']) {
            this.shoot();
        }
    }
    
    shoot() {
        const now = Date.now();
        if (now - this.lastShot > this.shootDelay) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 10,
                speed: 8,
                color: '#ffff00',
                type: 'player'
            });
            
            // Power-up: Rapid fire
            if (this.gameState.powerUpType === 'rapid_fire') {
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - 6,
                    y: this.player.y,
                    width: 4,
                    height: 10,
                    speed: 8,
                    color: '#ffff00',
                    type: 'player'
                });
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 + 2,
                    y: this.player.y,
                    width: 4,
                    height: 10,
                    speed: 8,
                    color: '#ffff00',
                    type: 'player'
                });
            }
            
            this.lastShot = now;
            this.stats.shotsFired++;
        }
    }
    
    spawnEnemies() {
        const settings = this.difficultySettings[this.gameState.difficulty];
        this.enemySpawnTimer++;
        
        if (this.enemySpawnTimer >= settings.enemySpawnRate) {
            const enemyTypes = ['basic', 'fast', 'strong'];
            const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            
            let enemy = {
                x: Math.random() * (this.canvas.width - 30),
                y: -30,
                width: 30,
                height: 30,
                speed: settings.enemySpeed,
                health: settings.enemyHealth,
                maxHealth: settings.enemyHealth,
                color: '#ff0040',
                type: type,
                shootTimer: 0
            };
            
            // Adjust properties based on type
            switch(type) {
                case 'fast':
                    enemy.speed *= 1.5;
                    enemy.color = '#ff8800';
                    break;
                case 'strong':
                    enemy.health *= 2;
                    enemy.maxHealth *= 2;
                    enemy.width = 40;
                    enemy.height = 40;
                    enemy.color = '#8800ff';
                    break;
            }
            
            this.enemies.push(enemy);
            this.enemySpawnTimer = 0;
        }
    }
    
    spawnPowerUps() {
        this.powerUpSpawnTimer++;
        const settings = this.difficultySettings[this.gameState.difficulty];
        
        if (this.powerUpSpawnTimer >= 600 && Math.random() < settings.powerUpChance) {
            const powerUpTypes = ['rapid_fire', 'shield', 'multi_shot'];
            const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            
            this.powerUps.push({
                x: Math.random() * (this.canvas.width - 25),
                y: -25,
                width: 25,
                height: 25,
                speed: 2,
                type: type,
                color: '#00ff00'
            });
            
            this.powerUpSpawnTimer = 0;
        }
    }
    
    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });
        
        // Enemy bullets
        this.enemies.forEach(enemy => {
            enemy.shootTimer++;
            if (enemy.shootTimer >= 120 && Math.random() < 0.02) {
                this.bullets.push({
                    x: enemy.x + enemy.width / 2 - 2,
                    y: enemy.y + enemy.height,
                    width: 4,
                    height: 8,
                    speed: -4,
                    color: '#ff0040',
                    type: 'enemy'
                });
                enemy.shootTimer = 0;
            }
        });
    }
    
    updateEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            return enemy.y < this.canvas.height;
        });
    }
    
    updatePowerUps() {
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.y += powerUp.speed;
            return powerUp.y < this.canvas.height;
        });
    }
    
    updateExplosions() {
        this.explosions = this.explosions.filter(explosion => {
            explosion.frame++;
            explosion.size += 2;
            explosion.opacity -= 0.05;
            return explosion.frame < 20;
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            if (particle.type === 'star') {
                particle.y += particle.speed;
                if (particle.y > this.canvas.height) {
                    particle.y = -particle.size;
                    particle.x = Math.random() * this.canvas.width;
                }
                return true;
            }
            return false;
        });
    }
    
    updatePowerUpTimer() {
        if (this.gameState.powerUpTimer > 0) {
            this.gameState.powerUpTimer--;
            if (this.gameState.powerUpTimer === 0) {
                this.gameState.powerUpType = 'none';
            }
        }
    }
    
    checkCollisions() {
        // Player bullets vs enemies
        this.bullets.forEach((bullet, bulletIndex) => {
            if (bullet.type !== 'player') return;
            
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy)) {
                    enemy.health--;
                    this.bullets.splice(bulletIndex, 1);
                    this.stats.shotsHit++;
                    
                    if (enemy.health <= 0) {
                        this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                        this.enemies.splice(enemyIndex, 1);
                        this.stats.enemiesDestroyed++;
                        this.gameState.score += 10 * this.gameState.level;
                        
                        // Level up logic
                        if (this.stats.enemiesDestroyed % 20 === 0) {
                            this.gameState.level++;
                        }
                    }
                }
            });
        });
        
        // Enemy bullets vs player
        this.bullets.forEach((bullet, bulletIndex) => {
            if (bullet.type !== 'enemy') return;
            
            if (this.isColliding(bullet, this.player)) {
                this.bullets.splice(bulletIndex, 1);
                this.playerHit();
            }
        });
        
        // Player vs enemies
        this.enemies.forEach((enemy, enemyIndex) => {
            if (this.isColliding(this.player, enemy)) {
                this.enemies.splice(enemyIndex, 1);
                this.playerHit();
            }
        });
        
        // Player vs power-ups
        this.powerUps.forEach((powerUp, powerUpIndex) => {
            if (this.isColliding(this.player, powerUp)) {
                this.powerUps.splice(powerUpIndex, 1);
                this.activatePowerUp(powerUp.type);
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    playerHit() {
        if (this.gameState.powerUpType === 'shield') {
            this.gameState.powerUpTimer = 0;
            this.gameState.powerUpType = 'none';
            return;
        }
        
        this.gameState.lives--;
        this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2);
        
        if (this.gameState.lives <= 0) {
            this.gameOver();
        }
    }
    
    activatePowerUp(type) {
        this.gameState.powerUpType = type;
        this.gameState.powerUpTimer = 300; // 5 seconds at 60fps
        
        switch(type) {
            case 'rapid_fire':
                this.shootDelay = 100;
                break;
            case 'shield':
                break;
            case 'multi_shot':
                break;
        }
    }
    
    createExplosion(x, y) {
        this.explosions.push({
            x: x,
            y: y,
            size: 5,
            opacity: 1,
            frame: 0,
            color: '#ff8800'
        });
    }
    
    gameOver() {
        this.gameState.isPlaying = false;
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        
        if (this.gameState.score > this.stats.highScore) {
            this.stats.highScore = this.gameState.score;
            localStorage.setItem('shootingHighScore', this.stats.highScore);
        }
        
        this.showMessage('≤¸‡™¸–¸', `π≥¢: ${this.gameState.score}`);
    }
    
    showMessage(title, text) {
        this.elements.messageTitle.textContent = title;
        this.elements.messageText.textContent = text;
        this.elements.gameMessage.classList.add('active');
    }
    
    hideMessage() {
        this.elements.gameMessage.classList.remove('active');
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        this.particles.forEach(particle => {
            if (particle.type === 'star') {
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            }
        });
        
        // Draw player
        this.ctx.fillStyle = this.gameState.powerUpType === 'shield' ? '#00ff00' : this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw bullets
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Health bar for stronger enemies
            if (enemy.health < enemy.maxHealth) {
                const healthPercent = enemy.health / enemy.maxHealth;
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * healthPercent, 4);
            }
        });
        
        // Draw power-ups
        this.powerUps.forEach(powerUp => {
            this.ctx.fillStyle = powerUp.color;
            this.ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        });
        
        // Draw explosions
        this.explosions.forEach(explosion => {
            this.ctx.globalAlpha = explosion.opacity;
            this.ctx.fillStyle = explosion.color;
            this.ctx.fillRect(explosion.x - explosion.size/2, explosion.y - explosion.size/2, explosion.size, explosion.size);
            this.ctx.globalAlpha = 1;
        });
    }
    
    updateDisplay() {
        this.elements.score.textContent = this.gameState.score;
        this.elements.level.textContent = this.gameState.level;
        this.elements.lives.textContent = this.gameState.lives;
        this.elements.powerUpType.textContent = this.gameState.powerUpType === 'none' ? 'jW' : this.gameState.powerUpType;
        this.elements.powerUpTimer.textContent = Math.ceil(this.gameState.powerUpTimer / 60);
        this.elements.highScore.textContent = this.stats.highScore;
        this.elements.enemiesDestroyed.textContent = this.stats.enemiesDestroyed;
        
        const accuracy = this.stats.shotsFired > 0 ? Math.round((this.stats.shotsHit / this.stats.shotsFired) * 100) : 0;
        this.elements.accuracy.textContent = accuracy + '%';
        
        if (this.gameState.isPlaying) {
            this.gameState.playTime = Date.now() - this.gameState.startTime;
        }
        const minutes = Math.floor(this.gameState.playTime / 60000);
        const seconds = Math.floor((this.gameState.playTime % 60000) / 1000);
        this.elements.playTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    gameLoop() {
        if (this.gameState.isPlaying && !this.gameState.isPaused) {
            this.updatePlayer();
            this.updateBullets();
            this.updateEnemies();
            this.updatePowerUps();
            this.updateExplosions();
            this.updateParticles();
            this.updatePowerUpTimer();
            this.spawnEnemies();
            this.spawnPowerUps();
            this.checkCollisions();
            
            // Reset shoot delay when power-up ends
            if (this.gameState.powerUpType === 'none') {
                this.shootDelay = 200;
            }
        }
        
        this.render();
        this.updateDisplay();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    new ShootingGame();
});