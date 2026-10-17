import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset paths relative, so the build works on GitHub Pages
// under any repo name (the app uses HashRouter, so no server routing needed).
export default defineConfig({
  plugins: [react()],
  base: './',
});
