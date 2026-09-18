import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { SceneState, ActPhase } from '../types/scene';

gsap.registerPlugin(ScrollTrigger);

export type ProgressCallback = (state: SceneState) => void;

export class AnimationController {
  private scrollTriggerInstance: ScrollTrigger | null = null;
  private callbacks: Set<ProgressCallback> = new Set();
  private lastProgress = 0;
  private lastTime = performance.now();
  private currentVelocity = 0;
  private reducedMotion = false;
  private soundEnabled = false;
  private scrollListener: (() => void) | null = null;

  constructor() {
    this.checkReducedMotion();
  }

  private checkReducedMotion() {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = media.matches;
      media.addEventListener('change', (e) => {
        this.reducedMotion = e.matches;
        this.notify();
      });
    }
  }

  private stopTimer: number | null = null;

  public init(scrollContainer: HTMLElement) {
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
    }
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    if (this.stopTimer !== null) {
      clearTimeout(this.stopTimer);
    }

    // Single master ScrollTrigger instance
    this.scrollTriggerInstance = ScrollTrigger.create({
      trigger: scrollContainer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const now = performance.now();
        const dt = Math.max((now - this.lastTime) / 1000, 0.001);
        const dp = self.progress - this.lastProgress;
        this.currentVelocity = dp / dt;

        this.lastProgress = self.progress;
        this.lastTime = now;

        this.notify(self.progress, self.scroll());

        // Zero out velocity when scrolling halts
        if (this.stopTimer !== null) {
          clearTimeout(this.stopTimer);
        }
        this.stopTimer = window.setTimeout(() => {
          this.currentVelocity = 0;
          this.notify(this.lastProgress, window.scrollY);
        }, 100);
      },
    });

    // Zero-latency scroll listener fallback
    this.scrollListener = () => {
      if (this.scrollTriggerInstance) {
        const progress = this.scrollTriggerInstance.progress;
        this.notify(progress, window.scrollY);
      }
    };
    window.addEventListener('scroll', this.scrollListener, { passive: true });

    // Refresh ScrollTrigger after DOM has settled
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      this.notify(0, 0);
    });
  }

  public subscribe(cb: ProgressCallback): () => void {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    this.notify(this.lastProgress, window.scrollY);
  }

  private getActPhase(progress: number): ActPhase {
    if (progress < 0.30) return 'celestial-sky';
    if (progress < 0.45) return 'cloud-descent';
    if (progress < 0.65) return 'forest-canopy';
    if (progress < 0.85) return 'mountain-valley';
    if (progress < 0.97) return 'ground-approach';
    return 'impact-settled';
  }

  private notify(progress = this.lastProgress, rawScroll = 0) {
    const act = this.getActPhase(progress);
    const isImpacted = progress >= 0.97;

    const state: SceneState = {
      progress,
      rawScroll,
      velocity: this.currentVelocity,
      act,
      isImpacted,
      reducedMotion: this.reducedMotion,
      soundEnabled: this.soundEnabled,
    };

    this.callbacks.forEach((cb) => cb(state));
  }

  public destroy() {
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
      this.scrollTriggerInstance = null;
    }
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = null;
    }
    this.callbacks.clear();
  }
}

export const animationController = new AnimationController();
