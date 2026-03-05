# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**stochastic-sisyphus**: A computational portfolio where identity and work exist as living data—revealed through color, depth, and elegant interaction. Built with Next.js 15, featuring shader backgrounds, Framer Motion animations, and content aggregation from GitHub, ORCID, and Substack.

**Current Architecture**: Portal navigation system - single "Explore" trigger opens full-screen artifact overlay with unified registry of all projects, research, and writing.

## Essential Commands

### Development
```bash
npm run dev    # Start dev server (http://localhost:3000)
npm run build  # Production build
npm run start  # Start production server
npm run lint   # Run ESLint
```

### Deployment
- **Framework**: Next.js 15 (App Router, client-side rendering)
- **Platform**: Cloudflare Pages (static export)
- **URL**: https://schrodingers.site (custom domain)
- **Cloudflare Pages URL**: https://schrodingers-site.pages.dev

## Architecture

### Core Structure
```
app/
├── page.tsx                          # Main homepage (client component with data fetching)
├── layout.tsx                        # Root layout with theme provider
├── globals.css                       # Global styles
└── research/
    └── verification-reversal/        # Research paper detail page

components/
├── header.tsx                        # Header with Explore portal trigger
├── portal-overlay.tsx                # Full-screen artifact browser (Radix Dialog + Framer Motion)
├── artifact-card.tsx                 # Individual artifact card in portal grid
├── shader-background.tsx             # WebGL shader background (@paper-design/shaders-react)
├── hero-content.tsx                  # Hero section content
├── figma-showcase.tsx                # Projects section (GitHub repos)
├── research-section.tsx              # Research papers section (ORCID + custom)
├── thoughts-section.tsx              # Blog posts section (Substack)
├── connect-section.tsx               # Footer/contact section
├── marquee.tsx                       # Scrolling text divider
└── ui/                               # Radix UI components (shadcn/ui)

lib/
├── types.ts                          # TypeScript interfaces for all data structures
├── github.ts                         # GitHub API client (repos, commits, contributors)
├── orcid.ts                          # ORCID API client (research profile & publications)
├── substack.ts                       # Substack RSS parser
├── content-aggregator.ts             # Data orchestrator (featured projects, key papers)
├── artifact-registry.ts              # Unified artifact normalization (NEW)
└── utils.ts                          # Utility functions (cn, etc.)

public/
├── verification-reversal.html        # P5.js visualization
└── data/                             # Static data cache (optional)
```

### Data Flow

**Client-Side Fetching** (`app/page.tsx`):
1. `useEffect` triggers parallel fetches on mount:
   - `fetchAllRepos()` → GitHub API
   - `fetchAllResearchData()` → ORCID API
   - `fetchAllSubstackPosts()` → Substack RSS
2. Data is processed:
   - Repos → `getFeaturedProjects()` → ordered by featured list
   - Papers → `getKeyPapers()` → featured research entries
   - Custom entries added (verification-reversal viz, prophetic-emergentomics, self graph)
3. **Unified artifact registry** built via `buildArtifactRegistry(repos, papers, posts)`
4. Data passed to components:
   - `Header` receives `artifacts` for portal
   - `FigmaShowcase` receives `repos`
   - `ResearchSection` receives `researchEntries`
   - `ThoughtsSection` receives `substackPosts`

**Portal System** (NEW):
- `Header` contains "Explore →" button that opens `PortalOverlay`
- `PortalOverlay` uses Radix Dialog for accessibility + Framer Motion for animations
- Artifacts displayed in filterable grid (All / Projects / Research / Writing)
- Each `ArtifactCard` can expand inline to show details + action links
- Scroll managed by Radix ScrollArea (independent of page scroll)

### Key External APIs

**GitHub** (`lib/github.ts`):
- Token: `GITHUB_TOKEN` (optional, increases rate limit 60→5000/hr)
- Fetches all public repos for `GITHUB_USERNAME`
- Featured repos: hardcoded in `content-aggregator.ts` or set via `FEATURED_PROJECTS`

**ORCID** (`lib/orcid.ts`):
- Profile ID: `ORCID_ID=0009-0008-6611-535X`
- Fetches publications, biography, profile metadata
- No authentication needed (public API)

**Substack** (`lib/substack.ts`):
- RSS URL: `SUBSTACK_RSS_URL`
- Parses recent posts (date-ordered)

### Environment Variables

Defined in `.env` (copy from `.env.example`):
```
GITHUB_TOKEN=...          # Optional, increases API rate limit
GITHUB_USERNAME=...       # Required for repo fetching
SUBSTACK_RSS_URL=...      # Optional, for blog syndication
ORCID_ID=...              # Required for research papers
FEATURED_PROJECTS=...     # Comma-separated repo names for featured order
```

