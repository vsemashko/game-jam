import { Input } from './Input.js';
import { Player } from './Player.js';
import { FlowerBoss } from './FlowerBoss.js';
import { ParticleSystem } from './ParticleSystem.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1280;
        this.canvas.height = 720;

        this.input = new Input();
        this.particleSystem = new ParticleSystem();

        this.gameState = 'start'; // 'start', 'playing', 'victory', 'gameover'
        this.startTime = 0;
        this.endTime = 0;

        // UI elements
        this.playerHealthUI = document.getElementById('player-health');
        this.bossHealthBar = document.getElementById('boss-health-fill');
        this.bossNameUI = document.getElementById('boss-name');
        this.superMeterUI = document.getElementById('super-fill');
        this.weaponDisplayUI = document.getElementById('weapon-display');
        this.startScreen = document.getElementById('start-screen');
        this.victoryScreen = document.getElementById('victory-screen');

        // Game stats
        this.parriesPerformed = 0;
        this.superMovesUsed = 0;

        this.setupGame();
        this.setupUI();
        this.gameLoop();
    }

    setupGame() {
        this.player = new Player(640, 580, this.particleSystem);
        this.boss = new FlowerBoss(this.particleSystem);

        this.bossNameUI.textContent = this.boss.name;
    }

    setupUI() {
        // Create health cards
        this.updatePlayerHealthUI();
        this.updateWeaponUI();
    }

    updatePlayerHealthUI() {
        this.playerHealthUI.innerHTML = '';
        for (let i = 0; i < this.player.maxHealth; i++) {
            const card = document.createElement('div');
            card.className = 'health-card';
            if (i >= this.player.health) {
                card.classList.add('lost');
            }
            this.playerHealthUI.appendChild(card);
        }
    }

    updateBossHealthUI() {
        const percent = (this.boss.health / this.boss.maxHealth) * 100;
        this.bossHealthBar.style.width = percent + '%';
    }

    updateSuperMeterUI() {
        const percent = (this.player.superMeter / this.player.maxSuper) * 100;
        this.superMeterUI.style.width = percent + '%';
    }

    updateWeaponUI() {
        const weaponNames = {
            'peashooter': 'PEASHOOTER',
            'spread': 'SPREAD',
            'charge': 'CHARGE'
        };
        this.weaponDisplayUI.textContent = weaponNames[this.player.currentWeapon] || 'PEASHOOTER';
    }

    update() {
        if (this.gameState === 'start') {
            if (this.input.isPressed('start')) {
                this.startGame();
            }
        } else if (this.gameState === 'playing') {
            this.updatePlaying();
        } else if (this.gameState === 'victory') {
            if (this.input.isPressed('start')) {
                this.restartGame();
            }
        } else if (this.gameState === 'gameover') {
            if (this.input.isPressed('start')) {
                this.restartGame();
            }
        }

        this.particleSystem.update();
        this.input.update();
    }

    startGame() {
        this.gameState = 'playing';
        this.startScreen.style.display = 'none';
        this.startTime = Date.now();
        this.parriesPerformed = 0;
        this.superMovesUsed = 0;
    }

    updatePlaying() {
        // Update player
        this.player.update(this.input);

        // Update boss
        if (!this.boss.dead) {
            this.boss.update(this.player, this.particleSystem);
        }

        // Check collisions
        this.checkCollisions();

        // Update UI
        this.updatePlayerHealthUI();
        this.updateBossHealthUI();
        this.updateSuperMeterUI();

        // Check win condition
        if (this.boss.dead && this.gameState === 'playing') {
            this.endTime = Date.now();
            this.showVictoryScreen();
        }

        // Check lose condition
        if (this.player.health <= 0 && this.gameState === 'playing') {
            this.gameState = 'gameover';
            // Could add game over screen here
            setTimeout(() => this.restartGame(), 2000);
        }
    }

    checkCollisions() {
        // Player bullets vs Boss
        for (let i = this.player.bullets.length - 1; i >= 0; i--) {
            const bullet = this.player.bullets[i];

            // Check boss collision
            if (this.checkBulletBossCollision(bullet, this.boss)) {
                this.boss.takeDamage(bullet.damage, this.particleSystem);
                this.player.addSuper(5);
                this.player.bullets.splice(i, 1);
                continue;
            }

            // Check flytraps
            for (let j = this.boss.flytraps.length - 1; j >= 0; j--) {
                const flytrap = this.boss.flytraps[j];
                if (this.checkBulletFlytrapCollision(bullet, flytrap)) {
                    flytrap.takeDamage(bullet.damage);
                    this.player.addSuper(3);
                    this.player.bullets.splice(i, 1);
                    break;
                }
            }
        }

        // Boss bullets vs Player
        for (let i = this.boss.bullets.length - 1; i >= 0; i--) {
            const bullet = this.boss.bullets[i];

            // Check parry
            if (this.input.isPressed('jump') && bullet.canParry) {
                const dx = bullet.x - this.player.x;
                const dy = bullet.y - (this.player.y + this.player.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 50) {
                    this.player.parry(bullet);
                    this.boss.bullets.splice(i, 1);
                    this.parriesPerformed++;
                    continue;
                }
            }

            // Check player collision
            if (this.checkBulletPlayerCollision(bullet, this.player)) {
                if (this.player.takeDamage(1)) {
                    this.boss.bullets.splice(i, 1);
                }
            }
        }

        // Boss vs Player (contact damage)
        if (!this.player.invulnerable && !this.player.isDashing) {
            const dx = this.boss.x - this.player.x;
            const dy = this.boss.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 80) {
                this.player.takeDamage(1);
            }
        }

        // Flytraps vs Player
        this.boss.flytraps.forEach(flytrap => {
            if (flytrap.isSnapping) {
                const dx = flytrap.x - this.player.x;
                const dy = flytrap.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 50) {
                    this.player.takeDamage(1);
                }
            }
        });
    }

    checkBulletBossCollision(bullet, boss) {
        if (boss.petalShieldActive) return false; // Can't damage during shield

        const dx = bullet.x - boss.x;
        const dy = bullet.y - boss.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 70;
    }

    checkBulletFlytrapCollision(bullet, flytrap) {
        const dx = bullet.x - flytrap.x;
        const dy = bullet.y - flytrap.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 30;
    }

    checkBulletPlayerCollision(bullet, player) {
        const dx = bullet.x - player.x;
        const dy = bullet.y - (player.y + player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 30;
    }

    showVictoryScreen() {
        this.gameState = 'victory';
        this.victoryScreen.style.display = 'flex';

        // Calculate stats
        const timeTaken = (this.endTime - this.startTime) / 1000; // seconds
        const hpRemaining = this.player.health;

        // Calculate grade
        let grade = 'D';
        let score = 0;

        if (timeTaken < 90) score += 30;
        else if (timeTaken < 120) score += 20;
        else if (timeTaken < 180) score += 10;

        if (hpRemaining === 3) score += 30;
        else if (hpRemaining === 2) score += 20;
        else if (hpRemaining === 1) score += 10;

        if (this.parriesPerformed >= 10) score += 20;
        else if (this.parriesPerformed >= 5) score += 10;

        if (score >= 70) grade = 'S';
        else if (score >= 60) grade = 'A';
        else if (score >= 45) grade = 'B';
        else if (score >= 30) grade = 'C';

        // Display results
        document.getElementById('grade-display').textContent = grade;
        document.getElementById('stats-display').innerHTML = `
            <p><strong>Time:</strong> ${timeTaken.toFixed(1)}s</p>
            <p><strong>HP Remaining:</strong> ${hpRemaining}/3</p>
            <p><strong>Parries:</strong> ${this.parriesPerformed}</p>
            <p><strong>Grade:</strong> ${grade}</p>
        `;
    }

    restartGame() {
        this.gameState = 'start';
        this.startScreen.style.display = 'flex';
        this.victoryScreen.style.display = 'none';
        this.setupGame();
        this.setupUI();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background layers
        this.drawBackground();

        // Draw game objects
        if (this.gameState === 'playing' || this.gameState === 'victory' || this.gameState === 'gameover') {
            this.boss.draw(this.ctx);
            this.player.draw(this.ctx);
            this.particleSystem.draw(this.ctx);
        }

        // Draw ground
        this.drawGround();
    }

    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 5; i++) {
            const x = ((Date.now() * 0.01 + i * 300) % (this.canvas.width + 200)) - 100;
            const y = 50 + i * 60;
            this.drawCloud(x, y);
        }

        // Background plants
        this.ctx.fillStyle = 'rgba(34, 139, 34, 0.3)';
        for (let i = 0; i < 10; i++) {
            const x = i * 150;
            const y = 640;
            this.ctx.fillRect(x, y, 20, -80);
        }
    }

    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 30, 0, Math.PI * 2);
        this.ctx.arc(x + 40, y, 40, 0, Math.PI * 2);
        this.ctx.arc(x + 80, y, 30, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawGround() {
        // Ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, 640, this.canvas.width, 80);

        // Ground line
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 640);
        this.ctx.lineTo(this.canvas.width, 640);
        this.ctx.stroke();

        // Grass
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 100; i++) {
            const x = i * 13;
            const height = 10 + Math.random() * 10;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 640);
            this.ctx.lineTo(x, 640 - height);
            this.ctx.stroke();
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});
