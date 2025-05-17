import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import { 
    getDashboard, 
    getProfile, 
    updateSessionStats, 
    updateProfile 
} from './controllers/userController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/", (req, res) => {
    res.json({ status: "Server is running" });
});

// Routes
app.use('/auth', userRoutes);
app.use('/tasks', taskRoutes);

// Protected routes
app.get('/dashboard', protect, getDashboard);
app.get('/profile/:username', protect, getProfile);
app.post('/session/complete', protect, updateSessionStats);

// Profile update route
app.put('/profile/update', protect, updateProfile);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            message: err.message 
        });
    }

    // Handle other errors
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

// Connect to database and start server
app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on http://localhost:${PORT}`);
});