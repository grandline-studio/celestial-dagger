import React, { useState } from 'react';
import type { BladeFinishType, RuneGlowType } from '../webgl/SwordMesh';
import { SceneManager } from '../webgl/SceneManager';
import { 
  X, 
  RotateCw, 
  Sparkles, 
  Compass, 
  Check, 
  Info, 
  Flame, 
  Layers,
  Eye
} from 'lucide-react';

interface BladeForgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sceneManager: SceneManager | null;
}

interface AnatomyPart {
  id: string;
  name: string;
  category: string;
  spec: string;
  lore: string;
}

const ANATOMY_PARTS: AnatomyPart[] = [
  {
    id: 'tip',
    name: 'Astral Razor Tip',
    category: 'Penetration Geometry',
    spec: 'Geometry: Reinforced spearpoint with diamond cross-section. 64 HRC Rockwell hardness.',
    lore: 'Forged to puncture dragon hide and dense atmospheric friction without micro-fracturing or heat warping.'
  },
  {
    id: 'fuller',
    name: 'Etched Rune Fuller',
    category: 'Weight & Enchantment',
    spec: 'Dual-sided channeled fuller with sub-micron Elder Futhark inlay engraving.',
    lore: 'Distributes structural flexure while channeling cosmic plasma directly down the core of the blade.'
  },
  {
    id: 'edge',
    name: 'Damascene Bevel',
    category: 'Cutting Matrix',
    spec: 'Pattern: 512-layer folded meteorite steel with alternating nickel-iron bands.',
    lore: 'Every fold was quenched in glacial springwater under the light of alignment stars.'
  },
  {
    id: 'crossguard',
    name: 'Winged Cast Crossguard',
    category: 'Hilt & Defense',
    spec: 'Alloy: High-tensile celestial bronze with quillon sweep flares.',
    lore: 'Functions as a kinetic dampener, catching opposing strikes and dispersing shock before reaching the wielder.'
  },
  {
    id: 'grip',
    name: 'Bound Cord Grip',
    category: 'Ergonomics',
    spec: 'Material: Braided basalt fiber with treated wyrmskin underlay.',
    lore: 'Provides uncompromising traction even during high-G terminal atmospheric descents.'
  },
  {
    id: 'pommel',
    name: 'Counter-Balance Pommel',
    category: 'Balance Architecture',
    spec: 'Weight: 320 grams, faceted octagonal celestial brass.',
    lore: 'Offsets the heavy blade mass to position the exact center of percussion 4.2 cm ahead of the guard.'
  },
];

