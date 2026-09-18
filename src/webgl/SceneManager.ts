import * as THREE from 'three';
import { SwordMesh } from './SwordMesh';
import type { BladeFinishType, RuneGlowType } from './SwordMesh';
import { Environment } from './Environment';
import { ParticleSystem } from './ParticleSystem';
import { LightingRig } from './LightingRig';
import { smoothstep, mapRange, clamp } from '../utils/math';
import { soundManager } from '../utils/sound';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export class SceneManager {
  public container: HTMLElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  // Scene sub-systems
  public sword: SwordMesh;
  public environment: Environment;
  public particles: ParticleSystem;
  public lights: LightingRig;

  // State
  private progress = 0.0;
  private velocity = 0.0;
  private animFrameId: number | null = null;
  private clock: THREE.Clock;
  private mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  private lastScrollTime = 0;
  private mouseWeight = 0.0;
  private isDestroyed = false;
  private isReducedMotion = false;
  private isLeftClicking = false;
  private lastClientX = 0;
  private lastClientY = 0;

  // Mobile and touch hold tracking
  public isMobile = false;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchHoldTimer: any = null;
  private isTouchAiming = false;

  // 3D pointer tracking for interactive particle repulsion
  private mouseRaycaster = new THREE.Raycaster();
  private planeZ0 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private pointerWorldPos = new THREE.Vector3();

  // Reusable color instances for zero-allocation fog interpolation
  private fogColorSky = new THREE.Color(0x060913);
  private fogColorForest = new THREE.Color(0x0a120e);
  private fogColorMountain = new THREE.Color(0x28161e);
  private fogColorGround = new THREE.Color(0x120808);

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    // 1. Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 2. Scene, Fog & PBR Environment
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060913, 0.007);

    // Provide neutral HDR studio reflections so metals, gems and Damascus patterns gleam realistically
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    pmrem.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.scene.environment = pmrem.fromScene(roomEnv, 0.04).texture;
    pmrem.dispose();

    // 3. Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    this.camera.position.set(0, 0.5, 6.2);

    // 4. Instantiate components
    this.sword = new SwordMesh();
    this.scene.add(this.sword.group);

    this.environment = new Environment();
    this.scene.add(this.environment.group);

    this.particles = new ParticleSystem();
    this.scene.add(this.particles.group);

    this.lights = new LightingRig();
    this.scene.add(this.lights.group);

    // 5. Event listeners
    this.onResize = this.onResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onDeviceOrientation = this.onDeviceOrientation.bind(this);
    this.onWindowScroll = this.onWindowScroll.bind(this);

    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mouseleave', this.onMouseUp);
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: true });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', this.onTouchEnd, { passive: true });
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', this.onDeviceOrientation, { passive: true });
    }
    window.addEventListener('scroll', this.onWindowScroll, { passive: true });

    // Initial responsive setup
    this.onResize();

    // 6. Start Render Loop
    this.renderLoop = this.renderLoop.bind(this);
    this.animFrameId = requestAnimationFrame(this.renderLoop);
  }

  public setReducedMotion(val: boolean) {
    this.isReducedMotion = val;
  }

  public setProgress(p: number, v = 0) {
    this.progress = clamp(p, 0.0, 1.0);
    this.velocity = v;

    if (Math.abs(v) > 0.0008) {
      this.lastScrollTime = performance.now();
    }

    // Trigger sound effects
    soundManager.updateWind(this.velocity);
    if (this.progress >= 0.97) {
      soundManager.triggerImpact();
    } else if (this.progress < 0.92) {
      soundManager.resetImpact();
    }
  }

  private onWindowScroll() {
    this.lastScrollTime = performance.now();
  }

  public setBladeFinish(finish: BladeFinishType) {
    this.sword.setBladeFinish(finish);
  }

  public setRuneGlow(glow: RuneGlowType) {
    this.sword.setRuneGlow(glow);
  }

  public setInspectionMode(inspecting: boolean) {
    this.sword.setInspectionMode(inspecting);
  }

  public addOrbitDrag(dx: number, dy: number) {
    this.sword.addOrbitDrag(dx, dy);
  }

  private onMouseMove(e: MouseEvent) {
    if (this.isReducedMotion) return;
    const dx = e.clientX - this.lastClientX;
    const dy = e.clientY - this.lastClientY;
    this.lastClientX = e.clientX;
    this.lastClientY = e.clientY;

    if (this.isLeftClicking && this.sword.isInspecting) {
      this.sword.addOrbitDrag(dx, dy);
    }

    this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  }

  private onMouseDown(e: MouseEvent) {
    if (this.isReducedMotion) return;
    this.lastClientX = e.clientX;
    this.lastClientY = e.clientY;
    if (e.button === 0) {
      this.isLeftClicking = true;
      if (this.mouseWeight > 0.4 && this.progress < 0.97 && !this.sword.isInspecting) {
        soundManager.triggerBladeAimChime();
      }
    }
  }

  private onMouseUp(e: MouseEvent) {
    if (e.button === 0) {
      this.isLeftClicking = false;
    }
  }

  private onTouchStart(e: TouchEvent) {
    if (this.isReducedMotion || e.touches.length === 0) return;
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.lastClientX = touch.clientX;
    this.lastClientY = touch.clientY;

    this.mouse.targetX = (touch.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.targetY = -(touch.clientY / window.innerHeight - 0.5) * 2;

    if (this.touchHoldTimer) clearTimeout(this.touchHoldTimer);
    this.touchHoldTimer = setTimeout(() => {
      if (this.progress < 0.97 && !this.sword.isInspecting) {
        this.isLeftClicking = true;
        this.isTouchAiming = true;
        soundManager.triggerBladeAimChime();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(25); } catch { /* ignore */ }
        }
      }
    }, 180);
  }

  private onTouchMove(e: TouchEvent) {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (this.sword.isInspecting) {
      const deltaX = touch.clientX - this.lastClientX;
      const deltaY = touch.clientY - this.lastClientY;
      this.lastClientX = touch.clientX;
      this.lastClientY = touch.clientY;
      this.sword.addOrbitDrag(deltaX, deltaY);
      return;
    }

    if (!this.isTouchAiming && dist > 14) {
      if (this.touchHoldTimer) {
        clearTimeout(this.touchHoldTimer);
        this.touchHoldTimer = null;
      }
    }

    this.mouse.targetX = (touch.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.targetY = -(touch.clientY / window.innerHeight - 0.5) * 2;
    this.lastClientX = touch.clientX;
    this.lastClientY = touch.clientY;
  }

  private onTouchEnd() {
    if (this.touchHoldTimer) {
      clearTimeout(this.touchHoldTimer);
      this.touchHoldTimer = null;
    }
    if (this.isTouchAiming) {
      this.isTouchAiming = false;
      this.isLeftClicking = false;
    }
  }

  private onDeviceOrientation(e: DeviceOrientationEvent) {
    if (this.isReducedMotion || !this.isMobile || this.isTouchAiming) return;
    if (e.gamma !== null && e.beta !== null) {
      const gamma = clamp(e.gamma, -30, 30) / 30;
      const beta = clamp(e.beta - 45, -30, 30) / 30;
      this.mouse.targetX = gamma * 0.75;
      this.mouse.targetY = -beta * 0.5;
    }
  }

  private onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    this.isMobile = isMobile;
    if (this.sword) {
      this.sword.setIsMobile(isMobile);
    }

    this.camera.fov = isMobile ? 50 : 45;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private updateCamera(time: number) {
    // Parallax damping
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Camera coordinates mapped along progress
    let targetX = this.mouse.x * 0.35;
    let targetY = 0.5;
    let targetZ = 6.2;
    let lookAtY = -0.6;

    if (this.progress < 0.35) {
      // Sky: sweeping view of blade descending cleanly below hero title
      const t = smoothstep(0.0, 0.35, this.progress);
      targetY = mapRange(t, 0, 1, 0.0, -0.3);
      targetZ = mapRange(t, 0, 1, 6.3, 5.6);
      lookAtY = mapRange(t, 0, 1, -1.2, -1.4);
    } else if (this.progress < 0.65) {
      // Forest: close tracking through branches (connects from Act 1: targetY -0.3, lookAtY -1.4)
      const t = smoothstep(0.35, 0.65, this.progress);
      targetY = mapRange(t, 0, 1, -0.3, -0.6);
      targetZ = mapRange(t, 0, 1, 5.6, 5.9);
      lookAtY = mapRange(t, 0, 1, -1.4, -1.65);
    } else if (this.progress < 0.88) {
      // Mountains: pulled back epic valley scale (connects from Act 2: targetY -0.6, lookAtY -1.65)
      const t = smoothstep(0.65, 0.88, this.progress);
      targetY = mapRange(t, 0, 1, -0.6, -0.95);
      targetZ = mapRange(t, 0, 1, 5.9, 6.5);
      lookAtY = mapRange(t, 0, 1, -1.65, -1.85);
    } else if (this.progress < 0.97) {
      // Ground Approach: camera swoops down closer (connects from Act 3: targetY -0.95, lookAtY -1.85)
      const t = smoothstep(0.88, 0.97, this.progress);
      targetY = mapRange(t, 0, 1, -0.95, -1.3);
      targetZ = mapRange(t, 0, 1, 6.5, 4.8);
      lookAtY = mapRange(t, 0, 1, -1.85, -2.0);
    } else {
      // Impact & Settled state: low ground angle looking up at embedded blade
      const t = smoothstep(0.97, 1.0, this.progress);
      if (this.isMobile) {
        // On mobile, frame the embedded blade higher up with wide perspective so the entire hilt,
        // crossguard, and bedrock impact fracture lines stay above the final CTA drawer
        targetY = mapRange(t, 0, 1, -1.0, -1.15);
        targetZ = mapRange(t, 0, 1, 4.8, 4.6);
        lookAtY = mapRange(t, 0, 1, -1.8, -1.72);
      } else {
        targetY = mapRange(t, 0, 1, -1.3, -1.55);
        targetZ = mapRange(t, 0, 1, 4.8, 4.2);
        lookAtY = mapRange(t, 0, 1, -2.0, -2.15);
      }
    }

    // Subtle breath oscillation when not impacted
    const breath = this.progress < 0.97 ? Math.sin(time * 1.5) * 0.04 : 0;
    this.camera.position.x = targetX;
    this.camera.position.y = targetY + breath + this.mouse.y * 0.2;
    this.camera.position.z = targetZ;

    const mobileLookOffset = (this.isMobile && this.progress < 0.97) ? -0.22 : 0.0;
    this.camera.lookAt(0, lookAtY + mobileLookOffset, 0);
  }

  private updateFog() {
    if (!this.scene.fog) return;
    const fog = this.scene.fog as THREE.FogExp2;

    // Density and color shift continuously across acts with zero color popping
    if (this.progress < 0.35) {
      const t = mapRange(this.progress, 0, 0.35, 0, 1);
      fog.color.copy(this.fogColorSky);
      fog.density = mapRange(t, 0, 1, 0.005, 0.016);
    } else if (this.progress < 0.65) {
      const t = mapRange(this.progress, 0.35, 0.65, 0, 1);
      fog.color.lerpColors(this.fogColorSky, this.fogColorForest, t);
      fog.density = mapRange(t, 0, 1, 0.024, 0.038);
    } else if (this.progress < 0.88) {
      const t = mapRange(this.progress, 0.65, 0.88, 0, 1);
      fog.color.lerpColors(this.fogColorForest, this.fogColorMountain, t);
      fog.density = mapRange(t, 0, 1, 0.038, 0.022);
    } else {
      const t = mapRange(this.progress, 0.88, 1.0, 0, 1);
      fog.color.lerpColors(this.fogColorMountain, this.fogColorGround, t);
      fog.density = mapRange(t, 0, 1, 0.022, 0.035);
    }
  }

  private renderLoop() {
    if (this.isDestroyed) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();
    const now = performance.now();

    // Decay velocity continuously so stopping scroll rapidly brings velocity to zero
    this.velocity *= 0.88;

    // Dagger interaction is active ONLY when user is NOT actively scrolling
    // and blade is not impacted into ground (touch-aiming bypasses scroll delay)
    const isActivelyScrolling = (now - this.lastScrollTime) < 160;
    const targetWeight = (!this.isTouchAiming && isActivelyScrolling) || this.progress >= 0.97 || this.isReducedMotion ? 0.0 : 1.0;

    // Smoothly ease mouse interaction in/out (~100ms responsive interpolation)
    this.mouseWeight += (targetWeight - this.mouseWeight) * 0.12;

    // Project mouse cursor onto 3D world plane at Z = 0 for interactive particle repulsion
    this.mouseRaycaster.setFromCamera(new THREE.Vector2(this.mouse.x, this.mouse.y), this.camera);
    this.mouseRaycaster.ray.intersectPlane(this.planeZ0, this.pointerWorldPos);

    // 1. Update sub-systems with continuous progress, pointer repulsion and left-click aiming
    this.sword.update(
      this.progress, 
      time, 
      this.velocity, 
      this.mouse, 
      this.mouseWeight, 
      this.isLeftClicking
    );
    this.environment.update(this.progress, time);
    this.particles.update(
      this.progress, 
      delta, 
      this.velocity, 
      this.pointerWorldPos
    );
    this.lights.update(this.progress, time);

    // 2. Camera choreography
    this.updateCamera(time);

    // 3. Atmospheric fog
    this.updateFog();

    // 4. Render frame
    this.renderer.render(this.scene, this.camera);

    this.animFrameId = requestAnimationFrame(this.renderLoop);
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.touchHoldTimer) {
      clearTimeout(this.touchHoldTimer);
      this.touchHoldTimer = null;
    }
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mouseleave', this.onMouseUp);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('touchcancel', this.onTouchEnd);
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.removeEventListener('deviceorientation', this.onDeviceOrientation);
    }
    window.removeEventListener('scroll', this.onWindowScroll);
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    if (this.scene.environment) {
      this.scene.environment.dispose();
    }
    this.renderer.dispose();
  }
}
