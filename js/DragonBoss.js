import { Boss } from './Boss.js';
import { Bullet } from './Bullet.js';
import { CloudMinion } from './CloudMinion.js';

export class DragonBoss extends Boss {
    constructor(particleSystem) {
        super(900, 250, 'GRIM MATCHSTICK', 400);

        this.particleSystem = particleSystem;

        // Movement
        this.targetX = 900;
        this.targetY = 250;
        this.moveSpeed = 3;

        // Flight pattern
        this.flightTimer = 0;
        this.flightPattern = 'figure-8'; // 'figure-8', 'dive', 'retreat'

        // Minions
        this.cloudMinions = [];

        // Attack timers
        this.fireballTimer = 0;
        this.cloudSummonTimer = 0;
        this.tailSwipeTimer = 0;
        this.flameBreathTimer = 0;
        this.diveBombTimer = 0;
        this.ringOfFireTimer = 0;
        this.cloudBarrierTimer = 0;
        this.meteorShowerTimer = 0;
        this.flameTornadoTimer = 0;
        this.desperationDiveTimer = 0;
        this.fireWallTimer = 0;

        // Phase-specific states
        this.isPhase1 = true;
        this.isPhase2 = false;
        this.isPhase3 = false;
        this.isDesperate = false; // Below 10% HP

        // Tail swipe
        this.tailSwipeActive = false;
        this.tailSwipeX = 0;
        this.tailSwipeWarning = false;
        this.tailSwipeWarningTimer = 0;

        // Flame breath
        this.flameBreathActive = false;
        this.flameBreathTimer = 0;
        this.flameBreathDuration = 180; // 3 seconds
        this.flameBreathTargetY = 0;

        // Dive bomb
        this.diveBombActive = false;
        this.diveBombTargetX = 0;
        this.diveBombPhase = 'warning'; // 'warning', 'diving', 'recovering'
        this.diveBombTimer = 0;

        // Cloud barriers
        this.cloudBarriers = [];

        // Fire walls
        this.fireWalls = [];

        // Desperation dives
        this.desperationDivesRemaining = 0;

        // Flame tornado
        this.flameTornadoActive = false;
        this.flameTornadoTimer = 0;
        this.flameTornadoBullets = [];

        // Intro animation
        this.introActive = true;
        this.introTimer = 180; // 3 seconds
        this.introPhase = 'appear'; // 'appear', 'roar'

        // Visual effects
        this.wingFlapTimer = 0;
        this.breathParticles = [];

        // Enraged visual (Phase 3)
        this.enragedPulse = 0;

        // Meteor shower (frame-based)
        this.meteorShowerActive = false;
        this.meteorShowerSpawned = 0;
        this.meteorShowerMax = 0;
        this.meteorShowerSpawnTimer = 0;

        // Death animation (frame-based)
        this.deathExplosionsSpawned = 0;
        this.deathExplosionsMax = 50;
        this.deathExplosionTimer = 0;
    }

    update(player, particleSystem) {
        // Handle death animation (frame-based)
        if (this.dead && this.deathExplosionsSpawned < this.deathExplosionsMax) {
            this.deathExplosionTimer++;
            if (this.deathExplosionTimer >= 2) { // Every 2 frames (~30ms at 60fps)
                this.deathExplosionTimer = 0;
                this.deathExplosionsSpawned++;

                const x = this.x + (Math.random() - 0.5) * 150;
                const y = this.y + (Math.random() - 0.5) * 150;
                particleSystem.createExplosion(x, y, '#FFD700', 20);
            }
            return;
        }

        // Handle intro
        if (this.introActive) {
            this.updateIntro();
            return;
        }

        // Handle death (after animation completes)
        if (this.dead) {
            return;
        }

        // Update phase
        const currentPhase = this.getCurrentPhase();
        if (currentPhase !== this.phase) {
            this.onPhaseChange(currentPhase);
        }

        // Update position and movement
        this.updateMovement(player);

        // Update minions
        this.updateMinions(player);

        // Update cloud barriers
        this.updateCloudBarriers();

        // Update fire walls
        this.updateFireWalls();

        // Phase-specific updates
        if (this.isPhase1) {
            this.updatePhase1(player);
        } else if (this.isPhase2) {
            this.updatePhase2(player);
        } else if (this.isPhase3) {
            this.updatePhase3(player);
        }

        // Check desperate mode
        if (this.getHealthPercent() < 0.1 && !this.isDesperate) {
            this.isDesperate = true;
        }

        // Update bullets
        this.updateBullets();

        // Update visual effects
        this.updateVisuals();

        // Hit flash
        if (this.hitFlash > 0) this.hitFlash--;
    }

