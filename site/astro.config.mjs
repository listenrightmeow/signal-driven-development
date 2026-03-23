import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://signal-driven-development.vercel.app',
  integrations: [preact(), sitemap()],
});
