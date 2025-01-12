import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import { getDashboard, getProfile, updateSessionStats } from './controllers/userController.js';

dotenv.config();

const app = express();
app.use(cors());

// Middleware
app.use(express.json());  

// Auth routes
app.use('/auth', userRoutes); 

// Protected routes
app.get('/dashboard', protect, getDashboard);
app.get('/profile/:username', protect, getProfile);
app.post('/session/complete', protect, updateSessionStats);

// Home route
app.get("/", (req, res) => {
    res.send("Server is ready")
});

app.listen(5000, () => {
    connectDB();
    console.log("Server started at http://localhost:5000");
});