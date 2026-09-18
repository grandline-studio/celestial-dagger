import * as THREE from 'three';

/**
 * Procedural texture generator for Damascus steel, runes, clouds, and impact decals.
 * Ensures zero asset load latency and instant crisp rendering.
 */

export function createDamascusPatternTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#949ba4';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw wood-grain-like wavy folded steel layers
  ctx.lineWidth = 2.5;
  const numBands = 70;
  for (let b = 0; b < numBands; b++) {
    const yStart = (b / numBands) * canvas.height;
    ctx.strokeStyle = b % 2 === 0 ? 'rgba(45, 48, 55, 0.45)' : 'rgba(235, 240, 248, 0.35)';
    ctx.beginPath();
    ctx.moveTo(0, yStart);
    for (let x = 0; x < canvas.width; x += 15) {
      const wave1 = Math.sin((x * 0.04) + b * 0.3) * 14;
      const wave2 = Math.cos((x * 0.08) - b * 0.15) * 6;
      ctx.lineTo(x, yStart + wave1 + wave2);
    }
    ctx.stroke();
  }

  // Micro surface noise
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 16;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 2);
  return texture;
}

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

export function createRuneEmissiveTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw ancient geometric rune inscriptions down the central fuller
  ctx.strokeStyle = '#4deeea';
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 12;
  ctx.lineWidth = 4;

  const runes = [
    '᚛', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛈ', 'ᛇ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ'
  ];

  ctx.font = 'bold 36px "Segoe UI Symbol", "Apple Symbols", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#a6ffff';

  const step = canvas.height / (runes.length + 2);
  for (let i = 0; i < runes.length; i++) {
    const y = step * (i + 1.5);
    ctx.fillText(runes[i], 64, y);
    // Draw interconnecting energy filament lines
    if (i < runes.length - 1) {
      ctx.beginPath();
      ctx.moveTo(64, y + 8);
      ctx.lineTo(64, y + step - 24);
      ctx.stroke();
    }
  }

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
