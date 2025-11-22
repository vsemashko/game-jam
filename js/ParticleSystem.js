class Particle {
    constructor(x, y, vx, vy, color, size, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.lifetime = lifetime;
        this.age = 0;
        this.dead = false;
        this.gravity = 0.2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.age++;

        if (this.age >= this.lifetime) {
            this.dead = true;
        }
    }

    draw(ctx) {
        const alpha = 1 - (this.age / this.lifetime);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].dead) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }

    createExplosion(x, y, color = '#ffeb3b', count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2 + Math.random() * 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const size = 3 + Math.random() * 5;
            const lifetime = 30 + Math.random() * 30;

            this.particles.push(new Particle(x, y, vx, vy, color, size, lifetime));
        }
    }

    createDashEffect(x, y) {
        for (let i = 0; i < 10; i++) {
            const vx = (Math.random() - 0.5) * 2;
            const vy = (Math.random() - 0.5) * 2;
            const size = 4 + Math.random() * 4;
            const lifetime = 20 + Math.random() * 20;

            this.particles.push(new Particle(x, y, vx, vy, '#ffffff', size, lifetime));
        }
    }

    createParryEffect(x, y) {
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const speed = 3 + Math.random() * 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const size = 4 + Math.random() * 4;
            const lifetime = 25 + Math.random() * 25;

            this.particles.push(new Particle(x, y, vx, vy, '#ff69b4', size, lifetime));
        }
    }

    createHitEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            const vx = (Math.random() - 0.5) * 6;
            const vy = (Math.random() - 0.5) * 6;
            const size = 3 + Math.random() * 3;
            const lifetime = 20 + Math.random() * 15;

            this.particles.push(new Particle(x, y, vx, vy, '#ff6b6b', size, lifetime));
        }
    }

    createBossHitEffect(x, y, bossType = 'flower') {
        const colors = {
            'flower': ['#ff69b4', '#ff1493', '#ff6b6b'], // Pink/red for flower
            'dragon': ['#ff4500', '#ffa500', '#ffeb3b']  // Orange/yellow for dragon
        };

        const colorPalette = colors[bossType] || colors.flower;

        for (let i = 0; i < 12; i++) {
            const vx = (Math.random() - 0.5) * 8;
            const vy = (Math.random() - 0.5) * 8;
            const size = 4 + Math.random() * 4;
            const lifetime = 25 + Math.random() * 20;
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

            this.particles.push(new Particle(x, y, vx, vy, color, size, lifetime));
        }
    }

    createSuperExplosion(x, y) {
        // Rainbow explosion for super moves
        const colors = ['#ff6b6b', '#ffa500', '#ffeb3b', '#4ecdc4', '#44a08d', '#ff69b4'];

        for (let i = 0; i < 40; i++) {
            const angle = (Math.PI * 2 * i) / 40;
            const speed = 3 + Math.random() * 6;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const size = 5 + Math.random() * 6;
            const lifetime = 40 + Math.random() * 40;
            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push(new Particle(x, y, vx, vy, color, size, lifetime));
        }
    }

    createWeaponTrail(x, y, weaponType = 'peashooter') {
        const colors = {
            'peashooter': '#4ecdc4',  // Cyan
            'spread': '#ffa500',      // Orange
            'charge': '#ff69b4'       // Pink
        };

        const color = colors[weaponType] || colors.peashooter;

        for (let i = 0; i < 3; i++) {
            const vx = (Math.random() - 0.5) * 1;
            const vy = (Math.random() - 0.5) * 1;
            const size = 2 + Math.random() * 2;
            const lifetime = 10 + Math.random() * 10;

            this.particles.push(new Particle(x, y, vx, vy, color, size, lifetime));
        }
    }

    createChargeEffect(x, y) {
        // Sparkle effect for charge weapon
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 15;
            const px = x + Math.cos(angle) * distance;
            const py = y + Math.sin(angle) * distance;
            const vx = (Math.random() - 0.5) * 2;
            const vy = (Math.random() - 0.5) * 2;
            const size = 3 + Math.random() * 3;
            const lifetime = 15 + Math.random() * 15;

            this.particles.push(new Particle(px, py, vx, vy, '#ff69b4', size, lifetime));
        }
    }
}
