import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getTasks, addTask, deleteTask, toggleTask } from '../controllers/taskController.js';

const router = express.Router();

router.route('/')
    .get(protect, getTasks)
    .post(protect, addTask);

router.route('/:taskId')
    .delete(protect, deleteTask);

router.route('/:taskId/toggle')
    .put(protect, toggleTask);

export default router;