    updateIntro() {
        this.introTimer--;

        if (this.introPhase === 'appear') {
            // Dragon appears from the right side
            this.x += (900 - this.x) * 0.05;
            this.y += (250 - this.y) * 0.05;

            if (this.introTimer < 120) {
                this.introPhase = 'roar';
            }
        } else if (this.introPhase === 'roar') {
            // Roar animation (screen shake handled by game)
            if (this.introTimer <= 0) {
                this.introActive = false;
            }
        }
    }

    updateMovement(player) {
        this.flightTimer++;

        if (this.isPhase1) {
            // Phase 1: Poke through clouds at random positions
            if (this.flightTimer % 180 === 0) {
                this.targetX = 200 + Math.random() * 880;
                this.targetY = 150 + Math.random() * 100;
            }
        } else if (this.isPhase2 && !this.diveBombActive) {
            // Phase 2: Figure-8 pattern
            this.targetX = 640 + Math.cos(this.flightTimer * 0.02) * 300;
            this.targetY = 250 + Math.sin(this.flightTimer * 0.04) * 100;
        } else if (this.isPhase3 && !this.diveBombActive) {
            // Phase 3: Erratic movement
            if (this.flightTimer % 90 === 0) {
                this.targetX = 200 + Math.random() * 880;
                this.targetY = 150 + Math.random() * 150;
            }
        }

        // Smooth movement to target
        if (!this.diveBombActive) {
            this.x += (this.targetX - this.x) * 0.05;
            this.y += (this.targetY - this.y) * 0.05;
        }
    }

    updateMinions(player) {
        for (let i = this.cloudMinions.length - 1; i >= 0; i--) {
            this.cloudMinions[i].update(player);
            if (this.cloudMinions[i].dead) {
                this.cloudMinions.splice(i, 1);
            }
        }
    }

    updateCloudBarriers() {
        for (let i = this.cloudBarriers.length - 1; i >= 0; i--) {
            const barrier = this.cloudBarriers[i];
            barrier.lifetime--;

            if (barrier.health <= 0 || barrier.lifetime <= 0) {
                this.cloudBarriers.splice(i, 1);
            }
        }
    }

    updateFireWalls() {
        for (let i = this.fireWalls.length - 1; i >= 0; i--) {
            const wall = this.fireWalls[i];
            wall.x += wall.vx;

            if (wall.x < -100 || wall.x > 1380) {
                this.fireWalls.splice(i, 1);
            }
        }
    }

    updateVisuals() {
        this.wingFlapTimer++;

        if (this.isPhase3) {
            this.enragedPulse += 0.1;
        }

        // Update meteor shower spawning (frame-based)
        if (this.meteorShowerActive && this.meteorShowerSpawned < this.meteorShowerMax) {
            this.meteorShowerSpawnTimer++;
            if (this.meteorShowerSpawnTimer >= 6) { // Every 6 frames (~100ms at 60fps)
                this.meteorShowerSpawnTimer = 0;
                this.meteorShowerSpawned++;

                const bullet = new Bullet(
                    Math.random() * 1280,
                    -50,
                    0,
                    8,
                    1,
                    false,
                    '#FF6B00'
                );
                // Every 4th is parryable
                if (this.meteorShowerSpawned % 4 === 0) {
                    bullet.canParry = true;
                    bullet.color = '#ff69b4';
                }
                this.bullets.push(bullet);

                if (this.meteorShowerSpawned >= this.meteorShowerMax) {
                    this.meteorShowerActive = false;
                }
            }
        }
    }

    onPhaseChange(newPhase) {
        this.phase = newPhase;
        this.particleSystem.createExplosion(this.x, this.y, '#ff6b6b', 30);

        if (newPhase === 2) {
            this.isPhase1 = false;
            this.isPhase2 = true;
            this.isPhase3 = false;
        } else if (newPhase === 3) {
            this.isPhase1 = false;
            this.isPhase2 = false;
            this.isPhase3 = true;
        }
    }

