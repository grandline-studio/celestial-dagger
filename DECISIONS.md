# Technical Decisions Log

## 1. Zero-Rerender Three.js Rendering Pipeline
- **Decision**: Drive 3D transformations, shader uniforms, particle positions, and camera dollies directly within the Three.js `requestAnimationFrame` loop using values provided by `ScrollTrigger.onUpdate`.
- **Alternative Considered**: Binding Three.js attributes to React component props via React Three Fiber (R3F).
- **Rationale**: Frequent React re-renders across 600+ frames of scrolling introduce garbage collection spikes, reconciliation overhead, and frame drops. Direct WebGL RAF keeps render loop strictly at 60 FPS on the GPU.

## 2. Continuous Vertical World vs. Scene Fading
- **Decision**: Position all environments in a single vertical space and blend them using custom GLSL sky dome shaders, volumetric exponential fog, and depth parallax.
- **Alternative Considered**: Cross-fading canvas opacity, video textures, or swapping textures between scenes.
- **Rationale**: Texture swapping causes texture rebinding stalls and visual abruptness. A continuous shader and physical parallax creates a believable continuous vertical drop.

## 3. Procedural Damascus Textures & Geometries
- **Decision**: Generate Damascus micro-grain, rune etchings, cloud puffs, and impact decals procedurally via high-resolution HTML Canvas textures.
- **Alternative Considered**: Relying on external 4K image assets or external `.glb` downloads.
- **Rationale**: Eliminates network latency, prevents 404 broken asset risks, reduces bundle size from tens of megabytes to under 1MB, and guarantees crisp rendering on any DPI.

## 4. Synthesized Web Audio API vs. Audio Files
- **Decision**: Synthesize atmospheric wind and stone impact thud using Web Audio API nodes (pink noise buffer, lowpass sweep, sub-bass oscillator).
- **Alternative Considered**: Bundling `.mp3` or `.wav` sound files.
- **Rationale**: Procedural sound allows dynamic parameter modulation (wind frequency and gain respond directly to scroll velocity in real time) with zero external network downloads.

## 5. Screen Shake via CSS Wrapper vs. Camera Jitter
- **Decision**: Apply screen shake through a GPU-accelerated CSS transform matrix wrapper during the impact window ($0.97 \le progress \le 0.995$), disabled automatically when `prefers-reduced-motion` is detected.
- **Alternative Considered**: Forcing camera matrix jitter inside Three.js or reflowing DOM elements.
- **Rationale**: CSS matrix transforms leverage hardware compositor layers without disrupting camera look-at calculations or causing layout thrashing.
