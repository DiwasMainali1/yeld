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
import { protect } from './middleware/authMiddleware.js';
import { 
    getDashboard, 
    getProfile, 
    updateSessionStats, 
    updateProfilePhoto,
    updateBio 
} from './controllers/userController.js';
import { upload, deletePreviousFile } from './middleware/upload.js';

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create and serve uploads directory
try {
    mkdirSync(path.join(__dirname, 'uploads'));
} catch (err) {
    if (err.code !== 'EEXIST') throw err;
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', userRoutes);
app.use('/tasks', taskRoutes);

// Protected routes
app.get('/dashboard', protect, getDashboard);
app.get('/profile/:username', protect, getProfile);
app.post('/session/complete', protect, updateSessionStats);
app.put('/profile/:username/photo', protect, deletePreviousFile, upload.single('photo'), updateProfilePhoto);
app.put('/profile/bio', protect, updateBio);

// Health check route
app.get("/", (req, res) => {
    res.json({ status: "Server is running" });
});

// Error handling
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on http://localhost:${PORT}`);
});