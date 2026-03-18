import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://bananalabs.gg',
  output: 'static',
  integrations: [react()],
});
