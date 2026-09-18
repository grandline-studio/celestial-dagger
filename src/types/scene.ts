export interface SceneState {
  progress: number;       // Normalized scroll progress [0.0 - 1.0]
  rawScroll: number;      // Pixel scroll position
  velocity: number;       // Current scroll speed
  act: ActPhase;
  isImpacted: boolean;
  reducedMotion: boolean;
  soundEnabled: boolean;
}

export type ActPhase = 
  | 'celestial-sky'     // 0.00 - 0.30
  | 'cloud-descent'     // 0.30 - 0.45
  | 'forest-canopy'     // 0.45 - 0.65
  | 'mountain-valley'   // 0.65 - 0.85
  | 'ground-approach'   // 0.85 - 0.97
  | 'impact-settled';   // 0.97 - 1.00

export interface NarrativeCard {
  id: string;
  start: number;
  end: number;
  position: 'center' | 'left' | 'right';
  eyebrow?: string;
  title: string;
  subtitle?: string;
}
