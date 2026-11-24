import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Set BASE_PATH when the site is served from a sub-path, e.g. "/let-it-be/" on GitHub Pages.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  server: { port: 5173, strictPort: true },
});
