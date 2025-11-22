import { Boss } from './Boss.js';
import { Bullet } from './Bullet.js';

class VenusFlytrap {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.health = 2;
        this.maxHealth = 2;
        this.dead = false;
        this.snapTimer = 0;
        this.snapCooldown = 60;
        this.isSnapping = false;
        this.width = 40;
        this.height = 50;
    }

    update(player) {
        this.snapTimer++;

        if (this.snapTimer >= this.snapCooldown) {
            const dx = player.x - this.x;
            const distance = Math.abs(dx);

            if (distance < 100) {
                this.isSnapping = true;
                this.snapTimer = 0;
            }
        }

        if (this.isSnapping && this.snapTimer > 10) {
            this.isSnapping = false;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.dead = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Stem
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -30);
        ctx.stroke();

        // Trap head
        const openAmount = this.isSnapping ? 0.2 : 0.8;

        // Upper jaw
        ctx.fillStyle = '#32CD32';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, -30, 20, 15 * openAmount, -Math.PI * 0.3, 0, Math.PI);
        ctx.fill();
        ctx.stroke();

        // Lower jaw
        ctx.beginPath();
        ctx.ellipse(0, -30, 20, 15 * openAmount, Math.PI * 0.3, 0, Math.PI);
        ctx.fill();
        ctx.stroke();

        // Teeth
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 5; i++) {
            const x = -15 + i * 7;
            ctx.fillRect(x, -30 - 8 * openAmount, 3, 6);
            ctx.fillRect(x, -30 + 2 * openAmount, 3, 6);
        }

        ctx.restore();
    }
}

export class FlowerBoss extends Boss {
    constructor(particleSystem) {
        super(200, 400, 'CAGNEY CARNATION', 300);
        this.particleSystem = particleSystem;

        // Visual properties
        this.width = 120;
        this.height = 150;
        this.angle = 0;
        this.targetY = this.y;

        // Phase tracking
        this.previousPhase = 1;
        this.phaseTransitioning = false;
        this.transitionTimer = 0;

        // Attack patterns
        this.attackPattern = 0;
        this.attackDelay = 60;

        // Minions
        this.flytraps = [];
        this.minions = [];

        // Phase 2 specific
        this.isRooted = true;
        this.moveSpeed = 2;
        this.moveDirection = 1;

        // Phase 3 specific
        this.isEnraged = false;

        // Petal shield
        this.petalShieldActive = false;
        this.petalShieldTimer = 0;
        this.petals = [];

        // Multi-shot attacks (replaces setTimeout)
        this.multiShotAttack = null; // {type, count, current, interval, timer, targetX, targetY}

        // Root spikes
        this.rootSpikes = [];

        // Mega chomp
        this.isChomping = false;
        this.chompTimer = 0;
        this.chompWarningTimer = 0;
        this.chompHitbox = null;

        // Intro animation
        this.introActive = true;
        this.introTimer = 120; // 2 seconds
        this.introY = 800; // Start below screen
    }

    update(player, particleSystem) {
        // Handle intro animation
        if (this.introActive) {
            this.introTimer--;
            // Rise from below
            this.introY += (this.y - this.introY) * 0.1;

            if (this.introTimer <= 0) {
                this.introActive = false;
                this.introY = this.y;
            }
            return; // Don't do anything else during intro
        }

        const currentPhase = this.getCurrentPhase();

        // Check for phase transition
        if (currentPhase !== this.previousPhase && !this.phaseTransitioning) {
            this.startPhaseTransition(currentPhase);
        }

        if (this.phaseTransitioning) {
            this.updatePhaseTransition();
            this.updateBullets();
            return;
        }

        this.stateTimer++;
        this.attackTimer++;

        if (this.hitFlash > 0) this.hitFlash--;

        // Phase-specific updates
        if (currentPhase === 1) {
            this.updatePhase1(player);
        } else if (currentPhase === 2) {
            this.updatePhase2(player);
        } else if (currentPhase === 3) {
            this.updatePhase3(player);
        }

        // Update flytraps
        for (let i = this.flytraps.length - 1; i >= 0; i--) {
            this.flytraps[i].update(player);
            if (this.flytraps[i].dead) {
                particleSystem.createExplosion(
                    this.flytraps[i].x,
                    this.flytraps[i].y,
                    '#32CD32',
                    15
                );
                this.flytraps.splice(i, 1);
            }
        }

        this.updateBullets();
        this.updatePetalShield();
        this.updateMultiShotAttack(player);
        this.updateRootSpikes();
        this.updateMegaChomp(player);
    }

