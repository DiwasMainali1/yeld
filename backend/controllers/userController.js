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
            password,
            avatar: 'fox' // Default avatar
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

// UPDATED: Now includes background in profile response
const getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const currentUserId = req.user.id;
        
        const user = await User.findOne({ username }).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isOwnProfile = user._id.toString() === currentUserId;
        
        const response = {
            username: user.username,
            avatar: user.avatar,
            sessionsCompleted: user.sessionsCompleted,
            totalTimeStudied: user.totalTimeStudied,
            createdAt: user.createdAt,
            taskHistory: isOwnProfile ? user.taskHistory : [],
            isOwnProfile,
            petData: user.petData || { hasHatched: false, unlockedPets: ['novice'], activePet: null },
            // ADDED: Include background and timer settings for own profile
            background: isOwnProfile ? user.background : undefined,
            timerSettings: isOwnProfile ? user.timerSettings : undefined
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add this to track completed sessions
const updateSessionStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the user's custom pomodoro duration
        const pomodoroDuration = req.body.pomodoroDuration || user.timerSettings.pomodoro;
        
        // Convert seconds to minutes and add to totalTimeStudied
        const minutesCompleted = Math.floor(pomodoroDuration / 60);
        
        user.sessionsCompleted += 1;
        user.totalTimeStudied += minutesCompleted;
        await user.save();

        res.json({
            sessionsCompleted: user.sessionsCompleted,
            totalTimeStudied: user.totalTimeStudied
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// UPDATED: Enhanced profile update with better background handling
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { username, avatar, currentPassword, newPassword, timerSettings, background } = req.body;

        // Check if username is being changed
        if (username && username !== user.username) {
            // Check if user has exceeded username changes limit (now 1)
            if (user.usernameChanges >= 1) {
                return res.status(400).json({ 
                    message: 'Username can only be changed once'
                });
            }

            // Check if username is available
            const usernameExists = await User.findOne({ username });
            if (usernameExists) {
                return res.status(400).json({ 
                    message: 'Username is already taken'
                });
            }

            user.username = username;
            user.usernameChanges += 1;
        }

        // Update avatar if provided
        if (avatar && ['fox', 'owl', 'panda', 'penguin', 'koala'].includes(avatar)) {
            user.avatar = avatar;
        }

        // Update timer settings if provided
        if (timerSettings) {
            if (timerSettings.pomodoro) user.timerSettings.pomodoro = timerSettings.pomodoro;
            if (timerSettings.shortBreak) user.timerSettings.shortBreak = timerSettings.shortBreak;
            if (timerSettings.longBreak) user.timerSettings.longBreak = timerSettings.longBreak;
        }

        // ENHANCED: Better background handling with validation
        if (background !== undefined) {
            const validBackgrounds = [
                'default', 'cafe', 'fireplace', 'forest', 'galaxy', 
                'ghibli', 'midnight', 'ocean', 'spirited', 'sunset'
            ];
            
            if (validBackgrounds.includes(background)) {
                user.background = background;
            } else {
                return res.status(400).json({ 
                    message: 'Invalid background selection'
                });
            }
        }

        // Handle password change if provided
        if (currentPassword && newPassword) {
            const isMatch = await user.matchPassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ 
                    message: 'Current password is incorrect'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ 
                    message: 'New password must be at least 6 characters long'
                });
            }

            user.password = newPassword;
        }

        await user.save();

        // Send response without sensitive information
        res.json({
            username: user.username,
            avatar: user.avatar,
            usernameChanges: user.usernameChanges,
            timerSettings: user.timerSettings,
            background: user.background,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get leaderboard data
// @route   GET /leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
    try {
        // Get top 10 users sorted by total study time (descending)
        // Now including avatar information
        const topUsers = await User.find({})
            .select('username totalTimeStudied avatar')
            .sort({ totalTimeStudied: -1 })
            .limit(10);
        
        // Get total number of users for ranking context
        const totalUsers = await User.countDocuments();
        
        // Find current user's rank
        const currentUser = await User.findById(req.user._id);
        
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Get user rank (position in leaderboard)
        const usersAbove = await User.countDocuments({ 
            totalTimeStudied: { $gt: currentUser.totalTimeStudied } 
        });
        
        // Rank is users above + 1
        const currentUserRank = usersAbove + 1;
        
        res.json({
            leaderboard: topUsers,
            currentUser: {
                _id: currentUser._id,
                username: currentUser.username,
                totalTimeStudied: currentUser.totalTimeStudied,
                avatar: currentUser.avatar,
                rank: currentUserRank,
                totalUsers
            }
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updatePetData = async (req, res) => {
    try {
        const { petData } = req.body;
        const userId = req.user.id;

        const user = await User.findByIdAndUpdate(
            userId,
            { petData: petData },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Pet data updated successfully', petData: user.petData });
    } catch (error) {
        console.error('Error updating pet data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export { 
    registerUser, 
    loginUser, 
    getDashboard,
    getProfile, 
    updateSessionStats, 
    updateProfile,
    getLeaderboard,
    updatePetData
};