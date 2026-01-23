/**
 * WebGL Shader Program for Atmospheric Gradient
 * Creates organic flowing gradients using simplex noise and steel-teal palette
 */

import { simplexNoise3D } from './simplex';

// Simple passthrough vertex shader for fullscreen quad
const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// Fragment shader with simplex noise and steel-teal palette
const fragmentShaderSource = `
  precision highp float;

  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;

  ${simplexNoise3D}

  // Steel-teal palette (v5) - RGB values normalized to 0-1
  const vec3 deep = vec3(0.078, 0.102, 0.125);      // #141a20
  const vec3 base = vec3(0.165, 0.220, 0.267);      // #2a3844
  const vec3 mid = vec3(0.267, 0.345, 0.408);       // #445868
  const vec3 light = vec3(0.384, 0.471, 0.533);     // #627888
  const vec3 accent = vec3(0.518, 0.596, 0.651);    // #8498a6
  const vec3 highlight = vec3(0.651, 0.714, 0.761); // #a6b6c2

  // Smooth color interpolation across palette
  vec3 getPaletteColor(float t) {
    // Normalize t to 0-1 range
    t = clamp(t * 0.5 + 0.5, 0.0, 1.0);

    // 6-stop gradient interpolation
    if (t < 0.2) {
      return mix(deep, base, t / 0.2);
    } else if (t < 0.4) {
      return mix(base, mid, (t - 0.2) / 0.2);
    } else if (t < 0.6) {
      return mix(mid, light, (t - 0.4) / 0.2);
    } else if (t < 0.8) {
      return mix(light, accent, (t - 0.6) / 0.2);
    } else {
      return mix(accent, highlight, (t - 0.8) / 0.2);
    }
  }

  void main() {
    // Normalize coordinates to aspect ratio
    vec2 uv = v_uv;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;

    // Slow time drift for subtle animation
    float time = u_time * 0.00015; // Very slow evolution

    // Multi-octave noise for organic variation
    // Layer 1: Large scale movement
    float noise1 = snoise(vec3(uv * 1.2, time * 0.5));

    // Layer 2: Medium detail
    float noise2 = snoise(vec3(uv * 2.4 + 100.0, time * 0.3)) * 0.5;

    // Layer 3: Fine detail
    float noise3 = snoise(vec3(uv * 4.8 + 200.0, time * 0.7)) * 0.25;

    // Combine noise layers
    float combinedNoise = noise1 + noise2 + noise3;

    // Add radial gradient from center for atmospheric depth
    vec2 center = vec2(0.5 * aspect, 0.5);
    float radialDist = length(uv - center);
    float radialGradient = smoothstep(0.0, 1.5, radialDist);

    // Blend noise with radial gradient
    float finalValue = combinedNoise - radialGradient * 0.4;

    // Map to color palette
    vec3 color = getPaletteColor(finalValue);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export class ShaderManager {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private animationId: number | null = null;
  private startTime: number = 0;
  private resizeHandler: (() => void) | null = null;
  private beforeSwapHandler: (() => void) | null = null;
  private resizeTimeout: number | undefined;

  // Uniform locations
  private uniformLocations: {
    time: WebGLUniformLocation | null;
    resolution: WebGLUniformLocation | null;
  } = {
    time: null,
    resolution: null,
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      throw new Error('WebGL not supported');
    }

    this.gl = gl;
    this.init();
  }

  private compileShader(source: string, type: number): WebGLShader | null {
    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  private createProgram(): WebGLProgram | null {
    const vertexShader = this.compileShader(vertexShaderSource, this.gl.VERTEX_SHADER);
    const fragmentShader = this.compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return null;

    const program = this.gl.createProgram();
    if (!program) return null;

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program linking error:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }

    // Clean up shaders (they're now part of the program)
    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);

    return program;
  }

  private setupGeometry(): void {
    if (!this.program) return;

    // Create fullscreen quad (two triangles)
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
  }

  private init(): void {
    // Create shader program
    this.program = this.createProgram();
    if (!this.program) {
      throw new Error('Failed to create shader program');
    }

    this.gl.useProgram(this.program);

    // Get uniform locations
    this.uniformLocations.time = this.gl.getUniformLocation(this.program, 'u_time');
    this.uniformLocations.resolution = this.gl.getUniformLocation(this.program, 'u_resolution');

    // Setup geometry
    this.setupGeometry();

    // Set initial size
    this.resize(this.canvas.width, this.canvas.height);

    // Setup event listeners
    this.setupEventListeners();

    // Start animation
    this.startTime = performance.now();
    this.start();
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

    window.addEventListener('resize', this.resizeHandler);
    document.addEventListener('astro:before-swap', this.beforeSwapHandler);
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
    clearTimeout(this.resizeTimeout);
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);

    // Update resolution uniform
    if (this.uniformLocations.resolution) {
      this.gl.uniform2f(this.uniformLocations.resolution, width, height);
    }
  }

  private render = (currentTime: number): void => {
    if (!this.program) return;

    const elapsedTime = currentTime - this.startTime;

    // Update time uniform
    if (this.uniformLocations.time) {
      this.gl.uniform1f(this.uniformLocations.time, elapsedTime);
    }

    // Clear and draw
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    this.animationId = requestAnimationFrame(this.render);
  };

  start(): void {
    if (this.animationId !== null) return;
    this.startTime = performance.now();
    this.animationId = requestAnimationFrame(this.render);
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

    if (this.program) {
      this.gl.deleteProgram(this.program);
      this.program = null;
    }
  }
}
