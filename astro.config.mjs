import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  output: 'static',
  build: {
    assets: 'assets'
  },
  site: 'https://schrodingers-site.pages.dev',
});
