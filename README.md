# Schrödinger's Site

Stochastic Sisyphus homepage - A quantum homepage experience with Canvas particle atmosphere.

## 🚀 Project Structure

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro
│   └── pages/
│       └── index.astro
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── wrangler.toml
```

## 🎨 Features

### Phase 1 (Implemented)
- **Canvas Particle Atmosphere**: 100 animated particles with random movement
- **Gradient Base**: Dark gradient background using locked palette v5
- **Name Fade-in**: Smooth fade-in animation for the site title
- **Particle Connections**: Dynamic lines connecting nearby particles
- **Locked Palette v5**: CSS custom properties for consistent theming
  - Primary Accent: `#00d4ff` (Cyan)
  - Secondary Accent: `#7c3aed` (Purple)
  - Tertiary Accent: `#ec4899` (Pink)
  - Dark Background: `#0a0e17` to `#1a1f2e`

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run pages:dev`       | Test Cloudflare Pages locally with Wrangler      |
| `npm run pages:deploy`    | Deploy to Cloudflare Pages                       |

## 🌐 Deployment

This site is configured for deployment to Cloudflare Pages using the `@astrojs/cloudflare` adapter.

### Deploy via Wrangler CLI

```bash
npm run build
npm run pages:deploy
```

### Deploy via Cloudflare Dashboard

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output directory: `dist`
4. Deploy!

## 🔮 Roadmap

### Phase 2 (Planned)
- Migrate to Three.js for 3D particle effects
- Add bloom/glow post-processing effects
- Implement mouse interaction with particles
- Advanced particle physics

## 📦 Tech Stack

- **Astro** 4.0 - Static Site Generator
- **TypeScript** - Type Safety
- **Canvas API** - 2D Graphics
- **Cloudflare Pages** - Deployment Platform
- **Wrangler** - Cloudflare CLI Tool
