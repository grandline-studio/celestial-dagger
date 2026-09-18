import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createDamascusPatternTexture, createRuneEmissiveTexture } from './Textures';
import { smoothstep, clamp } from '../utils/math';

export type BladeFinishType = 'damascus' | 'celestial_gold' | 'obsidian_void' | 'crimson_frost';
export type RuneGlowType = 'cyan' | 'gold' | 'ruby' | 'violet';

export class SwordMesh {
  public group: THREE.Group;
  public proceduralGroup: THREE.Group;
  public daggerGroup: THREE.Group;

  // Procedural fallback meshes
  public bladeMesh!: THREE.Mesh;
  public runesMeshFront!: THREE.Mesh;
  public runesMeshBack!: THREE.Mesh;
  public crossguardMesh!: THREE.Group;
  public gripMesh!: THREE.Mesh;
  public pommelMesh!: THREE.Mesh;

  private damascusTex: THREE.CanvasTexture;
  private runeTex: THREE.CanvasTexture;
  private runeMaterialFront!: THREE.MeshBasicMaterial;
  private runeMaterialBack!: THREE.MeshBasicMaterial;
  private bladeMaterial!: THREE.MeshStandardMaterial;

  // Dagger mesh references for dynamic material manipulation
  private daggerMeshes: THREE.Mesh[] = [];
  private clickAimProgress = 0.0;
  private isModelLoaded = false;

  // Interactive Blade Forge Customization state
  public currentFinish: BladeFinishType = 'damascus';
  public currentRuneGlow: RuneGlowType = 'cyan';
  public isInspecting = false;
  private orbitRotation = { x: 0, y: 0 };
  private scratchRuneColor = new THREE.Color(0x4deeea);

  constructor() {
    this.group = new THREE.Group();
    this.proceduralGroup = new THREE.Group();
    this.daggerGroup = new THREE.Group();

    this.group.add(this.proceduralGroup);
    this.group.add(this.daggerGroup);

    this.damascusTex = createDamascusPatternTexture();
    this.runeTex = createRuneEmissiveTexture();

    // 1. Build procedural version as instant placeholder
    this.buildBlade();
    this.buildCrossguard();
    this.buildGripAndPommel();

    // 2. Load the 3D fantasy dagger model from public/models/
    this.loadDaggerModel();

    // Default orientation: points down along -Y
    this.group.rotation.x = 0;
    this.group.position.set(0, 0, 0);
  }

