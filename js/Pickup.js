export class Pickup {
    constructor(x, y, type = 'health') {
        this.x = x;
        this.y = y;
        this.type = type; // 'health' for now, could add 'super' later
        this.width = 20;
        this.height = 20;
        this.collected = false;

        // Physics
        this.vy = -5; // Initial upward velocity
        this.vx = (Math.random() - 0.5) * 3;
        this.gravity = 0.3;
        this.groundY = 620; // Slightly above actual ground

        // Visual
        this.pulseTimer = 0;
        this.lifetime = 600; // 10 seconds before disappearing
    }

    update() {
        if (this.collected) return;

        // Apply gravity
        this.vy += this.gravity;
        this.y += this.vy;
        this.x += this.vx;

        // Ground collision
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.vy = 0;
            this.vx *= 0.9; // Friction
        }

        // Pulse effect
        this.pulseTimer += 0.1;

        // Lifetime
        this.lifetime--;
        if (this.lifetime <= 0) {
            this.collected = true; // Mark for removal
        }
    }

    checkCollision(player) {
        if (this.collected) return false;

        const dx = this.x - player.x;
        const dy = this.y - (player.y + player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < 30;
    }

    draw(ctx) {
        if (this.collected) return;

        ctx.save();

        // Fade out in last 2 seconds
        if (this.lifetime < 120) {
            ctx.globalAlpha = this.lifetime / 120;
        }

        // Pulse effect
        const pulse = 1 + Math.sin(this.pulseTimer) * 0.2;

        if (this.type === 'health') {
            // Health heart
            ctx.fillStyle = '#ff6b6b';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;

            const size = 15 * pulse;

            // Draw heart shape
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + size * 0.3);

            // Left curve
            ctx.bezierCurveTo(
                this.x - size, this.y - size * 0.3,
                this.x - size, this.y + size * 0.3,
                this.x, this.y + size
            );

            // Right curve
            ctx.bezierCurveTo(
                this.x + size, this.y + size * 0.3,
                this.x + size, this.y - size * 0.3,
                this.x, this.y + size * 0.3
            );

            ctx.fill();
            ctx.stroke();

            // Glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff6b6b';
            ctx.fill();
        }

        ctx.restore();
    }
}
