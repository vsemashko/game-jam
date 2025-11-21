import { Bullet, SpreadBullet, ChargeBullet } from './Bullet.js';

export class Player {
    constructor(x, y, particleSystem) {
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 60;
        this.vx = 0;
        this.vy = 0;
        this.particleSystem = particleSystem;

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
    }

    update(input) {
        if (this.isDashing) {
            this.updateDash();
        } else {
            this.updateMovement(input);
            this.updateShooting(input);
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
            } else if (this.canDoubleJump) {
                this.vy = -this.jumpPower;
                this.canDoubleJump = false;
                this.particleSystem.createDashEffect(this.x, this.y + this.height);
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
        return true;
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
    }
}
