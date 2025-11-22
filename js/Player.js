import { Bullet, SpreadBullet, ChargeBullet } from './Bullet.js';

export class Player {
    constructor(x, y, particleSystem, soundSystem = null) {
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 60;
        this.vx = 0;
        this.vy = 0;
        this.particleSystem = particleSystem;
        this.soundSystem = soundSystem;

        // Movement
        this.speed = 4;
        this.jumpPower = 12;
        this.gravity = 0.6;
        this.onGround = false;
        this.canDoubleJump = true;

        // Combat
        this.health = 3;
        this.maxHealth = 3;
        this.bullets = [];
        this.shootCooldown = 0;
        this.shootRate = 8; // frames between shots

        // Dash
        this.dashSpeed = 15;
        this.dashDuration = 12;
        this.dashCooldown = 0;
        this.dashCooldownMax = 40;
        this.isDashing = false;
        this.dashTimer = 0;
        this.dashDir = { x: 0, y: 0 };
        this.invulnerable = false;

        // Super meter
        this.superMeter = 0;
        this.maxSuper = 300;
        this.superMovesUsed = 0;

        // Weapon system
        this.currentWeapon = 'peashooter'; // 'peashooter', 'spread', 'charge'
        this.chargeLevel = 0;
        this.maxCharge = 60;
        this.isCharging = false;

        // Animation
        this.facing = 1; // 1 = right, -1 = left
        this.animFrame = 0;
        this.animTimer = 0;

        // Invincibility frames
        this.iframeTimer = 0;
        this.iframeDuration = 60;

        // Ground level
        this.groundY = 580;

        // Weapon switching
        this.weaponSwitchFlash = 0;

        // Super beam (Level III)
        this.superBeamActive = false;
        this.superBeamTimer = 0;
        this.superBeamHit = false;

        // Super Level I energy bullets
        this.superDashBulletTimer = 0;
        this.superDashBulletsSpawned = 0;
        this.superDashBulletsMax = 10;
    }

    update(input) {
        if (this.isDashing) {
            this.updateDash();
        } else {
            this.updateMovement(input);
            this.updateShooting(input);
            this.updateWeaponSwitching(input);
            this.updateSuperMoves(input);
        }

        this.updateBullets();
        this.updateCooldowns();
        this.updateAnimation();

        // Keep in bounds
        this.x = Math.max(24, Math.min(1256, this.x));
    }

    updateMovement(input) {
        // Horizontal movement
        this.vx = 0;
        if (input.isDown('left')) {
            this.vx = -this.speed;
            this.facing = -1;
        }
        if (input.isDown('right')) {
            this.vx = this.speed;
            this.facing = 1;
        }

        this.x += this.vx;

        // Gravity and vertical movement
        if (!this.onGround) {
            this.vy += this.gravity;
        }

        this.y += this.vy;

        // Ground collision
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.vy = 0;
            this.onGround = true;
            this.canDoubleJump = true;
        } else {
            this.onGround = false;
        }

        // Jumping
        if (input.isPressed('jump')) {
            if (this.onGround) {
                this.vy = -this.jumpPower;
                this.onGround = false;
                if (this.soundSystem) this.soundSystem.playJump();
            } else if (this.canDoubleJump) {
                this.vy = -this.jumpPower;
                this.canDoubleJump = false;
                this.particleSystem.createDashEffect(this.x, this.y + this.height);
                if (this.soundSystem) this.soundSystem.playJump();
            }
        }

