import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/authRoutes';
import repoRoutes from './routes/repoRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', mode: 'json-store (dev)' });
});

// ── Start immediately — no DB connection needed ───────────────
app.listen(PORT, () => {
  console.log(`\n🚀 RepoLens AI backend running on http://localhost:${PORT}`);
  console.log('💾 Using JSON file store (dev mode) — no MongoDB required\n');
});
