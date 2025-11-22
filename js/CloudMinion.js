import { Bullet } from './Bullet.js';

export class CloudMinion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 40;
        this.health = 3;
        this.maxHealth = 3;
        this.dead = false;

        // Movement
        this.vx = Math.random() > 0.5 ? 2 : -2;
        this.vy = Math.sin(Date.now() * 0.001) * 0.5;
        this.floatTimer = Math.random() * 100;

        // Attack
        this.shootTimer = 0;
        this.shootCooldown = 240; // 4 seconds
        this.bullets = [];

        // Visuals
        this.hitFlash = 0;
    }

    update(player) {
        if (this.dead) return;

        // Float movement
        this.floatTimer++;
        this.x += this.vx;
        this.y += Math.sin(this.floatTimer * 0.05) * 0.5;

        // Bounce off screen edges
        if (this.x < 50 || this.x > 1230) {
            this.vx *= -1;
        }

        // Keep in upper portion of screen
        if (this.y < 100) this.y = 100;
        if (this.y > 400) this.y = 400;

        // Shooting
        this.shootTimer++;
        if (this.shootTimer >= this.shootCooldown) {
            this.shoot(player);
            this.shootTimer = 0;
        }

        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            if (this.bullets[i].dead) {
                this.bullets.splice(i, 1);
            }
        }

        // Hit flash
        if (this.hitFlash > 0) this.hitFlash--;
    }

    shoot(player) {
        // Shoot lightning bolt at player
        const dx = player.x - this.x;
        const dy = (player.y + player.height / 2) - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const speed = 8;
        const bullet = new Bullet(
            this.x,
            this.y + 20,
            (dx / distance) * speed,
            (dy / distance) * speed,
            1,
            false,
            '#ff69b4' // Pink (parryable)
        );
        bullet.canParry = true;
        this.bullets.push(bullet);
    }

    takeDamage(amount) {
        this.health -= amount;
        this.hitFlash = 10;

        if (this.health <= 0) {
            this.health = 0;
            this.dead = true;
        }
    }

    draw(ctx) {
        if (this.dead) return;

        ctx.save();

        // Hit flash
        if (this.hitFlash > 0 && Math.floor(this.hitFlash / 2) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Cloud body
        ctx.fillStyle = '#ddd';
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 2;

        // Draw cloud shape
        ctx.beginPath();
        ctx.arc(this.x - 15, this.y, 20, 0, Math.PI * 2);
        ctx.arc(this.x, this.y - 5, 25, 0, Math.PI * 2);
        ctx.arc(this.x + 15, this.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Angry eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x - 10, this.y - 5, 4, 0, Math.PI * 2);
        ctx.arc(this.x + 10, this.y - 5, 4, 0, Math.PI * 2);
        ctx.fill();

        // Angry eyebrows
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x - 15, this.y - 12);
        ctx.lineTo(this.x - 5, this.y - 8);
        ctx.moveTo(this.x + 15, this.y - 12);
        ctx.lineTo(this.x + 5, this.y - 8);
        ctx.stroke();

        // Lightning bolt charging indicator
        if (this.shootTimer > this.shootCooldown - 60) {
            const charge = (this.shootTimer - (this.shootCooldown - 60)) / 60;
            ctx.fillStyle = `rgba(255, 105, 180, ${charge})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y + 15, 10 * charge, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw(ctx));
    }

    drawBullets(ctx) {
        this.bullets.forEach(bullet => bullet.draw(ctx));
    }
}
