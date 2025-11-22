export class Input {
    constructor() {
        this.keys = {};
        this.keysPressed = {};
        this.keysReleased = {};

        // Key mappings
        this.mappings = {
            left: ['ArrowLeft', 'KeyA'],
            right: ['ArrowRight', 'KeyD'],
            up: ['ArrowUp', 'KeyW'],
            down: ['ArrowDown', 'KeyS'],
            shoot: ['KeyJ', 'KeyZ'],
            jump: ['KeyK', 'KeyX'],
            dash: ['KeyL', 'KeyC'],
            super: ['KeyI', 'KeyV'],
            pause: ['Escape'],
            start: ['Space'],
            weaponPrev: ['KeyQ'],
            weaponNext: ['KeyE'],
            help: ['KeyH']
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.keysPressed[e.code] = true;
            }
            this.keys[e.code] = true;

            // Prevent default for game keys
            if (this.isGameKey(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keysReleased[e.code] = true;
        });
    }

    isGameKey(code) {
        for (let action in this.mappings) {
            if (this.mappings[action].includes(code)) {
                return true;
            }
        }
        return false;
    }

    isDown(action) {
        const keys = this.mappings[action] || [];
        return keys.some(key => this.keys[key]);
    }

    isPressed(action) {
        const keys = this.mappings[action] || [];
        return keys.some(key => this.keysPressed[key]);
    }

    isReleased(action) {
        const keys = this.mappings[action] || [];
        return keys.some(key => this.keysReleased[key]);
    }

    update() {
        // Clear pressed/released states at end of frame
        this.keysPressed = {};
        this.keysReleased = {};
    }
}
