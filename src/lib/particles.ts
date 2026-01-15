/**
 * Particle system for atmospheric canvas effect
 * Creates organic, slowly drifting particles with depth variation
 */

// Palette colors for particles - weighted toward lighter values for visibility
const PARTICLE_COLORS = [
  '#445868',   // --mid
  '#445868',   // --mid (duplicate for weighting)
  '#627888',   // --light
  '#627888',   // --light
  '#627888',   // --light
  '#8498a6',   // --accent
  '#8498a6',   // --accent
  '#8498a6',   // --accent
  '#a6b6c2',   // --highlight
  '#a6b6c2',   // --highlight
];

export interface Particle {
  x: number;
  y: number;
  z: number;           // 0-1 depth, affects size and opacity
  vx: number;          // velocity x
  vy: number;          // velocity y
  baseSize: number;    // 1-4px base size
  opacity: number;     // base opacity 0.1-0.6
  color: string;       // from palette
  phase: number;       // for sinusoidal movement
  phaseSpeed: number;  // individual phase speed
  wobbleX: number;     // wobble amplitude x
  wobbleY: number;     // wobble amplitude y
}

export function createParticle(canvasWidth: number, canvasHeight: number): Particle {
  const z = Math.random();  // depth 0 (far) to 1 (close)

  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    z,
    // Very slow base velocity - closer particles move slightly faster
    vx: (Math.random() - 0.5) * 0.15 * (0.5 + z * 0.5),
    vy: (Math.random() - 0.5) * 0.1 * (0.5 + z * 0.5),
    // Size: 1-4px base, scaled by depth
    baseSize: 1 + Math.random() * 3,
    // Opacity: 0.1-0.6 base, scaled by depth
    opacity: 0.1 + Math.random() * 0.5,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    // Phase for sinusoidal wobble
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: 0.005 + Math.random() * 0.01,
    wobbleX: 0.2 + Math.random() * 0.3,
    wobbleY: 0.15 + Math.random() * 0.25,
  };
}

export function updateParticle(
  particle: Particle,
  canvasWidth: number,
  canvasHeight: number,
  deltaTime: number
): void {
  // Normalize deltaTime to 60fps baseline
  const dt = deltaTime / 16.667;

  // Update phase for sinusoidal movement
  particle.phase += particle.phaseSpeed * dt;

  // Calculate sinusoidal offset
  const wobbleOffsetX = Math.sin(particle.phase) * particle.wobbleX;
  const wobbleOffsetY = Math.cos(particle.phase * 0.7) * particle.wobbleY;

  // Apply velocity with wobble
  particle.x += (particle.vx + wobbleOffsetX) * dt;
  particle.y += (particle.vy + wobbleOffsetY) * dt;

  // Wrap around edges with buffer
  const buffer = 20;
  if (particle.x < -buffer) particle.x = canvasWidth + buffer;
  if (particle.x > canvasWidth + buffer) particle.x = -buffer;
  if (particle.y < -buffer) particle.y = canvasHeight + buffer;
  if (particle.y > canvasHeight + buffer) particle.y = -buffer;
}

export function drawParticle(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  globalOpacity: number = 1
): void {
  // Scale size and opacity by depth (z)
  // z=0 is far (smaller, more transparent), z=1 is close (larger, more opaque)
  const depthScale = 0.3 + particle.z * 0.7;
  const size = particle.baseSize * depthScale;
  const opacity = particle.opacity * depthScale * globalOpacity;

  ctx.beginPath();
  ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
  ctx.fillStyle = particle.color;
  ctx.globalAlpha = opacity;
  ctx.fill();
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private lastTime: number = 0;
  private fadeInProgress: number = 0;
  private fadeInDuration: number = 2000; // 2 seconds to fade in particles

  constructor(canvas: HTMLCanvasElement, particleCount: number = 600) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas 2d context');
    this.ctx = ctx;

    this.initParticles(particleCount);
  }

  private initParticles(count: number): void {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(createParticle(this.canvas.width, this.canvas.height));
    }
  }

  resize(width: number, height: number): void {
    // Store old dimensions for scaling
    const oldWidth = this.canvas.width;
    const oldHeight = this.canvas.height;

    this.canvas.width = width;
    this.canvas.height = height;

    // Scale particle positions if canvas was already initialized
    if (oldWidth > 0 && oldHeight > 0) {
      const scaleX = width / oldWidth;
      const scaleY = height / oldHeight;

      for (const particle of this.particles) {
        particle.x *= scaleX;
        particle.y *= scaleY;
      }
    }
  }

  private update(deltaTime: number): void {
    for (const particle of this.particles) {
      updateParticle(particle, this.canvas.width, this.canvas.height, deltaTime);
    }
  }

  private draw(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate fade-in opacity
    const globalOpacity = Math.min(1, this.fadeInProgress / this.fadeInDuration);

    // Draw all particles
    for (const particle of this.particles) {
      drawParticle(this.ctx, particle, globalOpacity);
    }

    // Reset global alpha
    this.ctx.globalAlpha = 1;
  }

  private animate = (currentTime: number): void => {
    if (this.lastTime === 0) {
      this.lastTime = currentTime;
    }

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update fade-in progress
    this.fadeInProgress += deltaTime;

    this.update(deltaTime);
    this.draw();

    this.animationId = requestAnimationFrame(this.animate);
  };

  start(): void {
    if (this.animationId !== null) return;
    this.lastTime = 0;
    this.fadeInProgress = 0;
    this.animationId = requestAnimationFrame(this.animate);
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy(): void {
    this.stop();
    this.particles = [];
  }
}
