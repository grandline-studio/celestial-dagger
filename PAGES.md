# Page & Route Inventory

This is a cinematic single-page application built for smooth scrollytelling performance.

## `/` (Root Index)
- **Container**: 650vh scroll container managed by a single master ScrollTrigger scrub.
- **Components**:
  - `CanvasViewport`: Fixed full-viewport Three.js WebGL canvas (`position: fixed; inset: 0`).
  - `ScreenShakeWrapper`: CSS transform shake wrapper active during $0.97 \le progress \le 0.995$.
  - `AudioMotionControls`: Fixed top-right HUD with audio toggle, act indicator, and depth percentage.
  - `NarrativeOverlay`: Alternating floating story blocks (0.00 Hero, 0.38 Left, 0.52 Right, 0.68 Left, 0.90 Center).
  - `FinalCTA`: Revealed at $0.985 \rightarrow 1.00$ with blade specifications drawer and restart trigger.
  - Overlays: Fullscreen film grain and radial vignette.
