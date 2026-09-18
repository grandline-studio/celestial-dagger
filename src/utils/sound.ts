/**
 * Procedural Web Audio API Sound Synthesizer
 * Zero external audio files required.
 * Generates an ethereal, soothing celestial dark-fantasy ambient soundscape.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted = true;
  private masterGain: GainNode | null = null;

  // Celestial Ambient Drone
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneOsc3: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;

  // Subtle Ethereal Velocity Shimmer (replaces the harsh rushing air hiss)
  private shimmerOsc: OscillatorNode | null = null;
  private shimmerGain: GainNode | null = null;
  private warmDraftGain: GainNode | null = null;
  private warmDraftFilter: BiquadFilterNode | null = null;

  private hasImpactTriggered = false;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.buildAudioGraph();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private buildAudioGraph() {
    if (!this.ctx) return;

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.0;
    this.masterGain.connect(this.ctx.destination);

    // ----------------------------------------------------
    // 1. CELESTIAL AMBIENT DRONE (Warm, meditative D-minor harmonic bed)
    // ----------------------------------------------------
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.value = 240; // Soft and warm, non-fatiguing
    this.droneFilter.Q.value = 1.0;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.055; // Gentle, soothing ambient floor

    // Root fundamental: D2 (73.4 Hz)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sine';
    this.droneOsc1.frequency.value = 73.4;

    // Perfect Fifth: A2 (110.0 Hz) with subtle chorus detune (+0.5 Hz)
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.value = 110.5;

    // Ethereal Upper Octave: D3 (146.8 Hz)
    this.droneOsc3 = this.ctx.createOscillator();
    this.droneOsc3.type = 'sine';
    this.droneOsc3.frequency.value = 146.8;

    const osc1Gain = this.ctx.createGain();
    osc1Gain.gain.value = 0.6;
    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.value = 0.3;
    const osc3Gain = this.ctx.createGain();
    osc3Gain.gain.value = 0.2;

    this.droneOsc1.connect(osc1Gain);
    this.droneOsc2.connect(osc2Gain);
    this.droneOsc3.connect(osc3Gain);

    osc1Gain.connect(this.droneFilter);
    osc2Gain.connect(this.droneFilter);
    osc3Gain.connect(this.droneFilter);

    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc1.start();
    this.droneOsc2.start();
    this.droneOsc3.start();

    // ----------------------------------------------------
    // 2. ETHEREAL VELOCITY HARMONIC SHIMMER
    // (Replaces the harsh white-noise rushing wind with a gentle singing resonance)
    // ----------------------------------------------------
    this.shimmerOsc = this.ctx.createOscillator();
    this.shimmerOsc.type = 'sine';
    this.shimmerOsc.frequency.value = 440; // Starts at concert A

    this.shimmerGain = this.ctx.createGain();
    this.shimmerGain.gain.value = 0.0;

    const shimmerFilter = this.ctx.createBiquadFilter();
    shimmerFilter.type = 'lowpass';
    shimmerFilter.frequency.value = 680;

    this.shimmerOsc.connect(shimmerFilter);
    shimmerFilter.connect(this.shimmerGain);
    this.shimmerGain.connect(this.masterGain);
    this.shimmerOsc.start();

    // Warm deep air cushion (strictly sub-200Hz, no high-frequency hissing)
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = lastOut * 0.98 + white * 0.02; // Very gentle low rumble
      data[i] = lastOut * 1.5;
    }

    const draftSource = this.ctx.createBufferSource();
    draftSource.buffer = buffer;
    draftSource.loop = true;

    this.warmDraftFilter = this.ctx.createBiquadFilter();
    this.warmDraftFilter.type = 'lowpass';
    this.warmDraftFilter.frequency.value = 140; // Kept strictly in warm low frequencies

    this.warmDraftGain = this.ctx.createGain();
    this.warmDraftGain.gain.value = 0.0;

    draftSource.connect(this.warmDraftFilter);
    this.warmDraftFilter.connect(this.warmDraftGain);
    this.warmDraftGain.connect(this.masterGain);
    draftSource.start();
  }

  public toggleSound(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.init();
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.4);
      }
    } else {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setTargetAtTime(0.0, this.ctx.currentTime, 0.2);
      }
    }
    return !this.isMuted;
  }

  /**
   * Called on scroll/descent.
   * Produces a subtle, warm atmospheric swell and melodic crystal harmonic
   * instead of any annoying harsh hissing air noise.
   */
  public updateWind(velocity: number) {
    if (this.isMuted || !this.ctx) return;
    const speed = Math.min(Math.abs(velocity) * 2.0, 1.0);
    const t = this.ctx.currentTime;

    // 1. Subtle warm draft (ultra-low filtered, never hissing, max gain 0.03)
    if (this.warmDraftGain && this.warmDraftFilter) {
      const targetGain = 0.005 + speed * 0.025;
      const targetFreq = 120 + speed * 90; // Stays between 120Hz and 210Hz
      this.warmDraftGain.gain.setTargetAtTime(targetGain, t, 0.15);
      this.warmDraftFilter.frequency.setTargetAtTime(targetFreq, t, 0.15);
    }

    // 2. Crystalline Harmonic Resonance (pleasant singing overtone that scales softly with descent)
    if (this.shimmerOsc && this.shimmerGain) {
      const targetFreq = 380 + speed * 320; // Glides smoothly between 380Hz and 700Hz
      const targetGain = speed > 0.01 ? Math.min(speed * 0.028, 0.028) : 0.0;
      this.shimmerOsc.frequency.setTargetAtTime(targetFreq, t, 0.2);
      this.shimmerGain.gain.setTargetAtTime(targetGain, t, 0.18);
    }

    // 3. Drone subtle harmonic opening
    if (this.droneFilter) {
      const droneCutoff = 220 + speed * 120;
      this.droneFilter.frequency.setTargetAtTime(droneCutoff, t, 0.25);
    }
  }

  public triggerImpact() {
    if (this.isMuted || this.hasImpactTriggered) return;
    this.init();
    if (!this.ctx) return;
    this.hasImpactTriggered = true;

    const t = this.ctx.currentTime;

    // Sub-bass sine drop
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.55);

    oscGain.gain.setValueAtTime(0.7, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain || this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.75);

    // Warm stone resonance
    const stoneOsc = this.ctx.createOscillator();
    const stoneGain = this.ctx.createGain();
    stoneOsc.type = 'triangle';
    stoneOsc.frequency.setValueAtTime(65, t);
    stoneOsc.frequency.exponentialRampToValueAtTime(32, t + 0.6);

    stoneGain.gain.setValueAtTime(0.4, t);
    stoneGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    stoneOsc.connect(stoneGain);
    stoneGain.connect(this.masterGain || this.ctx.destination);
    stoneOsc.start(t);
    stoneOsc.stop(t + 0.7);
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public triggerBladeAimChime() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Pure metallic harmonic ring (pure high steel resonance)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, t);
    osc1.frequency.exponentialRampToValueAtTime(1320, t + 0.15);
    osc1.frequency.exponentialRampToValueAtTime(1280, t + 0.9);

    gain1.gain.setValueAtTime(0.001, t);
    gain1.gain.exponentialRampToValueAtTime(0.16, t + 0.08);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.95);

    osc1.connect(gain1);
    gain1.connect(this.masterGain || this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 1.0);

    // Secondary harmonic overtone (crystal sheen)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1760, t);
    osc2.frequency.exponentialRampToValueAtTime(2200, t + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(2150, t + 0.7);

    gain2.gain.setValueAtTime(0.001, t);
    gain2.gain.exponentialRampToValueAtTime(0.07, t + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    osc2.connect(gain2);
    gain2.connect(this.masterGain || this.ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.8);
  }

  public resetImpact() {
    this.hasImpactTriggered = false;
  }
}

export const soundManager = new SoundEngine();
