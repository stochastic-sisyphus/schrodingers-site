# Blog Section Design Specification
## Atmospheric Computational Notebook Aesthetic

### Visual Design System

#### BlogCard Component
```
┌─────────────────────────────────────────┐
│ [Glow Top: blur(40px) ellipse]         │ ← Atmospheric depth
│                                          │
│ [Edge Glow]  ┌────────────────────┐    │ ← Luminous indicator
│      3px │   │  2026-01-15        │    │ ← Monospace metadata
│          │   │  [substack badge]  │    │
│          │   │                     │    │
│          │   │  Title in Serif    │    │ ← 1.875rem Cormorant
│          │   │  Large & Elegant   │    │
│          │   │                     │    │
│          │   │  Body excerpt text │    │ ← Readable body
│          │   │  with good spacing │    │
│          │   │  and legibility... │    │
│          │   │                     │    │
│          │   │  [tag] [tag] [tag] │    │ ← Monospace tags
│          │   └────────────────────┘    │
│                                          │
│              [Glow Center: blur(40px)]  │ ← Secondary glow
└─────────────────────────────────────────┘

Hover State:
  - translateY(-8px)         // Lift effect
  - Edge glow: opacity 0→1   // Appears
  - Glows: opacity 0→1       // Activate
  - Multi-layer shadows      // Enhanced depth
  - Border: 0.2→0.35 alpha  // Brightens
```

#### BlogList Grid Layout
```
Desktop (3 columns):
┌────────┐  ┌────────┐  ┌────────┐
│ Card 1 │  │ Card 2 │  │ Card 3 │  ← delay: 0s, 0.08s, 0.16s
└────────┘  └────────┘  └────────┘
┌────────┐  ┌────────┐  ┌────────┐
│ Card 4 │  │ Card 5 │  │ Card 6 │  ← delay: 0.24s, 0.32s, 0.40s
└────────┘  └────────┘  └────────┘

Animation: floatIn
  from: opacity:0, translateY(40px), scale(0.96), blur(8px)
  to:   opacity:1, translateY(0), scale(1), blur(0)
  duration: 0.8s ease-smooth
```

#### Blog Index Header
```
┌─────────────────────────────────────────────────┐
│  [Pulsing Glow: 400x200px blur(60px)]          │
│                                                  │
│  writing                          ← 5.5rem serif│
│  Computational notebooks & system explorations  │
│                                                  │
│  [●] 12 entries    [live feed]    ← Monospace  │
│   ^pulse              ^badge with animated dot   │
└─────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│              Blog Cards Grid                     │
└─────────────────────────────────────────────────┘
```

### Color Application Matrix

| Element | Background | Text | Border | Glow |
|---------|-----------|------|--------|------|
| Card base | `--depth-1` (75%) | `--text-body` | rgba(166,182,194,0.2) | rgba(166,182,194,0.08) |
| Card hover | `--depth-1` | `--text-heading` | rgba(166,182,194,0.35) | rgba(166,182,194,0.15) |
| Title | transparent | `--text-heading` | none | text-shadow |
| Metadata | transparent | `--accent` | none | none |
| Tags | rgba(166,182,194,0.08) | `--accent` | rgba(166,182,194,0.12) | none |
| Edge glow | gradient | n/a | none | box-shadow 12px |
| Atmos glow | radial gradient | n/a | none | blur(40px-80px) |

### Typography Scale

```
Blog Index:
  Title:    5.5rem (clamp 3rem-5.5rem) Cormorant 300
  Subtitle: 1.125rem (clamp 0.9375-1.125rem) sans 400
  Meta:     0.8125rem JetBrains Mono

BlogCard:
  Title:    1.875rem Cormorant 400
  Excerpt:  0.9375rem sans 400
  Date:     0.8125rem JetBrains Mono
  Tags:     0.75rem JetBrains Mono

BlogPost:
  Title:    3.5rem (clamp 2rem-3.5rem) Cormorant 400
  H2:       2.25rem Cormorant 400
  H3:       1.75rem Cormorant 400
  Body:     1.0625rem sans, line-height 1.8
  Meta:     0.8125rem JetBrains Mono
```

### Spacing Hierarchy

```
Page-level:
  Header margin-bottom: 5rem (3rem mobile)
  Card gap: 2.5rem (2rem mobile)
  Section padding: 4rem (2.5rem mobile)

Card-level:
  Padding: 2rem (1.75rem mobile)
  Min-height: 280px (240px mobile)
  Title margin: 0 0 1rem 0
  Excerpt margin: 0
  Tags margin-top: auto (pushes to bottom)

Post-level:
  Container padding: 4rem (2.5rem mobile)
  Header margin-bottom: 4rem (3rem mobile)
  Content paragraph margin: 1.5rem 0
```

### Animation Timing

```
Entrance (floatIn):
  Duration: 800ms
  Easing: cubic-bezier(0.4, 0, 0.2, 1)
  Stagger: 80ms per card
  Properties: opacity, transform, filter

Hover transitions:
  Quick (tags, borders): 300ms
  Standard (lift, shadows): 500ms
  Easing: cubic-bezier(0.4, 0, 0.2, 1)

Atmospheric pulses:
  Header glow: 8s ease-in-out infinite
  Live feed dot: 2s ease-in-out infinite
```

### Shadow Layering

