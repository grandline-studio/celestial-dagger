import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { smoothstep, clamp } from '../utils/math';

export type BladeFinishType = 'damascus' | 'celestial_gold' | 'obsidian_void' | 'crimson_frost';
export type RuneGlowType = 'cyan' | 'gold' | 'ruby' | 'violet';

export class SwordMesh {
  public group: THREE.Group;
  public daggerGroup: THREE.Group;

  // Dagger mesh references for dynamic material manipulation
  private daggerMeshes: THREE.Mesh[] = [];
  private clickAimProgress = 0.0;
  public isModelLoaded = false;

  // Interactive Blade Forge Customization state
  public currentFinish: BladeFinishType = 'damascus';
  public currentRuneGlow: RuneGlowType = 'cyan';
  public isInspecting = false;
  private orbitRotation = { x: 0, y: 0 };

  constructor() {
    this.group = new THREE.Group();
    this.daggerGroup = new THREE.Group();

    this.group.add(this.daggerGroup);

    // Load the 3D fantasy dagger model from public/models/
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
        this.isModelLoaded = true;

        // Apply finish if one was selected
        this.setBladeFinish(this.currentFinish);
      },
      undefined,
      (err) => {
        console.error('Failed to load /models/fantasy_dagger.glb:', err);
      }
    );
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
   * Update dagger transform, aerodynamic precession, and user aiming
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
