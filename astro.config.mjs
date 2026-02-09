import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  site: 'https://schrodingers-site.pages.dev',
  integrations: [
    svelte(),
  ],
  output: 'static',
  build: {
    assets: 'assets'
  },
});
