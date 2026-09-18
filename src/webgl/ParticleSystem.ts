import * as THREE from 'three';
import { smoothstep } from '../utils/math';
import { createCircularParticleTexture } from './Textures';

export class ParticleSystem {
  public group: THREE.Group;

  // 1. Ambient atmospheric flow particles
  private ambientPoints!: THREE.Points;
  private ambientPositions!: Float32Array;
  private ambientDisplacements!: Float32Array;
  private ambientVelocities!: Float32Array;
  private ambientColors!: Float32Array;
  private ambientCount = 380;

  // 2. Ground impact explosion debris & dust
  private impactPoints!: THREE.Points;
  private impactPositions!: Float32Array;
  private impactVelocities!: Float32Array;
  private impactLifetimes!: Float32Array;
  private impactCount = 280;

  // 3. Ground shockwave ring
  private shockwaveRing!: THREE.Mesh;
  private shockwaveMaterial!: THREE.MeshBasicMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.buildAmbientParticles();
    this.buildImpactParticles();
    this.buildShockwaveRing();
  }

  private buildAmbientParticles() {
    const geom = new THREE.BufferGeometry();
    this.ambientPositions = new Float32Array(this.ambientCount * 3);
    this.ambientDisplacements = new Float32Array(this.ambientCount * 3);
    this.ambientVelocities = new Float32Array(this.ambientCount * 3);
    this.ambientColors = new Float32Array(this.ambientCount * 3);

    for (let i = 0; i < this.ambientCount; i++) {
      // Cylinder volume around sword: radius 4.5, height -10 to 10
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 4.5;
      this.ambientPositions[i * 3 + 0] = Math.cos(angle) * radius;
      this.ambientPositions[i * 3 + 1] = (Math.random() - 0.5) * 18.0;
      this.ambientPositions[i * 3 + 2] = Math.sin(angle) * radius;

      // Upward velocity (apparent upward drift as sword falls)
      this.ambientVelocities[i * 3 + 0] = (Math.random() - 0.5) * 0.08;
      this.ambientVelocities[i * 3 + 1] = 0.8 + Math.random() * 1.6;
      this.ambientVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;

      // Initial color (cool celestial white/blue)
      this.ambientColors[i * 3 + 0] = 0.85;
      this.ambientColors[i * 3 + 1] = 0.92;
      this.ambientColors[i * 3 + 2] = 1.0;
    }

    // Render positions buffer clone to isolate displacement from base kinematic drift
    const renderPositions = new Float32Array(this.ambientPositions);
    geom.setAttribute('position', new THREE.BufferAttribute(renderPositions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(this.ambientColors, 3));

    const circleTex = createCircularParticleTexture();

    const mat = new THREE.PointsMaterial({
      size: 0.032,
      map: circleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.ambientPoints = new THREE.Points(geom, mat);
    this.group.add(this.ambientPoints);
  }

  private buildImpactParticles() {
    const geom = new THREE.BufferGeometry();
    this.impactPositions = new Float32Array(this.impactCount * 3);
    this.impactVelocities = new Float32Array(this.impactCount * 3);
    this.impactLifetimes = new Float32Array(this.impactCount);

    for (let i = 0; i < this.impactCount; i++) {
      // Start hidden under impact point (y = -2.8)
      this.impactPositions[i * 3 + 0] = 0;
      this.impactPositions[i * 3 + 1] = -2.8;
      this.impactPositions[i * 3 + 2] = 0;

      // Radial blast direction
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 4.2;
      const elevation = 0.3 + Math.random() * 1.8;

      this.impactVelocities[i * 3 + 0] = Math.cos(angle) * speed;
      this.impactVelocities[i * 3 + 1] = elevation;
      this.impactVelocities[i * 3 + 2] = Math.sin(angle) * speed;

      this.impactLifetimes[i] = Math.random();
    }

    geom.setAttribute('position', new THREE.BufferAttribute(this.impactPositions, 3));

    const impactTex = createCircularParticleTexture();

    const mat = new THREE.PointsMaterial({
      size: 0.045,
      map: impactTex,
      color: 0xffaa44,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.impactPoints = new THREE.Points(geom, mat);
    this.group.add(this.impactPoints);
  }

  private buildShockwaveRing() {
    const ringGeom = new THREE.RingGeometry(0.1, 0.45, 32);
    ringGeom.rotateX(-Math.PI / 2);

    this.shockwaveMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8833,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.shockwaveRing = new THREE.Mesh(ringGeom, this.shockwaveMaterial);
    this.shockwaveRing.position.set(0, -2.76, 0);
    this.group.add(this.shockwaveRing);
  }

  /**
   * Update particle kinematics with pointer repulsion
   */
  public update(
    progress: number, 
    delta: number, 
    velocity: number,
    pointerWorldPos?: THREE.Vector3 | null
  ) {
    // 1. Update ambient particles
    const posAttr = this.ambientPoints.geometry.attributes.position;
    const colAttr = this.ambientPoints.geometry.attributes.color;
    const positions = posAttr.array as Float32Array;
    const colors = colAttr.array as Float32Array;

    // Upward rush increases with scroll velocity
    const speedMult = 1.0 + Math.abs(velocity) * 2.8;

    // Color gradient across progress: Blue/White -> Forest Green/Cyan -> Warm Amber/Red
    let r = 0.85, g = 0.92, b = 1.0;
    if (progress >= 0.45 && progress < 0.65) {
      r = 0.4; g = 0.95; b = 0.7;
    } else if (progress >= 0.65) {
      const heat = smoothstep(0.65, 0.95, progress);
      r = 1.0; g = 0.7 - heat * 0.4; b = 0.25 - heat * 0.2;
    }

    const repulsionRadius = 1.75;
    const repulsionRadiusSq = repulsionRadius * repulsionRadius;
    const repulsionStrength = 2.6;

    for (let i = 0; i < this.ambientCount; i++) {
      const idx = i * 3;
      // Ascend relative to falling camera
      this.ambientPositions[idx + 1] += this.ambientVelocities[idx + 1] * delta * speedMult;
      this.ambientPositions[idx + 0] += Math.sin(this.ambientPositions[idx + 1] * 0.5) * 0.01;

      // Wrap around vertical boundary [-9, 9]
      if (this.ambientPositions[idx + 1] > 9.0) {
        this.ambientPositions[idx + 1] = -9.0;
        this.ambientDisplacements[idx + 0] = 0;
        this.ambientDisplacements[idx + 1] = 0;
        this.ambientDisplacements[idx + 2] = 0;
      }

      // Interactive pointer repulsion in small radius
      if (pointerWorldPos) {
        const curX = this.ambientPositions[idx + 0] + this.ambientDisplacements[idx + 0];
        const curY = this.ambientPositions[idx + 1] + this.ambientDisplacements[idx + 1];
        const curZ = this.ambientPositions[idx + 2] + this.ambientDisplacements[idx + 2];

        const dx = curX - pointerWorldPos.x;
        const dy = curY - pointerWorldPos.y;
        const dz = curZ - pointerWorldPos.z;
        const distSq = dx * dx + dy * dy + dz * dz * 1.6;

        if (distSq < repulsionRadiusSq && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const force = (1.0 - dist / repulsionRadius) * repulsionStrength;
          this.ambientDisplacements[idx + 0] += (dx / dist) * force * delta * 14.0;
          this.ambientDisplacements[idx + 1] += (dy / dist) * force * delta * 14.0;
          this.ambientDisplacements[idx + 2] += (dz / dist) * force * delta * 8.0;
        }
      }

      // Smooth decay / return towards undisturbed flow
      this.ambientDisplacements[idx + 0] *= 0.91;
      this.ambientDisplacements[idx + 1] *= 0.91;
      this.ambientDisplacements[idx + 2] *= 0.91;

      // Composed coordinates written directly to render position buffer
      positions[idx + 0] = this.ambientPositions[idx + 0] + this.ambientDisplacements[idx + 0];
      positions[idx + 1] = this.ambientPositions[idx + 1] + this.ambientDisplacements[idx + 1];
      positions[idx + 2] = this.ambientPositions[idx + 2] + this.ambientDisplacements[idx + 2];

      // Update color
      colors[idx + 0] = r;
      colors[idx + 1] = g;
      colors[idx + 2] = b;
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // 2. Impact shockwave & particles ($progress \ge 0.97$)
    if (progress >= 0.97) {
      const impactProgress = smoothstep(0.97, 1.0, progress);

      // Expand shockwave ring
      const ringScale = 0.5 + impactProgress * 8.5;
      this.shockwaveRing.scale.set(ringScale, 1, ringScale);
      this.shockwaveMaterial.opacity = (1.0 - impactProgress) * 0.85;

      // Blast debris outward
      const impPosAttr = this.impactPoints.geometry.attributes.position;
      const impPositions = impPosAttr.array as Float32Array;
      const impMat = this.impactPoints.material as THREE.PointsMaterial;
      impMat.opacity = (1.0 - impactProgress) * 0.9;

      for (let i = 0; i < this.impactCount; i++) {
        const idx = i * 3;
        const blastTime = impactProgress * 1.5;

        impPositions[idx + 0] = this.impactVelocities[idx + 0] * blastTime;
        // Y has ballistic arc: velocityY * t - 0.5 * g * t^2
        impPositions[idx + 1] = -2.8 + Math.max(0, this.impactVelocities[idx + 1] * blastTime - 2.5 * blastTime * blastTime);
        impPositions[idx + 2] = this.impactVelocities[idx + 2] * blastTime;
      }
      impPosAttr.needsUpdate = true;
    } else {
      this.shockwaveMaterial.opacity = 0.0;
      (this.impactPoints.material as THREE.PointsMaterial).opacity = 0.0;
    }
  }
}