export const BladeForgeModal: React.FC<BladeForgeModalProps> = ({
  isOpen,
  onClose,
  sceneManager,
}) => {
  const [selectedFinish, setSelectedFinish] = useState<BladeFinishType>('damascus');
  const [selectedRune, setSelectedRune] = useState<RuneGlowType>('cyan');
  const [isOrbitActive, setIsOrbitActive] = useState(false);
  const [selectedPart, setSelectedPart] = useState<AnatomyPart>(ANATOMY_PARTS[0]);

  if (!isOpen) return null;

  const handleSelectFinish = (finish: BladeFinishType) => {
    setSelectedFinish(finish);
    if (sceneManager) {
      sceneManager.setBladeFinish(finish);
    }
  };

  const handleSelectRune = (rune: RuneGlowType) => {
    setSelectedRune(rune);
    if (sceneManager) {
      sceneManager.setRuneGlow(rune);
    }
  };

  const handleToggleOrbit = () => {
    const nextState = !isOrbitActive;
    setIsOrbitActive(nextState);
    if (sceneManager) {
      sceneManager.setInspectionMode(nextState);
    }
  };

  const handleClose = () => {
    setIsOrbitActive(false);
    if (sceneManager) {
      sceneManager.setInspectionMode(false);
    }
    onClose();
  };

  const finishes = [
    {
      id: 'damascus' as BladeFinishType,
      name: 'Folded Damascus',
      desc: 'Traditional high-carbon pattern with layered steel ripples',
      swatch: 'linear-gradient(135deg, #2b303c 0%, #15181e 50%, #4a5568 100%)',
      accent: '#94a3b8',
    },
    {
      id: 'celestial_gold' as BladeFinishType,
      name: 'Celestial Gold',
      desc: 'Polished solar brass alloy bathed in radiant amber reflections',
      swatch: 'linear-gradient(135deg, #d97706 0%, #fbbf24 50%, #78350f 100%)',
      accent: '#f59e0b',
    },
    {
      id: 'obsidian_void' as BladeFinishType,
      name: 'Void Obsidian',
      desc: 'Black mirror-finished core absorbing ambient luminescences',
      swatch: 'linear-gradient(135deg, #090a0f 0%, #181c24 50%, #030407 100%)',
      accent: '#38bdf8',
    },
    {
      id: 'crimson_frost' as BladeFinishType,
      name: 'Crimson Frost',
      desc: 'Glacial chilled blood-steel tempered in abyssal frost',
      swatch: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #450a0a 100%)',
      accent: '#ef4444',
    },
  ];

  const runes = [
    {
      id: 'cyan' as RuneGlowType,
      name: 'Astral Cyan',
      hex: '#4deeea',
      glow: '0 0 15px #4deeea',
    },
    {
      id: 'gold' as RuneGlowType,
      name: 'Solar Gold',
      hex: '#ffaa33',
      glow: '0 0 15px #ffaa33',
    },
    {
      id: 'ruby' as RuneGlowType,
      name: 'Blood Ruby',
      hex: '#ff2244',
      glow: '0 0 15px #ff2244',
    },
    {
      id: 'violet' as RuneGlowType,
      name: 'Void Violet',
      hex: '#bd00ff',
      glow: '0 0 15px #bd00ff',
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-end pointer-events-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Blade Forge & Customizer"
    >
      {/* Click outside to close backdrop */}
      <div 
        className="absolute inset-0 z-0" 
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container */}
      <div className="relative z-10 w-full max-w-xl h-full bg-[#080b11]/95 border-l border-amber-500/20 shadow-[-10px_0_40px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#080b11]/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-serif text-lg md:text-xl font-bold tracking-wide text-white">
                BLADE FORGE &amp; ARCHIVE
              </h2>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-300/70">
                PBR Material Customizer &middot; 3D Orbit
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="min-w-[44px] min-h-[44px] rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Blade Forge"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 md:p-8 space-y-8 flex-1">
          {/* Section 1: 360° Free Orbit Inspection Mode */}
          <div className="glass-panel p-5 rounded-xl border border-amber-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <h3 className="font-serif text-sm font-semibold text-white tracking-wider uppercase">
                  360&deg; Orbit Inspection
                </h3>
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                isOrbitActive 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}>
                {isOrbitActive ? 'ACTIVE' : 'LOCKED'}
              </span>
            </div>
            <p className="text-xs text-neutral-300 font-light mb-4">
              Unlock the dagger from vertical descent and drag pointer across the screen to orbit 360 degrees around every edge.
            </p>
            <button
              onClick={handleToggleOrbit}
              className={`w-full min-h-[44px] px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                isOrbitActive
                  ? 'bg-cyan-500 text-neutral-950 shadow-[0_0_20px_rgba(77,238,234,0.4)]'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
              }`}
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
              {isOrbitActive ? 'Lock Vertical Descent Angle' : 'Enable Free 360° Orbit Drag'}
            </button>
          </div>

          {/* Section 2: Blade Finish / Metallurgy */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-semibold text-white tracking-wider uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" aria-hidden="true" />
                Blade Metallurgy Finish
              </h3>
              <span className="text-[11px] font-mono text-neutral-400">4 Finishes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {finishes.map((f) => {
                const isSelected = selectedFinish === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => handleSelectFinish(f.id)}
                    className={`p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between min-h-[100px] ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif text-xs font-semibold text-white">
                        {f.name}
                      </span>
                      <div 
                        className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center shadow-inner"
                        style={{ background: f.swatch }}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" aria-hidden="true" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-light leading-relaxed">
                      {f.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Rune Glow Resonance */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-semibold text-white tracking-wider uppercase flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" aria-hidden="true" />
                Runic Luminescence
              </h3>
              <span className="text-[11px] font-mono text-neutral-400">Plasma Shift</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {runes.map((r) => {
                const isSelected = selectedRune === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRune(r.id)}
                    className={`p-3 rounded-xl border transition-all text-center flex flex-col items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10'
                    }`}
                  >
                    <div 
                      className="w-7 h-7 rounded-full transition-transform active:scale-90"
                      style={{ 
                        backgroundColor: r.hex,
                        boxShadow: isSelected ? r.glow : 'none'
                      }}
                    />
                    <span className="text-[11px] font-mono text-neutral-300">
                      {r.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Blade Anatomy Hotspots & Lore */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-semibold text-white tracking-wider uppercase flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" aria-hidden="true" />
                Blade Anatomy &amp; Lore Archive
              </h3>
            </div>

            {/* Hotspots Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {ANATOMY_PARTS.map((part) => {
                const isSelected = selectedPart.id === part.id;
                return (
                  <button
                    key={part.id}
                    onClick={() => setSelectedPart(part)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-neutral-950 font-semibold shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                    }`}
                  >
                    {part.name}
                  </button>
                );
              })}
            </div>

            {/* Selected Hotspot Detail Card */}
            <div className="glass-panel-gold p-5 rounded-xl border border-amber-500/30">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-1">
                {selectedPart.category}
              </span>
              <h4 className="font-serif text-base font-bold text-white mb-2">
                {selectedPart.name}
              </h4>
              <p className="text-xs font-mono text-amber-200/90 mb-3 bg-black/40 p-2.5 rounded-lg border border-amber-500/10">
                {selectedPart.spec}
              </p>
              <p className="text-xs text-neutral-300 font-light leading-relaxed">
                {selectedPart.lore}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-[#080b11]/90 backdrop-blur-md flex items-center justify-between">
          <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
            <span>WebGL PBR Studio Shader</span>
          </div>
          <button
            onClick={handleClose}
            className="min-h-[44px] px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
          >
            Apply &amp; Return
          </button>
        </div>
      </div>
    </div>
  );
};
