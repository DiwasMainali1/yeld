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
        const requestedUsername = req.params.username;
        const user = await User.findOne({ username: requestedUsername }).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isOwnProfile = req.user._id.toString() === user._id.toString();

        // Convert minutes to hours for milestone calculations
        const hoursStudied = user.totalTimeStudied / 60; // This gives us the exact hours (can be decimal)
        let currentMilestone = 0;
        let progress = 0;
        let nextMilestone = 5;

        // Update milestone thresholds (in hours)
        if (hoursStudied >= 50) {
            currentMilestone = 50;
            progress = 100;
            nextMilestone = null;
        } else if (hoursStudied >= 20) {
            currentMilestone = 20;
            progress = ((hoursStudied - 20) / (50 - 20)) * 100; // Progress between 20 and 50 hours
            nextMilestone = 50;
        } else if (hoursStudied >= 10) {
            currentMilestone = 10;
            progress = ((hoursStudied - 10) / (20 - 10)) * 100; // Progress between 10 and 20 hours
            nextMilestone = 20;
        } else if (hoursStudied >= 5) {
            currentMilestone = 5;
            progress = ((hoursStudied - 5) / (10 - 5)) * 100; // Progress between 5 and 10 hours
            nextMilestone = 10;
        } else {
            // Progress from 0 to 5 hours
            progress = (hoursStudied / 5) * 100; // This will now show the correct progress for early sessions
            nextMilestone = 5;
        }

        res.json({
            username: user.username,
            sessionsCompleted: user.sessionsCompleted,
            totalTimeStudied: user.totalTimeStudied, // This remains in minutes
            currentMilestone,
            progress: Math.min(100, Math.max(0, Math.round(progress * 100) / 100)), // Rounds to 2 decimal places
            nextMilestone,
            isOwnProfile
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