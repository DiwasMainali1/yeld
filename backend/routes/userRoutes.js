import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { registerUser, loginUser, getDashboard, getProfile, updateSessionStats, updateProfilePhoto, updateBio } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser); 
router.get('/dashboard', protect, getDashboard);
router.get('/profile/:username', protect, getProfile);
router.post('/session/complete', protect, updateSessionStats);
router.put('/bio', protect, updateBio);

export default router;