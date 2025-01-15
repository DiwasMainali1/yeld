import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import { 
    getDashboard, 
    getProfile, 
    updateSessionStats, 
    updateProfilePhoto,
    updateBio 
} from './controllers/userController.js';
import upload from './middleware/upload.js';
import multer from 'multer';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Middleware
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
import { mkdirSync } from 'fs';
try {
    mkdirSync(path.join(__dirname, 'uploads'));
} catch (err) {
    if (err.code !== 'EEXIST') throw err;
}

// Auth routes
app.use('/auth', userRoutes);

// Protected routes
app.get('/dashboard', protect, getDashboard);
app.get('/profile/:username', protect, getProfile);
app.post('/session/complete', protect, updateSessionStats);

// Profile update routes
app.post('/profile/photo', protect, upload.single('photo'), updateProfilePhoto);
app.put('/profile/bio', protect, updateBio);

// Home route
app.get("/", (req, res) => {
    res.send("Server is ready");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File is too large. Maximum size is 5MB' });
        }
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error occurred' });
});

app.listen(5000, () => {
    connectDB();
    console.log("Server started at http://localhost:5000");
});
