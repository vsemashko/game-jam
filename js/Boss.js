export class Boss {
    constructor(x, y, name, maxHealth) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.health = maxHealth;
        this.maxHealth = maxHealth;
        this.dead = false;
        this.phase = 1;
        this.state = 'intro';
        this.stateTimer = 0;
        this.attackTimer = 0;
        this.bullets = [];
        this.hitFlash = 0;
    }

    update(player, particleSystem) {
        // Override in subclass
    }

    takeDamage(amount, particleSystem) {
        this.health -= amount;
        this.hitFlash = 10;

        if (this.health <= 0) {
            this.health = 0;
            this.dead = true;
            this.onDeath(particleSystem);
        }

        return true;
    }

    onDeath(particleSystem) {
        // Override in subclass
        particleSystem.createExplosion(this.x, this.y, '#ffeb3b', 50);
    }

    getHealthPercent() {
        return this.health / this.maxHealth;
    }

    getCurrentPhase() {
        const healthPercent = this.getHealthPercent();
        if (healthPercent > 0.66) return 1;
        if (healthPercent > 0.33) return 2;
        return 3;
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            if (this.bullets[i].dead) {
                this.bullets.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        // Override in subclass
    }

    drawBullets(ctx) {
        this.bullets.forEach(bullet => bullet.draw(ctx));
    }
}
