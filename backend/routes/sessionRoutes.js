import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  createSession, 
  joinSession, 
  startSession, 
  leaveSession, 
  checkSession,
  getSessionStatus,
  completeSession 
} from '../controllers/sessionController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Create a new session
router.post('/create', createSession);

// Check if user is in a session
router.get('/check', checkSession);

// Join an existing session
router.post('/:id/join', joinSession);

// Start a session (creator only)
router.post('/:id/start', startSession);

// Leave a session
router.post('/:id/leave', leaveSession);

// Complete a session (when timer reaches zero)
router.post('/:id/complete', completeSession);

// Get session status
router.get('/:id/status', getSessionStatus);

export default router;