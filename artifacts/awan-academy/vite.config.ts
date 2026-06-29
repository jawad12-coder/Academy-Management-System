import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

// PORT is required in dev (Replit assigns it), optional during production build.
const rawPort = process.env.PORT;
const isBuild = process.env.NODE_ENV === 'production' || process.argv.includes('build');

let port = 3000;
if (rawPort) {
  const parsed = Number(rawPort);
  if (!Number.isNaN(parsed) && parsed > 0) port = parsed;
} else if (!isBuild) {
  throw new Error('PORT environment variable is required in development but was not provided.');
}

// BASE_PATH defaults to '/' for Vercel / non-Replit environments.
const basePath = process.env.BASE_PATH ?? '/';

/**
 * Replit sometimes stores multiple secrets concatenated into one env var value.
 * This function extracts the correct value for a given key.
 */
function resolveEnvVar(key: string): string {
  const raw = process.env[key] ?? '';
  if (!raw.includes('=')) return raw;

  const combinedPattern = /([A-Z][A-Z0-9_]+)=(\S+)/g;
  let match: RegExpExecArray | null;
  const parsed: Record<string, string> = {};
  while ((match = combinedPattern.exec(raw)) !== null) {
    const [, k, v] = match;
    if (k && v) parsed[k] = v;
  }

  return parsed[key] ?? raw;
}

export default defineConfig({
  base: basePath,
  define: {
    // Supabase — resolved with the concatenated-secret parser for Replit compatibility.
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(resolveEnvVar('SUPABASE_URL')),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(resolveEnvVar('SUPABASE_ANON_KEY')),
    // API server URL — empty string in dev (Vite proxy handles /api/*).
    // Set to your deployed API URL in production, e.g. https://awan-api.railway.app
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL ?? ''),
  },
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
    // Forward all /api/* calls to the Express API server (port 8080) in dev.
    // In production VITE_API_URL is set, so the client calls an absolute URL instead.
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: false },
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
