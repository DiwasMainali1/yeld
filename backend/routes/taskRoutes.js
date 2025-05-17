import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getTasks, addTask, deleteTask, toggleTask } from '../controllers/taskController.js';
import User from '../models/userModel.js';

const router = express.Router();

router.route('/')
    .get(protect, getTasks)
    .post(protect, addTask);

router.route('/:taskId')
    .delete(protect, deleteTask);

router.route('/:taskId/toggle')
    .put(protect, toggleTask);

// Add completed task to history
router.post('/history', protect, async (req, res) => {
    try {
        const { text, completedAt } = req.body;
        const user = await User.findById(req.user._id);
        
        // Add new task to the beginning of history array
        user.taskHistory.unshift({ 
            text, 
            completedAt: completedAt || new Date(),
            wasCompleted: true
        });
        
        // Maintain only the 10 most recent entries
        if (user.taskHistory.length > 10) {
            user.taskHistory = user.taskHistory.slice(0, 10);
        }
        
        await user.save();
        res.status(200).json({ message: 'Task history updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;