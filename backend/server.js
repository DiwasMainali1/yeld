import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';
import multer from 'multer';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import { 
    getDashboard, 
    getProfile, 
    updateSessionStats, 
    updateProfile,
    getLeaderboard,
    updatePetData
} from './controllers/userController.js';
// Add these imports for the cleanup job
import Session from './models/sessionModel.js';
import User from './models/userModel.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enhanced CORS configuration to handle preflight requests properly
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create and serve uploads directory
try {
    mkdirSync(path.join(__dirname, 'uploads'));
} catch (err) {
    if (err.code !== 'EEXIST') throw err;
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get("/", (req, res) => {
    res.json({ status: "Server is running" });
});

// Routes
app.use('/auth', userRoutes);
app.use('/tasks', taskRoutes);
app.use('/sessions', sessionRoutes);

//Update profile photo
app.put('/profile/update', protect, updateProfile);

// Protected routes
app.get('/dashboard', protect, getDashboard);
app.get('/profile/:username', protect, getProfile);
app.post('/session/complete', protect, updateSessionStats);
app.get('/leaderboard', protect, getLeaderboard);
app.put('/profile/update-pet-data', protect, updatePetData);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                message: 'File is too large. Maximum size is 5MB' 
            });
        }
        return res.status(400).json({ 
            message: err.message 
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            message: err.message 
        });
    }

    res.status(500).json({ 
        message: 'Server error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle 404 errors for undefined routes
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Route not found' 
    });
});

const PORT = process.env.PORT || 5000;

// Session cleanup helper function - RENAMED to avoid conflict
const updateUserSessionStats = async (userId, session, sessionCompleted = false) => {
    try {
        if (!session.isActive || !session.startTime) {
            return;
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return;
        }
        
        const sessionId = session._id.toString();
        
        if (user.lastCompletedSession && 
            user.lastCompletedSession.sessionId === sessionId &&
            (Date.now() - user.lastCompletedSession.completedAt) < 5 * 60 * 1000) {
            return;
        }
        
        if (sessionCompleted) {
            const minutesStudied = Math.floor(session.duration / 60);
            user.sessionsCompleted += 1;
            user.totalTimeStudied += minutesStudied;
            
            user.lastCompletedSession = {
                sessionId: sessionId,
                completedAt: new Date()
            };
            
            await user.save();
            console.log(`Added ${minutesStudied} minutes for user ${userId}`);
        }
    } catch (error) {
        console.error('Error updating session stats:', error);
    }
};

// Session cleanup job
const cleanupExpiredSessions = async () => {
    try {
        const expiredSessions = await Session.find({
            isActive: true,
            expiresAt: { $lte: new Date() }
        });

        for (const session of expiredSessions) {
            const allParticipants = [session.creator, ...session.participants];
            
            for (const participantId of allParticipants) {
                await updateUserSessionStats(participantId, session, true);
            }
            
            await Session.deleteOne({ _id: session._id });
            console.log(`Cleaned up expired session ${session._id}`);
        }
    } catch (error) {
        console.error('Error in cleanup job:', error);
    }
};

// Connect to database and start server
app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Start the session cleanup job after server starts
    setInterval(cleanupExpiredSessions, 60000); // Run every 60 seconds
    console.log('Session cleanup job started');
});