        // Dash
        if (input.isPressed('dash') && this.dashCooldown === 0) {
            this.startDash(input);
        }
    }

    updateShooting(input) {
        // Charge shot logic
        if (this.currentWeapon === 'charge') {
            if (input.isDown('shoot')) {
                this.isCharging = true;
                this.chargeLevel = Math.min(this.maxCharge, this.chargeLevel + 1);
            } else if (this.isCharging) {
                // Release charge shot
                const chargeLevel = Math.floor(this.chargeLevel / 20) + 1; // 1-3
                const bullet = new ChargeBullet(
                    this.x + (this.facing > 0 ? 30 : -30),
                    this.y + 20,
                    this.facing * 10,
                    0,
                    chargeLevel
                );
                this.bullets.push(bullet);
                this.isCharging = false;
                this.chargeLevel = 0;
            }
        } else {
            // Normal shooting
            if (input.isDown('shoot') && this.shootCooldown === 0) {
                this.shoot();
                this.shootCooldown = this.shootRate;
            }
        }
    }

    shoot() {
        if (this.soundSystem) this.soundSystem.playShoot();

        if (this.currentWeapon === 'peashooter') {
            const bullet = new Bullet(
                this.x + (this.facing > 0 ? 30 : -30),
                this.y + 20,
                this.facing * 12,
                0,
                1,
                true,
                '#ffeb3b'
            );
            this.bullets.push(bullet);
        } else if (this.currentWeapon === 'spread') {
            // Fire 3 bullets in spread pattern
            for (let i = -1; i <= 1; i++) {
                const angle = (this.facing > 0 ? 0 : Math.PI) + (i * 0.3);
                const bullet = new SpreadBullet(
                    this.x + (this.facing > 0 ? 30 : -30),
                    this.y + 20,
                    angle,
                    10,
                    0.6
                );
                this.bullets.push(bullet);
            }
        }
    }

    startDash(input) {
        // Determine dash direction
        let dx = 0;
        let dy = 0;

        if (input.isDown('left')) dx = -1;
        if (input.isDown('right')) dx = 1;
        if (input.isDown('up')) dy = -1;
        if (input.isDown('down')) dy = 1;

        // Default to facing direction if no input
        if (dx === 0 && dy === 0) {
            dx = this.facing;
        }

        // Normalize direction
        const mag = Math.sqrt(dx * dx + dy * dy);
        if (mag > 0) {
            this.dashDir.x = dx / mag;
            this.dashDir.y = dy / mag;
        }

        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.invulnerable = true;
        this.dashCooldown = this.dashCooldownMax;
        if (this.soundSystem) this.soundSystem.playDash();
    }

    updateDash() {
        this.x += this.dashDir.x * this.dashSpeed;
        this.y += this.dashDir.y * this.dashSpeed;

        // Keep above ground during dash
        if (this.y > this.groundY) {
            this.y = this.groundY;
        }

        // Create trail effect
        if (this.dashTimer % 2 === 0) {
            this.particleSystem.createDashEffect(this.x, this.y + this.height / 2);
        }

        this.dashTimer--;
        if (this.dashTimer <= 0) {
            this.isDashing = false;
            this.invulnerable = false;
            this.vy = 0; // Reset vertical velocity after dash
        }
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            if (this.bullets[i].dead) {
                this.bullets.splice(i, 1);
            }
        }
    }

    updateCooldowns() {
        if (this.shootCooldown > 0) this.shootCooldown--;
        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.iframeTimer > 0) {
            this.iframeTimer--;
            if (this.iframeTimer === 0) {
                this.invulnerable = false;
            }
        }

        // Super beam
        if (this.superBeamActive) {
            this.superBeamTimer--;
            if (this.superBeamTimer <= 0) {
                this.superBeamActive = false;
                this.superBeamHit = false;
            }
        }

        // Super Level I energy bullets (frame-based)
        if (this.superDashBulletsSpawned < this.superDashBulletsMax && this.isDashing) {
            this.superDashBulletTimer++;
            if (this.superDashBulletTimer >= 2) { // Every 2 frames (~30ms at 60fps)
                this.superDashBulletTimer = 0;
                this.superDashBulletsSpawned++;

                const angle = Math.random() * Math.PI * 2;
                const speed = 8;
                const bullet = new Bullet(
                    this.x,
                    this.y + this.height / 2,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    2,
                    true,
                    '#4ecdc4'
                );
                this.bullets.push(bullet);
            }
        }
    }

    updateAnimation() {
        this.animTimer++;
        if (this.animTimer >= 8) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }

    takeDamage(amount) {
        if (this.invulnerable || this.iframeTimer > 0) return false;

        this.health -= amount;
        this.iframeTimer = this.iframeDuration;
        this.invulnerable = true;
        this.particleSystem.createHitEffect(this.x, this.y + this.height / 2);
        if (this.soundSystem) this.soundSystem.playHit();

        return true;
    }

    addSuper(amount) {
        this.superMeter = Math.min(this.maxSuper, this.superMeter + amount);
    }

    canParry(bullet) {
        return bullet.canParry && !bullet.isPlayerBullet;
    }

    parry(bullet) {
        this.addSuper(30);
        this.vy = -this.jumpPower * 0.8; // Bounce
        this.canDoubleJump = true;
        this.particleSystem.createParryEffect(bullet.x, bullet.y);
        if (this.soundSystem) this.soundSystem.playParry();
        return true;
    }

    updateWeaponSwitching(input) {
        const weapons = ['peashooter', 'spread', 'charge'];
        const currentIndex = weapons.indexOf(this.currentWeapon);

        if (input.isPressed('weaponNext')) {
            const nextIndex = (currentIndex + 1) % weapons.length;
            this.currentWeapon = weapons[nextIndex];
            this.weaponSwitchFlash = 30;
            if (this.soundSystem) this.soundSystem.playJump(); // Reuse jump sound for switch
        } else if (input.isPressed('weaponPrev')) {
            const prevIndex = (currentIndex - 1 + weapons.length) % weapons.length;
            this.currentWeapon = weapons[prevIndex];
            this.weaponSwitchFlash = 30;
            if (this.soundSystem) this.soundSystem.playJump(); // Reuse jump sound for switch
        }

        if (this.weaponSwitchFlash) {
            this.weaponSwitchFlash--;
        }
    }

    updateSuperMoves(input) {
        if (input.isPressed('super') && this.superMeter >= 100) {
            // Determine super level based on meter
            let level = 1;
            if (this.superMeter >= 300) level = 3;
            else if (this.superMeter >= 200) level = 2;

            this.activateSuper(level);
        }
    }

    activateSuper(level) {
        const cost = level * 100;
        if (this.superMeter < cost) return;

        this.superMeter -= cost;
        this.superMovesUsed++;
        if (this.soundSystem) this.soundSystem.playSuper(level);

        if (level === 1) {
            // Level I: Invincibility dash attack
            this.isDashing = true;
            this.dashTimer = 30; // Longer dash
            this.dashSpeed = 20; // Faster
            this.invulnerable = true;
            this.dashDir = { x: this.facing, y: 0 };
            this.dashCooldown = 0; // No cooldown after super dash

            // Reset energy bullet counters (frame-based spawning in updateCooldowns)
            this.superDashBulletTimer = 0;
            this.superDashBulletsSpawned = 0;
        } else if (level === 2) {
            // Level II: Screen-clearing energy wave
            this.particleSystem.createExplosion(this.x, this.y + this.height / 2, '#4ecdc4', 50);

            // Create expanding energy ring
            for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
                const bullet = new Bullet(
                    this.x,
                    this.y + this.height / 2,
                    Math.cos(angle) * 10,
                    Math.sin(angle) * 10,
                    3,
                    true,
                    '#4ecdc4'
                );
                bullet.radius = 10;
                this.bullets.push(bullet);
            }
        } else if (level === 3) {
            // Level III: Giant beam attack
            this.superBeamActive = true;
            this.superBeamTimer = 120; // 2 seconds

            // Beam hits instantly across screen
            this.superBeamHit = true;
        }
    }

    draw(ctx) {
        ctx.save();

        // Invulnerability flashing
        if (this.iframeTimer > 0 && Math.floor(this.iframeTimer / 4) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Draw player (simple representation for now)
        ctx.translate(this.x, this.y);
        if (this.facing < 0) {
            ctx.scale(-1, 1);
        }

        // Body (cup)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        // Cup body
        ctx.beginPath();
        ctx.moveTo(-15, 20);
        ctx.lineTo(-12, 60);
        ctx.lineTo(12, 60);
        ctx.lineTo(15, 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cup handle
        ctx.beginPath();
        ctx.arc(18, 35, 8, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();

        // Head (cup top with straw)
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Straw
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-5, -20);
        ctx.lineTo(-8, -35);
        ctx.stroke();

        // Face
        ctx.fillStyle = '#000';
        // Eyes
        ctx.beginPath();
        ctx.arc(-8, -5, 3, 0, Math.PI * 2);
        ctx.arc(8, -5, 3, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Arm shooting
        if (this.shootCooldown > 0) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(15, 30);
            ctx.lineTo(30, 25);
            ctx.stroke();

            // Muzzle flash
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.arc(30, 25, 8, 0, Math.PI * 2);
            ctx.fill();
        }

        // Charge effect
        if (this.isCharging) {
            const chargeAlpha = (this.chargeLevel / this.maxCharge) * 0.5;
            ctx.fillStyle = `rgba(78, 205, 196, ${chargeAlpha})`;
            ctx.beginPath();
            ctx.arc(0, 20, 30 + this.chargeLevel / 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw(ctx));

        // Draw dash cooldown indicator
        if (this.dashCooldown > 0) {
            ctx.save();
            ctx.translate(this.x, this.y - 50);

            // Background circle
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.fill();

            // Cooldown arc
            const cooldownPercent = this.dashCooldown / this.dashCooldownMax;
            ctx.strokeStyle = '#4ecdc4';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, 15, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * (1 - cooldownPercent)));
            ctx.stroke();

            // Dash icon (simple 'D')
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('D', 0, 0);

            ctx.restore();
        }

        // Draw super beam (Level III)
        if (this.superBeamActive) {
            ctx.save();

            // Massive energy beam
            const beamWidth = 100;
            const gradient = ctx.createLinearGradient(this.x, 0, 1280, 0);
            gradient.addColorStop(0, 'rgba(78, 205, 196, 0.8)');
            gradient.addColorStop(0.5, 'rgba(78, 205, 196, 0.4)');
            gradient.addColorStop(1, 'rgba(78, 205, 196, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(
                this.x,
                this.y + this.height / 2 - beamWidth / 2,
                1280 - this.x,
                beamWidth
            );

            // Beam core
            ctx.fillStyle = '#4ecdc4';
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#4ecdc4';
            ctx.fillRect(
                this.x,
                this.y + this.height / 2 - 20,
                1280 - this.x,
                40
            );

            // Particles
            for (let i = 0; i < 10; i++) {
                const x = this.x + Math.random() * (1280 - this.x);
                const y = this.y + this.height / 2 + (Math.random() - 0.5) * beamWidth;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(x, y, 3 + Math.random() * 5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }
}
