import express from 'express';
import { registerUser, loginUser, getDashboard, getProfile, updateSessionStats } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/dashboard', protect, getDashboard);
router.get('/profile', protect, getProfile);
router.post('/session/complete', protect, updateSessionStats);

export default router;