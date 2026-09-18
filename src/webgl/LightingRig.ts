import * as THREE from 'three';
import { smoothstep } from '../utils/math';

export class LightingRig {
  public group: THREE.Group;
  public keyLight: THREE.DirectionalLight;
  public fillLight: THREE.DirectionalLight;
  public rimLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public runePointLight: THREE.PointLight;

  private tmpKey = new THREE.Color();
  private tmpFill = new THREE.Color();
  private tmpRim = new THREE.Color();
  private tmpAmb = new THREE.Color();
  private tmpRune = new THREE.Color();

  private colRune1 = new THREE.Color(0x4deeea);
  private colRune2 = new THREE.Color(0x55ffcc);
  private colRune3 = new THREE.Color(0xffaa33);
  private colRune4 = new THREE.Color(0xff4400);

  constructor() {
    this.group = new THREE.Group();

    // 1. Ambient Light
    this.ambientLight = new THREE.AmbientLight(0x354050, 0.8);
    this.group.add(this.ambientLight);

    // 2. Key Directional Light (upper right front)
    this.keyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    this.keyLight.position.set(5, 8, 5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 25;
    this.keyLight.shadow.bias = -0.0005;
    this.group.add(this.keyLight);

    // 3. Fill Light (lower left front)
    this.fillLight = new THREE.DirectionalLight(0x7da4cf, 0.9);
    this.fillLight.position.set(-6, 2, 4);
    this.group.add(this.fillLight);

    // 4. Rim / Back Light (behind blade for sharp edge glint)
    this.rimLight = new THREE.DirectionalLight(0x90c4ff, 2.8);
    this.rimLight.position.set(0, 4, -6);
    this.group.add(this.rimLight);

    // 5. Dynamic Rune Point Light (attached near sword fuller)
    this.runePointLight = new THREE.PointLight(0x4deeea, 1.8, 4.5);
    this.runePointLight.position.set(0, -1.0, 0.3);
    this.group.add(this.runePointLight);
  }

  /**
   * Smooth continuous interpolation of light color, intensity and temperature across progress
   */
  public update(progress: number, _time: number) {
    if (progress < 0.35) {
      // Act 1: Celestial Sky -> Cloud descent
      const t = smoothstep(0.0, 0.35, progress);
      this.tmpKey.setRGB(1.0 - t * 0.35, 0.96 - t * 0.24, 0.9 - t * 0.25);
      this.tmpFill.setRGB(0.48 - t * 0.26, 0.64 - t * 0.32, 0.82 - t * 0.54);
      this.tmpRim.setRGB(0.65 - t * 0.2, 0.85 - t * 0.03, 1.0 - t * 0.35);
      this.tmpAmb.setRGB(0.25 - t * 0.13, 0.3 - t * 0.14, 0.38 - t * 0.24);
      this.keyLight.intensity = 2.2 - t * 0.7;
      this.tmpRune.lerpColors(this.colRune1, this.colRune2, t);
      this.runePointLight.color.copy(this.tmpRune);
    } else if (progress < 0.65) {
      // Act 2: Dark Forest Canopy (smoothly enters at end of Act 1)
      const t = smoothstep(0.35, 0.65, progress);
      this.tmpKey.setRGB(0.65 + t * 0.3, 0.72 - t * 0.17, 0.65 - t * 0.43);
      this.tmpFill.setRGB(0.22 + t * 0.03, 0.32 - t * 0.17, 0.28 - t * 0.03);
      this.tmpRim.setRGB(0.45 + t * 0.55, 0.82 - t * 0.12, 0.65 - t * 0.35);
      this.tmpAmb.setRGB(0.12 + t * 0.06, 0.16 - t * 0.06, 0.14);
      this.keyLight.intensity = 1.5 + t * 0.1;
      this.tmpRune.lerpColors(this.colRune2, this.colRune3, t);
      this.runePointLight.color.copy(this.tmpRune);
    } else if (progress < 0.88) {
      // Act 3: Mountain Twilight (smoothly enters at end of Act 2)
      const t = smoothstep(0.65, 0.88, progress);
      this.tmpKey.setRGB(0.95 + t * 0.05, 0.55 - t * 0.2, 0.22 - t * 0.14);
      this.tmpFill.setRGB(0.25 - t * 0.05, 0.15 - t * 0.07, 0.25 - t * 0.2);
      this.tmpRim.setRGB(1.0, 0.7 - t * 0.2, 0.3 - t * 0.15);
      this.tmpAmb.setRGB(0.18 - t * 0.06, 0.1 - t * 0.04, 0.14 - t * 0.1);
      this.keyLight.intensity = 1.6 + t * 0.4;
      this.tmpRune.lerpColors(this.colRune3, this.colRune4, t);
      this.runePointLight.color.copy(this.tmpRune);
    } else {
      // Act 4: Ground Approach & Impact (smoothly enters at end of Act 3)
      const t = smoothstep(0.88, 1.0, progress);

      // Warm studio key revealing metallic details and normal engravings
      this.tmpKey.setRGB(1.0, 0.35 + 0.53 * t, 0.08 + 0.64 * t);
      // Neutral cool night fill keeping shadow contrast crisp
      this.tmpFill.setRGB(0.2 + 0.02 * t, 0.08 + 0.2 * t, 0.05 + 0.3 * t);
      // Crisp specular rim light highlighting silhouette & sharp edges
      this.tmpRim.setRGB(1.0 - 0.12 * t, 0.5 + 0.44 * t, 0.15 + 0.85 * t);
      // Deep neutral ambient
      this.tmpAmb.setRGB(0.12 + 0.02 * t, 0.06 + 0.1 * t, 0.04 + 0.16 * t);

      // Impact flash boost at 0.97 - 0.985
      const flash = (progress >= 0.97 && progress <= 0.985)
        ? Math.sin((progress - 0.97) / 0.015 * Math.PI) * 1.6
        : 0.0;

      this.keyLight.intensity = 1.8 + flash;
      this.rimLight.intensity = 2.2 + flash * 0.4;

      // Position point light down at the bedrock crater fissures at impact
      const pointY = progress < 0.97 ? -1.0 : -2.4;
      this.runePointLight.position.set(0, pointY, 0.35);

      // Point light: gentle crater fissure ember glow, not blinding the hilt
      const pointIntensity = progress < 0.97 ? 1.6 : (0.75 + flash * 1.5);
      this.runePointLight.intensity = pointIntensity;
      this.runePointLight.color.copy(this.colRune4);
    }

    this.keyLight.color.copy(this.tmpKey);
    this.fillLight.color.copy(this.tmpFill);
    this.rimLight.color.copy(this.tmpRim);
    this.ambientLight.color.copy(this.tmpAmb);
  }
}
