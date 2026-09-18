import * as THREE from 'three';
import { createSkyDomeMaterial } from './Shaders';
import { createCloudPuffTexture, createCraterDecalTexture, createCircularParticleTexture } from './Textures';
import { smoothstep, mapRange } from '../utils/math';

export class Environment {
  public group: THREE.Group;
  public skyMesh: THREE.Mesh;
  public skyMaterial: THREE.ShaderMaterial;

  // 3D Celestial Star Field
  private starPoints!: THREE.Points;

  // Cloud layers
  private cloudsGroup: THREE.Group;
  private cloudSprites: THREE.Sprite[] = [];

  // Forest canopy layers
  private forestGroup: THREE.Group;
  private forestPlanes: { mesh: THREE.Mesh; baseSpeed: number; baseY: number }[] = [];

  // Mountain ridge layers
  private mountainGroup: THREE.Group;
  private mountainMeshes: { mesh: THREE.Mesh; baseSpeed: number; baseY: number }[] = [];

  // Ground plane and impact decal
  private groundGroup: THREE.Group;
  private groundMesh!: THREE.Mesh;
  private craterDecal!: THREE.Mesh;
  private craterMaterial!: THREE.MeshBasicMaterial;

  constructor() {
    this.group = new THREE.Group();

    // 1. Sky Dome
    const skyGeom = new THREE.SphereGeometry(60, 32, 24);
    this.skyMaterial = createSkyDomeMaterial();
    this.skyMesh = new THREE.Mesh(skyGeom, this.skyMaterial);
    this.group.add(this.skyMesh);

    // 2. 3D Celestial Star Field
    this.buildStarField();

    // 3. Cloud decks
    this.cloudsGroup = new THREE.Group();
    this.buildClouds();
    this.group.add(this.cloudsGroup);

    // 3. Forest canopy
    this.forestGroup = new THREE.Group();
    this.buildForest();
    this.group.add(this.forestGroup);

    // 4. Mountains
    this.mountainGroup = new THREE.Group();
    this.buildMountains();
    this.group.add(this.mountainGroup);

    // 5. Ground plane & crater
    this.groundGroup = new THREE.Group();
    this.buildGround();
    this.group.add(this.groundGroup);
  }

