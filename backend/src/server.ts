import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

import authRoutes from './routes/authRoutes';
import repoRoutes from './routes/repoRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', mode: 'production' });
});

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/repolens';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('📦 Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`\n🚀 RepoLens AI backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });
