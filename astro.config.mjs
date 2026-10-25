import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Site 100% static (SSG), servit de Cloudflare Pages din ./dist.
// Nu folosim adaptorul @astrojs/cloudflare: nu există rute SSR, iar adaptorul
// genera un _worker.js inutil și aducea dependențe vulnerabile (wrangler/miniflare).
export default defineConfig({
  site: 'https://gngpurecare.ro',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/multumim') && !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});