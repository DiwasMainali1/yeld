import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getTasks, addTask, deleteTask, toggleTask, completeTask } from '../controllers/taskController.js';
import User from '../models/userModel.js';

const router = express.Router();

router.route('/')
    .get(protect, getTasks)
    .post(protect, addTask);

router.route('/:taskId')
    .delete(protect, deleteTask);

router.route('/:taskId/toggle')
    .put(protect, toggleTask);

router.route('/complete')
    .post(protect, completeTask);

router.post('/history', protect, async (req, res) => {
    try {
        const { text, completedAt } = req.body;
        const user = await User.findById(req.user._id);
        user.taskHistory.push({ text, completedAt });
        await user.save();
        res.status(200).json({ message: 'Task history updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;