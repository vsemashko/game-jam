export class Platform {
    constructor(x, y, width, height, type = 'static') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'static', 'moving-horizontal', 'moving-vertical'

        // Movement properties
        this.moveSpeed = 2;
        this.moveRange = 100;
        this.startX = x;
        this.startY = y;
        this.moveDirection = 1;

        // Visual properties
        this.opacity = 0.9;
        this.pulseTimer = Math.random() * 100;
    }

    update() {
        this.pulseTimer++;

        if (this.type === 'moving-horizontal') {
            this.x += this.moveSpeed * this.moveDirection;

            if (Math.abs(this.x - this.startX) > this.moveRange) {
                this.moveDirection *= -1;
            }
        } else if (this.type === 'moving-vertical') {
            this.y += this.moveSpeed * this.moveDirection;

            if (Math.abs(this.y - this.startY) > this.moveRange) {
                this.moveDirection *= -1;
            }
        }
    }

    checkCollision(player) {
        // Check if player is landing on top of platform
        const playerBottom = player.y + player.height;
        const playerCenterX = player.x;

        // Player must be falling (positive vertical velocity) and above platform
        if (player.vy >= 0 &&
            playerBottom >= this.y &&
            playerBottom <= this.y + 10 && // Small tolerance
            playerCenterX > this.x - this.width / 2 &&
            playerCenterX < this.x + this.width / 2) {
            return true;
        }

        return false;
    }

    draw(ctx) {
        ctx.save();

        // Pulsing effect
        const pulse = 1 + Math.sin(this.pulseTimer * 0.05) * 0.05;

        // Cloud platform shape
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
        ctx.lineWidth = 2;

        // Draw cloud-like platform using circles
        const segments = 5;
        const segmentWidth = this.width / segments;

        ctx.beginPath();
        for (let i = 0; i < segments; i++) {
            const cloudX = this.x - this.width / 2 + i * segmentWidth + segmentWidth / 2;
            const cloudY = this.y;
            const radius = (segmentWidth / 2) * pulse;

            if (i === 0) {
                ctx.moveTo(cloudX + radius, cloudY);
            }
            ctx.arc(cloudX, cloudY, radius, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();

        // Add shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.height, this.width / 2, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
