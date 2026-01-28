# Cursor Skills Created

Six specialized Cursor skills have been created in `~/.cursor/skills/` to enhance your development workflow for the schrodingers-site project.

## Skills Overview

### 1. shader-development
**Location**: `~/.cursor/skills/shader-development/SKILL.md`

Expert guidance for WebGL shader development, GLSL optimization, and visual effects.

**Triggers**: shaders, GLSL, WebGL, GPU programming, visual effects, gradients, particles

**Key Features**:
- GLSL best practices and performance optimization
- Shader structure templates (vertex/fragment)
- Common patterns (gradients, noise, animation)
- Three.js integration
- Steel-teal palette integration
- Debugging workflow
- 60fps performance targets

### 2. research-integration
**Location**: `~/.cursor/skills/research-integration/SKILL.md`

Integrate real academic research data from ORCID, DOI APIs, and scholarly databases without hallucination.

**Triggers**: research papers, publications, citations, ORCID, academic content, scholarly work

**Key Features**:
- ORCID Public API integration
- DOI resolution via CrossRef
- Semantic Scholar citation networks
- Data validation (no fabricated research)
- Caching strategies
- Visualization integration (CitationNetwork, PublicationTimeline)
- Graceful error handling

### 3. astro-optimization
**Location**: `~/.cursor/skills/astro-optimization/SKILL.md`

Optimize Astro sites for performance, build efficiency, and Cloudflare Pages deployment.

**Triggers**: Astro, SSG, build optimization, Cloudflare deployment, static site generation

**Key Features**:
- Content collections setup
- Image optimization
- Component islands strategy
- CSS and JavaScript bundling
- Cloudflare Pages configuration
- Dynamic content (API routes, RSS)
- Performance checklist (Lighthouse > 95)

### 4. visual-debugging
**Location**: `~/.cursor/skills/visual-debugging/SKILL.md`

Debug visual effects, canvas rendering, animations, and atmospheric effects systematically.

**Triggers**: visual bugs, canvas problems, animation glitches, rendering artifacts, rendering issues

**Key Features**:
- Canvas debugging (size, context, rendering)
- Animation debugging (FPS monitoring, frame timing)
- Particle system debugging
- Color and gradient verification
- WebGL debugging (shader compilation, context)
- Browser DevTools usage
- Systematic debugging process

### 5. performance-profiling
**Location**: `~/.cursor/skills/performance-profiling/SKILL.md`

Profile and optimize web performance for 60fps animations and fast load times.

**Triggers**: performance, optimization, speed, FPS issues, slowness, bundle size

**Key Features**:
- Performance budget targets (< 16.67ms frames, < 1.8s FCP)
- Chrome DevTools profiling
- JavaScript optimization (particle systems, canvas)
- Bundle size analysis
- Memory leak detection
- GPU performance optimization
- Real-time monitoring (Web Vitals)

### 6. api-integration
**Location**: `~/.cursor/skills/api-integration/SKILL.md`

Integrate external APIs (GitHub, ORCID, Substack, Semantic Scholar) with proper error handling, caching, and rate limiting.

**Triggers**: APIs, external data, authentication, data fetching, external services

**Key Features**:
- GitHub API (repos, commits, contributors)
- ORCID API (publications, profile)
- Substack RSS parsing
- Semantic Scholar (paper search, citations)
- Caching strategy (localStorage)
- Rate limiting implementation
- Error handling and retry logic
- Type safety with TypeScript

## How Skills Work

Skills are automatically detected by Cursor based on:
1. **Description keywords**: The agent matches your query against skill descriptions
2. **Context**: File types, project structure, and conversation history
3. **Explicit triggers**: Specific terms mentioned in the description

## Usage Examples

When you work on specific tasks, Cursor will automatically apply relevant skills:

- **"Fix the particle shader performance"** → Triggers: shader-development, performance-profiling, visual-debugging
- **"Integrate my ORCID publications"** → Triggers: research-integration, api-integration
- **"Optimize the Astro build for Cloudflare"** → Triggers: astro-optimization, performance-profiling
- **"Debug why particles aren't rendering"** → Triggers: visual-debugging, shader-development
- **"Fetch GitHub repos with caching"** → Triggers: api-integration

## Skill Quality Standards

All skills follow Cursor best practices:
- ✅ Concise (under 500 lines)
- ✅ Third-person descriptions
- ✅ Specific trigger terms
- ✅ Code examples and templates
- ✅ Checklists and workflows
- ✅ Anti-patterns documented
- ✅ Project-specific (steel-teal palette, 60fps target)

## Customization

To modify a skill:
1. Navigate to `~/.cursor/skills/[skill-name]/SKILL.md`
2. Edit the content
3. Cursor will automatically reload the skill

To add more skills, use the `/create-skill` command.

## Related Files in Project

These skills complement your existing project files:
- `CLAUDE.md` - Project vision and aesthetic principles
- `src/lib/particles.ts` - Particle system implementation
- `src/lib/shaders/` - Shader code
- `src/lib/github.ts`, `src/lib/orcid.ts` - API integrations
- `astro.config.mjs` - Astro configuration
- `wrangler.toml` - Cloudflare deployment

## Next Steps

1. Test the skills by asking Cursor to help with specific tasks
2. Refine skill descriptions if they're not triggering when expected
3. Add project-specific examples to skills as you develop patterns
4. Create additional skills for other specialized workflows

## Sources

Skills were created by analyzing:
- kivilaid/plugin-marketplace (87 structured plugins)
- danielrosehill/System-Prompt-Library (large prompt collection)
- mitsuhiko/agent-prompts (agentic loop prompts)
- Your project structure and CLAUDE.md specifications
- Cursor skill best practices guide

All skills are tailored specifically for your computational atmosphere website with WebGL/shaders, research integration, and sophisticated steel-teal aesthetic.
