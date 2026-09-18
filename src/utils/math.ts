/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Smooth Hermite interpolation (0 at edge0, 1 at edge1)
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

/**
 * Maps a value from one range [inMin, inMax] to [outMin, outMax] with optional clamping
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  shouldClamp = true
): number {
  const normalized = (value - inMin) / (inMax - inMin);
  const result = outMin + normalized * (outMax - outMin);
  if (!shouldClamp) return result;
  return outMin < outMax 
    ? clamp(result, outMin, outMax) 
    : clamp(result, outMax, outMin);
}
