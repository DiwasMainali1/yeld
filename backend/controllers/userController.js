// controllers/userController.js
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists by email
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if username is taken
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        
        // Check password match
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get dashboard data
// @route   GET /dashboard
// @access  Private
const getDashboard = async (req, res) => {
    try {
        // Find user without returning password
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            username: user.username,
            message: `Welcome ${user.username}`
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate milestone progress
        const hoursStudied = user.totalTimeStudied / 60;
        let currentMilestone = 5;
        let progress = 0;

        if (hoursStudied >= 100) {
            currentMilestone = 100;
            progress = 100;
        } else if (hoursStudied >= 50) {
            currentMilestone = 100;
            progress = (hoursStudied - 50) * 2; // Progress towards 100
        } else if (hoursStudied >= 20) {
            currentMilestone = 50;
            progress = (hoursStudied - 20) * (100/30); // Progress towards 50
        } else if (hoursStudied >= 10) {
            currentMilestone = 20;
            progress = (hoursStudied - 10) * 10; // Progress towards 20
        } else if (hoursStudied >= 5) {
            currentMilestone = 10;
            progress = (hoursStudied - 5) * 20; // Progress towards 10
        } else {
            currentMilestone = 5;
            progress = hoursStudied * 20; // Progress towards 5
        }

        res.json({
            username: user.username,
            sessionsCompleted: user.sessionsCompleted,
            totalTimeStudied: user.totalTimeStudied,
            currentMilestone,
            progress: Math.min(100, Math.max(0, progress)), // Ensure progress is between 0 and 100
            nextMilestone: currentMilestone === 100 ? null : 
                         currentMilestone === 50 ? 100 :
                         currentMilestone === 20 ? 50 :
                         currentMilestone === 10 ? 20 :
                         currentMilestone === 5 ? 10 : 5
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add this to track completed sessions
const updateSessionStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.sessionsCompleted += 1;
        user.totalTimeStudied += 25; // Add 25 minutes for each completed session
        await user.save();

        res.json({
            sessionsCompleted: user.sessionsCompleted,
            totalTimeStudied: user.totalTimeStudied
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



export { registerUser, loginUser, getDashboard,  getProfile, updateSessionStats  };