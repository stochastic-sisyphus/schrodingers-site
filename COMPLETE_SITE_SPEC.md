# Complete Astro 6 Site Build

## Current State
Deployed: https://schrodingers-site.pages.dev/
- Canvas particles with gradient depth (KEEP THIS)
- "stochastic-sisyphus" text fade-in
- Steel-slate palette (#141a20 → #a6b6c2)

## What We're Building

A complete personal site with:
1. **Atmospheric shader homepage** (enhance existing)
2. **Blog system** with Substack cross-posting
3. **Research integration** (ORCID profile + papers)
4. **Project directory** with visuals and links
5. **Content aggregation** from GitHub, Substack, research papers

---

## Part 1: Shader Homepage Enhancement

### Keep Current
- Canvas particles with gradient
- "stochastic-sisyphus" identity text
- Steel-teal palette depth

### Add Shader Layer
**Goal**: Atmospheric gradient beneath particles using WebGL simplex noise

**Technical Approach**:
- Canvas-based WebGL context (like Stripe's MiniGl)
- Segmented geometry grid for vertex displacement
- Simplex noise shader for organic flow
- Fragment shader mixing steel-teal colors by depth
- 60fps animation loop with time uniforms

**Shader Color Palette** (normalized RGB floats for interpolation):
```glsl
const vec3 deep = vec3(0.078, 0.102, 0.125);      // #141a20
const vec3 base = vec3(0.165, 0.220, 0.267);      // #2a3844
const vec3 mid = vec3(0.267, 0.345, 0.408);       // #445868
const vec3 light = vec3(0.384, 0.471, 0.533);     // #627888
const vec3 accent = vec3(0.518, 0.596, 0.651);    // #8498a6
const vec3 highlight = vec3(0.651, 0.714, 0.761); // #a6b6c2
```

**Integration**:
- Shader canvas layer (z-index: 0)
- Existing particle canvas above (z-index: 1)
- Both use locked palette
- Smooth blend between layers

**Files to Create**:
```
src/components/ShaderGradient.astro
src/lib/shaders/simplex.ts
src/lib/shaders/gradient-shader.ts
```

**Reference Pattern** (Stripe MiniGl approach):
- Orthographic camera setup
- Attribute binding for position/color
- Uniform updates in animation loop
- Proper cleanup on unmount

---

## Part 2: Blog Infrastructure

### Option A: Substack Cross-Posting Support
**If user wants to keep Substack as primary**:
- Astro pages pull from Substack RSS/API
- Display posts with metadata
- Link back to Substack originals
- Optional: Import full content for archive

### Option B: Standalone Site Blog
**If user wants site-native blog**:
- Markdown/MDX posts in `src/content/blog/`
- Astro Content Collections for type-safe posts
- RSS feed generation
- Optional: Manual sync to Substack

### Blog Data Model
```typescript
interface BlogPost {
  title: string;
  slug: string;
  date: Date;
  excerpt: string;
  content: string;
  tags: string[];
  substackUrl?: string; // If cross-posting
}
```

### Blog Routes
```
/blog              - Post list
/blog/[slug]       - Individual post
/blog/rss.xml      - RSS feed
```

### Files to Create
```
src/pages/blog/index.astro
src/pages/blog/[slug].astro
src/pages/blog/rss.xml.ts
src/content/config.ts        (Content Collections schema)
src/content/blog/            (Markdown posts)
src/lib/substack.ts          (If cross-posting)
```

**Substack Integration Options**:
1. RSS parsing (simple, read-only)
2. Substack API (if available, more control)
3. Manual markdown export + commit workflow

---

## Part 3: Research Integration (ORCID)

### ORCID Profile Display
**User's ORCID**: https://orcid.org/0009-0008-6611-535X

**Data to Display**:
- Published research papers
- Citations and metadata
- Co-authors and affiliations
- Research areas/topics

**Integration Approach**:
```typescript
interface ResearchPaper {
  title: string;
  authors: string[];
  year: number;
  journal: string;
  doi?: string;
  url: string;
  citations?: number;
  abstract?: string;
}
```

**ORCID API Integration**:
- Fetch public profile data
- Cache locally or build-time generation
- Display as visual cards or list
- Link to DOIs and full papers

### Research Routes
```
/research              - Research overview + papers
/research/[paper-id]   - Individual paper detail
```

### Files to Create
```
src/pages/research/index.astro
src/pages/research/[id].astro
src/lib/orcid.ts              (API integration)
src/types/research.ts         (TypeScript types)
```

**Visual Representation**:
- Timeline of publications
- Citation network visualization (D3.js)
- Research topic clusters
- Co-author connections

---

## Part 4: Project Directory

### Project Data Sources
1. **GitHub Repositories** (27 repos):
   - Code Cartographer
   - synsearch
   - prophetic-emergentomics
   - Masters Capstone (Bosch Metadata LLM)
   - Chicago Population Forecast
   - Advanced Data Processing Pipeline
   - Feature Selection Remix
   - And 20+ more

2. **Project Metadata**:
   ```typescript
   interface Project {
     name: string;
     slug: string;
     description: string;
     tags: string[];
     githubUrl: string;
     readme: string;
     codeStructure: CodeGraph;  // Living visualization data
     activityData: ActivityTimeline;
     demoUrl?: string;
     featured: boolean;
   }
   ```

### Project Display
- **Living embedded visualizations** of code structure
- Interactive network graphs of dependencies
- Activity timelines showing commit patterns
- Filter by technology/domain
- Search functionality
- Extract and visualize README content

### GitHub Integration
```typescript
// src/lib/github.ts
async function fetchRepos(username: string): Promise<Repo[]>
async function fetchReadme(owner: string, repo: string): Promise<string>
async function fetchRepoMeta(owner: string, repo: string): Promise<RepoMeta>
async function fetchCodeStructure(owner: string, repo: string): Promise<CodeGraph>
async function fetchActivityTimeline(owner: string, repo: string): Promise<Activity[]>
```

**Build-time data fetching**:
- Use Astro's static generation
- Cache GitHub API responses
- Extract repo metadata, READMEs, topics
- **Parse code structure for visualization**: dependency graphs, module connections, file hierarchies
- **Generate activity data**: commit patterns, contributor networks, evolution timelines

### Project Routes
```
/projects              - Grid/list of all projects
/projects/[slug]       - Individual project detail page
/projects/tag/[tag]    - Filter by technology tag
```

### Files to Create
```
src/pages/projects/index.astro
src/pages/projects/[slug].astro
src/pages/projects/tag/[tag].astro
src/lib/github.ts
src/types/project.ts
src/content/projects/   (Manual overrides/additions)
```

**Visual Embedding**:
- **Living code structure visualizations**: dependency networks, module graphs
- **Activity visualizations**: commit timelines, contributor networks, evolution patterns
- Hover effects revealing connections and relationships
- Interactive exploration of code architecture
- Links to live demos + GitHub
- D3.js/Observable Plot for data-driven visual forms

---

## Part 5: Content Aggregation System

### Content Sources
1. **GitHub**: 27 repositories with code/structure
2. **Substack**: Written posts and themes
3. **Research**: ORCID papers and citations
4. **Projects**: Curated work with visuals

### Unified Content Model
```typescript
type ContentType = 'blog' | 'research' | 'project' | 'github';

interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  date: Date;
  tags: string[];
  url: string;
  excerpt: string;
  featured?: boolean;
}
```

### Homepage Content Zones
After shader + particles, show:
- **Featured projects** (3-4 visual cards)
- **Recent blog posts** (latest 3)
- **Research highlights** (key papers)
- **GitHub activity** (recent repos)

### Navigation Structure
```
/                  - Atmospheric homepage + content zones
/blog              - All blog posts
/research          - Research papers + ORCID
/projects          - Project directory
/about             - Bio, links, contact
```

### Files to Create
```
src/lib/content-aggregator.ts  (Unified content fetching)
src/components/ContentZone.astro
src/components/ProjectCard.astro
src/components/BlogCard.astro
src/components/ResearchCard.astro
```

---

## Technical Stack Summary

**Framework**: Astro 6 (beta)
- Faster HMR for shader iteration
- Enhanced Svelte 5 integration
- Content Collections v3

**Rendering**:
- WebGL shader background (canvas)
- Canvas particles layer
- Svelte islands for interactions

**Data Sources**:
- GitHub API (repos, READMEs)
- ORCID API (research papers)
- Substack RSS/API (blog posts)
- Manual content in `src/content/`

**Styling**:
- CSS custom properties (locked palette)
- Scoped component styles
- No CSS frameworks

**Deploy**:
- Cloudflare Pages
- Build-time data fetching
- Static generation where possible

---

## Implementation Priority

### Phase 1: Foundation
1. Shader layer beneath existing particles
2. Basic routing structure (`/blog`, `/research`, `/projects`)
3. Content Collections setup

### Phase 2: Data Integration
1. GitHub API integration (fetch repos)
2. ORCID API integration (fetch papers)
3. Substack RSS parsing (fetch posts)

### Phase 3: Content Pages
1. Blog post display (`/blog`, `/blog/[slug]`)
2. Research paper display (`/research`, `/research/[id]`)
3. Project directory (`/projects`, `/projects/[slug]`)

### Phase 4: Homepage Polish
1. Content zones on homepage
2. Featured content selection
3. Visual polish and transitions

---

## File Structure (Complete)

```
/
├── src/
│   ├── pages/
│   │   ├── index.astro              (Homepage: shader + particles + zones)
│   │   ├── blog/
│   │   │   ├── index.astro          (Blog list)
│   │   │   ├── [slug].astro         (Individual post)
│   │   │   └── rss.xml.ts           (RSS feed)
│   │   ├── research/
│   │   │   ├── index.astro          (Research overview)
│   │   │   └── [id].astro           (Paper detail)
│   │   ├── projects/
│   │   │   ├── index.astro          (Project grid)
│   │   │   ├── [slug].astro         (Project detail)
│   │   │   └── tag/[tag].astro      (Tag filter)
│   │   └── about.astro              (Bio, links, ORCID)
│   │
│   ├── components/
│   │   ├── Atmosphere.astro         (Current particles - KEEP)
│   │   ├── ShaderGradient.astro     (NEW: WebGL shader layer)
│   │   ├── ContentZone.astro        (Homepage content sections)
│   │   ├── ProjectCard.astro        (Project visual cards)
│   │   ├── BlogCard.astro           (Blog post cards)
│   │   └── ResearchCard.astro       (Research paper cards)
│   │
│   ├── content/
│   │   ├── config.ts                (Content Collections schema)
│   │   ├── blog/                    (Markdown blog posts)
│   │   └── projects/                (Manual project overrides)
│   │
│   ├── lib/
│   │   ├── particles.ts             (Current particle system - KEEP)
│   │   ├── shaders/
│   │   │   ├── simplex.ts           (Simplex noise implementation)
│   │   │   └── gradient-shader.ts   (WebGL shader program)
│   │   ├── github.ts                (GitHub API client)
│   │   ├── orcid.ts                 (ORCID API client)
│   │   ├── substack.ts              (Substack RSS/API)
│   │   └── content-aggregator.ts    (Unified content fetching)
│   │
│   ├── types/
│   │   ├── project.ts               (Project types)
│   │   ├── research.ts              (Research paper types)
│   │   └── content.ts               (Unified content types)
│   │
│   └── styles/
│       └── global.css               (Locked palette + base styles)
│
├── public/
│   ├── fonts/                       (Cormorant, Inter, JetBrains)
│   └── data/                        (Cached visualization data)
│
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── wrangler.toml                    (Cloudflare Pages config)
```

---

## Data Fetching Strategy

### Build-Time (Static)
- GitHub repos list
- ORCID research papers
- Project metadata
- Blog posts (if from Substack RSS)

### Runtime (Dynamic)
- GitHub activity stats (optional)
- Citation counts (optional)

### Caching
```typescript
// src/lib/cache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Cache GitHub/ORCID responses to avoid rate limits
// Rebuild site periodically to refresh data
```

---

## Environment Variables

```env
# .env
GITHUB_TOKEN=ghp_...           # For higher API rate limits
ORCID_CLIENT_ID=...            # If using ORCID API
ORCID_CLIENT_SECRET=...
SUBSTACK_USERNAME=...          # For RSS fetching
```

---

## Next Steps for Implementation

1. **Preserve existing work**: Don't touch current particles/gradient
2. **Add shader layer**: WebGL gradient beneath particles
3. **Set up routing**: Create page structure for blog/research/projects
4. **Integrate data sources**: GitHub, ORCID, Substack APIs
5. **Build content pages**: Display fetched data
6. **Polish homepage**: Add content zones with featured work

---

## Key Design Principles (Reminder)

- **Steel-teal palette ONLY** (#141a20 → #a6b6c2)
- **Atmospheric depth** with shader + particles
- **Data as visual form** (not just text lists)
- **Explorable space** (not editorial layout)
- **Computational elegance** (not playful/corporate)
- **60fps smooth** animations
- **Frosted glass** materiality for content cards

---

## Questions to Resolve

1. **Blog Strategy**:
   - Option A: Cross-post from Substack (site pulls from RSS)?
   - Option B: Site-native blog (manual sync to Substack)?

2. **Project Visualizations**:
   - What code structure aspects to visualize? (dependencies, modules, file hierarchy, all of the above?)
   - Which activity patterns? (commit frequency, contributor networks, evolution over time?)
   - Interactive depth - how much user control vs guided exploration?

3. **Research Display**:
   - Fetch from ORCID API dynamically?
   - Or manual list with links?

4. **Content Priority**:
   - Which projects are "featured"?
   - Which papers should be highlighted?

---

## Success Criteria

- [ ] Shader gradient layer working beneath particles
- [ ] Blog section displaying posts (Substack or native)
- [ ] Research page showing ORCID papers
- [ ] Projects directory with visuals and GitHub links
- [ ] Homepage content zones showing featured work
- [ ] All using locked steel-teal palette
- [ ] 60fps smooth animations throughout
- [ ] Responsive on mobile/tablet
- [ ] Deployed to Cloudflare Pages

---

**This is the complete specification. Everything in one place.**