    startPhaseTransition(newPhase) {
        this.phaseTransitioning = true;
        this.transitionTimer = 60;
        this.previousPhase = newPhase;

        // Clear all bullets and minions
        this.bullets = [];
        this.flytraps = [];

        // Create transition effect
        this.particleSystem.createExplosion(this.x, this.y, '#ffeb3b', 30);

        if (newPhase === 2) {
            this.isRooted = false;
        } else if (newPhase === 3) {
            this.isEnraged = true;
        }
    }

    updatePhaseTransition() {
        this.transitionTimer--;

        // Flash effect
        if (this.transitionTimer % 10 < 5) {
            this.hitFlash = 5;
        }

        if (this.transitionTimer <= 0) {
            this.phaseTransitioning = false;
            this.attackTimer = 0;
        }
    }

    updatePhase1(player) {
        // Seed spit attack
        if (this.attackTimer >= 120) {
            this.attackPattern++;

            if (this.attackPattern % 3 === 0) {
                // Pollen cloud
                this.spawnPollenCloud();
            } else if (this.attackPattern % 3 === 1) {
                // Seed spit
                this.seedSpit(player);
            } else {
                // Spawn flytraps
                this.spawnFlytraps();
            }

            this.attackTimer = 0;
        }
    }

    updatePhase2(player) {
        // Move up and down
        this.targetY = 300 + Math.sin(this.stateTimer * 0.02) * 100;
        this.y += (this.targetY - this.y) * 0.05;

        if (this.attackTimer >= 100) {
            this.attackPattern++;

            if (this.attackPattern % 4 === 0) {
                this.homingSeeds(player);
            } else if (this.attackPattern % 4 === 1) {
                this.rootSpikes();
            } else if (this.attackPattern % 4 === 2) {
                this.activatePetalShield();
            } else {
                this.seedSpit(player);
            }

            this.attackTimer = 0;
        }
    }

    updatePhase3(player) {
        // More aggressive movement
        this.targetY = 250 + Math.sin(this.stateTimer * 0.03) * 150;
        this.y += (this.targetY - this.y) * 0.08;

        if (this.attackTimer >= 70) {
            this.attackPattern++;

            if (this.attackPattern % 5 === 0) {
                this.rapidSeedBarrage(player);
            } else if (this.attackPattern % 5 === 1) {
                this.megaChomp(player);
            } else if (this.attackPattern % 5 === 2) {
                this.spawnMinions();
            } else if (this.attackPattern % 5 === 3) {
                this.homingSeeds(player);
            } else {
                this.rootSpikes();
            }

            this.attackTimer = 0;
        }

        // Desperation mode
        if (this.getHealthPercent() < 0.1 && this.attackTimer % 30 === 0) {
            this.seedSpit(player);
        }
    }

    seedSpit(player) {
        const count = this.phase === 1 ? 3 : 5;
        const targetX = player.x;
        const targetY = player.y;

        for (let i = 0; i < count; i++) {
            const angle = Math.atan2(targetY - this.y, targetX - this.x);
            const spread = (i - Math.floor(count / 2)) * 0.2;
            const finalAngle = angle + spread;

            const speed = 6;
            const vx = Math.cos(finalAngle) * speed;
            const vy = Math.sin(finalAngle) * speed;

            const bullet = new Bullet(this.x + 40, this.y, vx, vy, 1, false, '#8B4513');
            this.bullets.push(bullet);
        }
    }

