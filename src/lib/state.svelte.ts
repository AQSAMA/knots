import { type KnotPreset, PRESETS } from './presets';

export class KnotState {
    // Knot Parameters
    x = $state(PRESETS.trefoil.x);
    y = $state(PRESETS.trefoil.y);
    z = $state(PRESETS.trefoil.z);
    thickness = $state(0.4);
    color = $state(PRESETS.trefoil.defaultColor || '#00ff88');

    // Animation State
    growth = $state(1);
    isPlaying = $state(false);
    autoRotate = $state(true);
    showLabels = $state(true);
    bgStyle = $state<'void' | 'stars'>('void');

    // Design 2.0 State
    materialMode = $state<'neon' | 'chrome' | 'liquid' | 'iridescent'>('neon');
    useGradient = $state(false);

    // Private animation state
    #animationFrameRequestId: number | null = null;
    #startTime: number | null = null;
    #direction: 1 | -1 = 1; // 1 for growing, -1 for shrinking

    setPreset(key: string) {
        if (PRESETS[key]) {
            const p = PRESETS[key];
            this.x = p.x;
            this.y = p.y;
            this.z = p.z;
            if (p.defaultColor) this.color = p.defaultColor;
            this.growth = 1;
            this.isPlaying = false;
            this.stopAnimation();
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.isPlaying = false;
            this.stopAnimation();
        } else {
            this.isPlaying = true;
            this.growth = 0; // Reset to start
            this.#startTime = null;
            this.#direction = 1;
            this.animate();
        }
    }

    private animate() {
        const loop = (time: number) => {
            if (!this.isPlaying) return;

            if (this.#startTime === null) this.#startTime = time;

            // Speed factor: Full growth in 3 seconds
            const duration = 3000;
            const elapsed = time - this.#startTime;
            let progress = elapsed / duration;

            if (this.#direction === 1) {
                // Growing
                if (progress >= 1) {
                    this.growth = 1;
                    // Switch to shrinking
                    this.#direction = -1;
                    this.#startTime = time; // Reset time for next phase
                } else {
                    this.growth = progress;
                }
            } else {
                // Shrinking
                if (progress >= 1) {
                    this.growth = 0;
                    // Switch to growing
                    this.#direction = 1;
                    this.#startTime = time;
                } else {
                    this.growth = 1 - progress;
                }
            }

            this.#animationFrameRequestId = requestAnimationFrame(loop);
        };
        this.#animationFrameRequestId = requestAnimationFrame(loop);
    }

    private stopAnimation() {
        if (this.#animationFrameRequestId) {
            cancelAnimationFrame(this.#animationFrameRequestId);
            this.#animationFrameRequestId = null;
        }
    }
}

export const knotState = new KnotState();
