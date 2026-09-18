import * as THREE from 'three';

/**
 * Procedural texture generator for celestial clouds, crater decals, and circular particles.
 * Ensures zero asset load latency and instant crisp rendering.
 */

export function createCloudPuffTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  gradient.addColorStop(0.35, 'rgba(230, 238, 245, 0.55)');
  gradient.addColorStop(0.7, 'rgba(180, 195, 210, 0.18)');
  gradient.addColorStop(1, 'rgba(150, 165, 180, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createCraterDecalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 512);

  // Impact center scorched ring
  const centerGrad = ctx.createRadialGradient(256, 256, 5, 256, 256, 220);
  centerGrad.addColorStop(0, 'rgba(15, 12, 10, 0.95)');
  centerGrad.addColorStop(0.2, 'rgba(40, 30, 20, 0.7)');
  centerGrad.addColorStop(0.6, 'rgba(80, 50, 25, 0.3)');
  centerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.arc(256, 256, 220, 0, Math.PI * 2);
  ctx.fill();

  // Radial fractured crack lines
  ctx.strokeStyle = 'rgba(255, 140, 50, 0.85)';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 8;

  const numCracks = 16;
  for (let i = 0; i < numCracks; i++) {
    const angle = (i / numCracks) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
    let r = 10;
    ctx.beginPath();
    ctx.moveTo(256 + Math.cos(angle) * r, 256 + Math.sin(angle) * r);
    while (r < 240) {
      r += 20 + Math.random() * 25;
      const jitter = (Math.random() - 0.5) * 0.3;
      const curAngle = angle + jitter;
      ctx.lineTo(256 + Math.cos(curAngle) * r, 256 + Math.sin(curAngle) * r);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createCircularParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.85)');
  gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0.25)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
