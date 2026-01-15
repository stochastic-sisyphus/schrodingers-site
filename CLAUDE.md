# stochastic-sisyphus homepage

## Vision

A computational atmosphere where identity and work exist as living data—revealed through color, depth, and elegant interaction. Not a portfolio, but an explorable system that feels like a polished instrument.

"A home for cool things" - not a hire-me page.

## Aesthetic Principles

### Visual Language
- **Atmospheric depth**: Layered gradients creating spatial immersion
- **Living motion**: Particles drift, breathe, flow - nothing static
- **Sophisticated 3D**: Literal depth is fine, childish/playful is not
- **Computational elegance**: Premium, refined, intentional
- **Frosted glass materiality**: Translucent surfaces with depth shadows

### Anti-Patterns (Never Do)
- Neon/electric colors (purple must be dusty, desaturated)
- Playful/bouncy animations
- Colorful charts as decoration
- Explicit nav menus or labeled buttons in the atmosphere
- Vaporwave pink or corporate grey-blue
- Flat, static content blocks
- Editorial/journalistic layouts (not The Pudding)

## Locked Palette (v5)

```css
--deep:      #141a20;   /* darkest - base background */
--base:      #2a3844;   
--mid:       #445868;   
--light:     #627888;   
--accent:    #8498a6;   
--highlight: #a6b6c2;   /* lightest - text, glows */
```

Direction: Cool steel + grey-teal. Not too blue (corporate), not too purple (vaporwave). Twilight slate character.

## Design Philosophy

- **Data → Elegant Visual Form → Interactive Revelation**
- Form reveals function
- Interaction shapes understanding
- Color/gradient encodes meaning
- Space conveys relationships
- Content as systems, not static descriptions

## Technical Stack

- **Framework**: Astro
- **Atmosphere**: Canvas API (Phase 1), Three.js (Phase 2+)
- **Components**: Svelte islands (when needed)
- **Styling**: CSS custom properties, scoped styles
- **Deploy**: Cloudflare Pages

## Typography

- **Identity/headings**: Sophisticated serif (Cormorant Garamond, EB Garamond)
- **Body**: Clean sans-serif (Inter)
- **Code**: JetBrains Mono

## Interaction Patterns (Future)

- Hover reveals context
- Drag explores space
- Scroll progresses through time/narrative
- 60fps minimum
- Purposeful motion, not decoration

## Project Phases

### Phase 1 (Current) - Entry Point
- Canvas particle atmosphere
- Gradient base
- Name fade-in
- Deploys to Cloudflare

### Phase 2 - Atmosphere Enhancement
- Three.js migration
- Bloom/glow effects
- Mouse interaction

### Phase 3 - Content
- Luminous zones (project categories)
- Frosted glass cards
- Scroll-triggered reveals

### Phase 4 - Polish
- Custom cursor
- Particle trails
- Performance optimization

## File Structure

```
/
├── src/
│   ├── pages/
│   │   └── index.astro
│   ├── components/
│   │   └── Atmosphere.astro
│   ├── styles/
│   │   └── global.css
│   └── lib/
│       └── particles.ts
├── public/
│   └── fonts/
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── wrangler.toml
```

## Key Decisions Log

- **Palette**: v5 steel-teal range, not too dark/black, not neon
- **Phase 1 approach**: Canvas particles (not Three.js) for faster ship
- **Identity**: "stochastic-sisyphus" - subtle, lower-third, serif
- **Deploy**: Cloudflare Pages
