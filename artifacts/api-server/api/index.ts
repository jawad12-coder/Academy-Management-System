/**
 * Vercel Serverless entry point.
 *
 * Vercel's @vercel/node runtime expects the default export to be an
 * Express app (or any Node.js http.RequestListener / IncomingMessage handler).
 * It must NOT call app.listen() — Vercel manages the port itself.
 */
import app from "../src/app.js";

export default app;
