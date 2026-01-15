# schrodingers-site

stochastic-sisyphus homepage built with Astro and Cloudflare Pages.

## Features

- ⚛️ Canvas particle atmosphere with dynamic connections
- 🎨 CSS custom properties for theming
- 🚀 Optimized for Cloudflare Pages deployment
- 📱 Responsive design

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
/
├── public/           # Static assets
│   └── favicon.svg
├── src/
│   ├── components/   # Astro components
│   │   └── ParticleCanvas.astro
│   ├── layouts/      # Page layouts
│   │   └── Layout.astro
│   └── pages/        # Route pages
│       └── index.astro
├── astro.config.mjs  # Astro configuration
├── tsconfig.json     # TypeScript configuration
└── package.json
```

## Deployment

This project is configured for deployment on Cloudflare Pages. Simply connect your repository to Cloudflare Pages and it will automatically build and deploy.

Build command: `npm run build`
Output directory: `dist`

