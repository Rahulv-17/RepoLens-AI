import express from 'express';
import { analyzeRepo, getRepos, getRepoById, chatWithRepo, deleteRepo } from '../controllers/repoController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/analyze',     authMiddleware, analyzeRepo);
router.get('/',             authMiddleware, getRepos);
router.get('/:id',          authMiddleware, getRepoById);
router.post('/:id/chat',    authMiddleware, chatWithRepo);
router.delete('/:id',       authMiddleware, deleteRepo);

export default router;
