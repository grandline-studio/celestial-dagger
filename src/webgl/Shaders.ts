import * as THREE from 'three';

export const SkyDomeVertexShader = `
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const SkyDomeFragmentShader = `
uniform float uProgress;
uniform float uTime;
varying vec3 vWorldPosition;
varying vec2 vUv;

// Pseudo-random 3D hash
float hash3(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// Procedural 3D Starfield with core glow, diffraction spikes, and twinkling
float generateStars(vec3 dir, float scale, float threshold) {
  vec3 p = dir * scale;
  vec3 id = floor(p);
  vec3 f = fract(p) - 0.5;

  float n = hash3(id);
  if (n < threshold) return 0.0;

  float size = (n - threshold) / (1.0 - threshold);
  float dist = length(f);

  // Individual star twinkle frequency
  float twinkle = sin(uTime * (2.0 + n * 4.0) + n * 62.8) * 0.4 + 0.6;

  // Soft spherical star core
  float core = smoothstep(0.12 * size, 0.0, dist);

  // 4-point subtle diffraction cross for brighter stars
  float flare = 0.0;
  if (size > 0.6) {
    float crossDist = min(abs(f.x), abs(f.y));
    flare = smoothstep(0.35 * size, 0.0, length(f)) * smoothstep(0.03, 0.0, crossDist) * 0.5;
  }

  return (core + flare) * twinkle * (0.5 + size * 0.8);
}

void main() {
  vec3 dir = normalize(vWorldPosition);
  float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

  // ==========================================
  // 1. BASE ATMOSPHERIC GRADIENT PALETTES
  // ==========================================
  
  // Palette 1: Celestial Astral Cosmos (Act 1: 0.00 - 0.25)
  vec3 skyTop1 = vec3(0.008, 0.012, 0.028);     // Deep midnight cosmic void
  vec3 skyMid1 = vec3(0.025, 0.045, 0.095);     // Rich astral indigo
  vec3 skyHorizon1 = vec3(0.07, 0.12, 0.24);    // Luminous starlight horizon

  // Palette 2: Stormy Cloud Layer (Act 2: 0.30 - 0.45)
  vec3 skyTop2 = vec3(0.04, 0.05, 0.08);        // Slate storm canopy
  vec3 skyMid2 = vec3(0.12, 0.15, 0.22);        // Misty cloud silver
  vec3 skyHorizon2 = vec3(0.28, 0.32, 0.42);    // Overcast glow

  // Palette 3: Deep Forest Canopy (Act 3: 0.45 - 0.65)
  vec3 skyTop3 = vec3(0.015, 0.025, 0.022);     // Night forest darkness
  vec3 skyMid3 = vec3(0.04, 0.09, 0.07);        // Twilight pine mist
  vec3 skyHorizon3 = vec3(0.12, 0.22, 0.16);    // Forest floor atmospheric haze

  // Palette 4: Mountain Sunset / Twilight (Act 4: 0.65 - 0.85)
  vec3 skyTop4 = vec3(0.03, 0.02, 0.06);        // Dusk purple zenith
  vec3 skyMid4 = vec3(0.25, 0.10, 0.09);        // Terracotta alpenglow
  vec3 skyHorizon4 = vec3(0.65, 0.32, 0.14);    // Golden molten horizon

  // Palette 5: Volcanic Bedrock / Impact (Act 5: 0.85 - 1.00)
  vec3 skyTop5 = vec3(0.012, 0.012, 0.018);     // Obsidian night
  vec3 skyMid5 = vec3(0.12, 0.04, 0.03);        // Smoldering ember atmosphere
  vec3 skyHorizon5 = vec3(0.32, 0.09, 0.04);    // Fiery volcanic dusk

  // Smooth Hermite transitions between vertical realms
  float t1_2 = smoothstep(0.18, 0.35, uProgress);
  float t2_3 = smoothstep(0.38, 0.52, uProgress);
  float t3_4 = smoothstep(0.58, 0.72, uProgress);
  float t4_5 = smoothstep(0.78, 0.92, uProgress);

  vec3 top = mix(skyTop1, skyTop2, t1_2);
  top = mix(top, skyTop3, t2_3);
  top = mix(top, skyTop4, t3_4);
  top = mix(top, skyTop5, t4_5);

  vec3 mid = mix(skyMid1, skyMid2, t1_2);
  mid = mix(mid, skyMid3, t2_3);
  mid = mix(mid, skyMid4, t3_4);
  mid = mix(mid, skyMid5, t4_5);

  vec3 horizon = mix(skyHorizon1, skyHorizon2, t1_2);
  horizon = mix(horizon, skyHorizon3, t2_3);
  horizon = mix(horizon, skyHorizon4, t3_4);
  horizon = mix(horizon, skyHorizon5, t4_5);

  // Gradient composition along dome verticality
  vec3 baseSky = mix(horizon, mid, smoothstep(0.0, 0.40, h));
  baseSky = mix(baseSky, top, smoothstep(0.40, 1.0, h));

  // ==========================================
  // 2. COSMIC NEBULA & AURORAL FILAMENTS
  // ==========================================
  float nebulaPhase = uTime * 0.04;
  float n1 = sin(dir.x * 2.8 + dir.y * 1.5 + nebulaPhase) * cos(dir.z * 2.5 - dir.y * 1.8);
  float n2 = sin(dir.x * 5.2 - dir.z * 4.1 + nebulaPhase * 1.2);
  float nebulaMask = smoothstep(0.2, 0.85, (n1 * 0.6 + n2 * 0.4) * 0.5 + 0.5);

  vec3 nebulaColor = mix(
    vec3(0.08, 0.02, 0.16), // Deep cosmic violet
    vec3(0.01, 0.09, 0.15), // Ethereal teal-cyan
    n2 * 0.5 + 0.5
  );

  // Nebulae are glorious in the heavens and fade down into troposphere
  float celestialWeight = (1.0 - smoothstep(0.15, 0.45, uProgress)) * smoothstep(0.1, 0.6, h);
  baseSky += nebulaColor * nebulaMask * celestialWeight * 0.85;

  // ==========================================
  // 3. CELESTIAL ASTRAL MOON & HALO
  // ==========================================
  vec3 moonDir = normalize(vec3(0.42, 0.62, -0.65));
  float moonDist = length(dir - moonDir);

  // Volumetric Moon Corona Glow
  float moonGlow = exp(-moonDist * 3.8) * 0.45;
  // Outer Astral Ring
  float moonRing = smoothstep(0.015, 0.0, abs(moonDist - 0.28)) * 0.18;
  
  // Moon Crescent Disc
  float moonDisc = smoothstep(0.11, 0.104, moonDist);
  float moonShadow = smoothstep(0.105, 0.098, length(dir - (moonDir + vec3(0.028, 0.018, 0.0))));
  float crescent = max(0.0, moonDisc - moonShadow);

  vec3 moonLight = vec3(0.95, 0.96, 1.0) * crescent * 1.4;
  moonLight += vec3(0.65, 0.82, 1.0) * (moonGlow + moonRing);
  baseSky += moonLight * celestialWeight;

  // ==========================================
  // 4. MULTI-LAYER PROCEDURAL STARFIELD
  // ==========================================
  if (celestialWeight > 0.01) {
    float starsFine = generateStars(dir, 140.0, 0.94);
    float starsMed  = generateStars(dir, 65.0, 0.92);
    float starsBig  = generateStars(dir, 32.0, 0.96);

    vec3 starColor = mix(vec3(0.85, 0.95, 1.0), vec3(1.0, 0.92, 0.75), hash3(dir * 20.0));
    float totalStars = starsFine * 0.6 + starsMed * 0.85 + starsBig * 1.3;

    baseSky += starColor * totalStars * celestialWeight;
  }

  // ==========================================
  // 5. SUBTLE SHIMMER & FINAL OUTPUT
  // ==========================================
  float shimmer = sin(vUv.x * 15.0 + uTime * 0.4) * 0.003;
  baseSky += vec3(shimmer);

  gl_FragColor = vec4(baseSky, 1.0);
}
`;

export function createSkyDomeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: SkyDomeVertexShader,
    fragmentShader: SkyDomeFragmentShader,
    uniforms: {
      uProgress: { value: 0.0 },
      uTime: { value: 0.0 }
    },
    side: THREE.BackSide,
    depthWrite: false
  });
}
