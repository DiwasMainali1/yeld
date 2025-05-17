import Task from '../models/taskModel.js';

// Maximum number of tasks per user
const MAX_TASKS = 10;

export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addTask = async (req, res) => {
    try {
        // Check if user has reached the task limit
        const taskCount = await Task.countDocuments({ user: req.user._id });
        if (taskCount >= MAX_TASKS) {
            return res.status(400).json({ 
                message: `You can only have a maximum of ${MAX_TASKS} tasks. Please delete some tasks first.`
            });
        }

        const { text } = req.body;
        const task = await Task.create({
            text,
            user: req.user._id
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ 
            _id: req.params.taskId,
            user: req.user._id 
        });
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleTask = async (req, res) => {
    try {
        const task = await Task.findOne({ 
            _id: req.params.taskId,
            user: req.user._id 
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.completed = !task.completed;
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const completeTask = async (req, res) => {
    try {
        const { text, completedAt } = req.body;
        const user = await User.findById(req.user._id);
        
        // Add the new task to the beginning of task history
        user.taskHistory.unshift({ 
            text, 
            completedAt: completedAt || new Date(),
            wasCompleted: true
        });
        
        // If we have more than 10 tasks in history, remove the oldest ones
        if (user.taskHistory.length > 10) {
            user.taskHistory = user.taskHistory.slice(0, 10);
        }
        
        await user.save();
        
        res.status(200).json({ message: 'Task history updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};