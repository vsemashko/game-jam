export class Bullet {
    constructor(x, y, vx, vy, damage = 1, isPlayerBullet = true, color = '#ffeb3b') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.isPlayerBullet = isPlayerBullet;
        this.color = color;
        this.radius = isPlayerBullet ? 6 : 8;
        this.dead = false;
        this.age = 0;
        this.maxAge = 180; // 3 seconds at 60fps

        // Parry properties
        this.canParry = false;
        this.parryColor = '#ff69b4';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.age++;

        // Remove if off screen or too old
        if (this.x < -50 || this.x > 1330 || this.y < -50 || this.y > 770 || this.age > this.maxAge) {
            this.dead = true;
        }
    }

    draw(ctx) {
        ctx.save();

        // Glow effect
        if (this.canParry) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.parryColor;
        } else {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }

        // Main bullet
        ctx.fillStyle = this.canParry ? this.parryColor : this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x - 2, this.y - 2, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Black outline
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    collidesWith(entity) {
        const dx = this.x - entity.x;
        const dy = this.y - entity.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const combinedRadius = this.radius + (entity.radius || entity.width / 2);
        return distance < combinedRadius;
    }
}

export class SpreadBullet extends Bullet {
    constructor(x, y, angle, speed, damage = 1) {
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        super(x, y, vx, vy, damage, true, '#ff9f43');
        this.radius = 5;
    }
}

export class ChargeBullet extends Bullet {
    constructor(x, y, vx, vy, chargeLevel) {
        super(x, y, vx, vy, chargeLevel * 2, true, '#4ecdc4');
        this.radius = 8 + chargeLevel * 2;
        this.chargeLevel = chargeLevel;
    }

    draw(ctx) {
        ctx.save();

        // Extra glow for charged shots
        ctx.shadowBlur = 20 + this.chargeLevel * 5;
        ctx.shadowColor = this.color;

        // Rotating energy effect
        const rotation = this.age * 0.1;
        ctx.translate(this.x, this.y);
        ctx.rotate(rotation);

        // Draw star shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5;
            const r = i % 2 === 0 ? this.radius : this.radius / 2;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}
