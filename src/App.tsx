import React, { useEffect, useRef, useState } from 'react';
import { CanvasViewport } from './components/CanvasViewport';
import { NarrativeOverlay } from './components/NarrativeOverlay';
import { ScreenShakeWrapper } from './components/ScreenShakeWrapper';
import { FinalCTA } from './components/FinalCTA';
import { CinematicHUD } from './components/CinematicHUD';
import { BladeForgeModal } from './components/BladeForgeModal';
import { animationController } from './core/AnimationState';
import { SceneManager } from './webgl/SceneManager';

export const App: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [sceneManager, setSceneManager] = useState<SceneManager | null>(null);
  const [isForgeOpen, setIsForgeOpen] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);

  useEffect(() => {
    if (scrollContainerRef.current) {
      animationController.init(scrollContainerRef.current);
    }
    return () => {
      animationController.destroy();
    };
  }, []);

  // Poll / sync inspection state if toggled from modal or scene
  useEffect(() => {
    if (!sceneManager) return;
    const interval = setInterval(() => {
      if (sceneManager.sword && sceneManager.sword.isInspecting !== isInspecting) {
        setIsInspecting(sceneManager.sword.isInspecting);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [sceneManager, isInspecting]);

  return (
    <main className="relative w-full bg-[#050608] select-none">
      {/* Explicit Physical Scroll Track: Provides real 650vh scroll distance for mouse wheel, trackpad, and touch */}
      <div 
        ref={scrollContainerRef} 
        className="scroll-track"
        style={{ width: '100%', height: '650vh', minHeight: '650vh', pointerEvents: 'none' }}
        aria-hidden="true"
      />

      {/* Fixed Fullscreen Viewport Layer (Stays pinned to screen while document scrolls) */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <ScreenShakeWrapper>
          {/* 3D WebGL Canvas */}
          <CanvasViewport onSceneReady={setSceneManager} />

          {/* Cinematic Vignette and Film Grain Texture */}
          <div className="cinematic-vignette" aria-hidden="true" />
          <div className="cinematic-grain" aria-hidden="true" />

          {/* Floating UI & Story HUD */}
          <CinematicHUD 
            onOpenForge={() => setIsForgeOpen(true)}
            isForgeOpen={isForgeOpen}
            isInspecting={isInspecting}
          />
          <NarrativeOverlay />
          <FinalCTA onOpenForge={() => setIsForgeOpen(true)} />
        </ScreenShakeWrapper>
      </div>

      {/* Interactive Blade Customizer & Inspection Modal */}
      <BladeForgeModal 
        isOpen={isForgeOpen}
        onClose={() => {
          setIsForgeOpen(false);
          if (sceneManager) {
            sceneManager.setInspectionMode(false);
          }
          setIsInspecting(false);
        }}
        sceneManager={sceneManager}
      />
    </main>
  );
};

export default App;
