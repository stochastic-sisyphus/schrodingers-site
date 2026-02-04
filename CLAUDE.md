# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**stochastic-sisyphus**: A computational portfolio where identity and work exist as living data—revealed through color, depth, and elegant interaction. Built with Astro, featuring atmospheric particle effects, D3 visualizations, and content aggregation from GitHub, ORCID, and Substack.

**Current Phase**: Phase 7 complete (all content zones, blog, research, projects fully functional and deployed)

## Essential Commands

### Development
```bash
npm run dev          # Start dev server (http://localhost:3000)
npm start            # Alias for dev
npm run build        # Production build
npm run build:check  # Type-check + build
npm run preview      # Preview production build locally
```

### Build & Deployment
- **Dev branch**: `git push origin development` → builds automatically
- **Production**: Merge `development` → `main` → auto-deploys to Cloudflare Pages
- **Deploy URL**: https://schrodingers-site.pages.dev

## Architecture

### Core Structure
```
src/
├── pages/          # Astro page routes (index, blog, projects, research, about)
├── components/     # Astro & Svelte components
│   ├── Atmosphere.astro              # Canvas particle system entry point
│   ├── ShaderGradient.astro          # WebGL gradient shader rendering
│   ├── ContentZone.astro             # Frosted glass content container
│   ├── BlogCard.astro, BlogList.astro, BlogPost.astro
│   ├── ProjectCard.svelte            # Interactive project cards
│   ├── ResearchCard.astro
│   └── visualizations/               # D3.js visualization components
│       ├── CitationNetwork.svelte
│       ├── PublicationTimeline.svelte
│       ├── VerificationCascade.svelte
│       ├── CodeGraph.svelte
│       ├── ContributorNetwork.svelte
│       ├── DependencyTree.svelte
│       └── ActivityTimeline.svelte
├── layouts/        # Base & content layout templates
├── content/        # Content collections (blog, projects, research)
│   ├── config.ts   # Zod schemas for frontmatter validation
│   ├── blog/       # Markdown blog posts
│   ├── projects/   # Project metadata files
│   └── research/   # Research paper metadata
├── lib/            # Core utilities & API integrations
│   ├── types.ts    # TypeScript interfaces for all data structures
│   ├── github.ts   # GitHub API client (repos, commits, contributors)
│   ├── orcid.ts    # ORCID API client (research profile & publications)
│   ├── substack.ts # Substack RSS parser
│   ├── content-aggregator.ts  # Main data orchestrator
│   ├── particles.ts           # Canvas particle system
│   ├── scroll-animations.ts   # Intersection observer animations
│   ├── shaders/      # WebGL shader code (Simplex noise, gradients)
│   └── visualizations/  # D3 data analysis utilities
└── styles/
    └── global.css    # CSS custom properties (locked palette v5)
```

### Data Flow

**Static Build (Build Time)**:
1. Astro pages call `getAggregatedContent()` from `content-aggregator.ts`
2. Aggregator fetches in parallel:
   - GitHub API → repos, commits, contributors
   - ORCID API → research profile, papers
   - Substack RSS → blog posts
3. Local `/src/content/` files override/supplement external data
4. Data passed to Svelte components & Astro templates
5. HTML + CSS + client-side JS bundled for Cloudflare Pages

**Client-Side (Runtime)**:
- Canvas particle system renders on page load
- D3 visualizations initialize when components mount
- Scroll animations trigger via Intersection Observer
- Svelte components handle hover/interactive states

### Content Collections (Astro Content API)

**Blog** (`src/content/blog/`):
- Frontmatter: `title`, `date`, `excerpt`, `tags`, `featured`, `draft`, `substackUrl`
- Markdown + frontmatter = full blog entry
- Can reference Substack posts via `substackUrl`

**Projects** (`src/content/projects/`):
- Frontmatter: `name`, `description`, `tags`, `githubUrl`, `featured`, `stars`, `language`, `homepage`, `demo`, `highlights`
- Typically references existing GitHub repos
- Can override/supplement GitHub API data

**Research** (`src/content/research/`):
- Frontmatter: `title`, `authors`, `year`, `journal`, `doi`, `orcidUrl`, `abstract`, `type`, `featured`
- References ORCID profile (default: `ORCID_ID=0009-0008-6611-535X`)
- Can create custom research entries

### Locked Design System

**Color Palette (v5)** — Stored in CSS custom properties:
```css
--deep: #141a20;           /* Base background */
--base: #2a3844;
--mid: #445868;
--light: #627888;
--accent: #8498a6;
--highlight: #a6b6c2;      /* Glows, accents */
--text-body: #d4dde4;      /* Body text legibility */
--text-heading: #e8f0f5;   /* Heading legibility */
```

**Rules** (enforced by `.cursor/rules/locked-palette.mdc`):
- NO neon colors, electric colors, vaporwave pink
- NO inline styles except D3 transforms and dynamic positioning
- Use CSS classes with custom properties instead
- Minimum 0.9 opacity for card backgrounds
- All text must be legible (use `--text-body` or `--text-heading`)