    spawnPollenCloud() {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const bullet = new Bullet(this.x, this.y - 30, vx, vy, 1, false, '#FFD700');
            bullet.canParry = true; // Parryable!
            bullet.radius = 10;
            this.bullets.push(bullet);
        }
    }

    spawnFlytraps() {
        if (this.flytraps.length < 4) {
            const count = 2;
            for (let i = 0; i < count; i++) {
                const x = 300 + Math.random() * 800;
                const flytrap = new VenusFlytrap(x, 640);
                this.flytraps.push(flytrap);
            }
        }
    }

    homingSeeds(player) {
        this.multiShotAttack = {
            type: 'homing',
            count: 4,
            current: 0,
            interval: 12, // frames (200ms at 60fps)
            timer: 0,
            targetX: player.x,
            targetY: player.y
        };
    }

    rootSpikes() {
        // Create ground spikes that travel horizontally with hitboxes
        for (let i = 0; i < 10; i++) {
            this.rootSpikes.push({
                x: 100 + i * 120,
                y: 640,
                spawnTimer: i * 6, // 100ms intervals at 60fps
                active: false,
                lifetime: 30, // Active for 0.5 seconds
                age: 0
            });
        }
    }

    activatePetalShield() {
        this.petalShieldActive = true;
        this.petalShieldTimer = 180;

        // Create rotating petals
        this.petals = [];
        for (let i = 0; i < 6; i++) {
            this.petals.push({
                angle: (Math.PI * 2 * i) / 6,
                distance: 80
            });
        }
    }

    updatePetalShield() {
        if (!this.petalShieldActive) return;

        this.petalShieldTimer--;

        // Rotate petals
        this.petals.forEach(petal => {
            petal.angle += 0.05;
        });

        if (this.petalShieldTimer <= 0) {
            // Shoot petals outward
            this.petals.forEach(petal => {
                const vx = Math.cos(petal.angle) * 8;
                const vy = Math.sin(petal.angle) * 8;
                const bullet = new Bullet(
                    this.x + Math.cos(petal.angle) * petal.distance,
                    this.y + Math.sin(petal.angle) * petal.distance,
                    vx, vy, 1, false, '#FF1493'
                );
                this.bullets.push(bullet);
            });

            this.petalShieldActive = false;
            this.petals = [];
        }
    }

    rapidSeedBarrage(player) {
        this.multiShotAttack = {
            type: 'rapid',
            count: 12,
            current: 0,
            interval: 6, // frames (100ms at 60fps)
            timer: 0,
            targetX: player.x,
            targetY: player.y
        };
    }

    megaChomp(player) {
        // Boss extends neck across screen with actual hitbox
        this.chompWarningTimer = 120; // 2 second warning
        this.isChomping = false;
        this.chompTimer = 0;
    }

    spawnMinions() {
        if (this.flytraps.length < 4) {
            for (let i = 0; i < 4; i++) {
                const x = 200 + i * 250;
                const flytrap = new VenusFlytrap(x, 640);
                this.flytraps.push(flytrap);
            }
        }
    }

    updateMultiShotAttack(player) {
        if (!this.multiShotAttack) return;

        const attack = this.multiShotAttack;
        attack.timer++;

        if (attack.timer >= attack.interval) {
            attack.timer = 0;
            attack.current++;

            // Fire bullet based on attack type
            if (attack.type === 'homing') {
                const angle = Math.atan2(player.y - this.y, player.x - this.x);
                const speed = 4;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;

                const bullet = new Bullet(this.x + 40, this.y, vx, vy, 1, false, '#FF69B4');
                bullet.canParry = true;
                bullet.radius = 12;
                this.bullets.push(bullet);
            } else if (attack.type === 'rapid') {
                const angle = Math.atan2(player.y - this.y, player.x - this.x);
                const speed = 7;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;

                const bullet = new Bullet(this.x + 40, this.y, vx, vy, 1, false, '#8B4513');

                // Every 3rd seed is parryable
                if (attack.current % 3 === 0) {
                    bullet.canParry = true;
                    bullet.color = '#FF69B4';
                }

                this.bullets.push(bullet);
            }

            // Check if attack complete
            if (attack.current >= attack.count) {
                this.multiShotAttack = null;
            }
        }
    }

    updateRootSpikes() {
        for (let i = this.rootSpikes.length - 1; i >= 0; i--) {
            const spike = this.rootSpikes[i];

            if (!spike.active) {
                spike.spawnTimer--;
                if (spike.spawnTimer <= 0) {
                    spike.active = true;
                    this.particleSystem.createExplosion(spike.x, spike.y, '#8B4513', 8);
                }
            } else {
                spike.age++;
                if (spike.age >= spike.lifetime) {
                    this.rootSpikes.splice(i, 1);
                }
            }
        }
    }

    updateMegaChomp(player) {
        if (this.chompWarningTimer > 0) {
            this.chompWarningTimer--;

            // Flash warning
            if (this.chompWarningTimer % 20 < 10) {
                this.particleSystem.createExplosion(this.x, this.y, '#32CD32', 3);
            }

            if (this.chompWarningTimer === 0) {
                this.isChomping = true;
                this.chompTimer = 40; // Chomp lasts 40 frames

                // Create sweeping hitbox
                this.chompHitbox = {
                    startY: 100,
                    currentY: 100,
                    endY: 600,
                    speed: 12.5, // (600-100)/40 = 12.5 pixels per frame
                    width: 1280,
                    height: 80
                };
            }
        }

        if (this.isChomping) {
            this.chompTimer--;
            this.chompHitbox.currentY += this.chompHitbox.speed;

            // Create visual effects
            if (this.chompTimer % 5 === 0) {
                this.particleSystem.createExplosion(
                    640,
                    this.chompHitbox.currentY,
                    '#32CD32',
                    10
                );
            }

            if (this.chompTimer <= 0) {
                this.isChomping = false;
                this.chompHitbox = null;
            }
        }
    }

    draw(ctx) {
        ctx.save();

        // Hit flash
        if (this.hitFlash > 0) {
            ctx.filter = 'brightness(2)';
        }

        // Use intro position if intro is active
        const drawY = this.introActive ? this.introY : this.y;
        ctx.translate(this.x, drawY);

        // Stem/roots
        ctx.strokeStyle = this.isRooted ? '#228B22' : '#8B4513';
        ctx.lineWidth = 12;
        ctx.beginPath();

        if (this.isRooted) {
            // Rooted - thick stem
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 200);
            ctx.stroke();

            // Roots
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(0, 200);
            ctx.lineTo(-30, 250);
            ctx.moveTo(0, 200);
            ctx.lineTo(30, 250);
            ctx.stroke();
        } else {
            // Unrooted - wiggly stem
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(
                Math.sin(this.stateTimer * 0.1) * 20,
                100,
                0,
                200
            );
            ctx.stroke();
        }

        // Flower head
        const headSize = this.isEnraged ? 70 : 60;

        // Petals
        ctx.fillStyle = this.isEnraged ? '#FF4500' : '#FFD700';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 + this.stateTimer * 0.01;
            ctx.save();
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.ellipse(0, -headSize, 25, 40, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        // Center face
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(0, 0, headSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Angry face
        ctx.fillStyle = '#000';

        // Eyes
        const eyeY = this.isEnraged ? -15 : -10;
        ctx.beginPath();
        ctx.moveTo(-25, eyeY);
        ctx.lineTo(-15, eyeY - 10);
        ctx.lineTo(-5, eyeY);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(5, eyeY);
        ctx.lineTo(15, eyeY - 10);
        ctx.lineTo(25, eyeY);
        ctx.closePath();
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        if (this.isEnraged) {
            // Angry frown
            ctx.arc(0, 20, 25, 0.2, Math.PI - 0.2);
        } else {
            // Normal frown
            ctx.arc(0, 15, 20, 0.3, Math.PI - 0.3);
        }
        ctx.stroke();

        // Petal shield
        if (this.petalShieldActive) {
            this.petals.forEach(petal => {
                const x = Math.cos(petal.angle) * petal.distance;
                const y = Math.sin(petal.angle) * petal.distance;

                ctx.fillStyle = '#FF1493';
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(x, y, 15, 25, petal.angle, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });
        }

        ctx.restore();

        // Draw flytraps
        this.flytraps.forEach(trap => trap.draw(ctx));

        // Draw bullets
        this.drawBullets(ctx);

        // Draw root spikes
        this.rootSpikes.forEach(spike => {
            if (spike.active) {
                ctx.save();
                ctx.fillStyle = '#8B4513';
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;

                // Draw spike shape
                ctx.beginPath();
                ctx.moveTo(spike.x, spike.y);
                ctx.lineTo(spike.x - 15, spike.y - 60);
                ctx.lineTo(spike.x, spike.y - 80);
                ctx.lineTo(spike.x + 15, spike.y - 60);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.restore();
            }
        });

        // Draw mega chomp
        if (this.isChomping && this.chompHitbox) {
            ctx.save();

            // Draw sweeping danger zone
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(
                0,
                this.chompHitbox.currentY - this.chompHitbox.height / 2,
                this.chompHitbox.width,
                this.chompHitbox.height
            );

            // Draw chomping mouth
            ctx.strokeStyle = '#32CD32';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(0, this.chompHitbox.currentY);
            ctx.lineTo(1280, this.chompHitbox.currentY);
            ctx.stroke();

            // Draw teeth
            for (let i = 0; i < 20; i++) {
                const x = i * 64;
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.moveTo(x, this.chompHitbox.currentY - 20);
                ctx.lineTo(x + 10, this.chompHitbox.currentY);
                ctx.lineTo(x + 20, this.chompHitbox.currentY - 20);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(x, this.chompHitbox.currentY + 20);
                ctx.lineTo(x + 10, this.chompHitbox.currentY);
                ctx.lineTo(x + 20, this.chompHitbox.currentY + 20);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        }
    }

    onDeath(particleSystem) {
        super.onDeath(particleSystem);

        // Create dramatic death explosion
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const x = this.x + (Math.random() - 0.5) * 100;
                const y = this.y + (Math.random() - 0.5) * 100;
                particleSystem.createExplosion(x, y, '#FFD700', 10);
            }, i * 20);
        }
    }
}
