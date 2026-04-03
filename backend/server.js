import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './lib/db.js';
import playerRoutes from './routes/playerRoute.js';
import privacyBudgetRoutes from './routes/privacyBudgetRoute.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __backendDir = path.dirname(__filename);
const repoRoot = path.join(__backendDir, '..');
const frontendDist = path.join(repoRoot, 'frontend', 'dist');

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization'],

}));

app.use(express.json());

//API routes
app.use("/api/players", playerRoutes);
app.use("/api/privacy-budget", privacyBudgetRoutes);

const PORT = process.env.PORT || 8000;

// Serve Vite build when present. Render (and many hosts) do not set NODE_ENV=production by default,
// so we key off the dist folder instead of only NODE_ENV.
const indexHtml = path.join(frontendDist, 'index.html');
if (fs.existsSync(indexHtml)) {
    // fallthrough: let SPA handler run when no static file matches (client-side routes)
    app.use(express.static(frontendDist, { fallthrough: true }));
    app.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            return next();
        }
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.resolve(indexHtml));
    });
}


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});

export default app;
