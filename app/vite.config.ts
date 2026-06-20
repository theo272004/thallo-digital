import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deployed to GitHub Pages under /thallo-digital/app/ (coexists with the
// static site at the repo root). When this React app becomes the main site,
// change base to '/thallo-digital/'.
export default defineConfig({
  base: '/thallo-digital/app/',
  plugins: [react()],
});
