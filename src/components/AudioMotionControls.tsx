import React, { useEffect, useState } from 'react';
import { animationController } from '../core/AnimationState';
import { soundManager } from '../utils/sound';
import { Volume2, VolumeX, Eye } from 'lucide-react';
import type { ActPhase } from '../types/scene';

export const AudioMotionControls: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [act, setAct] = useState<ActPhase>('celestial-sky');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    return animationController.subscribe((state) => {
      setProgress(state.progress);
      setAct(state.act);
      setReducedMotion(state.reducedMotion);
    });
  }, []);

  const handleToggleSound = () => {
    const isNowSounding = soundManager.toggleSound();
    setIsMuted(!isNowSounding);
    animationController.setSoundEnabled(isNowSounding);
  };

  const formatActName = (a: ActPhase): string => {
    switch (a) {
      case 'celestial-sky': return 'I · SKY';
      case 'cloud-descent': return 'II · CLOUDS';
      case 'forest-canopy': return 'III · CANOPY';
      case 'mountain-valley': return 'IV · MOUNTAINS';
      case 'ground-approach': return 'V · BEDROCK';
      case 'impact-settled': return 'VI · IMPACT';
    }
  };

  return (
    <header className="fixed top-5 right-5 z-40 flex items-center gap-3 pointer-events-auto">
      {/* Act & Depth Pill */}
      <div 
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-950/75 backdrop-blur-md border border-white/15 text-xs text-neutral-300 font-mono shadow-lg"
        aria-live="polite"
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
        <span className="font-semibold text-amber-200">{formatActName(act)}</span>
        <span className="text-neutral-500">|</span>
        <span>{Math.round(progress * 100)}%</span>
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

      {/* Audio toggle button */}
      <button
        onClick={handleToggleSound}
        className="min-w-[44px] min-h-[44px] rounded-full bg-neutral-950/80 hover:bg-neutral-900 border border-white/20 text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer active:scale-90"
        title={isMuted ? 'Enable atmospheric audio' : 'Mute audio'}
        aria-label={isMuted ? 'Enable atmospheric audio' : 'Mute audio'}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-neutral-400" aria-hidden="true" />
        ) : (
          <Volume2 className="w-4 h-4 text-amber-400" aria-hidden="true" />
        )}
      </button>
    </header>
  );
};