**Anti-Patterns** (NEVER do):
- Flat/static layouts
- Colorful charts as pure decoration
- Explicit nav menus in atmosphere
- Playful/bouncy animations
- Pure saturated colors

### Key External APIs

**GitHub** (`src/lib/github.ts`):
- Token: `GITHUB_TOKEN` (optional, increases rate limit 60→5000/hr)
- Fetches all public repos for username `GITHUB_USERNAME`
- Featured repos: hardcoded in `content-aggregator.ts` or set via `FEATURED_PROJECTS`

**ORCID** (`src/lib/orcid.ts`):
- Profile ID: `ORCID_ID=0009-0008-6611-535X`
- Fetches publications, biography, profile metadata
- No authentication needed (public API)

**Substack** (`src/lib/substack.ts`):
- RSS URL: `SUBSTACK_RSS_URL`
- Parses recent posts (date-ordered)

### Environment Variables

Defined in `.env` (copy from `.env.example`):
```
GITHUB_TOKEN=...              # Optional, increases API rate limit
GITHUB_USERNAME=...           # Required for repo fetching
SUBSTACK_RSS_URL=...          # Optional, for blog syndication
ORCID_ID=...                  # Required for research papers
FEATURED_PROJECTS=...         # Comma-separated repo names for featured order
```

## Common Development Tasks

### Add a Blog Post
1. Create `src/content/blog/my-post.md`
2. Add frontmatter: `title`, `date`, `excerpt`, `tags`, `draft: false`
3. Write markdown content
4. Run `npm run build` to validate schema

### Add a Research Paper
1. Create `src/content/research/paper-id.md`
2. Add frontmatter: `title`, `authors`, `year`, `journal`, `doi`, `featured: true`
3. Optional: reference ORCID ID or add custom abstract
4. Run `npm run build` to validate schema

### Add/Feature a Project
1. To feature a GitHub repo: add to `FEATURED_PROJECTS` in `.env` and `featuredOrder` array in `content-aggregator.ts`
2. To create custom project: add file to `src/content/projects/`
3. Repo data auto-fetches from GitHub API; frontmatter overrides fields

### Update Colors
1. Edit CSS custom properties in `src/styles/global.css` (currently v5 locked)
2. Respect locked palette—changes must stay within steel-teal range
3. Test legibility of text colors (body/headings must be bright)

### Create a Visualization Component
1. Create new Svelte component in `src/components/visualizations/`
2. Import D3 types from `@types/d3`
3. Use data analyzers from `src/lib/visualizations/` (activity-analyzer, code-analyzer)
4. Style with CSS classes using custom properties (no inline styles except transforms)
5. Mount D3 selection in `onMount()` hook

### Add a New Page
1. Create `.astro` file in `src/pages/`
2. Use `BaseLayout.astro` (plain) or `ContentLayout.astro` (with frosted glass card)
3. Call `getAggregatedContent()` to fetch external data if needed
4. Astro handles routing automatically (file path = URL route)

## Type Safety

**Key Interfaces** (in `src/lib/types.ts`):
- `GitHubRepo` — GitHub API response
- `RepoDetails` — Extended repo with readme, file structure, commits, contributors
- `ORCIDProfile`, `ORCIDWork` — ORCID API structures
- `BlogPost`, `ResearchPaper` — Content collection models
- `FeaturedProject` — Repo + metadata for featured display

Use these types when fetching/processing data. Content collections auto-validate against Zod schemas in `src/content/config.ts`.

## Performance Notes

- **Build time**: ~3s (GitHub + ORCID API calls are slow; consider caching for frequent rebuilds)
- **Canvas particles**: Optimized for 60fps; avoid adding new shader passes
- **D3 visualizations**: Render on-demand in Svelte components (not static HTML)
- **Static export**: Pages pre-rendered at build time; dynamic data loaded via JS

## Known Constraints

- GitHub API: 5,000 requests/hour with token (60/hour without)
- ORCID API: Public access, no rate limits published
- Substack RSS: Standard RSS parsing (no secrets needed)
- Cloudflare Pages: Static output only (no server-side rendering)

## Testing & Validation

```bash
npm run build:check  # Type-check + build (catches schema errors early)
npm run build        # Full build (includes data fetching)
npm run preview      # Test production build locally
```

Monitor `.astro/` directory after build for any schema validation warnings.

## Git Workflow

- **development**: Active development branch
- **main**: Production-ready, auto-deploys to Cloudflare Pages
- **Feature branches**: Branch from `development`, PR back to `development`
- Merge `development` → `main` to deploy

## Cursor/IDE Rules

Palette enforcement rules are defined in `.cursor/rules/locked-palette.mdc`. This ensures:
- No unauthorized color changes
- CSS-first styling (no inline styles)
- Text legibility standards
- Consistent frosted glass aesthetic