    // ==================== PHASE 1 ATTACKS ====================

    updatePhase1(player) {
        this.fireballTimer++;
        this.cloudSummonTimer++;
        this.tailSwipeTimer++;

        // Fireball Spit (every 3 seconds)
        if (this.fireballTimer >= 180) {
            this.fireballSpit(player);
            this.fireballTimer = 0;
        }

        // Cloud Summon (every 8 seconds)
        if (this.cloudSummonTimer >= 480) {
            this.cloudSummon();
            this.cloudSummonTimer = 0;
        }

        // Tail Swipe (every 10 seconds)
        if (this.tailSwipeTimer >= 600) {
            this.tailSwipe(player);
            this.tailSwipeTimer = 0;
        }

        // Update tail swipe
        if (this.tailSwipeWarning) {
            this.tailSwipeWarningTimer++;
            if (this.tailSwipeWarningTimer >= 60) {
                this.tailSwipeActive = true;
                this.tailSwipeWarning = false;
            }
        }

        if (this.tailSwipeActive) {
            this.tailSwipeX += 15; // Sweep across screen
            if (this.tailSwipeX > 1380) {
                this.tailSwipeActive = false;
            }
        }
    }

    fireballSpit(player) {
        const angles = [-0.3, 0, 0.3]; // 30-degree spread
        const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);

