import React, { useEffect, useState } from 'react';
import { animationController } from '../core/AnimationState';
import { smoothstep } from '../utils/math';
import { ChevronDown, Sparkles, Wind, Mountain, Compass } from 'lucide-react';

export const NarrativeOverlay: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [expandedLore, setExpandedLore] = useState<number | null>(null);

  useEffect(() => {
    return animationController.subscribe((state) => {
      setProgress(state.progress);
    });
  }, []);

  const toggleLore = (index: number) => {
    setExpandedLore(expandedLore === index ? null : index);
  };

  // Card 1: Hero Centered (0.00 -> 0.24)
  const heroOpacity = (1.0 - smoothstep(0.18, 0.28, progress));
  const heroY = -progress * 45;

  // Card 2: Left side (0.32 -> 0.48)
  const card2FadeIn = smoothstep(0.32, 0.38, progress);
  const card2FadeOut = 1.0 - smoothstep(0.44, 0.50, progress);
  const card2Opacity = card2FadeIn * card2FadeOut;
  const card2X = (1.0 - card2FadeIn) * -30;

  // Card 3: Right side (0.50 -> 0.64)
  const card3FadeIn = smoothstep(0.50, 0.56, progress);
  const card3FadeOut = 1.0 - smoothstep(0.60, 0.66, progress);
  const card3Opacity = card3FadeIn * card3FadeOut;
  const card3X = (1.0 - card3FadeIn) * 30;

  // Card 4: Left side (0.66 -> 0.82)
  const card4FadeIn = smoothstep(0.66, 0.72, progress);
  const card4FadeOut = 1.0 - smoothstep(0.78, 0.84, progress);
  const card4Opacity = card4FadeIn * card4FadeOut;
  const card4X = (1.0 - card4FadeIn) * -30;

  // Card 5: Center approach (0.85 -> 0.96)
  const card5FadeIn = smoothstep(0.85, 0.90, progress);
  const card5FadeOut = 1.0 - smoothstep(0.94, 0.97, progress);
  const card5Opacity = card5FadeIn * card5FadeOut;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-12 md:p-16">
      {/* 1. HERO TITLE (Top Center) */}
      <div 
        className="w-full text-center transition-opacity duration-75 pt-3 sm:pt-14 px-2 sm:px-0"
        style={{
          opacity: heroOpacity,
          transform: `translateY(${heroY}px)`,
          display: heroOpacity <= 0.01 ? 'none' : 'block'
        }}
      >
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full glass-panel-gold border border-amber-500/40 mb-2 sm:mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" aria-hidden="true" />
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em] text-amber-200 font-semibold font-mono">
            ACT I &middot; THE HEAVENS
          </span>
        </div>
        <h1 className="text-3xl sm:text-6xl md:text-8xl font-black tracking-tight text-white font-serif drop-shadow-[0_4px_35px_rgba(0,0,0,0.9)] max-w-5xl mx-auto leading-tight sm:leading-none">
          FALL INTO THE <span className="gold-gradient-text">UNKNOWN.</span>
        </h1>
        <p className="mt-2 sm:mt-4 text-xs sm:text-base md:text-xl text-neutral-300 max-w-xs sm:max-w-xl mx-auto font-light tracking-wide leading-relaxed drop-shadow-md">
          A celestial blade forged in the stars, tumbling through the troposphere towards ancient bedrock.
        </p>
        
        {/* Scroll Call to Action Indicator */}
        <div className="mt-3 sm:mt-8 flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/40 border border-white/10 text-[11px] sm:text-xs tracking-widest text-neutral-300 uppercase font-mono shadow-md backdrop-blur-sm">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" aria-hidden="true" />
            Scroll to begin descent
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-amber-400/80 animate-bounce" aria-hidden="true" />
        </div>
      </div>

      {/* 2. CARD 2: LEFT (0.32 -> 0.48) */}
      <div 
        className="w-[calc(100%-1rem)] max-w-sm sm:max-w-md self-center sm:self-start text-left glass-panel-gold p-5 sm:p-8 rounded-xl sm:rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-cyan-500/25 transition-all duration-75 pointer-events-auto"
        style={{
          opacity: card2Opacity,
          transform: `translateX(${card2X}px)`,
          display: card2Opacity <= 0.01 ? 'none' : 'block'
        }}
      >
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-cyan-400 font-semibold font-mono flex items-center gap-1.5">
            <Wind className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
            0.38 &middot; CLOUD CEILING
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 border border-white/10 px-2 py-0.5 rounded-full">
            10,400M ALT
          </span>
        </div>
        <h2 className="text-xl sm:text-3xl font-bold text-white font-serif leading-tight">
          EVERY DESCENT HAS A PURPOSE.
        </h2>
        <p className="mt-2 sm:mt-3 text-xs sm:text-base text-neutral-300 font-light leading-relaxed">
          Piercing the thunderclouds, the folded steel cools as it gathers atmospheric momentum. Frost crystallizes across the fuller.
        </p>
        <button
          onClick={() => toggleLore(2)}
          className="mt-3 sm:mt-4 text-xs font-mono text-cyan-300 hover:text-cyan-200 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>{expandedLore === 2 ? 'Hide Archive' : 'Read Codex Lore'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedLore === 2 ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {expandedLore === 2 && (
          <div className="mt-3 p-3 bg-black/40 rounded-lg border border-cyan-500/20 text-xs text-neutral-400 font-light animate-in fade-in duration-200">
            Ancient texts recount that the dagger was cast down from the constellation of Draco during the First Sundering.
          </div>
        )}
      </div>

      {/* 3. CARD 3: RIGHT (0.50 -> 0.64) */}
      <div 
        className="w-[calc(100%-1rem)] max-w-sm sm:max-w-md self-center sm:self-end text-left sm:text-right glass-panel-gold p-5 sm:p-8 rounded-xl sm:rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-emerald-500/25 transition-all duration-75 pointer-events-auto"
        style={{
          opacity: card3Opacity,
          transform: `translateX(${card3X}px)`,
          display: card3Opacity <= 0.01 ? 'none' : 'block'
        }}
      >
        <div className="flex items-center justify-between mb-2 sm:mb-3 flex-row sm:flex-row-reverse">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-emerald-400 font-semibold font-mono flex items-center gap-1.5">
            <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
            0.52 &middot; DEEP CANOPY
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 border border-white/10 px-2 py-0.5 rounded-full">
            5,800M ALT
          </span>
        </div>
        <h2 className="text-xl sm:text-3xl font-bold text-white font-serif leading-tight">
          THE DEEPER YOU GO,<br className="hidden sm:inline" />THE HEAVIER THE BLADE.
        </h2>
        <p className="mt-2 sm:mt-3 text-xs sm:text-base text-neutral-300 font-light leading-relaxed">
          Ancient pine silhouettes flash past the razor edge. The air thickens with moss, iron, and the electric scent of ozone.
        </p>
        <button
          onClick={() => toggleLore(3)}
          className="mt-3 sm:mt-4 text-xs font-mono text-emerald-300 hover:text-emerald-200 flex items-center gap-1 sm:ml-auto transition-colors cursor-pointer"
        >
          <span>{expandedLore === 3 ? 'Hide Archive' : 'Read Codex Lore'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedLore === 3 ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {expandedLore === 3 && (
          <div className="mt-3 p-3 bg-black/40 rounded-lg border border-emerald-500/20 text-xs text-neutral-400 font-light text-left animate-in fade-in duration-200">
            The canopy foliage bends violently under the supersonic draft created by the falling blade edge.
          </div>
        )}
      </div>

      {/* 4. CARD 4: LEFT (0.66 -> 0.82) */}
      <div 
        className="w-[calc(100%-1rem)] max-w-sm sm:max-w-md self-center sm:self-start text-left glass-panel-gold p-5 sm:p-8 rounded-xl sm:rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-amber-500/30 transition-all duration-75 pointer-events-auto"
        style={{
          opacity: card4Opacity,
          transform: `translateX(${card4X}px)`,
          display: card4Opacity <= 0.01 ? 'none' : 'block'
        }}
      >
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-amber-400 font-semibold font-mono flex items-center gap-1.5">
            <Mountain className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
            0.68 &middot; MOUNTAIN VALLEY
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono text-amber-300/80 border border-amber-500/30 px-2 py-0.5 rounded-full">
            2,200M ALT
          </span>
        </div>
        <h2 className="text-xl sm:text-3xl font-bold text-white font-serif leading-tight">
          UNTIL THERE IS<br className="hidden sm:inline" />NOWHERE LEFT TO FALL.
        </h2>
        <p className="mt-2 sm:mt-3 text-xs sm:text-base text-neutral-300 font-light leading-relaxed">
          Colossal jagged peaks tower in the dusk horizon. Extreme atmospheric compression begins igniting the Elder runes into glowing embers.
        </p>
      </div>

      {/* 5. CARD 5: APPROACH (0.85 -> 0.96) */}
      <div 
        className="w-[calc(100%-1rem)] max-w-md sm:max-w-lg mx-auto text-center glass-panel-gold p-5 sm:p-8 rounded-xl sm:rounded-2xl border border-orange-500/40 shadow-[0_0_50px_rgba(249,115,22,0.25)] transition-all duration-75 mb-16"
        style={{
          opacity: card5Opacity,
          display: card5Opacity <= 0.01 ? 'none' : 'block'
        }}
      >
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-orange-400 font-semibold font-mono mb-1 sm:mb-2 block">
          0.90 &middot; TERMINAL ACCELERATION
        </span>
        <h2 className="text-2xl sm:text-4xl font-bold text-white font-serif">
          BRACE FOR IMPACT
        </h2>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-neutral-300 font-light">
          Bedrock rises to meet celestial steel. Sound bends in the wake of the plunge.
        </p>
      </div>
    </div>
  );
};
