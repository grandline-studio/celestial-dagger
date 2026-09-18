# System Architecture & Data Flow

## 1. Single Source of Truth for Motion
```
User Scroll Event
       ↓
GSAP ScrollTrigger (scrub: 0.7)
       ↓
AnimationController (normalized progress: 0.0 → 1.0, velocity)
       ↓
┌──────────────────────────────────────┬──────────────────────────────────┐
│ Three.js Render Loop (Zero Rerender) │ React UI State (Selective Mount) │
├──────────────────────────────────────┼──────────────────────────────────┤
│ - Sword kinematics & vibration       │ - Narrative Card opacity/X       │
│ - Sky Dome GLSL shader uniforms      │ - Final CTA settle transform     │
│ - Parallax clouds, trees & mountains │ - Act & Depth % HUD badge        │
│ - Continuous 3-point light rig & fog │ - Screen shake wrapper trigger   │
│ - Particle flow & impact explosion   │                                  │
│ - Camera position, look-at & tilt    │                                  │
└──────────────────────────────────────┴──────────────────────────────────┘
```

## 2. Directory Structure
- `src/core/`:
  - `AnimationState.ts`: Master ScrollTrigger singleton and event dispatcher.
- `src/webgl/`:
  - `SceneManager.ts`: Orchestrates renderer, camera, RAF render loop, fog, and sub-systems.
  - `SwordMesh.ts`: Procedural Damascus blade, quillons, grip, pommel, and emissive runes.
  - `Environment.ts`: Continuous vertical world (sky dome, clouds, forest, mountains, bedrock).
  - `Shaders.ts`: GLSL shaders for multi-zone sky dome gradient interpolation.
  - `ParticleSystem.ts`: Ambient upward motes and ground impact debris burst.
  - `LightingRig.ts`: 3-point cinematic lighting with temperature transitions.
  - `Textures.ts`: Procedural canvas texture generators for Damascus grain, runes, clouds, and craters.
- `src/components/`:
  - `CanvasViewport.tsx`: Canvas mount container.
  - `NarrativeOverlay.tsx`: Alternating story cards.
  - `ScreenShakeWrapper.tsx`: Impact shake container.
  - `FinalCTA.tsx`: Settled end CTA.
  - `AudioMotionControls.tsx`: Audio & motion HUD.
- `src/utils/`:
  - `math.ts`: Hermite interpolation, clamping, and range mapping.
  - `sound.ts`: Synthesized Web Audio API sound effects.
