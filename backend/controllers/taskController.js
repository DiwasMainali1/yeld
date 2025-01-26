import Task from '../models/taskModel.js';

export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addTask = async (req, res) => {
    try {
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
        const { text, completedAt, wasCompleted } = req.body;
        const user = await User.findById(req.user._id);
        
        user.taskHistory.push({ text, completedAt, wasCompleted });
        await user.save();
        
        res.status(200).json({ message: 'Task history updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};