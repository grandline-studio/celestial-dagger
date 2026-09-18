import React, { useEffect, useState } from 'react';
import { animationController } from '../core/AnimationState';
import { soundManager } from '../utils/sound';
import { 
  Volume2, 
  VolumeX, 
  Eye, 
  Compass, 
  Zap, 
  Flame, 
  Crosshair,
  Sliders
} from 'lucide-react';
import type { ActPhase } from '../types/scene';

interface CinematicHUDProps {
  onOpenForge: () => void;
  isForgeOpen: boolean;
  isInspecting: boolean;
}

export const CinematicHUD: React.FC<CinematicHUDProps> = ({
  onOpenForge,
  isForgeOpen,
  isInspecting,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [act, setAct] = useState<ActPhase>('celestial-sky');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    return animationController.subscribe((state) => {
      setProgress(state.progress);
      setVelocity(state.velocity);
      setAct(state.act);
      setReducedMotion(state.reducedMotion);
    });
  }, []);

  const handleToggleSound = () => {
    const isNowSounding = soundManager.toggleSound();
    setIsMuted(!isNowSounding);
    animationController.setSoundEnabled(isNowSounding);
  };

  const scrollToProgress = (targetProgress: number) => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = scrollableHeight * targetProgress;
    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  };

  // Telemetry computations
  const altitude = Math.max(0, Math.round((1 - progress) * 14200));
  const absVel = Math.abs(velocity);
  const speedKmh = Math.min(840, Math.round(180 + absVel * 45000 + progress * 420));
  const coreTemp = Math.round(24 + Math.pow(progress, 2.2) * 1380);

  const acts = [
    { label: 'Heavens', progress: 0.05, num: 'I' },
    { label: 'Canopy', progress: 0.52, num: 'II' },
    { label: 'Valley', progress: 0.72, num: 'III' },
    { label: 'Bedrock', progress: 0.99, num: 'IV' },
  ];

  return (
    <>
      {/* Top Floating Cinematic HUD */}
      <header className="fixed top-3 sm:top-4 inset-x-3 sm:inset-x-4 md:inset-x-8 z-40 flex items-center justify-between pointer-events-none transition-all duration-300">
        {/* Left: Brand Identity & Current Act */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="glass-panel px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl flex items-center gap-2.5 sm:gap-3 border border-amber-500/20 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_#f59e0b]" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="font-serif text-[11px] sm:text-xs md:text-sm font-bold tracking-[0.15em] sm:tracking-[0.2em] text-amber-200">
                CELESTIAL BLADE
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                {act.replace('-', ' ')} &middot; {Math.round(progress * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Center: Chapter Jump Stepper (hidden on mobile) */}
        <nav 
          className="hidden lg:flex items-center gap-1 glass-panel px-3 py-1.5 rounded-full pointer-events-auto border border-white/10"
          aria-label="Story Chapters"
        >
          {acts.map((item) => {
            const isActive = Math.abs(progress - item.progress) < 0.18;
            return (
              <button
                key={item.label}
                onClick={() => scrollToProgress(item.progress)}
                className={`min-h-[36px] px-3.5 py-1 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title={`Jump to Act ${item.num}: ${item.label}`}
              >
                <span className="text-[10px] opacity-60">{item.num}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Telemetry & Controls */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {/* Live Telemetry Pill (Desktop) */}
          <div className="hidden sm:flex items-center gap-4 glass-panel px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-neutral-300">
            <div className="flex items-center gap-1.5" title="Altitude Above Bedrock">
              <Compass className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>{altitude.toLocaleString()}m</span>
            </div>
            <div className="w-px h-3 bg-white/15" aria-hidden="true" />
            <div className="flex items-center gap-1.5" title="Atmospheric Velocity">
              <Zap className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>{speedKmh} km/h</span>
            </div>
            <div className="w-px h-3 bg-white/15" aria-hidden="true" />
            <div className="flex items-center gap-1.5" title="Blade Thermal Load">
              <Flame className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
              <span>{coreTemp}&deg;C</span>
            </div>
          </div>

          {/* Reduced Motion badge if active */}
          {reducedMotion && (
            <div 
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/30 text-[10px] text-amber-300"
              title="Reduced motion mode active"
            >
              <Eye className="w-3 h-3" aria-hidden="true" />
              <span>Reduced Motion</span>
            </div>
          )}

          {/* Blade Forge Drawer Trigger */}
          <button
            onClick={onOpenForge}
            className={`min-w-[44px] min-h-[44px] px-3.5 rounded-xl glass-panel border flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase transition-all shadow-lg cursor-pointer active:scale-95 ${
              isForgeOpen
                ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                : 'text-amber-300 border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-500/10'
            }`}
            title="Open Blade Forge & Customizer"
            aria-label="Open Blade Forge"
            aria-expanded={isForgeOpen}
          >
            <Sliders className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span className="hidden md:inline font-mono">Forge</span>
          </button>

          {/* Audio toggle button */}
          <button
            onClick={handleToggleSound}
            className="min-w-[44px] min-h-[44px] rounded-xl glass-panel hover:bg-white/10 border border-white/20 text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer active:scale-95"
            title={isMuted ? 'Enable atmospheric audio' : 'Mute audio'}
            aria-label={isMuted ? 'Enable atmospheric audio' : 'Mute audio'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-neutral-400" aria-hidden="true" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* Interactive Helper Banner at Bottom (Disappears during fast scroll or impact) */}
      <aside 
        aria-label="Interactive Navigation Guide"
        className={`fixed bottom-6 inset-x-0 z-20 flex justify-center pointer-events-none transition-all duration-300 ${
          progress >= 0.97 ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="glass-panel px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 text-[11px] sm:text-xs font-mono text-neutral-300 flex items-center gap-2 sm:gap-3 shadow-xl backdrop-blur-md max-w-[94vw] overflow-hidden">
          {isInspecting ? (
            <>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" aria-hidden="true" />
              <span className="text-cyan-300 font-semibold whitespace-nowrap">360&deg; Orbit</span>
              <span className="text-neutral-500">|</span>
              <span className="text-neutral-400 truncate">
                <span className="sm:hidden">Swipe to inspect</span>
                <span className="hidden sm:inline">Drag to inspect blade from any angle</span>
              </span>
            </>
          ) : (
            <>
              <Crosshair className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" aria-hidden="true" />
              <span className="text-amber-200 font-medium whitespace-nowrap">
                <span className="sm:hidden">Touch &amp; Hold</span>
                <span className="hidden sm:inline">Click &amp; Hold</span>
              </span>
              <span className="text-neutral-500">&middot;</span>
              <span className="text-neutral-400 truncate">
                <span className="sm:hidden">Aim blade</span>
                <span className="hidden sm:inline">Aim razor tip directly towards you</span>
              </span>
              <span className="text-neutral-500 hidden sm:inline">&middot;</span>
              <span className="text-neutral-500 hidden sm:inline">Move pointer to deflect particles</span>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
