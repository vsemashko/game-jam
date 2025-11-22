import { Input } from './Input.js';
import { Player } from './Player.js';
import { FlowerBoss } from './FlowerBoss.js';
import { DragonBoss } from './DragonBoss.js';
import { Platform } from './Platform.js';
import { Pickup } from './Pickup.js';
import { ParticleSystem } from './ParticleSystem.js';
import { SoundSystem } from './SoundSystem.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1280;
        this.canvas.height = 720;

        this.input = new Input();
        this.particleSystem = new ParticleSystem();
        this.soundSystem = new SoundSystem();

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
        this.levelSelectScreen = document.getElementById('level-select-screen');
        this.victoryScreen = document.getElementById('victory-screen');
        this.gameoverScreen = document.getElementById('gameover-screen');
        this.helpOverlay = document.getElementById('help-overlay');

        // Level system
        this.currentLevel = 1;
        this.platforms = [];
        this.pickups = [];
        this.levels = {
            1: { name: 'Flower Fiend', bossClass: FlowerBoss, hasPlatforms: false },
            2: { name: 'Grim Matchstick', bossClass: DragonBoss, hasPlatforms: true }
        };

        // Difficulty system
        this.difficulty = 'simple'; // 'simple', 'regular', 'expert'
        this.difficultyModifiers = {
            simple: { hpMultiplier: 0.75, damageMultiplier: 0.75, speedMultiplier: 0.85 },
            regular: { hpMultiplier: 1.0, damageMultiplier: 1.0, speedMultiplier: 1.0 },
            expert: { hpMultiplier: 1.5, damageMultiplier: 1.25, speedMultiplier: 1.2 }
        };

        // Game stats
        this.parriesPerformed = 0;

        // Combo/Score system
        this.combo = 0;
        this.maxCombo = 0;
        this.score = 0;
        this.comboFlash = 0; // Visual feedback timer

        // Initialize level select buttons
        this.setupLevelSelect();

        // Screen shake
        this.screenShake = 0;
        this.shakeX = 0;
        this.shakeY = 0;

        // Pause
        this.isPaused = false;

        // Help overlay
        this.helpVisible = false;

        // Freeze frames (hit-stop effect)
        this.freezeFrames = 0;

        this.setupGame();
        this.setupUI();
        this.gameLoop();
    }

    setupGame() {
        this.player = new Player(640, 580, this.particleSystem, this.soundSystem);

        // Create boss based on current level
        const levelData = this.levels[this.currentLevel];
        this.boss = new levelData.bossClass(this.particleSystem);

        // Apply difficulty modifiers
        this.applyDifficultyModifiers();

        // Setup platforms for levels that need them
        this.platforms = [];
        if (levelData.hasPlatforms) {
            this.setupPlatforms();
        }

        // Reset pickups
        this.pickups = [];

        this.bossNameUI.textContent = this.boss.name;
    }

    applyDifficultyModifiers() {
        const modifiers = this.difficultyModifiers[this.difficulty];

        // Adjust boss health
        this.boss.maxHealth = Math.round(this.boss.maxHealth * modifiers.hpMultiplier);
        this.boss.health = this.boss.maxHealth;

        // Store modifiers for runtime use
        this.boss.difficultyModifiers = modifiers;
    }

    setupPlatforms() {
        // Create cloud platforms for dragon level
        this.platforms = [
            new Platform(300, 450, 200, 40, 'static'),
            new Platform(700, 350, 200, 40, 'moving-horizontal'),
            new Platform(1000, 500, 180, 40, 'static'),
            new Platform(500, 250, 160, 40, 'moving-vertical')
        ];
    }

    setupLevelSelect() {
        // Load progress from localStorage
        this.loadProgress();

        // Add click handlers for difficulty buttons
        const difficultyButtons = document.querySelectorAll('.difficulty-btn');
        difficultyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                difficultyButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.getAttribute('data-difficulty');
            });
        });

        // Add click handlers for level buttons
        const levelButtons = document.querySelectorAll('.level-button');
        levelButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const level = parseInt(e.target.getAttribute('data-level'));
                const card = document.getElementById(`level-${level}-card`);

                if (!card.classList.contains('locked')) {
                    this.selectLevel(level);
                }
            });
        });

        // Update UI with saved data
        this.updateLevelSelectUI();
    }

    loadProgress() {
        const savedData = localStorage.getItem('cuphead-game-progress');
        if (savedData) {
            this.progress = JSON.parse(savedData);
        } else {
            this.progress = {
                unlockedLevels: [1],
                grades: {},
                bestAttempts: {}  // Track best attempts per level
            };
        }

        // Ensure bestAttempts exists (for backward compatibility)
        if (!this.progress.bestAttempts) {
            this.progress.bestAttempts = {};
        }
    }

    saveProgress() {
        localStorage.setItem('cuphead-game-progress', JSON.stringify(this.progress));
    }

    updateLevelSelectUI() {
        // Update locked/unlocked states
        for (let i = 1; i <= 2; i++) {
            const card = document.getElementById(`level-${i}-card`);
            const gradeDisplay = document.getElementById(`level-${i}-grade`);

            if (this.progress.unlockedLevels.includes(i)) {
                card.classList.remove('locked');
                if (this.progress.grades[i]) {
                    gradeDisplay.textContent = this.progress.grades[i];
                }
            } else {
                card.classList.add('locked');
            }
        }
    }

    selectLevel(level) {
        this.currentLevel = level;
        this.showLevelSelect(false);
        this.startGame();
    }

    showLevelSelect(show) {
        if (show) {
            this.levelSelectScreen.style.display = 'flex';
            this.updateLevelSelectUI();
        } else {
            this.levelSelectScreen.style.display = 'none';
        }
    }

    setupUI() {
        // Create health cards
        this.updatePlayerHealthUI();
        this.updateWeaponUI();

        // Create super level indicator
        if (!document.getElementById('super-level-indicator')) {
            const superMeterContainer = document.getElementById('super-meter');
            const indicator = document.createElement('div');
            indicator.id = 'super-level-indicator';
            indicator.style.cssText = `
                position: absolute;
                bottom: -25px;
                left: 50%;
                transform: translateX(-50%);
                color: #4ecdc4;
                font-size: 14px;
                font-weight: bold;
                text-shadow: 1px 1px 0 #000;
                white-space: nowrap;
            `;
            superMeterContainer.appendChild(indicator);
        }

        // Create combo/score display
        if (!document.getElementById('combo-score-display')) {
            const uiOverlay = document.getElementById('ui-overlay');
            const comboScoreDiv = document.createElement('div');
            comboScoreDiv.id = 'combo-score-display';
            comboScoreDiv.style.cssText = `
                position: absolute;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                text-align: right;
                pointer-events: none;
            `;
            uiOverlay.appendChild(comboScoreDiv);
        }
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

        // Update super level indicators
        const superLevel = Math.floor(this.player.superMeter / 100);
        const cardMarkers = document.querySelectorAll('.card-marker');

        // Update card marker colors based on available super level
        cardMarkers.forEach((marker, index) => {
            const level = index + 1; // 1-indexed
            if (superLevel >= level) {
                marker.style.background = '#ffeb3b'; // Gold for available
                marker.style.boxShadow = '0 0 10px #ffeb3b';
            } else {
                marker.style.background = '#000'; // Black for unavailable
                marker.style.boxShadow = 'none';
            }
        });

        // Update text indicator
        const indicator = document.getElementById('super-level-indicator');
        if (indicator) {
            const superNames = {
                0: 'SUPER: CHARGING...',
                1: 'SUPER I: READY!',
                2: 'SUPER II: READY!',
                3: 'SUPER III: READY!'
            };
            indicator.textContent = superNames[superLevel] || superNames[0];

            // Color based on level
            if (superLevel === 0) {
                indicator.style.color = '#666';
            } else if (superLevel === 1) {
                indicator.style.color = '#4ecdc4';
            } else if (superLevel === 2) {
                indicator.style.color = '#ffa500';
            } else if (superLevel === 3) {
                indicator.style.color = '#ffeb3b';
                indicator.style.textShadow = '1px 1px 0 #000, 0 0 10px #ffeb3b';
            }
        }
    }

    updateWeaponUI() {
        const weaponNames = {
            'peashooter': 'PEASHOOTER',
            'spread': 'SPREAD',
            'charge': 'CHARGE'
        };
        this.weaponDisplayUI.textContent = weaponNames[this.player.currentWeapon] || 'PEASHOOTER';

        // Add flash effect when switching weapons
        if (this.player.weaponSwitchFlash > 0) {
            this.weaponDisplayUI.classList.add('flash');
        } else {
            this.weaponDisplayUI.classList.remove('flash');
        }
    }

    updateComboScoreUI() {
        const comboDisplay = document.getElementById('combo-score-display');
        if (!comboDisplay) return;

        const multiplier = this.getComboMultiplier();
        const flashClass = this.comboFlash > 0 ? 'flash' : '';

        let html = `
            <div style="font-size: 18px; color: #ccc; text-shadow: 1px 1px 0 #000; margin-bottom: 5px;">
                SCORE: ${this.score.toLocaleString()}
            </div>
        `;

        if (this.combo > 0) {
            // Color based on multiplier
            let color = '#fff';
            if (multiplier >= 3.0) color = '#ffeb3b'; // Gold
            else if (multiplier >= 2.0) color = '#ffa500'; // Orange
            else if (multiplier >= 1.5) color = '#4ecdc4'; // Cyan

            const scale = this.comboFlash > 0 ? 1.2 : 1.0;

            html += `
                <div style="
                    font-size: ${Math.floor(32 * scale)}px;
                    font-weight: bold;
                    color: ${color};
                    text-shadow: 2px 2px 0 #000, ${this.comboFlash > 0 ? '0 0 20px ' + color : 'none'};
                    transition: all 0.1s ease;
                    margin-bottom: 5px;
                ">
                    ${this.combo} HIT${this.combo > 1 ? 'S' : ''}!
                </div>
                <div style="font-size: 14px; color: ${color}; text-shadow: 1px 1px 0 #000;">
                    ${multiplier}x MULTIPLIER
                </div>
            `;
        }

        comboDisplay.innerHTML = html;
    }

    update() {
        // Help overlay toggle (works in any state)
        if (this.input.isPressed('help')) {
            this.helpVisible = !this.helpVisible;
            this.helpOverlay.style.display = this.helpVisible ? 'flex' : 'none';
        }

        // If help is visible, don't process other inputs
        if (this.helpVisible) {
            this.input.update();
            return;
        }

        // Freeze frames (hit-stop effect)
        if (this.freezeFrames > 0) {
            this.freezeFrames--;
            this.draw(); // Still draw during freeze for visual feedback
            return;
        }

        // Pause handling
        if (this.gameState === 'playing' && this.input.isPressed('pause')) {
            this.isPaused = !this.isPaused;
        }

        if (this.isPaused) {
            this.input.update();
            return;
        }

        if (this.gameState === 'start') {
            if (this.input.isPressed('start')) {
                this.gameState = 'levelselect';
                this.startScreen.style.display = 'none';
                this.showLevelSelect(true);
            }
        } else if (this.gameState === 'levelselect') {
            // Level selection handled by button clicks
        } else if (this.gameState === 'playing') {
            this.updatePlaying();
        } else if (this.gameState === 'victory') {
            if (this.input.isPressed('start')) {
                this.returnToLevelSelect();
            }
        } else if (this.gameState === 'gameover') {
            if (this.input.isPressed('start')) {
                this.returnToLevelSelect();
            }
        }

        // Update screen shake
        if (this.screenShake > 0) {
            this.shakeX = (Math.random() - 0.5) * this.screenShake;
            this.shakeY = (Math.random() - 0.5) * this.screenShake;
            this.screenShake--;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }

        // Update combo flash timer
        if (this.comboFlash > 0) {
            this.comboFlash--;
        }

        this.particleSystem.update();
        this.input.update();
    }

    startGame() {
        // Initialize sound system on first user interaction
        if (!this.soundSystem.initialized) {
            this.soundSystem.init();
        }

        this.gameState = 'playing';
        this.startScreen.style.display = 'none';
        this.startTime = Date.now();
        this.parriesPerformed = 0;

        // Reset combo/score
        this.combo = 0;
        this.maxCombo = 0;
        this.score = 0;
        this.comboFlash = 0;
    }

    updatePlaying() {
        // Update platforms
        this.platforms.forEach(platform => platform.update());

        // Update pickups
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            this.pickups[i].update();

            // Check player collision
            if (this.pickups[i].checkCollision(this.player)) {
                if (this.pickups[i].type === 'health' && this.player.health < this.player.maxHealth) {
                    this.player.health++;
                    this.updatePlayerHealthUI();
                    this.pickups.splice(i, 1);
                    if (this.soundSystem.initialized) this.soundSystem.playJump(); // Reuse jump sound
                    continue;
                }
            }

            // Remove if collected or expired
            if (this.pickups[i].collected) {
                this.pickups.splice(i, 1);
            }
        }

        // Update player (with platforms)
        this.player.update(this.input, this.platforms);

        // Update boss (continues even when dead for death animation)
        this.boss.update(this.player, this.particleSystem);

        // Check collisions
        this.checkCollisions();

        // Update UI
        this.updatePlayerHealthUI();
        this.updateBossHealthUI();
        this.updateSuperMeterUI();
        this.updateWeaponUI();
        this.updateComboScoreUI();

        // Check win condition
        if (this.boss.dead && this.gameState === 'playing') {
            this.endTime = Date.now();
            if (this.soundSystem.initialized) this.soundSystem.playVictory();
            this.showVictoryScreen();
        }

        // Check lose condition
        if (this.player.health <= 0 && this.gameState === 'playing') {
            this.endTime = Date.now();
            this.showGameOverScreen();
        }
    }

    checkCollisions() {
        // Super beam vs Boss
        if (this.player.superBeamActive && this.player.superBeamHit) {
            this.boss.takeDamage(10, this.particleSystem);
            this.screenShake = 15;
            this.freezeFrames = 8; // Heavy freeze for super move
            this.particleSystem.createSuperExplosion(this.boss.x, this.boss.y); // Rainbow explosion
            this.player.superBeamHit = false; // Only hit once
        }

        // Player bullets vs Boss
        for (let i = this.player.bullets.length - 1; i >= 0; i--) {
            const bullet = this.player.bullets[i];

            // Check boss collision
            if (this.checkBulletBossCollision(bullet, this.boss)) {
                this.boss.takeDamage(bullet.damage, this.particleSystem);
                this.player.addSuper(5);
                this.addCombo(10); // 10 base points for boss hit

                // Boss-specific particle effects
                const bossType = this.boss.constructor.name === 'DragonBoss' ? 'dragon' : 'flower';
                this.particleSystem.createBossHitEffect(bullet.x, bullet.y, bossType);

                this.player.bullets.splice(i, 1);
                this.screenShake = 3;
                this.freezeFrames = 2; // Light freeze for regular hits
                if (this.soundSystem.initialized) this.soundSystem.playBossHit();
                continue;
            }

            // Check flytraps
            for (let j = this.boss.flytraps.length - 1; j >= 0; j--) {
                const flytrap = this.boss.flytraps[j];
                if (this.checkBulletFlytrapCollision(bullet, flytrap)) {
                    flytrap.takeDamage(bullet.damage);
                    this.player.addSuper(3);
                    this.addCombo(5); // 5 base points for minion hit
                    this.player.bullets.splice(i, 1);

                    // Spawn health pickup on death (10% chance)
                    if (flytrap.health <= 0 && Math.random() < 0.1) {
                        this.pickups.push(new Pickup(flytrap.x, flytrap.y, 'health'));
                    }
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
                    this.freezeFrames = 5; // Medium freeze for parry
                    this.addCombo(50); // 50 base points for parry!
                    continue;
                }
            }

            // Check player collision
            if (this.checkBulletPlayerCollision(bullet, this.player)) {
                if (this.player.takeDamage(1)) {
                    this.boss.bullets.splice(i, 1);
                    this.freezeFrames = 4; // Medium freeze for player damage
                    this.breakCombo(); // Break combo when taking damage
                }
            }
        }

        // Boss vs Player (contact damage)
        if (!this.player.invulnerable && !this.player.isDashing) {
            const dx = this.boss.x - this.player.x;
            const dy = this.boss.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 80) {
                if (this.player.takeDamage(1)) {
                    this.freezeFrames = 4;
                    this.breakCombo();
                }
            }
        }

        // Flytraps vs Player
        this.boss.flytraps.forEach(flytrap => {
            if (flytrap.isSnapping) {
                const dx = flytrap.x - this.player.x;
                const dy = flytrap.y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 50) {
                    if (this.player.takeDamage(1)) {
                        this.breakCombo();
                    }
                }
            }
        });

        // Root spikes vs Player
        if (!this.player.invulnerable && !this.player.isDashing) {
            this.boss.rootSpikes.forEach(spike => {
                if (spike.active) {
                    const dx = Math.abs(spike.x - this.player.x);
                    const dy = this.player.y + this.player.height - (spike.y - 80);

                    if (dx < 20 && dy > 0 && dy < 80) {
                        if (this.player.takeDamage(1)) {
                            this.breakCombo();
                        }
                    }
                }
            });
        }

        // Mega chomp vs Player
        if (!this.player.invulnerable && !this.player.isDashing && this.boss.chompHitbox) {
            const playerY = this.player.y + this.player.height / 2;
            const chompY = this.boss.chompHitbox.currentY;
            const halfHeight = this.boss.chompHitbox.height / 2;

            if (playerY > chompY - halfHeight && playerY < chompY + halfHeight) {
                if (this.player.takeDamage(1)) {
                    this.breakCombo();
                }
                this.screenShake = 10;
            }
        }

        // Petal shield contact damage (FlowerBoss only)
        if (!this.player.invulnerable && !this.player.isDashing && this.boss.petalShieldActive) {
            this.boss.petals.forEach(petal => {
                const petalX = this.boss.x + Math.cos(petal.angle) * petal.distance;
                const petalY = this.boss.y + Math.sin(petal.angle) * petal.distance;

                const dx = petalX - this.player.x;
                const dy = petalY - (this.player.y + this.player.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 40) {
                    if (this.player.takeDamage(1)) {
                        this.breakCombo();
                    }
                }
            });
        }

        // Dragon Boss specific collisions
        if (this.boss.constructor.name === 'DragonBoss') {
            // Tail Swipe vs Player
            if (!this.player.invulnerable && !this.player.isDashing && this.boss.tailSwipeActive) {
                const playerBottom = this.player.y + this.player.height;
                const tailY = 640;

                if (this.player.x > this.boss.tailSwipeX &&
                    this.player.x < this.boss.tailSwipeX + 100 &&
                    playerBottom >= tailY - 80) {
                    if (this.player.takeDamage(1)) {
                        this.breakCombo();
                    }
                }
            }

            // Dive Bomb Impact vs Player
            if (!this.player.invulnerable && !this.player.isDashing &&
                this.boss.diveBombActive && this.boss.diveBombPhase === 'diving' && this.boss.y > 600) {
                const dx = Math.abs(this.boss.x - this.player.x);
                if (dx < 150) {
                    if (this.player.takeDamage(1)) {
                        this.breakCombo();
                    }
                    this.screenShake = 15;
                }
            }

            // Fire Walls vs Player
            if (!this.player.invulnerable && !this.player.isDashing) {
                this.boss.fireWalls.forEach(wall => {
                    if (this.player.x > wall.x && this.player.x < wall.x + wall.width) {
                        if (this.player.takeDamage(1)) {
                            this.breakCombo();
                        }
                    }
                });
            }

            // Cloud Minions - Player bullets vs Minions
            for (let i = this.player.bullets.length - 1; i >= 0; i--) {
                const bullet = this.player.bullets[i];

                for (let j = this.boss.cloudMinions.length - 1; j >= 0; j--) {
                    const minion = this.boss.cloudMinions[j];
                    const dx = bullet.x - minion.x;
                    const dy = bullet.y - minion.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 30) {
                        minion.takeDamage(bullet.damage);
                        this.player.addSuper(3);
                        this.addCombo(5); // 5 base points for minion hit
                        this.player.bullets.splice(i, 1);
                        if (minion.dead) {
                            this.particleSystem.createExplosion(minion.x, minion.y, '#ddd', 15);

                            // Spawn health pickup on death (10% chance)
                            if (Math.random() < 0.1) {
                                this.pickups.push(new Pickup(minion.x, minion.y, 'health'));
                            }
                        }
                        break;
                    }
                }
            }

            // Cloud Minion bullets vs Player
            this.boss.cloudMinions.forEach(minion => {
                for (let i = minion.bullets.length - 1; i >= 0; i--) {
                    const bullet = minion.bullets[i];

                    // Check parry
                    if (this.input.isPressed('jump') && bullet.canParry) {
                        const dx = bullet.x - this.player.x;
                        const dy = bullet.y - (this.player.y + this.player.height / 2);
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 50) {
                            this.player.parry(bullet);
                            minion.bullets.splice(i, 1);
                            this.parriesPerformed++;
                            this.freezeFrames = 5; // Medium freeze for parry
                            this.addCombo(50); // 50 base points for parry!
                            continue;
                        }
                    }

                    // Check player collision
                    if (this.checkBulletPlayerCollision(bullet, this.player)) {
                        if (this.player.takeDamage(1)) {
                            minion.bullets.splice(i, 1);
                            this.freezeFrames = 4; // Medium freeze for player damage
                            this.breakCombo(); // Break combo when taking damage
                        }
                    }
                }
            });

            // Cloud Barriers - Block player bullets
            for (let i = this.player.bullets.length - 1; i >= 0; i--) {
                const bullet = this.player.bullets[i];

                for (let j = this.boss.cloudBarriers.length - 1; j >= 0; j--) {
                    const barrier = this.boss.cloudBarriers[j];
                    const dx = Math.abs(bullet.x - barrier.x);
                    const dy = Math.abs(bullet.y - barrier.y);

                    if (dx < barrier.width / 2 && dy < barrier.height / 2) {
                        barrier.health--;
                        this.player.bullets.splice(i, 1);
                        break;
                    }
                }
            }
        }
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

    getComboMultiplier() {
        if (this.combo >= 20) return 3.0;
        if (this.combo >= 10) return 2.0;
        if (this.combo >= 5) return 1.5;
        return 1.0;
    }

    addCombo(basePoints) {
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);

        const multiplier = this.getComboMultiplier();
        const points = Math.floor(basePoints * multiplier);
        this.score += points;

        // Visual feedback flash
        this.comboFlash = 15;

        // Milestone feedback (every 5 hits)
        if (this.combo % 5 === 0 && this.combo > 0) {
            this.particleSystem.createExplosion(640, 100, '#ffeb3b', 15);
        }
    }

    breakCombo() {
        if (this.combo > 0) {
            this.combo = 0;
            this.comboFlash = 0;
        }
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

        // Save progress
        const currentGrade = this.progress.grades[this.currentLevel];
        const gradeValues = {'S': 4, 'A': 3, 'B': 2, 'C': 1, 'D': 0};

        // Only save if new grade is better
        if (!currentGrade || gradeValues[grade] > gradeValues[currentGrade]) {
            this.progress.grades[this.currentLevel] = grade;
        }

        // Unlock next level
        const nextLevel = this.currentLevel + 1;
        if (this.levels[nextLevel] && !this.progress.unlockedLevels.includes(nextLevel)) {
            this.progress.unlockedLevels.push(nextLevel);
        }

        this.saveProgress();

        // Display results
        document.getElementById('grade-display').textContent = grade;
        document.getElementById('stats-display').innerHTML = `
            <p><strong>Level:</strong> ${this.levels[this.currentLevel].name}</p>
            <p><strong>Score:</strong> ${this.score.toLocaleString()}</p>
            <p><strong>Time:</strong> ${timeTaken.toFixed(1)}s</p>
            <p><strong>HP Remaining:</strong> ${hpRemaining}/3</p>
            <p><strong>Parries:</strong> ${this.parriesPerformed}</p>
            <p><strong>Max Combo:</strong> ${this.maxCombo} hits</p>
            <p><strong>Grade:</strong> ${grade}</p>
        `;
    }

    returnToLevelSelect() {
        this.gameState = 'levelselect';
        this.victoryScreen.style.display = 'none';
        this.gameoverScreen.style.display = 'none';
        this.showLevelSelect(true);
    }

    showGameOverScreen() {
        this.gameState = 'gameover';
        this.gameoverScreen.style.display = 'flex';

        // Calculate stats
        const timeTaken = (this.endTime - this.startTime) / 1000;
        const bossHPRemaining = Math.round((this.boss.health / this.boss.maxHealth) * 100);
        const damageDealt = 100 - bossHPRemaining;
        const currentPhase = this.boss.phase;

        // Get or initialize best attempt for this level
        if (!this.progress.bestAttempts[this.currentLevel]) {
            this.progress.bestAttempts[this.currentLevel] = {
                highestPhase: 0,
                lowestBossHP: 100,
                attempts: 0
            };
        }

        const bestAttempt = this.progress.bestAttempts[this.currentLevel];
        bestAttempt.attempts++;

        // Update best records
        let newRecord = false;
        if (currentPhase > bestAttempt.highestPhase) {
            bestAttempt.highestPhase = currentPhase;
            newRecord = true;
        }
        if (bossHPRemaining < bestAttempt.lowestBossHP) {
            bestAttempt.lowestBossHP = bossHPRemaining;
            newRecord = true;
        }

        this.saveProgress();

        // Display results
        const recordText = newRecord ? '<p style="color: #4ecdc4; font-size: 20px; margin: 10px 0;">🌟 NEW RECORD! 🌟</p>' : '';

        document.getElementById('gameover-stats').innerHTML = `
            <p style="font-size: 20px; margin: 30px 0;">You survived for ${timeTaken.toFixed(1)} seconds</p>
            <p style="font-size: 18px; margin: 10px 0;">Score: ${this.score.toLocaleString()}</p>
            <p style="font-size: 18px; margin: 10px 0;">Damage Dealt: ${damageDealt}%</p>
            <p style="font-size: 18px; margin: 10px 0;">Highest Phase: ${currentPhase}/3</p>
            <p style="font-size: 18px; margin: 10px 0;">Parries: ${this.parriesPerformed}</p>
            <p style="font-size: 18px; margin: 10px 0;">Max Combo: ${this.maxCombo} hits</p>
            ${recordText}
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #8B4513;">
                <p style="font-size: 16px; color: #ccc;">BEST ATTEMPT:</p>
                <p style="font-size: 14px; color: #ccc;">Highest Phase: ${bestAttempt.highestPhase}/3</p>
                <p style="font-size: 14px; color: #ccc;">Best Damage: ${100 - bestAttempt.lowestBossHP}%</p>
                <p style="font-size: 14px; color: #ccc;">Total Attempts: ${bestAttempt.attempts}</p>
            </div>
            <p style="font-size: 16px; margin: 30px 0; color: #ffeb3b;">Keep practicing! You'll get it!</p>
        `;
    }

    restartGame() {
        this.gameState = 'start';
        this.startScreen.style.display = 'flex';
        this.victoryScreen.style.display = 'none';
        this.gameoverScreen.style.display = 'none';
        this.setupGame();
        this.setupUI();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply screen shake
        this.ctx.save();
        this.ctx.translate(this.shakeX, this.shakeY);

        // Draw background layers
        this.drawBackground();

        // Draw game objects
        if (this.gameState === 'playing' || this.gameState === 'victory' || this.gameState === 'gameover') {
            // Draw platforms first
            this.platforms.forEach(platform => platform.draw(this.ctx));

            // Draw pickups
            this.pickups.forEach(pickup => pickup.draw(this.ctx));

            this.boss.draw(this.ctx);
            this.player.draw(this.ctx);
            this.particleSystem.draw(this.ctx);
        }

        // Draw ground
        this.drawGround();

        // Restore after screen shake
        this.ctx.restore();

        // Draw pause overlay
        if (this.isPaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#ffeb3b';
            this.ctx.font = 'bold 72px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);

            this.ctx.font = '24px Arial';
            this.ctx.fillText('Press ESC to resume', this.canvas.width / 2, this.canvas.height / 2 + 60);
        }

        // Draw boss intro overlay
        if (this.gameState === 'playing' && this.boss.introActive) {
            const alpha = Math.min(1, this.boss.introTimer / 60);
            this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.5})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Pulsing "READY!" text
            const pulse = 1 + Math.sin(this.boss.introTimer * 0.1) * 0.1;
            this.ctx.fillStyle = '#ffeb3b';
            this.ctx.font = `bold ${Math.floor(96 * pulse)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#ffeb3b';
            this.ctx.fillText('READY!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.shadowBlur = 0;
        }
    }

    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Distant mountains (parallax layer 1 - slowest)
        this.ctx.fillStyle = 'rgba(139, 90, 43, 0.2)';
        const mountainOffset1 = (Date.now() * 0.003) % (this.canvas.width + 400);
        for (let i = 0; i < 3; i++) {
            const x = (i * 600 - mountainOffset1) - 200;
            this.drawMountain(x, 500, 250, 150);
        }

        // Far clouds (parallax layer 2)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 4; i++) {
            const x = ((Date.now() * 0.005 + i * 400) % (this.canvas.width + 250)) - 125;
            const y = 80 + i * 50;
            this.drawCloud(x, y, 0.7);
        }

        // Mid-distance hills (parallax layer 3)
        this.ctx.fillStyle = 'rgba(107, 142, 35, 0.3)';
        const hillOffset = (Date.now() * 0.008) % (this.canvas.width + 300);
        for (let i = 0; i < 4; i++) {
            const x = (i * 450 - hillOffset) - 150;
            this.drawMountain(x, 550, 180, 100);
        }

        // Mid clouds (parallax layer 4)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 5; i++) {
            const x = ((Date.now() * 0.01 + i * 300) % (this.canvas.width + 200)) - 100;
            const y = 50 + i * 60;
            this.drawCloud(x, y, 1.0);
        }

        // Near clouds (parallax layer 5 - fastest)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 3; i++) {
            const x = ((Date.now() * 0.02 + i * 500) % (this.canvas.width + 250)) - 125;
            const y = 120 + i * 100;
            this.drawCloud(x, y, 1.2);
        }

        // Background plants (parallax layer 6)
        this.ctx.fillStyle = 'rgba(34, 139, 34, 0.3)';
        for (let i = 0; i < 10; i++) {
            const x = i * 150;
            const y = 640;
            this.ctx.fillRect(x, y, 20, -80);
        }
    }

    drawCloud(x, y, scale = 1.0) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 30 * scale, 0, Math.PI * 2);
        this.ctx.arc(x + 40 * scale, y, 40 * scale, 0, Math.PI * 2);
        this.ctx.arc(x + 80 * scale, y, 30 * scale, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawMountain(x, baseY, width, height) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, baseY);
        this.ctx.lineTo(x + width / 2, baseY - height);
        this.ctx.lineTo(x + width, baseY);
        this.ctx.closePath();
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
