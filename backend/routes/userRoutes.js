import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { googleAuth } from '../controllers/googleAuthController.js';

import { 
    getDashboard, 
    getProfile, 
    updateSessionStats, 
    updateProfile,
    updatePetData,  
    getLeaderboard
} from '../controllers/userController.js';

const router = express.Router();

router.post('/google', googleAuth);

// Protected routes
router.get('/dashboard', protect, getDashboard);
router.get('/profile/:username', protect, getProfile);
router.post('/session/complete', protect, updateSessionStats);
router.put('/profile/update', protect, updateProfile);
router.put('/profile/update-pet-data', protect, updatePetData);  

export default router;