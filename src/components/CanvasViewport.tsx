import React, { useEffect, useRef } from 'react';
import { SceneManager } from '../webgl/SceneManager';
import { animationController } from '../core/AnimationState';

interface CanvasViewportProps {
  onProgressUpdate?: (progress: number) => void;
  onSceneReady?: (scene: SceneManager) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({ onSceneReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize 3D Scene Manager
    const sceneManager = new SceneManager(containerRef.current);
    sceneManagerRef.current = sceneManager;
    if (onSceneReady) {
      onSceneReady(sceneManager);
    }

    // Subscribe directly to master animation controller for 60fps updates
    const unsubscribe = animationController.subscribe((state) => {
      sceneManager.setProgress(state.progress, state.velocity);
      sceneManager.setReducedMotion(state.reducedMotion);
    });

    return () => {
      unsubscribe();
      sceneManager.destroy();
      sceneManagerRef.current = null;
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    />
  );
};
