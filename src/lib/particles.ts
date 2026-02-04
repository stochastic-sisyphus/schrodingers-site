/**
 * Particle system for atmospheric canvas effect
 * Creates organic, slowly drifting particles with depth variation
 */

// Frame time constant for 60fps normalization
const FRAME_TIME_60FPS = 1000 / 60;

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

export interface ParticleSystemOptions {
  particleCount?: number;
  colors?: string[];
}

/**
 * Read particle colors from CSS custom properties
 * Weighted toward lighter values for visibility
 */
export function getColorsFromCSS(): string[] {
  const style = getComputedStyle(document.documentElement);
  const mid = style.getPropertyValue('--mid').trim() || '#445868';
  const light = style.getPropertyValue('--light').trim() || '#627888';
  const accent = style.getPropertyValue('--accent').trim() || '#8498a6';
  const highlight = style.getPropertyValue('--highlight').trim() || '#a6b6c2';

  // Weighted distribution: more lighter colors for visibility
  return [
    mid, mid,
    light, light, light,
    accent, accent, accent,
    highlight, highlight,
  ];
}

export function createParticle(
  canvasWidth: number,
  canvasHeight: number,
  colors: string[]
): Particle {
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
    color: colors[Math.floor(Math.random() * colors.length)],
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
  deltaTime: number,
  mouseX?: number,
  mouseY?: number,
  mouseDistance?: number
): void {
  // Normalize deltaTime to 60fps baseline
  const dt = deltaTime / FRAME_TIME_60FPS;

  // Update phase for sinusoidal movement
  particle.phase += particle.phaseSpeed * dt;

  // Calculate sinusoidal offset
  const wobbleOffsetX = Math.sin(particle.phase) * particle.wobbleX;
  const wobbleOffsetY = Math.cos(particle.phase * 0.7) * particle.wobbleY;

  // Apply velocity with wobble
  particle.x += (particle.vx + wobbleOffsetX) * dt;
  particle.y += (particle.vy + wobbleOffsetY) * dt;

  // Mouse repulsion - particles move away from cursor
  // Mouse interaction disabled - particles drift naturally without fleeing

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
  private colors: string[];
  private animationId: number | null = null;
  private lastTime: number = 0;
  private fadeInProgress: number = 0;
  private fadeInDuration: number = 2000; // 2 seconds to fade in particles

  // Mouse interaction properties
  private mouseX: number = 0;
  private mouseY: number = 0;
  private mouseDistance: number = 150; // Interaction radius

  // Store event handlers for cleanup
  private resizeHandler: (() => void) | null = null;
  private beforeSwapHandler: (() => void) | null = null;
  private mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  private resizeTimeout: number | undefined;

  constructor(canvas: HTMLCanvasElement, options: ParticleSystemOptions = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas 2d context');
    this.ctx = ctx;

    // Use provided colors or read from CSS custom properties
    this.colors = options.colors ?? getColorsFromCSS();
    const particleCount = options.particleCount ?? 600;

    this.initParticles(particleCount);
    this.setupEventListeners();
  }

  private initParticles(count: number): void {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(createParticle(this.canvas.width, this.canvas.height, this.colors));
    }
  }

  private setupEventListeners(): void {
    // Debounced resize handler
    this.resizeHandler = () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = window.setTimeout(() => {
        this.resize(window.innerWidth, window.innerHeight);
      }, 100);
    };

    // Cleanup handler for Astro page transitions
    this.beforeSwapHandler = () => {
      this.destroy();
    };

    // Track mouse position on document (not canvas - we need pointer-events: none on canvas)
    this.mouseMoveHandler = (e: MouseEvent) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    };

    window.addEventListener('resize', this.resizeHandler);
    document.addEventListener('astro:before-swap', this.beforeSwapHandler);
    document.addEventListener('mousemove', this.mouseMoveHandler);
  }

  private removeEventListeners(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.beforeSwapHandler) {
      document.removeEventListener('astro:before-swap', this.beforeSwapHandler);
      this.beforeSwapHandler = null;
    }
    if (this.mouseMoveHandler) {
      document.removeEventListener('mousemove', this.mouseMoveHandler);
      this.mouseMoveHandler = null;
    }
    clearTimeout(this.resizeTimeout);
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
      updateParticle(
        particle,
        this.canvas.width,
        this.canvas.height,
        deltaTime,
        this.mouseX,
        this.mouseY,
        this.mouseDistance
      );
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
    this.removeEventListeners();
    this.particles = [];
  }
}
