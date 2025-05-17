import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    registerUser, 
    loginUser, 
    getDashboard, 
    getProfile, 
    updateSessionStats, 
    updateProfile 
} from '../controllers/userController.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser); 

// Protected routes
router.get('/dashboard', protect, getDashboard);
router.get('/profile/:username', protect, getProfile);
router.post('/session/complete', protect, updateSessionStats);
router.put('/profile/update', protect, updateProfile);

export default router;