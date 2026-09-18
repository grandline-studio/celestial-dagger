import React, { useEffect, useState } from 'react';
import { animationController } from '../core/AnimationState';
import { smoothstep } from '../utils/math';
import { ArrowUp, Sparkles, Shield, Compass } from 'lucide-react';

interface FinalCTAProps {
  onOpenForge?: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenForge }) => {
  const [progress, setProgress] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);

  useEffect(() => {
    return animationController.subscribe((state) => {
      setProgress(state.progress);
    });
  }, []);

  // CTA begins fading in once impact settles: 0.985 -> 1.00
  const ctaOpacity = smoothstep(0.982, 0.996, progress);
  const translateY = (1.0 - ctaOpacity) * 40;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (ctaOpacity <= 0.01) return null;

  return (
    <div 
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col items-center justify-end pb-8 px-4 sm:px-8 pointer-events-auto transition-all duration-150"
      style={{
        opacity: ctaOpacity,
        transform: `translateY(${translateY}px)`
      }}
    >
      <div className="w-full max-w-2xl bg-neutral-950/85 backdrop-blur-xl border border-amber-500/30 p-6 sm:p-10 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.9)] text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400 mb-3">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          ACT VI &middot; EMBEDDED REALM
        </span>

        <h2 className="text-3xl sm:text-5xl font-black text-white font-[var(--font-serif)] tracking-tight">
          THE JOURNEY ENDS HERE.
        </h2>

        <p className="mt-3 text-sm sm:text-base text-neutral-300 font-light max-w-lg mx-auto">
          Driven deep into ancient stone, the Celestial Blade rests. Its etched runes smolder with molten twilight.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              if (onOpenForge) {
                onOpenForge();
              } else {
                setShowSpecs(!showSpecs);
              }
            }}
            className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-semibold tracking-wider uppercase text-xs transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            aria-expanded={showSpecs}
          >
            <Shield className="w-4 h-4" aria-hidden="true" />
            Explore the Blade &amp; Forge
          </button>

          <button
            onClick={scrollToTop}
            className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/15 font-medium tracking-wider uppercase text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ArrowUp className="w-4 h-4" aria-hidden="true" />
            Ascend Once More
          </button>
        </div>

        {/* Expandable Specifications Card */}
        {showSpecs && (
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-3 bg-white/5 rounded-lg">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Total Length</span>
              <span className="text-sm font-semibold text-amber-200 font-mono">118.5 cm</span>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Metallurgy</span>
              <span className="text-sm font-semibold text-amber-200 font-mono">Folded Damascus</span>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Crossguard</span>
              <span className="text-sm font-semibold text-amber-200 font-mono">Cast Bronze</span>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Enchantment</span>
              <span className="text-sm font-semibold text-amber-200 font-mono">Elder Futhark</span>
            </div>
          </div>
        )}

        {/* Clean minimal footer credit */}
        <div className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2">
          <span>CINEMATIC THREE.JS &middot; GSAP SCROLLTRIGGER</span>
          <span className="flex items-center gap-1">
            <Compass className="w-3 h-3" aria-hidden="true" />
            Grandline Studio Engineering
          </span>
        </div>
      </div>
    </div>
  );
};
