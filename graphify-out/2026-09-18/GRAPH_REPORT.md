# Graph Report - Animated_sword  (2026-09-18)

## Corpus Check
- 38 files · ~335,082 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .glb 2, (none) 1, .css 1)

## Summary
- 306 nodes · 454 edges · 21 communities (17 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

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
- THE CELESTIAL DESCENT — Cinematic 3D Scrollytelling
- tsconfig.json
- System Architecture & Data Flow
- FEATURES.md
- Brag Plan: Celestial Blade
- Hyperframes Composition Brief: Celestial Blade
- hyperframes.json
- scripts
- HyperFrames Composition Project
- HyperFrames Composition Project

## God Nodes (most connected - your core abstractions)
1. `SceneManager` - 27 edges
2. `compilerOptions` - 18 edges
3. `animationController` - 17 edges
4. `smoothstep()` - 16 edges
5. `compilerOptions` - 15 edges
6. `SwordMesh` - 14 edges
7. `Brag Plan: Celestial Blade` - 14 edges
8. `Environment` - 13 edges
9. `react` - 10 edges
10. `SoundEngine` - 9 edges

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

## Communities (21 total, 4 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.10
Nodes (20): Page & Route Inventory, `/` (Root Index), ref_gsap_scrolltrigger, lucide-react, react, ref_react_dom_client, App(), AudioMotionControls() (+12 more)

### Community 1 - "SceneManager.ts"
Cohesion: 0.09
Nodes (18): three, ref_three_examples_jsm_environments_roomenvironment_js, ref_three_examples_jsm_loaders_gltfloader_js, FinalCTA(), FinalCTAProps, clamp(), smoothstep(), LightingRig (+10 more)

### Community 2 - "package.json"
Cohesion: 0.06
Nodes (33): dependencies, clsx, gsap, lucide-react, react, react-dom, tailwind-merge, three (+25 more)

### Community 3 - "SceneManager"
Cohesion: 0.10
Nodes (10): ANATOMY_PARTS, AnatomyPart, BladeForgeModal(), BladeForgeModalProps, CanvasViewport(), CanvasViewportProps, mapRange(), SceneManager (+2 more)

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

### Community 11 - "THE CELESTIAL DESCENT — Cinematic 3D Scrollytelling"
Cohesion: 0.40
Nodes (4): Key Architecture Highlights, Local Development, Tech Stack, THE CELESTIAL DESCENT — Cinematic 3D Scrollytelling

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
- **147 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `$schema` (+142 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 178 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SceneManager` connect `SceneManager` to `App.tsx`, `SceneManager.ts`, `Environment`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `three` connect `SceneManager.ts` to `package.json`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `react` connect `App.tsx` to `SceneManager.ts`, `package.json`, `SceneManager`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _147 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10128205128205128 - nodes in this community are weakly interconnected._
- **Should `SceneManager.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09178743961352658 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06050420168067227 - nodes in this community are weakly interconnected._