  private buildStarField() {
    const starCount = 950;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const colorWhite = new THREE.Color(0xf0f8ff);
    const colorCyan = new THREE.Color(0x7df9ff);
    const colorAmber = new THREE.Color(0xffd580);
    const tempColor = new THREE.Color();

    for (let i = 0; i < starCount; i++) {
      // Scatter throughout upper celestial dome shell (radius 42 to 56)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 1.5 - 0.5); // predominantly upper hemisphere
      const r = 42 + Math.random() * 14;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const dice = Math.random();
      if (dice < 0.65) tempColor.copy(colorWhite);
      else if (dice < 0.88) tempColor.copy(colorCyan);
      else tempColor.copy(colorAmber);

      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    const starGeom = new THREE.BufferGeometry();
    starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starCircleTex = createCircularParticleTexture();

    const starMat = new THREE.PointsMaterial({
      size: 0.08,
      map: starCircleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.starPoints = new THREE.Points(starGeom, starMat);
    this.group.add(this.starPoints);
  }

  private buildClouds() {
    const cloudTex = createCloudPuffTexture();
    const cloudMat = new THREE.SpriteMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    // 35 cloud puffs distributed in a vertical chimney and lateral expanse
    const numClouds = 36;
    for (let i = 0; i < numClouds; i++) {
      const sprite = new THREE.Sprite(cloudMat.clone());
      const scale = 5.0 + Math.random() * 8.0;
      sprite.scale.set(scale, scale * 0.75, 1);

      // Position: from Y = -15 up to Y = 25
      const angle = Math.random() * Math.PI * 2;
      const radius = 3.5 + Math.random() * 9.0;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius - 1.5;
      const y = -12 + (i / numClouds) * 35;

      sprite.position.set(x, y, z);
      // Custom user data to store speed and initial Y
      sprite.userData = {
        initialY: y,
        speed: 18 + Math.random() * 12,
        baseOpacity: 0.35 + Math.random() * 0.45,
      };

      this.cloudSprites.push(sprite);
      this.cloudsGroup.add(sprite);
    }
  }

  private buildForest() {
    // Generate silhouette pine tree / branch canvas textures
    const pineTex = this.createTreeSilhouetteTexture();
    const branchTex = this.createBranchSilhouetteTexture();

    // 1. Far background forest horizon
    const farForestMat = new THREE.MeshBasicMaterial({
      map: pineTex,
      transparent: true,
      opacity: 0.0,
      color: 0x121c16,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const farGeom = new THREE.PlaneGeometry(36, 14);
    const farMesh = new THREE.Mesh(farGeom, farForestMat);
    farMesh.position.set(0, -22, -12);
    this.forestPlanes.push({ mesh: farMesh, baseSpeed: 14, baseY: -22 });
    this.forestGroup.add(farMesh);

    // 2. Midground forest trunks & canopy
    const midForestMat = new THREE.MeshBasicMaterial({
      map: pineTex,
      transparent: true,
      opacity: 0.0,
      color: 0x0a100c,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    for (let i = 0; i < 4; i++) {
      const midGeom = new THREE.PlaneGeometry(16, 12);
      const midMesh = new THREE.Mesh(midGeom, midForestMat.clone());
      const x = (i - 1.5) * 8.5;
      const y = -26 + i * 2.5;
      const z = -6.5 + (i % 2) * 2;
      midMesh.position.set(x, y, z);
      this.forestPlanes.push({ mesh: midMesh, baseSpeed: 20, baseY: y });
      this.forestGroup.add(midMesh);
    }

    // 3. Foreground branches entering from viewport edges
    const fgBranchMat = new THREE.MeshBasicMaterial({
      map: branchTex,
      transparent: true,
      opacity: 0.0,
      color: 0x050806,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const leftBranch = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), fgBranchMat);
    leftBranch.position.set(-4.5, -28, -2.2);
    this.forestPlanes.push({ mesh: leftBranch, baseSpeed: 28, baseY: -28 });
    this.forestGroup.add(leftBranch);

    const rightBranch = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), fgBranchMat.clone());
    rightBranch.scale.x = -1; // Flip horizontally
    rightBranch.position.set(4.5, -31, -2.4);
    this.forestPlanes.push({ mesh: rightBranch, baseSpeed: 28, baseY: -31 });
    this.forestGroup.add(rightBranch);
  }

  private createTreeSilhouetteTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 512, 256);
    ctx.fillStyle = '#ffffff';

    // Draw row of jagged pine tree silhouettes
    const numTrees = 18;
    for (let i = 0; i < numTrees; i++) {
      const x = (i / numTrees) * 512 + (Math.random() - 0.5) * 20;
      const h = 130 + Math.random() * 110;
      const w = 24 + Math.random() * 22;
      const yBase = 256;

      ctx.beginPath();
      ctx.moveTo(x, yBase - h);
      ctx.lineTo(x + w * 0.4, yBase - h * 0.7);
      ctx.lineTo(x + w * 0.3, yBase - h * 0.7);
      ctx.lineTo(x + w * 0.6, yBase - h * 0.4);
      ctx.lineTo(x + w * 0.4, yBase - h * 0.4);
      ctx.lineTo(x + w * 0.8, yBase);
      ctx.lineTo(x - w * 0.8, yBase);
      ctx.lineTo(x - w * 0.4, yBase - h * 0.4);
      ctx.lineTo(x - w * 0.6, yBase - h * 0.4);
      ctx.lineTo(x - w * 0.3, yBase - h * 0.7);
      ctx.lineTo(x - w * 0.4, yBase - h * 0.7);
      ctx.closePath();
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  private createBranchSilhouetteTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 512, 384);
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';

    // Draw sprawling gnarled branch
    ctx.beginPath();
    ctx.moveTo(0, 190);
    ctx.bezierCurveTo(150, 160, 260, 240, 420, 180);
    ctx.stroke();

    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(180, 175);
    ctx.bezierCurveTo(240, 90, 310, 120, 390, 70);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(280, 210);
    ctx.bezierCurveTo(340, 270, 400, 280, 470, 320);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }

  private buildMountains() {
    // 3D low-poly jagged mountain ridge geometry
    const mountainGeom = new THREE.ConeGeometry(8, 14, 6);
    mountainGeom.rotateY(Math.PI / 6);

    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x221a22,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
      transparent: true,
      opacity: 0.0,
    });

    // Create 7 mountain peaks spanning background
    const peaks = [
      { x: -14, z: -18, scale: 1.6, baseY: -38, speed: 12 },
      { x: -6,  z: -14, scale: 1.2, baseY: -36, speed: 14 },
      { x: 3,   z: -16, scale: 1.5, baseY: -37, speed: 13 },
      { x: 12,  z: -19, scale: 1.8, baseY: -39, speed: 11 },
      { x: -9,  z: -10, scale: 0.9, baseY: -33, speed: 16 },
      { x: 7,   z: -11, scale: 1.0, baseY: -34, speed: 15 },
      { x: 0,   z: -8,  scale: 0.8, baseY: -32, speed: 18 },
    ];

    peaks.forEach((p) => {
      const mesh = new THREE.Mesh(mountainGeom, mountainMat.clone());
      mesh.scale.set(p.scale, p.scale, p.scale);
      mesh.position.set(p.x, p.baseY, p.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.mountainMeshes.push({ mesh, baseSpeed: p.speed, baseY: p.baseY });
      this.mountainGroup.add(mesh);
    });
  }

  private buildGround() {
    // Rocky ground plane placed below the sword
    const groundGeom = new THREE.PlaneGeometry(40, 40, 32, 32);
    groundGeom.rotateX(-Math.PI / 2);

    // Perturb vertices slightly for jagged rocky surface
    const pos = groundGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.sqrt(x * x + z * z);
      // Slight crater depression in center
      const crater = Math.exp(-dist * 0.3) * -0.25;
      const noise = Math.sin(x * 0.8) * Math.cos(z * 0.8) * 0.08;
      pos.setY(i, crater + noise);
    }
    groundGeom.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x181412,
      roughness: 0.92,
      metalness: 0.15,
      flatShading: true,
    });

