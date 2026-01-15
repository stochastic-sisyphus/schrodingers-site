# schrodingers-site

Stochastic Sisyphus homepage

## 🚀 Project Structure

```
/
├── src/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   │   └── index.astro
│   └── styles/
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── wrangler.toml
```

## 🧞 Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |

## 🌐 Deployment

Configured for Cloudflare Pages deployment.

**Build command:** `npm run build`  
**Output directory:** `dist`

## 📦 Tech Stack

- Astro 5.x
- TypeScript
- Cloudflare Pages
