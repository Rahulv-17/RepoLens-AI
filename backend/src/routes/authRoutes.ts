import express from 'express';
import { register, login, googleAuth, updateProfile, deleteAccount, forgotPassword, resetPassword } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/profile', protect, updateProfile);
router.delete('/account', protect, deleteAccount);

export default router;