    this.groundMesh = new THREE.Mesh(groundGeom, groundMat);
    this.groundMesh.position.set(0, -2.8, 0);
    this.groundMesh.receiveShadow = true;
    this.groundGroup.add(this.groundMesh);

    // Impact crater decal ring with fractures
    const craterGeom = new THREE.PlaneGeometry(4.5, 4.5);
    craterGeom.rotateX(-Math.PI / 2);
    this.craterMaterial = new THREE.MeshBasicMaterial({
      map: createCraterDecalTexture(),
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });

    this.craterDecal = new THREE.Mesh(craterGeom, this.craterMaterial);
    this.craterDecal.position.set(0, -2.78, 0);
    this.groundGroup.add(this.craterDecal);

    // Initially hide ground far below
    this.groundGroup.position.y = -25;
  }

  /**
   * Continuous update driven by scroll progress
   */
  public update(progress: number, time: number) {
    // 1. Update Sky Dome Shader uniforms
    this.skyMaterial.uniforms.uProgress.value = progress;
    this.skyMaterial.uniforms.uTime.value = time;

    // 2. 3D Celestial Star Field: subtle cosmic rotation and atmospheric fade
    if (this.starPoints) {
      this.starPoints.rotation.y = time * 0.005;
      const starAlpha = 1.0 - smoothstep(0.18, 0.45, progress);
      (this.starPoints.material as THREE.PointsMaterial).opacity = starAlpha * 0.95;
    }

    // 3. Cloud layers ascent & fade
    // Clouds rush upward past camera between 0.0 and 0.50
    this.cloudSprites.forEach((sprite) => {
      const uData = sprite.userData;
      // Parallax upward displacement based on progress
      const yOffset = progress * uData.speed * 1.5;
      sprite.position.y = uData.initialY + yOffset;

      // Opacity: high in sky (0.0 -> 0.35), fades out as we descend into forest (0.35 -> 0.52)
      const cloudAlpha = smoothstep(0.0, 0.15, progress) * (1.0 - smoothstep(0.38, 0.52, progress));
      const mat = sprite.material as THREE.SpriteMaterial;
      mat.opacity = uData.baseOpacity * cloudAlpha;
    });

    // 3. Forest layers: emerge 0.35 -> 0.65
    // Forest alpha: fades in 0.32 -> 0.45, peaks at 0.55, fades out 0.62 -> 0.76
    const forestAlpha = smoothstep(0.32, 0.44, progress) * (1.0 - smoothstep(0.64, 0.76, progress));
    this.forestPlanes.forEach((fp) => {
      const yOffset = progress * fp.baseSpeed * 1.4;
      fp.mesh.position.y = fp.baseY + yOffset;
      const mat = fp.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = forestAlpha * 0.95;
    });

    // 4. Mountains: emerge 0.60 -> 0.90
    // Mountain alpha: fades in 0.58 -> 0.70, peaks at 0.78, recedes 0.85 -> 0.95
    const mountainAlpha = smoothstep(0.58, 0.70, progress) * (1.0 - smoothstep(0.88, 0.98, progress));
    this.mountainMeshes.forEach((mp) => {
      const yOffset = progress * mp.baseSpeed * 1.3;
      mp.mesh.position.y = mp.baseY + yOffset;
      const mat = mp.mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = mountainAlpha;
    });

    // 5. Ground approach (0.80 -> 1.00)
    if (progress > 0.75) {
      // Ground plane moves up toward camera
      // From y = -25 up to y = 0 at progress 0.97
      const groundProgress = smoothstep(0.75, 0.97, progress);
      this.groundGroup.position.y = mapRange(groundProgress, 0, 1, -22, 0);

      // Crater decal flares on impact (0.97 -> 1.00)
      if (progress >= 0.97) {
        const impactProgress = smoothstep(0.97, 1.0, progress);
        this.craterMaterial.opacity = mapRange(impactProgress, 0, 1, 0.0, 0.95);
      } else {
        this.craterMaterial.opacity = 0.0;
      }
    } else {
      this.groundGroup.position.y = -25;
      this.craterMaterial.opacity = 0.0;
    }
  }
}
