import express from 'express';
import { analyzeRepo, getRepos, getRepoById, chatWithRepo, deleteRepo, getChatHistory, clearChatHistory } from '../controllers/repoController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/analyze',     protect, analyzeRepo);
router.get('/',             protect, getRepos);
router.get('/:id',          protect, getRepoById);
router.get('/:id/chat',     protect, getChatHistory);
router.delete('/:id/chat',  protect, clearChatHistory);
router.post('/:id/chat',    protect, chatWithRepo);
router.delete('/:id',       protect, deleteRepo);

export default router;