        angles.forEach((offset, i) => {
            const angle = baseAngle + offset;
            const speed = 6;
            const bullet = new Bullet(
                this.x,
                this.y + 20,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                1,
                false,
                '#FF8C00' // Orange
            );
            // Every 5th fireball is parryable
            if (this.fireballTimer % 5 === 0 && i === 1) {
                bullet.canParry = true;
                bullet.color = '#ff69b4';
            }
            this.bullets.push(bullet);
        });
    }

    cloudSummon() {
        for (let i = 0; i < 2; i++) {
            const minion = new CloudMinion(
                200 + Math.random() * 880,
                100 + Math.random() * 200
            );
            this.cloudMinions.push(minion);
        }
    }

    tailSwipe(player) {
        this.tailSwipeWarning = true;
        this.tailSwipeWarningTimer = 0;
        this.tailSwipeX = -100;
    }

    // ==================== PHASE 2 ATTACKS ====================

    updatePhase2(player) {
        this.flameBreathTimer++;
        this.diveBombTimer++;
        this.ringOfFireTimer++;
        this.cloudBarrierTimer++;

        // Flame Breath (every 6 seconds)
        if (this.flameBreathTimer >= 360 && !this.flameBreathActive) {
            this.flameBreath(player);
            this.flameBreathTimer = 0;
        }

        // Update flame breath
        if (this.flameBreathActive) {
            this.updateFlameBreath(player);
        }

        // Dive Bomb (every 9 seconds)
        if (this.diveBombTimer >= 540 && !this.diveBombActive) {
            this.diveBomb(player);
            this.diveBombTimer = 0;
        }

        // Update dive bomb
        if (this.diveBombActive) {
            this.updateDiveBomb();
        }

        // Ring of Fire (every 12 seconds)
        if (this.ringOfFireTimer >= 720) {
            this.ringOfFire();
            this.ringOfFireTimer = 0;
        }

        // Cloud Barrier (every 15 seconds)
        if (this.cloudBarrierTimer >= 900) {
            this.cloudBarrier();
            this.cloudBarrierTimer = 0;
        }
    }

    flameBreath(player) {
        this.flameBreathActive = true;
        this.flameBreathTargetY = player.y + player.height / 2;
        this.flameBreathDuration = 180;
    }

    updateFlameBreath(player) {
        this.flameBreathDuration--;

        // Create continuous flame bullets
        if (this.flameBreathDuration % 3 === 0) {
            const bullet = new Bullet(
                this.x + 50,
                this.flameBreathTargetY + (Math.random() - 0.5) * 30,
                10,
                0,
                1,
                false,
                '#FF4500'
            );
            bullet.radius = 8;
            this.bullets.push(bullet);
        }

        if (this.flameBreathDuration <= 0) {
            this.flameBreathActive = false;
        }
    }

    diveBomb(player) {
        this.diveBombActive = true;
        this.diveBombPhase = 'warning';
        this.diveBombTargetX = player.x;
        this.diveBombTimer = 60; // 1 second warning
    }

    updateDiveBomb() {
        if (this.diveBombPhase === 'warning') {
            this.diveBombTimer--;
            if (this.diveBombTimer <= 0) {
                this.diveBombPhase = 'diving';
                this.targetY = 640; // Dive to ground
            }
        } else if (this.diveBombPhase === 'diving') {
            this.x += (this.diveBombTargetX - this.x) * 0.15;
            this.y += (640 - this.y) * 0.15;

            if (this.y > 600) {
                // Impact!
                this.particleSystem.createExplosion(this.x, 640, '#FF6B00', 50);
                this.diveBombPhase = 'recovering';
                this.diveBombTimer = 120; // 2 seconds recovery
            }
        } else if (this.diveBombPhase === 'recovering') {
            this.diveBombTimer--;
            this.targetY = 250; // Return to normal height
            this.y += (250 - this.y) * 0.05;

            if (this.diveBombTimer <= 0) {
                this.diveBombActive = false;
            }
        }
    }

    ringOfFire() {
        const bulletCount = 12;
        for (let i = 0; i < bulletCount; i++) {
            const angle = (Math.PI * 2 / bulletCount) * i;
            const bullet = new Bullet(
                this.x,
                this.y,
                Math.cos(angle) * 5,
                Math.sin(angle) * 5,
                1,
                false,
                '#FF6B00'
            );
            // Every 3rd fireball is parryable
            if (i % 3 === 0) {
                bullet.canParry = true;
                bullet.color = '#ff69b4';
            }
            this.bullets.push(bullet);
        }
    }

    cloudBarrier() {
        for (let i = 0; i < 3; i++) {
            this.cloudBarriers.push({
                x: 300 + i * 300,
                y: 350,
                width: 80,
                height: 100,
                health: 10,
                lifetime: 480 // 8 seconds
            });
        }
    }

    // ==================== PHASE 3 ATTACKS ====================

    updatePhase3(player) {
        this.meteorShowerTimer++;
        this.flameTornadoTimer++;
        this.fireWallTimer++;

        // Speed multiplier for Phase 3
        const speedMult = 1.3;

        // Meteor Shower (every 5 seconds)
        if (this.meteorShowerTimer >= 300 / speedMult) {
            this.meteorShower();
            this.meteorShowerTimer = 0;
        }

        // Flame Tornado (every 10 seconds)
        if (this.flameTornadoTimer >= 600 / speedMult && !this.flameTornadoActive) {
            this.flameTornado();
            this.flameTornadoTimer = 0;
        }

        // Update flame tornado
        if (this.flameTornadoActive) {
            this.updateFlameTornado();
        }

        // Fire Wall (every 12 seconds)
        if (this.fireWallTimer >= 720 / speedMult) {
            this.fireWall();
            this.fireWallTimer = 0;
        }

        // Desperation Dives (below 15% HP)
        if (this.getHealthPercent() < 0.15 && !this.diveBombActive && this.desperationDivesRemaining === 0) {
            this.desperationDives(player);
        }
    }

    meteorShower() {
        // Reset meteor shower counters (frame-based spawning in updateVisuals)
        this.meteorShowerActive = true;
        this.meteorShowerSpawned = 0;
        this.meteorShowerMax = 8 + Math.floor(Math.random() * 5);
        this.meteorShowerSpawnTimer = 0;
    }

    flameTornado() {
        this.flameTornadoActive = true;
        this.flameTornadoTimer = 0;

        // Create 20 flames in spiral pattern
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 4; // 2 full rotations
            const radius = 50 + i * 15;
            const bullet = new Bullet(
                640,
                360,
                Math.cos(angle) * 4,
                Math.sin(angle) * 4,
                1,
                false,
                '#FF4500'
            );
            // Pink at positions 5, 10, 15, 20
            if (i % 5 === 4) {
                bullet.canParry = true;
                bullet.color = '#ff69b4';
            }
            this.bullets.push(bullet);
        }

        // Deactivate after spawning
        this.flameTornadoActive = false;
    }

    updateFlameTornado() {
        // Handled in flameTornado spawn
    }

    fireWall() {
        const fromLeft = Math.random() > 0.5;
        this.fireWalls.push({
            x: fromLeft ? -100 : 1380,
            vx: fromLeft ? 3 : -3,
            width: 100,
            height: 720
        });
    }

    desperationDives(player) {
        this.desperationDivesRemaining = 5;
        this.diveBomb(player);
    }

    // ==================== DRAWING ====================

    draw(ctx) {
        // Draw cloud barriers
        this.cloudBarriers.forEach(barrier => {
            ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 3;
            ctx.fillRect(
                barrier.x - barrier.width / 2,
                barrier.y - barrier.height / 2,
                barrier.width,
                barrier.height
            );
            ctx.strokeRect(
                barrier.x - barrier.width / 2,
                barrier.y - barrier.height / 2,
                barrier.width,
                barrier.height
            );
        });

        // Draw fire walls
        this.fireWalls.forEach(wall => {
            const gradient = ctx.createLinearGradient(wall.x, 0, wall.x + wall.width, 0);
            gradient.addColorStop(0, 'rgba(255, 69, 0, 0)');
            gradient.addColorStop(0.5, 'rgba(255, 69, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(wall.x, 0, wall.width, wall.height);
        });

        // Draw tail swipe warning
        if (this.tailSwipeWarning) {
            ctx.fillStyle = `rgba(255, 0, 0, ${0.3 * (1 - this.tailSwipeWarningTimer / 60)})`;
            ctx.fillRect(0, 640 - 80, 1280, 80);
        }

        // Draw tail swipe
        if (this.tailSwipeActive) {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.tailSwipeX, 640 - 80, 100, 80);
        }

        // Draw dive bomb warning
        if (this.diveBombActive && this.diveBombPhase === 'warning') {
            const alpha = Math.sin(this.diveBombTimer * 0.2) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(this.diveBombTargetX, 640, 50, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw boss (intro or normal)
        if (this.introActive && this.introPhase === 'appear') {
            this.drawDragon(ctx, 0.5);
        } else {
            this.drawDragon(ctx, 1);
        }

        // Draw cloud minions
        this.cloudMinions.forEach(minion => minion.draw(ctx));

        // Draw bullets
        this.drawBullets(ctx);
    }

    drawDragon(ctx, alpha = 1) {
        ctx.save();
        ctx.globalAlpha = alpha;

        // Hit flash
        if (this.hitFlash > 0 && Math.floor(this.hitFlash / 2) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Enraged effect (Phase 3)
        if (this.isPhase3) {
            const pulse = 1 + Math.sin(this.enragedPulse) * 0.1;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FF4500';
        }

        // Body
        const bodyColor = this.isPhase3 ? '#FF6B00' : '#228B22';
        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;

        // Dragon body (serpentine)
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, 80, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.ellipse(this.x + 60, this.y - 20, 40, 35, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Snout
        ctx.beginPath();
        ctx.ellipse(this.x + 90, this.y - 15, 20, 15, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.x + 70, this.y - 25, 8, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        const wingFlap = Math.sin(this.wingFlapTimer * 0.1) * 10;
        ctx.fillStyle = this.isPhase3 ? '#FF8C00' : '#32CD32';

        // Left wing
        ctx.beginPath();
        ctx.moveTo(this.x - 20, this.y);
        ctx.lineTo(this.x - 100, this.y - 60 + wingFlap);
        ctx.lineTo(this.x - 80, this.y + 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right wing
        ctx.beginPath();
        ctx.moveTo(this.x - 20, this.y);
        ctx.lineTo(this.x - 100, this.y + 60 - wingFlap);
        ctx.lineTo(this.x - 80, this.y - 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Tail
        ctx.beginPath();
        ctx.moveTo(this.x - 80, this.y);
        ctx.quadraticCurveTo(this.x - 150, this.y + 30, this.x - 200, this.y + 10);
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Spikes
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x - 40 + i * 20, this.y - 50);
            ctx.lineTo(this.x - 35 + i * 20, this.y - 70);
            ctx.lineTo(this.x - 30 + i * 20, this.y - 50);
            ctx.closePath();
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    onDeath(particleSystem) {
        super.onDeath(particleSystem);
        // Reset death animation counters (frame-based spawning in update method)
        this.deathExplosionsSpawned = 0;
        this.deathExplosionTimer = 0;
    }
}
