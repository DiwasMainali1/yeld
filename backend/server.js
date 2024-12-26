// server.js
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import { getDashboard } from './controllers/userController.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());  // Parse JSON bodies

// Auth routes
app.use('/auth', userRoutes);  // Now /auth/login and /auth/register

// Dashboard route
app.get('/dashboard', protect, getDashboard);

// Home route
app.get("/", (req, res) => {
    res.send("Server is ready")
});

app.listen(5000, () => {
    connectDB();
    console.log("Server started at http://localhost:5000");
});