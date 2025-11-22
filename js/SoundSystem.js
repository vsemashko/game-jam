export class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.musicGainNode = null;
        this.sfxGainNode = null;
        this.enabled = true;

        // Initialize on first user interaction
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create gain nodes for volume control
            this.musicGainNode = this.audioContext.createGain();
            this.musicGainNode.gain.value = 0.3;
            this.musicGainNode.connect(this.audioContext.destination);

            this.sfxGainNode = this.audioContext.createGain();
            this.sfxGainNode.gain.value = 0.4;
            this.sfxGainNode.connect(this.audioContext.destination);

            this.initialized = true;
        } catch (e) {
            console.log('Web Audio API not supported');
            this.enabled = false;
        }
    }

    playShoot() {
        if (!this.enabled || !this.initialized) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.frequency.value = 800;
        osc.type = 'square';

        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    playJump() {
        if (!this.enabled || !this.initialized) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
    }

    playDash() {
        if (!this.enabled || !this.initialized) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.frequency.value = 150;
        osc.type = 'sawtooth';

        gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
    }

    playParry() {
        if (!this.enabled || !this.initialized) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
    }

    playHit() {
        if (!this.enabled || !this.initialized) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.frequency.value = 100;
        osc.type = 'sawtooth';

        gain.gain.setValueAtTime(0.6, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
    }

    playExplosion() {
        if (!this.enabled || !this.initialized) return;

        const noise = this.audioContext.createBufferSource();
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        noise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;

        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGainNode);

        noise.start();
        noise.stop(this.audioContext.currentTime + 0.5);
    }

    playSuper(level) {
        if (!this.enabled || !this.initialized) return;

        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGainNode);

        const baseFreq = 400 + level * 200;
        osc1.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(baseFreq * 2, this.audioContext.currentTime + 0.3);
        osc2.frequency.setValueAtTime(baseFreq * 1.5, this.audioContext.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3, this.audioContext.currentTime + 0.3);

        osc1.type = 'sine';
        osc2.type = 'sine';

        gain.gain.setValueAtTime(0.6, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

        osc1.start();
        osc2.start();
        osc1.stop(this.audioContext.currentTime + 0.4);
        osc2.stop(this.audioContext.currentTime + 0.4);
    }

    playBossHit() {
        if (!this.enabled || !this.initialized) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.frequency.value = 200;
        osc.type = 'triangle';

        gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
    }

    playVictory() {
        if (!this.enabled || !this.initialized) return;

        // Play ascending victory notes using Web Audio API scheduling
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const noteDelay = 0.15; // 150ms between notes

        notes.forEach((freq, i) => {
            const startTime = this.audioContext.currentTime + (i * noteDelay);
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.sfxGainNode);

            osc.frequency.value = freq;
            osc.type = 'sine';

            gain.gain.setValueAtTime(0.5, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

            osc.start(startTime);
            osc.stop(startTime + 0.5);
        });
    }

    playBGM() {
        // Simple background music would go here
        // For now, we'll skip it to avoid annoyance
    }

    stopBGM() {
        // Stop background music
    }
}
