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
        
        // Find user by username instead of ID
        const user = await User.findOne({ username: requestedUsername }).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Optional: Check if the requesting user is viewing their own profile
        const isOwnProfile = req.user._id.toString() === user._id.toString();

        // Calculate milestone progress
        const hoursStudied = user.totalTimeStudied / 60;
        let currentMilestone = 0;
        let progress = 0;
        let nextMilestone = 5;

        if (hoursStudied >= 50) {
            currentMilestone = 50;
            progress = 100;
            nextMilestone = null;
        } else if (hoursStudied >= 20) {
            currentMilestone = 20;
            progress = (hoursStudied - 20) * (100/30);
            nextMilestone = 50;
        } else if (hoursStudied >= 10) {
            currentMilestone = 10;
            progress = (hoursStudied - 10) * 10;
            nextMilestone = 20;
        } else if (hoursStudied >= 5) {
            currentMilestone = 5;
            progress = (hoursStudied - 5) * 20;
            nextMilestone = 10;
        } else {
            progress = (hoursStudied / 5) * 100;
            nextMilestone = 5;
        }

        res.json({
            username: user.username,
            sessionsCompleted: user.sessionsCompleted,
            totalTimeStudied: user.totalTimeStudied,
            currentMilestone,
            progress: Math.min(100, Math.max(0, progress)),
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