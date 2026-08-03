// Vercel functions are compiled from this JavaScript entrypoint. Import the
// already-bundled Express application so Vercel does not try to emit the
// source TypeScript project (whose tsconfig intentionally has noEmit).
import app from '../dist/app.mjs';

export default app;
