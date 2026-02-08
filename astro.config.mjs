import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [
    svelte(),
    sitemap(),
  ],
  output: 'static',
  build: {
    assets: 'assets'
  },
  site: 'https://schrodingers-site.pages.dev',
});
