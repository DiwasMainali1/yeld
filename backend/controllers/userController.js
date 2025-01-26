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

// @desc    Update user profile photo
// @route   PUT /profile/photo
// @access  Private
const updateProfilePhoto = async (req, res) => {
    try {
        const requestedUsername = req.params.username;
        
        // Find user by username
        const user = await User.findOne({ username: requestedUsername });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if it's the user's own profile
        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Create the photo URL - Make sure to include the full path
        const photoUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        
        // Log the file details for debugging
        console.log('File details:', {
            filename: req.file.filename,
            path: req.file.path,
            photoUrl: photoUrl
        });

        // Update user's profile photo
        user.profilePhoto = photoUrl;
        await user.save();

        res.json({
            profilePhoto: user.profilePhoto,
            message: 'Photo uploaded successfully'
        });
    } catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const profile = {
            username: user.username,
            profilePhoto: user.profilePhoto,
            bio: user.bio,
            sessionsCompleted: user.sessionsCompleted,
            totalTimeStudied: user.totalTimeStudied,
            taskHistory: user.taskHistory.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)),
            createdAt: user.createdAt,
            isOwnProfile: req.user._id.equals(user._id)
        };

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user bio
// @route   PUT /profile/bio
// @access  Private
const updateBio = async (req, res) => {
    try {
        const { bio } = req.body;
        
        if (!bio && bio !== '') {
            return res.status(400).json({ message: 'Bio content is required' });
        }

        if (bio.length > 500) {
            return res.status(400).json({ message: 'Bio cannot exceed 500 characters' });
        }

        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.bio = bio;
        await user.save();

        res.json({
            bio: user.bio
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



export { registerUser, loginUser, getDashboard,  getProfile, updateSessionStats, updateProfilePhoto, updateBio};