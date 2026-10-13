// Vercel serverless function entry point.
// Vercel auto-detects /api/*.js and forwards matching requests here.
// The Express app itself lives in ../app.js so it can be shared with local dev.
import app from "../app.js";

export default app;