  private loadDaggerModel() {
    const loader = new GLTFLoader();
    loader.load(
      '/models/fantasy_dagger.glb',
      (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
              mat.envMapIntensity = 1.4;
              mat.emissive.setRGB(0, 0, 0);
              mat.emissiveIntensity = 0.0;
              mesh.material = mat;
            }
            this.daggerMeshes.push(mesh);
          }
        });

        // The model is oriented diagonally from (-0.98, 1, 0) [tip] to (0.99, -1, 0) [hilt]
        // Adding Math.PI aligns the blade tip pointing straight DOWN along -Y
        // and the hilt pointing straight UP along +Y
        model.rotation.z = -3.919434 + Math.PI;

        // Scale to cinematic proportions (length ~ 4.2 units)
        const scale = 1.55;
        model.scale.set(scale, scale, scale);

        // Center crossguard/hilt lower so pommel stays clear of text
        model.position.set(0, -0.15, 0);

        this.daggerGroup.add(model);

        // Seamlessly switch from procedural placeholder to the 3D dagger model
        this.proceduralGroup.visible = false;
        this.isModelLoaded = true;
      },
      undefined,
      (err) => {
        console.warn('Could not load /models/fantasy_dagger.glb, using procedural sword:', err);
      }
    );
  }

  private buildBlade() {
    const bladeLength = 4.2;
    const bladeWidth = 0.36;
    const bladeThickness = 0.07;
    const tipLength = 0.55;

    const geom = new THREE.BufferGeometry();
    const segments = 32;
    const positions: number[] = [];
    const uvs: number[] = [];
    const normals: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = -t * bladeLength;
      
      let w = bladeWidth * 0.5;
      let th = bladeThickness * 0.5;

      if (t > (1.0 - tipLength / bladeLength)) {
        const tipProgress = (t - (1.0 - tipLength / bladeLength)) / (tipLength / bladeLength);
        w *= (1.0 - tipProgress);
        th *= (1.0 - tipProgress * 0.7);
      }

      const fullerDepth = t < 0.75 ? 0.012 : 0.0;
      positions.push(
        0, y, th - fullerDepth,
        w, y, 0,
        0, y, -th + fullerDepth,
        -w, y, 0
      );

      for (let p = 0; p < 4; p++) {
        uvs.push(p / 3, t);
        normals.push(0, 0, 1);
      }
    }

    const indices: number[] = [];
    for (let i = 0; i < segments; i++) {
      const r1 = i * 4;
      const r2 = (i + 1) * 4;

      indices.push(r1 + 0, r1 + 1, r2 + 1);
      indices.push(r1 + 0, r2 + 1, r2 + 0);
      indices.push(r1 + 1, r1 + 2, r2 + 2);
      indices.push(r1 + 1, r2 + 2, r2 + 1);
      indices.push(r1 + 2, r1 + 3, r2 + 3);
      indices.push(r1 + 2, r2 + 3, r2 + 2);
      indices.push(r1 + 3, r1 + 0, r2 + 0);
      indices.push(r1 + 3, r2 + 0, r2 + 3);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    this.bladeMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8d0d8,
      metalness: 0.94,
      roughness: 0.22,
      roughnessMap: this.damascusTex,
      bumpMap: this.damascusTex,
      bumpScale: 0.008,
      envMapIntensity: 1.8,
    });

    this.bladeMesh = new THREE.Mesh(geom, this.bladeMaterial);
    this.bladeMesh.castShadow = true;
    this.bladeMesh.receiveShadow = true;
    this.proceduralGroup.add(this.bladeMesh);

    // Glowing Runes down the fuller groove (Front & Back)
    const runeGeom = new THREE.PlaneGeometry(0.09, bladeLength * 0.72);
    
    this.runeMaterialFront = new THREE.MeshBasicMaterial({
      map: this.runeTex,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      color: 0x4deeea,
      side: THREE.FrontSide,
      depthWrite: false,
    });

    this.runeMaterialBack = this.runeMaterialFront.clone();
    this.runeMaterialBack.side = THREE.BackSide;

    this.runesMeshFront = new THREE.Mesh(runeGeom, this.runeMaterialFront);
    this.runesMeshFront.position.set(0, -bladeLength * 0.38, bladeThickness * 0.5 + 0.002);
    this.proceduralGroup.add(this.runesMeshFront);

    this.runesMeshBack = new THREE.Mesh(runeGeom, this.runeMaterialBack);
    this.runesMeshBack.position.set(0, -bladeLength * 0.38, -bladeThickness * 0.5 - 0.002);
    this.proceduralGroup.add(this.runesMeshBack);
  }

  private buildCrossguard() {
    this.crossguardMesh = new THREE.Group();

    const guardMaterial = new THREE.MeshStandardMaterial({
      color: 0xb58e50,
      metalness: 0.88,
      roughness: 0.32,
      bumpScale: 0.005,
    });

    const barGeom = new THREE.CylinderGeometry(0.065, 0.05, 1.2, 16);
    barGeom.rotateZ(Math.PI / 2);
    const mainBar = new THREE.Mesh(barGeom, guardMaterial);
    mainBar.castShadow = true;
    this.crossguardMesh.add(mainBar);

    const bossGeom = new THREE.OctahedronGeometry(0.14, 1);
    bossGeom.scale(1.2, 0.8, 1.2);
    const centerBoss = new THREE.Mesh(bossGeom, guardMaterial);
    this.crossguardMesh.add(centerBoss);

    const finialGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const leftFinial = new THREE.Mesh(finialGeom, guardMaterial);
    leftFinial.position.set(-0.62, 0.04, 0);
    const rightFinial = new THREE.Mesh(finialGeom, guardMaterial);
    rightFinial.position.set(0.62, 0.04, 0);
    this.crossguardMesh.add(leftFinial);
    this.crossguardMesh.add(rightFinial);

    this.crossguardMesh.position.set(0, 0, 0);
    this.proceduralGroup.add(this.crossguardMesh);
  }

  private buildGripAndPommel() {
    const gripLength = 1.05;
    const gripGeom = new THREE.CylinderGeometry(0.055, 0.062, gripLength, 20);
    const gripMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1614,
      metalness: 0.12,
      roughness: 0.78,
    });

    this.gripMesh = new THREE.Mesh(gripGeom, gripMaterial);
    this.gripMesh.position.set(0, gripLength * 0.5 + 0.04, 0);
    this.gripMesh.castShadow = true;
    this.proceduralGroup.add(this.gripMesh);

    const wireMaterial = new THREE.MeshStandardMaterial({
      color: 0xcca055,
      metalness: 0.9,
      roughness: 0.25,
    });

    const numRings = 7;
    for (let i = 0; i < numRings; i++) {
      const ringGeom = new THREE.TorusGeometry(0.062, 0.007, 8, 24);
      ringGeom.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeom, wireMaterial);
      ring.position.set(0, 0.12 + (i / numRings) * (gripLength - 0.15), 0);
      this.proceduralGroup.add(ring);
    }

    const pommelGeom = new THREE.DodecahedronGeometry(0.12, 1);
    pommelGeom.scale(1, 1.2, 0.85);
    const pommelMaterial = new THREE.MeshStandardMaterial({
      color: 0xb58e50,
      metalness: 0.88,
      roughness: 0.32,
    });

    this.pommelMesh = new THREE.Mesh(pommelGeom, pommelMaterial);
    this.pommelMesh.position.set(0, gripLength + 0.16, 0);
    this.pommelMesh.castShadow = true;
    this.proceduralGroup.add(this.pommelMesh);
  }

  public setBladeFinish(finish: BladeFinishType) {
    this.currentFinish = finish;
    if (!this.isModelLoaded) return;

    this.daggerMeshes.forEach((m) => {
      const mat = m.material as THREE.MeshStandardMaterial;
      if (!mat) return;
      if (finish === 'damascus') {
        mat.color.setRGB(1.0, 1.0, 1.0);
        mat.metalness = 0.95;
        mat.roughness = 0.35;
        mat.envMapIntensity = 1.4;
      } else if (finish === 'celestial_gold') {
        mat.color.setRGB(1.2, 0.98, 0.62);
        mat.metalness = 0.98;
        mat.roughness = 0.22;
        mat.envMapIntensity = 2.2;
      } else if (finish === 'obsidian_void') {
        mat.color.setRGB(0.2, 0.18, 0.26);
        mat.metalness = 0.9;
        mat.roughness = 0.12;
        mat.envMapIntensity = 2.4;
      } else if (finish === 'crimson_frost') {
        mat.color.setRGB(1.25, 0.45, 0.52);
        mat.metalness = 0.94;
        mat.roughness = 0.25;
        mat.envMapIntensity = 1.8;
      }
      mat.needsUpdate = true;
    });
  }

  public setRuneGlow(glow: RuneGlowType) {
    this.currentRuneGlow = glow;
  }

  public setInspectionMode(active: boolean) {
    this.isInspecting = active;
  }

  public addOrbitDrag(deltaX: number, deltaY: number) {
    this.orbitRotation.y += deltaX * 0.008;
    this.orbitRotation.x = clamp(this.orbitRotation.x + deltaY * 0.008, -Math.PI * 0.45, Math.PI * 0.45);
  }

  /**
   * Update sword/dagger transform, aerodynamic precession, and rune luminescence based on normalized progress
   */
  public update(
    progress: number, 
    time: number, 
    velocity: number, 
    mouse?: { x: number; y: number },
    mouseWeight = 0,
    isLeftClicking = false
  ) {
    // 360-Degree Free Orbit Inspection Mode (When Forge Drawer is open)
    if (this.isInspecting) {
      this.group.rotation.x = -1.55 + this.orbitRotation.x;
      this.group.rotation.y = time * 0.25 + this.orbitRotation.y;
      this.group.rotation.z = 0;
      this.group.position.set(0, -0.4, 1.2);
      return;
    }

    const baseRotationY = time * 0.45 + progress * Math.PI * 4;
    const wobbleX = Math.sin(time * 2.2) * 0.045 + Math.cos(time * 1.3) * 0.025;
    const wobbleZ = Math.cos(time * 1.8) * 0.045 + Math.sin(time * 2.7) * 0.02;

    const airDragTilt = clamp(velocity * 0.2, -0.15, 0.15);

    if (progress < 0.97) {
      // Interactive mouse pointing angles when not scrolling
      const mouseX = mouse ? mouse.x : 0;
      const mouseY = mouse ? mouse.y : 0;

      // Z rotation: tilting blade tip towards horizontal cursor position
      const interactiveZ = mouseX * 0.45 * mouseWeight;

      // X rotation: tilting blade towards/away from camera
      const interactiveX = -mouseY * 0.32 * mouseWeight;

      // Y rotation: blade yaw creates specular glints on the metallic bevel
      const interactiveY = mouseX * 0.65 * mouseWeight;

      // Subtle horizontal displacement towards cursor
      const interactivePosX = mouseX * 0.35 * mouseWeight;

      // Normal falling hover parameters positioned well below hero text
      const normalTargetY = -1.55 - progress * 0.45 + (mouseY * 0.18 * mouseWeight);
      const normalRotX = wobbleX + airDragTilt + interactiveX;
      const normalRotY = baseRotationY + interactiveY;
      const normalRotZ = wobbleZ + interactiveZ;

      // Left-click aiming mode: when stationary, point the dagger tip directly towards the user
      const targetClickAim = (isLeftClicking && mouseWeight > 0.4) ? 1.0 : 0.0;
      // Slow, graceful cinematic easing (~1.1s smooth acceleration and deceleration)
      const easeSpeed = targetClickAim > this.clickAimProgress ? 0.032 : 0.042;
      this.clickAimProgress += (targetClickAim - this.clickAimProgress) * easeSpeed;
      // Hermite smoothstep for silky ease-in and ease-out acceleration
      const cw = smoothstep(0.0, 1.0, this.clickAimProgress);

      // Aimed directly at user:
      // Rotating X by -1.805 rad (-103.4 deg) precisely aligns the blade tip with the camera line of sight
      // Subtle mouse tracking allows the user to steer the pointed tip dynamically
      const aimRotX = -1.805 - mouseY * 0.22;
      const aimRotY = mouseX * 0.35;
      const aimRotZ = wobbleZ * 0.1 + mouseX * 0.15;

      const aimPosX = mouseX * 0.35;
      const aimPosY = normalTargetY + 0.25 + mouseY * 0.15;
      const aimPosZ = 0.85; // Bring blade forward towards the viewer with dramatic 3D foreshortening

      this.group.rotation.x = (1.0 - cw) * normalRotX + cw * aimRotX;
      this.group.rotation.y = (1.0 - cw) * normalRotY + cw * aimRotY;
      this.group.rotation.z = (1.0 - cw) * normalRotZ + cw * aimRotZ;

      this.group.position.x = (1.0 - cw) * interactivePosX + cw * aimPosX;
      this.group.position.y = (1.0 - cw) * normalTargetY + cw * aimPosY;
      this.group.position.z = cw * aimPosZ;
    } else {
      // IMPACT PHASE (0.97 -> 1.00)
      this.clickAimProgress = 0.0;
      const impactProgress = smoothstep(0.97, 1.0, progress);
      
      this.group.rotation.x = (1.0 - impactProgress) * wobbleX;
      this.group.rotation.z = (1.0 - impactProgress) * wobbleZ;
      this.group.rotation.x += impactProgress * 0.08;

      const impactY = -1.95 - impactProgress * 0.35;
      const vibration = Math.sin((progress - 0.97) * 120.0) * Math.exp(-impactProgress * 12.0) * 0.04;

      this.group.position.y = impactY + vibration;
      this.group.position.x = vibration * 0.5;
    }

    // Rune luminescence & color shift
    const runeColor = this.scratchRuneColor;
    let baseHex = 0x4deeea;
    if (this.currentRuneGlow === 'gold') baseHex = 0xffaa33;
    else if (this.currentRuneGlow === 'ruby') baseHex = 0xff2244;
    else if (this.currentRuneGlow === 'violet') baseHex = 0xbd00ff;

    runeColor.setHex(baseHex);
    let intensity = 0.85 + Math.sin(time * 4.0) * 0.2;

    if (this.currentRuneGlow === 'cyan') {
      if (progress >= 0.45 && progress < 0.65) {
        runeColor.setHex(0x66ffcc);
      } else if (progress >= 0.65 && progress < 0.85) {
        runeColor.setHex(0xffaa33);
        intensity = 1.2 + Math.sin(time * 6.0) * 0.35;
      } else if (progress >= 0.85) {
        const heat = smoothstep(0.85, 1.0, progress);
        runeColor.setRGB(1.0, 0.35 + (1.0 - heat) * 0.4, 0.05);
        intensity = 1.4 + heat * 2.2 + (progress >= 0.97 ? Math.sin(time * 15.0) * 0.8 : 0);
      }
    } else {
      if (progress >= 0.85) {
        intensity = 1.5 + (progress >= 0.97 ? Math.sin(time * 15.0) * 0.8 : 0);
      }
    }

    this.runeMaterialFront.color.copy(runeColor);
    this.runeMaterialBack.color.copy(runeColor);
    this.runeMaterialFront.opacity = clamp(intensity, 0.4, 3.0);
    this.runeMaterialBack.opacity = clamp(intensity, 0.4, 3.0);

    // Maintain pristine texture and normal map clarity on loaded 3D dagger model
    if (this.isModelLoaded) {
      this.daggerMeshes.forEach((m) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat && (mat.emissive.r > 0 || mat.emissive.g > 0 || mat.emissive.b > 0)) {
          mat.emissive.setRGB(0, 0, 0);
          mat.emissiveIntensity = 0.0;
        }
      });
    }
  }
}