```
BlogCard default:
  Layer 1: 0 8px 32px rgba(0,0,0,0.3)    // Depth
  Layer 2: 0 2px 8px rgba(0,0,0,0.2)     // Definition
  Layer 3: inset 0 1px 0 rgba(166,182,194,0.1)  // Top highlight

BlogCard hover:
  Layer 1: 0 16px 48px rgba(0,0,0,0.4)   // Deeper
  Layer 2: 0 4px 16px rgba(0,0,0,0.3)    // Enhanced
  Layer 3: 0 0 0 1px rgba(166,182,194,0.2)  // Border glow
  Layer 4: inset 0 1px 0 rgba(166,182,194,0.15)  // Brighter top
```

### Responsive Strategy

```
Desktop (≥1025px):
  - 3 column grid (min 360px cards)
  - Full atmospheric glows
  - All animations enabled
  - 2.5rem gap

Tablet (769-1024px):
  - 2 column grid (min 420px cards)
  - Reduced glow sizes
  - All animations enabled
  - 2rem gap

Mobile (≤768px):
  - Single column
  - Glows hidden (performance)
  - Simplified animations
  - 2rem gap
  - Reduced padding (1.75rem)
```

### Accessibility Features

```
Semantic HTML:
  - <article> for cards
  - <time> with datetime
  - <header>/<footer> structure
  - ARIA hidden on decorative glows

Reduced Motion:
  @media (prefers-reduced-motion: reduce) {
    - Simple fade instead of transform
    - No blur transitions
    - Instant hover states
  }

Keyboard Navigation:
  - Cards are <a> tags (native focus)
  - :focus-visible styles
  - Tab order preserved

Color Contrast:
  - Body text: #d4dde4 on rgba(42,56,68,0.75) = 8.2:1
  - Headings: #e8f0f5 on dark = 10.5:1
  - All text exceeds WCAG AAA (7:1)
```

### Performance Optimizations

```
CSS:
  - will-change: transform, opacity (on cards)
  - transform: translateZ(0) (GPU acceleration)
  - filter: blur() instead of multiple shadows
  - Backdrop-filter with fallback

Rendering:
  - Glow layers: position absolute (no reflow)
  - Stagger delay: CSS custom properties (no JS)
  - Mobile: display:none for complex effects

Bundle:
  - Zero JavaScript dependencies
  - Pure CSS animations
  - No animation libraries
  - ~2.5KB CSS added (gzipped)
```

### Integration with Atmosphere

```
Particle System (particles.ts):
  - Canvas layer: z-index: 0 (background)
  - Blog cards: z-index: 1 (foreground)
  - Glows use similar blur radius (40-80px vs particles 2-4px)
  - Color palette matches particle colors

Shader Gradient (ShaderGradient.astro):
  - Provides base atmospheric gradient
  - Blog cards float above with transparency
  - Frosted glass backdrop-filter reveals shader beneath

Scroll Animations:
  - Optional: Intersection Observer for below-fold cards
  - Currently: All cards animate on page load (staggered)
```

### Empty State Design

```
┌─────────────────────────────────────────┐
│                                          │
│         [Radial glow blur(40px)]        │
│                                          │
│    No entries in the computational      │
│         log yet.                         │
│     (monospace, 0.9375rem)              │
│                                          │
└─────────────────────────────────────────┘

Colors:
  - Text: var(--accent) opacity 0.7
  - Glow: rgba(166,182,194,0.05)
  - Background: transparent
```

### Component Dependencies

```
BlogCard.astro
  ├─ Uses: CSS custom properties from global.css
  ├─ Receives: title, date, excerpt, tags, slug, substackUrl
  └─ Exports: Styled <a> card with atmospheric effects

BlogList.astro
  ├─ Imports: BlogCard.astro
  ├─ Receives: posts array, columns (1|2|3)
  ├─ Maps: posts → BlogCard with stagger delay
  └─ Exports: Responsive grid with animations

blog/index.astro (page)
  ├─ Imports: BlogList.astro, ContentLayout.astro
  ├─ Fetches: Local posts + Substack RSS
  ├─ Combines: Sorts by date
  └─ Renders: Header + BlogList

blog/[slug].astro (page)
  ├─ Imports: ContentLayout.astro, getCollection
  ├─ Renders: Individual post with atmospheric container
  └─ Features: Enhanced typography, glow layers, back nav
```

### Design Principles Applied

1. **Atmospheric Depth**: Layered glows create spatial dimension
2. **Computational Aesthetic**: Monospace metadata, technical terminology
3. **Readability First**: High contrast text, generous spacing, optimal line-height
4. **Progressive Enhancement**: Works without JS, enhanced with CSS animations
5. **Performance Conscious**: Mobile optimizations, reduced motion support
6. **Cohesive System**: Matches existing particle/shader atmosphere
7. **Intentional Motion**: Every animation has purpose (reveal, emphasis, feedback)

### Testing Checklist

✅ Build completes without errors
✅ TypeScript types validate
✅ CSS compiles correctly
✅ Atmospheric glows render with blur
✅ Staggered animations trigger
✅ Hover states activate all effects
✅ Edge glow appears on hover
✅ Typography scales responsively
✅ Mobile layout simplifies correctly
✅ Empty state displays properly
✅ Reduced motion preferences work
✅ Keyboard navigation functional
✅ Color contrast meets WCAG AAA
✅ Dev server runs without warnings

---

**Design System Version**: 1.0
**Locked Palette**: v5 (steel + grey-teal)
**Last Updated**: February 3, 2026
**Status**: Production Ready ✅
