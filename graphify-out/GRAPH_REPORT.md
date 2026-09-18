# Graph Report - Animated_sword  (2026-09-19)

## Corpus Check
- 38 files · ~30,127 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .glb 1, .css 1)

## Summary
- 322 nodes · 465 edges · 22 communities (17 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `55ed84c4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.tsx
- SceneManager.ts
- package.json
- SceneManager
- compilerOptions
- compilerOptions
- devDependencies
- Technical Decisions Log
- Environment
- SoundEngine
- .oxlintrc.json
- 🗡️ THE CELESTIAL BLADE
- tsconfig.json
- System Architecture & Data Flow
- FEATURES.md
- Brag Plan: Celestial Blade
- Hyperframes Composition Brief: Celestial Blade
- hyperframes.json
- scripts
- HyperFrames Composition Project
- HyperFrames Composition Project
- SwordMesh

## God Nodes (most connected - your core abstractions)
1. `SceneManager` - 31 edges
2. `compilerOptions` - 18 edges
3. `animationController` - 17 edges
4. `smoothstep()` - 16 edges
5. `compilerOptions` - 15 edges
6. `Brag Plan: Celestial Blade` - 14 edges
7. `Environment` - 13 edges
8. `SwordMesh` - 12 edges
9. `🗡️ THE CELESTIAL BLADE` - 12 edges
10. `react` - 10 edges

## Surprising Connections (you probably didn't know these)
- ``/` (Root Index)` --references--> `AudioMotionControls()`  [INFERRED]
  PAGES.md → src/components/AudioMotionControls.tsx
- ``/` (Root Index)` --references--> `CanvasViewport()`  [INFERRED]
  PAGES.md → src/components/CanvasViewport.tsx
- ``/` (Root Index)` --references--> `FinalCTA()`  [INFERRED]
  PAGES.md → src/components/FinalCTA.tsx
- ``/` (Root Index)` --references--> `NarrativeOverlay()`  [INFERRED]
  PAGES.md → src/components/NarrativeOverlay.tsx
- ``/` (Root Index)` --references--> `ScreenShakeWrapper()`  [INFERRED]
  PAGES.md → src/components/ScreenShakeWrapper.tsx

## Import Cycles
- None detected.

## Communities (22 total, 5 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.08
Nodes (27): Page & Route Inventory, `/` (Root Index), gsap, ref_gsap_scrolltrigger, lucide-react, react, ref_react_dom_client, App() (+19 more)

### Community 1 - "SceneManager.ts"
Cohesion: 0.12
Nodes (15): three, ref_three_examples_jsm_environments_roomenvironment_js, ref_three_examples_jsm_loaders_gltfloader_js, clamp(), mapRange(), smoothstep(), ParticleSystem, createSkyDomeMaterial() (+7 more)

### Community 2 - "package.json"
Cohesion: 0.06
Nodes (32): dependencies, clsx, gsap, lucide-react, react, react-dom, tailwind-merge, three (+24 more)

### Community 3 - "SceneManager"
Cohesion: 0.11
Nodes (4): CanvasViewport(), CanvasViewportProps, LightingRig, SceneManager

### Community 4 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 5 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 6 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @tailwindcss/vite, @types/node, @types/react (+5 more)

### Community 7 - "Technical Decisions Log"
Cohesion: 0.29
Nodes (6): 1. Zero-Rerender Three.js Rendering Pipeline, 2. Continuous Vertical World vs. Scene Fading, 3. Procedural Damascus Textures & Geometries, 4. Synthesized Web Audio API vs. Audio Files, 5. Screen Shake via CSS Wrapper vs. Camera Jitter, Technical Decisions Log

### Community 10 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 11 - "🗡️ THE CELESTIAL BLADE"
Cohesion: 0.10
Nodes (20): 1. 🌌 Procedural Celestial Sky & Shaders, 2. 💨 Delicate Circular Particle Dynamics, 3. ⚒️ The 3D Blade Forge & Metallurgy Customizer, 4. 🎛️ Real-Time Flight Telemetry Cockpit, 5. 🔊 Procedural Web Audio Synthesis, *A Cinematic 60 FPS 3D Scrollytelling Odyssey into the Abyss*, 🤝 Contributing, 📐 Engineering & Architecture Highlights (+12 more)

### Community 13 - "System Architecture & Data Flow"
Cohesion: 0.50
Nodes (3): 1. Single Source of Truth for Motion, 2. Directory Structure, System Architecture & Data Flow

### Community 15 - "Brag Plan: Celestial Blade"
Cohesion: 0.10
Nodes (19): Audio direction, Brag Plan: Celestial Blade, Duration: 18.0 seconds, Format: landscape — 1920x1080, Hook (first 2-3 seconds), Key moments (the middle), Outro / punchline, Scene 1 — The Altitude Hook — 3.0s (0.0s - 3.0s) (+11 more)

### Community 16 - "Hyperframes Composition Brief: Celestial Blade"
Cohesion: 0.22
Nodes (8): Audio, Creative Direction, Hyperframes Composition Brief: Celestial Blade, Objective, Output, Source Material, Storyboard, Visual Identity

### Community 17 - "hyperframes.json"
Cohesion: 0.22
Nodes (8): media, autoProxy, paths, assets, blocks, components, registry, $schema

### Community 18 - "scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, check, dev, publish, render, type

### Community 19 - "HyperFrames Composition Project"
Cohesion: 0.25
Nodes (7): Commands, Documentation, HyperFrames Composition Project, Key Rules, Linting — ALWAYS RUN AFTER CHANGES, Project Structure, Skills — USE THESE FIRST

### Community 20 - "HyperFrames Composition Project"
Cohesion: 0.25
Nodes (7): Commands, Documentation, HyperFrames Composition Project, Key Rules, Linting — ALWAYS RUN AFTER CHANGES, Project Structure, Skills — USE THESE FIRST

## Knowledge Gaps
- **161 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `$schema` (+156 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 194 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SceneManager` connect `SceneManager` to `App.tsx`, `SceneManager.ts`, `SwordMesh`, `Environment`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `three` connect `SceneManager.ts` to `package.json`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `react` connect `App.tsx` to `package.json`, `SceneManager`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _161 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08244680851063829 - nodes in this community are weakly interconnected._
- **Should `SceneManager.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.062388591800356503 - nodes in this community are weakly interconnected._