## Common Development Tasks

### Add Content to Portal

The portal automatically includes:
- All GitHub repos (up to 10 most recent)
- All research papers from ORCID + custom entries
- Recent Substack posts (up to 6)

To feature specific projects, update `featuredOrder` array in `lib/content-aggregator.ts`.

### Modify Portal Appearance

**Portal Overlay** (`components/portal-overlay.tsx`):
- Radix Dialog for accessibility (Esc, backdrop click, focus trap)
- Framer Motion entrance: `initial={{ opacity: 0, y: 24, scale: 0.98 }}`
- Filter pills at top (All / Projects / Research / Writing)
- Grid layout: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

**Artifact Cards** (`components/artifact-card.tsx`):
- Terminal-style header with category badge
- Color-coded accent bar (language/type indicator)
- Hover tooltip shows metadata (language, authors, DOI)
- Click to expand inline detail panel with action links
- Uses `LANG_COLORS` from `lib/artifact-registry.ts`

### Update Navigation

The traditional nav menu has been replaced with a single "Explore →" trigger in `components/header.tsx`. To restore anchor links or add new navigation:

1. Edit `components/header.tsx`
2. The portal trigger is: `onClick={() => setPortalOpen(true)}`
3. Portal state managed via `useState<boolean>`

### Add a New Section

1. Create component in `components/`
2. Import and render in `app/page.tsx`
3. Add section ID for anchor linking (if needed)
4. Fetch data in `useEffect` if external API needed

## Type Safety

**Key Interfaces** (in `lib/types.ts`):
- `GitHubRepo` — GitHub API response
- `ResearchPaper` — Research paper metadata
- `SubstackPost` — Substack RSS post
- `FeaturedProject` — Repo + featured metadata

**New Types** (in `lib/artifact-registry.ts`):
- `Artifact` — Unified type for all content (projects, research, writing)
- `ArtifactCategory` — `'project' | 'research' | 'writing'`
- `LANG_COLORS` — Language/type color mapping

## Design System

**Color Palette** (in `app/globals.css`):
- Uses CSS custom properties
- Dark theme with subtle accents
- Terminal-inspired aesthetic
- Frosted glass effects on cards

**Animation Patterns**:
- Framer Motion for all animations
- Easing curve: `[0.16, 1, 0.3, 1]` (consistent throughout)
- Scroll-triggered animations via `useInView`
- Portal entrance: depth-shift effect (scale + y-translate)

**Component Patterns**:
- Terminal chrome headers (3 dots + metadata)
- Rounded-full pill buttons for tags/filters
- Italic titles using `instrument` font class
- Minimal hover states (opacity/color transitions)

## Dependencies

**Core**:
- `next@15.5.10` — Framework
- `react@19.2.0` — UI library
- `framer-motion@12.34.0` — Animations
- `@paper-design/shaders-react@0.0.71` — Shader background

**UI Components**:
- `@radix-ui/react-dialog@1.1.4` — Portal overlay
- `@radix-ui/react-scroll-area@1.2.2` — Portal scroll
- Full shadcn/ui component library

**Styling**:
- `tailwindcss@4.1.9` — Utility-first CSS
- `tailwindcss-animate@1.0.7` — Animation utilities
- `next-themes@0.4.6` — Theme management

## Known Constraints

- GitHub API: 5,000 requests/hour with token (60/hour without)
- ORCID API: Public access, no rate limits published
- Substack RSS: Standard RSS parsing (no secrets needed)
- Cloudflare Pages: Static output only (no server-side rendering)
- All data fetching happens client-side in `useEffect`

## Testing & Validation

```bash
npm run build  # Type-check + build (catches errors)
npm run lint   # ESLint checks
```

No linter errors should exist in:
- `lib/artifact-registry.ts`
- `components/portal-overlay.tsx`
- `components/artifact-card.tsx`
- `components/header.tsx`
- `app/page.tsx`

## Git Workflow

- **development**: Active development branch
- **main**: Production-ready, auto-deploys to Cloudflare Pages
- **Feature branches**: Branch from `development`, PR back to `development`
- Merge `development` → `main` to deploy

## Recent Changes

**Portal Navigation System** (Latest):
- Replaced traditional nav menu with single "Explore →" trigger
- Created unified artifact registry (`lib/artifact-registry.ts`)
- Built full-screen portal overlay with Radix Dialog + Framer Motion
- Implemented filterable artifact grid (All / Projects / Research / Writing)
- Added expandable artifact cards with inline detail panels
- All existing sections (projects, research, thoughts) remain unchanged
