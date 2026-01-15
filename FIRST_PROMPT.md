# First Prompt for Claude Code

Copy everything below the line into Claude Code:

---

Build Phase 1 of my homepage - a canvas-based atmospheric entry point.

## What to build

A single-page Astro site with:

1. **Full viewport canvas particle atmosphere**
   - 500-800 particles
   - Slow organic drift (sine-based or simplex noise)
   - Depth via size variation (smaller = further)
   - Depth via opacity variation (more transparent = further)
   - Particles use the palette colors, weighted toward lighter values for visibility

2. **Gradient base layer** (behind canvas)
   - Radial or multi-directional gradient
   - Uses --deep through --mid range
   - Creates sense of depth/atmosphere even without particles

3. **Identity text**
   - "stochastic-sisyphus"
   - Position: bottom 15%, left 8%
   - Font: serif (use system serif or Google Font - Cormorant Garamond)
   - Size: 16-18px, letter-spacing 0.05em
   - Color: var(--highlight) at 60% opacity
   - Fade in after 2 seconds (opacity 0 → 0.6 over 1s)

4. **No interactivity yet** - just the atmosphere and name

## Palette (CSS variables)

```css
:root {
  --deep:      #141a20;
  --base:      #2a3844;
  --mid:       #445868;
  --light:     #627888;
  --accent:    #8498a6;
  --highlight: #a6b6c2;
}
```

## Technical requirements

- Astro 4.x
- TypeScript for particle logic
- Canvas API (no Three.js)
- 60fps target
- Responsive (canvas resizes with viewport)
- Cloudflare Pages compatible

## File structure

```
src/
  pages/index.astro        # Main page, imports Atmosphere
  components/Atmosphere.astro  # Canvas + particle system
  styles/global.css        # CSS variables, reset, base styles
  lib/particles.ts         # Particle class and animation logic
astro.config.mjs
package.json
tsconfig.json
wrangler.toml              # Cloudflare Pages config
```

## Particle behavior spec

```typescript
interface Particle {
  x: number;
  y: number;
  z: number;        // 0-1 depth, affects size and opacity
  vx: number;       // velocity, very slow
  vy: number;
  size: number;     // 1-4px base, scaled by z
  opacity: number;  // 0.1-0.6, scaled by z
  color: string;    // from palette
}

// Movement: gentle drift, maybe slight sinusoidal wobble
// Wrap around edges
// No mouse interaction yet
```

## What success looks like

- Page loads with gradient visible immediately
- Particles fade in and drift slowly
- Feels atmospheric, calm, sophisticated
- "stochastic-sisyphus" appears after 2s, subtle but readable
- No jank, smooth 60fps
- Looks intentional, not like a demo/placeholder

## Deploy

Set up for Cloudflare Pages:
- Build command: `npm run build`
- Output directory: `dist`
- wrangler.toml configured

Don't deploy yet - just make it ready.

Read CLAUDE.md in the repo root for full project context and aesthetic guidelines.
